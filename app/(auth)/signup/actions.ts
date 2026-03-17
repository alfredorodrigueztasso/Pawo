"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signupAction(formData: FormData) {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const name = formData.get("name")?.toString();
  const confirmPassword = formData.get("confirmPassword")?.toString();
  const inviteToken = formData.get("inviteToken")?.toString();

  if (!email || !password || !name || !confirmPassword) {
    return { error: "All fields are required" };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match" };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters" };
  }

  const supabase = await createClient();

  const { error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
    },
  });

  if (authError) {
    return { error: authError.message };
  }

  // Success - redirect to invite page if token present, otherwise to home
  if (inviteToken) {
    redirect(`/invite/${inviteToken}`);
  }
  redirect("/home");
}
