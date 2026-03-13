"use client";

import { Card, Button, Field, Alert, Container, Spinner } from "@orion-ds/react";
import Link from "next/link";
import { loginAction } from "./actions";
import { useState } from "react";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.ChangeEvent<HTMLFormElement> & { preventDefault: () => void }) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await loginAction(formData);

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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h1>
            <p className="text-gray-600 text-base">
              Sign in to manage your shared expenses
            </p>
          </div>

          {/* Alert */}
          {error && <Alert variant="error">{error}</Alert>}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-5">
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
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="border-t pt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>
      </Card>
    </Container>
  );
}
