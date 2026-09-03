"use client";

import { useMemo, useState } from "react";

type AgentStatus = "active" | "pending" | "suspended" | "offline";
type AgentRole = "Sales Agent" | "Promo Agent" | "Support Agent" | "Admin Agent";

type Agent = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: AgentRole;
  city: string;
  status: AgentStatus;
  assignedMerchants: number;
  activePromos: number;
  conversions: number;
  revenue: number;
  joinedAt: string;
  lastActive: string;
};

const initialAgents: Agent[] = [
  {
    id: "AG-001",
    name: "Sofia Martinez",
    email: "sofia@bonix.app",
    phone: "+598 99 234 567",
    role: "Sales Agent",
    city: "Montevideo",
    status: "active",
    assignedMerchants: 24,
    activePromos: 18,
    conversions: 142,
    revenue: 18450,
    joinedAt: "Jan 12, 2026",
    lastActive: "2 min ago",
  },
  {
    id: "AG-002",
    name: "Lucas Pereira",
    email: "lucas@bonix.app",
    phone: "+598 98 456 321",
    role: "Promo Agent",
    city: "Montevideo",
    status: "active",
    assignedMerchants: 19,
    activePromos: 27,
    conversions: 118,
    revenue: 15320,
    joinedAt: "Jan 20, 2026",
    lastActive: "8 min ago",
  },
  {
    id: "AG-003",
    name: "Valentina Silva",
    email: "valentina@bonix.app",
    phone: "+598 96 876 543",
    role: "Support Agent",
    city: "Canelones",
    status: "active",
    assignedMerchants: 11,
    activePromos: 9,
    conversions: 76,
    revenue: 9240,
    joinedAt: "Feb 03, 2026",
    lastActive: "14 min ago",
  },
  {
    id: "AG-004",
    name: "Mateo Rodriguez",
    email: "mateo@bonix.app",
    phone: "+598 95 123 456",
    role: "Sales Agent",
    city: "Punta del Este",
    status: "offline",
    assignedMerchants: 31,
    activePromos: 21,
    conversions: 189,
    revenue: 24680,
    joinedAt: "Dec 18, 2025",
    lastActive: "3 hours ago",
  },
  {
    id: "AG-005",
    name: "Camila Fernandez",
    email: "camila@bonix.app",
    phone: "+598 94 555 222",
    role: "Promo Agent",
    city: "Montevideo",
    status: "pending",
    assignedMerchants: 0,
    activePromos: 0,
    conversions: 0,
    revenue: 0,
    joinedAt: "Aug 28, 2026",
    lastActive: "Never",
  },
  {
    id: "AG-006",
    name: "Diego Costa",
    email: "diego@bonix.app",
    phone: "+598 93 444 111",
    role: "Sales Agent",
    city: "Maldonado",
    status: "active",
    assignedMerchants: 17,
    activePromos: 14,
    conversions: 97,
    revenue: 12780,
    joinedAt: "Mar 15, 2026",
    lastActive: "31 min ago",
  },
  {
    id: "AG-007",
    name: "Ana Torres",
    email: "ana@bonix.app",
    phone: "+598 92 333 777",
    role: "Support Agent",
    city: "Montevideo",
    status: "suspended",
    assignedMerchants: 8,
    activePromos: 4,
    conversions: 31,
    revenue: 4120,
    joinedAt: "Apr 02, 2026",
    lastActive: "2 days ago",
  },
  {
    id: "AG-008",
    name: "Nicolas Gomez",
    email: "nicolas@bonix.app",
    phone: "+598 91 222 888",
    role: "Admin Agent",
    city: "Montevideo",
    status: "active",
    assignedMerchants: 36,
    activePromos: 32,
    conversions: 224,
    revenue: 31200,
    joinedAt: "Nov 24, 2025",
    lastActive: "5 min ago",
  },
];

const emptyAgent: Omit<Agent, "id" | "joinedAt" | "lastActive"> = {
  name: "",
  email: "",
  phone: "",
  role: "Sales Agent",
  city: "Montevideo",
  status: "pending",
  assignedMerchants: 0,
  activePromos: 0,
  conversions: 0,
  revenue: 0,
};

