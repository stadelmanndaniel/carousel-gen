// app/carousel/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
// Import the Editor, which now handles its own data loading
import CarouselEditor from "@/components/carousel-editor/CarouselEditor"; 
import { getSupabaseClient } from '@/lib/supabase/client';

export default function CarouselPage() {
  const searchParams = useSearchParams();
  const project_id = searchParams.get("project_id");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = getSupabaseClient();

  useEffect(() => {
    const init = async () => {
      try {
        const {
          data: { user },
          error: userErr,
        } = await supabase.auth.getUser();

        if (userErr || !user) {
          setError("You are not authenticated.");
          return;
        }
        setUser(user);

        if (!project_id) {
          setError("Missing project_id in URL.");
          return;
        }
      } catch (e: any) {
        console.error(e);
        setError("Failed to initialize user session.");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [project_id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-700">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-purple-600" />
        <p>Loading session...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center text-gray-700 px-4">
        <AlertCircle className="w-10 h-10 text-red-500 mb-2" />
        <h1 className="text-xl font-semibold mb-2">Error</h1>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }
  
  // ✅ Pass necessary IDs to the Editor component
  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto px-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Carousel Editor</h1>
        
        <CarouselEditor
          userId={user.id}
          projectId={project_id!}
        />
        
        {/* Note: The Images gallery should also be moved inside CarouselEditor 
            or fetch its data from the editor's state if possible. 
            For this rewrite, we'll assume CarouselEditor contains everything now.
        */}
      </div>
    </div>
  );
}