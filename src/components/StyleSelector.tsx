'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { CarouselStyle } from '@/types';
import { carouselStyles } from '@/data/mockData';
import { useAuth } from '@/hooks/useAuth';

interface StyleSelectorProps {
  onStyleSelect: (style: CarouselStyle) => void;
  onBack: () => void;
}

export default function StyleSelector({ onStyleSelect, onBack }: StyleSelectorProps) {
  const { supabase } = useAuth();
  const [carouselGenPreview, setCarouselGenPreview] = useState<string | null>(null);

  useEffect(() => {
    const fetchCarouselGenPreview = async () => {
      try {
        // Provided Supabase path: userId/projectId
        const basePath = 'fef9961e-45b2-44f5-b769-d34f6405ca16/0d43d853-b45c-4067-b6c7-d3b78a28d948/';

        // 1) Try preview.png
        const { data: previewSigned } = await (supabase as any)
          .storage
          .from('carousels')
          .createSignedUrl(`${basePath}preview.png`, 3600);

        if (previewSigned?.signedUrl) {
          setCarouselGenPreview(previewSigned.signedUrl);
          return;
        }

        // 2) Try first image in slides/
        const { data: slidesList, error: slidesErr } = await (supabase as any)
          .storage
          .from('carousels')
          .list(`${basePath}slides/`, { limit: 100 });

        if (!slidesErr) {
          const firstImage = (slidesList ?? []).find((f: { name: string }) => /\.(png|jpg|jpeg)$/i.test(f.name));
          if (firstImage) {
            const { data: slidesSigned } = await (supabase as any)
              .storage
              .from('carousels')
              .createSignedUrl(`${basePath}slides/${firstImage.name}`, 3600);
            if (slidesSigned?.signedUrl) {
              setCarouselGenPreview(slidesSigned.signedUrl);
              return;
            }
          }
        }

        // 3) Try first image in images/
        const { data: imagesList, error: imagesErr } = await (supabase as any)
          .storage
          .from('carousels')
          .list(`${basePath}images/`, { limit: 100 });
        if (!imagesErr) {
          const firstImage = (imagesList ?? []).find((f: { name: string }) => /\.(png|jpg|jpeg)$/i.test(f.name));
          if (firstImage) {
            const { data: imagesSigned } = await (supabase as any)
              .storage
              .from('carousels')
              .createSignedUrl(`${basePath}images/${firstImage.name}`, 3600);
            if (imagesSigned?.signedUrl) {
              setCarouselGenPreview(imagesSigned.signedUrl);
              return;
            }
          }
        }
      } catch (error) {
        console.error('Error fetching carousel preview:', error);
      }
    };

    fetchCarouselGenPreview();
  }, [supabase]);

  // Create CarouselGen Style (always first)
  const carouselGenStyle: CarouselStyle = {
    id: 'carouselgen-style',
    name: 'CarouselGen Style',
    description: 'Our signature style with professional design and modern aesthetics',
    preview: carouselGenPreview || '/images/default-preview.png',
    category: 'business',
    colors: []
  };

  // Combine CarouselGen style with existing styles
  const allStyles = [carouselGenStyle, ...carouselStyles];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Content */}
      <main className="px-6 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <div className="mb-8">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </button>
          </div>

          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Choose Your Carousel Style
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose from our curated collection of professional templates designed for different content types and audiences.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {allStyles.map((style) => {
              const isCarouselGenStyle = style.id === 'carouselgen-style';
              const isExistingStyle = !isCarouselGenStyle;
              const usePlaceholder = ['meme-style', 'educational', 'business', 'lifestyle'].includes(style.id);
              const placeholderBg: Record<string, string> = {
                'meme-style': '#F59E0B',
                'educational': '#667EEA',
                'business': '#2C3E50',
                'lifestyle': '#FF9A9E',
              };
              
              return (
                <div
                  key={style.id}
                  onClick={() => !isExistingStyle && onStyleSelect(style)}
                  className={`bg-white rounded-xl shadow-lg transition-all duration-200 border-2 ${
                    isExistingStyle 
                      ? 'cursor-not-allowed opacity-75' 
                      : 'cursor-pointer hover:shadow-xl transform hover:scale-105 border-transparent hover:border-purple-200'
                  }`}
                >
                  {/* Preview Image */}
                  <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-xl overflow-hidden">
                    {usePlaceholder ? (
                      <div 
                        className="w-full h-full flex items-center justify-center"
                        style={{ backgroundColor: placeholderBg[style.id] || '#e5e7eb' }}
                      >
                        <span className="text-white text-lg font-semibold">Coming Soon</span>
                      </div>
                    ) : (
                      <img 
                        src={style.preview} 
                        alt={`${style.name} preview`}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  {/* Style Info */}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {style.name}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {style.description}
                    </p>
                  </div>

                  {/* Select Button */}
                  <div className="px-6 pb-6">
                    {isExistingStyle ? (
                      <button 
                        disabled
                        className="w-full bg-gray-300 text-gray-500 py-3 rounded-lg font-semibold cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        <span>Coming Soon</span>
                      </button>
                    ) : (
                      <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2">
                        <span>Select Style</span>
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Help Text */}
          <div className="mt-12 text-center">
            <p className="text-gray-500">
              Don&apos;t worry, you can always customize colors, fonts, and layouts later in the editor.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
