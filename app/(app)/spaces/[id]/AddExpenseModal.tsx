"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, Field, Alert, Modal, Select, useDisclosure, useToast } from "@orion-ds/react/client";
import { addExpenseAction } from "../../home/actions";
import type { SpaceMember } from "@/types";

function getMemberValue(member: SpaceMember): string {
  return member.user_id ?? member.placeholder_id ?? member.id;
}

interface AddExpenseModalProps {
  spaceId: string;
  cycleId: string;
  members: SpaceMember[];
  currentUserId: string;
}

export function AddExpenseModal({
  spaceId,
  cycleId,
  members,
  currentUserId,
}: AddExpenseModalProps) {
  const router = useRouter();
  const { isOpen, open, close } = useDisclosure();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await addExpenseAction(formData);
        close();
        router.refresh();
        toast({ message: "Expense added successfully" });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add expense");
      }
    });
  }

  return (
    <>
      <Button variant="primary" onClick={open}>
        Add Expense
      </Button>

      <Modal open={isOpen} onClose={close} size="sm">
        <Modal.Header>Add Expense</Modal.Header>
        <Modal.Body>
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-6)" }}
          >
            <Field
              label="Amount"
              type="number"
              name="amount"
              placeholder="0.00"
              step="0.01"
              min="0"
              required
            />

            <Select
              label="Who paid?"
              name="paidBy"
              required
              options={[
                { value: "", label: "Select a member" },
                { value: "me", label: "Me" },
                ...members
                  .filter((m) => (m.user_id ?? m.placeholder_id) !== currentUserId)
                  .map((member) => ({
                    value: getMemberValue(member),
                    label: member.is_placeholder ? `${member.name} (pending)` : member.name,
                  })),
              ]}
            />

            <Field
              label="Description (optional)"
              type="text"
              name="description"
              placeholder="e.g., Groceries, Dinner out"
            />

            <input type="hidden" name="spaceId" value={spaceId} />
            <input type="hidden" name="cycleId" value={cycleId} />

            {error && <Alert variant="error" dismissible onClose={() => setError(null)}>{error}</Alert>}

            <div className="flex gap-3 pt-4">
              <Button
                variant="secondary"
                type="button"
                onClick={close}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={isPending}
                className="flex-1"
              >
                {isPending ? "Adding..." : "Add"}
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </>
  );
}
