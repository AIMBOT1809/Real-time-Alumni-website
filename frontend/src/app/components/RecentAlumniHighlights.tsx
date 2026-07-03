import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { AlumniHighlight } from '../pages/AlumniHighlights';

type RecentAlumniHighlightsProps = {
  userId?: string;
};

export function RecentAlumniHighlights({ userId }: RecentAlumniHighlightsProps) {
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
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching highlights:', error);
        setLoading(false);
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
    setCurrentIndex((prev) => (prev === 0 ? Math.max(0, highlights.length - 3) : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev >= highlights.length - 3 ? 0 : prev + 1));
  };

  if (loading) {
    return (
      <div className="glass-card shiny-border rounded-3xl p-8 bg-white dark:bg-slate-900">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <svg className="h-6 w-6 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Recent Alumni Highlights</h2>
          </div>
        </div>
        <div className="text-center py-12 text-slate-600 dark:text-slate-400">
          Loading highlights...
        </div>
      </div>
    );
  }

  if (highlights.length === 0) {
    return null;
  }

  const visibleHighlights = highlights.slice(currentIndex, currentIndex + 3);
  const hasMultiple = highlights.length > 3;

  return (
    <div className="glass-card shiny-border rounded-3xl p-6 md:p-8 bg-white dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <svg className="h-6 w-6 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Recent Alumni Highlights</h2>
        </div>
        <button className="inline-flex items-center gap-2 text-yellow-500 hover:text-yellow-400 transition-colors text-sm font-semibold">
          View all
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </button>
      </div>

      {/* Carousel Container */}
      <div className="relative">
        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {visibleHighlights.map((highlight) => (
            <div
              key={highlight.id}
              className="glass-card shiny-border rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:border-yellow-400 dark:hover:border-yellow-500 transition-all duration-300 group bg-white dark:bg-slate-800"
            >
              {/* Image */}
              <div className="aspect-video bg-slate-700 relative overflow-hidden">
                {highlight.images && highlight.images.length > 0 ? (
                  <img
                    src={highlight.images[0]}
                    alt={highlight.title}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="h-12 w-12 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5">
                {/* Category Badge and Date */}
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-bold text-yellow-600 dark:text-yellow-500">
                    {highlight.category}
                  </span>
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    {new Date(highlight.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2 line-clamp-2 group-hover:text-yellow-600 dark:group-hover:text-yellow-500 transition-colors">
                  {highlight.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-3">
                  {highlight.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        {hasMultiple && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white p-2 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 transition-all duration-200 hover:scale-110"
              aria-label="Previous highlights"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goToNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white p-2 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 transition-all duration-200 hover:scale-110"
              aria-label="Next highlights"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

        {/* Dots Indicator */}
        {hasMultiple && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: Math.ceil(highlights.length / 3) }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index * 3)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentIndex === index * 3
                    ? 'w-8 bg-yellow-500'
                    : 'w-2 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500'
                }`}
                aria-label={`Go to page ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
  );
}
