'use client';

import { ArrowLeft, Check } from 'lucide-react';
import { CarouselStyle } from '@/types';
import { carouselStyles } from '@/data/mockData';

interface StyleSelectorProps {
  onStyleSelect: (style: CarouselStyle) => void;
  onBack: () => void;
}

export default function StyleSelector({ onStyleSelect, onBack }: StyleSelectorProps) {
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
            {carouselStyles.map((style) => (
              <div
                key={style.id}
                onClick={() => onStyleSelect(style)}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer transform hover:scale-105 border-2 border-transparent hover:border-purple-200"
              >
                {/* Preview Image */}
                <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-xl overflow-hidden">
                  <img 
                    src={style.preview} 
                    alt={`${style.name} preview`}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Style Info */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {style.name}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {style.description}
                  </p>
                  
                  {/* Color Palette */}
                  <div className="flex space-x-2">
                    {style.colors.map((color, index) => (
                      <div
                        key={index}
                        className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                {/* Select Button */}
                <div className="px-6 pb-6">
                  <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2">
                    <span>Select Style</span>
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Help Text */}
          <div className="mt-12 text-center">
            <p className="text-gray-500">
              Don't worry, you can always customize colors, fonts, and layouts later in the editor.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
