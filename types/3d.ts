// Bonix 3D World Engine — shared TypeScript types (PRD §72)

export type AssetType =
  | "BUILDING"
  | "PROP"
  | "VEGETATION"
  | "FURNITURE"
  | "VEHICLE"
  | "SIGN"
  | "FOOD"
  | "CHARACTER"
  | "EFFECT"
  | "TERRAIN"
  | "ROAD"
  | "DECORATION"
  | "PROMO";

export type BuildingState =
  | "NORMAL"
  | "NEW"
  | "ACTIVE_PROMO"
  | "LIMITED_PROMO"
  | "RESERVED"
  | "VISITED";

export type WorldTheme =
  | "MONTEVIDEO"
  | "BEACH"
  | "DOWNTOWN"
  | "OLD_TOWN"
  | "MODERN"
  | "NIGHT"
  | "SUMMER"
  | "CHRISTMAS"
  | "HALLOWEEN";

export type WorldType = "USER_CITY" | "MERCHANT_WORLD" | "DISTRICT" | "EVENT";

export type SlotType =
  | "RESTAURANT"
  | "CAFE"
  | "HOTEL"
  | "FITNESS"
  | "RETAIL"
  | "ANY";

export interface AssetMetadata {
  width?: number;
  height?: number;
  depth?: number;
  polycount?: number;
  lod?: boolean;
  animations?: string[];
  supports_branding?: boolean;
  supports_color?: boolean;
  supports_logo?: boolean;
  [key: string]: unknown;
}

export interface BonixAssetDefinition {
  id: string;
  url: string;
  category: string;
  assetType: AssetType;
  thumbnail?: string;
  metadata?: AssetMetadata;
}

export interface BuildingSlot {
  id: string;
  slotKey: string;
  position: [number, number, number];
  rotationY: number;
  scale: number;
  slotType: SlotType;
  occupied: boolean;
}

export interface WorldBuildingData {
  id: string;
  merchantId: string;
  merchantName: string;
  templateId: string;
  assetId: string;
  hasActivePromo: boolean;
  promoId?: string;
  promoLabel?: string;
  promoExpiresAt?: string;
  isFavorite: boolean;
  isReserved: boolean;
  isNew: boolean;
  primaryColor: string;
  secondaryColor: string;
  signText: string;
  logoUrl?: string;
  level: number;
  slotId: string;
}

export interface ResolvedBuilding extends WorldBuildingData {
  buildingState: BuildingState;
  statePriority: number;
}
