"use client";

import { Card, Button, Field, Select, Alert } from "@orion-ds/react/client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { SplitConfigurator } from "@/components/SplitConfigurator";
import { createSpaceAction } from "./actions";

type Step = 1 | 2 | 3;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    spaceName: "",
    currency: "ARS",
    cycleStartDay: "1",
    splitMode: "manual" as "manual" | "income",
    splitPercentage: 50,
    income: "",
    partnerEmail: "",
  });

  function handleInputChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      // Create space and send invitation
      startTransition(async () => {
        const result = await createSpaceAction({
          name: formData.spaceName,
          currency: formData.currency,
          cycle_start_day: parseInt(formData.cycleStartDay),
          split_mode: formData.splitMode,
          split_percentage: formData.splitMode === "manual" ? formData.splitPercentage : undefined,
          income: formData.splitMode === "income" ? parseFloat(formData.income || "0") : null,
          partnerEmail: formData.partnerEmail,
        });

        if (result?.error) {
          setError(result.error);
        } else {
          // Success - redirect to spaces
          router.push("/spaces");
        }
      });
    }
  }

  function handleBack() {
    if (step > 1) setStep((step - 1) as Step);
  }

  return (
    <Card className="p-8 shadow-lg">
      <div className="space-y-6">
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

        <form onSubmit={handleSubmit} className="space-y-4">
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

              <Select
                label="Currency"
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
              >
                <Select.Option value="ARS">ARS (Argentine Peso)</Select.Option>
                <Select.Option value="USD">USD (US Dollar)</Select.Option>
                <Select.Option value="EUR">EUR (Euro)</Select.Option>
                <Select.Option value="CLP">CLP (Chilean Peso)</Select.Option>
                <Select.Option value="MXN">MXN (Mexican Peso)</Select.Option>
              </Select>

              <Field
                label="Cycle starts on day (1-28)"
                type="number"
                name="cycleStartDay"
                min="1"
                max="28"
                value={formData.cycleStartDay}
                onChange={handleInputChange}
                helperText="Your expense cycles will run from this day each month"
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
                Optional — you can invite your partner later from the space details
              </Alert>
            </>
          )}

          {error && <Alert variant="error" dismissible onClose={() => setError(null)}>{error}</Alert>}

          {/* Buttons */}
          <div className="flex gap-3">
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
    </Card>
  );
}
