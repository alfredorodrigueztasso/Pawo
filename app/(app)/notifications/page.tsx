import { Card } from "@orion-ds/react/client";
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

  // Get user's space
  const { data: memberData } = await supabase
    .from("space_members")
    .select("space_id")
    .eq("user_id", user.id)
    .single();

  if (!memberData) {
    return (
      <div className="p-8">
        <Card className="p-8 text-center">
          <p className="text-secondary">No space found</p>
        </Card>
      </div>
    );
  }

  const spaceId = memberData.space_id;

  // Get recent expenses in the space
  const { data: expenses } = await supabase
    .from("expenses")
    .select("id, description, amount, paid_by, created_at")
    .eq("space_id", spaceId)
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

  // Get space members for name lookup
  const { data: members } = await supabase
    .from("space_members")
    .select("user_id, name")
    .eq("space_id", spaceId);

  const memberMap = new Map(members?.map((m) => [m.user_id, m.name]) || []);

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2 text-primary">Notifications</h1>
        <p className="text-secondary">Activity in your space</p>
      </div>

      <ActivityFeed
        expenses={expenses || []}
        reviews={reviews || []}
        memberMap={memberMap}
        currentUserId={user.id}
        spaceId={spaceId}
      />
    </div>
  );
}
