/* ═══════════════════════════════════════════════════════════
   VISTARAZ GLOBAL SCRIPTS
   - Scroll reveal animations
   - Sanctuary Theme Switcher (Dark default ↔ Light) with localStorage
   - Accessibility Controller (Reduced Motion, Text Size, High Contrast)
   - Universal Responsive Mobile Navigation Drawer (Three-Line ☰ Menu)
   ═══════════════════════════════════════════════════════════ */

// ── THEME SWITCHER (Dark Sanctuary as Default) ──────────────
const VzTheme = (() => {
  const STORAGE_KEY = 'vz-theme';
  const DARK  = 'dark';
  const LIGHT = 'light';
  const ICON_DARK  = '🌙';
  const ICON_LIGHT = '☀️';

  function getCurrent() {
    return localStorage.getItem(STORAGE_KEY) || DARK; // Default: Midnight Sanctuary
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

// ── ACCESSIBILITY CONTROLLER (Reduce Motion, Text Size, Contrast) ──
const VzA11y = (() => {
  const KEY_MOTION = 'vz-reduce-motion';
  const KEY_TEXT_SIZE = 'vz-text-size';
  const KEY_CONTRAST = 'vz-contrast';

  function getMotion() {
    return localStorage.getItem(KEY_MOTION) === 'true';
  }

  function getTextSize() {
    return localStorage.getItem(KEY_TEXT_SIZE) || 'normal';
  }

  function getContrast() {
    return localStorage.getItem(KEY_CONTRAST) || 'normal';
  }

  function applyMotion(enabled) {
    if (enabled) {
      document.documentElement.setAttribute('data-reduce-motion', 'true');
    } else {
      document.documentElement.removeAttribute('data-reduce-motion');
    }
    localStorage.setItem(KEY_MOTION, enabled ? 'true' : 'false');
    updateModalUI();
  }

  function applyTextSize(size) {
    if (size === 'normal') {
      document.documentElement.removeAttribute('data-text-size');
    } else {
      document.documentElement.setAttribute('data-text-size', size);
    }
    localStorage.setItem(KEY_TEXT_SIZE, size);
    updateModalUI();
  }

  function applyContrast(contrast) {
    if (contrast === 'high') {
      document.documentElement.setAttribute('data-contrast', 'high');
    } else {
      document.documentElement.removeAttribute('data-contrast');
    }
    localStorage.setItem(KEY_CONTRAST, contrast);
    updateModalUI();
  }

  // Synchronous init prevents FOUC
  function init() {
    if (getMotion()) document.documentElement.setAttribute('data-reduce-motion', 'true');
    const ts = getTextSize();
    if (ts !== 'normal') document.documentElement.setAttribute('data-text-size', ts);
    const ct = getContrast();
    if (ct === 'high') document.documentElement.setAttribute('data-contrast', 'high');
  }

  function getModal() {
    return document.getElementById('vzA11yModal');
  }

  function open() {
    const modal = getModal();
    if (!modal) return;
    updateModalUI();
    modal.classList.add('open');
  }

  function close() {
    const modal = getModal();
    if (!modal) return;
    modal.classList.remove('open');
  }

  function toggle() {
    const modal = getModal();
    if (!modal) return;
    if (modal.classList.contains('open')) close();
    else open();
  }

  function updateModalUI() {
    const modal = getModal();
    if (!modal) return;

    // Motion switch
    const motionToggle = modal.querySelector('#a11yMotionToggle');
    if (motionToggle) motionToggle.checked = getMotion();

    // Text size buttons
    const currentSize = getTextSize();
    modal.querySelectorAll('[data-a11y-size]').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-a11y-size') === currentSize);
    });

    // Contrast buttons
    const currentContrast = getContrast();
    modal.querySelectorAll('[data-a11y-contrast]').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-a11y-contrast') === currentContrast);
    });
  }

  function initDOM() {
    // 1. Ensure accessibility modal exists
    let modal = getModal();
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'vzA11yModal';
      modal.className = 'a11y-modal-backdrop';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-labelledby', 'a11yModalTitle');
      modal.innerHTML = `
        <div class="a11y-modal-card">
          <div class="a11y-modal-header">
            <h3 class="a11y-modal-title" id="a11yModalTitle">
              <i class="fa-solid fa-universal-access" style="color: var(--accent-primary)"></i>
              Accessibility
            </h3>
            <button class="a11y-modal-close" onclick="VzA11y.close()" aria-label="Close accessibility options">&times;</button>
          </div>

          <!-- Text Size Scaling -->
          <div class="a11y-control-group">
            <div class="a11y-control-label">
              <span>Text Size</span>
              <span style="font-size: 0.75rem; color: var(--text-muted);">Reading comfort</span>
            </div>
            <div class="a11y-segmented">
              <button class="a11y-opt-btn active" data-a11y-size="normal" onclick="VzA11y.applyTextSize('normal')">Default (100%)</button>
              <button class="a11y-opt-btn" data-a11y-size="lg" onclick="VzA11y.applyTextSize('lg')">Comfortable</button>
              <button class="a11y-opt-btn" data-a11y-size="xl" onclick="VzA11y.applyTextSize('xl')">Large (125%)</button>
            </div>
          </div>

          <!-- High Contrast Mode -->
          <div class="a11y-control-group">
            <div class="a11y-control-label">
              <span>Contrast</span>
              <span style="font-size: 0.75rem; color: var(--text-muted);">WCAG AAA</span>
            </div>
            <div class="a11y-segmented">
              <button class="a11y-opt-btn active" data-a11y-contrast="normal" onclick="VzA11y.applyContrast('normal')">Sanctuary</button>
              <button class="a11y-opt-btn" data-a11y-contrast="high" onclick="VzA11y.applyContrast('high')">High Contrast</button>
            </div>
          </div>

          <!-- Reduced Motion Switch -->
          <div class="a11y-control-group" style="margin-bottom: 0;">
            <div class="a11y-toggle-row">
              <div>
                <div style="font-size: 0.88rem; font-weight: 600; color: var(--text-main);">Reduce Motion</div>
                <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;">Pause orbs & ambient breathing</div>
              </div>
              <label class="a11y-switch" aria-label="Toggle reduced motion">
                <input type="checkbox" id="a11yMotionToggle" onchange="VzA11y.applyMotion(this.checked)">
                <span class="a11y-slider"></span>
              </label>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      modal.addEventListener('click', (e) => {
        if (e.target === modal) close();
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('open')) close();
      });
    }

    // 2. Ensure accessibility toggle button exists in header beside themeBtn
    document.querySelectorAll('.site-header-inner, .site-header').forEach(header => {
      if (!header.querySelector('.a11y-toggle, [data-vz-a11y-btn]')) {
        const themeBtn = header.querySelector('.theme-toggle, [data-vz-theme-btn]');
        if (themeBtn && themeBtn.parentNode) {
          const btn = document.createElement('button');
          btn.className = 'a11y-toggle';
          btn.setAttribute('data-vz-a11y-btn', '');
          btn.setAttribute('onclick', 'VzA11y.toggle()');
          btn.setAttribute('title', 'Accessibility settings (text size, contrast, motion)');
          btn.setAttribute('aria-label', 'Accessibility settings');
          btn.innerHTML = '<span style="font-size: 0.85rem; font-weight: 700;">Aa</span>';
          themeBtn.parentNode.insertBefore(btn, themeBtn);
        }
      }
    });

    updateModalUI();
  }

  return { init, initDOM, open, close, toggle, applyMotion, applyTextSize, applyContrast };
})();

// ── Run immediately, NOT inside DOMContentLoaded ─────────────
// This prevents flash-of-wrong-theme or wrong-a11y on every page load
VzTheme.init();
VzA11y.init();

// ── Expose globally IMMEDIATELY ──────────────────────────────
window.vzToggleTheme = function() { VzTheme.toggle(); };
window.vzA11yToggleModal = function() { VzA11y.toggle(); };
window.vzA11y = VzA11y;

// ── MOBILE DRAWER NAVIGATION CONTROLLER ──────────────────────
const VzNav = (() => {
  function getDrawer() {
    return document.querySelector('.mobile-nav-drawer') || document.getElementById('mobileDrawer');
  }

  function open() {
    const drawer = getDrawer();
    if (!drawer) return;
    drawer.classList.remove('hidden');
    // slight timeout to allow CSS transition if switching from display:none
    requestAnimationFrame(() => {
      drawer.classList.add('open');
    });
    document.body.style.overflow = 'hidden';
    const toggles = document.querySelectorAll('.mobile-nav-toggle, [data-vz-drawer-toggle]');
    toggles.forEach(t => t.setAttribute('aria-expanded', 'true'));
  }

  function close() {
    const drawer = getDrawer();
    if (!drawer) return;
    drawer.classList.remove('open');
    setTimeout(() => {
      if (!drawer.classList.contains('open') && drawer.id === 'mobileDrawer') {
        drawer.classList.add('hidden');
      }
    }, 320);
    document.body.style.overflow = '';
    const toggles = document.querySelectorAll('.mobile-nav-toggle, [data-vz-drawer-toggle]');
    toggles.forEach(t => t.setAttribute('aria-expanded', 'false'));
  }

  function toggle() {
    const drawer = getDrawer();
    if (!drawer) return;
    if (drawer.classList.contains('open') || (!drawer.classList.contains('hidden') && drawer.id === 'mobileDrawer' && drawer.classList.contains('open'))) {
      close();
    } else {
      open();
    }
  }

  function initAutoDrawer() {
    let drawer = getDrawer();
    const header = document.querySelector('.site-header');

    // If no drawer exists on the page, create a universal one from the header nav
    if (!drawer && header) {
      const nav = header.querySelector('nav, .site-nav');
      if (nav) {
        drawer = document.createElement('div');
        drawer.className = 'mobile-nav-drawer';
        drawer.id = 'vzMobileDrawer';
        drawer.setAttribute('aria-label', 'Mobile Navigation');

        const panel = document.createElement('div');
        panel.className = 'mobile-nav-panel';

        // Header
        const drawerHeader = document.createElement('div');
        drawerHeader.className = 'mobile-nav-header';
        drawerHeader.innerHTML = `
          <a class="brand" href="index.html" onclick="VzNav.close()">
            <img src="assets/logo.png" alt="Vistaraz" height="38">
          </a>
          <button class="mobile-nav-close" onclick="VzNav.close()" aria-label="Close menu">&times;</button>
        `;

        // Links
        const drawerLinks = document.createElement('div');
        drawerLinks.className = 'mobile-nav-links';

        const navLinks = nav.querySelectorAll('a');
        navLinks.forEach(link => {
          const clone = link.cloneNode(true);
          // Add icon if not present
          const text = clone.textContent.trim();
          let iconClass = 'fa-solid fa-circle-notch';
          if (/home/i.test(text)) iconClass = 'fa-solid fa-house';
          else if (/check-in|assessment/i.test(text)) iconClass = 'fa-solid fa-clipboard-check';
          else if (/support/i.test(text)) iconClass = 'fa-solid fa-hand-holding-heart';
          else if (/tools/i.test(text)) iconClass = 'fa-solid fa-spa';
          else if (/community/i.test(text)) iconClass = 'fa-solid fa-users';
          else if (/plans/i.test(text)) iconClass = 'fa-solid fa-crown';
          else if (/dashboard/i.test(text)) iconClass = 'fa-solid fa-chart-line';
          else if (/profile/i.test(text)) iconClass = 'fa-solid fa-user';
          else if (/leave|sign out|exit/i.test(text)) iconClass = 'fa-solid fa-sign-out-alt';

          if (!clone.querySelector('i')) {
            clone.innerHTML = `<i class="${iconClass}"></i> <span>${text}</span>`;
          }
          clone.addEventListener('click', () => close());
          drawerLinks.appendChild(clone);
        });

        // Footer with quick links
        const drawerFooter = document.createElement('div');
        drawerFooter.className = 'mobile-nav-footer';
        drawerFooter.innerHTML = `
          <a href="safety.html" class="button ghost" style="padding: 10px; font-size: 0.82rem; border-color: var(--danger); color: var(--danger); justify-content: center; width: 100%;" onclick="VzNav.close()">
            <i class="fa-solid fa-shield-heart" style="margin-right: 6px;"></i> Urgent Help (Safety)
          </a>
        `;

        panel.appendChild(drawerHeader);
        panel.appendChild(drawerLinks);
        panel.appendChild(drawerFooter);
        drawer.appendChild(panel);
        document.body.appendChild(drawer);
      }
    }

    // Ensure hamburger button exists in header if nav is present
    if (header) {
      let toggleBtn = header.querySelector('.mobile-nav-toggle, [data-vz-drawer-toggle]');
      if (!toggleBtn) {
        const nav = header.querySelector('nav, .site-nav');
        if (nav) {
          toggleBtn = document.createElement('button');
          toggleBtn.className = 'mobile-nav-toggle';
          toggleBtn.setAttribute('data-vz-drawer-toggle', '');
          toggleBtn.setAttribute('aria-label', 'Open Menu');
          toggleBtn.setAttribute('title', 'Menu');
          toggleBtn.innerHTML = `
            <div class="hamburger-icon">
              <span></span>
              <span></span>
              <span></span>
            </div>
          `;
          toggleBtn.onclick = () => toggle();
          nav.appendChild(toggleBtn);
        }
      } else {
        toggleBtn.onclick = () => toggle();
      }
    }

    // Backdrop click to close
    document.addEventListener('click', (e) => {
      const activeDrawer = getDrawer();
      if (!activeDrawer) return;
      if (e.target === activeDrawer) {
        close();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        close();
      }
    });
  }

  return { init: initAutoDrawer, open, close, toggle };
})();

// Global shortcuts
window.vzToggleDrawer = () => VzNav.toggle();
window.vzCloseDrawer = () => VzNav.close();
window.vzOpenDrawer = () => VzNav.open();
window.toggleMobileDrawer = () => VzNav.toggle(); // legacy name compatibility

// Universal Global Sign Out Handler
window.handleSignOut = async function(redirectTo = 'index.html') {
  if (window.VistarazAuth && typeof window.VistarazAuth.signOut === 'function') {
    await window.VistarazAuth.signOut(redirectTo);
    return;
  }
  // Fallback if VistarazAuth is not loaded
  try {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('sb-') || key.includes('supabase') || key.includes('auth') || key.includes('vz-user') || key.includes('session'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
    sessionStorage.clear();
  } catch(e) {}
  window.location.replace(redirectTo);
};
window.vzSignOut = window.handleSignOut;

// ── RESILIENCE, ERROR HANDLING, LOADING & RETRY SUITE ──────

// 1. GLOBAL ERROR BOUNDARY (Prevent Blank Screens)
const VzErrorBoundary = (() => {
  let hasShownError = false;

  function createErrorUI(errorInfo) {
    if (hasShownError) return;
    hasShownError = true;

    // Remove any existing boundary
    const existing = document.getElementById('vzFatalBoundary');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'vzFatalBoundary';
    overlay.className = 'vz-error-boundary';
    overlay.setAttribute('role', 'alert');

    const msg = errorInfo.message || 'An unexpected pause occurred in the sanctuary.';
    const details = errorInfo.stack || errorInfo.error?.stack || errorInfo.source || '';

    overlay.innerHTML = `
      <div class="vz-error-card">
        <div class="vz-error-icon-wrap">
          <i class="fa-solid fa-shield-heart"></i>
        </div>
        <h2 class="vz-error-title">Sanctuary Recovery</h2>
        <p class="vz-error-desc">
          Something took an unexpected turn, but your space is protected and safe. 
          We've prevented a blank screen so you can recover without losing your way.
        </p>
        <div class="vz-error-actions">
          <button class="button primary vz-error-btn" onclick="window.location.reload()">
            <i class="fa-solid fa-rotate-right" style="margin-right: 6px;"></i> Reload Page
          </button>
          <a class="button ghost vz-error-btn" href="index.html">
            <i class="fa-solid fa-house" style="margin-right: 6px;"></i> Return Home
          </a>
        </div>
        <div style="display: flex; justify-content: center; gap: 14px; margin-top: 10px; font-size: 0.82rem;">
          <a href="safety.html" style="color: var(--danger); text-decoration: underline;">
            <i class="fa-solid fa-phone-volume"></i> 24/7 Crisis Helplines
          </a>
          <button onclick="VzErrorBoundary.clearCacheAndReload()" style="background: none; border: none; color: var(--text-muted); cursor: pointer; text-decoration: underline; font-size: 0.82rem;">
            Clear Cache & Restart
          </button>
        </div>
        ${details ? `
          <details class="vz-error-details">
            <summary>Diagnostic Details</summary>
            <pre>${escapeHtml(msg)}\n${escapeHtml(details.slice(0, 500))}</pre>
          </details>
        ` : ''}
      </div>
    `;

    document.body.appendChild(overlay);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function clearCacheAndReload() {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {}
    window.location.reload(true);
  }

  function init() {
    window.addEventListener('error', (event) => {
      console.error('[Vistaraz Error Boundary caught]', event.error || event.message);
      // Avoid triggering on trivial CDN cross-origin or image load errors unless page is completely blank
      if (document.body && document.body.children.length > 0 && !event.message?.includes('Uncaught Error')) {
        return;
      }
      createErrorUI({
        message: event.message,
        error: event.error,
        source: `${event.filename}:${event.lineno}:${event.colno}`
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      console.error('[Vistaraz Unhandled Rejection]', event.reason);
      // Suppress minor background fetch aborts
      if (event.reason && (event.reason.name === 'AbortError' || event.reason.message?.includes('aborted'))) {
        return;
      }
    });

    // Blank screen watchdog: If after 6 seconds document body has 0 content or displays infinite spinner
    setTimeout(() => {
      if (!document.body || document.body.children.length === 0) {
        createErrorUI({ message: 'The sanctuary view took too long to render.' });
      }
    }, 6000);
  }

  return { init, show: createErrorUI, clearCacheAndReload };
})();

// 2. AMBIENT LOADING SYSTEM (Top Bar, Button Spinners, Skeletons)
const VzLoading = (() => {
  let progressEl = null;
  let progressInterval = null;
  let currentProgress = 0;

  function getProgressBar() {
    if (!progressEl) {
      progressEl = document.getElementById('vzTopProgress');
      if (!progressEl) {
        progressEl = document.createElement('div');
        progressEl.id = 'vzTopProgress';
        document.body.appendChild(progressEl);
      }
    }
    return progressEl;
  }

  function start() {
    const bar = getProgressBar();
    clearInterval(progressInterval);
    currentProgress = 15;
    bar.style.width = currentProgress + '%';
    bar.classList.add('active');

    progressInterval = setInterval(() => {
      if (currentProgress < 85) {
        currentProgress += (85 - currentProgress) * 0.15;
        bar.style.width = currentProgress + '%';
      }
    }, 200);
  }

  function done() {
    const bar = getProgressBar();
    clearInterval(progressInterval);
    currentProgress = 100;
    bar.style.width = '100%';
    setTimeout(() => {
      bar.classList.remove('active');
      setTimeout(() => {
        bar.style.width = '0%';
        currentProgress = 0;
      }, 250);
    }, 200);
  }

  function buttonStart(btn, text = 'Loading...') {
    if (!btn) return;
    btn.dataset.vzOrigHtml = btn.innerHTML;
    btn.classList.add('vz-btn-loading');
    btn.disabled = true;
    btn.innerHTML = `<span class="vz-btn-spinner" aria-hidden="true"></span><span>${text}</span>`;
  }

  function buttonStop(btn) {
    if (!btn) return;
    if (btn.dataset.vzOrigHtml) {
      btn.innerHTML = btn.dataset.vzOrigHtml;
      delete btn.dataset.vzOrigHtml;
    }
    btn.classList.remove('vz-btn-loading');
    btn.disabled = false;
  }

  function createSkeleton(type = 'card', count = 1) {
    let html = '';
    for (let i = 0; i < count; i++) {
      if (type === 'card') {
        html += `
          <div class="vz-skeleton-card">
            <div class="vz-skeleton vz-skeleton-title"></div>
            <div class="vz-skeleton vz-skeleton-text" style="width: 90%;"></div>
            <div class="vz-skeleton vz-skeleton-text" style="width: 75%;"></div>
            <div style="display: flex; gap: 10px; margin-top: 10px;">
              <div class="vz-skeleton vz-skeleton-btn"></div>
            </div>
          </div>
        `;
      } else if (type === 'text') {
        html += `
          <div class="vz-skeleton vz-skeleton-text" style="width: 100%;"></div>
          <div class="vz-skeleton vz-skeleton-text" style="width: 85%;"></div>
          <div class="vz-skeleton vz-skeleton-text" style="width: 60%;"></div>
        `;
      } else if (type === 'row') {
        html += `
          <div style="display: flex; align-items: center; gap: 14px; padding: 12px 0;">
            <div class="vz-skeleton vz-skeleton-circle"></div>
            <div style="flex: 1;">
              <div class="vz-skeleton vz-skeleton-title" style="width: 40%; height: 16px; margin-bottom: 6px;"></div>
              <div class="vz-skeleton vz-skeleton-text" style="width: 70%; margin-bottom: 0;"></div>
            </div>
          </div>
        `;
      }
    }
    return html;
  }

  return { start, done, buttonStart, buttonStop, createSkeleton };
})();

// 3. NETWORK STATUS MONITORING
const VzNetwork = (() => {
  let toastEl = null;
  const reconnectCallbacks = [];

  function getToast() {
    if (!toastEl) {
      toastEl = document.getElementById('vzNetworkToast');
      if (!toastEl) {
        toastEl = document.createElement('div');
        toastEl.id = 'vzNetworkToast';
        toastEl.className = 'vz-network-toast';
        toastEl.setAttribute('role', 'status');
        toastEl.setAttribute('aria-live', 'polite');
        document.body.appendChild(toastEl);
      }
    }
    return toastEl;
  }

  function show(status, message) {
    const toast = getToast();
    toast.className = `vz-network-toast show vz-network-${status}`;
    if (status === 'offline') {
      toast.innerHTML = `<i class="fa-solid fa-wifi-slash"></i> <span>${message || 'You are currently offline. Sanctuary is using cached data.'}</span>`;
    } else {
      toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span>${message || 'Connection restored! Sanctuary is back online.'}</span>`;
      setTimeout(() => {
        toast.classList.remove('show');
      }, 3500);
    }
  }

  function hide() {
    const toast = getToast();
    toast.classList.remove('show');
  }

  function isOnline() {
    return typeof navigator.onLine === 'boolean' ? navigator.onLine : true;
  }

  function onReconnect(fn) {
    if (typeof fn === 'function') {
      reconnectCallbacks.push(fn);
    }
  }

  function init() {
    window.addEventListener('offline', () => {
      show('offline');
    });

    window.addEventListener('online', () => {
      show('online');
      // Trigger registered callbacks
      reconnectCallbacks.forEach(cb => {
        try { cb(); } catch (e) { console.error('[VzNetwork reconnect callback]', e); }
      });
    });

    // Initial check
    if (!isOnline()) {
      show('offline');
    }
  }

  return { init, show, hide, isOnline, onReconnect };
})();

