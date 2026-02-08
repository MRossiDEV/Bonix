"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

const SESSION_SYNC_KEY = "bonix:session-sync";

export function AuthSessionSync() {
  const router = useRouter();

  useEffect(() => {
    let active = true;

    const syncSession = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      const session = data.session;

      if (!session || !active) {
        return;
      }

      const cacheKey = `${session.user.id}:${session.access_token.slice(0, 12)}`;

      try {
        if (sessionStorage.getItem(SESSION_SYNC_KEY) === cacheKey) {
          return;
        }
      } catch {
        // Ignore storage errors and continue syncing.
      }

      const response = await fetch("/auth/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        }),
      });

      if (!active) {
        return;
      }

      if (response.ok) {
        try {
          sessionStorage.setItem(SESSION_SYNC_KEY, cacheKey);
        } catch {
          // Ignore storage errors.
        }
        router.refresh();
      }
    };

    syncSession();

    return () => {
      active = false;
    };
  }, [router]);

  return null;
}
