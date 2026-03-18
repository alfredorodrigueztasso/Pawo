"use client";

import { Card, Button, Alert, ToggleGroup, useToast } from "@orion-ds/react/client";
import { useState, useTransition } from "react";
import { SplitConfigurator } from "@/components/SplitConfigurator";
import { updateSplitAction } from "./actions";
import type { SpaceMember } from "@/types";

interface UpdateSplitFormProps {
  spaceId: string;
  currentSplitMode: "manual" | "income";
  ownerMember: SpaceMember;
  partnerMember: SpaceMember | null;
}

export function UpdateSplitForm({
  spaceId,
  currentSplitMode,
  ownerMember,
  partnerMember,
}: UpdateSplitFormProps) {
  const [splitMode, setSplitMode] = useState<"manual" | "income">(currentSplitMode);
  const [splitPercentage, setSplitPercentage] = useState(
    ownerMember.split_percentage ?? 50
  );
  const [applyToCurrent, setApplyToCurrent] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await updateSplitAction({
        spaceId,
        splitMode,
        ownerPercentage: splitMode === "manual" ? splitPercentage : undefined,
        applyToCurrent,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        toast({
          message: "Split settings updated successfully",
        });
      }
    });
  };

  const canSave = partnerMember !== null && !(partnerMember.user_id === null && !partnerMember.is_placeholder);

  return (
    <Card className="p-8">
      <h2 className="text-2xl font-bold mb-6 text-primary">Split Settings</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Split configurator */}
        <SplitConfigurator
          splitMode={splitMode}
          onSplitModeChange={setSplitMode}
          splitPercentage={splitPercentage}
          onSplitPercentageChange={setSplitPercentage}
        />

        {/* Vigencia selector */}
        <div>
          <label className="text-sm font-medium text-primary mb-3 block">
            When should this take effect?
          </label>
          <ToggleGroup
            type="single"
            value={applyToCurrent ? "current" : "next"}
            onValueChange={(val) => setApplyToCurrent(val === "current")}
            variant="outline"
            size="md"
          >
            <ToggleGroup.Item value="current">Current cycle</ToggleGroup.Item>
            <ToggleGroup.Item value="next">Next cycle</ToggleGroup.Item>
          </ToggleGroup>
        </div>

        {applyToCurrent && (
          <Alert variant="warning">
            This will recalculate your current cycle's balance with the new split.
          </Alert>
        )}

        {/* Partner status info */}
        {partnerMember === null && (
          <Alert variant="info">
            Once you invite your partner, they'll see the updated split settings.
          </Alert>
        )}

        {error && (
          <Alert variant="error" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Save button */}
        <Button
          variant="primary"
          type="submit"
          disabled={isPending || !canSave}
          className="w-full"
        >
          {isPending ? "Saving..." : "Save Split Settings"}
        </Button>

        {!canSave && partnerMember === null && (
          <p className="text-xs text-secondary text-center">
            Invite your partner first to update split settings
          </p>
        )}
      </form>
    </Card>
  );
}
