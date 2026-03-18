"use client";

import { Card, Button, Field, Select, Alert } from "@orion-ds/react/client";
import { useState } from "react";
import { createSpaceAction } from "./actions";

type Step = 1 | 2 | 3;

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    spaceName: "",
    currency: "ARS",
    cycleStartDay: "1",
    splitMode: "manual" as "manual" | "income",
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
    setLoading(true);

    let isRedirecting = false;

    try {
      if (step === 1) {
        if (!formData.spaceName || !formData.cycleStartDay) {
          setError("Please fill in all fields");
          setLoading(false);
          return;
        }
        setStep(2);
      } else if (step === 2) {
        setStep(3);
      } else if (step === 3) {
        // Create space and send invitation
        const result = await createSpaceAction({
          name: formData.spaceName,
          currency: formData.currency,
          cycle_start_day: parseInt(formData.cycleStartDay),
          split_mode: formData.splitMode,
          income: formData.splitMode === "income" ? parseFloat(formData.income || "0") : null,
          partnerEmail: formData.partnerEmail,
        });

        if (result?.error) {
          setError(result.error);
          setLoading(false);
        } else {
          // Success - redirect to spaces
          isRedirecting = true;
          window.location.href = "/spaces";
        }
      }
    } finally {
      if (!isRedirecting) {
        setLoading(false);
      }
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
                <h2 className="text-2xl font-bold mb-1">Create your space</h2>
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

              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border-2 border-border-subtle rounded-control cursor-pointer hover:border-brand transition"
                  style={{
                    borderColor:
                      formData.splitMode === "manual" ? "var(--text-brand)" : undefined,
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

                <label className="flex items-center gap-3 p-4 border-2 border-border-subtle rounded-control cursor-pointer hover:border-brand transition"
                  style={{
                    borderColor:
                      formData.splitMode === "income" ? "var(--text-brand)" : undefined,
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
                    <p className="font-medium text-primary">Based on income</p>
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
              disabled={loading}
              className="flex-1"
            >
              {loading
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
