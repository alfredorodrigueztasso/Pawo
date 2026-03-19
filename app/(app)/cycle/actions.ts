"use server";

import { createClient } from "@/lib/supabase/server";
import { closeCycle, createCycle } from "@/lib/supabase/queries";
import { getNextCycleDates } from "@/lib/cycle";

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
    const closeResult = await closeCycle(supabase, data.cycleId, user.id, data.summary);

    if (closeResult.error) {
      return { error: `Failed to close cycle: ${closeResult.error.message}` };
    }

    // Get space config and current cycle end_date
    const [spaceResult, cycleResult] = await Promise.all([
      supabase
        .from("spaces")
        .select("cycle_type, cycle_duration_days, cycle_start_day")
        .eq("id", data.spaceId)
        .single(),
      supabase
        .from("cycles")
        .select("end_date")
        .eq("id", data.cycleId)
        .single(),
    ]);

    if (!spaceResult.data) {
      return { error: "Space not found" };
    }

    if (!cycleResult.data) {
      return { error: "Cycle not found" };
    }

    // Calculate next cycle: starts day after current cycle ends
    // Use addDays helper manually since we're in a server action
    const currentEndDate = new Date(cycleResult.data.end_date);
    const nextStartDate = new Date(currentEndDate);
    nextStartDate.setDate(nextStartDate.getDate() + 1);

    const nextStartStr = nextStartDate.toISOString().split("T")[0];

    const cycleDates = getNextCycleDates(spaceResult.data.cycle_type, nextStartStr, {
      cycleDurationDays: spaceResult.data.cycle_duration_days ?? undefined,
      cycleStartDay: spaceResult.data.cycle_start_day ?? undefined,
    });

    const newCycleResult = await createCycle(supabase, {
      space_id: data.spaceId,
      start_date: cycleDates.start,
      end_date: cycleDates.end,
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
