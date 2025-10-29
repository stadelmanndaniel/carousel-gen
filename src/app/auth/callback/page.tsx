"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function AuthCallback() {
  const router = useRouter();
  const { supabase } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth callback error:", error);
          router.push("/?error=auth_failed");
          return;
        }

        if (data.session) {
          console.log("Auth successful, redirecting to dashboard");
          router.push("/dashboard");
        } else {
          console.log("No session found, redirecting to home");
          router.push("/");
        }
      } catch (error) {
        console.error("Auth callback error:", error);
        router.push("/?error=auth_failed");
      }
    };

    handleAuthCallback();
  }, [supabase, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
}
