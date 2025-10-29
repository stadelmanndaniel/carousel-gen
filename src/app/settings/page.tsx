"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

const MAX_BYTES = 1 * 1024 * 1024; // 1MB
const ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/svg+xml",
  "application/postscript", // commonly used for .ai, though detection varies
];

export default function SettingsPage() {
  const { user, supabase, loading } = useAuth();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    // Only redirect if we're done loading and definitely no user
    if (!loading && !user) {
      // Small delay to allow auth state to propagate after signup
      const timer = setTimeout(() => {
        if (!user) {
          window.location.href = "/auth/login?redirect=/settings";
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [loading, user]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      // First, ensure the user has a profile row
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("logo_path")
        .eq("id", user.id)
        .single();
      
      // If no profile exists, create one
      if (!existingProfile) {
        const { error: insertError } = await supabase
          .from("profiles")
          .upsert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || null
          }, { onConflict: 'id' });
        if (insertError) {
          console.error('Failed to create profile:', insertError);
          return;
        }
      }
      
      // Now get the profile with logo_path
      const { data } = await supabase
        .from("profiles")
        .select("logo_path")
        .eq("id", user.id)
        .single();
        
      if (data?.logo_path) {
        const { data: signed } = await supabase.storage
          .from("logos")
          .createSignedUrl(data.logo_path, 60 * 5);
        if (signed?.signedUrl) setLogoUrl(signed.signedUrl);
      }
    })();
  }, [user, supabase]);

  const onDrop = async (file: File) => {
    setError(null);
    setSuccess(null);
    if (file.size > MAX_BYTES) {
      setError("File exceeds 1MB limit");
      return;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Unsupported file type. Allowed: PNG, JPG, JPEG, SVG, AI");
      return;
    }
    if (!user) return;
    setUploading(true);
    try {
      const objectPath = `${user.id}/logo`;
      console.log('Uploading to path:', objectPath);
      console.log('User ID:', user.id);
      const { error: upErr } = await supabase.storage.from("logos").upload(objectPath, file, {
        upsert: true,
      });
      console.log('Upload result:', { error: upErr });
      if (upErr) throw upErr;
      const { error: profErr } = await supabase
        .from("profiles")
        .update({ logo_path: objectPath })
        .eq("id", user.id);
      if (profErr) throw profErr;
      const { data: signed } = await supabase.storage
        .from("logos")
        .createSignedUrl(objectPath, 60 * 5);
      setLogoUrl(signed?.signedUrl ?? null);
      setSuccess("Logo uploaded successfully");
    } catch (e: any) {
      setError(e.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) onDrop(f);
  };

  const showPreview = useMemo(() => {
    // AI files cannot preview
    return logoUrl && !logoUrl.endsWith(".ai");
  }, [logoUrl]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-10">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-6">
          <div className="text-center">Loading...</div>
        </div>
      </main>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-semibold mb-4">Settings</h1>
        <div className="flex justify-between items-center mb-6">
          <p className="text-sm text-gray-600">Upload your brand logo (max 1MB). Allowed: PNG, JPG, JPEG, SVG, AI.</p>
          <button
            onClick={() => supabase.auth.signOut()}
            className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Sign Out
          </button>
        </div>

        <div
          className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-gray-50"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files?.[0];
            if (f) onDrop(f);
          }}
        >
          <p className="mb-3">Drag & drop your logo here</p>
          <p className="text-sm text-gray-500 mb-4">or</p>
          <label className="inline-block px-4 py-2 bg-gray-900 text-white rounded cursor-pointer">
            Choose file
            <input type="file" className="hidden" onChange={handleFileChange} accept=".png,.jpg,.jpeg,.svg,.ai" />
          </label>
        </div>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        {success && <p className="mt-4 text-sm text-green-600">{success}</p>}

        <div className="mt-6">
          <h2 className="font-medium mb-2">Current logo</h2>
          {showPreview ? (
            <img src={logoUrl!} alt="Logo" className="h-16 object-contain" />
          ) : (
            <p className="text-sm text-gray-500">No preview available.</p>
          )}
        </div>
      </div>
    </main>
  );
}


