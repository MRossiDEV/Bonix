import type { BuildingState, WorldBuildingData } from "@/types/3d";

// Priority order matches PRD §22.
const STATE_PRIORITY: Record<BuildingState, number> = {
  LIMITED_PROMO: 5,
  ACTIVE_PROMO: 4,
  RESERVED: 3,
  NEW: 2,
  VISITED: 1,
  NORMAL: 0,
};

export interface BuildingStateInput {
  hasActivePromo: boolean;
  promoExpiresAt?: string;
  isNew: boolean;
  hasReservation: boolean;
  isVisited?: boolean;
}

export function resolveBuildingState(input: BuildingStateInput): BuildingState {
  if (input.hasActivePromo) {
    if (input.promoExpiresAt) {
      const expires = new Date(input.promoExpiresAt).getTime();
      const now = Date.now();

      if (!Number.isNaN(expires) && expires - now < 1000 * 60 * 60 * 6) {
        return "LIMITED_PROMO";
      }
    }

    return "ACTIVE_PROMO";
  }

  if (input.hasReservation) {
    return "RESERVED";
  }

  if (input.isNew) {
    return "NEW";
  }

  if (input.isVisited) {
    return "VISITED";
  }

  return "NORMAL";
}

export function priorityOf(state: BuildingState): number {
  return STATE_PRIORITY[state] ?? 0;
}

export function resolveViewModel(building: WorldBuildingData) {
  const buildingState = resolveBuildingState({
    hasActivePromo: building.hasActivePromo,
    promoExpiresAt: building.promoExpiresAt,
    isNew: building.isNew,
    hasReservation: building.isReserved,
  });

  return {
    ...building,
    buildingState,
    statePriority: priorityOf(buildingState),
  };
}
