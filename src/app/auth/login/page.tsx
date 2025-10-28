"use client";

import AuthModal from "@/components/AuthModal";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginContent() {
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

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}


