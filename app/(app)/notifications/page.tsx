import { Card } from "@orion-ds/react";
import { createClient } from "@/lib/supabase/server";
import { ActivityFeed } from "./ActivityFeed";

export const metadata = {
  title: "Notifications — Pawo",
};

export default async function NotificationsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div className="p-8 text-center">Not authenticated</div>;
  }

  // Get user's household
  const { data: memberData } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .single();

  if (!memberData) {
    return (
      <div className="p-8">
        <Card className="p-8 text-center">
          <p className="text-gray-600">No household found</p>
        </Card>
      </div>
    );
  }

  const householdId = memberData.household_id;

  // Get recent expenses in the household
  const { data: expenses } = await supabase
    .from("expenses")
    .select("id, description, amount, paid_by, created_at")
    .eq("household_id", householdId)
    .order("created_at", { ascending: false })
    .limit(20);

  // Get recent reviews
  const { data: reviews } = await supabase
    .from("reviews")
    .select(
      "id, status, created_at, requested_by, expense_id"
    )
    .in(
      "expense_id",
      expenses?.map((e) => e.id) || []
    )
    .order("created_at", { ascending: false })
    .limit(20);

  // Get household members for name lookup
  const { data: members } = await supabase
    .from("household_members")
    .select("user_id, name")
    .eq("household_id", householdId);

  const memberMap = new Map(members?.map((m) => [m.user_id, m.name]) || []);

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Notifications</h1>
        <p className="text-gray-600">Activity in your household</p>
      </div>

      <ActivityFeed
        expenses={expenses || []}
        reviews={reviews || []}
        memberMap={memberMap}
        currentUserId={user.id}
        householdId={householdId}
      />
    </div>
  );
}
