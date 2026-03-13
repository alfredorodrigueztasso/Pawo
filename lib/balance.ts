export interface Expense {
  id: string;
  amount: number;
  paid_by: string;
  split_override?: Record<string, number>;
}

export interface Member {
  user_id: string;
  split_percentage: number;
  name: string;
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

  const totalPaidByA = expenses
    .filter((e) => e.paid_by === memberA.user_id)
    .reduce((sum, e) => sum + e.amount, 0);

  const totalPaidByB = expenses
    .filter((e) => e.paid_by === memberB.user_id)
    .reduce((sum, e) => sum + e.amount, 0);

  const totalExpenses = totalPaidByA + totalPaidByB;

  const splitA = totalExpenses * (memberA.split_percentage / 100);
  const splitB = totalExpenses * (memberB.split_percentage / 100);

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

export function suggestSplit(incomeA: number, incomeB: number) {
  const total = incomeA + incomeB;
  if (total === 0) return { percentA: 50, percentB: 50 };

  const percentA = Math.round((incomeA / total) * 100);
  const percentB = 100 - percentA;

  return { percentA, percentB };
}
