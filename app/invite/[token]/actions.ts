"use server";

import { createClient } from "@/lib/supabase/server";
import {
  getInvitationByToken,
  acceptInvitation,
  addHouseholdMember,
} from "@/lib/supabase/queries";
import { suggestSplit } from "@/lib/balance";
import { redirect } from "next/navigation";

export async function acceptInvitationAction(token: string, data: {
  income?: number;
}) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Not authenticated" };
    }

    // Get invitation
    const inviteResult = await getInvitationByToken(supabase, token);

    if (inviteResult.error || !inviteResult.data) {
      return { error: "Invalid or expired invitation" };
    }

    const invitation = inviteResult.data;
    const household = invitation.households;

    // Accept invitation
    await acceptInvitation(supabase, invitation.id);

    // Get existing member to calculate split based on income if needed
    let splitPercentage = 50;

    if (household.split_mode === "income") {
      const membersResult = await supabase
        .from("household_members")
        .select("monthly_income, split_percentage")
        .eq("household_id", household.id)
        .single();

      if (membersResult.data?.monthly_income && data.income) {
        const { percentB } = suggestSplit(
          membersResult.data.monthly_income,
          data.income
        );
        splitPercentage = percentB;
      }
    }

    // Add user as member
    await addHouseholdMember(supabase, {
      household_id: household.id,
      user_id: user.id,
      name: user.user_metadata?.name || user.email?.split("@")[0] || "Partner",
      split_percentage: splitPercentage,
      role: "member",
    });

    return { success: true, householdId: household.id };
  } catch (err) {
    console.error("Accept invitation error:", err);
    return { error: "An unexpected error occurred" };
  }
}
