"use client";

import { Card, Button, Field } from "@orion-ds/react";
import Link from "next/link";
import { acceptInvitationAction } from "./actions";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface InvitationData {
  householdName?: string;
  householdSplitMode?: string;
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
        .select("households(name, split_mode)")
        .eq("token", params.token)
        .eq("status", "pending")
        .single();

      if (result.data?.households) {
        const household = Array.isArray(result.data.households)
          ? result.data.households[0]
          : result.data.households;
        setInvitationData({
          householdName: household?.name,
          householdSplitMode: household?.split_mode,
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
    } else {
      // Success - redirect to home
      window.location.href = "/home";
    }
  }

  if (invitationData.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md p-8 shadow-lg">
          <div className="space-y-6 text-center">
            <h1 className="text-2xl font-bold">Invitation expired</h1>
            <p className="text-gray-600">{invitationData.error}</p>
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md p-8 shadow-lg">
        {step === "view" ? (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2">You're invited!</h1>
              <p className="text-gray-600">
                Join to start sharing expenses with your partner
              </p>
            </div>

            {invitationData.householdName && (
              <div className="bg-blue-50 rounded-lg p-6">
                <p className="text-sm text-gray-600 mb-2">Household</p>
                <p className="text-xl font-semibold text-blue-600">
                  {invitationData.householdName}
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

            <p className="text-xs text-gray-500 text-center">
              This invitation expires in 7 days
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-1">One more step</h2>
              <p className="text-sm text-gray-600">
                {invitationData.householdSplitMode === "income"
                  ? "Enter your income to calculate your share"
                  : "You're all set!"}
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {invitationData.householdSplitMode === "income" && (
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
