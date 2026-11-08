import React, { useState, useEffect, useCallback, useRef } from 'react';
import './AuthCarousel.css';

/**
 * 4 Full-Bleed Carousel Slides
 */
const CAROUSEL_SLIDES = [
  {
    id: 1,
    src: '/assets/images/auth-carousel/slide-1.webp',
    fallbackSrc: '/images/auth-carousel/slide-1.jpg',
    alt: 'Tranquil sanctuary space with soft ambient light and lush plants',
    fallbackGradient: 'linear-gradient(135deg, #1e1b4b 0%, #2e1065 50%, #0f172a 100%)',
  },
  {
    id: 2,
    src: '/assets/images/auth-carousel/slide-2.webp',
    fallbackSrc: '/images/auth-carousel/slide-2.jpg',
    alt: 'Tranquil misty morning lake symbolizing calm breathing and mindfulness',
    fallbackGradient: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #0f172a 100%)',
  },
  {
    id: 3,
    src: '/assets/images/auth-carousel/slide-3.webp',
    fallbackSrc: '/images/auth-carousel/slide-3.jpg',
    alt: 'Compassionate and empathetic peer connection in a sunlit sanctuary',
    fallbackGradient: 'linear-gradient(135deg, #4c1d95 0%, #3b0764 50%, #0f172a 100%)',
  },
  {
    id: 4,
    src: '/assets/images/auth-carousel/slide-4.webp',
    fallbackSrc: '/images/auth-carousel/slide-4.jpg',
    alt: 'Tranquil night sky with gentle aurora and stars inspiring serenity',
    fallbackGradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #111827 100%)',
  },
];

const AUTOPLAY_INTERVAL = 4000; // 4 seconds

/**
 * AuthCarousel Component
 * 
 * Full-bleed 50% split-screen image carousel for Login and Register pages.
 * Displays one full image at a time, smoothly sliding horizontally from right to left,
 * with subtle bottom pagination dots and zero navigation arrows or overlays.
 */
export default function AuthCarousel({ className = '' }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [failedImages, setFailedImages] = useState({});
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const timerRef = useRef(null);

  // Check user preference for reduced motion
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener?.('change', handleChange);
    return () => mediaQuery.removeEventListener?.('change', handleChange);
  }, []);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
  }, []);

  const goToSlide = useCallback((index) => {
    setCurrentIndex(index);
  }, []);

  // Autoplay timer with pause on hover/focus and reduced motion compliance
  useEffect(() => {
    if (isPaused || prefersReducedMotion) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      goToNext();
    }, AUTOPLAY_INTERVAL);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, prefersReducedMotion, goToNext, currentIndex]);

  const handleImageError = (index, slide) => {
    // If webp fails, try fallback jpeg first before showing gradient fallback
    if (!failedImages[index]) {
      setFailedImages((prev) => ({ ...prev, [index]: 'fallback' }));
    } else {
      console.warn(`[AuthCarousel] Asset failed to load for slide ${index + 1}.`);
      setFailedImages((prev) => ({ ...prev, [index]: 'error' }));
    }
  };

  return (
    <aside
      className={`vz-auth-carousel ${className}`}
      aria-roledescription="carousel"
      aria-label="Vistaraz Sanctuary Gallery"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      {/* Sliding Track */}
      <div
        className="vz-auth-carousel__track"
        style={{
          transform: `translateX(-${currentIndex * 100}%)`,
          transitionDuration: prefersReducedMotion ? '0ms' : '700ms',
        }}
      >
        {CAROUSEL_SLIDES.map((slide, idx) => {
          const failureState = failedImages[idx];
          const imgSrc = failureState === 'fallback' ? slide.fallbackSrc : slide.src;

          return (
            <div
              key={slide.id}
              className={`vz-auth-carousel__slide ${idx === currentIndex ? 'vz-auth-carousel__slide--active' : ''}`}
              role="group"
              aria-roledescription="slide"
              aria-label={`Slide ${idx + 1} of ${CAROUSEL_SLIDES.length}`}
              aria-hidden={idx !== currentIndex}
            >
              {failureState === 'error' ? (
                /* Subtle Sanctuary Gradient Fallback */
                <div
                  className="vz-auth-carousel__fallback"
                  style={{ background: slide.fallbackGradient }}
                />
              ) : (
                /* Full-Bleed Image */
                <img
                  src={imgSrc}
                  alt={slide.alt}
                  className="vz-auth-carousel__image"
                  onError={() => handleImageError(idx, slide)}
                  loading={idx === 0 ? 'eager' : 'lazy'}
                />
              )}

              {/* Subtle Atmospheric Vignette Overlay */}
              <div className="vz-auth-carousel__overlay" aria-hidden="true" />
            </div>
          );
        })}
      </div>

      {/* Subtle Pagination Indicators (Bottom Center) */}
      <div className="vz-auth-carousel__indicators" role="tablist" aria-label="Carousel pagination">
        {CAROUSEL_SLIDES.map((slide, idx) => (
          <button
            key={slide.id}
            type="button"
            role="tab"
            aria-selected={idx === currentIndex}
            aria-label={`Go to slide ${idx + 1}`}
            className={`vz-auth-carousel__indicator ${
              idx === currentIndex ? 'vz-auth-carousel__indicator--active' : ''
            }`}
            onClick={() => goToSlide(idx)}
          />
        ))}
      </div>
    </aside>
  );
}
