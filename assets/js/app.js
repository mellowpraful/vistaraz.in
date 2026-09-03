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
  } catch (e) {}
  window.location.replace(redirectTo);
};
window.vzSignOut = window.handleSignOut;

// ── DOM READY ACTIONS ────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Re-sync all button icons once DOM elements are rendered
  VzTheme.apply(VzTheme.getCurrent());

  // Initialize mobile navigation
  VzNav.init();

  // Initialize accessibility controls and UI
  VzA11y.initDOM();

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
