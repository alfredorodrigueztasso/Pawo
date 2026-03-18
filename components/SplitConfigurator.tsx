"use client";

import { Card, Slider, ToggleGroup } from "@orion-ds/react/client";

interface SplitConfiguratorProps {
  splitMode: "manual" | "income";
  onSplitModeChange: (mode: "manual" | "income") => void;
  splitPercentage: number;
  onSplitPercentageChange: (value: number) => void;
}

export function SplitConfigurator({
  splitMode,
  onSplitModeChange,
  splitPercentage,
  onSplitPercentageChange,
}: SplitConfiguratorProps) {
  const partnerPercentage = 100 - splitPercentage;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-8)" }}>
      {/* Mode selector */}
      <ToggleGroup
          type="single"
          value={splitMode}
          onValueChange={(val) => onSplitModeChange(val as "manual" | "income")}
          variant="outline"
          size="md"
          style={{ width: "100%" }}
        >
          <ToggleGroup.Item value="manual" style={{ flex: 1 }}>Fixed percentage</ToggleGroup.Item>
          <ToggleGroup.Item value="income" style={{ flex: 1 }}>By income</ToggleGroup.Item>
        </ToggleGroup>

      {/* Manual mode: split visualization + slider */}
      {splitMode === "manual" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-8)" }}>
          {/* Split breakdown cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-3)" }}>
            <Card
              style={{
                padding: "var(--spacing-4)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <p className="text-sm font-medium text-secondary">You</p>
              <p className="text-3xl font-bold text-brand" style={{ marginTop: "var(--spacing-1)" }}>
                {splitPercentage}%
              </p>
            </Card>
            <Card
              style={{
                padding: "var(--spacing-4)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <p className="text-sm font-medium text-secondary">Your partner</p>
              <p className="text-3xl font-bold text-secondary" style={{ marginTop: "var(--spacing-1)" }}>
                {partnerPercentage}%
              </p>
            </Card>
          </div>

          {/* Slider */}
          <Slider
            value={splitPercentage}
            onChange={onSplitPercentageChange}
            min={10}
            max={90}
            step={5}
            size="lg"
            label="Split percentage"
            showTicks
            tickValues={[25, 50, 75]}
            formatValue={(v) => `${v}%`}
          />
        </div>
      )}

      {/* Income mode: explanatory text */}
      {splitMode === "income" && (
        <div
          style={{
            padding: "var(--spacing-4)",
            background: "var(--color-surface)",
            borderRadius: "var(--radius-control)",
          }}
        >
          <p className="text-sm text-secondary">
            Income-based splits are automatically calculated from each partner's monthly income.
          </p>
        </div>
      )}
    </div>
  );
}
