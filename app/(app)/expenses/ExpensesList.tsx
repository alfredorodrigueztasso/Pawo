"use client";

import { Card, Badge, Button, useDisclosure, Tabs } from "@orion-ds/react/client";
import type { TabItem } from "@orion-ds/react/client";
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

function ExpenseListContent({
  filteredExpenses,
  members,
  spaceId,
  currency,
  getMemberName,
  formatDate,
}: {
  filteredExpenses: Expense[];
  members: SpaceMember[];
  spaceId: string;
  currency: string;
  getMemberName: (userId: string) => string;
  formatDate: (date: string) => string;
}) {
  return (
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
  const getMemberName = (userId: string) => {
    return members.find((m) => m.user_id === userId || m.placeholder_id === userId)?.name || "Unknown";
  };

  const formatDate = (date: string) => {
    return new Date(date + "T00:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // Calculate totals and counts per member
  const totals = useMemo(() => {
    const result: Record<string, number> = {};
    expenses.forEach((exp) => {
      result[exp.paid_by] = (result[exp.paid_by] || 0) + exp.amount;
    });
    return result;
  }, [expenses]);

  const memberCounts = useMemo(() => {
    const result: Record<string, number> = {};
    expenses.forEach((exp) => {
      result[exp.paid_by] = (result[exp.paid_by] || 0) + 1;
    });
    return result;
  }, [expenses]);

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

  // Build tabs
  const tabs: TabItem[] = [
    {
      id: "all",
      label: "All",
      badge: expenses.length,
      content: (
        <ExpenseListContent
          filteredExpenses={expenses}
          members={members}
          spaceId={spaceId}
          currency={currency}
          getMemberName={getMemberName}
          formatDate={formatDate}
        />
      ),
    },
    ...members.map((member) => {
      const memberEffectiveId = member.user_id ?? member.placeholder_id ?? member.id;
      const isCurrent = member.user_id === currentUserId;
      return {
        id: memberEffectiveId,
        label: isCurrent ? "Me" : member.name,
        badge: memberCounts[memberEffectiveId] || 0,
        content: (
          <ExpenseListContent
            filteredExpenses={expenses.filter((e) => e.paid_by === memberEffectiveId)}
            members={members}
            spaceId={spaceId}
            currency={currency}
            getMemberName={getMemberName}
            formatDate={formatDate}
          />
        ),
      };
    }),
  ];

  return (
    <div className="space-y-4">
      {members.length > 1 ? (
        <Tabs tabs={tabs} defaultTab="all" noPanelPadding />
      ) : (
        <ExpenseListContent
          filteredExpenses={expenses}
          members={members}
          spaceId={spaceId}
          currency={currency}
          getMemberName={getMemberName}
          formatDate={formatDate}
        />
      )}
    </div>
  );
}
