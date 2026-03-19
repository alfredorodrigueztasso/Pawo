"use client";

import { useState, useTransition } from "react";
import { Card, Field, Button, ToggleGroup, Alert, useToast } from "@orion-ds/react/client";
import { updateCycleConfigAction } from "./actions";
import type { CycleType } from "@/lib/cycle";

export function UpdateCycleForm({
  spaceId,
  currentCycleType,
  currentCycleDurationDays,
  currentCycleStartDay,
}: {
  spaceId: string;
  currentCycleType: CycleType;
  currentCycleDurationDays?: number | null;
  currentCycleStartDay?: number | null;
}) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [cycleType, setCycleType] = useState<CycleType>(currentCycleType);
  const [cycleDurationDays, setCycleDurationDays] = useState<number | undefined>(
    currentCycleDurationDays ?? undefined
  );
  const [cycleStartDay, setCycleStartDay] = useState<string>(
    String(currentCycleStartDay || "1")
  );

  const isChanged =
    cycleType !== currentCycleType ||
    cycleDurationDays !== currentCycleDurationDays ||
    (cycleType === "monthly" && parseInt(cycleStartDay) !== currentCycleStartDay);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (cycleType === "custom" && (!cycleDurationDays || cycleDurationDays < 2)) {
      setError("Custom cycle duration must be at least 2 days");
      return;
    }

    startTransition(async () => {
      const result = await updateCycleConfigAction({
        spaceId,
        cycle_type: cycleType,
        cycle_duration_days: cycleType === "custom" ? cycleDurationDays : null,
        cycle_start_day: cycleType === "monthly" ? parseInt(cycleStartDay) : null,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        toast({ message: "Cycle configuration updated successfully" });
      }
    });
  }

  return (
    <Card className="p-8">
      <h2 className="text-2xl font-bold mb-2 text-primary">Cycle Configuration</h2>
      <p className="text-sm text-secondary mb-6">
        Changes apply to the next cycle. The current cycle will not be affected.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cycle cadence */}
        <div>
          <label className="text-sm font-medium text-primary mb-2 block">
            Expense cycle frequency
          </label>
          <ToggleGroup
            type="single"
            value={cycleType}
            onValueChange={(val) => setCycleType(val as CycleType)}
            variant="outline"
            size="md"
            style={{ width: "100%" }}
          >
            <ToggleGroup.Item value="monthly" style={{ flex: 1 }}>
              Monthly
            </ToggleGroup.Item>
            <ToggleGroup.Item value="biweekly" style={{ flex: 1 }}>
              Biweekly
            </ToggleGroup.Item>
            <ToggleGroup.Item value="weekly" style={{ flex: 1 }}>
              Weekly
            </ToggleGroup.Item>
          </ToggleGroup>
        </div>

        {/* Custom duration input */}
        {cycleType === "custom" && (
          <Field
            label="Cycle duration (minimum 2 days)"
            type="number"
            value={cycleDurationDays ?? ""}
            onChange={(e) =>
              setCycleDurationDays(e.target.value ? parseInt(e.target.value) : undefined)
            }
            min="2"
            placeholder="e.g., 10"
            required
          />
        )}

        {/* Monthly: Day of month */}
        {cycleType === "monthly" && (
          <Field
            label="Day of month to start cycle (1-28)"
            type="number"
            value={cycleStartDay}
            onChange={(e) => setCycleStartDay(e.target.value)}
            min="1"
            max="28"
            required
          />
        )}

        {error && (
          <Alert variant="error" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <div className="flex gap-3 pt-4">
          <Button
            variant="primary"
            type="submit"
            disabled={!isChanged || isPending}
            size="lg"
          >
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
