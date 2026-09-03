import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/database.types";

// useCityProgression (PRD §81)
// Logs and reads city progression events. The points column on
// `city_progress_events` is the canonical source of truth for the
// user's city XP; the hook exposes a small helper that fires-and-
// forgets on the UI side so callers don't have to handle errors.

type ProgressEventRow =
  Database["public"]["Tables"]["city_progress_events"]["Row"];
type ProgressEventKind = ProgressEventRow["kind"];

export interface CityProgressionSnapshot {
  points: number;
  recentEvents: ProgressEventRow[];
}

export function useCityProgression(userId: string | null | undefined) {
  const [snapshot, setSnapshot] = useState<CityProgressionSnapshot>({
    points: 0,
    recentEvents: [],
  });

  useEffect(() => {
    if (!userId) {
      setSnapshot({ points: 0, recentEvents: [] });
      return;
    }

    let cancelled = false;
    const supabase = createClient();
    if (!supabase) return;

    void (async () => {
      const { data, error } = await supabase
        .from("city_progress_events")
        .select("id, user_id, world_id, kind, slot_id, merchant_id, promo_id, points, metadata, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);

      if (cancelled || error || !data) return;
      const points = data.reduce((sum, row) => sum + (row.points ?? 0), 0);
      setSnapshot({ points, recentEvents: data });
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const logEvent = useCallback(
    async (args: {
      kind: ProgressEventKind;
      points?: number;
      slotId?: string;
      merchantId?: string;
      promoId?: string;
      worldId?: string | null;
      metadata?: Record<string, unknown>;
    }) => {
      if (!userId) return;
      const supabase = createClient();
      if (!supabase) return;

      const { data, error } = await supabase
        .from("city_progress_events")
        .insert({
          user_id: userId,
          world_id: args.worldId ?? null,
          kind: args.kind,
          slot_id: args.slotId ?? null,
          merchant_id: args.merchantId ?? null,
          promo_id: args.promoId ?? null,
          points: args.points ?? 0,
          metadata: args.metadata ?? {},
        })
        .select("id, user_id, world_id, kind, slot_id, merchant_id, promo_id, points, metadata, created_at")
        .maybeSingle();

      if (error || !data) return;
      setSnapshot((prev) => ({
        points: prev.points + (data.points ?? 0),
        recentEvents: [data, ...prev.recentEvents].slice(0, 20),
      }));
    },
    [userId],
  );

  return { snapshot, logEvent };
}
