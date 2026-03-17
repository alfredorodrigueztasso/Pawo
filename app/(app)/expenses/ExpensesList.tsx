"use client";

import { Card, Badge, Button, useDisclosure, ToggleGroup } from "@orion-ds/react/client";
import Link from "next/link";
import type { Expense, SpaceMember } from "@/types";
import { ExpenseOptionsMenu } from "./ExpenseOptionsMenu";
import { formatCurrency } from "@/lib/currency";
import { useState, useMemo } from "react";

interface ExpensesListProps {
  expenses: Expense[];
  members: SpaceMember[];
  spaceId: string;
  cycleId: string;
  currency: string;
  currentUserId: string;
}

interface ExpenseRowProps {
  expense: Expense;
  members: SpaceMember[];
  spaceId: string;
  currency: string;
  getMemberName: (userId: string) => string;
  formatDate: (date: string) => string;
}

function ExpenseRow({
  expense,
  members,
  spaceId,
  currency,
  getMemberName,
  formatDate,
}: ExpenseRowProps) {
  const { isOpen: isEditOpen, open: onEditOpen, close: onEditClose } = useDisclosure();

  return (
    <Card
      key={expense.id}
      className="p-6 hover:shadow-md transition cursor-pointer"
      onClick={onEditOpen}
    >
      <div className="flex justify-between items-center gap-4">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-primary truncate">
            {expense.description || "Untitled expense"}
          </p>
          <p className="text-sm text-secondary mt-1">
            {getMemberName(expense.paid_by)} paid • {formatDate(expense.date)}
          </p>
        </div>
        <div
          className="flex items-center gap-3 flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-xl font-bold text-primary">
            {formatCurrency(expense.amount, currency)}
          </p>
          <ExpenseOptionsMenu
            expense={expense}
            spaceId={spaceId}
            members={members}
            isEditOpen={isEditOpen}
            onEditOpen={onEditOpen}
            onEditClose={onEditClose}
          />
        </div>
      </div>
      {expense.review_requested_by && (
        <Badge variant="warning" className="mt-3">
          Under review
        </Badge>
      )}
    </Card>
  );
}

export function ExpensesList({
  expenses,
  members,
  spaceId,
  cycleId,
  currency,
  currentUserId,
}: ExpensesListProps) {
  const [selectedTab, setSelectedTab] = useState<string>("all");

  const getMemberName = (userId: string) => {
    return members.find((m) => m.user_id === userId)?.name || "Unknown";
  };

  const formatDate = (date: string) => {
    return new Date(date + "T00:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // Calculate totals per member
  const totals = useMemo(() => {
    const result: Record<string, number> = {};
    expenses.forEach((exp) => {
      result[exp.paid_by] = (result[exp.paid_by] || 0) + exp.amount;
    });
    return result;
  }, [expenses]);

  // Filter expenses based on selected filter
  const filteredExpenses = useMemo(() => {
    if (selectedTab === "all") return expenses;
    return expenses.filter((exp) => exp.paid_by === selectedTab);
  }, [expenses, selectedTab]);

  if (expenses.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-secondary mb-4">No expenses yet</p>
        <p className="text-sm text-tertiary mb-6">
          Start adding expenses to track your spending
        </p>
        <Link href="/home">
          <Button variant="primary">Add First Expense</Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter toggle buttons */}
      <ToggleGroup type="single" value={selectedTab} onValueChange={setSelectedTab}>
        <ToggleGroup.Item value="all">All</ToggleGroup.Item>
        {members.map((member) => (
          <ToggleGroup.Item key={member.user_id} value={member.user_id}>
            {member.user_id === currentUserId ? "Me" : member.name} ·{" "}
            {formatCurrency(totals[member.user_id] || 0, currency)}
          </ToggleGroup.Item>
        ))}
      </ToggleGroup>

      {/* Expenses list */}
      <div className="stack stack-gap-2">
        {filteredExpenses.length === 0 ? (
          <Card className="p-6 text-center text-secondary">
            No expenses for this filter
          </Card>
        ) : (
          filteredExpenses.map((expense) => (
            <ExpenseRow
              key={expense.id}
              expense={expense}
              members={members}
              spaceId={spaceId}
              currency={currency}
              getMemberName={getMemberName}
              formatDate={formatDate}
            />
          ))
        )}
      </div>
    </div>
  );
}
