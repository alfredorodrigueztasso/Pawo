import { Card, Button, Field } from "@orion-ds/react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ExpensesList } from "./ExpensesList";
import { addExpenseAction } from "../home/actions";
import type { SpaceMember } from "@/types";

export const metadata = {
  title: "Expenses — Pawo",
};

export default async function ExpensesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div className="p-8 text-center">Not authenticated</div>;
  }

  // Get active space
  const spaceResult = await supabase
    .from("space_members")
    .select("space_id")
    .eq("user_id", user.id)
    .single();

  if (!spaceResult.data) {
    return (
      <div className="p-8">
        <Card className="p-8 text-center">
          <p className="text-secondary">No space found</p>
        </Card>
      </div>
    );
  }

  const spaceId = spaceResult.data.space_id;

  // Get space and cycle
  const [spaceDetailsResult, cycleResult] = await Promise.all([
    supabase
      .from("spaces")
      .select("*, space_members(*)")
      .eq("id", spaceId)
      .single(),
    supabase
      .from("cycles")
      .select("*")
      .eq("space_id", spaceId)
      .eq("status", "open")
      .order("start_date", { ascending: false })
      .limit(1)
      .single(),
  ]);

  const space = spaceDetailsResult.data;
  const cycle = cycleResult.data;

  if (!cycle) {
    return (
      <div className="p-8">
        <Card className="p-8 text-center">
          <p className="text-secondary">No active cycle</p>
        </Card>
      </div>
    );
  }

  // Get expenses
  const expensesResult = await supabase
    .from("expenses")
    .select("*")
    .eq("cycle_id", cycle.id)
    .order("date", { ascending: false });

  const expenses = expensesResult.data || [];
  const members: SpaceMember[] = space?.space_members || [];

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold mb-2">Expenses</h1>
          <p className="text-secondary">Track all expenses for this cycle</p>
        </div>
      </div>

      {/* Add Expense Form */}
      <Card className="p-6 bg-surface-subtle">
        <h3 className="text-lg font-semibold mb-4">Add new expense</h3>
        <form action={addExpenseAction} className="space-y-3">
          <input type="hidden" name="spaceId" value={spaceId} />
          <input type="hidden" name="cycleId" value={cycle.id} />

          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Amount"
              type="number"
              name="amount"
              placeholder="0.00"
              step="0.01"
              required
            />
            <div>
              <label className="text-sm font-medium block mb-2">Who paid?</label>
              <select
                name="paidBy"
                defaultValue="me"
                className="w-full px-3 py-2 border border-border-subtle rounded-lg"
              >
                <option value="me">Me</option>
                {members.map((m) => (
                  <option key={m.id} value={m.user_id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <Field
            label="Description"
            name="description"
            placeholder="e.g., groceries"
            required
          />
          <Button variant="primary" type="submit" className="w-full">
            Add Expense
          </Button>
        </form>
      </Card>

      {/* Expenses List */}
      <div>
        <h2 className="text-2xl font-bold mb-4">
          {expenses.length} expense{expenses.length !== 1 ? "s" : ""}
        </h2>
        <ExpensesList
          expenses={expenses}
          members={members}
          spaceId={spaceId}
          cycleId={cycle.id}
          currency={space?.currency || "CLP"}
          currentUserId={user.id}
        />
      </div>
    </div>
  );
}
