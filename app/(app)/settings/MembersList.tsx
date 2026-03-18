"use client";

import { Card, Badge, Alert } from "@orion-ds/react/client";
import type { SpaceMember } from "@/types";

interface MembersListProps {
  members: SpaceMember[];
  memberEmails: Record<string, string>;
  currentUserId: string;
  spaceId: string;
}

export function MembersList({
  members,
  memberEmails,
  currentUserId,
}: MembersListProps) {
  if (!members || members.length === 0) {
    return (
      <Card className="p-8">
        <h2 className="text-2xl font-bold mb-4">Members</h2>
        <p className="text-secondary">No members found</p>
      </Card>
    );
  }

  return (
    <Card className="p-8">
      <h2 className="text-2xl font-bold mb-6">Members</h2>
      <p className="text-sm text-secondary mb-4">
        Space members and their split percentages
      </p>

      <div className="space-y-3">
        {members.map((member) => {
          const isCurrentUser = member.user_id === currentUserId;
          const email = memberEmails[member.user_id] || "unknown@example.com";

          return (
            <div
              key={member.id}
              className="p-4 bg-surface-subtle rounded-control border border-border-subtle"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium text-primary">
                    {member.name}
                    {isCurrentUser && (
                      <Badge variant="info" className="ml-2">
                        You
                      </Badge>
                    )}
                  </p>
                  <p className="text-sm text-secondary mt-1">{email}</p>
                  {member.role === "owner" && (
                    <p className="text-xs text-tertiary mt-1">Owner</p>
                  )}
                </div>

                <div className="text-right ml-4">
                  <p className="text-sm text-secondary">Split</p>
                  <p className="text-lg font-semibold text-primary">
                    {member.split_percentage || 50}%
                  </p>
                  {member.monthly_income && (
                    <p className="text-xs text-tertiary mt-1">
                      Income: ${member.monthly_income.toFixed(0)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Alert variant="info" className="mt-6">
        <strong>Note:</strong> Currently, Pawo supports space of 2 members. To change members or split percentages,
        contact your partner directly.
      </Alert>
    </Card>
  );
}
