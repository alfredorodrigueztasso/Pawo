import { Card } from "@orion-ds/react";
import { createClient } from "@/lib/supabase/server";
import { CloseCycleModal } from "./CloseCycleModal";
import { formatCyclePeriod, getCurrentCycleProgress } from "@/lib/cycle";

export const metadata = {
  title: "Cycle — Pawo",
};

export default async function CyclePage() {
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

  // Get active cycle
  const [cycleResult, householdResult2, expensesResult] = await Promise.all([
    supabase
      .from("cycles")
      .select("*")
      .eq("household_id", householdId)
      .eq("status", "open")
      .order("start_date", { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from("households")
      .select("*, household_members(*)")
      .eq("id", householdId)
      .single(),
    supabase.from("expenses").select("*"),
  ]);

  const cycle = cycleResult.data;
  const household = householdResult2.data;
  const allExpenses = expensesResult.data || [];

  if (!cycle) {
    return (
      <div className="p-8">
        <Card className="p-8 text-center">
          <p className="text-gray-600">No active cycle</p>
        </Card>
      </div>
    );
  }

  const cycleExpenses = allExpenses.filter((e) => e.cycle_id === cycle.id);
  const members = household?.household_members || [];
  const progress = getCurrentCycleProgress(
    new Date(cycle.start_date),
    new Date(cycle.end_date)
  );

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Current Cycle</h1>
        <p className="text-gray-600">Manage and close your expense cycles</p>
      </div>

      {/* Cycle Progress */}
      <Card className="p-8">
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">Period</p>
            <p className="text-lg font-semibold">
              {formatCyclePeriod(
                new Date(cycle.start_date),
                new Date(cycle.end_date)
              )}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Progress</p>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all"
                style={{ width: `${Math.min(progress, 100)}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">{progress}% complete</p>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-gray-600 mb-2">Summary</p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-700">Total expenses:</span>
                <span className="font-semibold">
                  ${cycleExpenses
                    .reduce((sum, e) => sum + e.amount, 0)
                    .toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Entries:</span>
                <span className="font-semibold">{cycleExpenses.length}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Close Cycle */}
      <CloseCycleModal
        cycle={cycle}
        expenses={cycleExpenses}
        members={members}
        householdId={householdId}
      />
    </div>
  );
}
