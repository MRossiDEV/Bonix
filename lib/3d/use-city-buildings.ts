import { useMemo } from "react";
import { resolveViewModel } from "@/lib/3d/building-state";
import { MOCK_BUILDINGS } from "@/lib/3d/mockWorld";
import {
  useMerchantBrandings,
  type MerchantBranding,
} from "@/lib/3d/use-merchant-branding";
import {
  useActivePromosForBuildings,
  type BuildingPromo,
} from "@/lib/3d/use-active-promo-for-building";
import type { ResolvedBuilding } from "@/types/3d";

// useCityBuildings (PRD §78)
// Joins the building layout (mock today, Supabase rows tomorrow) with
// the live merchant branding + active promo data so the HTML side
// panel and the 3D world stay in sync without duplicating state.
//
// Returns a list where every entry is the ResolvedBuilding the
// renderer wants, plus an `effectivePromoLabel` derived from the
// live promo row when one exists.

export interface CityBuilding extends ResolvedBuilding {
  branding: MerchantBranding;
  livePromo: BuildingPromo | null;
  effectivePromoLabel: string | null;
  isLivePromo: boolean;
}

function mergePromoLabel(
  fallbackLabel: string | null | undefined,
  livePromo: BuildingPromo | null,
): string | null {
  if (livePromo) return livePromo.label;
  return fallbackLabel ?? null;
}

export function useCityBuildings(): CityBuilding[] {
  const merchantIds = useMemo(
    () => MOCK_BUILDINGS.map((b) => b.merchantId),
    [],
  );

  const brandings = useMerchantBrandings(merchantIds);
  const promos = useActivePromosForBuildings(merchantIds);

  return useMemo(() => {
    return MOCK_BUILDINGS.map((building) => {
      const resolved = resolveViewModel(building);
      const branding = brandings[building.merchantId] ?? {
        merchantId: building.merchantId,
        primaryColor: resolved.primaryColor,
        secondaryColor: resolved.secondaryColor,
        signText: null,
        logoUrl: null,
        buildingTemplateId: null,
        interiorTheme: "NEUTRAL" as const,
      };
      const livePromo = promos[building.merchantId] ?? null;
      const isLivePromo = livePromo !== null;

      // Live promo always wins: it overrides hasActivePromo from the
      // mock so the city reflects reality.
      const enriched = isLivePromo
        ? { ...resolved, hasActivePromo: true }
        : resolved;
      const finalState = isLivePromo
        ? resolveViewModel(enriched)
        : resolved;

      return {
        ...finalState,
        branding,
        livePromo,
        isLivePromo,
        effectivePromoLabel: mergePromoLabel(
          finalState.promoLabel,
          livePromo,
        ),
      };
    });
  }, [brandings, promos]);
}
