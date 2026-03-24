import { Card, Alert, Badge } from "@orion-ds/react/client";
import { createClient } from "@/lib/supabase/server";
import { CloseCycleModal } from "./CloseCycleModal";
import { formatCyclePeriod, getCurrentCycleProgress, parseLocalDate, getCycleDaysStats } from "@/lib/cycle";
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

  // Calculate remaining days for better UX messaging
  const { daysRemaining, totalCycleDays } = getCycleDaysStats(
    parseLocalDate(cycle.start_date),
    parseLocalDate(cycle.end_date)
  );

  // Determine progress stage and message
  const getProgressStage = (percentage: number) => {
    if (percentage < 25) return { text: "Recién empezando", variant: "info" as const };
    if (percentage < 60) return { text: "A mitad del camino", variant: "info" as const };
    if (percentage < 85) return { text: "Casi terminando", variant: "info" as const };
    if (percentage < 100) return { text: `Quedan ${daysRemaining} días`, variant: "warning" as const };
    return { text: "Listo para cerrar", variant: "success" as const };
  };

  const progressStage = getProgressStage(progress);

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2 text-primary">Ciclo Actual</h1>
        <p className="text-secondary">Gestiona y cierra tus ciclos de gastos</p>
      </div>

      {/* Cycle Progress */}
      <Card className="p-8">
        <div className="space-y-4">
          <div>
            <p className="text-sm text-secondary mb-2">Período</p>
            <p className="text-lg font-semibold text-primary">
              {formatCyclePeriod(
                parseLocalDate(cycle.start_date),
                parseLocalDate(cycle.end_date)
              )}
            </p>
          </div>
          <div>
            <p className="text-sm text-secondary mb-2">Progreso</p>
            <div className="w-full bg-surface-subtle rounded-full h-3">
              <div
                className="bg-brand h-3 rounded-full transition-all"
                style={{ width: `${Math.min(progress, 100)}%` }}
              ></div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={progressStage.variant} size="sm">
                {progressStage.text}
              </Badge>
              <span className="text-xs text-secondary">({progress}% del ciclo)</span>
            </div>
          </div>

          <div className="pt-4 border-t border-border-subtle">
            <p className="text-sm text-secondary mb-2">Resumen</p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-secondary">Total de gastos:</span>
                <span className="font-semibold text-primary">
                  {formatCurrency(
                    cycleExpenses.reduce((sum, e) => sum + e.amount, 0),
                    space?.currency || "CLP"
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Registros:</span>
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
