"use client";

import { useMemo, useState } from "react";

type UserRole = "user" | "merchant" | "agent" | "admin";
type UserStatus = "active" | "inactive" | "suspended";

type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  joinedAt: string;
  lastActive: string;
  promosUsed: number;
  avatar: string;
};

const INITIAL_USERS: User[] = [
  {
    id: "usr_001",
    name: "Sofia Martinez",
    email: "sofia.martinez@email.com",
    role: "user",
    status: "active",
    joinedAt: "Aug 28, 2026",
    lastActive: "2 minutes ago",
    promosUsed: 12,
    avatar: "SM",
  },
  {
    id: "usr_002",
    name: "Carlos Rodriguez",
    email: "carlos@urbanfood.com",
    role: "merchant",
    status: "active",
    joinedAt: "Aug 26, 2026",
    lastActive: "18 minutes ago",
    promosUsed: 48,
    avatar: "CR",
  },
  {
    id: "usr_003",
    name: "Valentina Silva",
    email: "valentina.silva@email.com",
    role: "user",
    status: "active",
    joinedAt: "Aug 22, 2026",
    lastActive: "1 hour ago",
    promosUsed: 7,
    avatar: "VS",
  },
  {
    id: "usr_004",
    name: "Martin Pereira",
    email: "martin@bonixpartners.com",
    role: "agent",
    status: "active",
    joinedAt: "Aug 18, 2026",
    lastActive: "3 hours ago",
    promosUsed: 0,
    avatar: "MP",
  },
  {
    id: "usr_005",
    name: "Lucia Fernandez",
    email: "lucia@email.com",
    role: "user",
    status: "inactive",
    joinedAt: "Aug 15, 2026",
    lastActive: "12 days ago",
    promosUsed: 3,
    avatar: "LF",
  },
  {
    id: "usr_006",
    name: "Diego Alvarez",
    email: "diego@streetbites.com",
    role: "merchant",
    status: "active",
    joinedAt: "Aug 10, 2026",
    lastActive: "Yesterday",
    promosUsed: 83,
    avatar: "DA",
  },
  {
    id: "usr_007",
    name: "Camila Rossi",
    email: "camila.rossi@email.com",
    role: "user",
    status: "suspended",
    joinedAt: "Aug 05, 2026",
    lastActive: "23 days ago",
    promosUsed: 1,
    avatar: "CA",
  },
  {
    id: "usr_008",
    name: "Andres Morales",
    email: "andres@bonix.app",
    role: "admin",
    status: "active",
    joinedAt: "Jul 30, 2026",
    lastActive: "Online now",
    promosUsed: 0,
    avatar: "AM",
  },
];

const PAGE_SIZE = 6;

const roleConfig: Record<
  UserRole,
  {
    label: string;
    className: string;
  }
> = {
  user: {
    label: "User",
    className:
      "border-[#22C55E]/20 bg-[#22C55E]/10 text-[#22C55E]",
  },
  merchant: {
    label: "Merchant",
    className:
      "border-[#38BDF8]/20 bg-[#38BDF8]/10 text-[#38BDF8]",
  },
  agent: {
    label: "Agent",
    className:
      "border-[#A855F7]/20 bg-[#A855F7]/10 text-[#A855F7]",
  },
  admin: {
    label: "Admin",
    className:
      "border-[#F59E0B]/20 bg-[#F59E0B]/10 text-[#F59E0B]",
  },
};

const statusConfig: Record<
  UserStatus,
  {
    label: string;
    className: string;
    dotClassName: string;
  }
