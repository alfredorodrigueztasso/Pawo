import { Card, Badge } from "@orion-ds/react/client";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Calendar } from "lucide-react";
import { CreateSpaceModal } from "./CreateSpaceModal";
import { formatCurrency } from "@/lib/currency";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Spaces — Pawo",
};

interface SpaceWithDetails {
  space_id: string;
  role: string;
  joined_at: string;
  members: Array<{ user_id: string; name: string }>;
  spaces: Array<{
    id: string;
    name: string;
    currency: string;
    cycle_start_day: number;
    split_mode: string;
    created_at: string;
  }>;
}

export default async function SpacesPage() {
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

  // Get all space IDs for the user
  const { data: memberData } = await supabase
    .from("space_members")
    .select("space_id, role, joined_at")
    .eq("user_id", user.id);

  if (!memberData || memberData.length === 0) {
    // Early return if user has no spaces
    return (
      <>
        <div className="mb-10 flex justify-between items-center">
          <h1 className="text-4xl font-bold text-primary">Espacios</h1>
          <CreateSpaceModal />
        </div>
        <Card className="p-8 text-center">
          <p className="text-secondary mb-4">No se encontraron espacios</p>
          <p className="text-sm text-tertiary mb-6">
            Crea tu primer espacio para empezar a rastrear gastos compartidos
          </p>
          <div className="inline-block">
            <CreateSpaceModal />
          </div>
        </Card>
      </>
    );
  }

  // Get space details
  const spaceIds = memberData.map((m) => m.space_id);
  const { data: spacesData } = await supabase
    .from("spaces")
    .select("id, name, currency, cycle_start_day, split_mode")
    .in("id", spaceIds);

  // Get all members for each space
  const { data: allMembersData } = await supabase
    .from("space_members")
    .select("space_id, name, user_id")
    .in("space_id", spaceIds);

  // Fetch profiles for avatar URLs
  const userIds = [...new Set((allMembersData || []).map((m) => m.user_id))];
  const { data: profilesData } = await supabase
    .from("profiles")
    .select("id, avatar_url")
    .in("id", userIds);

  // Seed profileMap with current user's avatar from auth metadata
  const profileMap: Record<string, string> = {};
  if (user.user_metadata?.avatar_url) {
    profileMap[user.id] = user.user_metadata.avatar_url;
  }
  // Merge in profiles table data
  (profilesData || []).forEach((p) => {
    if (p.avatar_url) profileMap[p.id] = p.avatar_url;
  });

  // Group members by space_id
  const membersBySpace = (allMembersData || []).reduce(
    (acc, m) => {
      if (!acc[m.space_id]) acc[m.space_id] = [];
      acc[m.space_id].push({ user_id: m.user_id, name: m.name, avatar_url: profileMap[m.user_id] || "" });
      return acc;
    },
    {} as Record<string, Array<{ user_id: string; name: string; avatar_url?: string }>>
  );

  // Get all open cycles for the spaces
  const { data: cyclesData } = await supabase
    .from("cycles")
    .select("id, space_id")
    .in("space_id", spaceIds)
    .eq("status", "open");

  // Get all expenses for those cycles
  const cycleIds = cyclesData?.map((c) => c.id) ?? [];
  const { data: expensesData } = cycleIds.length > 0
    ? await supabase
        .from("expenses")
        .select("cycle_id, amount")
        .in("cycle_id", cycleIds)
    : { data: [] };

  // Compute totals by cycle
  const totalByCycle: Record<string, number> = {};
  for (const e of expensesData ?? []) {
    totalByCycle[e.cycle_id] = (totalByCycle[e.cycle_id] ?? 0) + Number(e.amount);
  }

  // Map space_id to cycle_id
  const cycleBySpace: Record<string, string> = {};
  for (const c of cyclesData ?? []) {
    cycleBySpace[c.space_id] = c.id;
  }

  // Combine the data
  const spaceMembers = memberData.map((member) => ({
    ...member,
    members: membersBySpace[member.space_id] || [],
    spaces: [spacesData?.find((h) => h.id === member.space_id)],
  }));

  const spaces = (spaceMembers || []) as SpaceWithDetails[];

  // Helper function to calculate next payment date
  const getNextPaymentDate = (cycleStartDay: number): string => {
    const today = new Date();
    const next = new Date(today.getFullYear(), today.getMonth(), cycleStartDay);
    if (next <= today) next.setMonth(next.getMonth() + 1);
    return next.toLocaleDateString("es-CL", { day: "numeric", month: "long" });
  };


  // Avatar group component
  function AvatarGroup({ members }: { members: Array<{ name: string; user_id: string; avatar_url?: string }> }) {
    if (members.length === 0) return null;
    const visible = members.slice(0, 4);
    const overflow = members.length - visible.length;
    const colors = ["bg-blue-400", "bg-green-400", "bg-purple-400", "bg-orange-400"];

    return (
      <div className="flex -space-x-2">
        {visible.map((m) => {
          if (m.avatar_url) {
            return (
              <img
                key={m.user_id}
                src={m.avatar_url}
                alt={m.name}
                title={m.name}
                className="w-8 h-8 rounded-full border-2 border-white object-cover"
              />
            );
          }
          const initials = m.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
          const color = colors[m.name.charCodeAt(0) % colors.length];
          return (
            <div
              key={m.user_id}
              title={m.name}
              className={`${color} w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold border-2 border-white`}
            >
              {initials}
            </div>
          );
        })}
        {overflow > 0 && (
          <div className="bg-surface-layer w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 border-white text-secondary">
            +{overflow}
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-4xl font-bold text-primary">Espacios</h1>
        <CreateSpaceModal />
      </div>

      {spaces.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {spaces.map((item) => (
            <Link key={item.space_id} href={`/spaces/${item.space_id}`}>
              <Card className="overflow-hidden hover:shadow-lg transition cursor-pointer">
                {/* Header: name + avatars */}
                <div className="flex items-center justify-between px-6 py-6" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <h2 className="text-xl font-semibold text-primary leading-tight">
                    {item.spaces[0]?.name}
                  </h2>
                  <AvatarGroup members={item.members} />
                </div>

                {/* Body: cycle total + next payment */}
                <div className="px-6 py-6">
                  <p className="text-sm text-tertiary mb-1">Ciclo actual</p>
                  <div className="flex items-center gap-3 mb-4">
                    <p className="text-3xl font-bold text-primary">
                      {formatCurrency(
                        totalByCycle[cycleBySpace[item.space_id]] ?? 0,
                        item.spaces[0]?.currency ?? "CLP"
                      )}
                    </p>
                    <Badge variant="info">{item.spaces[0]?.currency}</Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-tertiary" />
                    <p className="text-sm text-tertiary">
                      Próximo pago:{" "}
                      <span className="font-medium text-primary">
                        {getNextPaymentDate(item.spaces[0]?.cycle_start_day || 1)}
                      </span>
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <p className="text-secondary mb-4">No spaces found</p>
          <p className="text-sm text-tertiary mb-6">
            Create your first space to start tracking shared expenses
          </p>
          <div className="inline-block">
            <CreateSpaceModal />
          </div>
        </Card>
      )}
    </>
  );
}
