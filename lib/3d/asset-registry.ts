import type { BonixAssetDefinition } from "@/types/3d";

// Central asset registry (PRD §33). In V1 the registry is a static
// map of known IDs; Phase 4 swaps this for a Supabase query against
// the `assets` table. Consumers must always go through
// `resolveAsset()` — never reach for the raw map.

const STATIC_REGISTRY: Record<string, BonixAssetDefinition> = {
  "asset-restaurant": {
    id: "asset-restaurant",
    url: "/3d/restaurant.glb",
    category: "RESTAURANT",
    assetType: "BUILDING",
    thumbnail: "/3d/thumb-restaurant.png",
    metadata: {
      polycount: 4200,
      supports_color: true,
      supports_logo: true,
      animations: ["idle"],
    },
  },
  "asset-cafe": {
    id: "asset-cafe",
    url: "/3d/cafe.glb",
    category: "CAFE",
    assetType: "BUILDING",
    thumbnail: "/3d/thumb-cafe.png",
    metadata: {
      polycount: 3800,
      supports_color: true,
      supports_logo: true,
      animations: ["idle"],
    },
  },
  "asset-house": {
    id: "asset-house",
    url: "/3d/house.glb",
    category: "RESTAURANT",
    assetType: "BUILDING",
    thumbnail: "/3d/thumb-house.png",
    metadata: {
      polycount: 3500,
      supports_color: true,
      supports_logo: true,
      animations: ["idle"],
    },
  },
  "asset-tree": {
    id: "asset-tree",
    url: "/3d/tree.glb",
    category: "VEGETATION",
    assetType: "VEGETATION",
    thumbnail: "/3d/thumb-tree.png",
    metadata: { polycount: 1200 },
  },
  "asset-lamp": {
    id: "asset-lamp",
    url: "/3d/lamp.glb",
    category: "PROP",
    assetType: "PROP",
    thumbnail: "/3d/thumb-lamp.png",
    metadata: { polycount: 800 },
  },
};

export function resolveAsset(id: string): BonixAssetDefinition | undefined {
  return STATIC_REGISTRY[id];
}

export function listAssets(): BonixAssetDefinition[] {
  return Object.values(STATIC_REGISTRY);
}
