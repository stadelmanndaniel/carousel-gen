"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Loader2, AlertCircle } from "lucide-react";
import CarouselEditor from "@/components/carousel-editor/CarouselEditor";

type ProjectData = {
  style?: any;
  result?: any;
  images?: { name: string; url: string }[];
};

export default function CarouselPage() {
  const searchParams = useSearchParams();
  const project_id = searchParams.get("project_id");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);


  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const init = async () => {
      try {
        // 1️⃣ Get authenticated user
        const {
          data: { user },
          error: userErr,
        } = await supabase.auth.getUser();
        if (userErr || !user) {
          setError("You are not authenticated.");
          setLoading(false);
          return;
        }
        setUser(user);

        // 2️⃣ Verify project ID
        if (!project_id) {
          setError("Missing project_id in URL.");
          setLoading(false);
          return;
        }

        const basePath = `${user.id}/${project_id}/`;

        // 3️⃣ Fetch JSON files
        const fetchJson = async (fileName: string) => {
          const { data, error } = await supabase.storage
            .from("carousels")
            .download(`${basePath}${fileName}`);
          if (error) throw error;
          return JSON.parse(await data.text());
        };

        const [style, result] = await Promise.all([
          fetchJson("style.json"),
          fetchJson("result.json"),
        ]);

        // 4️⃣ List images in the same folder
        const { data: imageList, error: listErr } = await supabase.storage
          .from("carousels")
          .list(basePath, { limit: 100 });

        if (listErr) throw listErr;

        const imagePaths = (imageList ?? [])
          .filter((f) => f.name.match(/\.(png|jpg|jpeg)$/))
          .map((f) => `${basePath}${f.name}`);

        const { data: signedUrls, error: batchErr } = await supabase.storage
          .from("carousels")
          .createSignedUrls(imagePaths, 60 * 60); // 1 hour

        if (batchErr) throw batchErr;

        const imageFiles = signedUrls.map((u, i) => ({
          name: imageList[i].name,
          url: u.signedUrl,
        }));

        setProjectData({ style, result, images: imageFiles });
      } catch (e: any) {
        console.error(e);
        setError(e.message || "Failed to load project.");
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
        <p>Loading carousel...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center text-gray-700 px-4">
        <AlertCircle className="w-10 h-10 text-red-500 mb-2" />
        <h1 className="text-xl font-semibold mb-2">Error</h1>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  if (!projectData) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        <p>No project data found.</p>
      </div>
    );
  }

  const { style, result, images } = projectData;

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto px-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Carousel Viewer</h1>

        {/* Style section */}
        <div className="bg-white rounded-2xl shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-3">🎨 Carousel Viewer</h2>

          {/* Slide selector */}
          <div className="mb-4">
            <label className="text-gray-700 font-medium mr-2">Select Slide:</label>
            <select
              className="border border-gray-300 rounded-md p-2"
              value={activeSlide}
              onChange={(e) => setActiveSlide(Number(e.target.value))}
            >
              {style.layouts.map((_: any, idx: number) => (
                <option key={idx} value={idx}>
                  Slide {idx + 1}
                </option>
              ))}
            </select>
          </div>

          {/* Editor */}
          <div className="flex justify-center">
            <CarouselEditor
              layout={style.layouts[activeSlide]}
              result={result[activeSlide]}
              images={images}
            />
          </div>
        </div>

        {/* Images gallery */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">🖼️ Image assets</h2>
          {images && images.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((img) => (
                <div key={img.name} className="rounded-lg overflow-hidden border">
                  <img
                    src={img.url}
                    alt={img.name}
                    className="w-full h-48 object-cover"
                  />
                  <p className="text-sm text-center text-gray-600 mt-1">{img.name}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No images found in this project.</p>
          )}
        </div>
      </div>
    </div>
  );
}
