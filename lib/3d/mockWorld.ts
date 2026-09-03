import type {
  BonixAssetDefinition,
  BuildingSlot,
  WorldBuildingData,
} from "@/types/3d";

// Initial mock data per PRD §85. Replaces the hard-coded arrays
// inside app/user/[userId]/city/page.tsx with shapes that match
// the planned Supabase schema (026_3d_world_engine.sql).

export const MOCK_WORLD = {
  id: "world-mock-1",
  name: "My City",
  level: 1,
  theme: "NIGHT" as const,
  maxSlots: 9,
};

export const MOCK_ASSETS: Record<string, BonixAssetDefinition> = {
  "asset-restaurant": {
    id: "asset-restaurant",
    url: "/3d/restaurant.glb",
    category: "RESTAURANT",
    assetType: "BUILDING",
    metadata: { polycount: 4200, supports_color: true, supports_logo: true },
  },
  "asset-cafe": {
    id: "asset-cafe",
    url: "/3d/cafe.glb",
    category: "CAFE",
    assetType: "BUILDING",
    metadata: { polycount: 3800, supports_color: true, supports_logo: true },
  },
  "asset-house": {
    id: "asset-house",
    url: "/3d/house.glb",
    category: "RESTAURANT",
    assetType: "BUILDING",
    metadata: { polycount: 3500, supports_color: true, supports_logo: true },
  },
  "asset-fitness": {
    id: "asset-fitness",
    url: "/3d/house.glb",
    category: "FITNESS",
    assetType: "BUILDING",
    metadata: { polycount: 3500, supports_color: true, supports_logo: true },
  },
  "asset-hotel": {
    id: "asset-hotel",
    url: "/3d/house.glb",
    category: "HOTEL",
    assetType: "BUILDING",
    metadata: { polycount: 3500, supports_color: true, supports_logo: true },
  },
  "asset-tree": {
    id: "asset-tree",
    url: "/3d/tree.glb",
    category: "VEGETATION",
    assetType: "VEGETATION",
    metadata: { polycount: 1200 },
  },
  "asset-lamp": {
    id: "asset-lamp",
    url: "/3d/lamp.glb",
    category: "PROP",
    assetType: "PROP",
    metadata: { polycount: 800 },
  },
};

// SimCity-style layout: a central road runs along Z. Slots sit in
// two rows flanking the road, facing inward (left row faces +X,
// right row faces -X). z = -5, -1.7, 1.6, 5 — 4 slots per side.
const ROW_X = 3.2;
const SLOT_Z = [-5, -1.7, 1.6, 5];

const leftSlots: BuildingSlot[] = SLOT_Z.map((z, i) => ({
  id: `slot-left-${i + 1}`,
  slotKey: `L-${String(i + 1).padStart(2, "0")}`,
  position: [-ROW_X, 0, z],
  rotationY: Math.PI / 2, // face the road (+X)
  scale: 1,
  slotType: "ANY" as const,
  occupied: i < 2,
}));

const rightSlots: BuildingSlot[] = SLOT_Z.map((z, i) => ({
  id: `slot-right-${i + 1}`,
  slotKey: `R-${String(i + 1).padStart(2, "0")}`,
  position: [ROW_X, 0, z],
  rotationY: -Math.PI / 2, // face the road (-X)
  scale: 1,
  slotType: "ANY" as const,
  occupied: i < 2,
}));

export const MOCK_SLOTS: BuildingSlot[] = [
  // Left row occupied
  leftSlots[0],
  leftSlots[1],
  // Right row occupied
  rightSlots[0],
  rightSlots[1],
  // Center landmark spot (occupied) — sits across the road median
  {
    id: "slot-center-1",
    slotKey: "C-01",
    position: [0, 0, -7.5],
    rotationY: 0,
    scale: 1.2,
    slotType: "HOTEL",
    occupied: true,
  },
  // Empty slots — remaining
  leftSlots[2],
  leftSlots[3],
  rightSlots[2],
  rightSlots[3],
];

export const MOCK_BUILDINGS: WorldBuildingData[] = [
  {
    id: "building-1",
    merchantId: "merchant-cocina-verde",
    merchantName: "La Cocina Verde",
    templateId: "tpl-restaurant-modern",
    assetId: "asset-restaurant",
    hasActivePromo: true,
    promoLabel: "20% OFF",
    promoId: "promo-cocina-1",
    isFavorite: true,
    isReserved: false,
    isNew: false,
    primaryColor: "#15803D",
    secondaryColor: "#F8FAFC",
    signText: "LA COCINA VERDE",
    level: 3,
    slotId: "slot-left-1",
  },
  {
    id: "building-2",
    merchantId: "merchant-montevideo-brew",
    merchantName: "Montevideo Brew",
    templateId: "tpl-cafe-modern",
    assetId: "asset-cafe",
    hasActivePromo: true,
    promoLabel: "2x Credits",
    promoId: "promo-brew-1",
    isFavorite: true,
    isReserved: false,
    isNew: false,
    primaryColor: "#B45309",
    secondaryColor: "#FFFBEB",
    signText: "MVDEO BREW",
    level: 2,
    slotId: "slot-right-1",
  },
  {
    id: "building-3",
    merchantId: "merchant-casa-nomada",
    merchantName: "Casa Nómada",
    templateId: "tpl-restaurant-rustic",
    assetId: "asset-house",
    hasActivePromo: false,
    isFavorite: true,
    isReserved: false,
    isNew: true,
    primaryColor: "#7C3AED",
    secondaryColor: "#FAF5FF",
    signText: "CASA NÓMADA",
    level: 2,
    slotId: "slot-right-2",
  },
  {
    id: "building-4",
    merchantId: "merchant-barrio-fitness",
    merchantName: "Barrio Fitness",
    templateId: "tpl-fitness-modern",
    assetId: "asset-fitness",
    hasActivePromo: false,
    isFavorite: true,
    isReserved: true,
    isNew: false,
    primaryColor: "#0EA5E9",
    secondaryColor: "#F0F9FF",
    signText: "BARRIO FITNESS",
    level: 1,
    slotId: "slot-left-2",
  },
  {
    id: "building-5",
    merchantId: "merchant-hotel-rambla",
    merchantName: "Hotel Rambla",
    templateId: "tpl-hotel-modern",
    assetId: "asset-hotel",
    hasActivePromo: false,
    isFavorite: true,
    isReserved: false,
    isNew: false,
    primaryColor: "#475569",
    secondaryColor: "#F8FAFC",
    signText: "HOTEL RAMBLA",
    level: 4,
    slotId: "slot-center-1",
  },
];
