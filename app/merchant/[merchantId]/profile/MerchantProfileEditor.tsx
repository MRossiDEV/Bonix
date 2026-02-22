"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type MerchantProfileEditorProps = {
  merchant: {
    id: string;
    status: string;
    business_name: string | null;
    email: string | null;
    business_category: string | null;
    contact_name: string | null;
    phone: string | null;
    locations: string[] | null;
    address: string | null;
    short_description: string | null;
  };
};

type FormState = {
  business_name: string;
  email: string;
  business_category: string;
  contact_name: string;
  phone: string;
  address: string;
  locations: string;
  short_description: string;
};

function normalizeLocationsInput(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed) as unknown;
        if (Array.isArray(parsed)) {
          return parsed
            .filter((item): item is string => typeof item === "string")
            .map((item) => item.trim())
            .filter(Boolean);
        }
      } catch {
      }
    }

    return value
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function createFormState(
  merchant: MerchantProfileEditorProps["merchant"],
): FormState {
  const normalizedLocations = normalizeLocationsInput(merchant.locations);

  return {
    business_name: merchant.business_name ?? "",
    email: merchant.email ?? "",
    business_category: merchant.business_category ?? "",
    contact_name: merchant.contact_name ?? "",
    phone: merchant.phone ?? "",
    address: merchant.address ?? "",
    locations: normalizedLocations.join("\n"),
    short_description: merchant.short_description ?? "",
  };
}

export function MerchantProfileEditor({ merchant }: MerchantProfileEditorProps) {
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [form, setForm] = useState<FormState>(() => createFormState(merchant));

  useEffect(() => {
    let active = true;

    async function hydrateFromApi() {
      try {
        const response = await fetch("/api/merchant/businesses", {
          method: "GET",
          cache: "no-store",
        });

        const result = (await response.json()) as {
          businesses?: Array<{
            id: string;
            business_name?: string | null;
            email?: string | null;
            business_category?: string | null;
            contact_name?: string | null;
            phone?: string | null;
            locations?: string[] | null;
            address?: string | null;
            short_description?: string | null;
            description?: string | null;
          }>;
        };

        if (!response.ok || !result.businesses?.length) {
          return;
        }

        const matched = result.businesses.find((business) => business.id === merchant.id);
        if (!matched || !active) {
          return;
        }

        setForm(
          createFormState({
            ...merchant,
            business_name: matched.business_name ?? merchant.business_name,
            email: matched.email ?? merchant.email,
            business_category: matched.business_category ?? merchant.business_category,
            contact_name: matched.contact_name ?? merchant.contact_name,
            phone: matched.phone ?? merchant.phone,
            locations: normalizeLocationsInput(matched.locations ?? merchant.locations),
            address: matched.address ?? merchant.address,
            short_description:
              matched.short_description ??
              matched.description ??
              merchant.short_description,
          }),
        );
      } catch {
      }
    }

    void hydrateFromApi();

    return () => {
      active = false;
    };
  }, [merchant]);

  const parsedLocations = useMemo(
    () => normalizeLocationsInput(form.locations),
    [form.locations],
  );

  const details = [
    { label: "Business name", value: form.business_name || "Not configured" },
    { label: "Email", value: form.email || "Not configured" },
    { label: "Contact name", value: form.contact_name || "Not configured" },
    { label: "Phone", value: form.phone || "Not configured" },
    { label: "Business category", value: form.business_category || "Not configured" },
    { label: "Address", value: form.address || "Not configured" },
    {
      label: "Locations",
      value: parsedLocations.length ? parsedLocations.join(" • ") : "Not configured",
    },
    { label: "Description", value: form.short_description || "Not configured" },
    { label: "Status", value: merchant.status || "UNKNOWN" },
  ];

  function toggleEdit() {
    if (busy) return;

    if (editing) {
      setForm(createFormState(merchant));
      setMessage("");
      setEditing(false);
      return;
    }

    setMessage("");
    setEditing(true);
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");

    try {
      const response = await fetch(`/api/merchant/businesses/${merchant.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_name: form.business_name,
          email: form.email,
          business_category: form.business_category,
          contact_name: form.contact_name,
          phone: form.phone,
          address: form.address,
          locations: parsedLocations,
          short_description: form.short_description,
        }),
      });

      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(result.error ?? "Failed to update merchant profile");
      }

      setMessage("Profile updated.");
      setEditing(false);
      window.location.reload();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to update merchant profile",
      );
    } finally {
      setBusy(false);
    }
  }

  if (!editing) {
    return (
      <section className="space-y-4 rounded-3xl border border-[#262626] bg-[#1A1A1A] p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-lg font-semibold">Merchant profile details</p>
            <p className="text-sm text-[#A1A1AA]">Review your business information.</p>
          </div>
          <button
            type="button"
            onClick={toggleEdit}
            className="rounded-xl bg-[#FFB547] px-4 py-2 text-sm font-semibold text-[#111111]"
          >
            Edit
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {details.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-[#262626] bg-[#111111] px-4 py-3"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-[#A1A1AA]">
                {item.label}
              </p>
              <p className="mt-2 text-sm font-semibold">{item.value}</p>
            </div>
          ))}
        </div>

        {message ? <p className="text-xs text-[#A1A1AA]">{message}</p> : null}
      </section>
    );
  }

  return (
    <section className="space-y-4 rounded-3xl border border-[#262626] bg-[#1A1A1A] p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-lg font-semibold">Edit merchant profile</p>
          <p className="text-sm text-[#A1A1AA]">All fields are editable.</p>
        </div>
        <button
          type="button"
          onClick={toggleEdit}
          disabled={busy}
          className="rounded-xl border border-[#262626] bg-[#111111] px-4 py-2 text-sm"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSave} className="grid gap-3 sm:grid-cols-2">
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
          value={form.locations}
          onChange={(event) => setForm((prev) => ({ ...prev, locations: event.target.value }))}
          placeholder="Locations (one per line)"
          rows={3}
          className="sm:col-span-2 rounded-xl border border-[#262626] bg-[#111111] px-3 py-2 text-sm"
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

        <div className="sm:col-span-2 flex items-center gap-3">
          <button
            type="submit"
            disabled={busy}
            className="rounded-xl bg-[#FFB547] px-4 py-2 text-sm font-semibold text-[#111111] disabled:opacity-60"
          >
            {busy ? "Saving..." : "Save changes"}
          </button>
          {message ? <p className="text-xs text-[#A1A1AA]">{message}</p> : null}
        </div>
      </form>
    </section>
  );
}
