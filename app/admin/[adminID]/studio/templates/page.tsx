"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { TemplateEditor, type TemplateEditorValue } from "@/components/3d/admin/TemplateEditor";
import { useStudioAssets, type StudioAsset } from "@/lib/3d/use-studio-assets";
import { resolveAsset } from "@/lib/3d/asset-registry";

// Studio · Templates (PRD §79)
// Lists the assets the admin can compose into a building template,
// and shows the live 3D preview of the current draft. V1 keeps the
// template local; persistence is intentionally deferred.

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

function blankTemplate(baseAssets: StudioAsset[]): TemplateEditorValue {
  return {
    name: "New template",
    category: "Restaurant",
    baseAssetId: baseAssets[0]?.id ?? null,
    components: [],
    primaryColor: "#22C55E",
    secondaryColor: "#F8FAFC",
    signText: "BONIX",
  };
}

export default function TemplatesStudioPage() {
  const assets = useStudioAssets();
  const [value, setValue] = useState<TemplateEditorValue | null>(null);

  // Lazy-init once we know whether assets loaded.
  const draft = useMemo<TemplateEditorValue>(() => {
    if (value) return value;
    return blankTemplate(assets);
  }, [value, assets]);

  const previewAssetId = draft.baseAssetId ?? assets[0]?.id ?? "asset-restaurant";
  const previewAsset = resolveAsset(previewAssetId);

  return (
    <section className="space-y-4 p-4 sm:p-6">
      <header>
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#64748B]">
          Studio · Templates
 </p>
        <h1 className="mt-1 text-2xl font-black text-[#F8FAFC]">
          Building templates
 </h1>
        <p className="mt-1 text-xs text-[#64748B]">
          Compose a base asset + components, set branding slots, and
          preview the result live. Persistence ships in a later phase.
 </p>
</header>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <TemplateEditor
          assets={assets}
          value={draft}
          onChange={(next) => setValue(next)}
        />

        <div className="space-y-3">
          <div className="overflow-hidden rounded-2xl border border-[#1F2937] bg-[#080C11]">
            <AssetPreview
              assetId={previewAssetId}
              primaryColor={draft.primaryColor}
              height={360}
            />
 </div>

          <div className="rounded-2xl border border-[#1F2937] bg-[#0B0F14] p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#64748B]">
              Preview summary
 </p>
            <ul className="mt-3 space-y-2 text-[11px] text-[#F8FAFC]">
              <li>
                Base asset:{" "}
                <code className="rounded bg-[#1F2937] px-1.5 py-0.5 text-[10px]">
                  {previewAsset?.id ?? "—"}
         </code>
     </li>
              <li>
                Components:{" "}
                <code className="rounded bg-[#1F2937] px-1.5 py-0.5 text-[10px]">
                  {draft.components.length}
         </code>
     </li>
              <li>
                Sign:{" "}
                <code className="rounded bg-[#1F2937] px-1.5 py-0.5 text-[10px]">
                  {draft.signText}
         </code>
     </li>
   </ul>
 </div>
   </div>
 </div>
</section>
  );
}
