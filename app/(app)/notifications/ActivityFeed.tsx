"use client";

import { Card } from "@orion-ds/react/client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface ActivityEvent {
  id: string;
  type: "expense_added" | "review_requested" | "review_resolved";
  timestamp: string;
  actor: string;
  description: string;
  link?: string;
}

interface ActivityFeedProps {
  expenses: Array<{
    id: string;
    description: string;
    amount: number;
    paid_by: string;
    created_at: string;
  }>;
  reviews: Array<{
    id: string;
    status: string;
    created_at: string;
    requested_by: string;
    expense_id: string;
  }>;
  memberMap: Map<string, string>;
  currentUserId: string;
  spaceId: string;
}

export function ActivityFeed({
  expenses,
  reviews,
  memberMap,
  currentUserId,
  spaceId,
}: ActivityFeedProps) {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Build initial events from expenses and reviews
  useEffect(() => {
    const buildEvents = () => {
      const eventList: ActivityEvent[] = [];

      // Add expense events
      expenses.forEach((expense) => {
        eventList.push({
          id: `expense-${expense.id}`,
          type: "expense_added",
          timestamp: expense.created_at,
          actor: memberMap.get(expense.paid_by) || "Unknown",
          description: `added expense: ${expense.description}`,
          link: `/expenses/${expense.id}`,
        });
      });

      // Add review events
      reviews.forEach((review) => {
        const reviewType: "review_requested" | "review_resolved" =
          review.status === "pending" ? "review_requested" : "review_resolved";

        eventList.push({
          id: `review-${review.id}`,
          type: reviewType,
          timestamp: review.created_at,
          actor: memberMap.get(review.requested_by) || "Unknown",
          description:
            reviewType === "review_requested"
              ? "requested a review"
              : "resolved a review",
          link: `/expenses/${review.expense_id}`,
        });
      });

      // Sort by timestamp, most recent first
      eventList.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setEvents(eventList);
    };

    buildEvents();

    // Subscribe to real-time changes
    const supabase = createClient();

    // Subscribe to expense changes
    const expenseSub = supabase
      .channel(`space-${spaceId}-expenses`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "expenses",
          filter: `space_id=eq.${spaceId}`,
        },
        (payload) => {
          const newExpense = payload.new as any;
          const newEvent: ActivityEvent = {
            id: `expense-${newExpense.id}`,
            type: "expense_added",
            timestamp: newExpense.created_at,
            actor: memberMap.get(newExpense.paid_by) || "Unknown",
            description: `added expense: ${newExpense.description}`,
            link: `/expenses/${newExpense.id}`,
          };

          setEvents((prev) => [newEvent, ...prev]);
        }
      )
      .subscribe();

    // Subscribe to review changes
    const reviewSub = supabase
      .channel(`space-${spaceId}-reviews`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "reviews",
        },
        (payload) => {
          const newReview = payload.new as any;
          const newEvent: ActivityEvent = {
            id: `review-${newReview.id}`,
            type: "review_requested",
            timestamp: newReview.created_at,
            actor: memberMap.get(newReview.requested_by) || "Unknown",
            description: "requested a review",
            link: `/expenses/${newReview.expense_id}`,
          };

          setEvents((prev) => [newEvent, ...prev]);
        }
      )
      .subscribe();

    setIsSubscribed(true);

    return () => {
      supabase.removeChannel(expenseSub);
      supabase.removeChannel(reviewSub);
    };
  }, [expenses, reviews, memberMap, spaceId]);

  if (events.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-secondary mb-4">No activity yet</p>
        <p className="text-sm text-tertiary">
          You'll see updates here when your partner adds expenses or makes changes
        </p>
      </Card>
    );
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case "expense_added":
        return "💸";
      case "review_requested":
        return "❓";
      case "review_resolved":
        return "✅";
      default:
        return "📝";
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case "expense_added":
        return "border-l-4 border-brand bg-surface-subtle";
      case "review_requested":
        return "border-l-4 border-amber-500 bg-surface-subtle";
      case "review_resolved":
        return "border-l-4 border-green-500 bg-surface-subtle";
      default:
        return "border-l-4 border-border-subtle bg-surface-subtle";
    }
  };

  return (
    <div className="space-y-3">
      {events.map((event) => {
        const timestamp = new Date(event.timestamp);
        const isToday = new Date().toDateString() === timestamp.toDateString();
        const timeStr = isToday
          ? timestamp.toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            })
          : timestamp.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });

        return (
          <Link key={event.id} href={event.link || "#"}>
            <Card className={`p-4 cursor-pointer hover:shadow-md transition ${getEventColor(event.type)}`}>
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">
                  {getEventIcon(event.type)}
                </span>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-primary">
                    {event.actor}{" "}
                    <span className="font-normal text-secondary">
                      {event.description}
                    </span>
                  </p>
                  <p className="text-xs text-tertiary mt-1">{timeStr}</p>
                </div>

                <span className="text-xs text-tertiary flex-shrink-0">
                  →
                </span>
              </div>
            </Card>
          </Link>
        );
      })}

      {isSubscribed && (
        <div className="text-xs text-brand text-center mt-4">
          ✓ Real-time updates enabled
        </div>
      )}
    </div>
  );
}
