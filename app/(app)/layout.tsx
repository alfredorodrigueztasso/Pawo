import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ToastProvider } from "@orion-ds/react/client";
import { AppHeader } from "./AppHeader";
import { getProfile } from "@/lib/supabase/queries";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const displayName = user.user_metadata?.name || user.email?.split("@")[0] || "User";
  const initials = displayName
    .split(" ")
    .map((word: string) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const theme = (user.user_metadata?.theme as "light" | "dark") ?? "light";

  // Avatar priority: custom upload > OAuth provider > initials
  const { data: profile } = await getProfile(supabase, user.id);
  const avatarUrl =
    profile?.avatar_url || // 1. custom uploaded avatar
    user.user_metadata?.avatar_url || // 2. OAuth provider avatar (Google, etc)
    ""; // 3. no avatar -> Orion will show initials

  return (
    <ToastProvider>
      <div className="flex flex-col min-h-screen">
        <AppHeader
          user={{
            name: displayName,
            email: user.email || "no-email",
            initials,
            avatar: avatarUrl,
          }}
          theme={theme}
        />

        <main className="flex-1 bg-surface-subtle">
          <div className="max-w-6xl mx-auto px-8" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
            {children}
          </div>
        </main>
      </div>
    </ToastProvider>
  );
}
