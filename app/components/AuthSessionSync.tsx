"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

const SESSION_SYNC_KEY = "bonix:session-sync";

export function AuthSessionSync() {
  const router = useRouter();

  useEffect(() => {
    let active = true;
    let lastLogAt = 0;

    const logSyncIssue = (message: string, error?: unknown) => {
      const now = Date.now();
      if (now - lastLogAt < 60_000) {
        return;
      }
      lastLogAt = now;
      if (error) {
        console.warn(message, error);
      } else {
        console.warn(message);
      }
    };

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
        logSyncIssue("Auth session sync: sessionStorage unavailable before sync.");
      }

      let response: Response | null = null;
      try {
        response = await fetch("/auth/sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
          }),
        });
      } catch (error) {
        logSyncIssue("Auth session sync: request failed.", error);
        return;
      }

      if (!active) {
        return;
      }

      if (!response.ok) {
        logSyncIssue("Auth session sync: non-OK response.");
        return;
      }

      try {
        sessionStorage.setItem(SESSION_SYNC_KEY, cacheKey);
      } catch {
        logSyncIssue("Auth session sync: sessionStorage unavailable after sync.");
      }
      router.refresh();
    };

    syncSession();

    return () => {
      active = false;
    };
  }, [router]);

  return null;
}
