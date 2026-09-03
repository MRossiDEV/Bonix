"use client";

import { useMemo, useState } from "react";

type MerchantStatus = "active" | "pending" | "suspended" | "inactive";
type VerificationStatus = "verified" | "pending" | "rejected";

type Merchant = {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  category: string;
  status: MerchantStatus;
  verification: VerificationStatus;
  promos: number;
  redemptions: number;
  joinedAt: string;
  lastActive: string;
  initials: string;
};

const INITIAL_MERCHANTS: Merchant[] = [
  {
    id: "mrc_001",
    businessName: "Urban Food",
    ownerName: "Carlos Rodriguez",
    email: "carlos@urbanfood.com",
    phone: "+598 94 123 456",
    category: "Restaurant",
    status: "active",
    verification: "verified",
    promos: 18,
    redemptions: 342,
    joinedAt: "Aug 28, 2026",
    lastActive: "12 minutes ago",
    initials: "UF",
  },
  {
    id: "mrc_002",
    businessName: "Street Bites",
    ownerName: "Diego Alvarez",
    email: "diego@streetbites.com",
    phone: "+598 95 456 789",
    category: "Food & Drinks",
    status: "active",
    verification: "verified",
    promos: 24,
    redemptions: 587,
    joinedAt: "Aug 25, 2026",
    lastActive: "1 hour ago",
    initials: "SB",
  },
  {
    id: "mrc_003",
    businessName: "Casa Verde",
    ownerName: "Lucia Fernandez",
    email: "lucia@casaverde.com",
    phone: "+598 99 321 654",
    category: "Restaurant",
    status: "pending",
    verification: "pending",
    promos: 0,
    redemptions: 0,
    joinedAt: "Aug 22, 2026",
    lastActive: "3 hours ago",
    initials: "CV",
  },
  {
    id: "mrc_004",
    businessName: "Move Fitness",
    ownerName: "Martin Pereira",
    email: "martin@movefitness.com",
    phone: "+598 98 765 432",
    category: "Fitness",
    status: "active",
    verification: "verified",
    promos: 9,
    redemptions: 214,
    joinedAt: "Aug 18, 2026",
    lastActive: "Yesterday",
    initials: "MF",
  },
  {
    id: "mrc_005",
    businessName: "Luna Beauty",
    ownerName: "Sofia Martinez",
    email: "sofia@lunabeauty.com",
    phone: "+598 97 456 123",
    category: "Beauty",
    status: "active",
    verification: "verified",
    promos: 13,
    redemptions: 168,
    joinedAt: "Aug 15, 2026",
    lastActive: "Yesterday",
    initials: "LB",
  },
  {
    id: "mrc_006",
    businessName: "Café Central",
    ownerName: "Andres Morales",
    email: "andres@cafecentral.com",
    phone: "+598 96 654 321",
    category: "Coffee",
    status: "inactive",
    verification: "verified",
    promos: 5,
    redemptions: 74,
    joinedAt: "Aug 10, 2026",
    lastActive: "8 days ago",
    initials: "CC",
  },
  {
    id: "mrc_007",
    businessName: "Pixel Store",
    ownerName: "Valentina Silva",
    email: "valentina@pixelstore.com",
    phone: "+598 93 987 654",
    category: "Retail",
    status: "pending",
    verification: "pending",
    promos: 0,
    redemptions: 0,
    joinedAt: "Aug 06, 2026",
    lastActive: "10 days ago",
    initials: "PS",
  },
  {
    id: "mrc_008",
    businessName: "Barrio Pizza",
    ownerName: "Mateo Rossi",
    email: "mateo@barriopizza.com",
    phone: "+598 91 234 567",
    category: "Restaurant",
    status: "suspended",
    verification: "rejected",
    promos: 7,
    redemptions: 92,
    joinedAt: "Jul 29, 2026",
    lastActive: "22 days ago",
    initials: "BP",
  },
];

const PAGE_SIZE = 6;

