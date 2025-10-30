import React, { useRef, useState } from "react";
import { X } from "lucide-react";
import { getSupabaseClient } from '@/lib/supabase/client';

interface ReplaceImageModalProps {
  images: { name: string; url: string }[];
  projectPath: string;
  onClose: () => void;
  onSelectImage: (url: string, name: string) => void;
  onUploadComplete: (file: { name: string; url: string }) => void;
}

export default function ReplaceImageModal({
  images,
  projectPath,
  onClose,
  onSelectImage,
  onUploadComplete
}: ReplaceImageModalProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = getSupabaseClient();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setError(null);

      const uid = crypto.randomUUID();
      const ext = file.name.split(".").pop();
      const fileName = `${uid}.${ext}`;
      const filePath = `${projectPath}images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("carousels")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: signed } = await supabase.storage
        .from("carousels")
        .createSignedUrl(filePath, 3600);

      if (!signed) throw new Error("Failed to create signed URL");

      onUploadComplete({ name: fileName, url: signed.signedUrl });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  };



  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-2xl shadow-xl max-w-2xl w-full relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-semibold mb-4">Replace Image</h2>

        <div className="mb-4 flex items-center justify-between">
          <button
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Upload new image"}
          </button>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleUpload}
            className="hidden"
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
        </div>

        <div className="grid grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto">
          {images.map((img) => (
            <div
              key={img.name}
              className="relative group cursor-pointer border rounded-lg overflow-hidden hover:shadow-lg"
            onClick={async () => {
                try {
                    const { data, error } = await supabase.storage
                    .from("carousels")
                    .createSignedUrl(`${projectPath}images/${img.name}`, 3600);
                    if (error) throw error;
                    onSelectImage(data.signedUrl, img.name);
                    onClose();
                } catch (err) {
                    console.error("Failed to replace image:", err);
                }
            }}>
              <img
                src={img.url}
                alt={img.name}
                className="object-cover w-full h-32"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
