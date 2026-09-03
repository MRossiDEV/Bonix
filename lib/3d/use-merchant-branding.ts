import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/database.types";

// useMerchantBranding (PRD §43)
// Reads the per-merchant 3D customization row and joins the building
// template it points to. Returns null while loading. Falls back to a
// neutral palette so the canvas still renders if the row is missing.

export type MerchantBranding = {
  merchantId: string;
  primaryColor: string;
  secondaryColor: string;
  signText: string | null;
  logoUrl: string | null;
  buildingTemplateId: string | null;
  interiorTheme: Database["public"]["Tables"]["merchant_3d_customizations"]["Row"]["interior_theme"];
};

const DEFAULT_BRANDING = {
  primaryColor: "#94A3B8",
  secondaryColor: "#f8fafc00",
  signText: null as string | null,
  logoUrl: null as string | null,
  buildingTemplateId: null as string | null,
  interiorTheme: "NEUTRAL" as const,
};

export function useMerchantBranding(
  merchantId: string | null | undefined,
): MerchantBranding | null {
  const [branding, setBranding] = useState<MerchantBranding | null>(null);

  useEffect(() => {
    if (!merchantId) {
      setBranding(null);
      return;
    }

    let cancelled = false;
    const supabase = createClient();
    if (!supabase) {
      setBranding(null);
      return;
    }

    void (async () => {
      const { data, error } = await supabase
        .from("merchant_3d_customizations")
        .select(
          "merchant_id, primary_color, secondary_color, sign_text, logo_url, building_template_id, interior_theme",
        )
        .eq("merchant_id", merchantId)
        .maybeSingle();

      if (cancelled) return;

      if (error || !data) {
        setBranding({
          merchantId,
          ...DEFAULT_BRANDING,
        });
        return;
      }

      setBranding({
        merchantId: data.merchant_id,
        primaryColor: data.primary_color ?? DEFAULT_BRANDING.primaryColor,
        secondaryColor:
          data.secondary_color ?? DEFAULT_BRANDING.secondaryColor,
        signText: data.sign_text ?? null,
        logoUrl: data.logo_url ?? null,
        buildingTemplateId: data.building_template_id ?? null,
        interiorTheme: data.interior_theme ?? DEFAULT_BRANDING.interiorTheme,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [merchantId]);

  return branding;
}

export function useMerchantBrandings(
  merchantIds: string[],
): Record<string, MerchantBranding> {
  const [byId, setById] = useState<Record<string, MerchantBranding>>({});

  useEffect(() => {
    if (merchantIds.length === 0) {
      setById({});
      return;
    }

    let cancelled = false;
    const supabase = createClient();
    if (!supabase) {
      setById({});
      return;
    }

    void (async () => {
      const { data, error } = await supabase
        .from("merchant_3d_customizations")
        .select(
          "merchant_id, primary_color, secondary_color, sign_text, logo_url, building_template_id, interior_theme",
        )
        .in("merchant_id", merchantIds);

      if (cancelled) return;

      if (error || !data) {
        const fallback: Record<string, MerchantBranding> = {};
        for (const id of merchantIds) {
          fallback[id] = { merchantId: id, ...DEFAULT_BRANDING };
        }
        setById(fallback);
        return;
      }

      const next: Record<string, MerchantBranding> = {};
      for (const id of merchantIds) {
        next[id] = { merchantId: id, ...DEFAULT_BRANDING };
      }
      for (const row of data) {
        next[row.merchant_id] = {
          merchantId: row.merchant_id,
          primaryColor: row.primary_color ?? DEFAULT_BRANDING.primaryColor,
          secondaryColor:
            row.secondary_color ?? DEFAULT_BRANDING.secondaryColor,
          signText: row.sign_text ?? null,
          logoUrl: row.logo_url ?? null,
          buildingTemplateId: row.building_template_id ?? null,
          interiorTheme:
            row.interior_theme ?? DEFAULT_BRANDING.interiorTheme,
        };
      }
      setById(next);
    })();

    return () => {
      cancelled = true;
    };
  }, [merchantIds.join("|")]);

  return byId;
}