> = {
  active: {
    label: "Active",
    className:
      "border-[#22C55E]/20 bg-[#22C55E]/10 text-[#22C55E]",
    dotClassName: "bg-[#22C55E]",
  },
  inactive: {
    label: "Inactive",
    className:
      "border-[#64748B]/20 bg-[#64748B]/10 text-[#94A3B8]",
    dotClassName: "bg-[#64748B]",
  },
  suspended: {
    label: "Suspended",
    className:
      "border-[#EF4444]/20 bg-[#EF4444]/10 text-[#EF4444]",
    dotClassName: "bg-[#EF4444]",
  },
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | UserStatus>(
    "all",
  );
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);

  const filteredUsers = useMemo(() => {
    let result = [...users];

    if (search.trim()) {
      const query = search.toLowerCase();

      result = result.filter((user) => {
        return (
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.id.toLowerCase().includes(query)
        );
      });
    }

    if (roleFilter !== "all") {
      result = result.filter((user) => user.role === roleFilter);
    }

    if (statusFilter !== "all") {
      result = result.filter((user) => user.status === statusFilter);
    }

    result.sort((a, b) => {
      if (sortOrder === "newest") {
        return b.joinedAt.localeCompare(a.joinedAt);
      }

      return a.joinedAt.localeCompare(b.joinedAt);
    });

    return result;
  }, [users, search, roleFilter, statusFilter, sortOrder]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / PAGE_SIZE),
  );

  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;

    return filteredUsers.slice(start, start + PAGE_SIZE);
  }, [filteredUsers, page]);

  const stats = useMemo(() => {
    return {
      total: users.length,
      active: users.filter((user) => user.status === "active").length,
      merchants: users.filter((user) => user.role === "merchant").length,
      agents: users.filter((user) => user.role === "agent").length,
    };
  }, [users]);

  const toggleUserSelection = (id: string) => {
    setSelectedUsers((current) => {
      if (current.includes(id)) {
        return current.filter((userId) => userId !== id);
      }

      return [...current, id];
    });
  };

  const toggleSelectPage = () => {
    const pageIds = paginatedUsers.map((user) => user.id);

    const everySelected = pageIds.every((id) =>
      selectedUsers.includes(id),
    );

    if (everySelected) {
      setSelectedUsers((current) =>
        current.filter((id) => !pageIds.includes(id)),
      );
    } else {
      setSelectedUsers((current) => [
        ...Array.from(new Set([...current, ...pageIds])),
      ]);
    }
  };

  const handleCreateUser = (data: Omit<User, "id">) => {
    const newUser: User = {
      ...data,
      id: `usr_${Date.now()}`,
    };

    setUsers((current) => [newUser, ...current]);
    setModalMode(null);
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUsers((current) =>
      current.map((user) =>
        user.id === updatedUser.id ? updatedUser : user,
      ),
    );

    setEditingUser(null);
    setModalMode(null);
  };

  const handleDeleteUser = () => {
    if (!deleteUser) return;

    setUsers((current) =>
      current.filter((user) => user.id !== deleteUser.id),
    );

    setSelectedUsers((current) =>
      current.filter((id) => id !== deleteUser.id),
    );

    setDeleteUser(null);
  };

  const handleBulkStatus = (status: UserStatus) => {
    setUsers((current) =>
      current.map((user) =>
        selectedUsers.includes(user.id)
          ? { ...user, status }
          : user,
      ),
    );

    setSelectedUsers([]);
  };

  const clearFilters = () => {
    setSearch("");
    setRoleFilter("all");
    setStatusFilter("all");
    setSortOrder("newest");
    setPage(1);
  };

  const hasFilters =
    search ||
    roleFilter !== "all" ||
    statusFilter !== "all" ||
    sortOrder !== "newest";

  return (
    <div className="mx-auto max-w-[1600px]">
      {/* PAGE HEADER */}

      <div className="mb-8 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#22C55E]">
            Administration
          </p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Users Management
          </h2>

          <p className="mt-3 max-w-2xl text-sm text-[#64748B]">
            Manage platform users, permissions, access status and account
            activity.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingUser(null);
            setModalMode("create");
          }}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#22C55E] px-5 text-sm font-bold text-[#04120A] transition hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(34,197,94,0.2)]"
        >
          <PlusIcon />
          Add User
        </button>
      </div>

      {/* STATS */}

      <div className="mb-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Total Users"
          value={stats.total}
          description="Registered accounts"
          icon={<UsersSmallIcon />}
        />

        <StatCard
          label="Active Users"
          value={stats.active}
          description="Currently enabled"
          icon={<ActivityIcon />}
          highlight
        />

        <StatCard
          label="Merchants"
          value={stats.merchants}
          description="Business accounts"
          icon={<StoreSmallIcon />}
        />

        <StatCard
          label="Agents"
          value={stats.agents}
          description="Partner network"
          icon={<AgentsSmallIcon />}
        />
      </div>

      {/* MANAGEMENT PANEL */}

      <section className="overflow-hidden rounded-3xl border border-[#1F2937] bg-[#0F172A]/70 shadow-2xl shadow-black/10">
        {/* TOOLBAR */}

        <div className="flex flex-col gap-3 border-b border-[#1F2937] p-4 sm:p-5 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <SearchIcon />

            <input
              type="text"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search users by name, email or ID..."
              className="h-12 w-full rounded-xl border border-[#1F2937] bg-[#020617]/50 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-[#475569] focus:border-[#22C55E]/50 focus:ring-4 focus:ring-[#22C55E]/5"
            />
          </div>

          <div className="flex gap-3">
            <select
              value={roleFilter}
              onChange={(event) => {
                setRoleFilter(
                  event.target.value as "all" | UserRole,
                );
                setPage(1);
              }}
              className="h-12 min-w-0 flex-1 rounded-xl border border-[#1F2937] bg-[#020617]/50 px-3 text-sm text-[#CBD5E1] outline-none sm:min-w-[150px]"
            >
              <option value="all">All roles</option>
              <option value="user">Users</option>
              <option value="merchant">Merchants</option>
              <option value="agent">Agents</option>
              <option value="admin">Admins</option>
            </select>

            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(
                  event.target.value as "all" | UserStatus,
                );
                setPage(1);
              }}
              className="h-12 min-w-0 flex-1 rounded-xl border border-[#1F2937] bg-[#020617]/50 px-3 text-sm text-[#CBD5E1] outline-none sm:min-w-[150px]"
            >
              <option value="all">All status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        {/* FILTER BAR */}

        <div className="flex flex-wrap items-center gap-3 border-b border-[#1F2937] bg-[#020617]/20 px-4 py-3 sm:px-5">
          <span className="text-xs text-[#64748B]">Sort by:</span>

          <select
            value={sortOrder}
            onChange={(event) => {
              setSortOrder(
                event.target.value as "newest" | "oldest",
              );
              setPage(1);
            }}
            className="rounded-lg border border-[#1F2937] bg-[#0B1120] px-3 py-2 text-xs text-[#CBD5E1] outline-none"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="ml-auto text-xs font-medium text-[#94A3B8] transition hover:text-white"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* BULK ACTIONS */}

        {selectedUsers.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 border-b border-[#22C55E]/15 bg-[#22C55E]/5 px-4 py-3 sm:px-5">
            <span className="mr-auto text-sm font-semibold text-[#22C55E]">
              {selectedUsers.length} user
              {selectedUsers.length !== 1 ? "s" : ""} selected
            </span>

            <button
              type="button"
              onClick={() => handleBulkStatus("active")}
              className="rounded-lg border border-[#1F2937] bg-[#0F172A] px-3 py-2 text-xs text-[#CBD5E1] transition hover:text-[#22C55E]"
            >
              Activate
            </button>

            <button
              type="button"
              onClick={() => handleBulkStatus("suspended")}
              className="rounded-lg border border-[#1F2937] bg-[#0F172A] px-3 py-2 text-xs text-[#CBD5E1] transition hover:text-[#EF4444]"
            >
              Suspend
            </button>

            <button
              type="button"
              onClick={() => setSelectedUsers([])}
              className="rounded-lg px-3 py-2 text-xs text-[#64748B] transition hover:text-white"
            >
              Cancel
            </button>
          </div>
        )}

        {/* TABLE HEADER */}

        <div className="hidden grid-cols-[40px_minmax(240px,2fr)_1fr_1fr_1fr_100px] gap-5 border-b border-[#1F2937] bg-[#020617]/20 px-5 py-4 text-[10px] font-bold uppercase tracking-[0.16em] text-[#64748B] lg:grid">
          <input
            type="checkbox"
            checked={
              paginatedUsers.length > 0 &&
              paginatedUsers.every((user) =>
                selectedUsers.includes(user.id),
              )
            }
            onChange={toggleSelectPage}
            className="h-4 w-4 accent-[#22C55E]"
          />

          <span>User</span>
          <span>Role</span>
          <span>Status</span>
          <span>Activity</span>
          <span className="text-right">Actions</span>
        </div>

        {/* USERS */}

        <div>
          {paginatedUsers.length > 0 ? (
            paginatedUsers.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                selected={selectedUsers.includes(user.id)}
                onToggle={() => toggleUserSelection(user.id)}
                onEdit={() => {
                  setEditingUser(user);
                  setModalMode("edit");
                }}
                onDelete={() => setDeleteUser(user)}
              />
            ))
          ) : (
            <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#1F2937] bg-[#020617]/50">
                <UsersSmallIcon />
              </div>

              <h3 className="mt-5 text-lg font-semibold text-white">
                No users found
              </h3>

              <p className="mt-2 max-w-sm text-sm text-[#64748B]">
                Try adjusting your search or filters to find what you are
                looking for.
              </p>

              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 rounded-xl border border-[#1F2937] px-4 py-2 text-sm text-[#CBD5E1] transition hover:bg-[#111827]"
              >
                Reset filters
              </button>
            </div>
          )}
        </div>

        {/* PAGINATION */}

        <div className="flex flex-col gap-4 border-t border-[#1F2937] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[#64748B]">
            Showing{" "}
            <span className="font-semibold text-[#CBD5E1]">
              {filteredUsers.length === 0
                ? 0
                : (page - 1) * PAGE_SIZE + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-[#CBD5E1]">
              {Math.min(page * PAGE_SIZE, filteredUsers.length)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-[#CBD5E1]">
              {filteredUsers.length}
            </span>{" "}
            users
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page === 1}
              onClick={() =>
                setPage((current) => Math.max(1, current - 1))
              }
              className="flex h-9 items-center justify-center rounded-lg border border-[#1F2937] px-3 text-xs text-[#94A3B8] transition hover:border-[#334155] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            {Array.from(
              { length: totalPages },
              (_, index) => index + 1,
            ).map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                onClick={() => setPage(pageNumber)}
                className={`flex h-9 w-9 items-center justify-center rounded-lg border text-xs font-semibold transition ${
                  page === pageNumber
                    ? "border-[#22C55E]/40 bg-[#22C55E]/10 text-[#22C55E]"
                    : "border-[#1F2937] text-[#94A3B8] hover:text-white"
                }`}
              >
                {pageNumber}
              </button>
            ))}

            <button
              type="button"
              disabled={page === totalPages}
              onClick={() =>
                setPage((current) =>
                  Math.min(totalPages, current + 1),
                )
              }
              className="flex h-9 items-center justify-center rounded-lg border border-[#1F2937] px-3 text-xs text-[#94A3B8] transition hover:border-[#334155] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {/* CREATE / EDIT MODAL */}

      {modalMode && (
        <UserModal
          user={modalMode === "edit" ? editingUser : null}
          onClose={() => {
            setModalMode(null);
            setEditingUser(null);
          }}
          onSubmit={(data) => {
            if (modalMode === "create") {
              handleCreateUser(data);
            } else if (editingUser) {
              handleUpdateUser({
                ...data,
                id: editingUser.id,
              });
            }
          }}
        />
      )}

      {/* DELETE MODAL */}

      {deleteUser && (
        <DeleteModal
          user={deleteUser}
          onCancel={() => setDeleteUser(null)}
          onConfirm={handleDeleteUser}
        />
      )}
    </div>
  );
}

