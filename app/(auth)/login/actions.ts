"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const inviteToken = formData.get("inviteToken")?.toString();

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // Success - redirect to invite page if token present, otherwise to spaces
  if (inviteToken) {
    redirect(`/invite/${inviteToken}`);
  }
  redirect("/spaces");
}
