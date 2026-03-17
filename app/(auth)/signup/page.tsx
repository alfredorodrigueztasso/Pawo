"use client";

import { Card, Button, Field, Alert, Container, Spinner } from "@orion-ds/react/client";
import Link from "next/link";
import { signupAction } from "./actions";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { LogoPawo } from "@/app/components/LogoPawo";
import { createClient } from "@/lib/supabase/client";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
      <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.962L3.964 6.294C4.672 4.167 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

export default function SignupPage() {
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("inviteToken");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleSubmit(e: React.ChangeEvent<HTMLFormElement> & { preventDefault: () => void }) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await signupAction(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    const supabase = createClient();
    const redirectUrl = new URL("/auth/callback", window.location.origin);
    if (inviteToken) {
      redirectUrl.searchParams.set("next", `/invite/${inviteToken}`);
    }
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl.toString(),
      },
    });
  }

  return (
    <Container size="sm" className="min-h-screen flex items-center justify-center py-12">
      <div className="w-full" style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-8)" }}>
        {/* Logo */}
        <div className="flex justify-center">
          <LogoPawo height={40} width={150} />
        </div>

        <Card className="w-full">
        <div className="p-8" style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-6)" }}>
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">Create your account</h1>
            <p className="text-secondary text-base">
              Start managing shared expenses with your partner
            </p>
          </div>

          {/* Alert */}
          {error && <Alert variant="error">{error}</Alert>}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-6)" }}>
            {inviteToken && <input type="hidden" name="inviteToken" value={inviteToken} />}
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
              <Field
                label="Your name"
                type="text"
                name="name"
                placeholder="John Doe"
                required
              />
              <Field
                label="Email"
                type="email"
                name="email"
                placeholder="you@example.com"
                required
              />
              <Field
                label="Password"
                type="password"
                name="password"
                placeholder="At least 8 characters"
                required
              />
              <Field
                label="Confirm password"
                type="password"
                name="confirmPassword"
                placeholder="••••••••"
                required
              />
            </div>

            {/* Submit Button */}
            <Button
              variant="primary"
              type="submit"
              className="w-full"
              disabled={loading || googleLoading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner size="sm" />
                  Creating account...
                </span>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-default" />
            <span className="text-xs text-tertiary">or</span>
            <div className="flex-1 border-t border-default" />
          </div>

          {/* Google Button */}
          <Button
            variant="secondary"
            type="button"
            className="w-full"
            disabled={googleLoading || loading}
            onClick={handleGoogleSignIn}
          >
            {googleLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner size="sm" />
                Redirecting...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <GoogleIcon />
                Continue with Google
              </span>
            )}
          </Button>

          {/* Footer */}
          <div className="text-center">
            <p className="text-sm text-secondary">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-brand hover:underline transition"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </Card>
      </div>
    </Container>
  );
}
