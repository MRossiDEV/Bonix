"use client";

import { use, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useMerchantBranding } from "@/lib/3d/use-merchant-branding";
import { useActivePromoForBuilding } from "@/lib/3d/use-active-promo-for-building";
import type { BonixAssetDefinition } from "@/types/3d";

// Live merchant preview (PRD §60, §79)
// Admin edits the primary/secondary colors, the sign text, and
// sees the merchant's building update in real time. Reads the live
// promo so the glow + label match what users will see in their
// city. Falls back to mock styling when the Supabase row is missing.

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

const MOCK_MERCHANT_NAMES: Record<string, string> = {
  "merchant-cocina-verde": "La Cocina Verde",
  "merchant-montevideo-brew": "Montevideo Brew",
  "merchant-casa-nomada": "Casa Nómada",
  "merchant-barrio-fitness": "Barrio Fitness",
  "merchant-hotel-rambla": "Hotel Rambla",
};

const PREVIEW_ASSET: BonixAssetDefinition = {
  id: "asset-restaurant",
  url: "/3d/restaurant.glb",
  category: "RESTAURANT",
  assetType: "BUILDING",
};

interface MerchantStudioPageProps {
  params: Promise<{ adminID?: string; merchantId?: string }> | { adminID?: string; merchantId?: string };
}

export default function MerchantStudioPage({ params }: MerchantStudioPageProps) {
  // Next 16 can hand params as a Promise; unwrap safely.
  const resolved = params instanceof Promise ? use(params) : params;
  const merchantId = resolved?.merchantId ?? "";

  const branding = useMerchantBranding(merchantId);
  const livePromo = useActivePromoForBuilding(merchantId);

  const fallbackName = MOCK_MERCHANT_NAMES[merchantId] ?? "Merchant preview";

  // Local overrides so the admin can tweak colors live. They reset
  // whenever the live branding row updates.
  const [overridePrimary, setOverridePrimary] = useState<string | null>(null);
  const [overrideSecondary, setOverrideSecondary] = useState<string | null>(null);
  const [overrideSignText, setOverrideSignText] = useState<string | null>(null);

  const primaryColor = useMemo(
    () => overridePrimary ?? branding?.primaryColor ?? "#22C55E",
    [overridePrimary, branding],
  );
  const secondaryColor = useMemo(
    () => overrideSecondary ?? branding?.secondaryColor ?? "#F8FAFC",
    [overrideSecondary, branding],
  );
  const signText = useMemo(
    () => overrideSignText ?? branding?.signText ?? fallbackName,
    [overrideSignText, branding, fallbackName],
  );

  return (
    <section className="space-y-4 p-4 sm:p-6">
      <header className="flex items-end justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#64748B]">
            Studio · Merchant preview
      </p>
          <h1 className="mt-1 text-2xl font-black text-[#F8FAFC]">
            {fallbackName}
      </h1>
          <p className="mt-1 text-xs text-[#64748B]">
            Live branding + active promo for merchant{" "}
            <code className="rounded bg-[#1F2937] px-1.5 py-0.5 text-[10px] text-[#94A3B8]">
              {merchantId || "—"}
        </code>
      </p>
    </div>

        {livePromo ? (
          <div className="rounded-full bg-[#22C55E]/10 px-3 py-1.5 text-[10px] font-black text-[#22C55E]">
            Live promo · {livePromo.label}
      </div>
        ) : (
          <div className="rounded-full bg-[#1F2937] px-3 py-1.5 text-[10px] font-bold text-[#64748B]">
            No active promo
      </div>
        )}
  </header>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="overflow-hidden rounded-2xl border border-[#1F2937] bg-[#080C11]">
          <AssetPreview
            assetId={PREVIEW_ASSET.id}
            primaryColor={primaryColor}
            height={420}
          />
  </div>

        <div className="space-y-3">
          <div className="rounded-2xl border border-[#1F2937] bg-[#0B0F14] p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#64748B]">
              Branding
        </p>

            <label className="mt-3 block">
              <span className="block text-[9px] font-bold uppercase tracking-[0.15em] text-[#64748B]">
                Primary color
          </span>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(event) => setOverridePrimary(event.target.value)}
                  className="h-9 w-12 rounded-lg border border-[#1F2937] bg-[#080C11]"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(event) => setOverridePrimary(event.target.value)}
                  className="flex-1 rounded-lg border border-[#1F2937] bg-[#080C11] px-2 py-1.5 text-xs text-[#F8FAFC] outline-none focus:border-[#22C55E]"
                />
       </div>
      </label>

            <label className="mt-3 block">
              <span className="block text-[9px] font-bold uppercase tracking-[0.15em] text-[#64748B]">
                Secondary color
          </span>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(event) => setOverrideSecondary(event.target.value)}
                  className="h-9 w-12 rounded-lg border border-[#1F2937] bg-[#080C11]"
                />
                <input
                  type="text"
                  value={secondaryColor}
                  onChange={(event) => setOverrideSecondary(event.target.value)}
                  className="flex-1 rounded-lg border border-[#1F2937] bg-[#080C11] px-2 py-1.5 text-xs text-[#F8FAFC] outline-none focus:border-[#22C55E]"
                />
       </div>
      </label>

            <label className="mt-3 block">
              <span className="block text-[9px] font-bold uppercase tracking-[0.15em] text-[#64748B]">
                Sign text
          </span>
              <input
                type="text"
                value={signText}
                onChange={(event) => setOverrideSignText(event.target.value)}
                className="mt-1 w-full rounded-lg border border-[#1F2937] bg-[#080C11] px-2 py-1.5 text-xs text-[#F8FAFC] outline-none focus:border-[#22C55E]"
              />
      </label>
    </div>

          <div className="rounded-2xl border border-[#1F2937] bg-[#0B0F14] p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#64748B]">
              Live state
        </p>
            <ul className="mt-3 space-y-2 text-[11px] text-[#F8FAFC]">
              <li>
                Primary:{" "}
                <code className="rounded bg-[#1F2937] px-1.5 py-0.5 text-[10px]">
                  {primaryColor}
          </code>
      </li>
              <li>
                Secondary:{" "}
                <code className="rounded bg-[#1F2937] px-1.5 py-0.5 text-[10px]">
                  {secondaryColor}
          </code>
      </li>
              <li>
                Sign:{" "}
                <code className="rounded bg-[#1F2937] px-1.5 py-0.5 text-[10px]">
                  {signText}
          </code>
      </li>
              <li>
                Logo URL:{" "}
                <code className="rounded bg-[#1F2937] px-1.5 py-0.5 text-[10px]">
                  {branding?.logoUrl ?? "—"}
          </code>
      </li>
              <li>
                Promo:{" "}
                <code className="rounded bg-[#1F2937] px-1.5 py-0.5 text-[10px]">
                  {livePromo?.label ?? "—"}
          </code>
      </li>
    </ul>
  </div>
    </div>
  </div>
</section>
  );
}
