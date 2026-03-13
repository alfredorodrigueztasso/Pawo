"use client";

import { Card, Button, Field, Alert } from "@orion-ds/react";
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
    <Card className="p-8 shadow-lg">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Create your account</h1>
          <p className="text-gray-600">
            Start managing shared expenses with your partner
          </p>
        </div>

        {error && <Alert variant="error">{error}</Alert>}

        <form onSubmit={handleSubmit} className="space-y-4">
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
          <Button variant="primary" type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </Card>
  );
}
