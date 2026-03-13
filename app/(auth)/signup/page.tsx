"use client";

import { Card, Button, Field, Alert, Container, Spinner } from "@orion-ds/react";
import Link from "next/link";
import { signupAction } from "./actions";
import { useState } from "react";

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

  return (
    <Container size="sm" className="min-h-screen flex items-center justify-center py-12">
      <Card className="w-full">
        <div className="space-y-8">
          {/* Header */}
          <div className="border-b pb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create your account</h1>
            <p className="text-gray-600 text-base">
              Start managing shared expenses with your partner
            </p>
          </div>

          {/* Alert */}
          {error && <Alert variant="error">{error}</Alert>}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-5">
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
              disabled={loading}
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

          {/* Footer */}
          <div className="border-t pt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </Card>
    </Container>
  );
}
