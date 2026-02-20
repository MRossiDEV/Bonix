"use client";

import { useMemo, useState } from "react";

type AgentStatus = "PENDING" | "ACTIVE" | "REJECTED" | "INACTIVE" | "PAUSED" | string;

type AgentSummary = {
  id: string;
  name: string;
  email: string;
  region: string;
  status: AgentStatus;
  createdAt: string;
};

type AgentStatusManagerProps = {
  agents: AgentSummary[];
};

const statusOptions: AgentStatus[] = [
  "PENDING",
  "ACTIVE",
  "REJECTED",
  "INACTIVE",
  "PAUSED",
];

export default function AgentStatusManager({ agents }: AgentStatusManagerProps) {
  const [items, setItems] = useState<AgentSummary[]>(agents);
  const [filter, setFilter] = useState<string>("ALL");
  const [regionQuery, setRegionQuery] = useState<string>("");
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
    let list = sortedItems;
    if (filter !== "ALL") {
      list = list.filter((item) => item.status === filter);
    }
    if (regionQuery.trim()) {
      const needle = regionQuery.trim().toLowerCase();
      list = list.filter((item) => item.region.toLowerCase().includes(needle));
    }
    return list;
  }, [filter, regionQuery, sortedItems]);

  const setBusyFor = (id: string, value: boolean) => {
    setBusy((prev) => ({ ...prev, [id]: value }));
  };

  const handleStatusChange = async (id: string, nextStatus: string) => {
    setError(null);
    setBusyFor(id, true);

    try {
      const response = await fetch(`/api/admin/agents/${id}/status`, {
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
        <h2 className="text-lg font-semibold">Agent list</h2>
        <div className="flex flex-wrap items-center gap-3">
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
          <label className="flex items-center gap-2 text-xs text-[#94A3B8]">
            Region
            <input
              value={regionQuery}
              onChange={(event) => setRegionQuery(event.target.value)}
              className="w-36 rounded-2xl border border-[#1F2937] bg-[#0F172A] px-3 py-2 text-xs text-[#E2E8F0]"
              placeholder="Search"
            />
          </label>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-[#F97316] bg-[#1C1917] px-4 py-3 text-sm text-[#FDBA74]">
          {error}
        </div>
      ) : null}

      <div className="space-y-4">
        {filteredItems.map((agent) => (
          <article
            key={agent.id}
            className="rounded-3xl border border-[#1F2937] bg-[#0F172A] p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-lg font-semibold">{agent.name}</p>
                <p className="mt-1 text-sm text-[#94A3B8]">
                  {agent.region} · {agent.email}
                </p>
                <p className="mt-1 text-xs text-[#64748B]">
                  Submitted {formatter.format(new Date(agent.createdAt))}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    agent.status === "PENDING"
                      ? "bg-[#F97316] text-[#0B0F14]"
                      : agent.status === "ACTIVE"
                        ? "bg-[#22C55E] text-[#0B0F14]"
                        : "bg-[#334155] text-[#E2E8F0]"
                  }`}
                >
                  {agent.status}
                </span>
                <select
                  value={agent.status}
                  onChange={(event) =>
                    handleStatusChange(agent.id, event.target.value)
                  }
                  disabled={!!busy[agent.id]}
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
