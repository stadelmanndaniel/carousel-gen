// lib/supabase/service.ts

import { createClient } from "@supabase/supabase-js";

// ⚠️ This environment variable must be kept SECRET and NOT exposed to the client!
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string; 

let serviceRoleClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseServiceRoleClient() {
    if (!serviceRoleClient) {
        if (!supabaseUrl || !supabaseServiceRoleKey) {
            console.error("Supabase Service Role env vars missing. Cannot perform server actions.");
            throw new Error("Supabase Service Role key not configured.");
        }
        
        // Use the Service Role Key for full access on the server
        serviceRoleClient = createClient(supabaseUrl, supabaseServiceRoleKey);
    }
    return serviceRoleClient;
}