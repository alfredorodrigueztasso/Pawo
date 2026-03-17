"use server";

import { createClient } from "@/lib/supabase/server";
import { createInvitation } from "@/lib/supabase/queries";
import { sendInvitationEmail } from "@/lib/email";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

export async function updateSpaceAction({
  spaceId,
  name,
  currency,
  cycleStartDay,
}: {
  spaceId: string;
  name: string;
  currency: string;
  cycleStartDay: number;
}) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Not authenticated" };
    }

    // Update space
    const { error } = await supabase
      .from("spaces")
      .update({
        name,
        currency,
        cycle_start_day: cycleStartDay,
      })
      .eq("id", spaceId);

    if (error) {
      return { error: `Failed to update space: ${error.message}` };
    }

    revalidatePath("/spaces");
    revalidatePath(`/spaces/${spaceId}`);

    return { success: true };
  } catch (err) {
    console.error("Update space error:", err);
    return { error: "An unexpected error occurred" };
  }
}

export async function deleteSpaceAction({
  spaceId,
}: {
  spaceId: string;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Delete space (this will cascade to space_members and other related records)
  const { error } = await supabase
    .from("spaces")
    .delete()
    .eq("id", spaceId);

  if (error) {
    return { error: `Failed to delete space: ${error.message}` };
  }

  revalidatePath("/spaces", "layout");
  return { success: true };
}

export async function sendInviteAction(formData: FormData) {
  try {
    const email = formData.get("email") as string;
    const spaceId = formData.get("spaceId") as string;

    if (!email || !spaceId) {
      return { error: "Missing required fields" };
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Not authenticated" };
    }

    // Fetch space details
    const { data: space, error: spaceError } = await supabase
      .from("spaces")
      .select("name")
      .eq("id", spaceId)
      .single();

    if (spaceError || !space) {
      return { error: "Space not found" };
    }

    // Generate invite token
    const token = randomUUID();

    // Create invitation in database (DB has default expires_at)
    const { error: inviteError } = await createInvitation(supabase, {
      space_id: spaceId,
      email,
      token,
    });

    if (inviteError) {
      return { error: `Failed to create invitation: ${inviteError.message || "Unknown error"}` };
    }

    // Build invite link
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const inviteLink = `${appUrl}/invite/${token}`;

    // Attempt to send invitation email (best-effort)
    const senderName = user.user_metadata?.name || user.email?.split("@")[0] || "Someone";
    let emailSent = false;
    try {
      await sendInvitationEmail({
        recipientEmail: email,
        senderName,
        spaceName: space.name,
        invitationToken: token,
      });
      emailSent = true;
    } catch (emailErr) {
      // Email not configured or failed — still return success with link for manual sharing
      console.error("Email send failed (will show invite link to copy):", emailErr);
    }

    return { success: true, emailSent, inviteLink };
  } catch (err) {
    console.error("Send invite error:", err);
    return { error: err instanceof Error ? err.message : "An unexpected error occurred" };
  }
}
