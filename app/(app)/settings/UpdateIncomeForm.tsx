"use client";

import { Card, Field, Button } from "@orion-ds/react";
import { useState } from "react";
import { updateIncomeAction } from "./actions";

interface UpdateIncomeFormProps {
  householdId: string;
  userId: string;
  currentIncome: number | null;
  splitMode: string;
}

export function UpdateIncomeForm({
  householdId,
  userId,
  currentIncome,
  splitMode,
}: UpdateIncomeFormProps) {
  const [income, setIncome] = useState(currentIncome?.toString() || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      const result = await updateIncomeAction({
        householdId,
        userId,
        monthlyIncome: income ? parseFloat(income) : null,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update income");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-8">
      <h2 className="text-2xl font-bold mb-6">Split Settings</h2>
      <p className="text-sm text-gray-600 mb-4">
        Income-based splits are automatically calculated from monthly income.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field
          label="Your monthly income"
          type="number"
          name="income"
          placeholder="Enter your monthly income"
          value={income}
          onChange={(e) => setIncome(e.target.value)}
          step="0.01"
        />

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
            Income updated successfully!
          </div>
        )}

        <Button
          variant="primary"
          type="submit"
          disabled={loading || !income}
        >
          {loading ? "Updating..." : "Update Income"}
        </Button>
      </form>

      <p className="text-xs text-gray-500 mt-4">
        Your split percentage will be recalculated based on both partners' incomes.
      </p>
    </Card>
  );
}
