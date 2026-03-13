"use client";

import { Card, Button, Badge } from "@orion-ds/react";
import Link from "next/link";
import { useState } from "react";
import type { Expense, HouseholdMember } from "@/types";
import { deleteExpenseAction } from "../home/actions";

interface ExpensesListProps {
  expenses: Expense[];
  members: HouseholdMember[];
  householdId: string;
  cycleId: string;
}

export function ExpensesList({
  expenses,
  members,
  householdId,
  cycleId,
}: ExpensesListProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const getMemberName = (userId: string) => {
    return members.find((m) => m.user_id === userId)?.name || "Unknown";
  };

  const formatDate = (date: string) => {
    return new Date(date + "T00:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const handleDelete = async (expenseId: string) => {
    if (!confirm("Are you sure you want to delete this expense?")) {
      return;
    }

    setLoading(expenseId);
    try {
      await deleteExpenseAction({
        expenseId,
        householdId,
      });
      window.location.reload();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to delete expense");
      setLoading(null);
    }
  };

  if (expenses.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-gray-600 mb-4">No expenses yet</p>
        <p className="text-sm text-gray-500 mb-6">
          Start adding expenses to track your spending
        </p>
        <Link href="/home">
          <Button variant="primary">Add First Expense</Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {expenses.map((expense) => (
        <Card
          key={expense.id}
          className="p-4 hover:shadow-md transition cursor-pointer"
        >
          <div className="flex justify-between items-start gap-4">
            <Link href={`/expenses/${expense.id}`} className="flex-1">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {expense.description || "Untitled expense"}
                  </p>
                  <p className="text-sm text-gray-600">
                    {getMemberName(expense.paid_by)} paid • {formatDate(expense.date)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-lg text-gray-900">
                    ${expense.amount.toFixed(2)}
                  </p>
                </div>
              </div>
            </Link>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(expense.id);
              }}
              disabled={loading === expense.id}
              className="ml-2 px-2 py-1 text-red-600 hover:bg-red-50 rounded transition-colors text-sm flex-shrink-0"
            >
              {loading === expense.id ? "..." : "Delete"}
            </button>
          </div>
          {expense.review_requested_by && (
            <Badge variant="warning" className="mt-2">
              Under review
            </Badge>
          )}
        </Card>
      ))}
    </div>
  );
}
