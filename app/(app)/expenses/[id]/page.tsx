import { Card, Button, Field } from "@orion-ds/react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ReviewPanel } from "./ReviewPanel";

export const metadata = {
  title: "Expense Details — Pawo",
};

export default async function ExpenseDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div className="p-8 text-center">Not authenticated</div>;
  }

  // Get expense with details
  const expenseResult = await supabase
    .from("expenses")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!expenseResult.data) {
    return (
      <div className="p-8">
        <Card className="p-8 text-center">
          <p className="text-gray-600 mb-4">Expense not found</p>
          <Link href="/expenses">
            <Button variant="primary">Back to Expenses</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const expense = expenseResult.data;

  // Get household members to show names
  const membersResult = await supabase
    .from("household_members")
    .select("*")
    .eq("household_id", expense.household_id);

  const members = membersResult.data || [];
  const paidByMember = members.find((m) => m.user_id === expense.paid_by);
  const paidByName = paidByMember?.name || "Unknown";

  // Get review if exists
  const reviewResult = await supabase
    .from("reviews")
    .select("*")
    .eq("expense_id", expense.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const review = reviewResult.data;
  const canRequestReview = expense.paid_by !== user.id;
  const canRespond = review && review.requested_by !== user.id;

  return (
    <div className="p-8 space-y-8">
      <Link href="/expenses">
        <Button variant="secondary" className="mb-4">
          ← Back to Expenses
        </Button>
      </Link>

      <div>
        <h1 className="text-4xl font-bold mb-2">
          {expense.description || "Untitled Expense"}
        </h1>
        <p className="text-gray-600">Expense details and review</p>
      </div>

      {/* Expense Details */}
      <Card className="p-8 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Amount</p>
            <p className="text-3xl font-bold text-blue-600">
              ${expense.amount.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Paid by</p>
            <p className="text-xl font-semibold">{paidByName}</p>
          </div>
        </div>

        <div className="border-t pt-6 space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Date</p>
            <p className="text-lg">
              {new Date(expense.date).toLocaleDateString("en-US", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>

          {expense.description && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Description</p>
              <p className="text-lg">{expense.description}</p>
            </div>
          )}

          <div>
            <p className="text-sm text-gray-600 mb-1">Status</p>
            {review?.status === "pending" ? (
              <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                Under review
              </span>
            ) : (
              <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Confirmed
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* Review Panel */}
      {canRequestReview && (
        <ReviewPanel
          expenseId={expense.id}
          paidByName={paidByName}
          currentReview={review}
          canRespond={canRespond}
          canRequestReview={canRequestReview}
          currentUserId={user.id}
        />
      )}

      {review && canRespond && (
        <Card className="p-8 bg-blue-50 border-2 border-blue-200">
          <h3 className="text-xl font-bold mb-4">
            {paidByName} is asking about this expense
          </h3>
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">Their question</p>
              <p className="text-lg">{review.question}</p>
            </div>

            {review.suggested_amount && (
              <div className="bg-white rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Suggested amount</p>
                <p className="text-xl font-semibold">
                  ${review.suggested_amount.toFixed(2)}
                </p>
              </div>
            )}

            {review.status === "resolved" && review.response && (
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <p className="text-sm text-gray-600 mb-2">Your response</p>
                <p className="text-lg">{review.response}</p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
