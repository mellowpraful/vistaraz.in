# Vistaraz — Shared Components & Design System Contracts

This document specifies the shared UI components, component contracts, styling tokens, and file ownership rules established during Phase 1 for developers working on the Vistaraz React migration.

---

## 1. Designated File Ownership

To prevent merge conflicts while working on the same Git branch:

| Component Category | Paths | Designated Owner | Guidelines |
|---|---|---|---|
| **Build & Tooling** | `vite.config.mjs`, `package.json`, `index.html` | **Architect** | Read-only for Page Developers |
| **Design Tokens & Styles** | `src/styles/variables.css`, `global.css`, `responsive.css` | **Architect** | Developers use existing tokens; do not overwrite |
| **Layout Components** | `src/components/layout/*` (`Header`, `Footer`, `Navbar`, `Sidebar`, `AppLayout`) | **Architect** | Import into pages; do not modify internals |
| **Common UI Components** | `src/components/common/*` (`Button`, `Card`) | **Architect** | Reusable atoms; use documented props |
| **Routing Root** | `src/routes/AppRoutes.jsx`, `src/App.jsx`, `src/main.jsx` | **Architect** | Routes are pre-wired for all 16 pages |
| **Pages 1–8** | `src/pages/HomePage.jsx` through `PlansPage.jsx` | **Developer 1** | Exclusive ownership |
| **Pages 9–16** | `src/pages/RegisterPage.jsx` through `NotFoundPage.jsx` | **Developer 2** | Exclusive ownership |

---

## 2. Component Contracts & Props

### 2.1 `AppLayout`
Standard shell wrapper for public and authenticated views.
- **Import:**
  ```jsx
  import AppLayout from '../components/layout/AppLayout';
  ```
- **Props:**
  - `hasHeader` *(boolean, default: `true`)* — Toggles top sticky navigation header.
  - `hasFooter` *(boolean, default: `true`)* — Toggles bottom footer with crisis banner.
  - `hasSidebar` *(boolean, default: `false`)* — Toggles left-hand navigation sidebar (recommended for `/assessment`, `/chat`, `/dashboard`, `/client-panel`, `/listener-portal`, `/video-call`).
  - `children` *(ReactNode)* — Page content.

---

### 2.2 `Button`
Universal accessible button and link component.
- **Import:**
  ```jsx
  import Button from '../components/common/Button';
  ```
- **Props:**
  - `variant` *(string, default: `'primary'`)*:
    - `'primary'` — Dark charcoal pill button (Brand hero button, e.g. "Get Started →", "Next Step")
    - `'accent'` — Violet / Indigo solid button (`--vz-primary`)
    - `'secondary'` — Warm neutral surface button
    - `'outline'` — Transparent button with crisp border
    - `'ghost'` — Minimal text button
    - `'soft'` — Light violet tinted button
  - `size` *(string, default: `'md'`)*: `'sm'` | `'md'` | `'lg'`
  - `to` *(string, optional)* — React Router link path (e.g. `to="/assessment"`)
  - `href` *(string, optional)* — External URL (renders `<a>`)
  - `icon` *(ReactNode, optional)* — Icon component (e.g. `<ArrowRight size={16} />`)
  - `iconPosition` *(string, default: `'right'`)*: `'left'` | `'right'`
  - `fullWidth` *(boolean, default: `false`)* — Expands button to 100% container width
  - `disabled` *(boolean, default: `false`)*
  - `onClick` *(function, optional)*

---

### 2.3 `Card`
Surface container with rounded corners and subtle borders.
- **Import:**
  ```jsx
  import Card from '../components/common/Card';
  ```
- **Props:**
  - `variant` *(string, default: `'default'`)*:
    - `'default'` — Pure white background (`--vz-bg-surface`) with subtle border
    - `'pink'` — Pastel rose background (Very low mood / crisis notices)
    - `'peach'` — Pastel orange/peach background (Low mood / warnings)
    - `'yellow'` — Pastel amber background (Okay mood / active assessment cards)
    - `'mint'` — Pastel mint background (Good mood / active listener status)
    - `'sky'` — Pastel sky blue background (Really good mood / informational)
    - `'lavender'` — Pastel lavender background (Assessment & introspection)
  - `padding` *(string, default: `'md'`)*: `'none'` | `'sm'` | `'md'` | `'lg'`
  - `hoverable` *(boolean, default: `false`)* — Adds lift and shadow transition on hover
  - `selected` *(boolean, default: `false`)* — Highlighted border with violet outline ring
  - `clickable` *(boolean, default: `false`)* — Cursor pointer and interactive role
  - `onClick` *(function, optional)*
- **Subcomponents:**
  - `<Card.Header>`
  - `<Card.Body>`
  - `<Card.Footer>`

---

### 2.4 `Header`
Fixed/sticky header matching the reference visual.
- **Import:**
  ```jsx
  import Header from '../components/layout/Header';
  ```
- Contains brand sprout mark, desktop navigation, dashboard shortcut, "Get Started" CTA, and responsive mobile drawer.

---

### 2.5 `Sidebar`
Left application navigation drawer.
- **Import:**
  ```jsx
  import Sidebar from '../components/layout/Sidebar';
  ```
- Contains brand logo, 8 core application route links with icons, safety quick link, and member session status.

---

### 2.6 `Footer`
Calming, human-centered footer.
- **Import:**
  ```jsx
  import Footer from '../components/layout/Footer';
  ```
- Contains crisis safeguarding banner, four-column link matrix, verified email link, and social profiles.

---

## 3. CSS Tokens Quick Reference

All tokens are defined in `src/styles/variables.css`:

```css
/* Backgrounds */
var(--vz-bg-canvas);   /* #faf8f5 Warm off-white */
var(--vz-bg-surface);  /* #ffffff Card white */
var(--vz-bg-subtle);   /* #f4f0eb Soft neutral */

/* Text */
var(--vz-text-primary);   /* #18191d Deep charcoal */
var(--vz-text-secondary); /* #4d525c Refined slate */
var(--vz-text-muted);     /* #7f8592 Muted text */

/* Accents */
var(--vz-primary);        /* #4f46e5 Indigo/violet */
var(--vz-primary-light);  /* #eef2ff Pastel violet */
var(--vz-dark-pill);      /* #131418 Charcoal pill */

/* Restrained Pastels */
var(--vz-pastel-pink-bg);   var(--vz-pastel-pink-text);
var(--vz-pastel-peach-bg);  var(--vz-pastel-peach-text);
var(--vz-pastel-yellow-bg); var(--vz-pastel-yellow-text);
var(--vz-pastel-mint-bg);   var(--vz-pastel-mint-text);
var(--vz-pastel-sky-bg);    var(--vz-pastel-sky-text);
var(--vz-pastel-lavender-bg); var(--vz-pastel-lavender-text);

/* Radii */
var(--vz-radius-md);    /* 14px */
var(--vz-radius-xl);    /* 24px */
var(--vz-radius-full);  /* 9999px (Pill buttons & chips) */
```

---

## 4. Utility Classes
- `.vz-container` — Standard 1200px responsive centered container
- `.vz-eyebrow` — Small uppercase tracking heading tag
- `.vz-text-violet` — Violet accent text color
- `.vz-chip` — Rounded pill badge with variant classes (`.pink`, `.mint`, `.sky`, `.lavender`)
- `.vz-status-dot` — Small status circle indicator (`.online`, `.busy`)
- `.vz-avatar` — Circular avatar element (`.sm`, `.lg`, `.xl`)
