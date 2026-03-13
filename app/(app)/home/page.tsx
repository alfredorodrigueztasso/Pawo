import { Card, Button, Field } from "@orion-ds/react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { BalanceDisplay } from "@/components/balance/BalanceDisplay";
import { addExpenseAction } from "./actions";
import type { HouseholdMember } from "@/types";

export const metadata = {
  title: "Home — Pawo",
};

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="p-8 text-center">
        <p>Not authenticated</p>
      </div>
    );
  }

  // Get active household for user
  const householdResult = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .single();

  if (!householdResult.data) {
    return (
      <div className="p-8">
        <Card className="p-8 text-center">
          <p className="text-gray-600 mb-4">No household found</p>
          <Link href="/onboarding">
            <Button variant="primary">Create a Household</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const householdId = householdResult.data.household_id;

  // Get household with members and active cycle
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
  const members: HouseholdMember[] = household?.household_members || [];

  if (!cycle) {
    return (
      <div className="p-8">
        <Card className="p-8 text-center">
          <p className="text-gray-600 mb-4">No active cycle</p>
          <p className="text-sm text-gray-500">
            Contact support to create a new cycle
          </p>
        </Card>
      </div>
    );
  }

  const partnerCount = members.length;
  const isReady = partnerCount === 2;

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Welcome back</h1>
        <p className="text-gray-600">
          Here's the current balance between you and your partner
        </p>
      </div>

      {/* Balance Display with Realtime */}
      {isReady && members.length === 2 && (
        <BalanceDisplay
          householdId={householdId}
          cycleId={cycle.id}
          members={members}
        />
      )}

      {!isReady && (
        <Card className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="text-center space-y-4">
            <p className="text-gray-600">
              Waiting for your partner to join to start tracking
            </p>
            <p className="text-2xl font-semibold text-gray-400">
              {members.length} / 2 members
            </p>
          </div>
        </Card>
      )}

      {/* Quick Add Expense */}
      {isReady && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Quick add expense</h3>
          <form action={addExpenseAction} className="space-y-3">
            <input type="hidden" name="householdId" value={householdId} />
            <input type="hidden" name="cycleId" value={cycle.id} />

            <div className="grid grid-cols-3 gap-3">
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
              <div className="flex items-end">
                <Button variant="primary" type="submit" className="w-full">
                  Add
                </Button>
              </div>
            </div>
            <Field
              label="Description (optional)"
              name="description"
              placeholder="e.g., groceries"
            />
          </form>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link href="/expenses">
          <Button variant="secondary" className="w-full px-6 py-3 text-center">
            View All Expenses
          </Button>
        </Link>
        <Link href="/cycle">
          <Button variant="secondary" className="w-full px-6 py-3 text-center">
            Cycle Details
          </Button>
        </Link>
      </div>

      {/* Status Banner */}
      {!isReady && (
        <Card className="p-6 border-l-4 border-blue-500">
          <p className="text-sm text-gray-600">
            Your partner hasn't joined yet. You'll see your balance once they accept the
            invitation.
          </p>
        </Card>
      )}
    </div>
  );
}
