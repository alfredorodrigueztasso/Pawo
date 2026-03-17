"use client";

import { Card, Button, Field, Alert, Textarea } from "@orion-ds/react/client";
import { useState } from "react";
import { requestReviewAction, respondToReviewAction } from "./actions";
import { formatCurrency } from "@/lib/currency";
import type { Review } from "@/types";

interface ReviewPanelProps {
  expenseId: string;
  paidByName: string;
  currentReview: Review | null;
  canRespond: boolean;
  canRequestReview: boolean;
  currentUserId: string;
  currency: string;
}

export function ReviewPanel({
  expenseId,
  paidByName,
  currentReview,
  canRespond,
  canRequestReview,
  currentUserId,
  currency,
}: ReviewPanelProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [question, setQuestion] = useState("");
  const [suggestedAmount, setSuggestedAmount] = useState("");
  const [response, setResponse] = useState("");

  const handleRequestReview = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await requestReviewAction({
      expenseId,
      question,
      suggestedAmount: suggestedAmount ? parseFloat(suggestedAmount) : undefined,
    });

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setQuestion("");
      setSuggestedAmount("");
      setShowForm(false);
      window.location.reload();
    }
  };

  const handleRespondToReview = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentReview) return;

    setError(null);
    setLoading(true);

    const result = await respondToReviewAction({
      reviewId: currentReview.id,
      response,
    });

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setResponse("");
      window.location.reload();
    }
  };

  // No review exists - show request review form
  if (canRequestReview && !currentReview) {
    return (
      <Card className="p-8">
        <div className="space-y-4">
          <h3 className="text-lg font-bold">Request a review</h3>
          <p className="text-sm text-secondary">
            Ask {paidByName} a question about this expense
          </p>

          {!showForm ? (
            <Button variant="primary" onClick={() => setShowForm(true)}>
              Ask a Question
            </Button>
          ) : (
            <form onSubmit={handleRequestReview} className="space-y-4">
              <Textarea
                label="Your question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g., Can you confirm this amount?"
                rows={3}
                required
              />

              <Field
                label="Suggested amount (optional)"
                type="number"
                value={suggestedAmount}
                onChange={(e) => setSuggestedAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
              />

              {error && <Alert variant="error">{error}</Alert>}

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setQuestion("");
                    setSuggestedAmount("");
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={loading || !question}
                  className="flex-1"
                >
                  {loading ? "Sending..." : "Send Review"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </Card>
    );
  }

  // Review exists and current user can respond
  if (canRespond && currentReview && currentReview.status === "pending") {
    return (
      <Card className="p-8">
        <div className="space-y-4">
          <h3 className="text-lg font-bold">Respond to review request</h3>

          <div className="bg-surface-layer rounded-lg p-4 space-y-3">
            <div>
              <p className="text-sm text-secondary mb-1">Question from partner</p>
              <p className="text-lg text-primary">{currentReview.question}</p>
            </div>

            {currentReview.suggested_amount && (
              <div className="pt-3 border-t border-border-subtle">
                <p className="text-sm text-secondary mb-1">Suggested amount</p>
                <p className="text-xl font-semibold text-primary">
                  {formatCurrency(currentReview.suggested_amount, currency)}
                </p>
              </div>
            )}
          </div>

          <form onSubmit={handleRespondToReview} className="space-y-4">
            <Textarea
              label="Your response"
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="e.g., Yes, I confirm the amount"
              rows={3}
              required
            />

            {error && <Alert variant="error">{error}</Alert>}

            <div className="flex gap-3">
              <Button variant="secondary" type="button" className="flex-1">
                Dismiss
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={loading || !response}
                className="flex-1"
              >
                {loading ? "Sending..." : "Send Response"}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    );
  }

  // Review is resolved
  if (currentReview && currentReview.status === "resolved") {
    return (
      <Alert variant="success">
        <div className="space-y-3">
          <div>
            <p className="text-sm text-secondary mb-1">Question</p>
            <p className="text-lg text-primary">{currentReview.question}</p>
          </div>

          <div>
            <p className="text-sm text-secondary mb-1">Response</p>
            <p className="text-lg text-primary">{currentReview.response}</p>
          </div>
        </div>
      </Alert>
    );
  }

  return null;
}
