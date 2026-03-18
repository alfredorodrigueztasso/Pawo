"use client";

import { Card, Badge } from "@orion-ds/react/client";
import { useState } from "react";
import { formatCurrency } from "@/lib/currency";
import { parseLocalDate } from "@/lib/cycle";
import type { Cycle } from "@/types";

interface PastCyclesSectionProps {
  cycles: Cycle[];
  currency: string;
  currentUserId: string;
  members: Array<{ user_id: string | null; name: string; split_percentage: number }>;
}

export function PastCyclesSection({
  cycles,
  currency,
  currentUserId,
  members,
}: PastCyclesSectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (cycles.length === 0) {
    return null;
  }

  const formatCycleLabel = (startDate: string, endDate: string) => {
    const start = parseLocalDate(startDate);
    const end = parseLocalDate(endDate);
    return `${start.toLocaleDateString("es-CL", { day: "numeric", month: "short" })} – ${end.toLocaleDateString("es-CL", { day: "numeric", month: "short" })}`;
  };

  const getBalanceBadge = (cycle: Cycle) => {
    // If cycle has a summary (snapshot of balance at close), use it
    if (cycle.summary) {
      const summary = typeof cycle.summary === "string" ? JSON.parse(cycle.summary) : cycle.summary;
      if (summary.status === "settled") {
        return { label: "Settled", variant: "success" as const };
      }
      if (summary.status === "you_paid_more") {
        return { label: `You're owed ${formatCurrency(summary.amount, currency)}`, variant: "success" as const };
      }
      if (summary.status === "partner_paid_more") {
        return { label: `You owe ${formatCurrency(summary.amount, currency)}`, variant: "warning" as const };
      }
    }
    // Fallback: if no summary, show as neutral
    return { label: "Closed", variant: "info" as const };
  };

  const getExpenseCount = (cycle: Cycle) => {
    // This would require fetching expenses for each cycle, or having count in summary
    // For now, we'll show a placeholder — ideally the summary includes expenseCount
    if (cycle.summary) {
      const summary = typeof cycle.summary === "string" ? JSON.parse(cycle.summary) : cycle.summary;
      return summary.expenseCount || 0;
    }
    return 0;
  };

  const badge = getBalanceBadge(cycles[0]);

  return (
    <div className="space-y-4">
      {/* Toggle header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-base font-semibold text-primary hover:text-secondary transition"
      >
        Past cycles {isOpen ? "▾" : "▸"}
      </button>

      {/* Expanded content */}
      {isOpen && (
        <div className="space-y-3">
          {cycles.map((cycle) => {
            const cycleLabel = formatCycleLabel(cycle.start_date, cycle.end_date);
            const { data: cycleExpenses } = { data: [] }; // Placeholder — would need to fetch
            const total = cycle.summary
              ? typeof cycle.summary === "string"
                ? JSON.parse(cycle.summary).totalSpent || 0
                : cycle.summary.totalSpent || 0
              : 0;
            const expenseCount = getExpenseCount(cycle);
            const balanceBadge = getBalanceBadge(cycle);

            return (
              <Card
                key={cycle.id}
                className="p-4 flex items-center justify-between hover:shadow-md transition"
              >
                <div className="flex-1">
                  <p className="font-semibold text-primary">{cycleLabel}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-secondary text-sm">
                      {formatCurrency(total, currency)}
                    </span>
                    <span className="text-tertiary text-xs">
                      {expenseCount} {expenseCount === 1 ? "expense" : "expenses"}
                    </span>
                  </div>
                </div>
                <Badge variant={balanceBadge.variant}>{balanceBadge.label}</Badge>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
