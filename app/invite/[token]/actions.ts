"use server";

import { createClient } from "@/lib/supabase/server";
import {
  getInvitationByToken,
  acceptInvitation,
  addSpaceMember,
  claimPlaceholderMember,
  updateExpensesPaidBy,
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
    const space = invitation.spaces;
    const userName = user.user_metadata?.name || user.email?.split("@")[0] || "Partner";

    // Try to claim existing placeholder member
    let oldPlaceholderId: string | null = null;
    try {
      oldPlaceholderId = await claimPlaceholderMember(
        supabase,
        space.id,
        invitation.email,
        user.id,
        userName
      );
    } catch (err) {
      // No placeholder exists — fall back to creating new member (pre-migration flow)
      console.log("No placeholder found, creating new member (pre-migration flow)");
    }

    // If we claimed a placeholder, migrate expenses from placeholder_id to user.id
    if (oldPlaceholderId) {
      const { error: migrateError } = await updateExpensesPaidBy(
        supabase,
        space.id,
        oldPlaceholderId,
        user.id
      );

      if (migrateError) {
        console.error("Failed to migrate expenses:", migrateError);
        // Continue anyway; this shouldn't block acceptance
      }
    } else {
      // Fallback: add user as new member if placeholder didn't exist
      // Get existing member to calculate split based on income if needed
      let splitPercentage = 50;

      if (space.split_mode === "income") {
        const membersResult = await supabase
          .from("space_members")
          .select("monthly_income, split_percentage")
          .eq("space_id", space.id)
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
      await addSpaceMember(supabase, {
        space_id: space.id,
        user_id: user.id,
        name: userName,
        split_percentage: splitPercentage,
        role: "member",
      });
    }

    // Accept invitation
    await acceptInvitation(supabase, invitation.id);

    return { success: true, spaceId: space.id };
  } catch (err) {
    console.error("Accept invitation error:", err);
    return { error: "An unexpected error occurred" };
  }
}
