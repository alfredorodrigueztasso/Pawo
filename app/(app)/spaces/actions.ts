"use server";

import { createClient } from "@/lib/supabase/server";
import {
  createSpace,
  addSpaceMember,
  createInvitation,
  createCycle,
} from "@/lib/supabase/queries";
import { getNextCycleStartDate, getNextCycleEndDate } from "@/lib/cycle";
import { suggestSplit } from "@/lib/balance";
import { sendInvitationEmail } from "@/lib/email";
import crypto from "crypto";

export async function createSpaceAction(data: {
  name: string;
  currency: string;
  cycle_start_day: number;
  split_mode: "manual" | "income";
  income?: number | null;
  partnerEmail: string;
}) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Not authenticated" };
    }

    // Create space
    const spaceResult = await createSpace(supabase, {
      name: data.name,
      created_by: user.id,
      currency: data.currency,
      cycle_start_day: data.cycle_start_day,
      split_mode: data.split_mode,
    });

    if (spaceResult.error) {
      console.error("Space creation error:", spaceResult.error);
      return { error: `Failed to create space: ${spaceResult.error.message || "Unknown error"}` };
    }

    const space = spaceResult.data;
    if (!space) {
      return { error: "Failed to create space: no data returned (check RLS policies on spaces table)" };
    }

    // Calculate split percentage
    let splitPercentageOwner = 50;
    if (data.split_mode === "income" && data.income) {
      const { percentA } = suggestSplit(data.income, data.income);
      splitPercentageOwner = percentA;
    }

    // Add current user as owner
    const memberResult = await addSpaceMember(supabase, {
      space_id: space.id,
      user_id: user.id,
      name: user.user_metadata?.name || user.email?.split("@")[0] || "You",
      split_percentage: splitPercentageOwner,
      role: "owner",
    });

    if (memberResult.error) {
      console.error("Member creation error:", memberResult.error);
      return { error: `Failed to add space member: ${memberResult.error.message || "Unknown error"}` };
    }

    if (!memberResult.data) {
      return { error: "Failed to add space member: no data returned (check RLS policies on space_members table)" };
    }

    // Create initial cycle
    const today = new Date();
    const cycleStart = getNextCycleStartDate(data.cycle_start_day, today);
    const cycleEnd = getNextCycleEndDate(data.cycle_start_day, today);

    const cycleResult = await createCycle(supabase, {
      space_id: space.id,
      start_date: cycleStart.toISOString().split("T")[0],
      end_date: cycleEnd.toISOString().split("T")[0],
    });

    if (cycleResult.error) {
      console.error("Cycle creation error:", cycleResult.error);
      return { error: `Failed to create cycle: ${cycleResult.error.message || "Unknown error"}` };
    }

    if (!cycleResult.data) {
      return { error: "Failed to create cycle: no data returned (check RLS policies on cycles table)" };
    }

    // Create invitation for partner (optional)
    if (data.partnerEmail) {
      const invitationToken = crypto.randomBytes(32).toString("hex");
      const inviteResult = await createInvitation(supabase, {
        space_id: space.id,
        email: data.partnerEmail,
        token: invitationToken,
      });

      if (inviteResult.error) {
        console.error("Invitation creation error:", inviteResult.error);
        return { error: `Failed to create invitation: ${inviteResult.error.message || "Unknown error"}` };
      }

      // Send invitation email
      const ownerName = user.user_metadata?.name || user.email?.split("@")[0] || "Your partner";
      await sendInvitationEmail({
        recipientEmail: data.partnerEmail,
        senderName: ownerName,
        spaceName: data.name,
        invitationToken,
      }).catch((err) => {
        console.error("Failed to send invitation email:", err);
      });
    }

    return { success: true };
  } catch (err) {
    console.error("Space creation error:", err);
    return { error: "An unexpected error occurred" };
  }
}
