"use client";

import { Card, Button, Alert, Badge } from "@orion-ds/react";
import { useState } from "react";
import { closeCycleAction } from "./actions";
import type { Cycle, Expense, HouseholdMember } from "@/types";
import { calculateBalance } from "@/lib/balance";

interface CloseCycleModalProps {
  cycle: Cycle;
  expenses: Expense[];
  members: HouseholdMember[];
  householdId: string;
}

export function CloseCycleModal({
  cycle,
  expenses,
  members,
  householdId,
}: CloseCycleModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (members.length !== 2) {
    return (
      <Card className="p-6 border-l-4 border-amber-500">
        <p className="text-sm text-amber-700">
          Both members must be present to close the cycle
        </p>
      </Card>
    );
  }

  const balance = calculateBalance(
    expenses,
    members as [HouseholdMember, HouseholdMember]
  );

  const handleClose = async () => {
    setError(null);
    setLoading(true);

    const result = await closeCycleAction({
      cycleId: cycle.id,
      householdId: householdId,
      summary: {
        totalExpenses: balance.totalExpenses,
        memberAPaid: balance.totalPaidByA,
        memberBPaid: balance.totalPaidByB,
        adjustmentAmount: Math.abs(balance.adjustmentA),
        adjustmentDirection:
          balance.adjustmentA > 0
            ? `${balance.memberBName} → ${balance.memberAName}`
            : `${balance.memberAName} → ${balance.memberBName}`,
      },
    });

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      window.location.reload();
    }
  };

  return (
    <Card className="p-8 border-2 border-blue-200 bg-blue-50">
      <div className="space-y-6">
        <div>
          <h3 className="text-2xl font-bold mb-2">Close this cycle?</h3>
          <p className="text-gray-600">
            This will archive all expenses and start a new cycle
          </p>
        </div>

        <div className="bg-white rounded-lg p-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Total expenses:</span>
            <span className="font-semibold">
              ${balance.totalExpenses.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">{balance.memberAName} paid:</span>
            <span className="font-semibold">
              ${balance.totalPaidByA.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">{balance.memberBName} paid:</span>
            <span className="font-semibold">
              ${balance.totalPaidByB.toFixed(2)}
            </span>
          </div>
          <div className="border-t pt-3 flex justify-between">
            <span className="font-medium text-gray-900">Final adjustment:</span>
            <span className="font-bold text-blue-600">
              ${Math.abs(balance.adjustmentA).toFixed(2)}
            </span>
          </div>
        </div>

        <Alert variant="info">
          {balance.adjustmentA > 0
            ? `${balance.memberBName} should transfer $${Math.abs(balance.adjustmentA).toFixed(2)} to ${balance.memberAName}`
            : `${balance.memberAName} should transfer $${Math.abs(balance.adjustmentA).toFixed(2)} to ${balance.memberBName}`}
        </Alert>

        {error && <Alert variant="error">{error}</Alert>}

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
