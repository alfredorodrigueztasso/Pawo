"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Field,
  ToggleGroup,
  Alert,
  Modal,
  Stepper,
  useDisclosure,
  useToast,
} from "@orion-ds/react/client";
import { SplitConfigurator } from "@/components/SplitConfigurator";
import { createSpaceAction } from "./actions";
import { getNextCycleDates } from "@/lib/cycle";
import type { CycleType } from "@/lib/cycle";

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
    cycleType: "monthly" as CycleType,
    cycleDurationDays: undefined as number | undefined,
    cycleStartDay: "1",
    cycleStartDate: new Date().toISOString().split("T")[0],
    startDateMode: "today" as "today" | "nextMonday" | "custom",
    splitMode: "manual" as "manual" | "income",
    splitPercentage: 50,
    income: "",
    partnerName: "",
    partnerEmail: "",
  });

  // Calculate cycle preview when cycle config changes
  const getCyclePreview = () => {
    try {
      let startDate = formData.cycleStartDate;

      // Adjust based on startDateMode
      if (formData.startDateMode === "nextMonday") {
        const date = new Date(startDate);
        const day = date.getDay();
        const daysUntilMonday = (1 - day + 7) % 7 || 7;
        date.setDate(date.getDate() + daysUntilMonday);
        startDate = date.toISOString().split("T")[0];
      }

      const cycleDates = getNextCycleDates(formData.cycleType, startDate, {
        cycleDurationDays: formData.cycleDurationDays,
        cycleStartDay: formData.cycleType === "monthly" ? parseInt(formData.cycleStartDay) : undefined,
      });

      return `${cycleDates.start} → ${cycleDates.end}`;
    } catch {
      return "Invalid configuration";
    }
  };

  function handleOpen() {
    setStep(1);
    setError(null);
    const today = new Date().toISOString().split("T")[0];
    setFormData({
      spaceName: "",
      currency: "USD",
      cycleType: "monthly",
      cycleDurationDays: undefined,
      cycleStartDay: "1",
      cycleStartDate: today,
      startDateMode: "today",
      splitMode: "manual",
      splitPercentage: 50,
      income: "",
      partnerName: "",
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
      if (!formData.spaceName || !formData.cycleType) {
        setError("Please fill in all fields");
        return;
      }
      if (formData.cycleType === "custom" && !formData.cycleDurationDays) {
        setError("Please specify cycle duration in days");
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
      // Determine final cycle start date
      let finalStartDate = formData.cycleStartDate;
      if (formData.startDateMode === "nextMonday") {
        const date = new Date(formData.cycleStartDate);
        const day = date.getDay();
        const daysUntilMonday = (1 - day + 7) % 7 || 7;
        date.setDate(date.getDate() + daysUntilMonday);
        finalStartDate = date.toISOString().split("T")[0];
      }

      startTransition(async () => {
        const result = await createSpaceAction({
          name: formData.spaceName,
          currency: formData.currency,
          cycle_type: formData.cycleType,
          cycle_duration_days: formData.cycleDurationDays,
          cycle_start_day: formData.cycleType === "monthly" ? parseInt(formData.cycleStartDay) : null,
          cycle_start_date: finalStartDate,
          split_mode: formData.splitMode,
          split_percentage: formData.splitMode === "manual" ? formData.splitPercentage : undefined,
          income:
            formData.splitMode === "income"
              ? parseFloat(formData.income || "0")
              : null,
          partnerName: formData.partnerName || undefined,
          partnerEmail: formData.partnerEmail || undefined,
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
            <Stepper
              steps={[
                { id: "1", title: "Cycles" },
                { id: "2", title: "Split" },
                { id: "3", title: "Partner" },
              ]}
              currentStep={step - 1}
              size="sm"
              showNumbers={true}
              showCheckmarks={true}
              showConnectors={true}
              clickable={false}
              orientation="horizontal"
              labelPosition="bottom"
            />

            <form className="flex flex-col gap-6">
              {/* Step 1: Cycle configuration */}
              {step === 1 && (
                <>
                  <div>
                    <h2 className="text-2xl font-bold mb-1">Configure your cycles</h2>
                    <p className="text-sm text-secondary">
                      Step 1 of 3: Set up expense tracking periods
                    </p>
                  </div>

                  {/* Space name */}
                  <Field
                    label="Space name"
                    type="text"
                    name="spaceName"
                    value={formData.spaceName}
                    onChange={handleInputChange}
                    placeholder="e.g., Our Home"
                    required
                  />

                  {/* Currency */}
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

                  {/* Cycle cadence */}
                  <div>
                    <label className="text-sm font-medium text-primary mb-2 block">
                      ¿Cada cuánto quieren revisar sus gastos?
                    </label>
                    <ToggleGroup
                      type="single"
                      value={formData.cycleType}
                      onValueChange={(val) =>
                        setFormData((prev) => ({
                          ...prev,
                          cycleType: val as CycleType,
                          cycleDurationDays: val === "custom" ? 7 : undefined,
                        }))
                      }
                      variant="outline"
                      size="md"
                      style={{ width: "100%" }}
                    >
                      <ToggleGroup.Item value="monthly" style={{ flex: 1 }}>Mensual</ToggleGroup.Item>
                      <ToggleGroup.Item value="biweekly" style={{ flex: 1 }}>Quincenal</ToggleGroup.Item>
                      <ToggleGroup.Item value="weekly" style={{ flex: 1 }}>Semanal</ToggleGroup.Item>
                    </ToggleGroup>
                  </div>

                  {/* Custom duration input */}
                  {formData.cycleType === "custom" && (
                    <Field
                      label="Duración del ciclo (mínimo 2 días)"
                      type="number"
                      name="cycleDurationDays"
                      value={formData.cycleDurationDays ?? ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          cycleDurationDays: e.target.value ? parseInt(e.target.value) : undefined,
                        }))
                      }
                      min="2"
                      placeholder="e.g., 10"
                      required
                    />
                  )}

                  {/* Monthly: Day of month */}
                  {formData.cycleType === "monthly" && (
                    <Field
                      label="Día de corte del mes (1-28)"
                      type="number"
                      name="cycleStartDay"
                      min="1"
                      max="28"
                      value={formData.cycleStartDay}
                      onChange={handleInputChange}
                      helperText="Los ciclos correrán desde este día cada mes"
                      required
                    />
                  )}

                  {/* Cycle start date */}
                  <div>
                    <label className="text-sm font-medium text-primary mb-2 block">
                      ¿Cuándo empieza el primer ciclo?
                    </label>
                    <ToggleGroup
                      type="single"
                      value={formData.startDateMode}
                      onValueChange={(val) =>
                        setFormData((prev) => ({
                          ...prev,
                          startDateMode: val as "today" | "nextMonday" | "custom",
                        }))
                      }
                      variant="outline"
                      size="md"
                      style={{ width: "100%" }}
                    >
                      <ToggleGroup.Item value="today" style={{ flex: 1 }}>Hoy</ToggleGroup.Item>
                      <ToggleGroup.Item value="nextMonday" style={{ flex: 1 }}>Próximo lunes</ToggleGroup.Item>
                      <ToggleGroup.Item value="custom" style={{ flex: 1 }}>Elegir fecha</ToggleGroup.Item>
                    </ToggleGroup>
                  </div>

                  {/* Custom date picker */}
                  {formData.startDateMode === "custom" && (
                    <Field
                      label="Fecha de inicio"
                      type="date"
                      name="cycleStartDate"
                      value={formData.cycleStartDate}
                      onChange={handleInputChange}
                      required
                    />
                  )}

                  {/* Cycle preview */}
                  <div className="bg-surface-alt p-4 rounded-lg border border-border">
                    <p className="text-xs text-secondary mb-1">Vista previa del ciclo:</p>
                    <p className="text-sm font-medium text-primary">{getCyclePreview()}</p>
                  </div>
                </>
              )}

              {/* Step 2: Split configuration */}
              {step === 2 && (
                <>
                  <div>
                    <h2 className="text-2xl font-bold mb-1">Choose how to split</h2>
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
                    label="Partner's name (optional)"
                    type="text"
                    name="partnerName"
                    value={formData.partnerName}
                    onChange={handleInputChange}
                    placeholder="e.g., Ana"
                    helperText="Helps calculate shared expenses right away"
                  />

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
                    size="lg"
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
                  size="lg"
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