function StatusBadge({ status }: { status: AgentStatus }) {
  const config: Record<
    AgentStatus,
    { label: string; classes: string; dot: string }
  > = {
    active: {
      label: "Active",
      classes:
        "border-[#22C55E]/20 bg-[#22C55E]/10 text-[#22C55E]",
      dot: "bg-[#22C55E]",
    },
    pending: {
      label: "Pending",
      classes:
        "border-[#F59E0B]/20 bg-[#F59E0B]/10 text-[#F59E0B]",
      dot: "bg-[#F59E0B]",
    },
    suspended: {
      label: "Suspended",
      classes:
        "border-[#EF4444]/20 bg-[#EF4444]/10 text-[#EF4444]",
      dot: "bg-[#EF4444]",
    },
    offline: {
      label: "Offline",
      classes:
        "border-[#64748B]/20 bg-[#64748B]/10 text-[#94A3B8]",
      dot: "bg-[#64748B]",
    },
  };

  const item = config[status];

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium ${item.classes}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${item.dot}`} />
      {item.label}
    </span>
  );
}

function RoleBadge({ role }: { role: AgentRole }) {
  return (
    <span className="inline-flex rounded-lg border border-[#1F2937] bg-[#111827] px-2.5 py-1 text-xs font-medium text-[#CBD5E1]">
      {role}
    </span>
  );
}

function AgentAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#22C55E]/10 text-sm font-semibold text-[#22C55E] ring-1 ring-[#22C55E]/20">
      {initials}
    </div>
  );
}

function Modal({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div
        className={`w-full ${
          wide ? "max-w-3xl" : "max-w-lg"
        } max-h-[90vh] overflow-y-auto rounded-3xl border border-[#1F2937] bg-[#0F172A] shadow-2xl`}
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-[#1F2937] bg-[#0F172A]/95 px-5 py-4 backdrop-blur">
          <h2 className="text-lg font-semibold text-[#F8FAFC]">{title}</h2>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-[#64748B] transition hover:bg-[#111827] hover:text-[#F8FAFC]"
            aria-label="Close"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>(initialAgents);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | AgentStatus>(
    "all"
  );
  const [roleFilter, setRoleFilter] = useState<"all" | AgentRole>("all");
  const [cityFilter, setCityFilter] = useState("all");

  const [page, setPage] = useState(1);
  const pageSize = 8;

  const [modalOpen, setModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);

  const [viewingAgent, setViewingAgent] = useState<Agent | null>(null);
  const [deletingAgent, setDeletingAgent] = useState<Agent | null>(null);

  const [form, setForm] = useState(emptyAgent);

  const cities = useMemo(
    () => Array.from(new Set(agents.map((agent) => agent.city))),
    [agents]
  );

  const filteredAgents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return agents.filter((agent) => {
      const matchesSearch =
        !query ||
        agent.name.toLowerCase().includes(query) ||
        agent.email.toLowerCase().includes(query) ||
        agent.phone.toLowerCase().includes(query) ||
        agent.id.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" || agent.status === statusFilter;

      const matchesRole =
        roleFilter === "all" || agent.role === roleFilter;

      const matchesCity =
        cityFilter === "all" || agent.city === cityFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesRole &&
        matchesCity
      );
    });
  }, [agents, search, statusFilter, roleFilter, cityFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAgents.length / pageSize)
  );

  const currentPage = Math.min(page, totalPages);

  const paginatedAgents = filteredAgents.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalAgents = agents.length;
  const activeAgents = agents.filter(
    (agent) => agent.status === "active"
  ).length;
  const pendingAgents = agents.filter(
    (agent) => agent.status === "pending"
  ).length;
  const totalRevenue = agents.reduce(
    (sum, agent) => sum + agent.revenue,
    0
  );

  function resetFilters() {
    setSearch("");
    setStatusFilter("all");
    setRoleFilter("all");
    setCityFilter("all");
    setPage(1);
  }

  function openCreateModal() {
    setEditingAgent(null);
    setForm(emptyAgent);
    setModalOpen(true);
  }

  function openEditModal(agent: Agent) {
    setEditingAgent(agent);

    setForm({
      name: agent.name,
      email: agent.email,
      phone: agent.phone,
      role: agent.role,
      city: agent.city,
      status: agent.status,
      assignedMerchants: agent.assignedMerchants,
      activePromos: agent.activePromos,
      conversions: agent.conversions,
      revenue: agent.revenue,
    });

    setModalOpen(true);
  }

  function saveAgent() {
    if (!form.name.trim() || !form.email.trim()) {
      return;
    }

    if (editingAgent) {
      setAgents((current) =>
        current.map((agent) =>
          agent.id === editingAgent.id
            ? {
                ...agent,
                ...form,
              }
            : agent
        )
      );
    } else {
      const newAgent: Agent = {
        id: `AG-${String(agents.length + 1).padStart(3, "0")}`,
        ...form,
        joinedAt: "Sep 02, 2026",
        lastActive: "Never",
      };

      setAgents((current) => [newAgent, ...current]);
    }

    setModalOpen(false);
  }

  function deleteAgent() {
    if (!deletingAgent) return;

    setAgents((current) =>
      current.filter((agent) => agent.id !== deletingAgent.id)
    );

    setDeletingAgent(null);
  }

  function updateForm<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K]
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  return (
    <div className="relative min-h-full space-y-6 overflow-hidden p-4 sm:p-6 lg:p-8">
      {/* Background glow */}
      <div className="pointer-events-none absolute -top-32 right-1/4 h-72 w-72 rounded-full bg-[#22C55E]/10 blur-[130px]" />

      {/* Header */}
      <section className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-[#22C55E]">
            AGENT MANAGEMENT
          </p>

          <h1 className="text-2xl font-bold tracking-tight text-[#F8FAFC] sm:text-3xl">
            Agents
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-[#94A3B8]">
            Manage Bonix agents, assignments, activity and performance.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#22C55E] px-4 text-sm font-semibold text-[#04110A] transition hover:bg-[#4ADE80]"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add Agent
        </button>
      </section>

      {/* Stats */}
      <section className="relative grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-[#1F2937] bg-[#0F172A]/80 p-4">
          <p className="text-xs text-[#64748B]">Total Agents</p>
          <p className="mt-2 text-2xl font-bold text-[#F8FAFC]">
            {totalAgents}
          </p>
          <p className="mt-1 text-xs text-[#22C55E]">
            +12% this month
          </p>
        </div>

        <div className="rounded-2xl border border-[#1F2937] bg-[#0F172A]/80 p-4">
          <p className="text-xs text-[#64748B]">Active</p>
          <p className="mt-2 text-2xl font-bold text-[#F8FAFC]">
            {activeAgents}
          </p>
          <p className="mt-1 text-xs text-[#94A3B8]">
            {totalAgents
              ? Math.round((activeAgents / totalAgents) * 100)
              : 0}
            % of agents
          </p>
        </div>

        <div className="rounded-2xl border border-[#1F2937] bg-[#0F172A]/80 p-4">
          <p className="text-xs text-[#64748B]">Pending</p>
          <p className="mt-2 text-2xl font-bold text-[#F8FAFC]">
            {pendingAgents}
          </p>
          <p className="mt-1 text-xs text-[#F59E0B]">
            Requires review
          </p>
        </div>

        <div className="rounded-2xl border border-[#1F2937] bg-[#0F172A]/80 p-4">
          <p className="text-xs text-[#64748B]">Revenue Generated</p>
          <p className="mt-2 text-2xl font-bold text-[#F8FAFC]">
            ${totalRevenue.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-[#22C55E]">
            Across all agents
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="relative rounded-2xl border border-[#1F2937] bg-[#0F172A]/80 p-3 sm:p-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(240px,1fr)_160px_180px_160px_auto]">
          {/* Search */}
          <div className="relative">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-4-4" />
            </svg>

            <input
              type="text"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search agents..."
              className="h-11 w-full rounded-xl border border-[#1F2937] bg-[#0B0F14] pl-10 pr-3 text-sm text-[#F8FAFC] outline-none placeholder:text-[#64748B] focus:border-[#22C55E]/50"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(
                event.target.value as "all" | AgentStatus
              );
              setPage(1);
            }}
            className="h-11 rounded-xl border border-[#1F2937] bg-[#0B0F14] px-3 text-sm text-[#CBD5E1] outline-none focus:border-[#22C55E]/50"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="offline">Offline</option>
            <option value="suspended">Suspended</option>
          </select>

          <select
            value={roleFilter}
            onChange={(event) => {
              setRoleFilter(
                event.target.value as "all" | AgentRole
              );
              setPage(1);
            }}
            className="h-11 rounded-xl border border-[#1F2937] bg-[#0B0F14] px-3 text-sm text-[#CBD5E1] outline-none focus:border-[#22C55E]/50"
          >
            <option value="all">All Roles</option>
            <option value="Sales Agent">Sales Agent</option>
            <option value="Promo Agent">Promo Agent</option>
            <option value="Support Agent">Support Agent</option>
            <option value="Admin Agent">Admin Agent</option>
          </select>

          <select
            value={cityFilter}
            onChange={(event) => {
              setCityFilter(event.target.value);
              setPage(1);
            }}
            className="h-11 rounded-xl border border-[#1F2937] bg-[#0B0F14] px-3 text-sm text-[#CBD5E1] outline-none focus:border-[#22C55E]/50"
          >
            <option value="all">All Cities</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={resetFilters}
            className="h-11 rounded-xl border border-[#1F2937] bg-[#111827] px-4 text-sm font-medium text-[#94A3B8] transition hover:border-[#334155] hover:text-[#F8FAFC]"
          >
            Reset
          </button>
        </div>
      </section>

      {/* Desktop table */}
      <section className="relative hidden overflow-hidden rounded-2xl border border-[#1F2937] bg-[#0F172A]/80 lg:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead>
              <tr className="border-b border-[#1F2937] bg-[#0B0F14]/60">
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  Agent
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  Role
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  Location
                </th>
                <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  Merchants
                </th>
                <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  Promos
                </th>
                <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  Conversions
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  Status
                </th>
                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {paginatedAgents.map((agent) => (
                <tr
                  key={agent.id}
                  className="border-b border-[#1F2937]/70 transition hover:bg-[#111827]/60"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <AgentAvatar name={agent.name} />

                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={() => setViewingAgent(agent)}
                          className="block truncate text-sm font-semibold text-[#F8FAFC] hover:text-[#22C55E]"
                        >
                          {agent.name}
                        </button>

                        <p className="mt-0.5 text-xs text-[#64748B]">
                          {agent.id} · {agent.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <RoleBadge role={agent.role} />
                  </td>

                  <td className="px-5 py-4 text-sm text-[#CBD5E1]">
                    {agent.city}
                  </td>

                  <td className="px-5 py-4 text-center text-sm font-semibold text-[#F8FAFC]">
                    {agent.assignedMerchants}
                  </td>

                  <td className="px-5 py-4 text-center text-sm font-semibold text-[#F8FAFC]">
                    {agent.activePromos}
                  </td>

                  <td className="px-5 py-4 text-center">
                    <div>
                      <p className="text-sm font-semibold text-[#F8FAFC]">
                        {agent.conversions}
                      </p>
                      <p className="mt-0.5 text-[11px] text-[#64748B]">
                        conversions
                      </p>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <StatusBadge status={agent.status} />
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setViewingAgent(agent)}
                        className="rounded-lg border border-[#1F2937] bg-[#111827] px-3 py-2 text-xs font-medium text-[#94A3B8] transition hover:text-[#F8FAFC]"
                      >
                        View
                      </button>

                      <button
                        type="button"
                        onClick={() => openEditModal(agent)}
                        className="rounded-lg border border-[#22C55E]/20 bg-[#22C55E]/10 px-3 py-2 text-xs font-medium text-[#22C55E] transition hover:bg-[#22C55E]/15"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeletingAgent(agent)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#1F2937] bg-[#111827] text-[#64748B] transition hover:border-[#EF4444]/20 hover:bg-[#EF4444]/10 hover:text-[#EF4444]"
                        aria-label={`Delete ${agent.name}`}
                      >
                        <svg
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        >
                          <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {paginatedAgents.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-16 text-center"
                  >
                    <p className="text-sm font-medium text-[#CBD5E1]">
                      No agents found
                    </p>
                    <p className="mt-1 text-xs text-[#64748B]">
                      Try changing your search or filters.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-[#1F2937] px-5 py-4">
          <p className="text-xs text-[#64748B]">
            Showing{" "}
            <span className="font-medium text-[#CBD5E1]">
              {filteredAgents.length === 0
                ? 0
                : (currentPage - 1) * pageSize + 1}
              –
              {Math.min(
                currentPage * pageSize,
                filteredAgents.length
              )}
            </span>{" "}
            of{" "}
            <span className="font-medium text-[#CBD5E1]">
              {filteredAgents.length}
            </span>
          </p>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#1F2937] text-[#94A3B8] transition hover:text-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-30"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1)
              .slice(
                Math.max(0, currentPage - 2),
                Math.min(totalPages, currentPage + 1)
              )
              .map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => setPage(pageNumber)}
                  className={`h-8 min-w-8 rounded-lg px-2 text-xs font-medium transition ${
                    currentPage === pageNumber
                      ? "bg-[#22C55E] text-[#04110A]"
                      : "border border-[#1F2937] text-[#94A3B8] hover:text-[#F8FAFC]"
                  }`}
                >
                  {pageNumber}
                </button>
              ))}

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() =>
                setPage((value) => Math.min(totalPages, value + 1))
              }
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#1F2937] text-[#94A3B8] transition hover:text-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-30"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Mobile cards */}
      <section className="relative space-y-3 lg:hidden">
        {paginatedAgents.map((agent) => (
          <article
            key={agent.id}
            className="rounded-2xl border border-[#1F2937] bg-[#0F172A]/80 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <AgentAvatar name={agent.name} />

                <div className="min-w-0">
                  <button
                    type="button"
                    onClick={() => setViewingAgent(agent)}
                    className="truncate text-left text-sm font-semibold text-[#F8FAFC]"
                  >
                    {agent.name}
                  </button>

                  <p className="mt-0.5 text-xs text-[#64748B]">
                    {agent.id}
                  </p>
                </div>
              </div>

              <StatusBadge status={agent.status} />
            </div>

            <div className="mt-4">
              <RoleBadge role={agent.role} />
            </div>

            <div className="mt-4 grid grid-cols-3 divide-x divide-[#1F2937] rounded-xl border border-[#1F2937] bg-[#0B0F14]">
              <div className="p-3 text-center">
                <p className="text-sm font-bold text-[#F8FAFC]">
                  {agent.assignedMerchants}
                </p>
                <p className="mt-1 text-[10px] text-[#64748B]">
                  Merchants
                </p>
              </div>

              <div className="p-3 text-center">
                <p className="text-sm font-bold text-[#F8FAFC]">
                  {agent.activePromos}
                </p>
                <p className="mt-1 text-[10px] text-[#64748B]">
                  Promos
                </p>
              </div>

              <div className="p-3 text-center">
                <p className="text-sm font-bold text-[#F8FAFC]">
                  {agent.conversions}
                </p>
                <p className="mt-1 text-[10px] text-[#64748B]">
                  Conversions
                </p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-[#64748B]">
                {agent.city}
              </span>

              <span className="text-[#64748B]">
                Active {agent.lastActive}
              </span>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setViewingAgent(agent)}
                className="flex-1 rounded-xl border border-[#1F2937] bg-[#111827] py-2.5 text-xs font-medium text-[#CBD5E1]"
              >
                View
              </button>

              <button
                type="button"
                onClick={() => openEditModal(agent)}
                className="flex-1 rounded-xl bg-[#22C55E]/10 py-2.5 text-xs font-semibold text-[#22C55E]"
              >
                Edit
              </button>

              <button
                type="button"
                onClick={() => setDeletingAgent(agent)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#1F2937] text-[#64748B]"
                aria-label={`Delete ${agent.name}`}
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
                </svg>
              </button>
            </div>
          </article>
        ))}

        {paginatedAgents.length === 0 && (
          <div className="rounded-2xl border border-[#1F2937] bg-[#0F172A]/80 px-5 py-12 text-center">
            <p className="text-sm font-medium text-[#CBD5E1]">
              No agents found
            </p>
            <p className="mt-1 text-xs text-[#64748B]">
              Try changing your search or filters.
            </p>
          </div>
        )}

        {/* Mobile pagination */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-[#64748B]">
            Page {currentPage} of {totalPages}
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              className="rounded-lg border border-[#1F2937] px-3 py-2 text-xs text-[#94A3B8] disabled:opacity-30"
            >
              Previous
            </button>

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() =>
                setPage((value) => Math.min(totalPages, value + 1))
              }
              className="rounded-lg border border-[#1F2937] px-3 py-2 text-xs text-[#94A3B8] disabled:opacity-30"
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {/* Create / Edit modal */}
      {modalOpen && (
        <Modal
          title={editingAgent ? "Edit Agent" : "Add Agent"}
          onClose={() => setModalOpen(false)}
          wide
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-2 block text-xs font-medium text-[#94A3B8]">
                Full Name
              </label>

              <input
                value={form.name}
                onChange={(event) =>
                  updateForm("name", event.target.value)
                }
                placeholder="Agent name"
                className="h-11 w-full rounded-xl border border-[#1F2937] bg-[#0B0F14] px-3 text-sm text-[#F8FAFC] outline-none placeholder:text-[#64748B] focus:border-[#22C55E]/50"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-[#94A3B8]">
                Email
              </label>

              <input
                type="email"
                value={form.email}
                onChange={(event) =>
                  updateForm("email", event.target.value)
                }
                placeholder="agent@bonix.app"
                className="h-11 w-full rounded-xl border border-[#1F2937] bg-[#0B0F14] px-3 text-sm text-[#F8FAFC] outline-none placeholder:text-[#64748B] focus:border-[#22C55E]/50"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-[#94A3B8]">
                Phone
              </label>

              <input
                value={form.phone}
                onChange={(event) =>
                  updateForm("phone", event.target.value)
                }
                placeholder="+598..."
                className="h-11 w-full rounded-xl border border-[#1F2937] bg-[#0B0F14] px-3 text-sm text-[#F8FAFC] outline-none placeholder:text-[#64748B] focus:border-[#22C55E]/50"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-[#94A3B8]">
                Role
              </label>

              <select
                value={form.role}
                onChange={(event) =>
                  updateForm(
                    "role",
                    event.target.value as AgentRole
                  )
                }
                className="h-11 w-full rounded-xl border border-[#1F2937] bg-[#0B0F14] px-3 text-sm text-[#CBD5E1] outline-none focus:border-[#22C55E]/50"
              >
                <option value="Sales Agent">Sales Agent</option>
                <option value="Promo Agent">Promo Agent</option>
                <option value="Support Agent">Support Agent</option>
                <option value="Admin Agent">Admin Agent</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-[#94A3B8]">
                Status
              </label>

              <select
                value={form.status}
                onChange={(event) =>
                  updateForm(
                    "status",
                    event.target.value as AgentStatus
                  )
                }
                className="h-11 w-full rounded-xl border border-[#1F2937] bg-[#0B0F14] px-3 text-sm text-[#CBD5E1] outline-none focus:border-[#22C55E]/50"
              >
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="offline">Offline</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-[#94A3B8]">
                City
              </label>

              <input
                value={form.city}
                onChange={(event) =>
                  updateForm("city", event.target.value)
                }
                className="h-11 w-full rounded-xl border border-[#1F2937] bg-[#0B0F14] px-3 text-sm text-[#F8FAFC] outline-none focus:border-[#22C55E]/50"
              />
            </div>

            {editingAgent && (
              <>
                <div>
                  <label className="mb-2 block text-xs font-medium text-[#94A3B8]">
                    Assigned Merchants
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={form.assignedMerchants}
                    onChange={(event) =>
                      updateForm(
                        "assignedMerchants",
                        Number(event.target.value)
                      )
                    }
                    className="h-11 w-full rounded-xl border border-[#1F2937] bg-[#0B0F14] px-3 text-sm text-[#F8FAFC] outline-none focus:border-[#22C55E]/50"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-[#94A3B8]">
                    Active Promos
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={form.activePromos}
                    onChange={(event) =>
                      updateForm(
                        "activePromos",
                        Number(event.target.value)
                      )
                    }
                    className="h-11 w-full rounded-xl border border-[#1F2937] bg-[#0B0F14] px-3 text-sm text-[#F8FAFC] outline-none focus:border-[#22C55E]/50"
                  />
                </div>
              </>
            )}
          </div>

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="h-11 rounded-xl border border-[#1F2937] bg-[#111827] px-5 text-sm font-medium text-[#94A3B8] hover:text-[#F8FAFC]"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={saveAgent}
              disabled={!form.name.trim() || !form.email.trim()}
              className="h-11 rounded-xl bg-[#22C55E] px-5 text-sm font-semibold text-[#04110A] transition hover:bg-[#4ADE80] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {editingAgent ? "Save Changes" : "Create Agent"}
            </button>
          </div>
        </Modal>
      )}

      {/* View modal */}
      {viewingAgent && (
        <Modal
          title="Agent Details"
          onClose={() => setViewingAgent(null)}
          wide
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <AgentAvatar name={viewingAgent.name} />

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-bold text-[#F8FAFC]">
                  {viewingAgent.name}
                </h3>

                <StatusBadge status={viewingAgent.status} />
              </div>

              <p className="mt-1 text-sm text-[#64748B]">
                {viewingAgent.id}
              </p>

              <div className="mt-3">
                <RoleBadge role={viewingAgent.role} />
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-[#1F2937] bg-[#0B0F14] p-4">
              <p className="text-xs text-[#64748B]">Merchants</p>
              <p className="mt-2 text-xl font-bold text-[#F8FAFC]">
                {viewingAgent.assignedMerchants}
              </p>
            </div>

            <div className="rounded-2xl border border-[#1F2937] bg-[#0B0F14] p-4">
              <p className="text-xs text-[#64748B]">Promos</p>
              <p className="mt-2 text-xl font-bold text-[#F8FAFC]">
                {viewingAgent.activePromos}
              </p>
            </div>

            <div className="rounded-2xl border border-[#1F2937] bg-[#0B0F14] p-4">
              <p className="text-xs text-[#64748B]">Conversions</p>
              <p className="mt-2 text-xl font-bold text-[#F8FAFC]">
                {viewingAgent.conversions}
              </p>
            </div>

            <div className="rounded-2xl border border-[#1F2937] bg-[#0B0F14] p-4">
              <p className="text-xs text-[#64748B]">Revenue</p>
              <p className="mt-2 text-xl font-bold text-[#22C55E]">
                ${viewingAgent.revenue.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-[#64748B]">Email</p>
              <p className="mt-1 text-sm text-[#CBD5E1]">
                {viewingAgent.email}
              </p>
            </div>

            <div>
              <p className="text-xs text-[#64748B]">Phone</p>
              <p className="mt-1 text-sm text-[#CBD5E1]">
                {viewingAgent.phone}
              </p>
            </div>

            <div>
              <p className="text-xs text-[#64748B]">Location</p>
              <p className="mt-1 text-sm text-[#CBD5E1]">
                {viewingAgent.city}
              </p>
            </div>

            <div>
              <p className="text-xs text-[#64748B]">Joined</p>
              <p className="mt-1 text-sm text-[#CBD5E1]">
                {viewingAgent.joinedAt}
              </p>
            </div>

            <div>
              <p className="text-xs text-[#64748B]">Last Active</p>
              <p className="mt-1 text-sm text-[#CBD5E1]">
                {viewingAgent.lastActive}
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => {
                setViewingAgent(null);
                openEditModal(viewingAgent);
              }}
              className="h-11 rounded-xl bg-[#22C55E] px-5 text-sm font-semibold text-[#04110A] hover:bg-[#4ADE80]"
            >
              Edit Agent
            </button>
          </div>
        </Modal>
      )}

      {/* Delete confirmation */}
      {deletingAgent && (
        <Modal
          title="Delete Agent"
          onClose={() => setDeletingAgent(null)}
        >
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EF4444]/10 text-[#EF4444]">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M12 9v4M12 17h.01" />
                <path d="M10.3 4.8 2.9 18a2 2 0 0 0 1.7 3h14.8a2 2 0 0 0 1.7-3L13.7 4.8a2 2 0 0 0-3.4 0Z" />
              </svg>
            </div>

            <h3 className="mt-4 text-lg font-semibold text-[#F8FAFC]">
              Delete {deletingAgent.name}?
            </h3>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#64748B]">
              This will permanently remove the agent from the
              admin system. This action cannot be undone.
            </p>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => setDeletingAgent(null)}
              className="h-11 rounded-xl border border-[#1F2937] bg-[#111827] px-5 text-sm font-medium text-[#94A3B8] hover:text-[#F8FAFC]"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={deleteAgent}
              className="h-11 rounded-xl bg-[#EF4444] px-5 text-sm font-semibold text-white hover:bg-[#F87171]"
            >
              Delete Agent
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}