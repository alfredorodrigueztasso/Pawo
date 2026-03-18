"use client";

import { Card, Button, Field, Alert } from "@orion-ds/react/client";
import Link from "next/link";
import { acceptInvitationAction } from "./actions";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface InvitationData {
  spaceName?: string;
  spaceSplitMode?: string;
  error?: string;
}

export default function InvitePage({ params }: { params: { token: string } }) {
  const [invitationData, setInvitationData] = useState<InvitationData>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"view" | "join">("view");
  const [income, setIncome] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);

      // Fetch invitation details
      const result = await supabase
        .from("invitations")
        .select("spaces(name, split_mode)")
        .eq("token", params.token)
        .eq("status", "pending")
        .single();

      if (result.data?.spaces) {
        const space = Array.isArray(result.data.spaces)
          ? result.data.spaces[0]
          : result.data.spaces;
        setInvitationData({
          spaceName: space?.name,
          spaceSplitMode: space?.split_mode,
        });
      } else if (result.error) {
        setInvitationData({ error: "Invalid or expired invitation" });
      }
    };

    checkAuth();
  }, [params.token]);

  async function handleAccept() {
    setError(null);
    setLoading(true);

    const result = await acceptInvitationAction(params.token, {
      income: income ? parseFloat(income) : undefined,
    });

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else if (result?.spaceId) {
      // Success - redirect to the space that was just joined
      window.location.href = `/spaces/${result.spaceId}`;
    } else {
      // Fallback
      window.location.href = "/home";
    }
  }

  if (invitationData.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-subtle p-4">
        <Card className="w-full max-w-md p-8 shadow-lg">
          <div className="space-y-6 text-center">
            <h1 className="text-2xl font-bold text-primary">Invitation expired</h1>
            <p className="text-secondary">{invitationData.error}</p>
            <Link href="/">
              <Button variant="primary" className="w-full">
                Go Home
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-subtle p-4">
      <Card className="w-full max-w-md p-8 shadow-lg">
        {step === "view" ? (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2 text-primary">You're invited!</h1>
              <p className="text-secondary">
                Join to start sharing expenses with your partner
              </p>
            </div>

            {invitationData.spaceName && (
              <div className="bg-surface-layer rounded-control p-6">
                <p className="text-sm text-secondary mb-2">Space</p>
                <p className="text-xl font-semibold text-brand">
                  {invitationData.spaceName}
                </p>
              </div>
            )}

            <div className="space-y-3">
              {isAuthenticated ? (
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => setStep("join")}
                >
                  Accept & Join
                </Button>
              ) : (
                <>
                  <Link href={`/signup?inviteToken=${params.token}`}>
                    <Button variant="primary" className="w-full">
                      Create Account & Join
                    </Button>
                  </Link>
                  <Link href={`/login?inviteToken=${params.token}`}>
                    <Button variant="secondary" className="w-full">
                      I have an account
                    </Button>
                  </Link>
                </>
              )}
            </div>

            <p className="text-xs text-tertiary text-center">
              This invitation expires in 7 days
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-1 text-primary">One more step</h2>
              <p className="text-sm text-secondary">
                {invitationData.spaceSplitMode === "income"
                  ? "Enter your income to calculate your share"
                  : "You're all set!"}
              </p>
            </div>

            {error && <Alert variant="error" dismissible onClose={() => setError(null)}>{error}</Alert>}

            {invitationData.spaceSplitMode === "income" && (
              <Field
                label="Your monthly income"
                type="number"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                placeholder="e.g., 3000"
                required
              />
            )}

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setStep("view")}
                className="flex-1"
                disabled={loading}
              >
                Back
              </Button>
              <Button
                variant="primary"
                onClick={handleAccept}
                className="flex-1"
                disabled={loading}
              >
                {loading ? "Joining..." : "Accept"}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
