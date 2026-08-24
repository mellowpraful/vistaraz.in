/* ═══════════════════════════════════════════════════════════
   VISTARAZ GLOBAL SCRIPTS
   - Scroll reveal animations
   - Theme switcher (Light ↔ Dark) with localStorage persistence
   ═══════════════════════════════════════════════════════════ */

// ── THEME SWITCHER ──────────────────────────────────────────
const VzTheme = (() => {
  const STORAGE_KEY = 'vz-theme';
  const DARK  = 'dark';
  const LIGHT = 'light';
  const ICON_DARK  = '🌙';
  const ICON_LIGHT = '☀️';

  function getCurrent() {
    return localStorage.getItem(STORAGE_KEY) || LIGHT;
  }

  function apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
    // Update ALL toggle buttons on the page
    document.querySelectorAll('.theme-toggle, [data-vz-theme-btn]').forEach(btn => {
      btn.textContent = theme === DARK ? ICON_LIGHT : ICON_DARK;
      btn.setAttribute('title', theme === DARK ? 'Switch to Light Mode' : 'Switch to Dark Mode');
      btn.setAttribute('aria-label', btn.getAttribute('title'));
    });
  }

  function toggle() {
    const next = getCurrent() === DARK ? LIGHT : DARK;
    apply(next);
  }

  // Apply saved theme immediately (prevents FOUC)
  function init() {
    apply(getCurrent());
  }

  return { init, toggle, apply, getCurrent };
})();

// ── Run immediately, NOT inside DOMContentLoaded ─────────────
// This prevents flash-of-wrong-theme on every page load
VzTheme.init();

// ── Expose globally IMMEDIATELY (not inside DOMContentLoaded) ─
// This ensures onclick="vzToggleTheme()" always works
window.vzToggleTheme = function() { VzTheme.toggle(); };

// ── DOM READY ACTIONS ────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Re-sync all button icons once DOM elements are rendered
  VzTheme.apply(VzTheme.getCurrent());

  // Intersection Observer for .reveal elements
  const revealObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          obs.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px', threshold: 0.1 }
  );
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
});