/* ============================================================
   USER ROW
============================================================ */

type UserRowProps = {
  user: User;
  selected: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

function UserRow({
  user,
  selected,
  onToggle,
  onEdit,
  onDelete,
}: UserRowProps) {
  return (
    <div className="group relative flex flex-col gap-4 border-b border-[#1F2937] px-4 py-5 transition hover:bg-white/[0.015] lg:grid lg:grid-cols-[40px_minmax(240px,2fr)_1fr_1fr_1fr_100px] lg:items-center lg:gap-5 lg:px-5">
      <div className="absolute right-4 top-5 lg:static">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          className="h-4 w-4 accent-[#22C55E]"
        />
      </div>

      {/* USER */}

      <div className="flex min-w-0 items-center gap-3 pr-8 lg:pr-0">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#1F2937] bg-gradient-to-br from-[#1E293B] to-[#020617] text-xs font-bold text-[#22C55E]">
          {user.avatar}
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">
            {user.name}
          </p>

          <p className="mt-1 truncate text-xs text-[#64748B]">
            {user.email}
          </p>

          <p className="mt-1 font-mono text-[10px] text-[#475569]">
            {user.id}
          </p>
        </div>
      </div>

      {/* ROLE */}

      <div className="flex items-center justify-between lg:block">
        <span className="text-xs text-[#64748B] lg:hidden">Role</span>

        <span
          className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
            roleConfig[user.role].className
          }`}
        >
          {roleConfig[user.role].label}
        </span>
      </div>

      {/* STATUS */}

      <div className="flex items-center justify-between lg:block">
        <span className="text-xs text-[#64748B] lg:hidden">Status</span>

        <span
          className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
            statusConfig[user.status].className
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              statusConfig[user.status].dotClassName
            }`}
          />

          {statusConfig[user.status].label}
        </span>
      </div>

      {/* ACTIVITY */}

      <div className="flex items-center justify-between lg:block">
        <span className="text-xs text-[#64748B] lg:hidden">Activity</span>

        <div>
          <p className="text-xs font-medium text-[#CBD5E1]">
            {user.lastActive}
          </p>

          <p className="mt-1 text-[11px] text-[#64748B]">
            {user.promosUsed} promos used
          </p>
        </div>
      </div>

      {/* ACTIONS */}

      <div className="flex items-center justify-end gap-2 border-t border-[#1F2937] pt-4 lg:border-0 lg:pt-0">
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#22C55E]/20 bg-[#22C55E]/5 px-3 text-xs font-semibold text-[#22C55E] transition hover:bg-[#22C55E] hover:text-[#04120A]"
        >
          <EditIcon />
          Edit
        </button>

        <button
          type="button"
          onClick={onDelete}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#1F2937] text-[#64748B] transition hover:border-[#EF4444]/30 hover:bg-[#EF4444]/10 hover:text-[#EF4444]"
          aria-label={`Delete ${user.name}`}
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   USER MODAL
============================================================ */

type UserModalProps = {
  user: User | null;
  onClose: () => void;
  onSubmit: (data: Omit<User, "id">) => void;
};

function UserModal({
  user,
  onClose,
  onSubmit,
}: UserModalProps) {
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [role, setRole] = useState<UserRole>(
    user?.role ?? "user",
  );
  const [status, setStatus] = useState<UserStatus>(
    user?.status ?? "active",
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const initials = name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase();

    onSubmit({
      name,
      email,
      role,
      status,
      joinedAt: user?.joinedAt ?? "Sep 02, 2026",
      lastActive: user?.lastActive ?? "Just now",
      promosUsed: user?.promosUsed ?? 0,
      avatar: initials || "U",
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-[#1F2937] bg-[#0F172A] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#1F2937] px-6 py-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#22C55E]">
              User Management
            </p>

            <h3 className="mt-1 text-xl font-bold text-white">
              {user ? "Edit User" : "Create User"}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#1F2937] text-[#94A3B8] transition hover:text-white"
          >
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <FormField
            label="Full Name"
            value={name}
            onChange={setName}
            placeholder="Enter full name"
          />

          <FormField
            label="Email Address"
            value={email}
            onChange={setEmail}
            placeholder="name@email.com"
            type="email"
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-semibold text-[#94A3B8]">
                Role
              </label>

              <select
                value={role}
                onChange={(event) =>
                  setRole(event.target.value as UserRole)
                }
                className="h-11 w-full rounded-xl border border-[#1F2937] bg-[#020617]/60 px-3 text-sm text-white outline-none focus:border-[#22C55E]/50"
              >
                <option value="user">User</option>
                <option value="merchant">Merchant</option>
                <option value="agent">Agent</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-[#94A3B8]">
                Status
              </label>

              <select
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as UserStatus)
                }
                className="h-11 w-full rounded-xl border border-[#1F2937] bg-[#020617]/60 px-3 text-sm text-white outline-none focus:border-[#22C55E]/50"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-[#1F2937] pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#1F2937] px-4 py-2.5 text-sm font-medium text-[#94A3B8] transition hover:text-white"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!name.trim() || !email.trim()}
              className="rounded-xl bg-[#22C55E] px-5 py-2.5 text-sm font-bold text-[#04120A] transition hover:shadow-[0_8px_25px_rgba(34,197,94,0.25)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {user ? "Save Changes" : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ============================================================
   FORM FIELD
============================================================ */

type FormFieldProps = {
  label: string;
  value: string;
  placeholder: string;
  type?: string;
  onChange: (value: string) => void;
};

function FormField({
  label,
  value,
  placeholder,
  type = "text",
  onChange,
}: FormFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold text-[#94A3B8]">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required
        className="h-11 w-full rounded-xl border border-[#1F2937] bg-[#020617]/60 px-3 text-sm text-white outline-none transition placeholder:text-[#475569] focus:border-[#22C55E]/50 focus:ring-4 focus:ring-[#22C55E]/5"
      />
    </div>
  );
}

/* ============================================================
   DELETE MODAL
============================================================ */

type DeleteModalProps = {
  user: User;
  onCancel: () => void;
  onConfirm: () => void;
};

function DeleteModal({
  user,
  onCancel,
  onConfirm,
}: DeleteModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-[#1F2937] bg-[#0F172A] p-6 shadow-2xl">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#EF4444]/20 bg-[#EF4444]/10 text-[#EF4444]">
          <TrashIcon />
        </div>

        <h3 className="mt-5 text-xl font-bold text-white">
          Delete user?
        </h3>

        <p className="mt-3 text-sm leading-6 text-[#94A3B8]">
          You are about to permanently delete{" "}
          <span className="font-semibold text-white">
            {user.name}
          </span>
          . This action cannot be undone.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-[#1F2937] px-4 py-2.5 text-sm text-[#94A3B8] transition hover:text-white"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="rounded-xl bg-[#EF4444] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#DC2626]"
          >
            Delete User
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   STAT CARD
============================================================ */

type StatCardProps = {
  label: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  highlight?: boolean;
};

function StatCard({
  label,
  value,
  description,
  icon,
  highlight = false,
}: StatCardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-5 ${
        highlight
          ? "border-[#22C55E]/20 bg-[#22C55E]/5"
          : "border-[#1F2937] bg-[#0F172A]/70"
      }`}
    >
      <div className="absolute -right-5 -top-5 h-24 w-24 rounded-full bg-white/[0.02]" />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#64748B]">
            {label}
          </p>

          <p className="mt-3 text-3xl font-bold tracking-tight text-white">
            {value.toLocaleString()}
          </p>

          <p className="mt-2 text-xs text-[#64748B]">
            {description}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            highlight
              ? "bg-[#22C55E]/10 text-[#22C55E]"
              : "bg-[#111827] text-[#94A3B8]"
          }`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   ICONS
============================================================ */

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#64748B]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v5" />
      <path d="M14 11v5" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

function UsersSmallIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16 20v-1.5a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V20" />
      <circle cx="9.5" cy="7" r="3.5" />
      <path d="M18 8a3 3 0 0 1 0 6" />
      <path d="M21 20v-1.5a4 4 0 0 0-2.5-3.7" />
    </svg>
  );
}

function ActivityIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 12h4l3-8 4 16 3-8h4" />
    </svg>
  );
}

function StoreSmallIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 10h18" />
      <path d="m5 10 1-6h12l1 6" />
      <path d="M5 10v10h14V10" />
      <path d="M9 20v-6h6v6" />
    </svg>
  );
}

function AgentsSmallIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="9" cy="7" r="3" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M3 20c1.5-3.5 4-5 7-5s5.5 1.5 7 5" />
      <path d="M15 16c2.5.5 4.5 2 5.5 4" />
    </svg>
  );
}