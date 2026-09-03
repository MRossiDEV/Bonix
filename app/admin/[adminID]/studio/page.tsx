"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";

// Lazy: Studio users only see the preview pane when they click an
// asset, and the rest of the page stays a fast 2D UI.
const AssetPreview = dynamic(
  () =>
    import("@/components/3d/assets/AssetPreview").then(
      (mod) => mod.AssetPreview,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center text-[10px] text-[#64748B]">
        Loading 3D…
    </div>
    ),
  },
);

import { AssetUploader } from "@/components/3d/admin/AssetUploader";
import { useStudioAssets } from "@/lib/3d/use-studio-assets";

type AssetType =
  | "Environment"
  | "Furniture"
  | "Kitchen"
  | "Food"
  | "Decoration"
  | "Character"
  | "Lighting";

type AssetStatus = "ready" | "draft" | "processing";

type Asset = {
  id: string;
  name: string;
  type: AssetType;
  category: string;
  style: string;
  file: string;
  status: AssetStatus;
  usedIn: number;
  updatedAt: string;
  previewAssetId?: string;
};

type World = {
  id: string;
  name: string;
  restaurant: string;
  style: string;
  assets: number;
  promos: number;
  status: "published" | "draft";
  updatedAt: string;
};

const initialAssets: Asset[] = [
  {
    id: "AST-001",
    name: "Modern Restaurant",
    type: "Kitchen",
    category: "Kitchen",
    style: "Modern",
    file: "modern-kitchen.glb",
    status: "ready",
    usedIn: 12,
    updatedAt: "Today",
    previewAssetId: "asset-restaurant",
  },
  {
    id: "AST-002",
    name: "Industrial Oven",
    type: "Kitchen",
    category: "Equipment",
    style: "Industrial",
    file: "industrial-oven.glb",
    status: "ready",
    usedIn: 18,
    updatedAt: "Today",
    previewAssetId: "asset-cafe",
  },
  {
    id: "AST-003",
    name: "Wood Restaurant Table",
    type: "Furniture",
    category: "Tables",
    style: "Rustic",
    file: "wood-table.glb",
    status: "ready",
    usedIn: 27,
    updatedAt: "Yesterday",
  },
  {
    id: "AST-004",
    name: "Neon Burger Sign",
    type: "Decoration",
    category: "Signs",
    style: "Urban",
    file: "burger-neon.glb",
    status: "ready",
    usedIn: 9,
    updatedAt: "Yesterday",
    previewAssetId: "asset-house",
  },
  {
    id: "AST-005",
    name: "Burger Deluxe",
    type: "Food",
    category: "Burgers",
    style: "Universal",
    file: "burger-deluxe.glb",
    status: "ready",
    usedIn: 31,
    updatedAt: "Aug 30",
  },
  {
    id: "AST-006",
    name: "Pizza Margherita",
    type: "Food",
    category: "Pizza",
    style: "Universal",
    file: "pizza-margherita.glb",
    status: "ready",
    usedIn: 24,
    updatedAt: "Aug 29",
  },
  {
    id: "AST-007",
    name: "Japanese Counter",
    type: "Furniture",
    category: "Counters",
    style: "Japanese",
    file: "japanese-counter.glb",
    status: "draft",
    usedIn: 0,
    updatedAt: "Aug 28",
    previewAssetId: "asset-tree",
  },
  {
    id: "AST-008",
    name: "Chef Character",
    type: "Character",
    category: "Staff",
    style: "Universal",
    file: "chef-character.glb",
    status: "processing",
    usedIn: 0,
    updatedAt: "Aug 28",
  },
];

const initialWorlds: World[] = [
  {
    id: "WORLD-001",
    name: "La Cocina Verde",
    restaurant: "La Cocina Verde",
    style: "Modern",
    assets: 28,
    promos: 6,
    status: "published",
    updatedAt: "Today",
  },
  {
    id: "WORLD-002",
    name: "Burger House",
    restaurant: "Burger House",
    style: "Urban",
    assets: 34,
    promos: 8,
    status: "published",
    updatedAt: "Yesterday",
  },
  {
    id: "WORLD-003",
    name: "Tokyo Kitchen",
    restaurant: "Tokyo Kitchen",
    style: "Japanese",
    assets: 21,
    promos: 4,
    status: "draft",
    updatedAt: "Aug 29",
  },
];

