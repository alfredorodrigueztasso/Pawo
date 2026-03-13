"use client";

import { Card } from "@orion-ds/react";
import type { HouseholdMember } from "@/types";

interface MembersListProps {
  members: HouseholdMember[];
  memberEmails: Record<string, string>;
  currentUserId: string;
  householdId: string;
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
        <p className="text-gray-600">No members found</p>
      </Card>
    );
  }

  return (
    <Card className="p-8">
      <h2 className="text-2xl font-bold mb-6">Members</h2>
      <p className="text-sm text-gray-600 mb-4">
        Household members and their split percentages
      </p>

      <div className="space-y-3">
        {members.map((member) => {
          const isCurrentUser = member.user_id === currentUserId;
          const email = memberEmails[member.user_id] || "unknown@example.com";

          return (
            <div
              key={member.id}
              className="p-4 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {member.name}
                    {isCurrentUser && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        You
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{email}</p>
                  {member.role === "owner" && (
                    <p className="text-xs text-gray-500 mt-1">Owner</p>
                  )}
                </div>

                <div className="text-right ml-4">
                  <p className="text-sm text-gray-600">Split</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {member.split_percentage || 50}%
                  </p>
                  {member.monthly_income && (
                    <p className="text-xs text-gray-500 mt-1">
                      Income: ${member.monthly_income.toFixed(0)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-900">
          <strong>Note:</strong> Currently, Pawo supports household of 2 members. To change members or split percentages,
          contact your partner directly.
        </p>
      </div>
    </Card>
  );
}
