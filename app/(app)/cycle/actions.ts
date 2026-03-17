"use server";

import { createClient } from "@/lib/supabase/server";
import { closeCycle, createCycle } from "@/lib/supabase/queries";
import { getNextCycleStartDate, getNextCycleEndDate } from "@/lib/cycle";

export async function closeCycleAction(data: {
  cycleId: string;
  spaceId: string;
  summary: Record<string, unknown>;
}) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Not authenticated" };
    }

    // Close current cycle
    await closeCycle(supabase, data.cycleId, user.id, data.summary);

    // Create new cycle
    const now = new Date();

    // Get space to know cycle start day
    const spaceResult = await supabase
      .from("spaces")
      .select("cycle_start_day")
      .eq("id", data.spaceId)
      .single();

    if (!spaceResult.data) {
      return { error: "Space not found" };
    }

    const cycleStartDay = spaceResult.data.cycle_start_day;
    const nextStart = getNextCycleStartDate(cycleStartDay, now);
    const nextEnd = getNextCycleEndDate(cycleStartDay, now);

    const newCycleResult = await createCycle(supabase, {
      space_id: data.spaceId,
      start_date: nextStart.toISOString().split("T")[0],
      end_date: nextEnd.toISOString().split("T")[0],
    });

    if (newCycleResult.error) {
      return { error: "Failed to create new cycle" };
    }

    return { success: true };
  } catch (err) {
    console.error("Close cycle error:", err);
    return { error: "An unexpected error occurred" };
  }
}
