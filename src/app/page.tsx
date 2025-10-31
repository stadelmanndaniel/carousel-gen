'use client';

import { useEffect, useRef, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import AuthModal from '@/components/AuthModal';
import { useAuth } from '@/hooks/useAuth';
import LandingPage from '@/components/LandingPage';
import StyleSelector from '@/components/StyleSelector';
import PromptEditor from '@/components/PromptEditor';
import CarouselPreview from '@/components/CarouselPreview';
import CanvasEditor from '@/components/CanvasEditor';
import ExportModal from '@/components/ExportModal';
import { CarouselStyle, Carousel } from '@/types';
import { Loader2 } from 'lucide-react';

function HomeContent() {
  const searchParams = useSearchParams();

  

  const [currentStep, setCurrentStep] = useState<'landing' | 'style' | 'prompt' | 'preview' | 'edit' | 'export'>('landing');
  const [selectedStyle, setSelectedStyle] = useState<CarouselStyle | null>(null);
  const [prompt, setPrompt] = useState('');
  const [generatedCarousel, setGeneratedCarousel] = useState<Carousel | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const pendingActionRef = useRef<null | { type: 'generate'; promptText: string }>(null);
  const { user, supabase } = useAuth();
  const router = useRouter();


  console.log('HomeContent render - currentStep:', currentStep, 'user:', user);

  // Check if login is required from URL params
  useEffect(() => {
    if (searchParams.get('login') === 'true') {
      setAuthOpen(true);
    }
  }, [searchParams]);

  const handleStyleSelect = (style: CarouselStyle) => {
    console.log('Style selected:', style);
    setSelectedStyle(style);
    setCurrentStep('prompt');
  };

  const doGenerate = async (promptText: string) => {

    setPrompt(promptText);
    // setCurrentStep('preview'); // or show spinner
    if (!user) {
      // handle unauthenticated state (e.g., open AuthModal)
      return;
    }

    setIsGenerating(true);

    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ prompt: promptText, style_id: "one-slide-test"}),
      });

      if (!response.ok){
        const errorData = await response.json();
        if (errorData.message != null) {
          throw new Error(errorData.message);
        }
        throw new Error("Generation API failed");
      } 

      const { project_id } = await response.json();

      router.push(`/carousel?project_id=${project_id}`);
    } catch (err: any) {
      console.error(err);
      alert("Generation failed: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };


  const handlePromptSubmit = (promptText: string) => {
    if (!user) {
      localStorage.setItem('pendingPrompt', promptText);
      pendingActionRef.current = { type: 'generate', promptText };
      setAuthOpen(true);
      return;
    }
    doGenerate(promptText);
  };

  useEffect(() => {
    if (user && pendingActionRef.current?.type === 'generate') {
      const saved = localStorage.getItem('pendingPrompt');
      if (saved) {
        doGenerate(saved);
        localStorage.removeItem('pendingPrompt');
      } else {
        doGenerate(pendingActionRef.current.promptText);
      }
      pendingActionRef.current = null;
      setAuthOpen(false);
    }
  }, [user, doGenerate]);

  const handleEditCarousel = (updatedCarousel: Carousel) => {
    setGeneratedCarousel(updatedCarousel);
  };

  const renderCurrentStep = () => {
    console.log('Current step:', currentStep);
    switch (currentStep) {
      case 'landing':
        return <LandingPage onGetStarted={() => {
          console.log('Get started clicked, changing to style step');
          setCurrentStep('style');
        }} />;
      case 'style':
        return <StyleSelector onStyleSelect={handleStyleSelect} onBack={() => setCurrentStep('landing')} />;
      case 'prompt':
        return <PromptEditor onSubmit={handlePromptSubmit} onBack={() => setCurrentStep('style')} />;
      case 'preview':
        return (
          <CarouselPreview
            carousel={generatedCarousel!} 
            onEdit={() => setCurrentStep('edit')}
            onExport={() => setCurrentStep('export')}
            onBack={() => setCurrentStep('prompt')}
          />
        );
      case 'edit':
        return (
          <CanvasEditor
            carousel={generatedCarousel!} 
            onSave={handleEditCarousel}
            onBack={() => setCurrentStep('preview')}
          />
        );
      case 'export':
        return (
          <ExportModal 
            carousel={generatedCarousel!} 
            onClose={() => setCurrentStep('preview')}
          />
        );
      default:
        return <LandingPage onGetStarted={() => setCurrentStep('style')} />;
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {renderCurrentStep()}
      {isGenerating && ( // ✅ Show this when generating
        <div className="fixed inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center z-50">
          <Loader2 className="w-10 h-10 animate-spin text-white mb-4" />
          <p className="text-white text-lg font-semibold">Generating your carousel...</p>
          <p className="text-gray-300 text-sm mt-1">This might take up to a minute.</p>
        </div>
      )}
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={() => {
          // Check if user came from dashboard redirect
          if (searchParams.get('login') === 'true') {
            window.location.href = '/dashboard';
            return;
          }
          
          // Immediately resume pending action without waiting for auth state propagation
          if (pendingActionRef.current?.type === 'generate') {
            const saved = localStorage.getItem('pendingPrompt');
            if (saved) {
              doGenerate(saved);
              localStorage.removeItem('pendingPrompt');
            }
            pendingActionRef.current = null;
          }
          setAuthOpen(false);
        }}
      />
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
