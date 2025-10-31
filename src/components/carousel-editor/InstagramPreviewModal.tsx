"use client";

import React, { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight, MoreHorizontal, Heart, MessageCircle, Send, Bookmark, Instagram, Wifi, BatteryFull } from "lucide-react";

interface InstagramPreviewModalProps {
  slides: string[];
  onClose: () => void;
}

export default function InstagramPreviewModal({ slides, onClose }: InstagramPreviewModalProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    console.log('InstagramPreviewModal - slides received:', slides?.length || 0, slides);
    if (index >= slides.length) setIndex(0);
  }, [slides, index]);

  const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);
  const next = () => setIndex((i) => (i + 1) % slides.length);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setIndex((i) => (i - 1 + slides.length) % slides.length);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setIndex((i) => (i + 1) % slides.length);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slides.length, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="relative w-full max-w-[420px]" onClick={(e) => e.stopPropagation()}>
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white hover:text-gray-200"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Device frame (iPhone-like) */}
        <div className="relative rounded-[42px] bg-black shadow-2xl p-3">
          {/* Screen */}
          <div
            className="bg-white rounded-[36px] overflow-hidden"
            style={{ aspectRatio: '9 / 19.5' }}
          >
            {/* Status bar */}
            <div className="flex items-center justify-between px-4 pt-2 pb-1 text-[11px] text-gray-800">
              <span className="font-semibold tracking-wide">9:41</span>
              <div className="flex items-center gap-2 text-gray-800">
                <Wifi className="w-4 h-4" />
                <BatteryFull className="w-4 h-4" />
              </div>
            </div>
            {/* IG header */}
            <div className="relative flex items-center justify-center px-4 py-3 border-b">
              <div className="flex items-center gap-2">
                <Instagram className="w-5 h-5" />
                <span className="font-semibold">Instagram</span>
              </div>
              <MoreHorizontal className="w-5 h-5 text-gray-500 absolute right-4" />
            </div>

            {/* Post header */}
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-yellow-400 p-[2px]">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                  <div className="w-7 h-7 rounded-full bg-gray-200" />
                </div>
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold">your_profile</div>
                <div className="text-xs text-gray-500">Sponsored</div>
              </div>
              <MoreHorizontal className="w-5 h-5 text-gray-500" />
            </div>

            {/* Carousel media */}
            <div className="relative bg-black w-full">
              <img
                src={slides[index] || slides[0]}
                alt={`Slide ${index + 1} of ${slides.length}`}
                className="w-full aspect-[4/5] object-contain"
                draggable={false}
              />

              {/* left/right controls - Only show if multiple slides */}
              {slides && slides.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      prev();
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 p-3 rounded-full shadow-xl z-20 transition-all hover:scale-110 border-2 border-gray-200"
                    aria-label="Previous slide"
                    style={{ pointerEvents: 'auto' }}
                  >
                    <ChevronLeft className="w-6 h-6 stroke-2" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      next();
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 p-3 rounded-full shadow-xl z-20 transition-all hover:scale-110 border-2 border-gray-200"
                    aria-label="Next slide"
                    style={{ pointerEvents: 'auto' }}
                  >
                    <ChevronRight className="w-6 h-6 stroke-2" />
                  </button>
                </>
              )}

              {/* dots */}
              {slides && slides.length > 1 && (
                <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-2 z-20 px-4">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setIndex(i);
                      }}
                      className={`transition-all rounded-full border-2 ${
                        i === index 
                          ? "w-3 h-3 bg-white border-white shadow-lg scale-125" 
                          : "w-2.5 h-2.5 bg-white/60 border-white/40 hover:bg-white/80 hover:border-white/60"
                      }`}
                      aria-label={`Go to slide ${i + 1}`}
                      style={{ pointerEvents: 'auto' }}
                    />
                  ))}
                </div>
              )}

              {/* Slide counter */}
              {slides && slides.length > 1 && (
                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm text-gray-900 text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-lg z-20 border border-gray-200">
                  {index + 1} / {slides.length}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between px-4 py-2">
              <div className="flex items-center gap-4">
                <Heart className="w-6 h-6" />
                <MessageCircle className="w-6 h-6" />
                <Send className="w-6 h-6" />
              </div>
              <Bookmark className="w-6 h-6" />
            </div>

            {/* Likes and caption */}
            <div className="px-4 pb-4">
              <div className="text-sm font-semibold">1,204 likes</div>
              <div className="mt-1 text-sm">
                <span className="font-semibold mr-2">your_profile</span>
                <span className="text-gray-700">Preview of your carousel in an Instagram post.</span>
              </div>
              <div className="mt-2 text-xs text-gray-400">View all 42 comments</div>
              <div className="mt-2 text-[10px] text-gray-400 uppercase tracking-wide">Just now • Preview</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


