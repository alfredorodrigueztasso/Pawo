"use client";

import { Card, Button } from "@orion-ds/react";
import { useState } from "react";
import { requestReviewAction, respondToReviewAction } from "./actions";
import type { Review } from "@/types";

interface ReviewPanelProps {
  expenseId: string;
  paidByName: string;
  currentReview: Review | null;
  canRespond: boolean;
  canRequestReview: boolean;
  currentUserId: string;
}

export function ReviewPanel({
  expenseId,
  paidByName,
  currentReview,
  canRespond,
  canRequestReview,
  currentUserId,
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
      <Card className="p-8 border-2 border-blue-200 bg-blue-50">
        <div className="space-y-4">
          <h3 className="text-lg font-bold">Request a review</h3>
          <p className="text-sm text-gray-600">
            Ask {paidByName} a question about this expense
          </p>

          {!showForm ? (
            <Button variant="primary" onClick={() => setShowForm(true)}>
              Ask a Question
            </Button>
          ) : (
            <form onSubmit={handleRequestReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Your question
                </label>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g., Can you confirm this amount?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Suggested amount (optional)
                </label>
                <input
                  type="number"
                  value={suggestedAmount}
                  onChange={(e) => setSuggestedAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

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
      <Card className="p-8 border-2 border-amber-200 bg-amber-50">
        <div className="space-y-4">
          <h3 className="text-lg font-bold">Respond to review request</h3>

          <div className="bg-white rounded-lg p-4 space-y-3">
            <div>
              <p className="text-sm text-gray-600 mb-1">Question from partner</p>
              <p className="text-lg">{currentReview.question}</p>
            </div>

            {currentReview.suggested_amount && (
              <div className="pt-3 border-t">
                <p className="text-sm text-gray-600 mb-1">Suggested amount</p>
                <p className="text-xl font-semibold">
                  ${currentReview.suggested_amount.toFixed(2)}
                </p>
              </div>
            )}
          </div>

          <form onSubmit={handleRespondToReview} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Your response
              </label>
              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="e.g., Yes, I confirm the amount"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                {error}
              </div>
            )}

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
      <Card className="p-8 bg-green-50 border-2 border-green-200">
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-green-900">Review resolved</h3>

          <div className="space-y-3">
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Question</p>
              <p className="text-lg">{currentReview.question}</p>
            </div>

            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Response</p>
              <p className="text-lg">{currentReview.response}</p>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return null;
}
