import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Component
 *
 * Ensures the window scroll position resets to (0, 0) whenever the route pathname changes.
 * This guarantees:
 * - Navbar links, sidebar links, buttons, browser forward/back buttons reset to the top of the new page.
 * - Prevents previous scroll position from leaking between different routes.
 * - If a hash is present (e.g. #section), smoothly scrolls to the element with that id instead.
 * - Avoids scrolling during component re-renders on the exact same route.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      // If navigating to an anchor link, scroll directly to target element
      const element = document.getElementById(hash.replace('#', ''));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }

    // Default: Reset window and document scroll position to top
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant', // Instant prevents sluggish animated jumps between different page layouts
    });

    // Also reset documentElement and body for cross-browser reliability
    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
    }
  }, [pathname, hash]);

  return null;
}

