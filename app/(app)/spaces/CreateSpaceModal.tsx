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
import { SplitConfigurator } from "@/components/SplitConfigurator";
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
    currency: "USD",
    cycleStartDay: "1",
    splitMode: "manual" as "manual" | "income",
    splitPercentage: 50,
    income: "",
    partnerEmail: "",
  });

  function handleOpen() {
    setStep(1);
    setError(null);
    setFormData({
      spaceName: "",
      currency: "USD",
      cycleStartDay: "1",
      splitMode: "manual",
      splitPercentage: 50,
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
      if (formData.splitMode === "manual" && (formData.splitPercentage < 10 || formData.splitPercentage > 90)) {
        setError("Split percentage must be between 10% and 90%");
        return;
      }
      if (formData.splitMode === "income" && !formData.income) {
        setError("Please enter your monthly income");
        return;
      }
      setStep(3);
    } else if (step === 3) {
      startTransition(async () => {
        const result = await createSpaceAction({
          name: formData.spaceName,
          currency: formData.currency,
          cycle_start_day: parseInt(formData.cycleStartDay),
          split_mode: formData.splitMode,
          split_percentage: formData.splitMode === "manual" ? formData.splitPercentage : undefined,
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
          <div className="flex flex-col gap-8">
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

            <form className="flex flex-col gap-6">
              {/* Step 1: Space details */}
              {step === 1 && (
                <>
                  <div>
                    <h2 className="text-2xl font-bold mb-1">What's your space?</h2>
                    <p className="text-sm text-secondary">
                      Step 1 of 3: Basic information
                    </p>
                  </div>

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
                      style={{ width: "100%" }}
                    >
                      <ToggleGroup.Item value="USD" style={{ flex: 1 }}>USD</ToggleGroup.Item>
                      <ToggleGroup.Item value="EUR" style={{ flex: 1 }}>EUR</ToggleGroup.Item>
                      <ToggleGroup.Item value="CLP" style={{ flex: 1 }}>CLP</ToggleGroup.Item>
                      <ToggleGroup.Item value="MXN" style={{ flex: 1 }}>MXN</ToggleGroup.Item>
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
                    <h2 className="text-2xl font-bold mb-1">How do you split?</h2>
                    <p className="text-sm text-secondary">
                      Step 2 of 3: Division method
                    </p>
                  </div>

                  <SplitConfigurator
                    splitMode={formData.splitMode}
                    onSplitModeChange={(mode) =>
                      setFormData((prev) => ({ ...prev, splitMode: mode }))
                    }
                    splitPercentage={formData.splitPercentage}
                    onSplitPercentageChange={(value) =>
                      setFormData((prev) => ({ ...prev, splitPercentage: value }))
                    }
                  />

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
                    <h2 className="text-2xl font-bold mb-1">Invite your partner</h2>
                    <p className="text-sm text-secondary">
                      Step 3 of 3: Complete setup
                    </p>
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
                  onClick={handleSubmit}
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
