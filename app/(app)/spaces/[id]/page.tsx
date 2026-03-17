import { MetricCards, Card, Button, Alert } from "@orion-ds/react/client";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ExpensesList } from "../../expenses/ExpensesList";
import { AddExpenseModal } from "./AddExpenseModal";
import { InviteModal } from "./InviteModal";
import { SpaceOptionsMenu } from "./SpaceOptionsMenu";
import { PastCyclesSection } from "./PastCyclesSection";
import { calculateBalance, calculateSoloBalance } from "@/lib/balance";
import { formatCurrency } from "@/lib/currency";
import type { SpaceMember, Expense, Cycle } from "@/types";

export const metadata = {
  title: "Space — Pawo",
};

function MemberAvatar({ name, avatarUrl }: { name: string; avatarUrl?: string }) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        title={name}
        className="w-10 h-10 rounded-full border-2 border-white object-cover"
      />
    );
  }

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const colors = ["bg-surface-layer", "bg-green-500", "bg-purple-500", "bg-orange-500"];
  const colorIndex = name.charCodeAt(0) % colors.length;

  return (
    <div
      className={`${colors[colorIndex]} w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold`}
    >
      {initials}
    </div>
  );
}

export default async function HouseholdDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: spaceId } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="p-8 text-center">
        <p>Not authenticated</p>
      </div>
    );
  }

  // Get space with members, active cycle, and past cycles
  const [spaceDetailsResult, cycleResult, pastCyclesResult] = await Promise.all([
    supabase
      .from("spaces")
      .select("*, space_members(*)")
      .eq("id", spaceId)
      .single(),
    supabase
      .from("cycles")
      .select("*")
      .eq("space_id", spaceId)
      .eq("status", "open")
      .order("start_date", { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from("cycles")
      .select("*")
      .eq("space_id", spaceId)
      .eq("status", "closed")
      .order("start_date", { ascending: false })
      .limit(6),
  ]);

  const space = spaceDetailsResult.data;
  const cycle = cycleResult.data;
  const pastCycles: Cycle[] = pastCyclesResult.data || [];
  const members: SpaceMember[] = space?.space_members || [];

  // Fetch profiles for member avatars
  const memberUserIds = members.map((m) => m.user_id);
  const { data: profilesData } = await supabase
    .from("profiles")
    .select("id, avatar_url")
    .in("id", memberUserIds);

  // Seed profileMap with current user's avatar from auth metadata
  const profileMap: Record<string, string> = {};
  if (user.user_metadata?.avatar_url) {
    profileMap[user.id] = user.user_metadata.avatar_url;
  }
  // Merge in profiles table data
  (profilesData || []).forEach((p) => {
    if (p.avatar_url) profileMap[p.id] = p.avatar_url;
  });

  if (!space) {
    return (
      <div className="p-8">
        <Card className="p-8 text-center">
          <p className="text-secondary mb-4">Space not found</p>
          <Link href="/spaces">
            <Button variant="primary">Back to Spaces</Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (!cycle) {
    return (
      <div className="p-8">
        <Card className="p-8 text-center">
          <p className="text-secondary mb-4">No active cycle</p>
          <p className="text-sm text-tertiary">
            Contact support to create a new cycle
          </p>
        </Card>
      </div>
    );
  }

  // Get expenses for the current cycle
  const { data: cycleExpensesData } = await supabase
    .from("expenses")
    .select("*")
    .eq("cycle_id", cycle.id)
    .order("date", { ascending: false });

  const cycleExpenses: Expense[] = cycleExpensesData || [];

  const isReady = members.length === 2;

  // Calculate stats
  const totalSpent = cycleExpenses.reduce((sum, e) => sum + e.amount, 0);
  const daysRemaining = Math.max(
    0,
    Math.ceil(
      (new Date(cycle.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )
  );
  const expenseCount = cycleExpenses.length;

  const totalCycleDays = Math.ceil(
    (new Date(cycle.end_date).getTime() - new Date(cycle.start_date).getTime()) / (1000 * 60 * 60 * 24)
  );
  const cycleLabel = `${new Date(cycle.start_date).toLocaleDateString("es-CL", { day: "numeric", month: "short" })} → ${new Date(cycle.end_date).toLocaleDateString("es-CL", { day: "numeric", month: "short" })}`;

  // Calculate balance
  let balanceDisplay = "—";
  if (isReady && cycleExpenses.length > 0) {
    const balance = calculateBalance(cycleExpenses, [members[0], members[1]]);
    const currentMember = members.find((m) => m.user_id === user.id);
    const isCurrentMemberA = currentMember?.user_id === members[0].user_id;
    const userAdjustment = isCurrentMemberA ? balance.adjustmentA : balance.adjustmentB;

    if (userAdjustment > 0) {
      balanceDisplay = `You owe ${formatCurrency(userAdjustment, space.currency)}`;
    } else if (userAdjustment < 0) {
      balanceDisplay = `You're owed ${formatCurrency(Math.abs(userAdjustment), space.currency)}`;
    } else {
      balanceDisplay = "Settled";
    }
  }

  const metrics = [
    {
      label: "Total del ciclo",
      value: formatCurrency(totalSpent, space.currency),
      description: cycleLabel,
    },
    {
      label: "Balance",
      value: balanceDisplay,
    },
    {
      label: "Días restantes",
      value: daysRemaining,
      description: `de ${totalCycleDays} días`,
    },
    {
      label: "Gastos",
      value: expenseCount,
      description: expenseCount > 0
        ? `Promedio ${formatCurrency(totalSpent / expenseCount, space.currency)}`
        : undefined,
    },
  ];

  return (
    <div className="stack stack-gap-8">
      {/* Header with space name, member avatars on left; menu + Add Expense on right */}
      <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-bold text-primary">{space?.name}</h1>
            <div className="flex items-center -space-x-2">
              {members.map((m) => (
                <MemberAvatar key={m.id} name={m.name} avatarUrl={profileMap[m.user_id]} />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <SpaceOptionsMenu space={space} />
            <InviteModal spaceId={spaceId} spaceName={space.name} />
            <AddExpenseModal
              spaceId={spaceId}
              cycleId={cycle.id}
              members={members}
              currentUserId={user.id}
            />
          </div>
      </div>

      {/* Waiting state when not ready */}
      {!isReady && (
        <Alert variant="info">
          Your partner hasn't joined yet, but you can manage this space alone ({members.length} / 2 members)
        </Alert>
      )}

      {/* Current cycle section label */}
      <div>
        <h2 className="text-base font-semibold text-primary mb-6">
          Current cycle
        </h2>
        <MetricCards metrics={metrics} columns={4} />
      </div>

      {/* Expenses List */}
      <div>
        <h2 className="text-base font-semibold text-primary mb-6">
          Expenses
        </h2>
        {cycleExpenses.length > 0 ? (
          <ExpensesList
            expenses={cycleExpenses}
            members={members}
            spaceId={spaceId}
            cycleId={cycle.id}
            currency={space.currency}
            currentUserId={user.id}
          />
        ) : (
          <Card className="flex flex-col items-center justify-center h-96 text-center">
            <p className="text-secondary text-lg mb-2">No expenses yet</p>
            <p className="text-sm text-tertiary">
              Add your first expense to start tracking spending
            </p>
          </Card>
        )}
      </div>

      {/* Past cycles history */}
      {pastCycles.length > 0 && (
        <div>
          <PastCyclesSection
            cycles={pastCycles}
            currency={space.currency}
            currentUserId={user.id}
            members={members}
          />
        </div>
      )}
    </div>
  );
}
