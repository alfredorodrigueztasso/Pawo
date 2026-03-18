"use client";

import { Card, Button, Field, Alert, Container, Spinner } from "@orion-ds/react/client";
import Link from "next/link";
import { forgotPasswordAction } from "./actions";
import { useState } from "react";
import { LogoPawo } from "@/app/components/LogoPawo";

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    e: React.ChangeEvent<HTMLFormElement> & { preventDefault: () => void }
  ) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await forgotPasswordAction(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else if (result?.success) {
      setSuccess(true);
      setLoading(false);
      (e.currentTarget as HTMLFormElement).reset();
    }
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
            <h1 className="text-3xl font-bold text-primary mb-2">Reset your password</h1>
            <p className="text-secondary text-base">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {/* Alert */}
          {error && <Alert variant="error" dismissible onClose={() => setError(null)}>{error}</Alert>}
          {success && (
            <Alert variant="success" dismissible onClose={() => setSuccess(false)}>
              Check your email for a password reset link. The link expires in 1 hour.
            </Alert>
          )}

          {/* Form */}
          {!success && (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-6)" }}>
              <Field
                label="Email"
                type="email"
                name="email"
                placeholder="you@example.com"
                required
              />

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
                    Sending...
                  </span>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </form>
          )}

          {/* Footer */}
          <div className="text-center">
            <p className="text-sm text-secondary">
              Remember your password?{" "}
              <Link
                href="/login"
                className="font-semibold text-brand hover:underline transition"
              >
                Sign in instead
              </Link>
            </p>
          </div>
        </div>
      </Card>
      </div>
    </Container>
  );
}
