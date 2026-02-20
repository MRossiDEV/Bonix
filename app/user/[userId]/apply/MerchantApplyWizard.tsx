"use client";

import { useMemo, useState } from "react";

type MerchantApplyWizardProps = {
  userId: string;
  defaultEmail: string;
  existingStatus: string | null;
};

type FormState = {
  businessName: string;
  businessCategory: string;
  locations: string;
  contactName: string;
  phone: string;
  email: string;
  shortDescription: string;
  acceptTerms: boolean;
};

const steps = ["Business", "Locations", "Contact", "About", "Terms"] as const;

export default function MerchantApplyWizard({
  userId,
  defaultEmail,
  existingStatus,
}: MerchantApplyWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formState, setFormState] = useState<FormState>({
    businessName: "",
    businessCategory: "",
    locations: "",
    contactName: "",
    phone: "",
    email: defaultEmail,
    shortDescription: "",
    acceptTerms: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const canProceed = useMemo(() => {
    if (currentStep === 0) {
      return (
        formState.businessName.trim().length > 0 &&
        formState.businessCategory.trim().length > 0
      );
    }
    if (currentStep === 1) {
      return formState.locations.trim().length > 0;
    }
    if (currentStep === 2) {
      return (
        formState.contactName.trim().length > 0 &&
        formState.phone.trim().length > 0 &&
        formState.email.trim().length > 0
      );
    }
    if (currentStep === 3) {
      return formState.shortDescription.trim().length > 0;
    }
    if (currentStep === 4) {
      return formState.acceptTerms;
    }
    return true;
  }, [currentStep, formState]);

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
      const response = await fetch("/api/merchant/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          email: formState.email.trim(),
          businessName: formState.businessName.trim(),
          businessCategory: formState.businessCategory.trim(),
          locations: formState.locations
            .split("\n")
            .map((location) => location.trim())
            .filter(Boolean),
          contactName: formState.contactName.trim(),
          phone: formState.phone.trim(),
          shortDescription: formState.shortDescription.trim(),
          acceptTerms: formState.acceptTerms,
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
            Merchant onboarding
          </p>
          <h1 className="mt-2 text-2xl font-semibold">Apply as a merchant</h1>
          <p className="mt-2 text-sm text-[#9CA3AF]">
            Share your business details to unlock merchant tools and promos.
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
              Business name
              <input
                type="text"
                value={formState.businessName}
                onChange={(event) =>
                  updateField("businessName", event.target.value)
                }
                className="rounded-2xl border border-[#2A2A2A] bg-[#121212] px-4 py-3 text-sm text-[#FAFAFA]"
                placeholder="Your storefront name"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              Business category
              <input
                type="text"
                value={formState.businessCategory}
                onChange={(event) =>
                  updateField("businessCategory", event.target.value)
                }
                className="rounded-2xl border border-[#2A2A2A] bg-[#121212] px-4 py-3 text-sm text-[#FAFAFA]"
                placeholder="Restaurant, salon, retail, cafe"
                list="merchant-category"
              />
              <datalist id="merchant-category">
                <option value="Restaurant" />
                <option value="Cafe" />
                <option value="Retail" />
                <option value="Salon" />
                <option value="Fitness" />
                <option value="Wellness" />
              </datalist>
            </label>
          </div>
        ) : null}

        {currentStep === 1 ? (
          <div className="space-y-4">
            <label className="flex flex-col gap-2 text-sm">
              Location(s)
              <textarea
                value={formState.locations}
                onChange={(event) => updateField("locations", event.target.value)}
                className="rounded-2xl border border-[#2A2A2A] bg-[#121212] px-4 py-3 text-sm text-[#FAFAFA]"
                placeholder="One location per line"
                rows={4}
              />
            </label>
          </div>
        ) : null}

        {currentStep === 2 ? (
          <div className="space-y-4">
            <label className="flex flex-col gap-2 text-sm">
              Primary contact
              <input
                type="text"
                value={formState.contactName}
                onChange={(event) =>
                  updateField("contactName", event.target.value)
                }
                className="rounded-2xl border border-[#2A2A2A] bg-[#121212] px-4 py-3 text-sm text-[#FAFAFA]"
                placeholder="Contact person"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              Business email
              <input
                type="email"
                value={formState.email}
                onChange={(event) => updateField("email", event.target.value)}
                className="rounded-2xl border border-[#2A2A2A] bg-[#121212] px-4 py-3 text-sm text-[#FAFAFA]"
                placeholder="business@email.com"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              Phone
              <input
                type="tel"
                value={formState.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                className="rounded-2xl border border-[#2A2A2A] bg-[#121212] px-4 py-3 text-sm text-[#FAFAFA]"
                placeholder="+1 555 0100"
              />
            </label>
          </div>
        ) : null}

        {currentStep === 3 ? (
          <div className="space-y-4">
            <label className="flex flex-col gap-2 text-sm">
              Short description
              <textarea
                value={formState.shortDescription}
                onChange={(event) =>
                  updateField("shortDescription", event.target.value)
                }
                className="rounded-2xl border border-[#2A2A2A] bg-[#121212] px-4 py-3 text-sm text-[#FAFAFA]"
                placeholder="Tell customers what you offer"
                rows={4}
              />
            </label>
          </div>
        ) : null}

        {currentStep === 4 ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-[#2A2A2A] bg-[#121212] p-4 text-sm text-[#9CA3AF]">
              <p className="text-xs uppercase tracking-[0.3em] text-[#9CA3AF]">
                Review
              </p>
              <div className="mt-3 space-y-2">
                <p>
                  <span className="text-[#FAFAFA]">Business:</span>{" "}
                  {formState.businessName || "-"}
                </p>
                <p>
                  <span className="text-[#FAFAFA]">Category:</span>{" "}
                  {formState.businessCategory || "-"}
                </p>
                <p>
                  <span className="text-[#FAFAFA]">Locations:</span>{" "}
                  {formState.locations
                    ? formState.locations
                        .split("\n")
                        .map((location) => location.trim())
                        .filter(Boolean)
                        .join(", ")
                    : "-"}
                </p>
                <p>
                  <span className="text-[#FAFAFA]">Contact:</span>{" "}
                  {formState.contactName || "-"}
                </p>
                <p>
                  <span className="text-[#FAFAFA]">Email:</span>{" "}
                  {formState.email || "-"}
                </p>
                <p>
                  <span className="text-[#FAFAFA]">Phone:</span>{" "}
                  {formState.phone || "-"}
                </p>
                <p>
                  <span className="text-[#FAFAFA]">Description:</span>{" "}
                  {formState.shortDescription || "-"}
                </p>
              </div>
            </div>
            <label className="flex items-start gap-3 rounded-2xl border border-[#2A2A2A] bg-[#121212] px-4 py-3 text-sm">
              <input
                type="checkbox"
                checked={formState.acceptTerms}
                onChange={(event) =>
                  updateField("acceptTerms", event.target.checked)
                }
                className="mt-1 h-4 w-4 rounded border border-[#2A2A2A]"
              />
              <span className="text-[#9CA3AF]">
                I agree to the merchant terms and confirm the information is
                accurate.
              </span>
            </label>
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
