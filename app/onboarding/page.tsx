"use client";

import { Card, Button, Field } from "@orion-ds/react";
import { useState } from "react";
import { createHouseholdAction } from "./actions";

type Step = 1 | 2 | 3;

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    householdName: "",
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

    try {
      if (step === 1) {
        if (!formData.householdName || !formData.cycleStartDay) {
          setError("Please fill in all fields");
          setLoading(false);
          return;
        }
        setStep(2);
      } else if (step === 2) {
        setStep(3);
      } else if (step === 3) {
        // Create household and send invitation
        const result = await createHouseholdAction({
          name: formData.householdName,
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
          // Success - redirect to home
          window.location.href = "/home";
        }
      }
    } finally {
      setLoading(false);
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
                s <= step ? "bg-blue-600" : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Step 1: Household details */}
          {step === 1 && (
            <>
              <div>
                <h2 className="text-2xl font-bold mb-1">Create your household</h2>
                <p className="text-sm text-gray-600">
                  Step 1 of 3: Basic information
                </p>
              </div>

              <Field
                label="Household name"
                type="text"
                name="householdName"
                value={formData.householdName}
                onChange={handleInputChange}
                placeholder="e.g., Our Home"
                required
              />

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Currency
                </label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ARS">ARS (Argentine Peso)</option>
                  <option value="USD">USD (US Dollar)</option>
                  <option value="EUR">EUR (Euro)</option>
                  <option value="CLP">CLP (Chilean Peso)</option>
                  <option value="MXN">MXN (Mexican Peso)</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Cycle starts on day (1-28)
                </label>
                <input
                  type="number"
                  name="cycleStartDay"
                  min="1"
                  max="28"
                  value={formData.cycleStartDay}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Your expense cycles will run from this day each month
                </p>
              </div>
            </>
          )}

          {/* Step 2: Split configuration */}
          {step === 2 && (
            <>
              <div>
                <h2 className="text-2xl font-bold mb-1">How do you split?</h2>
                <p className="text-sm text-gray-600">
                  Step 2 of 3: Division method
                </p>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 transition"
                  style={{
                    borderColor:
                      formData.splitMode === "manual" ? "rgb(37, 99, 235)" : undefined,
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
                    <p className="font-medium">Fixed split</p>
                    <p className="text-sm text-gray-600">
                      50/50, 60/40, or any percentage you choose
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 transition"
                  style={{
                    borderColor:
                      formData.splitMode === "income" ? "rgb(37, 99, 235)" : undefined,
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
                    <p className="font-medium">Based on income</p>
                    <p className="text-sm text-gray-600">
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
                <p className="text-sm text-gray-600">
                  Step 3 of 3: Complete setup
                </p>
              </div>

              <Field
                label="Partner's email"
                type="email"
                name="partnerEmail"
                value={formData.partnerEmail}
                onChange={handleInputChange}
                placeholder="partner@example.com"
                required
              />

              <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                We'll send them an invitation link to join your household
              </p>
            </>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {error}
            </div>
          )}

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
                  ? "Create Household"
                  : "Next"}
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
}
