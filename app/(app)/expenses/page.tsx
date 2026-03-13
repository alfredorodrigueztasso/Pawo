import { Card, Button, Field } from "@orion-ds/react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ExpensesList } from "./ExpensesList";
import { addExpenseAction } from "../home/actions";
import type { HouseholdMember } from "@/types";

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

  // Get active household
  const householdResult = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .single();

  if (!householdResult.data) {
    return (
      <div className="p-8">
        <Card className="p-8 text-center">
          <p className="text-gray-600">No household found</p>
        </Card>
      </div>
    );
  }

  const householdId = householdResult.data.household_id;

  // Get household and cycle
  const [householdDetailsResult, cycleResult] = await Promise.all([
    supabase
      .from("households")
      .select("*, household_members(*)")
      .eq("id", householdId)
      .single(),
    supabase
      .from("cycles")
      .select("*")
      .eq("household_id", householdId)
      .eq("status", "open")
      .order("start_date", { ascending: false })
      .limit(1)
      .single(),
  ]);

  const household = householdDetailsResult.data;
  const cycle = cycleResult.data;

  if (!cycle) {
    return (
      <div className="p-8">
        <Card className="p-8 text-center">
          <p className="text-gray-600">No active cycle</p>
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
  const members: HouseholdMember[] = household?.household_members || [];

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold mb-2">Expenses</h1>
          <p className="text-gray-600">Track all expenses for this cycle</p>
        </div>
      </div>

      {/* Add Expense Form */}
      <Card className="p-6 bg-blue-50">
        <h3 className="text-lg font-semibold mb-4">Add new expense</h3>
        <form action={addExpenseAction} className="space-y-3">
          <input type="hidden" name="householdId" value={householdId} />
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
          householdId={householdId}
          cycleId={cycle.id}
        />
      </div>
    </div>
  );
}
