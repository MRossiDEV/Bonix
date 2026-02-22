"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { getPromoImageUrl } from "@/lib/promo-image";

type PromoRow = {
  id: string;
  title: string;
  image?: string | null;
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "SOLD_OUT" | "EXPIRED" | "DISABLED";
  activity_state: "ACTIVE" | "UNACTIVE";
  total_slots: number;
  available_slots: number;
  claimed_slots: number;
  filled_percent: number;
  expires_at: string;
  created_at: string;
};

function statusClassName(status: PromoRow["status"]): string {
  if (status === "ACTIVE") return "bg-green-500/20 text-green-300";
  if (status === "DRAFT") return "bg-gray-500/20 text-gray-300";
  if (status === "PAUSED") return "bg-yellow-500/20 text-yellow-300";
  if (status === "SOLD_OUT") return "bg-red-500/20 text-red-300";
  if (status === "EXPIRED") return "bg-zinc-500/20 text-zinc-300";
  return "bg-zinc-500/20 text-zinc-300";
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getCountdownLabel(expiresAt: string): string {
  const diffMs = new Date(expiresAt).getTime() - Date.now();
  if (!Number.isFinite(diffMs) || diffMs <= 0) {
    return "Expired";
  }
  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return `${days}d ${hours}h left`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m left`;
  }
  return `${minutes}m left`;
}

export default function MerchantPromosPage() {
  const router = useRouter();
  const params = useParams<{ merchantId: string }>();
  const merchantId = params?.merchantId ?? "";

  const [promos, setPromos] = useState<PromoRow[]>([]);
  const [activityStateFilter, setActivityStateFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [expiringSoon, setExpiringSoon] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [busyPromoId, setBusyPromoId] = useState<string | null>(null);

  const queryString = useMemo(() => {
    const query = new URLSearchParams();
    if (activityStateFilter !== "ALL") {
      query.set("activityState", activityStateFilter);
    }
    if (statusFilter !== "ALL") {
      query.set("status", statusFilter);
    }
    if (expiringSoon) {
      query.set("expiringSoon", "true");
    }
    return query.toString();
  }, [activityStateFilter, statusFilter, expiringSoon]);

  useEffect(() => {
    const fetchPromos = async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const endpoint = queryString
          ? `/api/merchant/promos?merchantId=${merchantId}&${queryString}`
          : `/api/merchant/promos?merchantId=${merchantId}`;
        const response = await fetch(endpoint);
        const json = (await response.json()) as {
          error?: string;
          promos?: PromoRow[];
        };

        if (!response.ok) {
          throw new Error(json.error ?? "Failed to load promos");
        }

        setPromos(json.promos ?? []);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Failed to load promos");
      } finally {
        setLoading(false);
      }
    };

    fetchPromos().catch(() => {
      setLoading(false);
      setErrorMessage("Failed to load promos");
    });
  }, [merchantId, queryString]);

  const updatePromoStatus = async (promo: PromoRow, nextStatus: "ACTIVE" | "PAUSED") => {
    const action = nextStatus === "ACTIVE" ? "ACTIVATE" : "PAUSE";
    setBusyPromoId(promo.id);
    setErrorMessage(null);
    setInfoMessage(null);
    try {
      const response = await fetch(`/api/merchant/promos/${promo.id}/requests?merchantId=${merchantId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const json = (await response.json()) as { error?: string; errors?: string[] };

      if (!response.ok) {
        throw new Error(json.errors?.[0] ?? json.error ?? "Failed to submit request");
      }
      setInfoMessage(
        `Request submitted: ${nextStatus === "ACTIVE" ? "Activate" : "Pause"} promo`,
      );
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to submit request");
    } finally {
      setBusyPromoId(null);
    }
  };

  const softDeletePromo = async (promo: PromoRow) => {
    const accepted = window.confirm(`Request delete for promo \"${promo.title}\"?`);
    if (!accepted) {
      return;
    }

    setBusyPromoId(promo.id);
    setErrorMessage(null);
    setInfoMessage(null);
    try {
      const response = await fetch(`/api/merchant/promos/${promo.id}/requests?merchantId=${merchantId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "DELETE" }),
      });
      const json = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(json.error ?? "Failed to submit delete request");
      }
      setInfoMessage("Delete request sent to admin");
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to submit delete request",
      );
    } finally {
      setBusyPromoId(null);
    }
  };

  return (
    <div className="space-y-6 py-2">
      <section className="relative overflow-hidden rounded-md border border-[#262626] bg-[#1A1A1A] p-6">
        <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#FFB547]/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-10 bottom-0 h-28 w-28 rounded-full bg-[#4FD1C5]/10 blur-3xl" />

        <div className="relative z-10 flex items-end justify-between gap-4">
          <div className="max-w-[75%]">
            <p className="text-xs uppercase tracking-[0.4em] text-[#A1A1AA]">Promo manager</p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight">Merchant promo center</h1>
            <p className="mt-2 text-sm text-[#A1A1AA]">
              Build high-converting offers, review status requests, and keep your promos ready for
              approval.
            </p>
          </div>
        </div>
        <div className="relative z-10 mt-6 flex items-center justify-end gap-4">
          <Link
            href={`/merchant/${merchantId}/promos/new`}
            className="w-full rounded-md bg-[#FFB547] px-4 py-2 text-center font-semibold text-[#111111] shadow-[0_0_0_1px_rgba(17,17,17,0.08)]"
          >
            Create New promo
          </Link>
          
        </div>
      </section>

      <section className="grid gap-3 rounded-med border border-[#262626] bg-[#1A1A1A] p-4">
        <label className="text-xs text-[#A1A1AA]">
          Active side
          <select
            value={activityStateFilter}
            onChange={(event) => setActivityStateFilter(event.target.value)}
            className="mt-1 w-full rounded-xl border border-[#262626] bg-[#111111] px-3 py-2 text-sm"
          >
            <option value="ALL">All</option>
            <option value="ACTIVE">Active</option>
            <option value="UNACTIVE">Unactive</option>
          </select>
        </label>

        <label className="text-xs text-[#A1A1AA]">
          Status
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="mt-1 w-full rounded-xl border border-[#262626] bg-[#111111] px-3 py-2 text-sm"
          >
            <option value="ALL">All</option>
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Active</option>
            <option value="PAUSED">Paused</option>
            <option value="SOLD_OUT">Sold out</option>
            <option value="EXPIRED">Expired</option>
            <option value="DISABLED">Disabled</option>
          </select>
        </label>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={expiringSoon}
              onChange={(event) => setExpiringSoon(event.target.checked)}
            />
            Expiring soon
          </label>
        </div>
      </section>

      {errorMessage ? (
        <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {errorMessage}
        </p>
      ) : null}

      {infoMessage ? (
        <p className="rounded-xl border border-green-500/40 bg-green-500/10 px-3 py-2 text-sm text-green-300">
          {infoMessage}
        </p>
      ) : null}

      {loading ? <p className="text-sm text-[#A1A1AA]">Loading promos...</p> : null}

      {!loading && promos.length === 0 ? (
        <p className="text-sm text-[#A1A1AA] text-center">No promos match your filters.</p>
      ) : null}

      <section className="space-y-3">
        {promos.map((promo) => {
          const isBusy = busyPromoId === promo.id;
          const canActivate = promo.status === "DRAFT" || promo.status === "PAUSED";
          const canPause = promo.status === "ACTIVE";
          return (
            <div
              key={promo.id}
              className="border border-[#262626] bg-[#1A1A1A]"
            >
              <div className="h-80 w-fill overflow-hidden bg-[#111111]">
                  <Image
                    src={getPromoImageUrl(promo.image)}
                    alt={promo.title}
                    width={1200}
                    height={675}
                    className="h-full w-full object-cover"
                  />
              </div>
              <div className="flex items-start gap-3 p-2">
                {/* <div className="h-16 w-fill overflow-hidden rounded-xl bg-[#111111]">
                  {promo.image ? (
                    <img
                      src={promo.image}
                      alt={promo.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] text-[#A1A1AA]">
                      No image
                    </div>
                  )}
                </div> */}

                <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                  <p className="truncate text-sm font-semibold">{promo.title}</p>
                  <span className={`rounded-full px-3 py-1 text-xs ${statusClassName(promo.status)}`}>
                    {promo.status}
                  </span>
                </div>
              </div>

              <div className="mt-3 space-y-2 text-xs text-[#A1A1AA] p-2">
                <p>Slots: {promo.available_slots} remaining</p>
                <p>Expires: {formatDate(promo.expires_at)}</p>
                <p>Created: {formatDate(promo.created_at)}</p>
                {promo.status === "ACTIVE" ? (
                  <p className="text-green-300">{getCountdownLabel(promo.expires_at)}</p>
                ) : null}
              </div>

              <div className="mt-3 p-2">
                <div className="h-2 w-full rounded-full bg-[#262626]">
                  <div
                    className="h-2 rounded-full bg-[#FFB547]"
                    style={{ width: `${promo.filled_percent}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-[#A1A1AA]">
                  {promo.claimed_slots} / {promo.total_slots} claimed
                </p>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 text-xs p-2">
                <Link
                  href={`/merchant/${merchantId}/promos/${promo.id}/edit`}
                  className="rounded-xl border border-[#262626] bg-[#111111] px-3 py-2 text-center"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  disabled={isBusy || (!canActivate && !canPause)}
                  onClick={() =>
                    updatePromoStatus(
                      promo,
                      canPause ? "PAUSED" : "ACTIVE",
                    )
                  }
                  className="rounded-xl border border-[#262626] bg-[#111111] px-3 py-2 disabled:opacity-50"
                >
                  {canPause ? "Request pause" : canActivate ? "Request activate" : "Locked"}
                </button>
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => softDeletePromo(promo)}
                  className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-red-300 disabled:opacity-50"
                >
                  Request delete
                </button>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
