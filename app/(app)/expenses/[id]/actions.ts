"use server";

import { createClient } from "@/lib/supabase/server";
import {
  createReview,
  resolveReview,
  getReviewByExpenseId,
} from "@/lib/supabase/queries";
import { sendReviewRequestEmail, sendReviewResponseEmail } from "@/lib/email";
import { revalidatePath } from "next/cache";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function requestReviewAction({
  expenseId,
  question,
  suggestedAmount,
}: {
  expenseId: string;
  question: string;
  suggestedAmount?: number;
}) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Not authenticated" };
    }

    // Get expense details
    const { data: expense } = await supabase
      .from("expenses")
      .select("*")
      .eq("id", expenseId)
      .single();

    if (!expense) {
      return { error: "Expense not found" };
    }

    // Get payer (partner) details
    const { data: payer } = await supabase
      .from("space_members")
      .select("*")
      .eq("user_id", expense.paid_by)
      .single();

    if (!payer) {
      return { error: "Payer not found" };
    }

    // Get payer's email
    const { data: payerAuth } = await supabase.auth.admin.getUserById(
      expense.paid_by
    );

    const payerEmail = payerAuth?.user?.email;
    if (!payerEmail) {
      return { error: "Cannot send email - payer email not found" };
    }

    // Create the review
    const result = await createReview(supabase, {
      expense_id: expenseId,
      requested_by: user.id,
      question,
      suggested_amount: suggestedAmount,
    });

    if (result.error) {
      return { error: result.error.message };
    }

    // Send email to payer
    const requesterName = user.user_metadata?.name || user.email?.split("@")[0] || "Your partner";
    await sendReviewRequestEmail({
      recipientEmail: payerEmail,
      recipientName: payer.name,
      senderName: requesterName,
      amount: expense.amount,
      description: expense.description || "Untitled",
      question,
      suggestedAmount,
      expenseLink: `${APP_URL}/expenses/${expenseId}`,
    }).catch((err) => {
      console.error("Failed to send review request email:", err);
    });

    revalidatePath(`/expenses/${expenseId}`);
    return { success: true };
  } catch (error) {
    console.error("Error requesting review:", error);
    return { error: "Failed to request review" };
  }
}

export async function respondToReviewAction({
  reviewId,
  response,
}: {
  reviewId: string;
  response: string;
}) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Not authenticated" };
    }

    // Get review details
    const { data: review } = await supabase
      .from("reviews")
      .select("*")
      .eq("id", reviewId)
      .single();

    if (!review) {
      return { error: "Review not found" };
    }

    // Get expense details
    const { data: expense } = await supabase
      .from("expenses")
      .select("*")
      .eq("id", review.expense_id)
      .single();

    if (!expense) {
      return { error: "Expense not found" };
    }

    // Resolve the review
    const result = await resolveReview(supabase, reviewId, {
      response,
    });

    if (result.error) {
      return { error: result.error.message };
    }

    // Get requester details for email
    const { data: requester } = await supabase
      .from("space_members")
      .select("*")
      .eq("user_id", review.requested_by)
      .single();

    if (!requester) {
      return { error: "Requester not found" };
    }

    // Get requester's email
    const { data: requesterAuth } = await supabase.auth.admin.getUserById(
      review.requested_by
    );

    const requesterEmail = requesterAuth?.user?.email;
    if (requesterEmail) {
      // Send response email
      const responderName = user.user_metadata?.name || user.email?.split("@")[0] || "Your partner";
      await sendReviewResponseEmail({
        recipientEmail: requesterEmail,
        recipientName: requester.name,
        senderName: responderName,
        description: expense.description || "Untitled",
        response,
        expenseLink: `${APP_URL}/expenses/${review.expense_id}`,
      }).catch((err) => {
        console.error("Failed to send review response email:", err);
      });
    }

    revalidatePath(`/expenses/${review.expense_id}`);
    return { success: true };
  } catch (error) {
    console.error("Error responding to review:", error);
    return { error: "Failed to respond to review" };
  }
}
