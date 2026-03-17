"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Field,
  Alert,
  Modal,
  Select,
  AlertDialog,
  Dropdown,
  useDisclosure,
  useToast,
} from "@orion-ds/react/client";
import { updateExpenseAction, deleteExpenseAction } from "../home/actions";
import type { Expense, SpaceMember } from "@/types";

interface ExpenseOptionsMenuProps {
  expense: Expense;
  spaceId: string;
  members: SpaceMember[];
  isEditOpen?: boolean;
  onEditOpen?: () => void;
  onEditClose?: () => void;
}

export function ExpenseOptionsMenu({
  expense,
  spaceId,
  members,
  isEditOpen: propIsEditOpen,
  onEditOpen: propOnEditOpen,
  onEditClose: propOnEditClose,
}: ExpenseOptionsMenuProps) {
  const router = useRouter();
  const internal = useDisclosure();

  const isEditOpen = propIsEditOpen ?? internal.isOpen;
  const onEditOpen = propOnEditOpen ?? internal.open;
  const onEditClose = propOnEditClose ?? internal.close;
  const {
    isOpen: isDeleteOpen,
    open: onDeleteOpen,
    close: onDeleteClose,
  } = useDisclosure();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [editFormData, setEditFormData] = useState({
    amount: expense.amount.toString(),
    description: expense.description || "",
    paidBy: expense.paid_by,
  });

  function handleEditChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await updateExpenseAction({
          expenseId: expense.id,
          spaceId,
          amount: parseFloat(editFormData.amount),
          description: editFormData.description,
          paidBy: editFormData.paidBy,
        });
        onEditClose();
        router.refresh();
        toast({ message: "Expense updated successfully" });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update expense");
      }
    });
  }

  function handleDeleteConfirm() {
    setError(null);
    startTransition(async () => {
      try {
        await deleteExpenseAction({
          expenseId: expense.id,
          spaceId,
        });
        onDeleteClose();
        router.refresh();
        toast({ message: "Expense deleted successfully" });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete expense");
      }
    });
  }

  return (
    <>
      {/* Three-dot Menu */}
      <Dropdown
        placement="bottom-end"
        trigger={
          <button
            className="p-2 hover:bg-surface-subtle rounded-lg transition"
            title="More options"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-2xl font-bold text-secondary">⋮</span>
          </button>
        }
        items={[
          { id: "edit", label: "Edit expense", onClick: onEditOpen },
          { id: "delete", label: "Delete expense", danger: true, onClick: onDeleteOpen },
        ]}
      />

      {/* Edit Modal */}
      <Modal open={isEditOpen} onClose={onEditClose} size="sm">
        <Modal.Header>Edit Expense</Modal.Header>
        <Modal.Body>
          <form
            onSubmit={handleEditSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-6)" }}
          >
            <Field
              label="Amount"
              type="number"
              name="amount"
              placeholder="0.00"
              step="0.01"
              min="0"
              value={editFormData.amount}
              onChange={handleEditChange}
              required
            />

            <Select
              label="Who paid?"
              name="paidBy"
              value={editFormData.paidBy}
              onChange={handleEditChange}
              required
              options={members.map((member) => ({
                value: member.user_id,
                label: member.name,
              }))}
            />

            <Field
              label="Description (optional)"
              type="text"
              name="description"
              placeholder="e.g., Groceries, Dinner out"
              value={editFormData.description}
              onChange={handleEditChange}
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
      <AlertDialog
        open={isDeleteOpen}
        onClose={onDeleteClose}
      >
        <AlertDialog.Icon variant="danger" />
        <AlertDialog.Title>Delete Expense</AlertDialog.Title>
        <AlertDialog.Description>
          This action cannot be undone. The expense will be permanently deleted.
        </AlertDialog.Description>
        {error && <Alert variant="error">{error}</Alert>}
        <AlertDialog.Actions>
          <Button variant="secondary" onClick={onDeleteClose}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteConfirm}
            disabled={isPending}
          >
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </AlertDialog.Actions>
      </AlertDialog>
    </>
  );
}
