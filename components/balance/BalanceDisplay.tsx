"use client";

import { Card } from "@orion-ds/react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { calculateBalance, BalanceSummary } from "@/lib/balance";
import type { Expense, HouseholdMember } from "@/types";

interface BalanceDisplayProps {
  householdId: string;
  cycleId: string;
  members: HouseholdMember[];
}

export function BalanceDisplay({
  householdId,
  cycleId,
  members,
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
          members as [HouseholdMember, HouseholdMember]
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
              members as [HouseholdMember, HouseholdMember]
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
      <Card className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 animate-pulse">
        <div className="h-32 bg-gray-200 rounded" />
      </Card>
    );
  }

  if (!balance) {
    return null;
  }

  const isAdjustmentInFavor = balance.adjustmentA > 0;
  const adjustmentLabel = isAdjustmentInFavor
    ? `${balance.memberBName} owes ${Math.abs(balance.adjustmentA).toFixed(2)}`
    : `${balance.memberAName} owes ${Math.abs(balance.adjustmentA).toFixed(2)}`;

  return (
    <Card className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="space-y-6">
        <div>
          <p className="text-sm text-gray-600 mb-2">Current cycle balance</p>
          <h2 className="text-5xl font-bold text-blue-600">
            ${balance.totalExpenses.toFixed(2)}
          </h2>
          <p className="text-sm text-gray-600 mt-2">{adjustmentLabel}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">{balance.memberAName}</p>
            <p className="text-2xl font-semibold">
              ${balance.totalPaidByA.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {Math.round(balance.adjustmentA * 100) / 100 > 0
                ? `owes ${Math.abs(balance.adjustmentA).toFixed(2)}`
                : `gets back ${Math.abs(balance.adjustmentA).toFixed(2)}`}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">{balance.memberBName}</p>
            <p className="text-2xl font-semibold">
              ${balance.totalPaidByB.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {Math.round(balance.adjustmentB * 100) / 100 > 0
                ? `owes ${Math.abs(balance.adjustmentB).toFixed(2)}`
                : `gets back ${Math.abs(balance.adjustmentB).toFixed(2)}`}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-3">Split ratio</p>
          <div className="flex gap-2 h-3 rounded-full overflow-hidden">
            <div
              className="bg-blue-400 rounded-l-full"
              style={{ width: `${balance.memberAName === balance.memberAName ? balance.splitA / balance.totalExpenses * 100 : balance.splitB / balance.totalExpenses * 100}%` }}
            ></div>
            <div
              className="bg-blue-200 rounded-r-full"
              style={{ width: `${balance.memberBName === balance.memberBName ? balance.splitB / balance.totalExpenses * 100 : balance.splitA / balance.totalExpenses * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-gray-600 mt-3">
            <span>{balance.memberAName}: {balance.memberAName ? Math.round(balance.splitA / balance.totalExpenses * 100) : 50}%</span>
            <span>{balance.memberBName}: {balance.memberBName ? Math.round(balance.splitB / balance.totalExpenses * 100) : 50}%</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
