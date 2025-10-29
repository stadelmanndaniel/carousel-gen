"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { SupabaseClient, Session, User } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export function useAuth() {
  const supabase = getSupabaseClient();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<import("@supabase/supabase-js").Session | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    // Check if we have valid Supabase configuration
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder')) {
      console.log('Supabase not configured, setting loading to false');
      setLoading(false);
      setSession(null);
      return;
    }
    
    try {
      supabase.auth.getSession().then(({ data }) => {
        if (!isMounted) return;
        console.log('Initial session:', data.session);
        setSession(data.session ?? null);
        setLoading(false);
      }).catch((error) => {
        console.error('Error getting session:', error);
        if (!isMounted) return;
        setLoading(false);
        setSession(null);
      });
      
      const { data: sub } = supabase.auth.onAuthStateChange((event, newSession) => {
        console.log('Auth state change:', event, newSession);
        setSession(newSession);
      });
      
      return () => {
        isMounted = false;
        sub.subscription.unsubscribe();
      };
    } catch (error) {
      console.error('Error in useAuth useEffect:', error);
      setLoading(false);
      setSession(null);
    }
  }, []); // Remove supabase dependency to prevent infinite loop

  return { 
    supabase: supabase as SupabaseClient<Database>, 
    session, 
    loading, 
    user: session?.user ?? null 
  };
}


