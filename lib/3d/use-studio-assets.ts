import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/database.types";

// useStudioAssets (PRD §79)
// Reads the admin-facing assets table. Returns rows in the same
// shape the Studio UI expects (id, name, type, category, file,
// status, style, usedIn). Falls back to an empty list when Supabase
// is unavailable so admin pages still render.

type AssetRow =
  Database["public"]["Tables"]["assets"]["Row"];

// Structural subset returned by .select(...). Keeps the function
// happy without forcing the caller to widen the inferred row type.
type AssetRowSubset = {
  id: string;
  name: string;
  asset_type: AssetRow["asset_type"];
  category: string;
  file_url: string;
  status: AssetRow["status"];
  thumbnail_url: string | null;
  preview_url: string | null;
  updated_at: string;
};

export type StudioAsset = {
  id: string;
  name: string;
  type: AssetRow["asset_type"];
  category: string;
  style: string;
  file: string;
  status: AssetRow["status"];
  usedIn: number;
  thumbnailUrl: string | null;
  previewUrl: string | null;
  updatedAt: string;
};

function toStudioAsset(row: AssetRowSubset): StudioAsset {
  const file = row.file_url.split("/").pop() ?? row.file_url;
  return {
    id: row.id,
    name: row.name,
    type: row.asset_type,
    category: row.category,
    style: "Modern",
    file,
    status: row.status,
    usedIn: 0,
    thumbnailUrl: row.thumbnail_url ?? null,
    previewUrl: row.preview_url ?? null,
    updatedAt: row.updated_at,
  };
}

async function fetchAssets(): Promise<StudioAsset[]> {
  const supabase = createClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("assets")
    .select(
      "id, name, asset_type, category, file_url, status, thumbnail_url, preview_url, updated_at",
    )
    .order("updated_at", { ascending: false })
    .limit(200);
  if (error || !data) return [];
  return data.map((row) => toStudioAsset(row as AssetRowSubset));
}

export function useStudioAssets(): StudioAsset[] {
  const [assets, setAssets] = useState<StudioAsset[]>([]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const next = await fetchAssets();
      if (!cancelled) setAssets(next);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return assets;
}
