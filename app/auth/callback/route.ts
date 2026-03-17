import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/spaces";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Auth callback error:", error);
      // Redirect to reset-password anyway, user will see error when trying to update password
      return NextResponse.redirect(new URL(next, request.url));
    }

    // Seed profiles table with OAuth avatar on first sign-in
    if (data?.user) {
      const oauthAvatarUrl = data.user.user_metadata?.avatar_url;

      if (oauthAvatarUrl) {
        // Only insert if no row exists yet (don't overwrite custom uploaded photo)
        const { error: upsertError } = await supabase
          .from("profiles")
          .upsert(
            { id: data.user.id, avatar_url: oauthAvatarUrl },
            { onConflict: "id", ignoreDuplicates: true }
          );

        if (upsertError) {
          console.error("Failed to seed profile with OAuth avatar:", upsertError);
        }
      }
    }
  }

  return NextResponse.redirect(new URL(next, request.url));
}
