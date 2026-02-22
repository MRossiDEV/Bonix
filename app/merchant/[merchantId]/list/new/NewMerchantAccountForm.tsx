"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type FormState = {
  business_name: string;
  email: string;
  contact_name: string;
  phone: string;
  business_category: string;
  address: string;
  short_description: string;
};

const initialState: FormState = {
  business_name: "",
  email: "",
  contact_name: "",
  phone: "",
  business_category: "",
  address: "",
  short_description: "",
};

export function NewMerchantAccountForm({ userId }: Readonly<{ userId: string }>) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialState);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const response = await fetch("/api/merchant/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to create merchant account");
      }

      router.replace(`/merchant/${userId}/list`);
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to create merchant account",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-[#262626] bg-[#1A1A1A] p-6">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-[#A1A1AA]">New merchant account</p>
        <h1 className="mt-2 text-2xl font-semibold">Create a new business</h1>
        <p className="mt-2 text-sm text-[#A1A1AA]">
          Add another business account under your merchant role.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <input
          value={form.business_name}
          onChange={(event) => setForm((prev) => ({ ...prev, business_name: event.target.value }))}
          placeholder="Business name"
          required
          className="rounded-xl border border-[#262626] bg-[#111111] px-3 py-2 text-sm"
        />
        <input
          value={form.email}
          onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          placeholder="Business email"
          required
          className="rounded-xl border border-[#262626] bg-[#111111] px-3 py-2 text-sm"
        />
        <input
          value={form.contact_name}
          onChange={(event) => setForm((prev) => ({ ...prev, contact_name: event.target.value }))}
          placeholder="Contact name"
          required
          className="rounded-xl border border-[#262626] bg-[#111111] px-3 py-2 text-sm"
        />
        <input
          value={form.phone}
          onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
          placeholder="Phone"
          required
          className="rounded-xl border border-[#262626] bg-[#111111] px-3 py-2 text-sm"
        />
        <input
          value={form.business_category}
          onChange={(event) => setForm((prev) => ({ ...prev, business_category: event.target.value }))}
          placeholder="Business category"
          className="rounded-xl border border-[#262626] bg-[#111111] px-3 py-2 text-sm"
        />
        <input
          value={form.address}
          onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
          placeholder="Address"
          className="rounded-xl border border-[#262626] bg-[#111111] px-3 py-2 text-sm"
        />
        <textarea
          value={form.short_description}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, short_description: event.target.value }))
          }
          placeholder="Short description"
          rows={4}
          className="sm:col-span-2 rounded-xl border border-[#262626] bg-[#111111] px-3 py-2 text-sm"
        />
      </div>

      {error ? <p className="text-sm text-[#FCA5A5]">{error}</p> : null}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={busy}
          className="inline-flex rounded-2xl bg-[#FFB547] px-4 py-2 text-sm font-semibold text-[#111111] disabled:opacity-60"
        >
          {busy ? "Creating..." : "Create merchant account"}
        </button>

        <button
          type="button"
          onClick={() => router.push(`/merchant/${userId}/list`)}
          className="inline-flex rounded-2xl border border-[#262626] bg-[#111111] px-4 py-2 text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
