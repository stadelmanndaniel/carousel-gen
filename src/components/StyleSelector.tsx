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

  const bucket_common_images = "common_images";

  function getPublicImageUrl(bucketName: string, filePath: string): string | null {
    const { data } = supabase
      .storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  // Create CarouselGen Style (always first)
  const carouselGenStyle: CarouselStyle = {
    id: 'template_1',
    name: 'Catchy style',
    description: 'Our signature style with professional design and modern aesthetics',
    category: 'business',
    colors: ['#ea9b2f', '#F77737', '#E4405F', '#a53b3b'],
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
              const isCarouselGenStyle = style.id === 'template_1';
              const isExistingStyle = !isCarouselGenStyle;
              const usePlaceholder = ['kalshi-style', 'meme-style', 'educational', 'business', 'lifestyle'].includes(style.id);
              const placeholderBg: Record<string, string> = {
                'kalshi-style': '#1A365D',
                'meme-style': '#ec2424ff',
                'educational': '#667EEA',
                'business': '#2C3E50',
                'lifestyle': '#FF9A9E',
              };

              const url_preview = style.preview || getPublicImageUrl(bucket_common_images, `${style.id}.png`)|| 'cute.png';
              
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
                        src={url_preview} 
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
