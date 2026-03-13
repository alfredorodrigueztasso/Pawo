"use client";

import { Card, Button, Field, Alert } from "@orion-ds/react";
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
    <Card className="p-8 shadow-lg">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
          <p className="text-gray-600">Sign in to manage your shared expenses</p>
        </div>

        {error && <Alert variant="error">{error}</Alert>}

        <form onSubmit={handleSubmit} className="space-y-4">
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
          <Button variant="primary" type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link href="/signup" className="font-semibold text-blue-600 hover:text-blue-700">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </Card>
  );
}
