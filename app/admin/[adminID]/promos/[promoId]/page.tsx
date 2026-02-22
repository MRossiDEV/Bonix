"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

type PromoRequest = {
  id: string;
  promo_id: string;
  merchant_id: string;
  action: "ACTIVATE" | "PAUSE" | "DEACTIVATE" | "DELETE" | "EDIT";
  status: "PENDING" | "APPROVED" | "REJECTED";
  note: string | null;
  requested_changes: Record<string, unknown> | null;
  admin_note: string | null;
  created_at: string;
  reviewed_at: string | null;
};

type PromoDetail = {
  id: string;
  merchant_id: string;
  title: string;
  description: string;
  image: string | null;
  original_price: number;
  discounted_price: number;
  cashback_percent: number;
  total_slots: number;
  available_slots: number;
  category: string | null;
  starts_at: string | null;
  expires_at: string;
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "SOLD_OUT" | "EXPIRED" | "DISABLED";
  created_at: string;
  updated_at: string;
  merchant: {
    id: string;
    business_name: string | null;
    contact_name: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    business_category: string | null;
    short_description: string | null;
    logo_url: string | null;
    status: string;
  } | null;
};

type FeeDefaults = {
  platformFeePercent: number;
  affiliateFeePercent: number;
};

type PromoForm = {
  title: string;
  description: string;
  image: string;
  category: string;
  original_price: string;
  discounted_price: string;
  cashback_percent: string;
  total_slots: string;
  starts_at: string;
  expires_at: string;
  status: PromoDetail["status"];
  platformFeePercent: string;
  affiliateFeePercent: string;
};

