import { createClient } from "@/lib/supabase/server";
import { Card } from "@orion-ds/react/client";
import { EditProfileForm } from "./EditProfileForm";
import { getProfile } from "@/lib/supabase/queries";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const name = user.user_metadata?.name || "";
  const email = user.email || "";

  // Avatar priority: custom upload > OAuth provider > no avatar
  const { data: profile } = await getProfile(supabase, user.id);
  const avatarUrl =
    profile?.avatar_url || // 1. custom uploaded avatar
    user.user_metadata?.avatar_url || // 2. OAuth provider avatar (Google, etc)
    ""; // 3. no avatar

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-lg">
        <Card className="p-8">
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-6)" }}>
            <div>
              <h2 className="text-xl font-semibold text-primary mb-2">Edit Profile</h2>
              <p className="text-sm text-secondary">Update your name, email address, and avatar</p>
            </div>

            <EditProfileForm initialName={name} initialEmail={email} initialAvatarUrl={avatarUrl} userId={user.id} />
          </div>
        </Card>
      </div>
    </div>
  );
}
