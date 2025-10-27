'use client';

import { useState } from 'react';
import { ArrowLeft, Edit3, Download, RefreshCw, Eye } from 'lucide-react';
import { Carousel } from '@/types';

interface CarouselPreviewProps {
  carousel: Carousel;
  onEdit: () => void;
  onExport: () => void;
  onBack: () => void;
}

export default function CarouselPreview({ carousel, onEdit, onExport, onBack }: CarouselPreviewProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carousel.slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carousel.slides.length) % carousel.slides.length);
  };

  const regenerateSlide = (slideIndex: number) => {
    // Mock regeneration - in real app this would call AI API
    console.log(`Regenerating slide ${slideIndex}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Carousel Preview</h1>
          <div className="flex space-x-4">
            <button
              onClick={onEdit}
              className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit</span>
            </button>
            <button
              onClick={onExport}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Carousel Info */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">{carousel.title}</h2>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
                {carousel.style.name}
              </span>
            </div>
            <p className="text-gray-600 mb-4">{carousel.prompt}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>{carousel.slides.length} slides</span>
              <span>•</span>
              <span>Generated {carousel.createdAt.toLocaleDateString()}</span>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Carousel Display */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Carousel Preview</h3>
                  <div className="flex items-center space-x-2">
                    <Eye className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-500">
                      Slide {currentSlide + 1} of {carousel.slides.length}
                    </span>
                  </div>
                </div>

                {/* Main Carousel Display */}
                <div className="relative">
                  <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden relative">
                    {/* Watermark */}
                    <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm font-medium z-10">
                      PREVIEW
                    </div>
                    
                    {/* Slide Content */}
                    <div 
                      className="w-full h-full flex items-center justify-center text-center p-8"
                      style={{ backgroundColor: carousel.slides[currentSlide].backgroundColor }}
                    >
                      <div>
                        <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-blue-400 rounded-lg mx-auto mb-6 flex items-center justify-center">
                          <span className="text-white font-bold text-2xl">
                            {currentSlide + 1}
                          </span>
                        </div>
                        <p 
                          className="text-lg font-medium"
                          style={{ color: carousel.slides[currentSlide].textColor }}
                        >
                          {carousel.slides[currentSlide].text}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center justify-between mt-6">
                    <button
                      onClick={prevSlide}
                      className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Previous</span>
                    </button>
                    
                    <div className="flex space-x-2">
                      {carousel.slides.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentSlide(index)}
                          className={`w-3 h-3 rounded-full transition-colors ${
                            index === currentSlide ? 'bg-purple-600' : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>

                    <button
                      onClick={nextSlide}
                      className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <span>Next</span>
                      <ArrowLeft className="w-4 h-4 rotate-180" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Slide List */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">All Slides</h3>
                <div className="space-y-4">
                  {carousel.slides.map((slide, index) => (
                    <div
                      key={slide.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        index === currentSlide
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                      }`}
                      onClick={() => setCurrentSlide(index)}
                    >
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: slide.backgroundColor }}
                        >
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {slide.text}
                          </p>
                          <p className="text-xs text-gray-500">
                            Slide {index + 1}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            regenerateSlide(index);
                          }}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                          title="Regenerate this slide"
                        >
                          <RefreshCw className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 space-y-3">
                <button
                  onClick={onEdit}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <Edit3 className="w-5 h-5" />
                  <span>Edit Carousel</span>
                </button>
                <button
                  onClick={onExport}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <Download className="w-5 h-5" />
                  <span>Export Images</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
