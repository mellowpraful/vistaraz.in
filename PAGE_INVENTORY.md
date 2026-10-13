# Vistaraz — 16-Page Migration Inventory & Parallel Assignment Matrix

This document defines the official inventory of all 16 original HTML pages in the Vistaraz platform, their migration targets in React, and the parallel developer assignments for the two-hour development window.

---

## 1. Overview & Architecture Strategy

- **Repository Branch:** `main` (both developers work simultaneously on the same Git branch without creating split branches or worktrees).
- **React Foundation:** Vite + React 19 + React Router v7 (`react-router-dom`).
- **Shared Infrastructure Owner:** Architect (Phase 1). Infrastructure files (`src/components/layout/*`, `src/components/common/*`, `src/styles/*`, `src/routes/AppRoutes.jsx`, `vite.config.mjs`, `index.html`) must not be refactored or deleted by page developers.
- **Page Ownership:** Developer 1 owns Pages 1–8; Developer 2 owns Pages 9–16.

---

## 2. 16-Page Inventory Table

| # | Original HTML File | Original Purpose | Existing Key Assets & Interactions | Proposed React Component | Proposed Route | Assigned Developer |
|---|---|---|---|---|---|---|
| **1** | `index.html` *(backed up as `index.original.html`)* | Marketing & trust-building homepage | Hero actions, quick access buttons, theme toggle, a11y toggle modal, scroll reveal, trust badges | `src/pages/HomePage.jsx` | `/` | **Developer 1** |
| **2** | `assessment.html` | 10-Area mental health check-in (non-diagnostic) | 8-step progress tracker, 5-point emotion selector cards (Very Low to Really Good), category scores, instant tailored advice | `src/pages/AssessmentPage.jsx` | `/assessment` | **Developer 1** |
| **3** | `support.html` | Directory of peer listeners & licensed clinicians | Provider category filter pills (Psychologists, Psychiatrists, Counselors), listener availability status, ratings, consultation booking modals | `src/pages/SupportPage.jsx` | `/support` | **Developer 1** |
| **4** | `chat.html` | Real-time encrypted peer chat support | Encrypted message feed, typing indicator, message composer, quick-reply distress chips, urgent crisis escalation button, session rating modal | `src/pages/ChatPage.jsx` | `/chat` | **Developer 1** |
| **5** | `tools.html` | Sanctuary Wellbeing Toolkit | `assets/js/tools.js` (Box Breathing Studio, Ambient Soundscape Synth WebAudio, Worry Shredder canvas, 5-4-3-2-1 Grounding Wizard, Body Scan, Sanctuary Journal, PanicSOS) | `src/pages/ToolsPage.jsx` | `/tools` | **Developer 1** |
| **6** | `community.html` | Moderated peer circles and discussion boards | Topic circle filters, anonymous pseudonym generator, comment reply threads, safeguarding flagging, community rules modal | `src/pages/CommunityPage.jsx` | `/community` | **Developer 1** |
| **7** | `dashboard.html` | User dashboard & journey tracker | Assessment score trends, upcoming session cards, quick mood check-in widget, saved reflections, listener reconnect | `src/pages/DashboardPage.jsx` | `/dashboard` | **Developer 1** |
| **8** | `plans.html` | Membership tiers & institutional sponsorship | Pricing comparison matrix (Free Sanctuary vs. Care Membership), student institutional sponsorship details, FAQ accordion expanders, checkout CTA | `src/pages/PlansPage.jsx` | `/plans` | **Developer 1** |
| **9** | `register.html` | Dual-onboarding portal for seekers & listeners | Role switch query (`?role=seeker` vs `?role=provider`), multi-step registration forms, age gate & parental consent validation, anonymous session generation | `src/pages/RegisterPage.jsx` | `/register` | **Developer 2** |
| **10** | `client_panel.html` | Client care management & notes vault | Active listener matches, session notes vault, end-to-end key generation, privacy anonymization toggle, panic exit button | `src/pages/ClientPanelPage.jsx` | `/client-panel` | **Developer 2** |
| **11** | `listener_portal.html` | Support listener workspace & incoming queue | Listener online/busy availability toggle, real-time incoming chat queue, session notes input, supervisor escalation trigger button, training tracker | `src/pages/ListenerPortalPage.jsx` | `/listener-portal` | **Developer 2** |
| **12** | `video-call.html` | Live tele-support voice & video session room | WebRTC camera/microphone access controls, media stream viewport, audio mute / video pause buttons, live session timer, emergency call terminate & crisis redirect | `src/pages/VideoCallPage.jsx` | `/video-call` | **Developer 2** |
| **13** | `safety.html` | Urgent crisis resources & helpline directory | One-touch emergency call links (KIRAN, Tele-MANAS, AASRA, Vandrevala), 24/7 helpline cards, grounding exercise shortcut, crisis safeguarding notices | `src/pages/SafetyPage.jsx` | `/safety` | **Developer 2** |
| **14** | `rules.html` | Terms, conditions & sanctuary code of conduct | 12-section legal policy, interactive table of contents jump links, sticky navigation, print media styles, warning disclaimer boxes | `src/pages/RulesPage.jsx` | `/rules` | **Developer 2** |
| **15** | `500.html` | Resilient server error sanctuary page | Friendly calming illustration and copy, automatic server health-check polling, manual refresh button, client connectivity status indicator | `src/pages/ServerErrorPage.jsx` | `/error-500` | **Developer 2** |
| **16** | `404.html` | Custom 404 missing page route | "Path Not Found" illustration, browser history back button, direct navigation shortcuts to Home, Support, and Tools | `src/pages/NotFoundPage.jsx` | `*` (Catch-all) | **Developer 2** |

