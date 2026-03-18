"use client";

import { Card, Button, Alert, Badge } from "@orion-ds/react/client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { closeCycleAction } from "./actions";
import { formatCurrency } from "@/lib/currency";
import type { Cycle, Expense, SpaceMember } from "@/types";
import { calculateBalance, calculateSoloBalance } from "@/lib/balance";

interface CloseCycleModalProps {
  cycle: Cycle;
  expenses: Expense[];
  members: SpaceMember[];
  spaceId: string;
  currency: string;
}

export function CloseCycleModal({
  cycle,
  expenses,
  members,
  spaceId,
  currency,
}: CloseCycleModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isReady = members.length === 2 && members.every(m => !m.is_placeholder);

  // Memoize balance calculation to avoid recomputing on every render
  const balance = useMemo(
    () =>
      isReady
        ? calculateBalance(expenses, members as [SpaceMember, SpaceMember])
        : null,
    [expenses, members, isReady]
  );

  const handleClose = async () => {
    setError(null);
    setLoading(true);

    let summary;

    if (isReady && balance) {
      // Paired mode: full balance calculation
      summary = {
        totalExpenses: balance.totalExpenses,
        memberAPaid: balance.totalPaidByA,
        memberBPaid: balance.totalPaidByB,
        adjustmentAmount: Math.abs(balance.adjustmentA),
        adjustmentDirection:
          balance.adjustmentA > 0
            ? `${balance.memberBName} → ${balance.memberAName}`
            : `${balance.memberAName} → ${balance.memberBName}`,
      };
    } else {
      // Solo mode: simple summary with solo member's total
      const soloBalance = calculateSoloBalance(expenses, members[0]);
      summary = {
        totalExpenses: soloBalance.totalSpent,
        memberAPaid: soloBalance.totalSpent,
        soloMode: true,
      };
    }

    const result = await closeCycleAction({
      cycleId: cycle.id,
      spaceId: spaceId,
      summary,
    });

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.refresh();
    }
  };

  return (
    <Card className="p-8">
      <div className="space-y-6">
        <div>
          <h3 className="text-2xl font-bold mb-2">Close this cycle?</h3>
          <p className="text-secondary">
            This will archive all expenses and start a new cycle
          </p>
        </div>

        {isReady ? (
          // Paired mode: show full balance
          <>
            <div className="bg-surface-layer rounded-control p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-secondary">Total expenses:</span>
                <span className="font-semibold text-primary">
                  {formatCurrency(
                    expenses.reduce((sum, e) => sum + e.amount, 0),
                    currency
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">{members[0].name} paid:</span>
                <span className="font-semibold text-primary">
                  {formatCurrency(
                    expenses
                      .filter((e) => e.paid_by === (members[0].user_id ?? members[0].placeholder_id))
                      .reduce((sum, e) => sum + e.amount, 0),
                    currency
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">{members[1].name} paid:</span>
                <span className="font-semibold text-primary">
                  {formatCurrency(
                    expenses
                      .filter((e) => e.paid_by === (members[1].user_id ?? members[1].placeholder_id))
                      .reduce((sum, e) => sum + e.amount, 0),
                    currency
                  )}
                </span>
              </div>
              <div className="border-t border-border-subtle pt-3 flex justify-between">
                <span className="font-medium text-primary">Final adjustment:</span>
                <span className="font-bold text-brand">
                  {balance && formatCurrency(Math.abs(balance.adjustmentA), currency)}
                </span>
              </div>
            </div>

            <Alert variant="info" dismissible>
              {balance && (balance.adjustmentA > 0
                ? `${members[1].name} should transfer ${formatCurrency(Math.abs(balance.adjustmentA), currency)} to ${members[0].name}`
                : `${members[0].name} should transfer ${formatCurrency(Math.abs(balance.adjustmentA), currency)} to ${members[1].name}`)}
            </Alert>
          </>
        ) : (
          // Solo mode: show simple summary
          <div className="bg-surface-layer rounded-control p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-secondary">Total expenses:</span>
              <span className="font-semibold text-primary">
                {formatCurrency(
                  expenses.reduce((sum, e) => sum + e.amount, 0),
                  currency
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary">{members[0].name} paid:</span>
              <span className="font-semibold text-primary">
                {formatCurrency(
                  expenses
                    .filter((e) => e.paid_by === (members[0].user_id ?? members[0].placeholder_id))
                    .reduce((sum, e) => sum + e.amount, 0),
                  currency
                )}
              </span>
            </div>
          </div>
        )}

        {error && <Alert variant="error" dismissible onClose={() => setError(null)}>{error}</Alert>}

        <div className="flex gap-3">
          <Button variant="secondary" type="button" className="flex-1">
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleClose}
            disabled={loading}
            className="flex-1"
          >
            {loading ? "Closing..." : "Close Cycle"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
