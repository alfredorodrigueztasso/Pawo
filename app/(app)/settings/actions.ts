"use server";

import { createClient } from "@/lib/supabase/server";
import { updateSpaceMember } from "@/lib/supabase/queries";
import { suggestSplit } from "@/lib/balance";
import { revalidatePath } from "next/cache";

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
        monthly_income: monthlyIncome || undefined,
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
