'use client';

import { useEffect, useRef, useState } from 'react';
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


export default function Home() {
  const [currentStep, setCurrentStep] = useState<'landing' | 'style' | 'prompt' | 'preview' | 'edit' | 'export'>('landing');
  const [selectedStyle, setSelectedStyle] = useState<CarouselStyle | null>(null);
  const [prompt, setPrompt] = useState('');
  const [generatedCarousel, setGeneratedCarousel] = useState<Carousel | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const pendingActionRef = useRef<null | { type: 'generate'; promptText: string }>(null);
  const { user, supabase } = useAuth();
  const router = useRouter();


  const handleStyleSelect = (style: CarouselStyle) => {
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

    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ prompt: promptText, style_id: "blue-three-slides-style"}),
      });

      if (!response.ok) throw new Error("Generation API failed");

      const { project_id } = await response.json();

      router.push(`/carousel?project_id=${project_id}`);
    } catch (err: any) {
      console.error(err);
      alert("Generation failed: " + err.message);
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
  }, [user]);

  const handleEditCarousel = (updatedCarousel: Carousel) => {
    setGeneratedCarousel(updatedCarousel);
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'landing':
        return <LandingPage onGetStarted={() => setCurrentStep('style')} />;
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
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={() => {
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
