"use client";

import { Card } from "@orion-ds/react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { calculateBalance, BalanceSummary } from "@/lib/balance";
import { formatCurrency } from "@/lib/currency";
import type { Expense, SpaceMember } from "@/types";

interface BalanceDisplayProps {
  spaceId: string;
  cycleId: string;
  members: SpaceMember[];
  currency: string;
}

export function BalanceDisplay({
  spaceId,
  cycleId,
  members,
  currency,
}: BalanceDisplayProps) {
  const [balance, setBalance] = useState<BalanceSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // Initial fetch
    const fetchBalance = async () => {
      const { data: expenses } = await supabase
        .from("expenses")
        .select("*")
        .eq("cycle_id", cycleId);

      if (expenses) {
        const balanceData = calculateBalance(
          expenses,
          members as [SpaceMember, SpaceMember]
        );
        setBalance(balanceData);
      }
      setLoading(false);
    };

    fetchBalance();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`expenses:${cycleId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "expenses",
          filter: `cycle_id=eq.${cycleId}`,
        },
        async () => {
          // Refetch on any change
          const { data: expenses } = await supabase
            .from("expenses")
            .select("*")
            .eq("cycle_id", cycleId);

          if (expenses) {
            const balanceData = calculateBalance(
              expenses,
              members as [SpaceMember, SpaceMember]
            );
            setBalance(balanceData);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [cycleId, members]);

  if (loading) {
    return (
      <Card className="p-8 bg-surface-subtle animate-pulse">
        <div className="h-32 bg-surface-subtle rounded" />
      </Card>
    );
  }

  if (!balance) {
    return null;
  }

  const isAdjustmentInFavor = balance.adjustmentA > 0;
  const adjustmentLabel = isAdjustmentInFavor
    ? `${balance.memberBName} owes ${formatCurrency(Math.abs(balance.adjustmentA), currency)}`
    : `${balance.memberAName} owes ${formatCurrency(Math.abs(balance.adjustmentA), currency)}`;

  return (
    <Card className="p-8 bg-surface-subtle">
      <div className="space-y-6">
        <div>
          <p className="text-sm text-secondary mb-2">Current cycle balance</p>
          <h2 className="text-5xl font-bold text-brand">
            {formatCurrency(balance.totalExpenses, currency)}
          </h2>
          <p className="text-sm text-secondary mt-2">{adjustmentLabel}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-surface-layer rounded-lg p-4">
            <p className="text-sm text-secondary mb-1">{balance.memberAName}</p>
            <p className="text-2xl font-semibold text-primary">
              {formatCurrency(balance.totalPaidByA, currency)}
            </p>
            <p className="text-xs text-tertiary mt-2">
              {Math.round(balance.adjustmentA * 100) / 100 > 0
                ? `owes ${formatCurrency(Math.abs(balance.adjustmentA), currency)}`
                : `gets back ${formatCurrency(Math.abs(balance.adjustmentA), currency)}`}
            </p>
          </div>
          <div className="bg-surface-layer rounded-lg p-4">
            <p className="text-sm text-secondary mb-1">{balance.memberBName}</p>
            <p className="text-2xl font-semibold text-primary">
              {formatCurrency(balance.totalPaidByB, currency)}
            </p>
            <p className="text-xs text-tertiary mt-2">
              {Math.round(balance.adjustmentB * 100) / 100 > 0
                ? `owes ${formatCurrency(Math.abs(balance.adjustmentB), currency)}`
                : `gets back ${formatCurrency(Math.abs(balance.adjustmentB), currency)}`}
            </p>
          </div>
        </div>

        <div className="bg-surface-layer rounded-lg p-4">
          <p className="text-sm text-secondary mb-3">Split ratio</p>
          <div className="flex gap-2 h-3 rounded-full overflow-hidden">
            <div
              className="bg-brand rounded-l-full"
              style={{ width: `${balance.memberAName === balance.memberAName ? balance.splitA / balance.totalExpenses * 100 : balance.splitB / balance.totalExpenses * 100}%` }}
            ></div>
            <div
              className="bg-surface-subtle rounded-r-full"
              style={{ width: `${balance.memberBName === balance.memberBName ? balance.splitB / balance.totalExpenses * 100 : balance.splitA / balance.totalExpenses * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-secondary mt-3">
            <span>{balance.memberAName}: {balance.memberAName ? Math.round(balance.splitA / balance.totalExpenses * 100) : 50}%</span>
            <span>{balance.memberBName}: {balance.memberBName ? Math.round(balance.splitB / balance.totalExpenses * 100) : 50}%</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
