import "server-only";
import { createClient } from "@supabase/supabase-js";

// ONLY use in server actions/route handlers for auth.admin.* calls
// Never use for data queries where RLS should apply
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
