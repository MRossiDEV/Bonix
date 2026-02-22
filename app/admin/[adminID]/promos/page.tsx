"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";

import { getPromoActivityState, PromoActivityState } from "@/lib/promo-activity-state";

type AdminSettings = {
  defaultCashbackPercent: number;
  maxPromosPerMerchant: number;
  defaultPromoImageUrl: string;
};

type PromoRequest = {
  id: string;
  promo_id: string;
  merchant_id: string;
  action: "ACTIVATE" | "PAUSE" | "DEACTIVATE" | "DELETE" | "EDIT";
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELED" | "FINISHED";
  note: string | null;
  requested_changes: Record<string, unknown> | null;
  created_at: string;
  promo: {
    title: string | null;
    description: string | null;
    image: string | null;
    category: string | null;
    original_price: number | null;
    discounted_price: number | null;
    total_slots: number | null;
    starts_at: string | null;
    expires_at: string | null;
    status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELED" | "DRAFT" | "ACTIVE" | "PAUSED" | "SOLD_OUT" | "EXPIRED" | "DISABLED";
  } | null;
  merchant: { business_name: string } | null;
};

type PromoRequestedChanges = {
  title: string | null;
  description: string | null;
  image: string | null;
  original_price: number | null;
  discounted_price: number | null;
  total_slots: number | null;
  category: string | null;
  starts_at: string | null;
  expires_at: string | null;
};

