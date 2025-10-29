"use client";

import { useAuth } from "@/hooks/useAuth";

export default function SettingsPage() {
  const { user, loading } = useAuth();

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
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-10">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-6">
          <div className="text-center">
            <h1 className="text-2xl font-semibold mb-4">Settings</h1>
            <p className="text-gray-600 mb-4">Please log in to access settings.</p>
            <a 
              href="/auth/login" 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Login
            </a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-semibold mb-4">Settings</h1>
        <p className="text-gray-600 mb-4">Settings page is temporarily disabled during deployment.</p>
        <p className="text-sm text-gray-500">User: {user.email}</p>
      </div>
    </main>
  );
}
