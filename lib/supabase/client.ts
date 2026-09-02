// lib/supabase/client.ts

import { createBrowserClient } from "@supabase/ssr";

import { publicEnv } from "@/lib/env";

export function createClient() {
  const supabaseUrl = publicEnv.supabaseUrl;
  const supabaseAnonKey = publicEnv.supabaseAnonKey;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      "Supabase client is unavailable because NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing. Restart the app after updating .env."
    );
    return null as never;
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
