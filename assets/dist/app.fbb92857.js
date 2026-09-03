/* ═══════════════════════════════════════════════════════════
   VISTARAZ GLOBAL SCRIPTS
   - Scroll reveal animations
   - Theme switcher (Light ↔ Dark) with localStorage persistence
   - Universal Responsive Mobile Navigation Drawer (Three-Line ☰ Menu)
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
