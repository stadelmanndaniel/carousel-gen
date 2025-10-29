"use client";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// Singleton browser client
let browserClient: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseClient() {
  if (!browserClient) {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn("Supabase env vars missing: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY");
      // Return a mock client that won't crash the app
      browserClient = createClient<Database>("https://placeholder.supabase.co", "placeholder-key");
    } else {
      browserClient = createClient<Database>(supabaseUrl, supabaseAnonKey);
    }
  }
  return browserClient;
}