const assetTypes: AssetType[] = [
  "Environment",
  "Furniture",
  "Kitchen",
  "Food",
  "Decoration",
  "Character",
  "Lighting",
];

function AssetIcon({ type }: { type: AssetType }) {
  const paths: Record<AssetType, React.ReactNode> = {
    Environment: (
      <>
        <path d="m3 18 6-6 4 4 3-3 5 5" />
        <path d="M14 8h.01" />
      </>
    ),
    Furniture: (
      <>
        <path d="M5 10V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2" />
        <path d="M4 10h16v5H4z" />
        <path d="M6 15v3M18 15v3" />
      </>
    ),
    Kitchen: (
      <>
        <rect x="5" y="4" width="14" height="16" rx="2" />
        <path d="M8 8h8M8 12h8M8 16h3" />
      </>
    ),
    Food: (
      <>
        <path d="M4 12h16" />
        <path d="M6 12a6 6 0 0 0 12 0" />
        <path d="M8 7h8" />
      </>
    ),
    Decoration: (
      <>
        <path d="M12 3v18M5 7h14M7 3h10v4H7z" />
      </>
    ),
    Character: (
      <>
        <circle cx="12" cy="7" r="3" />
        <path d="M6 21v-2a6 6 0 0 1 12 0v2" />
      </>
    ),
    Lighting: (
      <>
        <path d="M9 18h6M10 21h4" />
        <path d="M8 14a6 6 0 1 1 8 0c-.8.7-1 1.5-1 2H9c0-.5-.2-1.3-1-2Z" />
      </>
    ),
  };

  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      {paths[type]}
    </svg>
  );
}

