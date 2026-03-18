"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Field,
  ToggleGroup,
  Alert,
  Modal,
  useDisclosure,
  useToast,
} from "@orion-ds/react/client";
import { createSpaceAction } from "./actions";

type Step = 1 | 2 | 3;

export function CreateSpaceModal() {
  const router = useRouter();
  const { isOpen, open, close } = useDisclosure();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<Step>(1);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    spaceName: "",
    currency: "ARS",
    cycleStartDay: "1",
    splitMode: "manual" as "manual" | "income",
    income: "",
    partnerEmail: "",
  });

  function handleOpen() {
    setStep(1);
    setError(null);
    setFormData({
      spaceName: "",
      currency: "ARS",
      cycleStartDay: "1",
      splitMode: "manual",
      income: "",
      partnerEmail: "",
    });
    open();
  }

  function handleInputChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleBack() {
    if (step > 1) setStep((step - 1) as Step);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (step === 1) {
      if (!formData.spaceName || !formData.cycleStartDay) {
        setError("Please fill in all fields");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      startTransition(async () => {
        const result = await createSpaceAction({
          name: formData.spaceName,
          currency: formData.currency,
          cycle_start_day: parseInt(formData.cycleStartDay),
          split_mode: formData.splitMode,
          income:
            formData.splitMode === "income"
              ? parseFloat(formData.income || "0")
              : null,
          partnerEmail: formData.partnerEmail,
        });

        if (result?.error) {
          setError(result.error);
        } else {
          close();
          router.refresh();
          toast({ message: "Space created successfully" });
        }
      });
    }
  }

  return (
    <>
      <Button variant="primary" onClick={handleOpen}>
        New Space
      </Button>

      <Modal open={isOpen} onClose={close} size="md">
        <Modal.Header>Create Space</Modal.Header>
        <Modal.Body>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-8)" }}>
            {/* Progress indicator */}
            <div className="flex gap-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-2 flex-1 rounded-full ${
                    s <= step ? "bg-brand" : "bg-surface-subtle"
                  }`}
                />
              ))}
            </div>

            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-6)" }}
            >
              {/* Step 1: Space details */}
              {step === 1 && (
                <>
                  <Field
                    label="Space name"
                    type="text"
                    name="spaceName"
                    value={formData.spaceName}
                    onChange={handleInputChange}
                    placeholder="e.g., Our Home"
                    required
                  />

                  <div>
                    <label className="text-sm font-medium text-primary mb-2 block">
                      Currency
                    </label>
                    <ToggleGroup
                      type="single"
                      value={formData.currency}
                      onValueChange={(val) =>
                        setFormData((prev) => ({
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
                    value={formData.cycleStartDay}
                    onChange={handleInputChange}
                    helperText="Your expense cycles will run from this day each month"
                    required
                  />
                </>
              )}

              {/* Step 2: Split configuration */}
              {step === 2 && (
                <>
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      How do you split?
                    </h3>
                  </div>

                  <div
                    style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}
                  >
                    <label
                      className="flex items-center gap-3 p-4 border-2 border-border-subtle rounded-control cursor-pointer hover:border-brand transition"
                      style={{
                        borderColor:
                          formData.splitMode === "manual"
                            ? "var(--text-brand)"
                            : undefined,
                      }}
                    >
                      <input
                        type="radio"
                        name="splitMode"
                        value="manual"
                        checked={formData.splitMode === "manual"}
                        onChange={handleInputChange}
                        className="w-4 h-4"
                      />
                      <div>
                        <p className="font-medium text-primary">Fixed split</p>
                        <p className="text-sm text-secondary">
                          50/50, 60/40, or any percentage you choose
                        </p>
                      </div>
                    </label>

                    <label
                      className="flex items-center gap-3 p-4 border-2 border-border-subtle rounded-control cursor-pointer hover:border-brand transition"
                      style={{
                        borderColor:
                          formData.splitMode === "income"
                            ? "var(--text-brand)"
                            : undefined,
                      }}
                    >
                      <input
                        type="radio"
                        name="splitMode"
                        value="income"
                        checked={formData.splitMode === "income"}
                        onChange={handleInputChange}
                        className="w-4 h-4"
                      />
                      <div>
                        <p className="font-medium text-primary">
                          Based on income
                        </p>
                        <p className="text-sm text-secondary">
                          Split proportional to monthly earnings
                        </p>
                      </div>
                    </label>
                  </div>

                  {formData.splitMode === "income" && (
                    <Field
                      label="Your monthly income"
                      type="number"
                      name="income"
                      value={formData.income}
                      onChange={handleInputChange}
                      placeholder="e.g., 3000"
                      required
                    />
                  )}
                </>
              )}

              {/* Step 3: Invite partner */}
              {step === 3 && (
                <>
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Invite your partner
                    </h3>
                  </div>

                  <Field
                    label="Partner's email (optional)"
                    type="email"
                    name="partnerEmail"
                    value={formData.partnerEmail}
                    onChange={handleInputChange}
                    placeholder="partner@example.com"
                  />

                  <Alert variant="info" dismissible>
                    Optional — you can invite your partner later from the space
                    details
                  </Alert>
                </>
              )}

              {error && <Alert variant="error" dismissible onClose={() => setError(null)}>{error}</Alert>}

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                {step > 1 && (
                  <Button
                    variant="secondary"
                    onClick={handleBack}
                    type="button"
                    className="flex-1"
                  >
                    Back
                  </Button>
                )}
                <Button
                  variant="primary"
                  type="submit"
                  disabled={isPending}
                  className="flex-1"
                >
                  {isPending
                    ? "Creating..."
                    : step === 3
                      ? "Create Space"
                      : "Next"}
                </Button>
              </div>
            </form>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}
