"use client";

import { useRef, useState } from "react";

// AssetUploader (PRD §79, §38 partial)
// V1: validates file size (max 25 MB GLB), uploads to the
// `bonix-3d-assets` bucket, and inserts an `assets` row marked
// PROCESSING. Polygon-count + bounding-box extraction are deferred.
// The component surfaces only the validation + network result; it
// expects the parent to refresh the asset list after success.

const MAX_BYTES = 25 * 1024 * 1024;
const ALLOWED_EXTENSIONS = [".glb", ".gltf"];

export interface AssetUploaderProps {
  onUploaded?: (assetId: string) => void;
}

type UploadState =
  | { kind: "idle" }
  | { kind: "uploading"; fileName: string }
  | { kind: "success"; fileName: string }
  | { kind: "error"; message: string };

function inferCategory(fileName: string): string {
  const lower = fileName.toLowerCase();
  if (lower.includes("restaurant")) return "Restaurant";
  if (lower.includes("cafe")) return "Café";
  if (lower.includes("hotel")) return "Hotel";
  if (lower.includes("fitness")) return "Fitness";
  if (lower.includes("tree")) return "Vegetation";
  if (lower.includes("lamp")) return "Prop";
  return "General";
}

function inferAssetType(fileName: string): string {
  const lower = fileName.toLowerCase();
  if (lower.includes("tree")) return "VEGETATION";
  if (lower.includes("lamp") || lower.includes("sign")) return "PROP";
  return "BUILDING";
}

async function uploadToBucket(
  file: File,
  bucket: string,
  path: string,
): Promise<string> {
  const { createClient } = await import("@/lib/supabase/client");
  const supabase = createClient();
  if (!supabase) throw new Error("Supabase unavailable");

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      upsert: true,
      contentType: file.type || "model/gltf-binary",
    });
  if (uploadError) throw new Error(uploadError.message);

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

async function insertAssetRow(args: {
  name: string;
  file: File;
  fileUrl: string;
}): Promise<string> {
  const { createClient } = await import("@/lib/supabase/client");
  const supabase = createClient();
  if (!supabase) throw new Error("Supabase unavailable");

  const slug = args.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const { data, error } = await supabase
    .from("assets")
    .insert({
      name: args.name,
      slug,
      asset_type: inferAssetType(args.file.name),
      category: inferCategory(args.file.name),
      file_url: args.fileUrl,
      status: "PROCESSING",
    })
    .select("id")
    .single();
  if (error || !data) throw new Error(error?.message ?? "Insert failed");
  return data.id;
}

export function AssetUploader({ onUploaded }: AssetUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [state, setState] = useState<UploadState>({ kind: "idle" });

  const handlePick = () => inputRef.current?.click();

  const handleFile = async (file: File) => {
    const lower = file.name.toLowerCase();
    const ok = ALLOWED_EXTENSIONS.some((ext) => lower.endsWith(ext));
    if (!ok) {
      setState({
        kind: "error",
        message: "Only .glb or .gltf files are accepted.",
      });
      return;
    }
    if (file.size > MAX_BYTES) {
      setState({
        kind: "error",
        message: `File exceeds 25 MB limit (${(file.size / 1024 / 1024).toFixed(1)} MB).`,
      });
      return;
    }

    setState({ kind: "uploading", fileName: file.name });

    try {
      const safeName = file.name.replace(/[^A-Za-z0-9._-]/g, "_");
      const path = `uploads/${Date.now()}-${safeName}`;
      const fileUrl = await uploadToBucket(file, "bonix-3d-assets", path);
      const assetId = await insertAssetRow({
        name: file.name.replace(/\.[^.]+$/, ""),
        file,
        fileUrl,
      });
      setState({ kind: "success", fileName: file.name });
      onUploaded?.(assetId);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Upload failed";
      setState({ kind: "error", message });
    }
  };

  return (
    <div className="space-y-3 rounded-2xl border border-dashed border-[#263241] bg-[#0B0F14] p-4">
      <div>
        <p className="text-xs font-bold text-[#F8FAFC]">Upload new asset</p>
        <p className="mt-1 text-[10px] text-[#64748B]">
          GLB / glTF · max 25 MB · uploaded as PROCESSING
       </p>
     </div>

      <input
        ref={inputRef}
        type="file"
        accept=".glb,.gltf"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleFile(file);
          event.target.value = "";
        }}
      />

      <button
        type="button"
        onClick={handlePick}
        className="rounded-xl bg-[#22C55E] px-3 py-2 text-xs font-bold text-[#041007] transition hover:bg-[#4ADE80] disabled:opacity-50"
        disabled={state.kind === "uploading"}
      >
        {state.kind === "uploading" ? "Uploading…" : "Choose GLB"}
     </button>

      {state.kind === "success" ? (
        <p className="text-[10px] font-semibold text-[#22C55E]">
          ✓ {state.fileName} uploaded
       </p>
      ) : null}

      {state.kind === "error" ? (
        <p className="text-[10px] font-semibold text-[#EF4444]">
          {state.message}
       </p>
      ) : null}
   </div>
  );
}
