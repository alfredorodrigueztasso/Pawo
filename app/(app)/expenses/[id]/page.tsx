import { Card, Button, Field, Badge } from "@orion-ds/react/client";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ReviewPanel } from "./ReviewPanel";
import { formatCurrency } from "@/lib/currency";

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
          <p className="text-secondary mb-4">Expense not found</p>
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
    .from("space_members")
    .select("*")
    .eq("space_id", expense.space_id);

  const members = membersResult.data || [];
  const paidByMember = members.find((m) => m.user_id === expense.paid_by);
  const paidByName = paidByMember?.name || "Unknown";

  // Get space to get currency
  const spaceResult = await supabase
    .from("spaces")
    .select("currency")
    .eq("id", expense.space_id)
    .single();

  const currency = spaceResult.data?.currency || "CLP";

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
        <h1 className="text-4xl font-bold mb-2 text-primary">
          {expense.description || "Untitled Expense"}
        </h1>
        <p className="text-secondary">Expense details and review</p>
      </div>

      {/* Expense Details */}
      <Card className="p-8 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-secondary mb-1">Amount</p>
            <p className="text-3xl font-bold text-brand">
              {formatCurrency(expense.amount, currency)}
            </p>
          </div>
          <div>
            <p className="text-sm text-secondary mb-1">Paid by</p>
            <p className="text-xl font-semibold text-primary">{paidByName}</p>
          </div>
        </div>

        <div className="border-t border-border-subtle pt-6 space-y-4">
          <div>
            <p className="text-sm text-secondary mb-1">Date</p>
            <p className="text-lg text-primary">
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
              <p className="text-sm text-secondary mb-1">Description</p>
              <p className="text-lg text-primary">{expense.description}</p>
            </div>
          )}

          <div>
            <p className="text-sm text-secondary mb-1">Status</p>
            {review?.status === "pending" ? (
              <Badge variant="warning">Under review</Badge>
            ) : (
              <Badge variant="success">Confirmed</Badge>
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
          currency={currency}
        />
      )}

      {review && canRespond && (
        <Card className="p-8 bg-surface-subtle border-2 border-border-subtle">
          <h3 className="text-xl font-bold mb-4 text-primary">
            {paidByName} is asking about this expense
          </h3>
          <div className="space-y-4">
            <div className="bg-surface-layer rounded-lg p-4">
              <p className="text-sm text-secondary mb-2">Their question</p>
              <p className="text-lg text-primary">{review.question}</p>
            </div>

            {review.suggested_amount && (
              <div className="bg-surface-layer rounded-lg p-4">
                <p className="text-sm text-secondary mb-2">Suggested amount</p>
                <p className="text-xl font-semibold text-primary">
                  {formatCurrency(review.suggested_amount, currency)}
                </p>
              </div>
            )}

            {review.status === "resolved" && review.response && (
              <div className="bg-surface-layer rounded-lg p-4 border border-border-subtle">
                <p className="text-sm text-secondary mb-2">Your response</p>
                <p className="text-lg text-primary">{review.response}</p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
