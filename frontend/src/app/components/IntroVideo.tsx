import React, { useEffect, useRef } from 'react';

type IntroVideoProps = {
  onFinish: () => void;
};

export default function IntroVideo({ onFinish }: IntroVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Safety fallback: force intro to finish after 3 seconds
    // even if video doesn't load or end
    timeoutRef.current = setTimeout(() => {
      onFinish();
    }, 3000);

    // Preload and set slightly slower playback rate
    const v = videoRef.current;
    if (!v) return;
    const setRate = () => {
      try {
        v.playbackRate = 0.9;
      } catch (e) {
        /* ignore */
      }
    };
    v.preload = 'auto';
    v.addEventListener('loadedmetadata', setRate);
    // Try to play; if browser blocks, the muted attribute should allow autoplay
    v.play().catch(() => {});
    return () => {
      v.removeEventListener('loadedmetadata', setRate);
    };
  }, [onFinish]);

  const clearAndFinish = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    onFinish();
  };

  const handleEnd = () => {
    clearAndFinish();
    try {
      localStorage.setItem('introPlayed', '1');
    } catch (e) {
      /* ignore */
    }
  };

  const handleSkip = () => {
    const v = videoRef.current;
    clearAndFinish();
    try {
      localStorage.setItem('introPlayed', '1');
    } catch (e) {
      /* ignore */
    }
    try {
      if (v) {
        v.pause();
      }
    } catch (e) {
      /* ignore */
    }
  };


  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'black',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <video
        ref={videoRef}
        src="/logo-animation.mp4"
        onEnded={handleEnd}
        autoPlay
        muted
        playsInline
        preload="auto"
        onLoadedMetadata={() => {
          if (videoRef.current) {
              try {
                videoRef.current.playbackRate = 0.9;
              } catch (e) {
                /* ignore */
              }
            }
        }}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />

      {/* Skip button removed per request */}
    </div>
  );
}