function toStringValue(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function toNumberValue(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function toDateLabel(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function parseRequestedChanges(raw: Record<string, unknown> | null): PromoRequestedChanges | null {
  if (!raw) return null;
  return {
    title: toStringValue(raw.title),
    description: toStringValue(raw.description),
    image: toStringValue(raw.image),
    original_price: toNumberValue(raw.original_price),
    discounted_price: toNumberValue(raw.discounted_price),
    total_slots: toNumberValue(raw.total_slots),
    category: toStringValue(raw.category),
    starts_at: toStringValue(raw.starts_at),
    expires_at: toStringValue(raw.expires_at),
  };
}

function formatMoney(value: number | null): string {
  return value === null ? "—" : `$${value}`;
}

function buildBeforeAfterRows(
  promo: PromoRequest["promo"],
  changes: PromoRequestedChanges,
): Array<{ label: string; before: string; after: string }> {
  const rows = [
    {
      label: "Title",
      before: promo?.title ?? "—",
      after: changes.title ?? "—",
    },
    {
      label: "Description",
      before: promo?.description ?? "—",
      after: changes.description ?? "—",
    },
    {
      label: "Category",
      before: promo?.category ?? "—",
      after: changes.category ?? "—",
    },
    {
      label: "Original price",
      before: formatMoney(promo?.original_price ?? null),
      after: formatMoney(changes.original_price),
    },
    {
      label: "Discounted price",
      before: formatMoney(promo?.discounted_price ?? null),
      after: formatMoney(changes.discounted_price),
    },
    {
      label: "Total slots",
      before: promo?.total_slots === null || promo?.total_slots === undefined ? "—" : String(promo.total_slots),
      after: changes.total_slots === null ? "—" : String(changes.total_slots),
    },
    {
      label: "Starts at",
      before: toDateLabel(promo?.starts_at ?? null),
      after: toDateLabel(changes.starts_at),
    },
    {
      label: "Expires at",
      before: toDateLabel(promo?.expires_at ?? null),
      after: toDateLabel(changes.expires_at),
    },
    {
      label: "Image URL",
      before: promo?.image ?? "—",
      after: changes.image ?? "—",
    },
  ];

  return rows.filter((row) => row.before !== row.after);
}

export default function AdminPromosPage() {
  const params = useParams<{ adminID: string }>();
  const adminID = params?.adminID;
  const [settings, setSettings] = useState<AdminSettings>({
    defaultCashbackPercent: 2,
    maxPromosPerMerchant: 10,
    defaultPromoImageUrl: "/promo-placeholder.svg",
  });
  const [requests, setRequests] = useState<PromoRequest[]>([]);
  const [activityStateFilter, setActivityStateFilter] = useState<"ALL" | PromoActivityState>("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const [settingsRes, requestsRes] = await Promise.all([
        fetch("/api/admin/settings"),
        fetch("/api/admin/promo-requests"),
      ]);

      const settingsJson = (await settingsRes.json()) as {
        error?: string;
        settings?: AdminSettings;
      };
      const requestsJson = (await requestsRes.json()) as {
        error?: string;
        requests?: PromoRequest[];
      };

      if (!settingsRes.ok) {
        throw new Error(settingsJson.error ?? "Failed to load settings");
      }

      if (!requestsRes.ok) {
        throw new Error(requestsJson.error ?? "Failed to load requests");
      }

      if (settingsJson.settings) {
        setSettings(settingsJson.settings);
      }
      setRequests(requestsJson.requests ?? []);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData().catch(() => {
      setLoading(false);
    });
  }, []);

  const saveSettings = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const json = (await response.json()) as { error?: string; settings?: AdminSettings };
      if (!response.ok) {
        throw new Error(json.error ?? "Failed to save settings");
      }

      if (json.settings) {
        setSettings(json.settings);
      }
      setSuccessMessage("Settings updated");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to save settings");
    }
  };

  const filteredRequests = requests.filter((request) => {
    const promoSide = getPromoActivityState(request.promo?.status);
    if (activityStateFilter !== "ALL" && promoSide !== activityStateFilter) {
      return false;
    }

    if (statusFilter === "ALL") {
      return true;
    }

    const requestStatus = String(request.status ?? "").toUpperCase();
    const promoStatus = String(request.promo?.status ?? "").toUpperCase();
    return requestStatus === statusFilter || promoStatus === statusFilter;
  });

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#1F2937] bg-[#0F172A] p-6">
        <h1 className="text-2xl font-semibold">Promos & rules</h1>
        <p className="mt-2 text-sm text-[#94A3B8]">
          Set platform promo rules and moderate merchant requests.
        </p>
      </section>

      <section className="space-y-4 rounded-3xl border border-[#1F2937] bg-[#0F172A] p-5">
        <h2 className="text-lg font-semibold">Admin settings</h2>
        <label className="block text-sm">
          <span className="text-[#94A3B8]">Default cashback percent</span>
          <input
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={settings.defaultCashbackPercent}
            onChange={(event) =>
              setSettings((current) => ({
                ...current,
                defaultCashbackPercent: Number(event.target.value),
              }))
            }
            className="mt-1 w-full rounded-xl border border-[#1F2937] bg-[#020617] px-3 py-2"
          />
        </label>

        <label className="block text-sm">
          <span className="text-[#94A3B8]">Max promos per merchant</span>
          <input
            type="number"
            min="1"
            step="1"
            value={settings.maxPromosPerMerchant}
            onChange={(event) =>
              setSettings((current) => ({
                ...current,
                maxPromosPerMerchant: Number(event.target.value),
              }))
            }
            className="mt-1 w-full rounded-xl border border-[#1F2937] bg-[#020617] px-3 py-2"
          />
        </label>

        <label className="block text-sm">
          <span className="text-[#94A3B8]">Default promo image URL</span>
          <input
            type="text"
            value={settings.defaultPromoImageUrl}
            onChange={(event) =>
              setSettings((current) => ({
                ...current,
                defaultPromoImageUrl: event.target.value,
              }))
            }
            className="mt-1 w-full rounded-xl border border-[#1F2937] bg-[#020617] px-3 py-2"
          />
          <p className="mt-1 text-xs text-[#94A3B8]">
            Used when a promo has no image. Example: /promo-placeholder.svg
          </p>
        </label>

        <button
          type="button"
          onClick={() => {
            saveSettings().catch(() => {});
          }}
          className="rounded-xl bg-[#22C55E] px-4 py-2 text-sm font-semibold text-[#0B0F14]"
        >
          Save settings
        </button>
      </section>

      {errorMessage ? (
        <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {errorMessage}
        </p>
      ) : null}

      {successMessage ? (
        <p className="rounded-xl border border-green-500/40 bg-green-500/10 px-3 py-2 text-sm text-green-300">
          {successMessage}
        </p>
      ) : null}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Merchant action requests</h2>
        <div className="grid gap-3 rounded-2xl border border-[#1F2937] bg-[#0F172A] p-4 sm:grid-cols-2">
          <label className="text-xs text-[#94A3B8]">
            Active side
            <select
              value={activityStateFilter}
              onChange={(event) =>
                setActivityStateFilter(event.target.value as "ALL" | PromoActivityState)
              }
              className="mt-1 w-full rounded-xl border border-[#1F2937] bg-[#020617] px-3 py-2 text-sm text-[#E2E8F0]"
            >
              <option value="ALL">All</option>
              <option value="ACTIVE">Active</option>
              <option value="UNACTIVE">Unactive</option>
            </select>
          </label>

          <label className="text-xs text-[#94A3B8]">
            Status detail
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="mt-1 w-full rounded-xl border border-[#1F2937] bg-[#020617] px-3 py-2 text-sm text-[#E2E8F0]"
            >
              <option value="ALL">All</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="CANCELED">Canceled</option>
              <option value="FINISHED">Finished</option>
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="PAUSED">Paused</option>
              <option value="SOLD_OUT">Sold out</option>
              <option value="EXPIRED">Expired</option>
              <option value="DISABLED">Disabled</option>
            </select>
          </label>
        </div>

        {loading ? <p className="text-sm text-[#94A3B8]">Loading requests...</p> : null}
        {!loading && filteredRequests.length === 0 ? (
          <p className="text-sm text-[#94A3B8]">No pending requests.</p>
        ) : null}

        {filteredRequests.map((request) => (
          <Link
            key={request.id}
            href={
              adminID
                ? `/admin/${adminID}/promos/${request.promo_id}?requestId=${request.id}`
                : "#"
            }
            className="block rounded-3xl border border-[#1F2937] bg-[#0F172A] p-5 transition hover:border-[#334155] hover:bg-[#111D35]"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-lg font-semibold">{request.promo?.title ?? "Promo"}</p>
                <p className="mt-1 text-sm text-[#94A3B8]">
                  {request.merchant?.business_name ?? "Merchant"} • {request.action}
                </p>
              </div>
              <span className="rounded-full bg-[#1E293B] px-3 py-1 text-xs font-semibold">
                {request.status}
              </span>
            </div>

            {request.note ? (
              <p className="mt-3 text-xs text-[#94A3B8]">Merchant note: {request.note}</p>
            ) : null}

            {request.action === "EDIT" && request.requested_changes ? (
              <div className="mt-3 rounded-xl border border-[#1F2937] bg-[#020617] p-3 text-xs text-[#94A3B8]">
                <p className="font-semibold text-[#E2E8F0]">Requested changes</p>
                {(() => {
                  const changes = parseRequestedChanges(request.requested_changes);
                  if (!changes) return null;
                  const rows = buildBeforeAfterRows(request.promo, changes);
                  return (
                    <div className="mt-3 space-y-3">
                      {changes.image ? (
                        <div className="overflow-hidden rounded-xl border border-[#1F2937] bg-[#0F172A]">
                          <Image
                            src={changes.image}
                            alt="Requested promo"
                            width={1120}
                            height={320}
                            className="h-28 w-full object-cover"
                          />
                        </div>
                      ) : null}

                      {rows.length > 0 ? (
                        <div className="overflow-x-auto rounded-xl border border-[#1F2937]">
                          <table className="w-full min-w-[560px] text-left text-xs">
                            <thead className="bg-[#0F172A] text-[#94A3B8]">
                              <tr>
                                <th className="px-3 py-2 font-medium">Field</th>
                                <th className="px-3 py-2 font-medium">Before</th>
                                <th className="px-3 py-2 font-medium">After</th>
                              </tr>
                            </thead>
                            <tbody>
                              {rows.map((row) => (
                                <tr key={row.label} className="border-t border-[#1F2937] bg-[#020617]">
                                  <td className="px-3 py-2 text-[#E2E8F0]">{row.label}</td>
                                  <td className="px-3 py-2 text-[#94A3B8] break-all">{row.before}</td>
                                  <td className="px-3 py-2 text-[#22C55E] break-all">{row.after}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="rounded-xl border border-[#1F2937] bg-[#0F172A] px-3 py-2 text-[#94A3B8]">
                          No field differences detected.
                        </p>
                      )}
                    </div>
                  );
                })()}
              </div>
            ) : null}

            <div className="mt-4 text-xs font-semibold text-[#22C55E]">Open full review →</div>
          </Link>
        ))}
      </section>
    </div>
  );
}