---

## 3. Developer Work Distribution Summary

### Developer 1 (User Experience & Care Intake)
- **Files Assigned:**
  1. `src/pages/HomePage.jsx` (from `index.html` / `index.original.html`)
  2. `src/pages/AssessmentPage.jsx` (from `assessment.html`)
  3. `src/pages/SupportPage.jsx` (from `support.html`)
  4. `src/pages/ChatPage.jsx` (from `chat.html`)
  5. `src/pages/ToolsPage.jsx` (from `tools.html`)
  6. `src/pages/CommunityPage.jsx` (from `community.html`)
  7. `src/pages/DashboardPage.jsx` (from `dashboard.html`)
  8. `src/pages/PlansPage.jsx` (from `plans.html`)
- **Primary Focus:** Public marketing landing, assessment wizard, support matching, interactive chat UI, and interactive wellbeing tools.

### Developer 2 (Onboarding, Portals, Media & Platform Safety)
- **Files Assigned:**
  9. `src/pages/RegisterPage.jsx` (from `register.html`)
  10. `src/pages/ClientPanelPage.jsx` (from `client_panel.html`)
  11. `src/pages/ListenerPortalPage.jsx` (from `listener_portal.html`)
  12. `src/pages/VideoCallPage.jsx` (from `video-call.html`)
  13. `src/pages/SafetyPage.jsx` (from `safety.html`)
  14. `src/pages/RulesPage.jsx` (from `rules.html`)
  15. `src/pages/ServerErrorPage.jsx` (from `500.html`)
  16. `src/pages/NotFoundPage.jsx` (from `404.html`)
- **Primary Focus:** Seeker & listener registration, client care panel, listener portal console, WebRTC video calling interface, crisis emergency resources, terms & safety policies, and HTTP error fallback screens.

---

## 4. Shared Safety & Git Guidelines for Developers

1. **Work in Assigned Files Only:**
   - Developer 1 touches only files in `src/pages/` belonging to items 1–8.
   - Developer 2 touches only files in `src/pages/` belonging to items 9–16.
2. **Zero Modification to Infrastructure Without Alignment:**
   - Do not edit `src/components/layout/*`, `src/styles/*`, or `vite.config.mjs` unless agreed with the Architect.
3. **Commit Regularly:**
   - Commit changes per page migration (e.g., `feat(dev1): migrate assessment page to React`).
4. **Verification:**
   - Run `npm run build` locally before pushing to ensure zero build breakages on the shared `main` branch.