function toDateTimeInput(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toDateLabel(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export default function AdminPromoDetailPage() {
  const params = useParams<{ promoId: string }>();
  const searchParams = useSearchParams();
  const promoId = params?.promoId;
  const requestedId = searchParams.get("requestId");

  const [promo, setPromo] = useState<PromoDetail | null>(null);
  const [requests, setRequests] = useState<PromoRequest[]>([]);
  const [form, setForm] = useState<PromoForm | null>(null);
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadPromo = useCallback(async () => {
    if (!promoId) return;

    setLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch(`/api/admin/promos/${promoId}`);
      const json = (await response.json()) as {
        error?: string;
        promo?: PromoDetail;
        requests?: PromoRequest[];
        feeDefaults?: FeeDefaults;
      };

      if (!response.ok || !json.promo) {
        throw new Error(json.error ?? "Failed to load promo");
      }

      setPromo(json.promo);
      const nextRequests = json.requests ?? [];
      setRequests(nextRequests);

      const defaults = json.feeDefaults ?? { platformFeePercent: 3, affiliateFeePercent: 5 };
      setForm({
        title: json.promo.title,
        description: json.promo.description,
        image: json.promo.image ?? "",
        category: json.promo.category ?? "",
        original_price: String(json.promo.original_price),
        discounted_price: String(json.promo.discounted_price),
        cashback_percent: String(json.promo.cashback_percent),
        total_slots: String(json.promo.total_slots),
        starts_at: toDateTimeInput(json.promo.starts_at),
        expires_at: toDateTimeInput(json.promo.expires_at),
        status: json.promo.status,
        platformFeePercent: String(defaults.platformFeePercent),
        affiliateFeePercent: String(defaults.affiliateFeePercent),
      });

      const preferred = requestedId ?? null;
      const firstPending = nextRequests.find((request) => request.status === "PENDING")?.id ?? null;
      setActiveRequestId(preferred && nextRequests.some((request) => request.id === preferred) ? preferred : firstPending);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to load promo");
    } finally {
      setLoading(false);
    }
  }, [promoId, requestedId]);

  useEffect(() => {
    loadPromo().catch(() => {
      setLoading(false);
    });
  }, [loadPromo]);

  const activeRequest = useMemo(
    () => requests.find((request) => request.id === activeRequestId) ?? null,
    [activeRequestId, requests],
  );

  const savePromo = async () => {
    if (!promoId || !form) return;

    setSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const response = await fetch(`/api/admin/promos/${promoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          image: form.image,
          category: form.category,
          original_price: Number(form.original_price),
          discounted_price: Number(form.discounted_price),
          cashback_percent: Number(form.cashback_percent),
          total_slots: Number(form.total_slots),
          starts_at: form.starts_at || null,
          expires_at: form.expires_at,
          status: form.status,
          platformFeePercent: Number(form.platformFeePercent),
          affiliateFeePercent: Number(form.affiliateFeePercent),
        }),
      });

      const json = (await response.json()) as { error?: string; promo?: PromoDetail };
      if (!response.ok || !json.promo) {
        throw new Error(json.error ?? "Failed to save promo");
      }

      setPromo(json.promo);
      setSuccessMessage("Promo updated");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to save promo");
    } finally {
      setSaving(false);
    }
  };

  const reviewActiveRequest = async (decision: "APPROVED" | "REJECTED") => {
    if (!activeRequest || activeRequest.status !== "PENDING" || !form) return;

    setReviewing(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const response = await fetch(`/api/admin/promo-requests/${activeRequest.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision,
          adminNote,
          promoUpdates: {
            cashback_percent: Number(form.cashback_percent),
            status: activeRequest.action === "EDIT" ? form.status : undefined,
          },
          feeSettings: {
            platformFeePercent: Number(form.platformFeePercent),
            affiliateFeePercent: Number(form.affiliateFeePercent),
          },
        }),
      });

      const json = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(json.error ?? "Failed to review request");
      }

      setSuccessMessage(`Request ${decision === "APPROVED" ? "approved" : "rejected"}`);
      await loadPromo();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to review request");
    } finally {
      setReviewing(false);
    }
  };

  if (loading || !form) {
    return <p className="text-sm text-[#94A3B8]">Loading promo details...</p>;
  }

  if (!promo) {
    return <p className="text-sm text-red-300">Promo not found.</p>;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#1F2937] bg-[#0F172A] p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Promo review</h1>
            <p className="mt-1 text-sm text-[#94A3B8]">Full editable promo + merchant details and approval workflow.</p>
          </div>
          <Link href="../" className="rounded-xl border border-[#1F2937] px-3 py-2 text-xs text-[#E2E8F0]">
            Back to requests
          </Link>
        </div>
      </section>

      {errorMessage ? (
        <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">{errorMessage}</p>
      ) : null}
      {successMessage ? (
        <p className="rounded-xl border border-green-500/40 bg-green-500/10 px-3 py-2 text-sm text-green-300">{successMessage}</p>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <article className="space-y-4 rounded-3xl border border-[#1F2937] bg-[#0F172A] p-5">
          <h2 className="text-lg font-semibold">Promo fields</h2>

          <label className="block text-sm">
            <span className="text-[#94A3B8]">Title</span>
            <input value={form.title} onChange={(event) => setForm((current) => current ? { ...current, title: event.target.value } : current)} className="mt-1 w-full rounded-xl border border-[#1F2937] bg-[#020617] px-3 py-2" />
          </label>

          <label className="block text-sm">
            <span className="text-[#94A3B8]">Description</span>
            <textarea value={form.description} onChange={(event) => setForm((current) => current ? { ...current, description: event.target.value } : current)} rows={4} className="mt-1 w-full rounded-xl border border-[#1F2937] bg-[#020617] px-3 py-2" />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="text-[#94A3B8]">Original price</span>
              <input type="number" min="0" step="0.01" value={form.original_price} onChange={(event) => setForm((current) => current ? { ...current, original_price: event.target.value } : current)} className="mt-1 w-full rounded-xl border border-[#1F2937] bg-[#020617] px-3 py-2" />
            </label>
            <label className="block text-sm">
              <span className="text-[#94A3B8]">Discounted price</span>
              <input type="number" min="0" step="0.01" value={form.discounted_price} onChange={(event) => setForm((current) => current ? { ...current, discounted_price: event.target.value } : current)} className="mt-1 w-full rounded-xl border border-[#1F2937] bg-[#020617] px-3 py-2" />
            </label>
            <label className="block text-sm">
              <span className="text-[#94A3B8]">Cashback %</span>
              <input type="number" min="0" max="100" step="0.01" value={form.cashback_percent} onChange={(event) => setForm((current) => current ? { ...current, cashback_percent: event.target.value } : current)} className="mt-1 w-full rounded-xl border border-[#1F2937] bg-[#020617] px-3 py-2" />
            </label>
            <label className="block text-sm">
              <span className="text-[#94A3B8]">Total slots</span>
              <input type="number" min="1" step="1" value={form.total_slots} onChange={(event) => setForm((current) => current ? { ...current, total_slots: event.target.value } : current)} className="mt-1 w-full rounded-xl border border-[#1F2937] bg-[#020617] px-3 py-2" />
            </label>
            <label className="block text-sm">
              <span className="text-[#94A3B8]">Platform fee %</span>
              <input type="number" min="0" max="100" step="0.01" value={form.platformFeePercent} onChange={(event) => setForm((current) => current ? { ...current, platformFeePercent: event.target.value } : current)} className="mt-1 w-full rounded-xl border border-[#1F2937] bg-[#020617] px-3 py-2" />
            </label>
            <label className="block text-sm">
              <span className="text-[#94A3B8]">Affiliate fee %</span>
              <input type="number" min="0" max="100" step="0.01" value={form.affiliateFeePercent} onChange={(event) => setForm((current) => current ? { ...current, affiliateFeePercent: event.target.value } : current)} className="mt-1 w-full rounded-xl border border-[#1F2937] bg-[#020617] px-3 py-2" />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="text-[#94A3B8]">Category</span>
              <input value={form.category} onChange={(event) => setForm((current) => current ? { ...current, category: event.target.value } : current)} className="mt-1 w-full rounded-xl border border-[#1F2937] bg-[#020617] px-3 py-2" />
            </label>
            <label className="block text-sm">
              <span className="text-[#94A3B8]">Status</span>
              <select value={form.status} onChange={(event) => setForm((current) => current ? { ...current, status: event.target.value as PromoDetail["status"] } : current)} className="mt-1 w-full rounded-xl border border-[#1F2937] bg-[#020617] px-3 py-2">
                <option value="DRAFT">DRAFT</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="PAUSED">PAUSED</option>
                <option value="SOLD_OUT">SOLD_OUT</option>
                <option value="EXPIRED">EXPIRED</option>
                <option value="DISABLED">DISABLED</option>
              </select>
            </label>
            <label className="block text-sm">
              <span className="text-[#94A3B8]">Starts at</span>
              <input type="datetime-local" value={form.starts_at} onChange={(event) => setForm((current) => current ? { ...current, starts_at: event.target.value } : current)} className="mt-1 w-full rounded-xl border border-[#1F2937] bg-[#020617] px-3 py-2" />
            </label>
            <label className="block text-sm">
              <span className="text-[#94A3B8]">Expires at</span>
              <input type="datetime-local" value={form.expires_at} onChange={(event) => setForm((current) => current ? { ...current, expires_at: event.target.value } : current)} className="mt-1 w-full rounded-xl border border-[#1F2937] bg-[#020617] px-3 py-2" />
            </label>
          </div>

          <label className="block text-sm">
            <span className="text-[#94A3B8]">Image URL</span>
            <input value={form.image} onChange={(event) => setForm((current) => current ? { ...current, image: event.target.value } : current)} className="mt-1 w-full rounded-xl border border-[#1F2937] bg-[#020617] px-3 py-2" />
          </label>

          <button type="button" onClick={() => { savePromo().catch(() => {}); }} disabled={saving} className="rounded-xl bg-[#22C55E] px-4 py-2 text-sm font-semibold text-[#0B0F14] disabled:opacity-60">
            {saving ? "Saving..." : "Save promo"}
          </button>
        </article>

        <aside className="space-y-4">
          <article className="rounded-3xl border border-[#1F2937] bg-[#0F172A] p-5 text-sm">
            <h2 className="text-base font-semibold">Merchant</h2>
            <div className="mt-3 space-y-2 text-[#94A3B8]">
              <p><span className="text-[#E2E8F0]">Business:</span> {promo.merchant?.business_name ?? "—"}</p>
              <p><span className="text-[#E2E8F0]">Contact:</span> {promo.merchant?.contact_name ?? "—"}</p>
              <p><span className="text-[#E2E8F0]">Email:</span> {promo.merchant?.email ?? "—"}</p>
              <p><span className="text-[#E2E8F0]">Phone:</span> {promo.merchant?.phone ?? "—"}</p>
              <p><span className="text-[#E2E8F0]">Address:</span> {promo.merchant?.address ?? "—"}</p>
              <p><span className="text-[#E2E8F0]">Category:</span> {promo.merchant?.business_category ?? "—"}</p>
              <p><span className="text-[#E2E8F0]">Merchant status:</span> {promo.merchant?.status ?? "—"}</p>
            </div>
          </article>

          <article className="rounded-3xl border border-[#1F2937] bg-[#0F172A] p-5 text-sm">
            <h2 className="text-base font-semibold">Promo meta</h2>
            <div className="mt-3 space-y-2 text-[#94A3B8]">
              <p><span className="text-[#E2E8F0]">Available slots:</span> {promo.available_slots}</p>
              <p><span className="text-[#E2E8F0]">Created:</span> {toDateLabel(promo.created_at)}</p>
              <p><span className="text-[#E2E8F0]">Updated:</span> {toDateLabel(promo.updated_at)}</p>
            </div>
          </article>
        </aside>
      </section>

      <section className="space-y-4 rounded-3xl border border-[#1F2937] bg-[#0F172A] p-5">
        <h2 className="text-lg font-semibold">Approval requests</h2>
        {requests.length === 0 ? <p className="text-sm text-[#94A3B8]">No requests for this promo.</p> : null}

        {requests.length > 0 ? (
          <div className="grid gap-3 lg:grid-cols-[1.1fr_1.4fr]">
            <div className="space-y-2">
              {requests.map((request) => (
                <button
                  key={request.id}
                  type="button"
                  onClick={() => setActiveRequestId(request.id)}
                  className={`w-full rounded-xl border px-3 py-2 text-left text-xs ${
                    request.id === activeRequestId
                      ? "border-[#22C55E] bg-[#14532D]/20"
                      : "border-[#1F2937] bg-[#020617]"
                  }`}
                >
                  <p className="font-semibold text-[#E2E8F0]">{request.action}</p>
                  <p className="mt-1 text-[#94A3B8]">{request.status} • {toDateLabel(request.created_at)}</p>
                </button>
              ))}
            </div>

            <div className="rounded-xl border border-[#1F2937] bg-[#020617] p-3 text-xs">
              {activeRequest ? (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-[#E2E8F0]">Selected request</p>
                  <p className="text-[#94A3B8]">Action: <span className="text-[#E2E8F0]">{activeRequest.action}</span></p>
                  <p className="text-[#94A3B8]">Status: <span className="text-[#E2E8F0]">{activeRequest.status}</span></p>
                  <p className="text-[#94A3B8]">Merchant note: <span className="text-[#E2E8F0]">{activeRequest.note ?? "—"}</span></p>

                  {activeRequest.requested_changes ? (
                    <pre className="max-h-60 overflow-auto rounded-xl border border-[#1F2937] bg-[#0F172A] p-3 text-[11px] text-[#94A3B8]">
                      {JSON.stringify(activeRequest.requested_changes, null, 2)}
                    </pre>
                  ) : null}

                  <label className="block text-sm">
                    <span className="text-[#94A3B8]">Admin note</span>
                    <textarea value={adminNote} onChange={(event) => setAdminNote(event.target.value)} rows={3} className="mt-1 w-full rounded-xl border border-[#1F2937] bg-[#0F172A] px-3 py-2 text-sm" />
                  </label>

                  {activeRequest.status === "PENDING" ? (
                    <div className="grid grid-cols-2 gap-2">
                      <button type="button" onClick={() => { reviewActiveRequest("APPROVED").catch(() => {}); }} disabled={reviewing} className="rounded-xl bg-[#22C55E] px-3 py-2 font-semibold text-[#0B0F14] disabled:opacity-60">Approve</button>
                      <button type="button" onClick={() => { reviewActiveRequest("REJECTED").catch(() => {}); }} disabled={reviewing} className="rounded-xl bg-[#EF4444] px-3 py-2 font-semibold text-[#0B0F14] disabled:opacity-60">Reject</button>
                    </div>
                  ) : null}
                </div>
              ) : (
                <p className="text-[#94A3B8]">Select a request.</p>
              )}
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}