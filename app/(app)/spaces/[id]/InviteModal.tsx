"use client";

import { useState, useTransition } from "react";
import { Button, Field, Alert, Modal, useDisclosure, useToast } from "@orion-ds/react/client";
import { sendInviteAction } from "./actions";

interface InviteModalProps {
  spaceId: string;
  spaceName: string;
}

export function InviteModal({ spaceId, spaceName }: InviteModalProps) {
  const { isOpen, open, close } = useDisclosure();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  function handleClose() {
    close();
    setError(null);
    setInviteLink(null);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setInviteLink(null);

    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        const result = await sendInviteAction(formData);
        if (result?.error) {
          setError(result.error);
        } else if (result?.success) {
          if (result.emailSent) {
            toast({ message: "Invite sent!" });
            handleClose();
            (e.currentTarget as HTMLFormElement).reset();
          } else {
            // Email not configured — show link for manual sharing
            setInviteLink(result.inviteLink);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to send invite");
      }
    });
  }

  function handleCopyLink() {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      toast({ message: "Link copied to clipboard!" });
    }
  }

  return (
    <>
      <Button variant="secondary" onClick={open}>
        Invite Partner
      </Button>

      <Modal open={isOpen} onClose={handleClose} size="sm">
        <Modal.Header>Invite Partner</Modal.Header>
        <Modal.Body>
          {inviteLink ? (
            // Link sharing view (when email is not configured)
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-6)" }}>
              <Alert variant="info" dismissible>
                Share this link directly with your partner:
              </Alert>

              <Field
                label="Invite Link"
                type="text"
                value={inviteLink}
                readOnly
                className="font-mono text-sm"
              />

              <div className="flex gap-3 pt-4">
                <Button
                  variant="secondary"
                  type="button"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Done
                </Button>
                <Button
                  variant="primary"
                  type="button"
                  onClick={handleCopyLink}
                  className="flex-1"
                >
                  Copy Link
                </Button>
              </div>
            </div>
          ) : (
            // Email form view
            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-6)" }}
            >
              <Field
                label="Email"
                type="email"
                name="email"
                placeholder="partner@example.com"
                required
              />

              <input type="hidden" name="spaceId" value={spaceId} />

              {error && <Alert variant="error" dismissible onClose={() => setError(null)}>{error}</Alert>}

              <div className="flex gap-3 pt-4">
                <Button
                  variant="secondary"
                  type="button"
                  onClick={handleClose}
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
                  {isPending ? "Sending..." : "Send Invite"}
                </Button>
              </div>
            </form>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
}
