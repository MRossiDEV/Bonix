"use client";

import { useState } from "react";
import { SceneInspector, type SceneTransform } from "@/components/3d/admin/SceneInspector";
import type { StudioAsset } from "@/lib/3d/use-studio-assets";

// TemplateEditor (PRD §60, §79)
// Picks a base asset, configures per-component placement and
// branding slots. V1 keeps the state local; persistence is the
// parent's responsibility (save button / debounced PATCH).

export interface TemplateComponent {
  id: string;
  assetId: string;
  transform: SceneTransform;
  label?: string;
}

export interface TemplateEditorValue {
  name: string;
  category: string;
  baseAssetId: string | null;
  components: TemplateComponent[];
  primaryColor: string;
  secondaryColor: string;
  signText: string;
}

export interface TemplateEditorProps {
  assets: StudioAsset[];
  value: TemplateEditorValue;
  onChange: (next: TemplateEditorValue) => void;
}

const DEFAULT_TRANSFORM: SceneTransform = {
  position: [0, 0, 0],
  rotationY: 0,
  scale: 1,
};

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

export function TemplateEditor({
  assets,
  value,
  onChange,
}: TemplateEditorProps) {
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(
    null,
  );

  const updateBaseAsset = (assetId: string) => {
    onChange({ ...value, baseAssetId: assetId || null });
  };

  const addComponent = () => {
    const firstAsset = assets[0];
    if (!firstAsset) return;
    const component: TemplateComponent = {
      id: makeId(),
      assetId: firstAsset.id,
      transform: DEFAULT_TRANSFORM,
    };
    onChange({
      ...value,
      components: [...value.components, component],
    });
    setSelectedComponentId(component.id);
  };

  const removeComponent = (id: string) => {
    onChange({
      ...value,
      components: value.components.filter((component) => component.id !== id),
    });
    if (selectedComponentId === id) setSelectedComponentId(null);
  };

  const updateComponent = (id: string, patch: Partial<TemplateComponent>) => {
    onChange({
      ...value,
      components: value.components.map((component) =>
        component.id === id ? { ...component, ...patch } : component,
      ),
    });
  };

  const updateComponentTransform = (id: string, transform: SceneTransform) => {
    updateComponent(id, { transform });
  };

  const selectedComponent = value.components.find(
    (component) => component.id === selectedComponentId,
  );

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-3">
        <div className="rounded-2xl border border-[#1F2937] bg-[#0B0F14] p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#64748B]">
            Template
       </p>

          <label className="mt-3 block">
            <span className="block text-[9px] font-bold uppercase tracking-[0.15em] text-[#64748B]">
              Name
         </span>
            <input
              type="text"
              value={value.name}
              onChange={(event) => onChange({ ...value, name: event.target.value })}
              className="mt-1 w-full rounded-lg border border-[#1F2937] bg-[#080C11] px-2 py-1.5 text-xs text-[#F8FAFC] outline-none focus:border-[#22C55E]"
            />
       </label>

          <label className="mt-3 block">
            <span className="block text-[9px] font-bold uppercase tracking-[0.15em] text-[#64748B]">
              Category
         </span>
            <input
              type="text"
              value={value.category}
              onChange={(event) =>
                onChange({ ...value, category: event.target.value })
              }
              className="mt-1 w-full rounded-lg border border-[#1F2937] bg-[#080C11] px-2 py-1.5 text-xs text-[#F8FAFC] outline-none focus:border-[#22C55E]"
            />
       </label>

          <label className="mt-3 block">
            <span className="block text-[9px] font-bold uppercase tracking-[0.15em] text-[#64748B]">
              Base asset
         </span>
            <select
              value={value.baseAssetId ?? ""}
              onChange={(event) => updateBaseAsset(event.target.value)}
              className="mt-1 w-full rounded-lg border border-[#1F2937] bg-[#080C11] px-2 py-1.5 text-xs text-[#F8FAFC] outline-none focus:border-[#22C55E]"
            >
              <option value="">Select base asset…</option>
              {assets.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.name}
            </option>
              ))}
           </select>
       </label>
     </div>

        <div className="rounded-2xl border border-[#1F2937] bg-[#0B0F14] p-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#64748B]">
              Components
         </p>
            <button
              type="button"
              onClick={addComponent}
              className="rounded-lg bg-[#22C55E] px-2.5 py-1.5 text-[10px] font-bold text-[#041007]"
            >
              + Add
         </button>
       </div>

          <div className="mt-3 space-y-1.5">
            {value.components.length === 0 ? (
              <p className="text-[10px] text-[#64748B]">
                No components yet. Add props, signs, or vegetation.
         </p>
            ) : (
              value.components.map((component) => (
                <button
                  key={component.id}
                  type="button"
                  onClick={() => setSelectedComponentId(component.id)}
                  className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-[10px] transition ${
                    component.id === selectedComponentId
                      ? "border-[#22C55E] bg-[#0F172A] text-[#F8FAFC]"
                      : "border-[#1F2937] bg-[#080C11] text-[#94A3B8]"
                  }`}
                >
                  <span className="truncate">
                    {component.label ??
                      assets.find((asset) => asset.id === component.assetId)?.name ??
                      "Component"}
                 </span>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(event) => {
                      event.stopPropagation();
                      removeComponent(component.id);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.stopPropagation();
                        removeComponent(component.id);
                      }
                    }}
                    className="cursor-pointer text-[#EF4444]"
                  >
                    ✕
                 </span>
             </button>
              ))
            )}
       </div>
     </div>

        <div className="rounded-2xl border border-[#1F2937] bg-[#0B0F14] p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#64748B]">
            Branding slots
       </p>

          <div className="mt-3 grid grid-cols-3 gap-2">
            <label className="block">
              <span className="block text-[9px] font-bold uppercase tracking-[0.15em] text-[#64748B]">
                Primary
           </span>
              <input
                type="color"
                value={value.primaryColor}
                onChange={(event) =>
                  onChange({ ...value, primaryColor: event.target.value })
                }
                className="mt-1 h-8 w-full rounded-lg border border-[#1F2937] bg-[#080C11]"
              />
       </label>

            <label className="block">
              <span className="block text-[9px] font-bold uppercase tracking-[0.15em] text-[#64748B]">
                Secondary
           </span>
              <input
                type="color"
                value={value.secondaryColor}
                onChange={(event) =>
                  onChange({ ...value, secondaryColor: event.target.value })
                }
                className="mt-1 h-8 w-full rounded-lg border border-[#1F2937] bg-[#080C11]"
              />
       </label>

            <label className="block">
              <span className="block text-[9px] font-bold uppercase tracking-[0.15em] text-[#64748B]">
                Sign
           </span>
              <input
                type="text"
                value={value.signText}
                onChange={(event) =>
                  onChange({ ...value, signText: event.target.value })
                }
                className="mt-1 h-8 w-full rounded-lg border border-[#1F2937] bg-[#080C11] px-2 text-xs text-[#F8FAFC] outline-none focus:border-[#22C55E]"
              />
       </label>
     </div>
   </div>
     </div>

      <div className="space-y-3">
        {selectedComponent ? (
          <>
            <div className="rounded-2xl border border-[#1F2937] bg-[#0B0F14] p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#64748B]">
                Selected component
           </p>

              <label className="mt-3 block">
                <span className="block text-[9px] font-bold uppercase tracking-[0.15em] text-[#64748B]">
                  Asset
           </span>
                <select
                  value={selectedComponent.assetId}
                  onChange={(event) =>
                    updateComponent(selectedComponent.id, {
                      assetId: event.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-[#1F2937] bg-[#080C11] px-2 py-1.5 text-xs text-[#F8FAFC] outline-none focus:border-[#22C55E]"
                >
                  {assets.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.name}
              </option>
                  ))}
               </select>
       </label>

              <label className="mt-3 block">
                <span className="block text-[9px] font-bold uppercase tracking-[0.15em] text-[#64748B]">
                  Label (optional)
           </span>
                <input
                  type="text"
                  value={selectedComponent.label ?? ""}
                  onChange={(event) =>
                    updateComponent(selectedComponent.id, {
                      label: event.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-[#1F2937] bg-[#080C11] px-2 py-1.5 text-xs text-[#F8FAFC] outline-none focus:border-[#22C55E]"
                />
       </label>
     </div>

            <SceneInspector
              value={selectedComponent.transform}
              onChange={(transform) =>
                updateComponentTransform(selectedComponent.id, transform)
              }
            />
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#263241] bg-[#0B0F14] p-6 text-center text-[10px] text-[#64748B]">
            Select a component to edit its transform.
       </div>
        )}
   </div>
 </div>
  );
}
