import { Card, Field, Button } from "@orion-ds/react";
import { createClient } from "@/lib/supabase/server";
import { UpdateIncomeForm } from "./UpdateIncomeForm";
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

  // Get user's household
  const { data: memberData } = await supabase
    .from("household_members")
    .select("household_id, monthly_income, split_percentage")
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

  // Get household details
  const { data: household } = await supabase
    .from("households")
    .select("*")
    .eq("id", householdId)
    .single();

  // Get all household members
  const { data: members } = await supabase
    .from("household_members")
    .select("*")
    .eq("household_id", householdId);

  // Get member emails
  const memberEmails: Record<string, string> = {};
  if (members) {
    for (const member of members) {
      const { data: auth } = await supabase.auth.admin.getUserById(
        member.user_id
      );
      if (auth?.user?.email) {
        memberEmails[member.user_id] = auth.user.email;
      }
    }
  }

  const splitMode = household?.split_mode || "manual";
  const isIncomeMode = splitMode === "income";

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Settings</h1>
        <p className="text-gray-600">Manage your household configuration</p>
      </div>

      {/* Household Settings */}
      <Card className="p-8">
        <h2 className="text-2xl font-bold mb-6">Household</h2>
        <form className="space-y-4">
          <Field
            label="Household name"
            defaultValue={household?.name}
            disabled
          />
          <Field
            label="Currency"
            defaultValue={household?.currency}
            disabled
          />
          <Field
            label="Cycle start day"
            type="number"
            defaultValue={String(household?.cycle_start_day)}
            disabled
          />
          <Field
            label="Split mode"
            defaultValue={splitMode === "income" ? "By income" : "Manual"}
            disabled
          />
        </form>
      </Card>

      {/* Split Settings - Only show if income mode */}
      {isIncomeMode && (
        <UpdateIncomeForm
          householdId={householdId}
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
        householdId={householdId}
      />
    </div>
  );
}
