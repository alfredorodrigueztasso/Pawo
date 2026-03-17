"use server";

import { createClient } from "@/lib/supabase/server";
import { createExpense, deleteExpense, updateExpense } from "@/lib/supabase/queries";
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
  const spaceId = formData.get("spaceId")?.toString();

  if (!amount || !paidBy || !cycleId || !spaceId) {
    throw new Error("Missing required fields");
  }

  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    throw new Error("Amount must be a positive number");
  }

  const expensePaidBy = paidBy === "me" ? user.id : paidBy;

  const result = await createExpense(supabase, {
    cycle_id: cycleId,
    space_id: spaceId,
    paid_by: expensePaidBy,
    amount: numAmount,
    description: description || undefined,
    date: new Date().toISOString().split("T")[0],
  });

  if (result.error) {
    throw new Error("Failed to create expense");
  }

  // Email notifications disabled for now - requires SUPABASE_SERVICE_ROLE_KEY
  // TODO: Implement via profiles table to avoid admin access requirement

  revalidatePath("/expenses");
  revalidatePath("/home");
  revalidatePath(`/spaces/${spaceId}`);
}

export async function updateExpenseAction({
  expenseId,
  spaceId,
  amount,
  description,
  paidBy,
}: {
  expenseId: string;
  spaceId: string;
  amount: number;
  description: string;
  paidBy: string;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  if (isNaN(amount) || amount <= 0) {
    throw new Error("Amount must be a positive number");
  }

  const result = await updateExpense(supabase, expenseId, {
    amount,
    description: description || undefined,
    paid_by: paidBy,
  });

  if (result.error) {
    throw new Error("Failed to update expense");
  }

  revalidatePath("/expenses");
  revalidatePath("/home");
  revalidatePath(`/spaces/${spaceId}`);
}

export async function deleteExpenseAction({
  expenseId,
  spaceId,
}: {
  expenseId: string;
  spaceId: string;
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
  revalidatePath(`/spaces/${spaceId}`);
}
