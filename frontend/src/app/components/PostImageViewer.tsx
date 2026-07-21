import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

type PostImageViewerProps = {
  src: string;
  alt?: string;
  className?: string;
  containerClassName?: string;
};

export function PostImageViewer({ src, alt = 'Post content', className = '', containerClassName = '' }: PostImageViewerProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      <div className="post-image-container w-full max-w-full px-4 box-border">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`block w-full max-w-full text-left ${containerClassName}`}
          aria-label={`View full image for ${alt}`}
        >
          <img
            src={src}
            alt={alt}
            className={`w-full max-w-full h-auto max-h-[28rem] object-contain cursor-zoom-in block mx-auto ${className}`}
          />
        </button>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 p-3 sm:p-6"
          role="dialog"
          aria-modal="true"
          onClick={() => setIsOpen(false)}
        >
          <div className="relative max-h-[90vh] max-w-[95vw]" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute right-2 top-2 rounded-full bg-black/50 p-2 text-white transition hover:bg-black/70"
              aria-label="Close image preview"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={src}
              alt={alt}
              className="max-h-[90vh] max-w-[95vw] rounded-lg object-contain shadow-2xl"
            />
          </div>
        </div>
      )}
    </>
  );
}
