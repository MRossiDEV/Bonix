"use client";

import { useEffect, useState } from "react";
import type { BonixAssetDefinition } from "@/types/3d";

// useBonixAsset: returns asset metadata plus a ready/loading flag.
// In Phase 2 we only resolve the definition and let R3F's loader
// handle the GLB. Phase 10 will wrap drei's useGLTF in an LRU cache.
//
// We intentionally do NOT call useGLTF here — it must be called
// inside a component that's rendered inside <Canvas>. AssetInstance
// already does that. This hook is the metadata path for things like
// Studio's asset library.

export interface BonixAssetState {
  asset: BonixAssetDefinition | undefined;
  loading: boolean;
  error: string | null;
}

export function useBonixAsset(assetId: string | undefined): BonixAssetState {
  const [state, setState] = useState<BonixAssetState>({
    asset: undefined,
    loading: Boolean(assetId),
    error: null,
  });

  useEffect(() => {
    if (!assetId) {
      setState({ asset: undefined, loading: false, error: null });
      return;
    }

    let cancelled = false;

    setState({ asset: undefined, loading: true, error: null });

    import("@/lib/3d/asset-registry")
      .then(({ resolveAsset }) => {
        if (cancelled) return;
        const asset = resolveAsset(assetId);
        if (!asset) {
          setState({
            asset: undefined,
            loading: false,
            error: `Asset not found: ${assetId}`,
          });
          return;
        }
        setState({ asset, loading: false, error: null });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setState({
          asset: undefined,
          loading: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [assetId]);

  return state;
}
