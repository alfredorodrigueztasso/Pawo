"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfileAction(formData: FormData) {
  const name = formData.get("name")?.toString();
  const email = formData.get("email")?.toString();

  if (!name || !email) {
    return { error: "Name and email are required" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const updates: Parameters<typeof supabase.auth.updateUser>[0] = {};
  let emailChanged = false;

  // Build metadata updates
  const metadataUpdates: Record<string, any> = {};
  if (name !== user.user_metadata?.name) {
    metadataUpdates.name = name;
  }

  if (Object.keys(metadataUpdates).length > 0) {
    updates.data = metadataUpdates;
  }

  // Only include email update if it changed
  if (email !== user.email) {
    updates.email = email;
    emailChanged = true;
  }

  // If nothing changed, still return success
  if (!updates.data && !updates.email) {
    return { success: true, emailChanged: false };
  }

  const { error } = await supabase.auth.updateUser(updates);
  if (error) {
    return { error: error.message };
  }

  revalidatePath("/settings/profile");
  return { success: true, emailChanged };
}
