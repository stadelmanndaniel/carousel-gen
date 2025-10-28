"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const { supabase } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      if (mode === "signin") {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        console.log('Sign in result:', { data, error: signInError });
        if (signInError) throw signInError;
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined }
        });
        console.log('Sign up result:', { data, error: signUpError });
        if (signUpError) throw signUpError;
        
        // Check if user needs email confirmation
        if (data.user && !data.session) {
          setSuccess("Account created! Please check your email to confirm your account.");
          setTimeout(() => {
            onClose();
          }, 2000);
          return;
        }
      }
      setSuccess(mode === "signin" ? "Signed in successfully" : "Account created and signed in");
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 900);
    } catch (e: any) {
      console.error('Auth error:', e);
      setError(e.message ?? "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">{mode === "signin" ? "Sign In" : "Create Account"}</h3>
          <button aria-label="Close" onClick={onClose} className="p-2 rounded hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex gap-2 mb-4">
          <button
            className={`flex-1 py-2 rounded border ${mode === "signin" ? "bg-gray-900 text-white" : "bg-white"}`}
            onClick={() => setMode("signin")}
          >
            Sign In
          </button>
          <button
            className={`flex-1 py-2 rounded border ${mode === "signup" ? "bg-gray-900 text-white" : "bg-white"}`}
            onClick={() => setMode("signup")}
          >
            Sign Up
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full border rounded px-3 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Password</label>
            <input
              type="password"
              className="w-full border rounded px-3 py-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
            />
          </div>
        </div>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        {success && <p className="mt-3 text-sm text-green-600">{success}</p>}
        <button
          onClick={handleSubmit}
          disabled={loading || !email || password.length < 8}
          className="w-full mt-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 rounded-lg font-semibold disabled:opacity-50"
        >
          {loading ? "Please wait…" : mode === "signin" ? "Sign In" : "Sign Up"}
        </button>
      </div>
    </div>
  );
}


