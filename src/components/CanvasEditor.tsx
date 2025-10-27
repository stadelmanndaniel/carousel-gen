'use client';

import { useState } from 'react';
import { ArrowLeft, Save, Undo, Redo, Type, Palette, Image, Download } from 'lucide-react';
import { Carousel, CarouselSlide } from '@/types';

interface CanvasEditorProps {
  carousel: Carousel;
  onSave: (carousel: Carousel) => void;
  onBack: () => void;
}

export default function CanvasEditor({ carousel, onSave, onBack }: CanvasEditorProps) {
  const [selectedSlide, setSelectedSlide] = useState(0);
  const [editedCarousel, setEditedCarousel] = useState<Carousel>(carousel);
  const [history, setHistory] = useState<Carousel[]>([carousel]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const updateSlide = (slideIndex: number, updates: Partial<CarouselSlide>) => {
    const newCarousel = {
      ...editedCarousel,
      slides: editedCarousel.slides.map((slide, index) =>
        index === slideIndex ? { ...slide, ...updates } : slide
      )
    };
    
    setEditedCarousel(newCarousel);
    
    // Add to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newCarousel);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setEditedCarousel(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setEditedCarousel(history[historyIndex + 1]);
    }
  };

  const handleSave = () => {
    onSave(editedCarousel);
  };

  const currentSlide = editedCarousel.slides[selectedSlide];

  const colorOptions = [
    '#ffffff', '#000000', '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
    '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
  ];

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
          <h1 className="text-2xl font-bold text-gray-900">Canvas Editor</h1>
          <div className="flex space-x-4">
            <button
              onClick={undo}
              disabled={historyIndex === 0}
              className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Undo className="w-5 h-5" />
            </button>
            <button
              onClick={redo}
              disabled={historyIndex === history.length - 1}
              className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Redo className="w-5 h-5" />
            </button>
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Sidebar - Slides */}
        <div className="w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Slides</h3>
          <div className="space-y-3">
            {editedCarousel.slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  index === selectedSlide
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                }`}
                onClick={() => setSelectedSlide(index)}
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-sm"
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
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 flex">
          {/* Canvas */}
          <div className="flex-1 p-8">
            <div className="bg-white rounded-xl shadow-lg p-8 h-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Canvas</h3>
              
              {/* Canvas Preview */}
              <div className="flex justify-center mb-8">
                <div className="aspect-[3/4] w-80 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden relative">
                  <div 
                    className="w-full h-full flex items-center justify-center text-center p-8"
                    style={{ backgroundColor: currentSlide.backgroundColor }}
                  >
                    <div>
                      <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-blue-400 rounded-lg mx-auto mb-4 flex items-center justify-center">
                        <span className="text-white font-bold text-xl">
                          {selectedSlide + 1}
                        </span>
                      </div>
                      <p 
                        className="text-lg font-medium"
                        style={{ color: currentSlide.textColor }}
                      >
                        {currentSlide.text}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex justify-center space-x-4">
                <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  <Image className="w-4 h-4" />
                  <span>Change Image</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  <Download className="w-4 h-4" />
                  <span>Export Slide</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Properties */}
          <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Properties</h3>
            
            {/* Text Editing */}
            <div className="mb-8">
              <div className="flex items-center space-x-2 mb-4">
                <Type className="w-5 h-5 text-gray-600" />
                <h4 className="font-medium text-gray-900">Text Content</h4>
              </div>
              <textarea
                value={currentSlide.text}
                onChange={(e) => updateSlide(selectedSlide, { text: e.target.value })}
                className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                placeholder="Enter slide text..."
              />
            </div>

            {/* Background Color */}
            <div className="mb-8">
              <div className="flex items-center space-x-2 mb-4">
                <Palette className="w-5 h-5 text-gray-600" />
                <h4 className="font-medium text-gray-900">Background Color</h4>
              </div>
              <div className="grid grid-cols-6 gap-2 mb-4">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    onClick={() => updateSlide(selectedSlide, { backgroundColor: color })}
                    className={`w-8 h-8 rounded-lg border-2 ${
                      currentSlide.backgroundColor === color ? 'border-gray-900' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <input
                type="color"
                value={currentSlide.backgroundColor || '#ffffff'}
                onChange={(e) => updateSlide(selectedSlide, { backgroundColor: e.target.value })}
                className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
            </div>

            {/* Text Color */}
            <div className="mb-8">
              <h4 className="font-medium text-gray-900 mb-4">Text Color</h4>
              <div className="grid grid-cols-6 gap-2 mb-4">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    onClick={() => updateSlide(selectedSlide, { textColor: color })}
                    className={`w-8 h-8 rounded-lg border-2 ${
                      currentSlide.textColor === color ? 'border-gray-900' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <input
                type="color"
                value={currentSlide.textColor || '#000000'}
                onChange={(e) => updateSlide(selectedSlide, { textColor: e.target.value })}
                className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
            </div>

            {/* Slide Actions */}
            <div className="space-y-3">
              <button className="w-full bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors">
                Duplicate Slide
              </button>
              <button className="w-full bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 transition-colors">
                Delete Slide
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
