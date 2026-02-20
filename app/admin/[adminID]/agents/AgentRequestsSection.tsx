"use client";

import { useMemo, useState } from "react";

type AgentRequest = {
  id: string;
  email: string;
  region: string;
  status: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    createdAt: string;
    roles: string[];
  } | null;
};

type AgentRequestsSectionProps = {
  requests: AgentRequest[];
};

export default function AgentRequestsSection({
  requests,
}: AgentRequestsSectionProps) {
  const [items, setItems] = useState<AgentRequest[]>(requests);
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const formatter = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      }),
    []
  );

  const formatDate = (value: string | null | undefined) => {
    if (!value) return "Unknown";
    const timestamp = Date.parse(value);
    if (Number.isNaN(timestamp)) return "Unknown";
    return formatter.format(new Date(timestamp));
  };

  const setBusyFor = (id: string, value: boolean) => {
    setBusy((prev) => ({ ...prev, [id]: value }));
  };

  const handleAction = async (id: string, action: "approve" | "reject") => {
    setError(null);
    setNotice(null);

    if (action === "reject") {
      const confirmReject = window.confirm("Reject this agent request?");
      if (!confirmReject) return;
    }

    const reason =
      action === "reject"
        ? window.prompt("Optional rejection reason?") ?? undefined
        : undefined;

    setBusyFor(id, true);
    try {
      const response = await fetch(`/api/admin/agents/${id}/${action}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: reason ? JSON.stringify({ reason }) : undefined,
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(payload?.error ?? "Request failed");
      }

      setItems((prev) => prev.filter((item) => item.id !== id));
      setNotice(action === "approve" ? "Agent approved." : "Agent rejected.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setBusyFor(id, false);
    }
  };

  return (
    <section className="rounded-3xl border border-[#1F2937] bg-[#0F172A] p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Agent requests</h2>
          <p className="mt-2 text-sm text-[#94A3B8]">
            Approve agent applications and assign access.
          </p>
        </div>
        <span className="rounded-full border border-[#1F2937] bg-[#111827] px-3 py-1 text-xs font-semibold text-[#94A3B8]">
          {items.length} pending
        </span>
      </div>

      {error ? (
        <div className="mt-4 rounded-2xl border border-[#F97316] bg-[#1C1917] px-4 py-3 text-sm text-[#FDBA74]">
          {error}
        </div>
      ) : null}

      {notice ? (
        <div className="mt-4 rounded-2xl border border-[#1F2937] bg-[#0B1220] px-4 py-3 text-sm text-[#A7F3D0]">
          {notice}
        </div>
      ) : null}

      {items.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-[#1F2937] bg-[#0B1220] px-4 py-6 text-sm text-[#94A3B8]">
          No pending agent requests right now.
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {items.map((request) => (
            <article
              key={request.id}
              className="rounded-3xl border border-[#1F2937] bg-[#0B1220] p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                  <div>
                    <p className="text-lg font-semibold">
                      {request.user?.name ?? "Agent applicant"}
                    </p>
                    <p className="text-sm text-[#94A3B8]">
                      Region: {request.region}
                    </p>
                  </div>
                  <div className="text-sm text-[#94A3B8]">
                    <p>Applicant email: {request.email}</p>
                    {request.user ? (
                      <p>User email: {request.user.email}</p>
                    ) : null}
                    {request.user?.phone ? (
                      <p>Phone: {request.user.phone}</p>
                    ) : null}
                  </div>
                  <div className="text-xs text-[#64748B]">
                    Submitted {formatDate(request.createdAt)}
                  </div>
                  {request.user ? (
                    <div className="rounded-2xl border border-[#1F2937] bg-[#0F172A] px-4 py-3 text-sm text-[#94A3B8]">
                      <p className="text-xs uppercase tracking-[0.2em] text-[#64748B]">
                        User profile
                      </p>
                      <p className="mt-2 font-medium text-[#E2E8F0]">
                        {request.user.name}
                      </p>
                      <p>{request.user.email}</p>
                      {request.user.phone ? <p>{request.user.phone}</p> : null}
                      <p className="text-xs text-[#64748B]">
                        Joined {formatDate(request.user.createdAt)}
                      </p>
                      {request.user.roles.length > 0 ? (
                        <p className="text-xs text-[#64748B]">
                          Roles: {request.user.roles.join(", ")}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    className="rounded-2xl bg-[#22C55E] px-4 py-2 text-sm font-semibold text-[#0B0F14] transition hover:bg-[#16A34A] disabled:cursor-not-allowed disabled:opacity-70"
                    onClick={() => handleAction(request.id, "approve")}
                    disabled={!!busy[request.id]}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className="rounded-2xl border border-[#F97316] px-4 py-2 text-sm font-semibold text-[#F97316] transition hover:bg-[#2B1B12] disabled:cursor-not-allowed disabled:opacity-70"
                    onClick={() => handleAction(request.id, "reject")}
                    disabled={!!busy[request.id]}
                  >
                    Reject
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
