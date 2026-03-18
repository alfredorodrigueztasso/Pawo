"use server";

import { createClient } from "@/lib/supabase/server";
import { createInvitation, addPlaceholderMember } from "@/lib/supabase/queries";
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
    const partnerName = formData.get("partnerName") as string;
    const email = formData.get("email") as string;
    const spaceId = formData.get("spaceId") as string;

    if (!partnerName || !email || !spaceId) {
      return { error: "Missing required fields" };
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Not authenticated" };
    }

    // Fetch space details and current members
    const { data: space, error: spaceError } = await supabase
      .from("spaces")
      .select("name, space_members(id, user_id, split_percentage)")
      .eq("id", spaceId)
      .single();

    if (spaceError || !space) {
      return { error: "Space not found" };
    }

    // Check if space already has 2 members
    if (space.space_members && space.space_members.length >= 2) {
      return { error: "Space already has 2 members" };
    }

    // Check if placeholder already exists for this space
    const { data: existingPlaceholder } = await supabase
      .from("space_members")
      .select("id")
      .eq("space_id", spaceId)
      .eq("is_placeholder", true)
      .single();

    if (existingPlaceholder) {
      return { error: "A placeholder member already exists for this space" };
    }

    // Fetch owner's split_percentage to calculate the correct placeholder percentage
    const { data: ownerMember } = await supabase
      .from("space_members")
      .select("split_percentage")
      .eq("space_id", spaceId)
      .eq("user_id", user.id)
      .single();

    const ownerSplitPct = ownerMember?.split_percentage ?? 50;
    const placeholderSplitPct = 100 - ownerSplitPct;

    // Generate tokens
    const inviteToken = randomUUID();
    const placeholderId = randomUUID();

    // Create invitation with partner name
    const { error: inviteError } = await createInvitation(supabase, {
      space_id: spaceId,
      email,
      token: inviteToken,
      partner_name: partnerName,
    });

    if (inviteError) {
      return { error: `Failed to create invitation: ${inviteError.message || "Unknown error"}` };
    }

    // Create placeholder member immediately with complementary split percentage
    const { error: placeholderError } = await addPlaceholderMember(supabase, {
      space_id: spaceId,
      placeholder_id: placeholderId,
      name: partnerName,
      invited_email: email,
      split_percentage: placeholderSplitPct,
    });

    if (placeholderError) {
      return { error: `Failed to create placeholder member: ${placeholderError.message || "Unknown error"}` };
    }

    // Build invite link
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const inviteLink = `${appUrl}/invite/${inviteToken}`;

    // Attempt to send invitation email (best-effort)
    const senderName = user.user_metadata?.name || user.email?.split("@")[0] || "Someone";
    let emailSent = false;
    try {
      await sendInvitationEmail({
        recipientEmail: email,
        senderName,
        spaceName: space.name,
        invitationToken: inviteToken,
      });
      emailSent = true;
    } catch (emailErr) {
      // Email not configured or failed — still return success with link for manual sharing
      console.error("Email send failed (will show invite link to copy):", emailErr);
    }

    revalidatePath(`/spaces/${spaceId}`);

    return { success: true, emailSent, inviteLink };
  } catch (err) {
    console.error("Send invite error:", err);
    return { error: err instanceof Error ? err.message : "An unexpected error occurred" };
  }
}
