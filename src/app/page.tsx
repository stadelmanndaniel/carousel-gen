'use client';

import { useState } from 'react';
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

  const handleStyleSelect = (style: CarouselStyle) => {
    setSelectedStyle(style);
    setCurrentStep('prompt');
  };

  const handlePromptSubmit = (promptText: string) => {
    setPrompt(promptText);
    // Mock carousel generation
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
  };

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
    </main>
  );
}
