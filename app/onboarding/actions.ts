"use server";

import { createClient } from "@/lib/supabase/server";
import {
  createHousehold,
  addHouseholdMember,
  createInvitation,
  createCycle,
} from "@/lib/supabase/queries";
import { getNextCycleStartDate, getNextCycleEndDate } from "@/lib/cycle";
import { suggestSplit } from "@/lib/balance";
import { sendInvitationEmail } from "@/lib/email";
import crypto from "crypto";

export async function createHouseholdAction(data: {
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

    // Create household
    const householdResult = await createHousehold(supabase, {
      name: data.name,
      created_by: user.id,
      currency: data.currency,
      cycle_start_day: data.cycle_start_day,
      split_mode: data.split_mode,
    });

    if (householdResult.error) {
      return { error: "Failed to create household" };
    }

    const household = householdResult.data;

    // Calculate split percentage
    let splitPercentageOwner = 50;
    if (data.split_mode === "income" && data.income) {
      const { percentA } = suggestSplit(data.income, data.income); // Default: same income
      splitPercentageOwner = percentA;
    }

    // Add current user as owner
    const memberResult = await addHouseholdMember(supabase, {
      household_id: household.id,
      user_id: user.id,
      name: user.user_metadata?.name || user.email?.split("@")[0] || "You",
      split_percentage: splitPercentageOwner,
      role: "owner",
    });

    if (memberResult.error) {
      return { error: "Failed to add household member" };
    }

    // Create initial cycle
    const today = new Date();
    const cycleStart = getNextCycleStartDate(data.cycle_start_day, today);
    const cycleEnd = getNextCycleEndDate(data.cycle_start_day, today);

    const cycleResult = await createCycle(supabase, {
      household_id: household.id,
      start_date: cycleStart.toISOString().split("T")[0],
      end_date: cycleEnd.toISOString().split("T")[0],
    });

    if (cycleResult.error) {
      return { error: "Failed to create cycle" };
    }

    // Create invitation for partner
    const invitationToken = crypto.randomBytes(32).toString("hex");
    const inviteResult = await createInvitation(supabase, {
      household_id: household.id,
      email: data.partnerEmail,
      token: invitationToken,
    });

    if (inviteResult.error) {
      return { error: "Failed to create invitation" };
    }

    // Send invitation email
    const ownerName = user.user_metadata?.name || user.email?.split("@")[0] || "Your partner";
    await sendInvitationEmail({
      recipientEmail: data.partnerEmail,
      senderName: ownerName,
      householdName: data.name,
      invitationToken,
    }).catch((err) => {
      console.error("Failed to send invitation email:", err);
      // Don't fail the whole operation if email fails
    });

    return { success: true };
  } catch (err) {
    console.error("Onboarding error:", err);
    return { error: "An unexpected error occurred" };
  }
}
