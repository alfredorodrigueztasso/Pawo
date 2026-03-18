import { Card, Field, Button } from "@orion-ds/react/client";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { UpdateIncomeForm } from "./UpdateIncomeForm";
import { UpdateSplitForm } from "./UpdateSplitForm";
import { MembersList } from "./MembersList";

export const metadata = {
  title: "Settings — Pawo",
};

export default async function SettingsPage() {
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
    .select("space_id, monthly_income, split_percentage")
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

  // Get space details
  const { data: space } = await supabase
    .from("spaces")
    .select("*")
    .eq("id", spaceId)
    .single();

  // Get all space members
  const { data: members } = await supabase
    .from("space_members")
    .select("*")
    .eq("space_id", spaceId);

  // Member emails disabled for now - requires SUPABASE_SERVICE_ROLE_KEY
  const memberEmails: Record<string, string> = {};

  const splitMode = space?.split_mode || "manual";
  const isIncomeMode = splitMode === "income";

  // Find owner and partner members
  const ownerMember = members?.find((m) => m.user_id === user.id) || null;
  const partnerMember = members?.find((m) => m.user_id !== user.id) || null;

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2 text-primary">Settings</h1>
        <p className="text-secondary">Manage your space configuration</p>
      </div>

      {/* Profile Settings */}
      <Card className="p-8">
        <h2 className="text-2xl font-bold mb-4 text-primary">Profile</h2>
        <p className="text-secondary mb-6">Manage your account information</p>
        <Link href="/settings/profile">
          <Button variant="primary">Edit Profile</Button>
        </Link>
      </Card>

      {/* Space Settings */}
      <Card className="p-8">
        <h2 className="text-2xl font-bold mb-6 text-primary">Space</h2>
        <form className="space-y-4">
          <Field
            label="Space name"
            defaultValue={space?.name}
            disabled
          />
          <Field
            label="Currency"
            defaultValue={space?.currency}
            disabled
          />
          <Field
            label="Cycle start day"
            type="number"
            defaultValue={String(space?.cycle_start_day)}
            disabled
          />
        </form>
      </Card>

      {/* Split Settings - Always show, handles both modes */}
      {ownerMember && (
        <UpdateSplitForm
          spaceId={spaceId}
          currentSplitMode={splitMode as "manual" | "income"}
          ownerMember={ownerMember}
          partnerMember={partnerMember}
        />
      )}

      {/* Income Form - Only show if in income mode */}
      {isIncomeMode && (
        <UpdateIncomeForm
          spaceId={spaceId}
          userId={user.id}
          currentIncome={memberData.monthly_income}
          splitMode={splitMode}
        />
      )}

      {/* Members */}
      <MembersList
        members={members || []}
        memberEmails={memberEmails}
        currentUserId={user.id}
        spaceId={spaceId}
      />
    </div>
  );
}
