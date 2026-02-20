"use client";

import { useMemo, useState } from "react";

type AgentApplyWizardProps = {
  userId: string;
  defaultEmail: string;
  existingStatus: string | null;
};

type FormState = {
  region: string;
  experience: string;
  channels: string;
};

const steps = ["Territory", "Experience", "Channels"] as const;

export default function AgentApplyWizard({
  userId,
  defaultEmail,
  existingStatus,
}: AgentApplyWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formState, setFormState] = useState<FormState>({
    region: "",
    experience: "",
    channels: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const canProceed = useMemo(() => {
    if (currentStep === 0) {
      return formState.region.trim().length > 0;
    }
    return true;
  }, [currentStep, formState.region]);

  const updateField = <K extends keyof FormState>(
    key: K,
    value: FormState[K]
  ) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/agent/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          email: defaultEmail,
          region: formState.region.trim(),
          experience: formState.experience.trim() || null,
          channels: formState.channels
            .split("\n")
            .map((channel) => channel.trim())
            .filter(Boolean),
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(payload?.error ?? "Application failed");
      }

      setSuccess(
        existingStatus === "REJECTED"
          ? "Application resubmitted. We will review it shortly."
          : "Application submitted. We will review it shortly."
      );
      setCurrentStep(steps.length - 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Application failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="rounded-3xl border border-[#2A2A2A] bg-[#1E1E1E] p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[#9CA3AF]">
            Agent onboarding
          </p>
          <h1 className="mt-2 text-2xl font-semibold">Become a Bonix agent</h1>
          <p className="mt-2 text-sm text-[#9CA3AF]">
            Tell us about your territory and promotion channels.
          </p>
        </div>
        <div className="rounded-full border border-[#2A2A2A] bg-[#121212] px-4 py-2 text-xs text-[#9CA3AF]">
          Step {currentStep + 1} of {steps.length}
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-2xl border border-[#F97316] bg-[#2B1B12] px-4 py-3 text-sm text-[#FDBA74]">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="mt-4 rounded-2xl border border-[#22C55E] bg-[#0F2A1D] px-4 py-3 text-sm text-[#A7F3D0]">
          {success}
        </div>
      ) : null}

      <div className="mt-6 space-y-6">
        {currentStep === 0 ? (
          <div className="space-y-4">
            <label className="flex flex-col gap-2 text-sm">
              Region / territory
              <input
                type="text"
                value={formState.region}
                onChange={(event) => updateField("region", event.target.value)}
                className="rounded-2xl border border-[#2A2A2A] bg-[#121212] px-4 py-3 text-sm text-[#FAFAFA]"
                placeholder="Neighborhood, city, or territory"
              />
            </label>
          </div>
        ) : null}

        {currentStep === 1 ? (
          <div className="space-y-4">
            <label className="flex flex-col gap-2 text-sm">
              Experience (optional)
              <textarea
                value={formState.experience}
                onChange={(event) =>
                  updateField("experience", event.target.value)
                }
                className="rounded-2xl border border-[#2A2A2A] bg-[#121212] px-4 py-3 text-sm text-[#FAFAFA]"
                placeholder="Share any promo, sales, or community experience"
                rows={4}
              />
            </label>
          </div>
        ) : null}

        {currentStep === 2 ? (
          <div className="space-y-4">
            <label className="flex flex-col gap-2 text-sm">
              Social / distribution channels (optional)
              <textarea
                value={formState.channels}
                onChange={(event) => updateField("channels", event.target.value)}
                className="rounded-2xl border border-[#2A2A2A] bg-[#121212] px-4 py-3 text-sm text-[#FAFAFA]"
                placeholder="One per line (Instagram, TikTok, email list, street team)"
                rows={4}
              />
            </label>
            <div className="rounded-2xl border border-[#2A2A2A] bg-[#121212] p-4 text-sm text-[#9CA3AF]">
              <p className="text-xs uppercase tracking-[0.3em] text-[#9CA3AF]">
                Review
              </p>
              <div className="mt-3 space-y-2">
                <p>
                  <span className="text-[#FAFAFA]">Territory:</span>{" "}
                  {formState.region || "-"}
                </p>
                <p>
                  <span className="text-[#FAFAFA]">Experience:</span>{" "}
                  {formState.experience || "-"}
                </p>
                <p>
                  <span className="text-[#FAFAFA]">Channels:</span>{" "}
                  {formState.channels
                    ? formState.channels
                        .split("\n")
                        .map((channel) => channel.trim())
                        .filter(Boolean)
                        .join(", ")
                    : "-"}
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setCurrentStep((step) => Math.max(step - 1, 0))}
          className="rounded-2xl border border-[#2A2A2A] bg-[#121212] px-4 py-2 text-sm"
          disabled={currentStep === 0 || submitting}
        >
          Back
        </button>
        {currentStep < steps.length - 1 ? (
          <button
            type="button"
            onClick={() => setCurrentStep((step) => step + 1)}
            disabled={!canProceed || submitting}
            className="rounded-2xl bg-[#FF7A00] px-4 py-2 text-sm font-semibold text-[#121212] disabled:cursor-not-allowed disabled:opacity-70"
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !canProceed}
            className="rounded-2xl bg-[#FF7A00] px-4 py-2 text-sm font-semibold text-[#121212] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? "Submitting..." : "Submit application"}
          </button>
        )}
      </div>
    </section>
  );
}
