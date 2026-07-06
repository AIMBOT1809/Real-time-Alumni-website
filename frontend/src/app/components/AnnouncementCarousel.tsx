import { useState, useEffect, useCallback } from 'react';

interface AdminPost {
  id: string;
  title: string;
  description: string;
  content?: string;
  image_url?: string;
  file_url?: string;
  attachment_url?: string;
  attachment_name?: string;
  image?: string;
  created_at: string;
  likes?: number;
  comments?: number;
}

interface AnnouncementCarouselProps {
  posts: AdminPost[];
}

export function AnnouncementCarousel({ posts }: AnnouncementCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);

  const getImageUrl = (post: AdminPost) => {
    return post.image_url || post.file_url || post.image || '';
  };

  const getDisplayText = (post: AdminPost) => {
    return post.description || post.content || '';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(dateString));
  };

  const truncateText = (text: string, maxLines: number = 3) => {
    const words = text.split(' ');
    const wordsPerLine = 15; // Approximate words per line
    const maxWords = maxLines * wordsPerLine;
    
    if (words.length <= maxWords) return text;
    
    return words.slice(0, maxWords).join(' ') + '...';
  };

  const getCardsPerView = () => {
    if (typeof window === 'undefined') return 3;
    if (window.innerWidth < 768) return 1;
    if (window.innerWidth < 1024) return 2;
    return 3;
  };

  const [cardsPerView, setCardsPerView] = useState(getCardsPerView());

  useEffect(() => {
    const handleResize = () => {
      setCardsPerView(getCardsPerView());
      setCurrentIndex(0); // Reset to first slide on resize
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalSlides = Math.max(1, posts.length - cardsPerView + 1);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev >= totalSlides - 1 ? 0 : prev + 1));
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev <= 0 ? totalSlides - 1 : prev - 1));
  }, [totalSlides]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Auto-play functionality
  useEffect(() => {
    if (isPaused || posts.length <= cardsPerView) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused, posts.length, cardsPerView, nextSlide]);

  // Handle drag start
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStartX(e.clientX);
    setDragOffset(0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const offset = e.clientX - dragStartX;
    setDragOffset(offset);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    
    const threshold = 100;
    if (dragOffset > threshold) {
      prevSlide();
    } else if (dragOffset < -threshold) {
      nextSlide();
    }
    
    setIsDragging(false);
    setDragOffset(0);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setDragStartX(e.touches[0].clientX);
    setDragOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const offset = e.touches[0].clientX - dragStartX;
    setDragOffset(offset);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    const threshold = 100;
    if (dragOffset > threshold) {
      prevSlide();
    } else if (dragOffset < -threshold) {
      nextSlide();
    }
    
    setIsDragging(false);
    setDragOffset(0);
  };

  if (posts.length === 0) return null;

  // Single post - no carousel
  if (posts.length === 1) {
    return (
      <div className="flex justify-center">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200 hover:shadow-xl transition-shadow duration-300">
          <div className="p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold uppercase tracking-[0.18em] text-yellow-600">Announcement</span>
              <span className="text-sm text-slate-400">
                {formatDate(posts[0].created_at)}
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">{posts[0].title}</h3>
            <p className="text-slate-600 mb-4">{truncateText(getDisplayText(posts[0]))}</p>
            {getImageUrl(posts[0]) && (
              <div className="w-full rounded-2xl overflow-hidden bg-slate-100">
                <img
                  src={getImageUrl(posts[0])}
                  alt={posts[0].title}
                  className="w-full h-auto max-h-96 object-contain"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const slideWidth = 100 / cardsPerView;
  const translateX = -(currentIndex * slideWidth) + (dragOffset / (typeof window !== 'undefined' ? window.innerWidth : 1200)) * 100;

  return (
    <div className="relative">
      {/* Carousel Container */}
      <div
        className="relative overflow-hidden rounded-2xl"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => {
          setIsPaused(false);
          setIsDragging(false);
          setDragOffset(0);
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            transform: `translateX(${translateX}%)`,
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
        >
          {posts.map((post) => (
            <div
              key={post.id}
              className="flex-shrink-0 px-3"
              style={{ width: `${slideWidth}%` }}
            >
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200 hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
                {getImageUrl(post) && (
                  <div className="w-full rounded-t-2xl overflow-hidden bg-slate-100">
                    <img
                      src={getImageUrl(post)}
                      alt={post.title}
                      className="w-full h-48 object-contain"
                    />
                  </div>
                )}
                <div className="p-5 flex flex-col flex-grow">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-yellow-600">Announcement</span>
                    <span className="text-xs text-slate-400">
                      {formatDate(post.created_at)}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2">{post.title}</h3>
                  <p className="text-sm text-slate-600 flex-grow line-clamp-3">
                    {truncateText(getDisplayText(post), 3)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      {posts.length > cardsPerView && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-slate-700 p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
            aria-label="Previous announcements"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-slate-700 p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
            aria-label="Next announcements"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {posts.length > cardsPerView && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentIndex === index
                  ? 'w-8 bg-yellow-500'
                  : 'w-2 bg-slate-300 hover:bg-slate-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}