const statusConfig: Record<
  MerchantStatus,
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
  pending: {
    label: "Pending",
    className:
      "border-[#F59E0B]/20 bg-[#F59E0B]/10 text-[#F59E0B]",
    dotClassName: "bg-[#F59E0B]",
  },
  suspended: {
    label: "Suspended",
    className:
      "border-[#EF4444]/20 bg-[#EF4444]/10 text-[#EF4444]",
    dotClassName: "bg-[#EF4444]",
  },
  inactive: {
    label: "Inactive",
    className:
      "border-[#64748B]/20 bg-[#64748B]/10 text-[#94A3B8]",
    dotClassName: "bg-[#64748B]",
  },
};

const verificationConfig: Record<
  VerificationStatus,
  {
    label: string;
    className: string;
  }
> = {
  verified: {
    label: "Verified",
    className:
      "border-[#22C55E]/20 bg-[#22C55E]/10 text-[#22C55E]",
  },
  pending: {
    label: "Pending",
    className:
      "border-[#F59E0B]/20 bg-[#F59E0B]/10 text-[#F59E0B]",
  },
  rejected: {
    label: "Rejected",
    className:
      "border-[#EF4444]/20 bg-[#EF4444]/10 text-[#EF4444]",
  },
};

export default function MerchantsPage() {
  const [merchants, setMerchants] =
    useState<Merchant[]>(INITIAL_MERCHANTS);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState<
    "all" | MerchantStatus
  >("all");

  const [verificationFilter, setVerificationFilter] = useState<
    "all" | VerificationStatus
  >("all");

  const [categoryFilter, setCategoryFilter] =
    useState<string>("all");

  const [sortOrder, setSortOrder] = useState<
    "newest" | "oldest" | "name"
  >("newest");

  const [page, setPage] = useState(1);

  const [selectedMerchants, setSelectedMerchants] =
    useState<string[]>([]);

  const [modalMode, setModalMode] = useState<
    "create" | "edit" | null
  >(null);

  const [editingMerchant, setEditingMerchant] =
    useState<Merchant | null>(null);

  const [deleteMerchant, setDeleteMerchant] =
    useState<Merchant | null>(null);

  const categories = useMemo(() => {
    return Array.from(
      new Set(merchants.map((merchant) => merchant.category)),
    ).sort();
  }, [merchants]);

  const filteredMerchants = useMemo(() => {
    let result = [...merchants];

    if (search.trim()) {
      const query = search.toLowerCase();

      result = result.filter((merchant) => {
        return (
          merchant.businessName.toLowerCase().includes(query) ||
          merchant.ownerName.toLowerCase().includes(query) ||
          merchant.email.toLowerCase().includes(query) ||
          merchant.id.toLowerCase().includes(query)
        );
      });
    }

    if (statusFilter !== "all") {
      result = result.filter(
        (merchant) => merchant.status === statusFilter,
      );
    }

    if (verificationFilter !== "all") {
      result = result.filter(
        (merchant) =>
          merchant.verification === verificationFilter,
      );
    }

    if (categoryFilter !== "all") {
      result = result.filter(
        (merchant) => merchant.category === categoryFilter,
      );
    }

    result.sort((a, b) => {
      if (sortOrder === "name") {
        return a.businessName.localeCompare(b.businessName);
      }

      if (sortOrder === "oldest") {
        return a.joinedAt.localeCompare(b.joinedAt);
      }

      return b.joinedAt.localeCompare(a.joinedAt);
    });

    return result;
  }, [
    merchants,
    search,
    statusFilter,
    verificationFilter,
    categoryFilter,
    sortOrder,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredMerchants.length / PAGE_SIZE),
  );

  const paginatedMerchants = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;

    return filteredMerchants.slice(
      start,
      start + PAGE_SIZE,
    );
  }, [filteredMerchants, page]);

  const stats = useMemo(() => {
    return {
      total: merchants.length,
      active: merchants.filter(
        (merchant) => merchant.status === "active",
      ).length,
      pending: merchants.filter(
        (merchant) => merchant.status === "pending",
      ).length,
      suspended: merchants.filter(
        (merchant) => merchant.status === "suspended",
      ).length,
    };
  }, [merchants]);

  const hasFilters =
    search ||
    statusFilter !== "all" ||
    verificationFilter !== "all" ||
    categoryFilter !== "all" ||
    sortOrder !== "newest";

  const toggleMerchantSelection = (id: string) => {
    setSelectedMerchants((current) => {
      if (current.includes(id)) {
        return current.filter(
          (merchantId) => merchantId !== id,
        );
      }

      return [...current, id];
    });
  };

  const toggleSelectPage = () => {
    const pageIds = paginatedMerchants.map(
      (merchant) => merchant.id,
    );

    const everySelected = pageIds.every((id) =>
      selectedMerchants.includes(id),
    );

    if (everySelected) {
      setSelectedMerchants((current) =>
        current.filter((id) => !pageIds.includes(id)),
      );
    } else {
      setSelectedMerchants((current) =>
        Array.from(new Set([...current, ...pageIds])),
      );
    }
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setVerificationFilter("all");
    setCategoryFilter("all");
    setSortOrder("newest");
    setPage(1);
  };

  const handleCreateMerchant = (
    data: Omit<Merchant, "id">,
  ) => {
    const newMerchant: Merchant = {
      ...data,
      id: `mrc_${Date.now()}`,
    };

    setMerchants((current) => [
      newMerchant,
      ...current,
    ]);

    setModalMode(null);
  };

  const handleUpdateMerchant = (
    updatedMerchant: Merchant,
  ) => {
    setMerchants((current) =>
      current.map((merchant) =>
        merchant.id === updatedMerchant.id
          ? updatedMerchant
          : merchant,
      ),
    );

    setEditingMerchant(null);
    setModalMode(null);
  };

  const handleDeleteMerchant = () => {
    if (!deleteMerchant) return;

    setMerchants((current) =>
      current.filter(
        (merchant) =>
          merchant.id !== deleteMerchant.id,
      ),
    );

    setSelectedMerchants((current) =>
      current.filter(
        (id) => id !== deleteMerchant.id,
      ),
    );

    setDeleteMerchant(null);
  };

  const handleBulkStatus = (
    status: MerchantStatus,
  ) => {
    setMerchants((current) =>
      current.map((merchant) =>
        selectedMerchants.includes(merchant.id)
          ? { ...merchant, status }
          : merchant,
      ),
    );

    setSelectedMerchants([]);
  };

  const handleApprove = (merchant: Merchant) => {
    setMerchants((current) =>
      current.map((item) =>
        item.id === merchant.id
          ? {
              ...item,
              status: "active",
              verification: "verified",
            }
          : item,
      ),
    );
  };

  return (
    <div className="mx-auto max-w-[1600px]">
      {/* HEADER */}

      <div className="mb-8 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#22C55E]">
            Administration
          </p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Merchants
          </h2>

          <p className="mt-3 max-w-2xl text-sm text-[#64748B]">
            Manage businesses, merchant accounts, verification
            status and promotional activity.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingMerchant(null);
            setModalMode("create");
          }}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#22C55E] px-5 text-sm font-bold text-[#04120A] transition hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(34,197,94,0.2)]"
        >
          <PlusIcon />
          Add Merchant
        </button>
      </div>

      {/* STATS */}

      <div className="mb-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Total Merchants"
          value={stats.total}
          description="Registered businesses"
          icon={<StoreIcon />}
        />

        <StatCard
          label="Active"
          value={stats.active}
          description="Currently operating"
          icon={<ActivityIcon />}
          highlight
        />

        <StatCard
          label="Pending Approval"
          value={stats.pending}
          description="Require attention"
          icon={<ClockIcon />}
          warning
        />

        <StatCard
          label="Suspended"
          value={stats.suspended}
          description="Restricted accounts"
          icon={<AlertIcon />}
          danger
        />
      </div>

      {/* MANAGEMENT PANEL */}

      <section className="overflow-hidden rounded-3xl border border-[#1F2937] bg-[#0F172A]/70 shadow-2xl shadow-black/10">
        {/* SEARCH / FILTERS */}

        <div className="flex flex-col gap-3 border-b border-[#1F2937] p-4 sm:p-5 xl:flex-row xl:items-center">
          <div className="relative flex-1">
            <SearchIcon />

            <input
              type="text"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search businesses, owners, email or merchant ID..."
              className="h-12 w-full rounded-xl border border-[#1F2937] bg-[#020617]/50 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-[#475569] focus:border-[#22C55E]/50 focus:ring-4 focus:ring-[#22C55E]/5"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:flex">
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(
                  event.target.value as
                    | "all"
                    | MerchantStatus,
                );
                setPage(1);
              }}
              className="h-12 rounded-xl border border-[#1F2937] bg-[#020617]/50 px-3 text-sm text-[#CBD5E1] outline-none focus:border-[#22C55E]/40"
            >
              <option value="all">All status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>

            <select
              value={verificationFilter}
              onChange={(event) => {
                setVerificationFilter(
                  event.target.value as
                    | "all"
                    | VerificationStatus,
                );
                setPage(1);
              }}
              className="h-12 rounded-xl border border-[#1F2937] bg-[#020617]/50 px-3 text-sm text-[#CBD5E1] outline-none focus:border-[#22C55E]/40"
            >
              <option value="all">
                All verification
              </option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(event) => {
                setCategoryFilter(event.target.value);
                setPage(1);
              }}
              className="col-span-2 h-12 rounded-xl border border-[#1F2937] bg-[#020617]/50 px-3 text-sm text-[#CBD5E1] outline-none focus:border-[#22C55E]/40 sm:col-span-1"
            >
              <option value="all">All categories</option>

              {categories.map((category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* SORT */}

        <div className="flex flex-wrap items-center gap-3 border-b border-[#1F2937] bg-[#020617]/20 px-4 py-3 sm:px-5">
          <span className="text-xs text-[#64748B]">
            Sort by:
          </span>

          <select
            value={sortOrder}
            onChange={(event) => {
              setSortOrder(
                event.target.value as
                  | "newest"
                  | "oldest"
                  | "name",
              );
              setPage(1);
            }}
            className="rounded-lg border border-[#1F2937] bg-[#0B1120] px-3 py-2 text-xs text-[#CBD5E1] outline-none"
          >
            <option value="newest">
              Newest first
            </option>

            <option value="oldest">
              Oldest first
            </option>

            <option value="name">
              Business name
            </option>
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

        {selectedMerchants.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 border-b border-[#22C55E]/15 bg-[#22C55E]/5 px-4 py-3 sm:px-5">
            <span className="mr-auto text-sm font-semibold text-[#22C55E]">
              {selectedMerchants.length} merchant
              {selectedMerchants.length !== 1
                ? "s"
                : ""}{" "}
              selected
            </span>

            <button
              type="button"
              onClick={() =>
                handleBulkStatus("active")
              }
              className="rounded-lg border border-[#1F2937] bg-[#0F172A] px-3 py-2 text-xs text-[#CBD5E1] transition hover:text-[#22C55E]"
            >
              Activate
            </button>

            <button
              type="button"
              onClick={() =>
                handleBulkStatus("suspended")
              }
              className="rounded-lg border border-[#1F2937] bg-[#0F172A] px-3 py-2 text-xs text-[#CBD5E1] transition hover:text-[#EF4444]"
            >
              Suspend
            </button>

            <button
              type="button"
              onClick={() =>
                setSelectedMerchants([])
              }
              className="rounded-lg px-3 py-2 text-xs text-[#64748B] transition hover:text-white"
            >
              Cancel
            </button>
          </div>
        )}

        {/* DESKTOP HEADER */}

        <div className="hidden grid-cols-[40px_minmax(230px,2fr)_minmax(170px,1fr)_130px_120px_100px] gap-5 border-b border-[#1F2937] bg-[#020617]/20 px-5 py-4 text-[10px] font-bold uppercase tracking-[0.16em] text-[#64748B] lg:grid">
          <input
            type="checkbox"
            checked={
              paginatedMerchants.length > 0 &&
              paginatedMerchants.every(
                (merchant) =>
                  selectedMerchants.includes(
                    merchant.id,
                  ),
              )
            }
            onChange={toggleSelectPage}
            className="h-4 w-4 accent-[#22C55E]"
          />

          <span>Business</span>
          <span>Category</span>
          <span>Status</span>
          <span>Verification</span>
          <span className="text-right">
            Actions
          </span>
        </div>

        {/* MERCHANTS */}

        <div>
          {paginatedMerchants.length > 0 ? (
            paginatedMerchants.map((merchant) => (
              <MerchantRow
                key={merchant.id}
                merchant={merchant}
                selected={selectedMerchants.includes(
                  merchant.id,
                )}
                onToggle={() =>
                  toggleMerchantSelection(
                    merchant.id,
                  )
                }
                onEdit={() => {
                  setEditingMerchant(merchant);
                  setModalMode("edit");
                }}
                onDelete={() =>
                  setDeleteMerchant(merchant)
                }
                onApprove={() =>
                  handleApprove(merchant)
                }
              />
            ))
          ) : (
            <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#1F2937] bg-[#020617]/50 text-[#64748B]">
                <StoreIcon />
              </div>

              <h3 className="mt-5 text-lg font-semibold text-white">
                No merchants found
              </h3>

              <p className="mt-2 max-w-sm text-sm text-[#64748B]">
                Try adjusting your search or filters
                to find the merchant you are looking
                for.
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
              {filteredMerchants.length === 0
                ? 0
                : (page - 1) * PAGE_SIZE + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-[#CBD5E1]">
              {Math.min(
                page * PAGE_SIZE,
                filteredMerchants.length,
              )}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-[#CBD5E1]">
              {filteredMerchants.length}
            </span>{" "}
            merchants
          </p>

          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              type="button"
              disabled={page === 1}
              onClick={() =>
                setPage((current) =>
                  Math.max(1, current - 1),
                )
              }
              className="flex h-9 shrink-0 items-center justify-center rounded-lg border border-[#1F2937] px-3 text-xs text-[#94A3B8] transition hover:border-[#334155] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
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
                onClick={() =>
                  setPage(pageNumber)
                }
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-xs font-semibold transition ${
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
                  Math.min(
                    totalPages,
                    current + 1,
                  ),
                )
              }
              className="flex h-9 shrink-0 items-center justify-center rounded-lg border border-[#1F2937] px-3 text-xs text-[#94A3B8] transition hover:border-[#334155] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {/* CREATE / EDIT */}

      {modalMode && (
        <MerchantModal
          merchant={
            modalMode === "edit"
              ? editingMerchant
              : null
          }
          categories={categories}
          onClose={() => {
            setModalMode(null);
            setEditingMerchant(null);
          }}
          onSubmit={(data) => {
            if (modalMode === "create") {
              handleCreateMerchant(data);
            } else if (editingMerchant) {
              handleUpdateMerchant({
                ...data,
                id: editingMerchant.id,
              });
            }
          }}
        />
      )}

      {/* DELETE */}

      {deleteMerchant && (
        <DeleteMerchantModal
          merchant={deleteMerchant}
          onCancel={() =>
            setDeleteMerchant(null)
          }
          onConfirm={handleDeleteMerchant}
        />
      )}
    </div>
  );
}

/* ============================================================
   MERCHANT ROW
============================================================ */

type MerchantRowProps = {
  merchant: Merchant;
  selected: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onApprove: () => void;
};

function MerchantRow({
  merchant,
  selected,
  onToggle,
  onEdit,
  onDelete,
  onApprove,
}: MerchantRowProps) {
  return (
    <div className="group relative flex flex-col gap-4 border-b border-[#1F2937] px-4 py-5 transition hover:bg-white/[0.015] lg:grid lg:grid-cols-[40px_minmax(230px,2fr)_minmax(170px,1fr)_130px_120px_100px] lg:items-center lg:gap-5 lg:px-5">
      {/* CHECKBOX */}

      <div className="absolute right-4 top-5 lg:static">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          className="h-4 w-4 accent-[#22C55E]"
        />
      </div>

      {/* BUSINESS */}

      <div className="flex min-w-0 items-center gap-3 pr-8 lg:pr-0">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#1F2937] bg-gradient-to-br from-[#1E293B] to-[#020617] text-xs font-bold text-[#22C55E]">
          {merchant.initials}
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">
            {merchant.businessName}
          </p>

          <p className="mt-1 truncate text-xs text-[#94A3B8]">
            {merchant.ownerName}
          </p>

          <p className="mt-1 truncate text-[11px] text-[#64748B]">
            {merchant.email}
          </p>

          <p className="mt-1 font-mono text-[10px] text-[#475569]">
            {merchant.id}
          </p>
        </div>
      </div>

      {/* CATEGORY */}

      <div className="flex items-center justify-between lg:block">
        <span className="text-xs text-[#64748B] lg:hidden">
          Category
        </span>

        <div>
          <span className="inline-flex rounded-lg border border-[#1F2937] bg-[#020617]/50 px-2.5 py-1 text-[11px] font-medium text-[#CBD5E1]">
            {merchant.category}
          </span>

          <p className="mt-2 hidden text-[10px] text-[#64748B] lg:block">
            {merchant.promos} promos ·{" "}
            {merchant.redemptions} redemptions
          </p>
        </div>
      </div>

      {/* STATUS */}

      <div className="flex items-center justify-between lg:block">
        <span className="text-xs text-[#64748B] lg:hidden">
          Status
        </span>

        <span
          className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusConfig[merchant.status].className}`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${statusConfig[merchant.status].dotClassName}`}
          />

          {statusConfig[merchant.status].label}
        </span>
      </div>

      {/* VERIFICATION */}

      <div className="flex items-center justify-between lg:block">
        <span className="text-xs text-[#64748B] lg:hidden">
          Verification
        </span>

        <span
          className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${verificationConfig[merchant.verification].className}`}
        >
          {verificationConfig[merchant.verification].label}
        </span>
      </div>

      {/* ACTIONS */}

      <div className="flex items-center justify-end gap-2 border-t border-[#1F2937] pt-4 lg:border-0 lg:pt-0">
        {merchant.status === "pending" && (
          <button
            type="button"
            onClick={onApprove}
            className="hidden h-9 items-center rounded-lg border border-[#22C55E]/20 bg-[#22C55E]/5 px-3 text-xs font-semibold text-[#22C55E] transition hover:bg-[#22C55E] hover:text-[#04120A] xl:inline-flex"
          >
            Approve
          </button>
        )}

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
          aria-label={`Delete ${merchant.businessName}`}
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   MERCHANT MODAL
============================================================ */

type MerchantModalProps = {
  merchant: Merchant | null;
  categories: string[];
  onClose: () => void;
  onSubmit: (data: Omit<Merchant, "id">) => void;
};

function MerchantModal({
  merchant,
  categories,
  onClose,
  onSubmit,
}: MerchantModalProps) {
  const [businessName, setBusinessName] =
    useState(merchant?.businessName ?? "");

  const [ownerName, setOwnerName] =
    useState(merchant?.ownerName ?? "");

  const [email, setEmail] =
    useState(merchant?.email ?? "");

  const [phone, setPhone] =
    useState(merchant?.phone ?? "");

  const [category, setCategory] =
    useState(merchant?.category ?? "");

  const [status, setStatus] =
    useState<MerchantStatus>(
      merchant?.status ?? "pending",
    );

  const [verification, setVerification] =
    useState<VerificationStatus>(
      merchant?.verification ?? "pending",
    );

  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const initials = businessName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase();

    onSubmit({
      businessName,
      ownerName,
      email,
      phone,
      category: category || "Other",
      status,
      verification,
      promos: merchant?.promos ?? 0,
      redemptions: merchant?.redemptions ?? 0,
      joinedAt:
        merchant?.joinedAt ?? "Sep 02, 2026",
      lastActive:
        merchant?.lastActive ?? "Just now",
      initials: initials || "BM",
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
      <div className="my-8 w-full max-w-2xl overflow-hidden rounded-3xl border border-[#1F2937] bg-[#0F172A] shadow-2xl">
        {/* MODAL HEADER */}

        <div className="flex items-center justify-between border-b border-[#1F2937] px-6 py-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#22C55E]">
              Merchant Management
            </p>

            <h3 className="mt-1 text-xl font-bold text-white">
              {merchant
                ? "Edit Merchant"
                : "Create Merchant"}
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

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-6"
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FormField
              label="Business Name"
              value={businessName}
              onChange={setBusinessName}
              placeholder="Business name"
            />

            <FormField
              label="Owner Name"
              value={ownerName}
              onChange={setOwnerName}
              placeholder="Owner full name"
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FormField
              label="Email Address"
              value={email}
              onChange={setEmail}
              placeholder="business@email.com"
              type="email"
            />

            <FormField
              label="Phone"
              value={phone}
              onChange={setPhone}
              placeholder="+598..."
              type="tel"
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <SelectField
              label="Category"
              value={category}
              onChange={setCategory}
              options={[
                ...categories,
                "Restaurant",
                "Food & Drinks",
                "Retail",
                "Beauty",
                "Fitness",
                "Coffee",
                "Other",
              ].filter(
                (value, index, array) =>
                  array.indexOf(value) === index,
              )}
            />

            <SelectField
              label="Status"
              value={status}
              onChange={(value) =>
                setStatus(value as MerchantStatus)
              }
              options={[
                "active",
                "pending",
                "inactive",
                "suspended",
              ]}
            />

            <SelectField
              label="Verification"
              value={verification}
              onChange={(value) =>
                setVerification(
                  value as VerificationStatus,
                )
              }
              options={[
                "verified",
                "pending",
                "rejected",
              ]}
            />
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
              disabled={
                !businessName.trim() ||
                !ownerName.trim() ||
                !email.trim()
              }
              className="rounded-xl bg-[#22C55E] px-5 py-2.5 text-sm font-bold text-[#04120A] transition hover:shadow-[0_8px_25px_rgba(34,197,94,0.25)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {merchant
                ? "Save Changes"
                : "Create Merchant"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ============================================================
   DELETE MODAL
============================================================ */

type DeleteMerchantModalProps = {
  merchant: Merchant;
  onCancel: () => void;
  onConfirm: () => void;
};

function DeleteMerchantModal({
  merchant,
  onCancel,
  onConfirm,
}: DeleteMerchantModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-[#1F2937] bg-[#0F172A] p-6 shadow-2xl">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#EF4444]/20 bg-[#EF4444]/10 text-[#EF4444]">
          <TrashIcon />
        </div>

        <h3 className="mt-5 text-xl font-bold text-white">
          Delete merchant?
        </h3>

        <p className="mt-3 text-sm leading-6 text-[#94A3B8]">
          You are about to permanently delete{" "}
          <span className="font-semibold text-white">
            {merchant.businessName}
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
            Delete Merchant
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
  warning?: boolean;
  danger?: boolean;
};

function StatCard({
  label,
  value,
  description,
  icon,
  highlight,
  warning,
  danger,
}: StatCardProps) {
  const containerClass = highlight
    ? "border-[#22C55E]/20 bg-[#22C55E]/5"
    : warning
      ? "border-[#F59E0B]/20 bg-[#F59E0B]/5"
      : danger
        ? "border-[#EF4444]/20 bg-[#EF4444]/5"
        : "border-[#1F2937] bg-[#0F172A]/70";

  const iconClass = highlight
    ? "bg-[#22C55E]/10 text-[#22C55E]"
    : warning
      ? "bg-[#F59E0B]/10 text-[#F59E0B]"
      : danger
        ? "bg-[#EF4444]/10 text-[#EF4444]"
        : "bg-[#111827] text-[#94A3B8]";

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-5 ${containerClass}`}
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
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>
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
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        required
        className="h-11 w-full rounded-xl border border-[#1F2937] bg-[#020617]/60 px-3 text-sm text-white outline-none transition placeholder:text-[#475569] focus:border-[#22C55E]/50 focus:ring-4 focus:ring-[#22C55E]/5"
      />
    </div>
  );
}

/* ============================================================
   SELECT FIELD
============================================================ */

type SelectFieldProps = {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
};

function SelectField({
  label,
  value,
  options,
  onChange,
}: SelectFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold text-[#94A3B8]">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="h-11 w-full rounded-xl border border-[#1F2937] bg-[#020617]/60 px-3 text-sm capitalize text-white outline-none focus:border-[#22C55E]/50"
      >
        <option value="">Select...</option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ============================================================
   ICONS
============================================================ */

function PlusIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
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
      width="20"
      height="20"
      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]"
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
      <path d="m6 6 12 12" />
      <path d="m18 6-12 12" />
    </svg>
  );
}

function StoreIcon() {
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

function ClockIcon() {
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
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function AlertIcon() {
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
      <path d="M10.3 3.7 2.5 17a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 3.7a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}