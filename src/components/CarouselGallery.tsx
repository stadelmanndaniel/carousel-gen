'use client';

import { useState } from 'react';
import { Carousel } from '@/types';
import { Plus, Calendar, Eye, Edit, Download, Trash2, MoreVertical } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CarouselGalleryProps {
  carousels: Carousel[];
  loading: boolean;
  onCarouselSelect: (carousel: Carousel) => void;
  onNewCarousel: () => void;
}

export default function CarouselGallery({ carousels, loading, onCarouselSelect, onNewCarousel }: CarouselGalleryProps) {
  const [selectedCarousel, setSelectedCarousel] = useState<Carousel | null>(null);
  const [showActions, setShowActions] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">My Carousels</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-32 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Carousels</h1>
          <p className="text-gray-600 mt-1">
            {carousels.length} carousel{carousels.length !== 1 ? 's' : ''} created
          </p>
        </div>
        <button
          onClick={onNewCarousel}
          className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          <Plus className="w-5 h-5" />
          <span>Create New</span>
        </button>
      </div>

      {/* Carousel Grid */}
      {carousels.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No carousels yet</h3>
          <p className="text-gray-600 mb-6">Create your first carousel to get started</p>
          <button
            onClick={onNewCarousel}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            Create Your First Carousel
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {carousels.map((carousel) => (
            <div
              key={carousel.id}
              className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow duration-200 group"
            >
              {/* Carousel Preview */}
              <div className="relative">
                <div 
                  className="h-48 rounded-t-lg bg-gradient-to-br p-4 flex items-center justify-center"
                  style={{ 
                    background: `linear-gradient(135deg, ${carousel.style.colors[0]}, ${carousel.style.colors[1]})` 
                  }}
                >
                  <div className="text-center text-white">
                    <div className="text-2xl font-bold mb-2">{carousel.title}</div>
                    <div className="text-sm opacity-90">{carousel.slides.length} slides</div>
                  </div>
                </div>
                
                {/* Actions Menu */}
                <div className="absolute top-2 right-2">
                  <button
                    onClick={() => setShowActions(showActions === carousel.id ? null : carousel.id)}
                    className="p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-600" />
                  </button>
                  
                  {showActions === carousel.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                      <button
                        onClick={() => {
                          onCarouselSelect(carousel);
                          setShowActions(null);
                        }}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </button>
                      <button
                        onClick={() => {
                          // TODO: Implement edit functionality
                          setShowActions(null);
                        }}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => {
                          // TODO: Implement download functionality
                          setShowActions(null);
                        }}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </button>
                      <button
                        onClick={() => {
                          // TODO: Implement delete functionality
                          setShowActions(null);
                        }}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Carousel Info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">{carousel.title}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{carousel.prompt}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDistanceToNow(carousel.createdAt, { addSuffix: true })}</span>
                  </div>
                  <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                    {carousel.style.name}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-4 pb-4 flex space-x-2">
                <button
                  onClick={() => onCarouselSelect(carousel)}
                  className="flex-1 flex items-center justify-center space-x-2 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>View</span>
                </button>
                <button
                  onClick={() => {
                    // TODO: Implement edit functionality
                  }}
                  className="flex-1 flex items-center justify-center space-x-2 py-2 px-4 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
