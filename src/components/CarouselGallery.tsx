'use client';

import { useState } from 'react';
import { Plus, Calendar, Eye, Edit, Download, Trash2, MoreVertical, Save, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface DashboardProject {
  id: string;      
  title: string;   
  createdAt: Date; 
  previewUrl?: string; // 🌟 NEW: Optional field for the signed URL
  previewUrls?: string[]; // 🌟 Optional: multiple signed URLs for slide previews
  // Add other necessary fields if they existed in the full type but are needed here, like 'prompt'.
  // We'll assume for simplicity that 'prompt' is NOT available in the lightweight fetch.
}

interface CarouselGalleryProps {
  carousels: DashboardProject[];
  loading: boolean;
  onCarouselSelect: (carousel: DashboardProject) => void;
  onNewCarousel: () => void;
  currentUserId: string;
}

export default function CarouselGallery({ carousels, loading, onCarouselSelect, onNewCarousel, currentUserId }: CarouselGalleryProps) {
  const [selectedCarousel, setSelectedCarousel] = useState<DashboardProject | null>(null);
  const [showActions, setShowActions] = useState<string | null>(null);
  const [currentPreviewIndexById, setCurrentPreviewIndexById] = useState<Record<string, number>>({});

  const getPreviewList = (carousel: DashboardProject): string[] => {
    if (carousel.previewUrls && carousel.previewUrls.length > 0) return carousel.previewUrls;
    if (carousel.previewUrl) return [carousel.previewUrl];
    return [];
  };

  const goPrev = (carouselId: string, total: number) => {
    if (total <= 1) return;
    setCurrentPreviewIndexById((prev) => {
      const current = prev[carouselId] ?? 0;
      const next = (current - 1 + total) % total;
      return { ...prev, [carouselId]: next };
    });
  };

  const goNext = (carouselId: string, total: number) => {
    if (total <= 1) return;
    setCurrentPreviewIndexById((prev) => {
      const current = prev[carouselId] ?? 0;
      const next = (current + 1) % total;
      return { ...prev, [carouselId]: next };
    });
  };

  const handleDownloadZip = async (carousel: DashboardProject) => {
      try {
          // Use the passed-in currentUserId
          const response = await fetch(`/api/slides-download?userId=${currentUserId}&projectId=${carousel.id}`, {
              method: 'GET',
          });

        if (!response.ok) {
            throw new Error('Failed to start ZIP download.');
        }

          // 2. Trigger the file download in the browser
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${carousel.title.replace(/\s+/g, '-')}-${carousel.id.substring(0, 4)}.zip`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(url);

      } catch (error) {
          console.error('Download failed:', error);
          alert('Failed to download carousel slides. Please try again.');
      }
  };

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
        {(() => {
          const previews = getPreviewList(carousel);
          const total = previews.length;
          const index = currentPreviewIndexById[carousel.id] ?? 0;
          const src = total > 0 ? previews[index % total] : undefined;
          return (
            <div 
              className="aspect-[4/5] rounded-t-lg p-4 flex items-center justify-center overflow-hidden relative" 
              style={{ backgroundColor: src ? 'transparent' : '#e5e7eb' }}
            >
              {src ? (
                <img 
                  src={src} 
                  alt={`Preview for ${carousel.title}`}
                  className="object-contain w-full h-full"
                />
              ) : (
                <div className="text-center text-gray-500">
                  <Eye className="w-8 h-8 mx-auto mb-2" />
                  <div className="text-sm">No Preview Available</div>
                </div>
              )}

              {total > 1 && (
                <div className="absolute inset-0 flex items-center justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    aria-label="Previous preview"
                    onClick={(e) => { e.stopPropagation(); goPrev(carousel.id, total); }}
                    className="p-2 bg-white/80 hover:bg-white rounded-full shadow border"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-700" />
                  </button>
                  <button
                    aria-label="Next preview"
                    onClick={(e) => { e.stopPropagation(); goNext(carousel.id, total); }}
                    className="p-2 bg-white/80 hover:bg-white rounded-full shadow border"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-700" />
                  </button>
                </div>
              )}
            </div>
          );
        })()}
                
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
                          setShowActions(null);
                        }}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => {
                          handleDownloadZip(carousel);
                          setShowActions(null);
                        }}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Download className="w-4 h-4" />
                        <span>Export</span>
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
             <div className="px-4 pb-4">
                <h3 className="font-semibold text-gray-900 mb-2">{carousel.title}</h3>
                {/* Prompt removed from dashboard card */}
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDistanceToNow(carousel.createdAt, { addSuffix: true })}</span>
                  </div>
                  {/* ❌ REMOVED: <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">{carousel.style.name}</span> */}
                  <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">Default Style</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-4 pb-4 flex space-x-2">
                <button
                  onClick={() => {
                    handleDownloadZip(carousel);
                  }}
                  className="flex-1 flex items-center justify-center space-x-2 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Export (ZIP)</span>
                </button>
                <button
                  onClick={() => {
                    // This will now use onCarouselSelect(carousel) which redirects to the editor
                    onCarouselSelect(carousel)
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