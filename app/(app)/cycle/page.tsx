import { Card, Alert } from "@orion-ds/react/client";
import { createClient } from "@/lib/supabase/server";
import { CloseCycleModal } from "./CloseCycleModal";
import { formatCyclePeriod, getCurrentCycleProgress, parseLocalDate } from "@/lib/cycle";
import { formatCurrency } from "@/lib/currency";

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

  // Get active space
  const spaceResult = await supabase
    .from("space_members")
    .select("space_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (!spaceResult.data) {
    return (
      <div className="p-8">
        <Alert variant="warning">No space found</Alert>
      </div>
    );
  }

  const spaceId = spaceResult.data.space_id;

  // Get active cycle and space
  const [cycleResult, spaceResult2] = await Promise.all([
    supabase
      .from("cycles")
      .select("*")
      .eq("space_id", spaceId)
      .eq("status", "open")
      .order("start_date", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("spaces")
      .select("*, space_members(*)")
      .eq("id", spaceId)
      .single(),
  ]);

  const cycle = cycleResult.data;
  const space = spaceResult2.data;

  if (!cycle) {
    return (
      <div className="p-8">
        <Alert variant="warning">No active cycle</Alert>
      </div>
    );
  }

  // Get expenses for this cycle (with proper filtering)
  const { data: cycleExpensesData } = await supabase
    .from("expenses")
    .select("*")
    .eq("cycle_id", cycle.id);
  const cycleExpenses = cycleExpensesData || [];
  const members = space?.space_members || [];
  const progress = getCurrentCycleProgress(
    parseLocalDate(cycle.start_date),
    parseLocalDate(cycle.end_date)
  );

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2 text-primary">Current Cycle</h1>
        <p className="text-secondary">Manage and close your expense cycles</p>
      </div>

      {/* Cycle Progress */}
      <Card className="p-8">
        <div className="space-y-4">
          <div>
            <p className="text-sm text-secondary mb-2">Period</p>
            <p className="text-lg font-semibold text-primary">
              {formatCyclePeriod(
                parseLocalDate(cycle.start_date),
                parseLocalDate(cycle.end_date)
              )}
            </p>
          </div>
          <div>
            <p className="text-sm text-secondary mb-2">Progress</p>
            <div className="w-full bg-surface-subtle rounded-full h-3">
              <div
                className="bg-brand h-3 rounded-full transition-all"
                style={{ width: `${Math.min(progress, 100)}%` }}
              ></div>
            </div>
            <p className="text-sm text-secondary mt-2">{progress}% complete</p>
          </div>

          <div className="pt-4 border-t border-border-subtle">
            <p className="text-sm text-secondary mb-2">Summary</p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-secondary">Total expenses:</span>
                <span className="font-semibold text-primary">
                  {formatCurrency(
                    cycleExpenses.reduce((sum, e) => sum + e.amount, 0),
                    space?.currency || "CLP"
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Entries:</span>
                <span className="font-semibold text-primary">{cycleExpenses.length}</span>
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
        spaceId={spaceId}
        currency={space?.currency || "CLP"}
      />
    </div>
  );
}
