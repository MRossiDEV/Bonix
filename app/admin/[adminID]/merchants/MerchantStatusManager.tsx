"use client";

import { useMemo, useState } from "react";

type MerchantStatus =
  | "PENDING"
  | "ACTIVE"
  | "REJECTED"
  | "INACTIVE"
  | "PAUSED"
  | string;

type MerchantSummary = {
  id: string;
  businessName: string;
  status: MerchantStatus;
  createdAt: string;
};

type MerchantStatusManagerProps = {
  merchants: MerchantSummary[];
};

const statusOptions: MerchantStatus[] = [
  "PENDING",
  "ACTIVE",
  "REJECTED",
  "INACTIVE",
  "PAUSED",
];

export default function MerchantStatusManager({
  merchants,
}: MerchantStatusManagerProps) {
  const [items, setItems] = useState<MerchantSummary[]>(merchants);
  const [filter, setFilter] = useState<string>("ALL");
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const formatter = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        month: "numeric",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      }),
    []
  );

  const sortedItems = useMemo(() => {
    const list = [...items];
    list.sort((a, b) => {
      if (filter === "ALL") {
        const aPending = a.status === "PENDING";
        const bPending = b.status === "PENDING";
        if (aPending !== bPending) return aPending ? -1 : 1;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return list;
  }, [items, filter]);

  const filteredItems = useMemo(() => {
    if (filter === "ALL") return sortedItems;
    return sortedItems.filter((item) => item.status === filter);
  }, [filter, sortedItems]);

  const setBusyFor = (id: string, value: boolean) => {
    setBusy((prev) => ({ ...prev, [id]: value }));
  };

  const handleStatusChange = async (id: string, nextStatus: string) => {
    setError(null);
    setBusyFor(id, true);

    try {
      const response = await fetch(`/api/admin/merchants/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(payload?.error ?? "Update failed");
      }

      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: nextStatus } : item
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusyFor(id, false);
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Merchant list</h2>
        <label className="flex items-center gap-2 text-xs text-[#94A3B8]">
          Filter
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className="rounded-2xl border border-[#1F2937] bg-[#0F172A] px-3 py-2 text-xs text-[#E2E8F0]"
          >
            <option value="ALL">All (pending first)</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error ? (
        <div className="rounded-2xl border border-[#F97316] bg-[#1C1917] px-4 py-3 text-sm text-[#FDBA74]">
          {error}
        </div>
      ) : null}

      <div className="space-y-4">
        {filteredItems.map((merchant) => (
          <article
            key={merchant.id}
            className="rounded-3xl border border-[#1F2937] bg-[#0F172A] p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-lg font-semibold">{merchant.businessName}</p>
                <p className="mt-1 text-sm text-[#94A3B8]">
                  Submitted {formatter.format(new Date(merchant.createdAt))}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    merchant.status === "PENDING"
                      ? "bg-[#F97316] text-[#0B0F14]"
                      : merchant.status === "ACTIVE"
                        ? "bg-[#22C55E] text-[#0B0F14]"
                        : "bg-[#334155] text-[#E2E8F0]"
                  }`}
                >
                  {merchant.status}
                </span>
                <select
                  value={merchant.status}
                  onChange={(event) =>
                    handleStatusChange(merchant.id, event.target.value)
                  }
                  disabled={!!busy[merchant.id]}
                  className="rounded-2xl border border-[#1F2937] bg-[#0B1220] px-3 py-2 text-xs text-[#E2E8F0] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
