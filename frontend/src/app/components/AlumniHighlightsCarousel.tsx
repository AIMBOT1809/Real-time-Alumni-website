import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { AlumniHighlight } from '../pages/AlumniHighlights';

type AlumniHighlightsCarouselProps = {
  userId?: string;
};

export function AlumniHighlightsCarousel({ userId }: AlumniHighlightsCarouselProps) {
  const [highlights, setHighlights] = useState<AlumniHighlight[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublishedHighlights();
  }, []);

  const fetchPublishedHighlights = async () => {
    try {
      const { data, error } = await supabase
        .from('alumni_highlights')
        .select('*')
        .eq('published', true)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching highlights:', error);
        return;
      }

      setHighlights(data || []);
    } catch (err) {
      console.error('Error fetching highlights:', err);
    } finally {
      setLoading(false);
    }
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? highlights.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === highlights.length - 1 ? 0 : prev + 1));
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (loading) {
    return (
      <div className="w-full h-96 bg-slate-900 rounded-3xl flex items-center justify-center">
        <div className="text-white text-lg">Loading highlights...</div>
      </div>
    );
  }

  if (highlights.length === 0) {
    return null;
  }

  const currentHighlight = highlights[currentIndex];

  return (
    <div className="w-full bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl overflow-hidden shadow-2xl">
      {/* Carousel Content */}
      <div className="relative h-[500px]">
        {/* Image Display */}
        {currentHighlight.images.length > 0 && (
          <div className="absolute inset-0">
            <img
              src={currentHighlight.images[0]}
              alt={currentHighlight.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          </div>
        )}

        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
          <div className="max-w-3xl">
            <span className="inline-flex items-center rounded-full bg-yellow-500 px-4 py-2 text-xs font-bold text-slate-900 mb-4">
              {currentHighlight.category}
            </span>
            <h2 className="text-4xl font-bold mb-3">{currentHighlight.title}</h2>
            <p className="text-lg text-white/90 mb-4">{currentHighlight.description}</p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-white/70">
              <span className="inline-flex items-center gap-2">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {new Date(currentHighlight.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
              {currentHighlight.location && (
                <span className="inline-flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {currentHighlight.location}
                </span>
              )}
              {currentHighlight.images.length > 1 && (
                <span className="inline-flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {currentHighlight.images.length} photos
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        {highlights.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all"
              aria-label="Previous slide"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all"
              aria-label="Next slide"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Dots Indicator */}
      {highlights.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {highlights.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'w-8 bg-yellow-500'
                  : 'w-2 bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Thumbnail Strip */}
      {highlights.length > 1 && (
        <div className="bg-black/30 p-4">
          <div className="flex gap-3 overflow-x-auto">
            {highlights.map((highlight, index) => (
              <button
                key={highlight.id}
                onClick={() => goToSlide(index)}
                className={`flex-shrink-0 relative rounded-lg overflow-hidden transition-all ${
                  index === currentIndex
                    ? 'ring-4 ring-yellow-500 scale-105'
                    : 'opacity-60 hover:opacity-100'
                }`}
              >
                {highlight.images.length > 0 ? (
                  <img
                    src={highlight.images[0]}
                    alt={highlight.title}
                    className="h-16 w-24 object-cover"
                  />
                ) : (
                  <div className="h-16 w-24 bg-slate-700 flex items-center justify-center">
                    <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}