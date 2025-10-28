"use client";

import AuthModal from "@/components/AuthModal";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const [open, setOpen] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  useEffect(() => {
    setOpen(true);
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <AuthModal
        isOpen={open}
        onClose={() => router.push(redirectTo)}
        onSuccess={() => {
          setOpen(false);
          router.push(redirectTo);
        }}
      />
    </main>
  );
}


