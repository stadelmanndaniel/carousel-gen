'use client';

import { useEffect, useRef, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AuthModal from '@/components/AuthModal';
import { useAuth } from '@/hooks/useAuth';
import LandingPage from '@/components/LandingPage';
import StyleSelector from '@/components/StyleSelector';
import PromptEditor from '@/components/PromptEditor';
import CarouselPreview from '@/components/CarouselPreview';
import CanvasEditor from '@/components/CanvasEditor';
import ExportModal from '@/components/ExportModal';
import { CarouselStyle, Carousel } from '@/types';

function HomeContent() {
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState<'landing' | 'style' | 'prompt' | 'preview' | 'edit' | 'export'>('landing');
  const [selectedStyle, setSelectedStyle] = useState<CarouselStyle | null>(null);
  const [prompt, setPrompt] = useState('');
  const [generatedCarousel, setGeneratedCarousel] = useState<Carousel | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const pendingActionRef = useRef<null | { type: 'generate'; promptText: string }>(null);
  const { user } = useAuth();

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

  const doMockGenerate = useCallback((promptText: string) => {
    setPrompt(promptText);
    const mockCarousel: Carousel = {
      id: 'mock-carousel',
      title: 'Generated Carousel',
      style: selectedStyle!,
      slides: [
        {
          id: 'slide-1',
          imageUrl: '/api/placeholder/400/400',
          text: 'Welcome to our amazing product!',
          position: 1,
          backgroundColor: selectedStyle!.colors[0],
          textColor: '#ffffff'
        },
        {
          id: 'slide-2',
          imageUrl: '/api/placeholder/400/400',
          text: 'Here are the key features that make us special',
          position: 2,
          backgroundColor: selectedStyle!.colors[1],
          textColor: '#ffffff'
        },
        {
          id: 'slide-3',
          imageUrl: '/api/placeholder/400/400',
          text: 'See how our customers are loving it',
          position: 3,
          backgroundColor: selectedStyle!.colors[2],
          textColor: '#ffffff'
        },
        {
          id: 'slide-4',
          imageUrl: '/api/placeholder/400/400',
          text: 'Ready to get started? Click the link below!',
          position: 4,
          backgroundColor: selectedStyle!.colors[3],
          textColor: '#ffffff'
        }
      ],
      prompt: promptText,
      createdAt: new Date()
    };
    setGeneratedCarousel(mockCarousel);
    setCurrentStep('preview');
  }, [selectedStyle]);

  const handlePromptSubmit = (promptText: string) => {
    if (!user) {
      localStorage.setItem('pendingPrompt', promptText);
      pendingActionRef.current = { type: 'generate', promptText };
      setAuthOpen(true);
      return;
    }
    doMockGenerate(promptText);
  };

  useEffect(() => {
    if (user && pendingActionRef.current?.type === 'generate') {
      const saved = localStorage.getItem('pendingPrompt');
      if (saved) {
        doMockGenerate(saved);
        localStorage.removeItem('pendingPrompt');
      } else {
        doMockGenerate(pendingActionRef.current.promptText);
      }
      pendingActionRef.current = null;
      setAuthOpen(false);
    }
  }, [user, doMockGenerate]);

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
              doMockGenerate(saved);
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
