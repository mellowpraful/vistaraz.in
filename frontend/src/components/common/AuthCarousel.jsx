import React, { useState, useEffect, useCallback, useRef } from 'react';
import slide1 from '../../assets/images/auth-carousel/Take a Break, Find Calm.png';
import slide2 from '../../assets/images/auth-carousel/From Overwhelmed to Supported.png';
import slide3 from '../../assets/images/auth-carousel/Sunset Pause_ Reflect and Get Support.png';
import slide4 from '../../assets/images/auth-carousel/Your Wellbeing Journey, Step by Step.png';
import './AuthCarousel.css';

/**
 * 4 Full-Bleed Carousel Slides
 * Uses the 4 sanctuary illustration images:
 * 1. Take a Break, Find Calm.png
 * 2. From Overwhelmed to Supported.png
 * 3. Sunset Pause_ Reflect and Get Support.png
 * 4. Your Wellbeing Journey, Step by Step.png
 */
const CAROUSEL_SLIDES = [
  {
    id: 1,
    src: slide1,
    fallbackSrc: '/images/auth-carousel/Take a Break, Find Calm.png',
    alt: 'Take a Break, Find Calm — Vistaraz mindful sanctuary',
    fallbackGradient: 'linear-gradient(135deg, #1e1b4b 0%, #2e1065 50%, #0f172a 100%)',
  },
  {
    id: 2,
    src: slide2,
    fallbackSrc: '/images/auth-carousel/From Overwhelmed to Supported.png',
    alt: 'From Overwhelmed to Supported — empathetic peer support',
    fallbackGradient: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #0f172a 100%)',
  },
  {
    id: 3,
    src: slide3,
    fallbackSrc: '/images/auth-carousel/Sunset Pause_ Reflect and Get Support.png',
    alt: 'Sunset Pause: Reflect and Get Support — peaceful emotional space',
    fallbackGradient: 'linear-gradient(135deg, #4c1d95 0%, #3b0764 50%, #0f172a 100%)',
  },
  {
    id: 4,
    src: slide4,
    fallbackSrc: '/images/auth-carousel/Your Wellbeing Journey, Step by Step.png',
    alt: 'Your Wellbeing Journey, Step by Step — guided growth and calm',
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
    // If bundled import fails, try public fallback URL before gradient
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
