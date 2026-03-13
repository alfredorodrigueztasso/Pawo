"use server";

import { createClient } from "@/lib/supabase/server";
import { createExpense, deleteExpense } from "@/lib/supabase/queries";
import { sendExpenseNotificationEmail } from "@/lib/email";
import { revalidatePath } from "next/cache";

export async function addExpenseAction(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const amount = formData.get("amount")?.toString();
  const paidBy = formData.get("paidBy")?.toString();
  const description = formData.get("description")?.toString();
  const cycleId = formData.get("cycleId")?.toString();
  const householdId = formData.get("householdId")?.toString();

  if (!amount || !paidBy || !cycleId || !householdId) {
    throw new Error("Missing required fields");
  }

  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    throw new Error("Amount must be a positive number");
  }

  const expensePaidBy = paidBy === "me" ? user.id : paidBy;

  const result = await createExpense(supabase, {
    cycle_id: cycleId,
    household_id: householdId,
    paid_by: expensePaidBy,
    amount: numAmount,
    description: description || undefined,
    date: new Date().toISOString().split("T")[0],
  });

  if (result.error) {
    throw new Error("Failed to create expense");
  }

  // Send notification email to partner
  try {
    // Get household members to find the partner
    const { data: members } = await supabase
      .from("household_members")
      .select("*")
      .eq("household_id", householdId);

    const partner = members?.find((m) => m.user_id !== user.id);
    if (partner) {
      // Get partner's email
      const { data: partnerAuth } = await supabase.auth.admin.getUserById(
        partner.user_id
      );

      if (partnerAuth?.user?.email) {
        const senderName =
          user.user_metadata?.name || user.email?.split("@")[0] || "Your partner";

        // Get household name
        const { data: household } = await supabase
          .from("households")
          .select("name")
          .eq("id", householdId)
          .single();

        await sendExpenseNotificationEmail({
          recipientEmail: partnerAuth.user.email,
          recipientName: partner.name,
          senderName,
          amount: numAmount,
          description: description || "Untitled expense",
          householdName: household?.name || "Shared household",
        });
      }
    }
  } catch (err) {
    console.error("Failed to send expense notification email:", err);
    // Don't fail the expense creation if email fails
  }

  revalidatePath("/expenses");
  revalidatePath("/home");
}

export async function deleteExpenseAction({
  expenseId,
  householdId,
}: {
  expenseId: string;
  householdId: string;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const result = await deleteExpense(supabase, expenseId);

  if (result.error) {
    throw new Error("Failed to delete expense");
  }

  revalidatePath("/expenses");
  revalidatePath("/home");
}
