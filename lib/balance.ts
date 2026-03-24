export interface Expense {
  id: string;
  amount: number;
  paid_by: string;
  split_override?: Record<string, number>;
}

export interface Member {
  user_id: string | null;
  placeholder_id?: string | null;
  split_percentage: number;
  name: string;
}

function getMemberEffectiveId(m: Member): string {
  return m.user_id ?? m.placeholder_id ?? '';
}

export interface BalanceSummary {
  totalExpenses: number;
  totalPaidByA: number;
  totalPaidByB: number;
  splitA: number;
  splitB: number;
  adjustmentA: number;
  adjustmentB: number;
  memberAName: string;
  memberBName: string;
}

export function calculateBalance(
  expenses: Expense[],
  members: [Member, Member]
): BalanceSummary {
  const [memberA, memberB] = members;

  const memberAId = getMemberEffectiveId(memberA);
  const memberBId = getMemberEffectiveId(memberB);

  const totalPaidByA = expenses
    .filter((e) => e.paid_by === memberAId)
    .reduce((sum, e) => sum + e.amount, 0);

  const totalPaidByB = expenses
    .filter((e) => e.paid_by === memberBId)
    .reduce((sum, e) => sum + e.amount, 0);

  const totalExpenses = totalPaidByA + totalPaidByB;

  // Calculate split per expense, respecting split_override if present
  let splitA = 0;
  let splitB = 0;
  for (const expense of expenses) {
    const overrideA = expense.split_override?.[memberAId];
    const overrideB = expense.split_override?.[memberBId];
    const pctA = overrideA ?? memberA.split_percentage;
    const pctB = overrideB ?? memberB.split_percentage;
    splitA += expense.amount * (pctA / 100);
    splitB += expense.amount * (pctB / 100);
  }

  const adjustmentA = splitA - totalPaidByA;
  const adjustmentB = splitB - totalPaidByB;

  return {
    totalExpenses,
    totalPaidByA,
    totalPaidByB,
    splitA,
    splitB,
    adjustmentA,
    adjustmentB,
    memberAName: memberA.name,
    memberBName: memberB.name,
  };
}

export interface SoloBalance {
  totalSpent: number;
}

export function calculateSoloBalance(
  expenses: Expense[],
  member: Member
): SoloBalance {
  const memberId = getMemberEffectiveId(member);
  const totalSpent = expenses
    .filter((e) => e.paid_by === memberId)
    .reduce((sum, e) => sum + e.amount, 0);

  return { totalSpent };
}

export function suggestSplit(incomeA: number, incomeB: number) {
  // Validate that incomes are non-negative numbers
  if (isNaN(incomeA) || isNaN(incomeB)) {
    throw new Error("Income values must be valid numbers");
  }

  if (incomeA < 0 || incomeB < 0) {
    throw new Error("Income values must be non-negative");
  }

  const total = incomeA + incomeB;
  if (total === 0) return { percentA: 50, percentB: 50 };

  const percentA = Math.round((incomeA / total) * 100);
  const percentB = 100 - percentA;

  return { percentA, percentB };
}
