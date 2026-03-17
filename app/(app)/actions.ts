"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleThemeAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const current = (user.user_metadata?.theme as "light" | "dark") ?? "light";
  const next = current === "dark" ? "light" : "dark";

  const { error } = await supabase.auth.updateUser({
    data: { theme: next },
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true, theme: next };
}
