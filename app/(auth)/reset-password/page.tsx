"use client";

import { Card, Button, Field, Alert, Container, Spinner } from "@orion-ds/react/client";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogoPawo } from "@/app/components/LogoPawo";

export default function ResetPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError("This password reset link is invalid or has expired.");
        setIsValid(false);
      } else {
        setIsValid(true);
      }
      setIsChecking(false);
    };

    checkSession();
  }, []);

  async function handleSubmit(
    e: React.ChangeEvent<HTMLFormElement> & { preventDefault: () => void }
  ) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password")?.toString();
    const confirmPassword = formData.get("confirmPassword")?.toString();

    // Validation
    if (!password || !confirmPassword) {
      setError("Both fields are required");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    // Success - redirect to households
    router.push("/spaces");
  }

  if (isChecking) {
    return (
      <Container size="sm" className="min-h-screen flex items-center justify-center py-12">
        <div className="w-full" style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-8)" }}>
          {/* Logo */}
          <div className="flex justify-center">
            <LogoPawo height={40} width={150} />
          </div>

          <Card className="w-full text-center">
            <Spinner size="sm" />
            <p className="text-secondary mt-4">Verifying reset link...</p>
          </Card>
        </div>
      </Container>
    );
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
            <h1 className="text-3xl font-bold text-primary mb-2">Create new password</h1>
            <p className="text-secondary text-base">
              Enter your new password below.
            </p>
          </div>

          {/* Alert */}
          {error && <Alert variant="error" dismissible onClose={() => setError(null)}>{error}</Alert>}

          {/* Form */}
          {isValid && !error && (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-6)" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
                <Field
                  label="New Password"
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  required
                />
                <Field
                  label="Confirm Password"
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
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Spinner size="sm" />
                    Updating...
                  </span>
                ) : (
                  "Update Password"
                )}
              </Button>
            </form>
          )}

          {/* Footer */}
          <div className="text-center">
            <p className="text-sm text-secondary">
              <Link
                href="/login"
                className="font-semibold text-brand hover:underline transition"
              >
                Back to sign in
              </Link>
            </p>
          </div>
        </div>
      </Card>
      </div>
    </Container>
  );
}
