"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, Field, Alert, Modal, ToggleGroup, AlertDialog, Dropdown, useDisclosure, useToast } from "@orion-ds/react/client";
import { updateSpaceAction, deleteSpaceAction } from "./actions";
import type { Space } from "@/types";

interface SpaceOptionsMenuProps {
  space: Space;
}

export function SpaceOptionsMenu({ space }: SpaceOptionsMenuProps) {
  const router = useRouter();
  const { isOpen: isEditOpen, open: onEditOpen, close: onEditClose } = useDisclosure();
  const { isOpen: isDeleteOpen, open: onDeleteOpen, close: onDeleteClose } = useDisclosure();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [editFormData, setEditFormData] = useState({
    name: space.name,
    currency: space.currency,
    cycleStartDay: space.cycle_start_day.toString(),
  });

  function handleEditChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await updateSpaceAction({
        spaceId: space.id,
        name: editFormData.name,
        currency: editFormData.currency,
        cycleStartDay: parseInt(editFormData.cycleStartDay),
      });

      if (result?.error) {
        setError(result.error);
      } else {
        onEditClose();
        router.refresh();
        toast({
          message: "Space updated successfully",
        });
      }
    });
  }

  function handleDeleteConfirm() {
    setError(null);
    startTransition(async () => {
      const result = await deleteSpaceAction({
        spaceId: space.id,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        onDeleteClose();
        router.push("/spaces");
      }
    });
  }

  return (
    <>
      {/* Dropdown Menu */}
      <Dropdown
        placement="bottom-end"
        trigger={
          <button
            className="p-2 hover:bg-surface-subtle rounded-lg transition"
            title="More options"
          >
            <span className="text-2xl font-bold text-secondary">⋮</span>
          </button>
        }
        items={[
          { id: "edit", label: "Edit space", onClick: onEditOpen },
          { id: "delete", label: "Delete space", danger: true, onClick: onDeleteOpen },
        ]}
      />

      {/* Edit Modal */}
      <Modal open={isEditOpen} onClose={onEditClose} size="sm">
        <Modal.Header>Edit Space</Modal.Header>
        <Modal.Body>
          <form
            onSubmit={handleEditSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-6)" }}
          >
            <Field
              label="Space name"
              type="text"
              name="name"
              value={editFormData.name}
              onChange={handleEditChange}
              required
            />

            <div>
              <label className="text-sm font-medium text-primary mb-2 block">
                Currency
              </label>
              <ToggleGroup
                type="single"
                value={editFormData.currency}
                onValueChange={(val) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    currency: val as string,
                  }))
                }
                variant="outline"
                size="md"
              >
                <ToggleGroup.Item value="ARS">ARS</ToggleGroup.Item>
                <ToggleGroup.Item value="USD">USD</ToggleGroup.Item>
                <ToggleGroup.Item value="EUR">EUR</ToggleGroup.Item>
                <ToggleGroup.Item value="CLP">CLP</ToggleGroup.Item>
                <ToggleGroup.Item value="MXN">MXN</ToggleGroup.Item>
              </ToggleGroup>
            </div>

            <Field
              label="Cycle starts on day (1-28)"
              type="number"
              name="cycleStartDay"
              min="1"
              max="28"
              value={editFormData.cycleStartDay}
              onChange={handleEditChange}
              required
            />

            {error && <Alert variant="error">{error}</Alert>}

            <div className="flex gap-3 pt-4">
              <Button
                variant="secondary"
                type="button"
                onClick={onEditClose}
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
                {isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onClose={onDeleteClose}>
        <AlertDialog.Icon variant="danger" />
        <AlertDialog.Title>Delete Space</AlertDialog.Title>
        <AlertDialog.Description>
          This action cannot be undone. All expenses and members will be permanently deleted.
        </AlertDialog.Description>
        {error && <Alert variant="error">{error}</Alert>}
        <AlertDialog.Actions>
          <Button variant="secondary" onClick={onDeleteClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm} disabled={isPending}>
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </AlertDialog.Actions>
      </AlertDialog>
    </>
  );
}