function StatusBadge({ status }: { status: AssetStatus }) {
  const config = {
    ready: {
      label: "Ready",
      classes: "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20",
      dot: "bg-[#22C55E]",
    },
    draft: {
      label: "Draft",
      classes: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20",
      dot: "bg-[#F59E0B]",
    },
    processing: {
      label: "Processing",
      classes: "bg-[#3B82F6]/10 text-[#60A5FA] border-[#3B82F6]/20",
      dot: "bg-[#3B82F6]",
    },
  }[status];

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-medium ${config.classes}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
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
          wide ? "max-w-4xl" : "max-w-lg"
        } max-h-[90vh] overflow-y-auto rounded-3xl border border-[#1F2937] bg-[#0F172A] shadow-2xl`}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#1F2937] bg-[#0F172A]/95 px-5 py-4 backdrop-blur">
          <h2 className="text-lg font-semibold text-[#F8FAFC]">
            {title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-[#64748B] hover:bg-[#111827] hover:text-[#F8FAFC]"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export default function StudioPage() {
  const liveAssets = useStudioAssets();
  const [assets, setAssets] = useState<Asset[]>(
    liveAssets.length > 0
      ? (liveAssets as unknown as Asset[])
      : initialAssets,
  );
  const [worlds] = useState<World[]>(initialWorlds);

  const [activeTab, setActiveTab] = useState<
    "assets" | "worlds" | "styles"
  >("assets");

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | AssetType>(
    "all"
  );
  const [statusFilter, setStatusFilter] = useState<
    "all" | AssetStatus
  >("all");

  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(
    null
  );

  const [showUpload, setShowUpload] = useState(false);
  const [showWorldBuilder, setShowWorldBuilder] = useState(false);

  const filteredAssets = useMemo(() => {
    const query = search.toLowerCase().trim();

    return assets.filter((asset) => {
      const matchesSearch =
        !query ||
        asset.name.toLowerCase().includes(query) ||
        asset.file.toLowerCase().includes(query) ||
        asset.style.toLowerCase().includes(query);

      const matchesType =
        typeFilter === "all" || asset.type === typeFilter;

      const matchesStatus =
        statusFilter === "all" || asset.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [assets, search, typeFilter, statusFilter]);

  const readyAssets = assets.filter(
    (asset) => asset.status === "ready"
  ).length;

  const processingAssets = assets.filter(
    (asset) => asset.status === "processing"
  ).length;

  return (
    <div className="relative min-h-full overflow-hidden p-4 sm:p-6 lg:p-8">
      {/* Ambient Studio glow */}
      <div className="pointer-events-none absolute -top-40 left-1/3 h-96 w-96 rounded-full bg-[#22C55E]/10 blur-[150px]" />
      <div className="pointer-events-none absolute right-0 top-1/3 h-72 w-72 rounded-full bg-[#14B8A6]/5 blur-[130px]" />

      {/* Header */}
      <section className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#22C55E]/10 text-[#22C55E]">
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <path d="M12 3 4 7v10l8 4 8-4V7l-8-4Z" />
                <path d="m4 7 8 4 8-4M12 11v10" />
              </svg>
            </span>

            <p className="text-xs font-semibold tracking-[0.2em] text-[#22C55E]">
              BONIX STUDIO
            </p>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#F8FAFC] sm:text-3xl">
            3D World Studio
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-[#94A3B8]">
            Build, organize and assign the 3D worlds that power
            Bonix restaurant experiences and promotions.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setShowUpload(true)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#1F2937] bg-[#111827] px-4 text-sm font-medium text-[#CBD5E1] hover:border-[#334155] hover:text-[#F8FAFC]"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M12 16V4M8 8l4-4 4 4" />
              <path d="M5 14v5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5" />
            </svg>
            Upload Asset
          </button>

          <button
            type="button"
            onClick={() => setShowWorldBuilder(true)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#22C55E] px-4 text-sm font-semibold text-[#04110A] hover:bg-[#4ADE80]"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M12 3v18M3 12h18" />
              <path d="m5 5 14 14M19 5 5 19" opacity=".35" />
            </svg>
            Create World
          </button>
        </div>
      </section>

      {/* Studio stats */}
      <section className="relative mt-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <div className="rounded-2xl border border-[#1F2937] bg-[#0F172A]/80 p-4">
          <p className="text-xs text-[#64748B]">3D Assets</p>
          <p className="mt-2 text-2xl font-bold text-[#F8FAFC]">
            {assets.length}
          </p>
        </div>

        <div className="rounded-2xl border border-[#1F2937] bg-[#0F172A]/80 p-4">
          <p className="text-xs text-[#64748B]">Ready</p>
          <p className="mt-2 text-2xl font-bold text-[#22C55E]">
            {readyAssets}
          </p>
        </div>

        <div className="rounded-2xl border border-[#1F2937] bg-[#0F172A]/80 p-4">
          <p className="text-xs text-[#64748B]">Processing</p>
          <p className="mt-2 text-2xl font-bold text-[#60A5FA]">
            {processingAssets}
          </p>
        </div>

        <div className="rounded-2xl border border-[#1F2937] bg-[#0F172A]/80 p-4">
          <p className="text-xs text-[#64748B]">Mini Worlds</p>
          <p className="mt-2 text-2xl font-bold text-[#F8FAFC]">
            {worlds.length}
          </p>
        </div>

        <div className="col-span-2 rounded-2xl border border-[#1F2937] bg-[#0F172A]/80 p-4 lg:col-span-1">
          <p className="text-xs text-[#64748B]">Published Worlds</p>
          <p className="mt-2 text-2xl font-bold text-[#F8FAFC]">
            {worlds.filter((world) => world.status === "published").length}
          </p>
        </div>
      </section>

      {/* Studio navigation */}
      <section className="relative mt-6 flex gap-1 overflow-x-auto rounded-2xl border border-[#1F2937] bg-[#0B0F14] p-1">
        {[
          ["assets", "Asset Library"],
          ["worlds", "Mini Worlds"],
          ["styles", "Kitchen & Styles"],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() =>
              setActiveTab(value as "assets" | "worlds" | "styles")
            }
            className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition ${
              activeTab === value
                ? "bg-[#111827] text-[#F8FAFC] shadow-sm"
                : "text-[#64748B] hover:text-[#CBD5E1]"
            }`}
          >
            {label}
          </button>
        ))}
      </section>

      {/* Asset Library */}
      {activeTab === "assets" && (
        <section className="relative mt-4">
          {/* Filters */}
          <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_180px_160px]">
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
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search 3D assets..."
                className="h-11 w-full rounded-xl border border-[#1F2937] bg-[#0F172A] pl-10 pr-3 text-sm text-[#F8FAFC] outline-none placeholder:text-[#64748B] focus:border-[#22C55E]/50"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(event) =>
                setTypeFilter(
                  event.target.value as "all" | AssetType
                )
              }
              className="h-11 rounded-xl border border-[#1F2937] bg-[#0F172A] px-3 text-sm text-[#CBD5E1] outline-none focus:border-[#22C55E]/50"
            >
              <option value="all">All Asset Types</option>
              {assetTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as "all" | AssetStatus
                )
              }
              className="h-11 rounded-xl border border-[#1F2937] bg-[#0F172A] px-3 text-sm text-[#CBD5E1] outline-none focus:border-[#22C55E]/50"
            >
              <option value="all">All Statuses</option>
              <option value="ready">Ready</option>
              <option value="draft">Draft</option>
              <option value="processing">Processing</option>
            </select>
          </div>

          {/* Asset grid */}
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {filteredAssets.map((asset) => (
              <button
                type="button"
                key={asset.id}
                onClick={() => setSelectedAsset(asset)}
                className="group overflow-hidden rounded-2xl border border-[#1F2937] bg-[#0F172A]/80 text-left transition hover:-translate-y-0.5 hover:border-[#22C55E]/30 hover:bg-[#111827]"
              >
                {/* 3D Preview */}
                <div className="relative flex h-40 items-center justify-center overflow-hidden bg-[#080C11]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#22C55E12,transparent_60%)]" />

                  {asset.previewAssetId ? (
                    <div className="absolute inset-0">
                      <AssetPreview
                        assetId={asset.previewAssetId}
                        height={160}
                      />
                 </div>
                  ) : (
                    <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-[#334155] bg-[#111827] text-[#22C55E] shadow-2xl transition group-hover:scale-105">
                      <AssetIcon type={asset.type} />
                 </div>
                  )}

                  <div className="absolute left-3 top-3">
                    <span className="rounded-lg border border-[#1F2937] bg-[#0B0F14]/90 px-2 py-1 text-[10px] font-medium text-[#94A3B8]">
                      {asset.type}
                    </span>
                  </div>

                  <div className="absolute right-3 top-3">
                    <StatusBadge status={asset.status} />
                  </div>

                  <div className="absolute bottom-3 left-3 rounded-lg border border-[#1F2937] bg-[#0B0F14]/90 px-2 py-1 text-[10px] text-[#64748B]">
                    3D / GLB
                  </div>
                </div>

                {/* Asset info */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-[#F8FAFC]">
                        {asset.name}
                      </h3>

                      <p className="mt-1 truncate text-xs text-[#64748B]">
                        {asset.file}
                      </p>
                    </div>

                    <svg
                      className="h-4 w-4 shrink-0 text-[#475569] group-hover:text-[#22C55E]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-[#64748B]">
                      Style:{" "}
                      <span className="text-[#CBD5E1]">
                        {asset.style}
                      </span>
                    </span>

                    <span className="text-xs text-[#64748B]">
                      Used {asset.usedIn}×
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {filteredAssets.length === 0 && (
            <div className="rounded-2xl border border-[#1F2937] bg-[#0F172A]/80 py-16 text-center">
              <p className="text-sm font-medium text-[#CBD5E1]">
                No assets found
              </p>
              <p className="mt-1 text-xs text-[#64748B]">
                Try changing your search or filters.
              </p>
            </div>
          )}
        </section>
      )}

      {/* Worlds */}
      {activeTab === "worlds" && (
        <section className="relative mt-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#F8FAFC]">
                Mini Worlds
              </h2>
              <p className="mt-1 text-sm text-[#64748B]">
                Complete 3D environments assembled from Studio assets.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowWorldBuilder(true)}
              className="hidden rounded-xl bg-[#22C55E] px-4 py-2.5 text-sm font-semibold text-[#04110A] hover:bg-[#4ADE80] sm:block"
            >
              + New World
            </button>
          </div>

          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {worlds.map((world) => (
              <article
                key={world.id}
                className="overflow-hidden rounded-2xl border border-[#1F2937] bg-[#0F172A]/80"
              >
                <div className="relative flex h-48 items-center justify-center overflow-hidden bg-[#080C11]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#22C55E10,transparent_65%)]" />

                  <div className="relative h-28 w-44 rounded-2xl border border-[#334155] bg-[#111827] shadow-2xl">
                    <div className="absolute left-4 top-4 h-10 w-14 rounded-lg border border-[#334155] bg-[#0B0F14]" />
                    <div className="absolute right-4 top-4 h-10 w-14 rounded-lg border border-[#334155] bg-[#0B0F14]" />
                    <div className="absolute bottom-4 left-1/2 h-8 w-16 -translate-x-1/2 rounded-lg border border-[#22C55E]/30 bg-[#22C55E]/10" />
                  </div>

                  <span
                    className={`absolute right-3 top-3 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                      world.status === "published"
                        ? "border-[#22C55E]/20 bg-[#22C55E]/10 text-[#22C55E]"
                        : "border-[#F59E0B]/20 bg-[#F59E0B]/10 text-[#F59E0B]"
                    }`}
                  >
                    {world.status === "published"
                      ? "Published"
                      : "Draft"}
                  </span>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-[#F8FAFC]">
                        {world.name}
                      </h3>
                      <p className="mt-1 text-xs text-[#64748B]">
                        {world.restaurant}
                      </p>
                    </div>

                    <span className="rounded-lg border border-[#1F2937] bg-[#111827] px-2 py-1 text-[10px] text-[#94A3B8]">
                      {world.style}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-3 divide-x divide-[#1F2937] rounded-xl border border-[#1F2937] bg-[#0B0F14]">
                    <div className="p-3 text-center">
                      <p className="text-sm font-bold text-[#F8FAFC]">
                        {world.assets}
                      </p>
                      <p className="mt-1 text-[10px] text-[#64748B]">
                        Assets
                      </p>
                    </div>

                    <div className="p-3 text-center">
                      <p className="text-sm font-bold text-[#F8FAFC]">
                        {world.promos}
                      </p>
                      <p className="mt-1 text-[10px] text-[#64748B]">
                        Promos
                      </p>
                    </div>

                    <div className="p-3 text-center">
                      <p className="text-sm font-bold text-[#F8FAFC]">
                        {world.updatedAt}
                      </p>
                      <p className="mt-1 text-[10px] text-[#64748B]">
                        Updated
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      className="flex-1 rounded-xl border border-[#1F2937] bg-[#111827] py-2.5 text-xs font-medium text-[#CBD5E1] hover:text-[#F8FAFC]"
                    >
                      Open Studio
                    </button>

                    <button
                      type="button"
                      className="flex-1 rounded-xl bg-[#22C55E]/10 py-2.5 text-xs font-semibold text-[#22C55E] hover:bg-[#22C55E]/15"
                    >
                      Assign
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Styles */}
      {activeTab === "styles" && (
        <section className="relative mt-4">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-[#F8FAFC]">
              Kitchen & Restaurant Styles
            </h2>

            <p className="mt-1 text-sm text-[#64748B]">
              Style systems determine the visual language available when
              building a restaurant world.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                name: "Modern",
                description: "Clean, contemporary restaurant environment.",
                assets: 42,
              },
              {
                name: "Industrial",
                description: "Metal, concrete, dark surfaces and urban details.",
                assets: 31,
              },
              {
                name: "Japanese",
                description: "Minimal, warm wood and Japanese-inspired elements.",
                assets: 28,
              },
              {
                name: "Rustic",
                description: "Natural wood, warm lighting and traditional details.",
                assets: 37,
              },
              {
                name: "Urban",
                description: "Street-food, neon and contemporary city aesthetic.",
                assets: 24,
              },
              {
                name: "Luxury",
                description: "Premium materials and sophisticated environments.",
                assets: 19,
              },
            ].map((style) => (
              <button
                type="button"
                key={style.name}
                className="group rounded-2xl border border-[#1F2937] bg-[#0F172A]/80 p-5 text-left transition hover:border-[#22C55E]/30 hover:bg-[#111827]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#22C55E]/10 text-[#22C55E]">
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    >
                      <path d="M12 3 4 7v10l8 4 8-4V7l-8-4Z" />
                      <path d="m4 7 8 4 8-4" />
                    </svg>
                  </div>

                  <span className="text-xs text-[#64748B]">
                    {style.assets} assets
                  </span>
                </div>

                <h3 className="mt-4 font-semibold text-[#F8FAFC] group-hover:text-[#22C55E]">
                  {style.name}
                </h3>

                <p className="mt-2 text-xs leading-5 text-[#64748B]">
                  {style.description}
                </p>

                <div className="mt-4 flex items-center text-xs font-medium text-[#94A3B8]">
                  Manage style
                  <svg
                    className="ml-1 h-3.5 w-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Asset detail */}
      {selectedAsset && (
        <Modal
          title="3D Asset"
          onClose={() => setSelectedAsset(null)}
          wide
        >
          <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
            <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-[#1F2937] bg-[#080C11]">
              {selectedAsset.previewAssetId ? (
                <div className="w-full p-3">
                  <AssetPreview
                    assetId={selectedAsset.previewAssetId}
                    height={320}
                  />
             </div>
              ) : (
                <div className="text-center">
                  <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-3xl border border-[#334155] bg-[#111827] text-[#22C55E] shadow-2xl">
                    <AssetIcon type={selectedAsset.type} />
               </div>

                  <p className="mt-4 text-sm font-medium text-[#CBD5E1]">
                    3D Preview
               </p>

                  <p className="mt-1 text-xs text-[#64748B]">
                    {selectedAsset.file}
               </p>
             </div>
              )}
         </div>

            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-[#64748B]">
                    {selectedAsset.id}
                  </p>

                  <h3 className="mt-1 text-xl font-bold text-[#F8FAFC]">
                    {selectedAsset.name}
                  </h3>
                </div>

                <StatusBadge status={selectedAsset.status} />
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <p className="text-xs text-[#64748B]">
                    Asset Type
                  </p>
                  <p className="mt-1 text-sm text-[#CBD5E1]">
                    {selectedAsset.type}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[#64748B]">
                    Category
                  </p>
                  <p className="mt-1 text-sm text-[#CBD5E1]">
                    {selectedAsset.category}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[#64748B]">
                    Style
                  </p>
                  <p className="mt-1 text-sm text-[#CBD5E1]">
                    {selectedAsset.style}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[#64748B]">
                    Used In
                  </p>
                  <p className="mt-1 text-sm text-[#CBD5E1]">
                    {selectedAsset.usedIn} worlds / promos
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className="h-11 rounded-xl border border-[#1F2937] bg-[#111827] text-sm font-medium text-[#CBD5E1]"
                >
                  Edit Asset
                </button>

                <button
                  type="button"
                  className="h-11 rounded-xl bg-[#22C55E] text-sm font-semibold text-[#04110A]"
                >
                  Assign Asset
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Upload asset */}
      {showUpload && (
        <Modal
          title="Upload 3D Asset"
          onClose={() => setShowUpload(false)}
        >
          <div className="rounded-2xl border border-dashed border-[#334155] bg-[#0B0F14] p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#22C55E]/10 text-[#22C55E]">
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M12 16V4M8 8l4-4 4 4" />
                <path d="M5 14v5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5" />
              </svg>
            </div>

            <h3 className="mt-4 font-semibold text-[#F8FAFC]">
              Drop your 3D asset here
            </h3>

            <p className="mt-2 text-xs leading-5 text-[#64748B]">
              Supported formats: GLB, GLTF, FBX, OBJ
            </p>

            <button
              type="button"
              onClick={() => setShowUpload(false)}
              className="mt-5 rounded-xl bg-[#22C55E] px-5 py-2.5 text-sm font-semibold text-[#04110A]"
            >
              Select File
            </button>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-medium text-[#94A3B8]">
                Asset Type
              </label>

              <select className="h-11 w-full rounded-xl border border-[#1F2937] bg-[#0B0F14] px-3 text-sm text-[#CBD5E1]">
                {assetTypes.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-[#94A3B8]">
                Style
              </label>

              <select className="h-11 w-full rounded-xl border border-[#1F2937] bg-[#0B0F14] px-3 text-sm text-[#CBD5E1]">
                <option>Universal</option>
                <option>Modern</option>
                <option>Industrial</option>
                <option>Japanese</option>
                <option>Rustic</option>
                <option>Urban</option>
                <option>Luxury</option>
              </select>
            </div>
          </div>
        </Modal>
      )}

      {/* World builder */}
      {showWorldBuilder && (
        <Modal
          title="Create Mini World"
          onClose={() => setShowWorldBuilder(false)}
          wide
        >
          <div className="grid gap-5 lg:grid-cols-[1fr_1.3fr]">
            {/* World preview */}
            <div className="min-h-[360px] rounded-2xl border border-[#1F2937] bg-[#080C11] p-4">
              <div className="flex h-full min-h-[330px] items-center justify-center rounded-xl border border-[#1F2937] bg-[#0B0F14]">
                <div className="text-center">
                  <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-2xl border border-[#334155] bg-[#111827] text-[#22C55E]">
                    <svg
                      className="h-8 w-8"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="m12 3 8 4v10l-8 4-8-4V7l8-4Z" />
                      <path d="m4 7 8 4 8-4M12 11v10" />
                    </svg>
                  </div>

                  <p className="mt-4 text-sm font-semibold text-[#F8FAFC]">
                    Empty World
                  </p>

                  <p className="mt-1 text-xs text-[#64748B]">
                    Drag assets here in the full Studio editor.
                  </p>
                </div>
              </div>
            </div>

            {/* World configuration */}
            <div>
              <div className="grid gap-4">
                <div>
                  <label className="mb-2 block text-xs font-medium text-[#94A3B8]">
                    World Name
                  </label>

                  <input
                    placeholder="e.g. Summer Burger Experience"
                    className="h-11 w-full rounded-xl border border-[#1F2937] bg-[#0B0F14] px-3 text-sm text-[#F8FAFC] outline-none placeholder:text-[#64748B] focus:border-[#22C55E]/50"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-[#94A3B8]">
                    Restaurant
                  </label>

                  <select className="h-11 w-full rounded-xl border border-[#1F2937] bg-[#0B0F14] px-3 text-sm text-[#CBD5E1]">
                    <option>Select restaurant</option>
                    <option>La Cocina Verde</option>
                    <option>Burger House</option>
                    <option>Tokyo Kitchen</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-[#94A3B8]">
                    Base Style
                  </label>

                  <select className="h-11 w-full rounded-xl border border-[#1F2937] bg-[#0B0F14] px-3 text-sm text-[#CBD5E1]">
                    <option>Modern</option>
                    <option>Industrial</option>
                    <option>Japanese</option>
                    <option>Rustic</option>
                    <option>Urban</option>
                    <option>Luxury</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-[#94A3B8]">
                    Environment
                  </label>

                  <select className="h-11 w-full rounded-xl border border-[#1F2937] bg-[#0B0F14] px-3 text-sm text-[#CBD5E1]">
                    <option>Restaurant Interior</option>
                    <option>Kitchen</option>
                    <option>Restaurant Exterior</option>
                    <option>Bar</option>
                    <option>Promo Stage</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-[#1F2937] bg-[#0B0F14] p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  Next Step
                </p>

                <p className="mt-2 text-sm text-[#CBD5E1]">
                  After creating the world, the full 3D editor will let
                  you place assets, configure lighting, define camera
                  positions and connect the world to promos.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowWorldBuilder(false)}
                className="mt-5 h-11 w-full rounded-xl bg-[#22C55E] text-sm font-semibold text-[#04110A] hover:bg-[#4ADE80]"
              >
                Create World & Open Studio
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}