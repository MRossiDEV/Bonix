import { resolveViewModel } from "@/lib/3d/building-state";
import {
  MOCK_BUILDINGS,
  MOCK_SLOTS,
  MOCK_WORLD,
} from "@/lib/3d/mockWorld";
import type { BuildingSlot, ResolvedBuilding } from "@/types/3d";

// World-state resolver. Phase 1 sources from MOCK_*; Phase 4 will
// fetch from Supabase. The renderer must always work against this
// shape — never the raw rows (PRD §70).

export interface ResolvedWorld {
  world: typeof MOCK_WORLD;
  slots: BuildingSlot[];
  buildings: ResolvedBuilding[];
  emptySlots: BuildingSlot[];
}

export function resolveMockWorld(): ResolvedWorld {
  const buildings = MOCK_BUILDINGS
    .map((building) => resolveViewModel(building))
    .sort((a, b) => b.statePriority - a.statePriority);

  return {
    world: MOCK_WORLD,
    slots: MOCK_SLOTS,
    buildings,
    emptySlots: MOCK_SLOTS.filter((slot) => !slot.occupied),
  };
}

export function findBuildingBySlot(
  world: ResolvedWorld,
  slotId: string,
): ResolvedBuilding | undefined {
  return world.buildings.find((building) => building.slotId === slotId);
}

export function getSlotById(
  world: ResolvedWorld,
  slotId: string,
): BuildingSlot | undefined {
  return world.slots.find((s) => s.id === slotId);
}