// 4. RETRY CONTROLLER & UI CARDS
const VzRetry = (() => {
  async function run(asyncFn, options = {}) {
    const maxRetries = options.maxRetries || 3;
    const baseDelay = options.baseDelay || 800;
    const factor = options.factor || 2;
    const onRetry = options.onRetry || (() => {});

    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        return await asyncFn();
      } catch (err) {
        attempt++;
        if (attempt >= maxRetries) {
          throw err;
        }
        // Exponential backoff with jitter
        const jitter = Math.random() * 200;
        const delay = (baseDelay * Math.pow(factor, attempt - 1)) + jitter;
        onRetry(attempt, err, delay);
        await new Promise(res => setTimeout(res, delay));
      }
    }
  }

  function renderCard(container, { title, message, onRetry }) {
    if (typeof container === 'string') {
      container = document.querySelector(container);
    }
    if (!container) return;

    const retryCard = document.createElement('div');
    retryCard.className = 'vz-retry-card';
    retryCard.innerHTML = `
      <i class="fa-solid fa-cloud-bolt vz-retry-icon"></i>
      <h4>${title || 'Connection Interrupted'}</h4>
      <p>${message || 'We could not reach the sanctuary server right now. Your data is safe.'}</p>
      <button class="button primary vz-retry-btn">
        <i class="fa-solid fa-rotate-right"></i> Try Again
      </button>
    `;

    const btn = retryCard.querySelector('button');
    btn.addEventListener('click', async () => {
      VzLoading.buttonStart(btn, 'Retrying...');
      try {
        if (onRetry) await onRetry();
      } catch (e) {
        console.error('[VzRetry Card Action]', e);
      } finally {
        VzLoading.buttonStop(btn);
      }
    });

    container.innerHTML = '';
    container.appendChild(retryCard);
  }

  return { run, renderCard };
})();

// Initialize early resilience listeners immediately
VzErrorBoundary.init();

// Expose globally
window.VzErrorBoundary = VzErrorBoundary;
window.VzLoading = VzLoading;
window.VzNetwork = VzNetwork;
window.VzRetry = VzRetry;

// ── DOM READY ACTIONS ────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Re-sync all button icons once DOM elements are rendered
  VzTheme.apply(VzTheme.getCurrent());

  // Initialize mobile navigation
  VzNav.init();

  // Initialize accessibility controls and UI
  VzA11y.initDOM();

  // Initialize network status monitoring
  VzNetwork.init();

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

