'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import DashboardHeader from '@/components/DashboardHeader';
import CarouselGallery from '@/components/CarouselGallery';
import UserProfile from '@/components/UserProfile';
import UsageStats from '@/components/UsageStats';
import { getUserCarousels, fetchDashboardProjects, DashboardProject } from '@/lib/database/carousels';
import { Loader2 } from 'lucide-react';

type DashboardTab = 'carousels' | 'stats';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<DashboardTab>('carousels');
  const [userCarousels, setUserCarousels] = useState<DashboardProject[]>([]);
  const [carouselsLoading, setCarouselsLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // Debug logging
  console.log('Dashboard render - loading:', loading, 'user:', user, 'demoMode:', demoMode);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      console.log('No user found, redirecting to login');
      router.push('/?login=true');
    }
  }, [user, loading, router]);


  // Add timeout to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        console.log('Loading timeout reached, checking auth state');
        // Force a re-check of auth state
      }
    }, 5000); // 5 second timeout

    return () => clearTimeout(timer);
  }, [loading]);

  useEffect(() => {
    if (user) {
      const loadCarousels = async () => {
        try {
          setCarouselsLoading(true);
          // 🎯 Call the lightweight fetch function
          const projects = await fetchDashboardProjects(user.id); 
          setUserCarousels(projects);
        } catch (error) {
          console.error('Error loading carousels:', error);
          setUserCarousels([]);
        } finally {
          setCarouselsLoading(false);
        }
      };

      loadCarousels();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">Loading dashboard...</p>
          <p className="text-sm text-gray-500 mt-2">If this takes too long, please check your Supabase configuration</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder')) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Supabase Not Configured</h2>
            <p className="text-gray-600 mb-4">
              To use the dashboard, you need to configure Supabase environment variables.
            </p>
            <div className="bg-gray-100 p-4 rounded-lg text-left text-sm">
              <p className="font-medium mb-2">Create a <code>.env.local</code> file with:</p>
              <pre className="text-xs">
{`NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key`}
              </pre>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => router.push('/')}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                Go to Home
              </button>
              <button
                onClick={() => {
                  // Demo mode - show dashboard with mock data
                  setDemoMode(true);
                  setUserCarousels([
                    {
                      id: 'demo-1',
                      title: 'Demo Carousel (Mock)',
                      createdAt: new Date(),
                      // NOTE: Removed style, slides, and prompt fields to match DashboardProject
                    }
                  ]);
                  setCarouselsLoading(false);
                }}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
              >
                Try Demo Mode
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    return null; // Will redirect to login
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'carousels':
        return (
          <CarouselGallery 
            carousels={userCarousels} 
            loading={carouselsLoading}
            // 🎯 Use the project ID to navigate to the editor
            onCarouselSelect={(carousel) => {
              router.push(`/carousel?project_id=${carousel.id}`);
            }}
            onNewCarousel={() => router.push('/')}
          />
        );
      case 'stats':
        // NOTE: If UsageStats uses the full Carousel type, this needs to be refactored 
        // to pass only the data it needs (like count, creation dates).
        // return <UsageStats user={user} carousels={userCarousels} />;
        return (
          <div className="p-6 bg-white rounded-lg shadow">
            <h2 className="text-xl font-bold">Usage Stats</h2>
            <p className="text-gray-600 mt-2">Stats data is currently unavailable due to data structure changes. Total Carousels: {userCarousels.length}</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {demoMode && (
        <div className="bg-yellow-100 border-b border-yellow-200 px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-4 h-4 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-yellow-800">Demo Mode - Supabase not configured</span>
            </div>
            <button
              onClick={() => {
                setDemoMode(false);
                setUserCarousels([]);
                setCarouselsLoading(true);
              }}
              className="text-sm text-yellow-700 hover:text-yellow-900 underline"
            >
              Exit Demo
            </button>
          </div>
        </div>
      )}
      <DashboardHeader 
        user={demoMode ? { email: 'demo@example.com', id: 'demo-user' } : user}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onNewCarousel={() => router.push('/')}
        onProfileClick={() => setShowProfile(true)}
      />
      <main className="max-w-7xl mx-auto px-6 py-8">
        {renderActiveTab()}
      </main>

      {/* Profile Modal */}
      {showProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Profile & Settings</h2>
                <button
                  onClick={() => setShowProfile(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <UserProfile user={demoMode ? { email: 'demo@example.com', id: 'demo-user' } : user} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
