"use server";

import { createClient } from "@/lib/supabase/server";
import { updateSpaceMember } from "@/lib/supabase/queries";
import { suggestSplit } from "@/lib/balance";
import { revalidatePath } from "next/cache";
import type { CycleType } from "@/lib/cycle";

export async function updateIncomeAction({
  spaceId,
  userId,
  monthlyIncome,
}: {
  spaceId: string;
  userId: string;
  monthlyIncome: number | null;
}) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Not authenticated" };
    }

    if (user.id !== userId) {
      return { error: "Cannot update other user's income" };
    }

    // Get current user's household member record
    const { data: currentMember } = await supabase
      .from("space_members")
      .select("id")
      .eq("user_id", userId)
      .eq("space_id", spaceId)
      .single();

    if (!currentMember) {
      return { error: "Member record not found" };
    }

    // Get all household members to recalculate splits
    const { data: members } = await supabase
      .from("space_members")
      .select("*")
      .eq("space_id", spaceId);

    if (!members || members.length !== 2) {
      return { error: "Income mode requires exactly 2 members" };
    }

    // Find the partner
    const partner = members.find((m) => m.user_id !== userId);
    if (!partner) {
      return { error: "Partner not found" };
    }

    // Calculate new split percentages if both have income
    let newPercentageCurrentUser = 50;
    let newPercentagePartner = 50;

    const partnerIncome = partner.monthly_income;
    if (monthlyIncome && partnerIncome) {
      const { percentA, percentB } = suggestSplit(
        monthlyIncome,
        partnerIncome
      );
      newPercentageCurrentUser = percentA;
      newPercentagePartner = percentB;
    }

    // Update current user's income and percentage
    const updateCurrentResult = await updateSpaceMember(
      supabase,
      currentMember.id,
      {
        monthly_income: monthlyIncome ?? undefined,
        split_percentage: newPercentageCurrentUser,
      }
    );

    if (updateCurrentResult.error) {
      return { error: "Failed to update income" };
    }

    // Update partner's percentage (if both have income)
    if (monthlyIncome && partnerIncome) {
      const { data: partnerMember } = await supabase
        .from("space_members")
        .select("id")
        .eq("user_id", partner.user_id)
        .eq("space_id", spaceId)
        .single();

      if (partnerMember) {
        await updateSpaceMember(supabase, partnerMember.id, {
          split_percentage: newPercentagePartner,
        });
      }
    }

    revalidatePath("/settings");
    return { success: true };
  } catch (err) {
    console.error("Update income error:", err);
    return { error: "An unexpected error occurred" };
  }
}

export async function updateSplitAction({
  spaceId,
  splitMode,
  ownerPercentage,
  applyToCurrent,
}: {
  spaceId: string;
  splitMode: "manual" | "income";
  ownerPercentage?: number;
  applyToCurrent: boolean;
}) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Not authenticated" };
    }

    // Fetch all space members
    const { data: members } = await supabase
      .from("space_members")
      .select("*")
      .eq("space_id", spaceId);

    if (!members || members.length !== 2) {
      return { error: "Space must have exactly 2 members" };
    }

    // Identify owner and partner
    const ownerMember = members.find((m) => m.user_id === user.id);
    const partnerMember = members.find((m) => m.user_id !== user.id);

    if (!ownerMember) {
      return { error: "You are not a member of this space" };
    }

    // Validate and calculate split percentages for manual mode
    if (splitMode === "manual") {
      if (ownerPercentage == null || ownerPercentage < 10 || ownerPercentage > 90) {
        return { error: "Split percentage must be between 10% and 90%" };
      }

      const partnerPercentage = 100 - ownerPercentage;

      // Update space split_mode
      const { error: spaceUpdateError } = await supabase
        .from("spaces")
        .update({ split_mode: splitMode })
        .eq("id", spaceId);

      if (spaceUpdateError) {
        return { error: "Failed to update split mode" };
      }

      // Update owner member percentage
      const updateOwnerResult = await updateSpaceMember(supabase, ownerMember.id, {
        split_percentage: ownerPercentage,
      });

      if (updateOwnerResult.error) {
        return { error: "Failed to update owner split percentage" };
      }

      // Update partner member percentage (if exists and not placeholder)
      if (partnerMember && partnerMember.user_id) {
        const updatePartnerResult = await updateSpaceMember(supabase, partnerMember.id, {
          split_percentage: partnerPercentage,
        });

        if (updatePartnerResult.error) {
          return { error: "Failed to update partner split percentage" };
        }
      } else if (partnerMember && partnerMember.is_placeholder) {
        // Update placeholder's percentage
        const updatePartnerResult = await updateSpaceMember(supabase, partnerMember.id, {
          split_percentage: partnerPercentage,
        });

        if (updatePartnerResult.error) {
          return { error: "Failed to update partner split percentage" };
        }
      }

      // TODO: Send email notification to partner
      // (to be implemented with sendEmail utility)

    } else if (splitMode === "income") {
      // Update space split_mode only, percentages will be recalculated when incomes are set
      const { error: spaceUpdateError } = await supabase
        .from("spaces")
        .update({ split_mode: splitMode })
        .eq("id", spaceId);

      if (spaceUpdateError) {
        return { error: "Failed to update split mode" };
      }

      // TODO: Send email notification to partner
      // (to be implemented with sendEmail utility)
    }

    revalidatePath("/settings");
    revalidatePath(`/spaces/${spaceId}`);

    return { success: true };
  } catch (err) {
    console.error("Update split error:", err);
    return { error: "An unexpected error occurred" };
  }
}

export async function updateCycleConfigAction(data: {
  spaceId: string;
  cycle_type: CycleType;
  cycle_duration_days?: number | null;
  cycle_start_day?: number | null;
}) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Not authenticated" };
    }

    // Verify user is the space owner
    const spaceResult = await supabase
      .from("spaces")
      .select("created_by")
      .eq("id", data.spaceId)
      .single();

    if (!spaceResult.data || spaceResult.data.created_by !== user.id) {
      return { error: "Only the space owner can change cycle configuration" };
    }

    // Update space
    const updateResult = await supabase
      .from("spaces")
      .update({
        cycle_type: data.cycle_type,
        cycle_duration_days: data.cycle_duration_days,
        cycle_start_day: data.cycle_start_day,
      })
      .eq("id", data.spaceId)
      .select()
      .single();

    if (updateResult.error) {
      console.error("Update error:", updateResult.error);
      return { error: `Failed to update cycle configuration: ${updateResult.error.message}` };
    }

    revalidatePath("/settings");

    return { success: true, data: updateResult.data };
  } catch (err) {
    console.error("Update cycle config error:", err);
    return { error: "An unexpected error occurred" };
  }
}
