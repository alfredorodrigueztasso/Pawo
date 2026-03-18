"use client";

import { Card, Field, Button, Alert, useToast } from "@orion-ds/react/client";
import { useState } from "react";
import { updateIncomeAction } from "./actions";

interface UpdateIncomeFormProps {
  spaceId: string;
  userId: string;
  currentIncome: number | null;
  splitMode: string;
}

export function UpdateIncomeForm({
  spaceId,
  userId,
  currentIncome,
  splitMode,
}: UpdateIncomeFormProps) {
  const [income, setIncome] = useState(currentIncome?.toString() || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await updateIncomeAction({
        spaceId,
        userId,
        monthlyIncome: income ? parseFloat(income) : null,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        toast({
          message: "Income updated successfully",
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update income");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-8">
      <h2 className="text-2xl font-bold mb-6 text-primary">Split Settings</h2>
      <p className="text-sm text-secondary mb-4">
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

        {error && <Alert variant="error" dismissible onClose={() => setError(null)}>{error}</Alert>}

        <Button
          variant="primary"
          type="submit"
          disabled={loading || !income}
        >
          {loading ? "Updating..." : "Update Income"}
        </Button>
      </form>

      <p className="text-xs text-tertiary mt-4">
        Your split percentage will be recalculated based on both partners' incomes.
      </p>
    </Card>
  );
}
