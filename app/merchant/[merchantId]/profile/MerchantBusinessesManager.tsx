"use client";

import { FormEvent, useMemo, useState } from "react";

type Business = {
  id: string;
  business_name: string | null;
  email: string | null;
  business_category: string | null;
  contact_name: string | null;
  phone: string | null;
  address: string | null;
  short_description: string | null;
  status: string;
};

type Props = {
  initialBusinesses: Business[];
};

type Draft = {
  business_name: string;
  email: string;
  contact_name: string;
  phone: string;
  business_category: string;
  address: string;
  short_description: string;
};

const emptyDraft: Draft = {
  business_name: "",
  email: "",
  contact_name: "",
  phone: "",
  business_category: "",
  address: "",
  short_description: "",
};

export function MerchantBusinessesManager({ initialBusinesses }: Props) {
  const [businesses, setBusinesses] = useState<Business[]>(initialBusinesses);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string>("");

  const editingBusiness = useMemo(
    () => businesses.find((business) => business.id === editingId) ?? null,
    [businesses, editingId],
  );

  function startEdit(business: Business) {
    setEditingId(business.id);
    setDraft({
      business_name: business.business_name ?? "",
      email: business.email ?? "",
      contact_name: business.contact_name ?? "",
      phone: business.phone ?? "",
      business_category: business.business_category ?? "",
      address: business.address ?? "",
      short_description: business.short_description ?? "",
    });
    setMessage("");
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft(emptyDraft);
  }

  async function reloadBusinesses() {
    const response = await fetch("/api/merchant/businesses", { method: "GET" });
    const json = (await response.json()) as { businesses?: Business[]; error?: string };
    if (!response.ok) {
      throw new Error(json.error ?? "Failed to refresh businesses");
    }
    setBusinesses(json.businesses ?? []);
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/merchant/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const json = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(json.error ?? "Failed to create business");
      }
      setDraft(emptyDraft);
      await reloadBusinesses();
      setMessage("Business created");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to create business");
    } finally {
      setBusy(false);
    }
  }

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingId) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(`/api/merchant/businesses/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const json = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(json.error ?? "Failed to update business");
      }
      await reloadBusinesses();
      setMessage("Business updated");
      cancelEdit();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to update business");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(business: Business) {
    const ok = window.confirm(`Delete business "${business.business_name ?? business.id}"?`);
    if (!ok) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(`/api/merchant/businesses/${business.id}`, {
        method: "DELETE",
      });
      const json = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(json.error ?? "Failed to delete business");
      }
      await reloadBusinesses();
      setMessage("Business deleted");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to delete business");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-4 rounded-3xl border border-[#262626] bg-[#1A1A1A] p-6">
      <div>
        <p className="text-lg font-semibold">Businesses</p>
        <p className="text-sm text-[#A1A1AA]">Manage all businesses in your merchant role account.</p>
      </div>

      <div className="space-y-2">
        {businesses.map((business) => (
          <div key={business.id} className="rounded-2xl border border-[#262626] bg-[#111111] p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">{business.business_name ?? "Unnamed business"}</p>
                <p className="text-xs text-[#A1A1AA]">{business.email ?? "No email"} • {business.status}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => startEdit(business)}
                  disabled={busy}
                  className="rounded-xl border border-[#262626] bg-[#1A1A1A] px-3 py-1 text-xs"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(business)}
                  disabled={busy}
                  className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-1 text-xs text-red-300"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={editingBusiness ? handleUpdate : handleCreate} className="grid gap-3 sm:grid-cols-2">
        <input
          value={draft.business_name}
          onChange={(event) => setDraft((prev) => ({ ...prev, business_name: event.target.value }))}
          placeholder="Business name"
          required
          className="rounded-xl border border-[#262626] bg-[#111111] px-3 py-2 text-sm"
        />
        <input
          value={draft.email}
          onChange={(event) => setDraft((prev) => ({ ...prev, email: event.target.value }))}
          placeholder="Business email"
          required
          className="rounded-xl border border-[#262626] bg-[#111111] px-3 py-2 text-sm"
        />
        <input
          value={draft.contact_name}
          onChange={(event) => setDraft((prev) => ({ ...prev, contact_name: event.target.value }))}
          placeholder="Contact name"
          required
          className="rounded-xl border border-[#262626] bg-[#111111] px-3 py-2 text-sm"
        />
        <input
          value={draft.phone}
          onChange={(event) => setDraft((prev) => ({ ...prev, phone: event.target.value }))}
          placeholder="Phone"
          required
          className="rounded-xl border border-[#262626] bg-[#111111] px-3 py-2 text-sm"
        />
        <input
          value={draft.business_category}
          onChange={(event) => setDraft((prev) => ({ ...prev, business_category: event.target.value }))}
          placeholder="Business category"
          className="rounded-xl border border-[#262626] bg-[#111111] px-3 py-2 text-sm"
        />
        <input
          value={draft.address}
          onChange={(event) => setDraft((prev) => ({ ...prev, address: event.target.value }))}
          placeholder="Address"
          className="rounded-xl border border-[#262626] bg-[#111111] px-3 py-2 text-sm"
        />
        <textarea
          value={draft.short_description}
          onChange={(event) =>
            setDraft((prev) => ({ ...prev, short_description: event.target.value }))
          }
          placeholder="Short description"
          className="sm:col-span-2 rounded-xl border border-[#262626] bg-[#111111] px-3 py-2 text-sm"
          rows={3}
        />

        <div className="sm:col-span-2 flex items-center gap-2">
          <button
            type="submit"
            disabled={busy}
            className="rounded-xl bg-[#FFB547] px-4 py-2 text-sm font-semibold text-[#111111] disabled:opacity-60"
          >
            {editingBusiness ? "Update business" : "Create business"}
          </button>
          {editingBusiness ? (
            <button
              type="button"
              onClick={cancelEdit}
              disabled={busy}
              className="rounded-xl border border-[#262626] bg-[#111111] px-4 py-2 text-sm"
            >
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      {message ? <p className="text-xs text-[#A1A1AA]">{message}</p> : null}
    </section>
  );
}
