# VISTARAZ — PHASE 2: IMPLEMENTATION ROADMAP & PRODUCT HARDENING
**Target Website:** https://vistaraz.in  
**Branch:** `Dev` (Development & Implementation Branch)  
**Date:** November 15, 2026  
**Auditor & Architect:** Senior Full-Stack Architect, Security Engineer & QA Lead (Antigravity)  
**Reference Document:** `VISTARAZ_COMPLETE_WEBSITE_AUDIT.md`

---

## 1. ARCHITECTURAL BASELINE & GUIDING PRINCIPLES

1. **Architecture Preservation:**
   - Frontend: React 19 + Vite (Single Page Application)
   - Backend: Node.js + Express 5
   - Auth & Session: Better Auth with PostgreSQL adapter
   - Database: Neon Serverless PostgreSQL with migration runner
   - Hosting: Vercel (Frontend static assets + Serverless `/api/*` handler)
2. **Absolute Transparency for Mental Health Safety:**
   - Never simulate or fake medical, clinical, or peer support.
   - If a feature is in active development (Live Chat, Video consultations, Clinician booking), clearly and honestly state it is "Coming Soon in Phase 2 / Beta Waitlist".
   - Always prioritize crisis safeguarding (direct links to verified 24/7 Indian crisis lines: KIRAN `1800-599-0019`, Tele-MANAS `14416`, Vandrevala `+91 9999 666 555`, and Emergency `112`).
3. **Free Community Beta Policy:**
   - Eliminate raw unencrypted credit card capture immediately.
   - Vistaraz will operate as a **100% Free Public Beta**. All available self-help tools, assessments, and community features require zero payment.
4. **Git Branch Discipline:**
   - All commits and pushes strictly target branch `Dev` (`git push origin HEAD:Dev`).
   - Production branch `main` remains protected and untouched.

---

## 2. COMPREHENSIVE ISSUE-BY-ISSUE ROADMAP MATRIX

### ISSUE 1: `BUG-CRIT-001` — Fake Clinician Consultation Booking
- **Current Condition:** On `/support`, clicking "Book Consultation" shows a green confirmation modal claiming a session is scheduled with fictional doctors (Dr. Rhea Mehta, etc.), but no API request is sent, no record is created in `support_sessions`, and no clinician is notified.
- **Root Cause:** Hardcoded mock clinician array in `SupportPage.jsx` and client-side `setBookingSuccess(true)` state toggle without backend integration.
- **Proposed Solution:**
  1. Remove the simulated booking success state and fake confirmation dialog.
  2. Clearly mark clinical consultations as *"Professional Care Network (Launching Soon)"*.
  3. Provide an honest, compassionate notification signup / waitlist modal for users seeking professional therapy.
  4. Display prominent referrals to verified national mental health helplines (Tele-MANAS, NIMHANS, Vandrevala Foundation) for immediate clinical needs.
  5. Remove fictional clinician personas and stock photos presented as active doctors.
- **Files Affected:** `frontend/src/pages/SupportPage.jsx`, `frontend/src/pages/SupportPage.css`
- **API Changes:** None required in Beta (consultation booking disabled until clinician onboarding).
- **Database Changes:** None.
- **Security & Ethical Considerations:** Eliminates severe risk of a user in psychological distress believing they have a doctor appointment when none exists.
- **Testing Requirements:** Verify clicking consultation options shows honest "Launching in Phase 2" modal with helpline alternatives. Zero fake confirmation messages.

---

### ISSUE 2: `BUG-CRIT-002` — Insecure Mock Payment Collection on `/plans`
- **Current Condition:** On `/plans`, checkout modal prompts for Card Number, Expiry, CVV, and UPI ID into plain component state and fakes a successful payment after 1.2s.
- **Root Cause:** Mock payment handler `handleProcessPayment` with `setTimeout` and unencrypted state fields, violating RBI/PCI-DSS standards.
- **Proposed Solution:**
  1. Remove all raw credit card, CVV, and expiry input fields from `PlansPage.jsx`.
  2. Update `/plans` to introduce the **"Vistaraz Free Community Beta"**: all core features (Wellbeing Tools, Soundscapes, Assessments, Community Circles) are 100% free for all youth during the open beta.
  3. Display planned future tiers (Silver, Gold, Platinum) purely as informational previews with a *"Free During Community Beta"* badge and an "Activate Free Access" action.
  4. Ensure zero financial credentials ever enter application state or network payloads.
- **Files Affected:** `frontend/src/pages/PlansPage.jsx`, `frontend/src/pages/PlansPage.css`
- **API Changes:** None.
- **Database Changes:** None.
- **Security Considerations:** Full elimination of PCI-DSS regulatory violation and security liability.
- **Testing Requirements:** Verify no credit card or CVV inputs exist anywhere on `/plans`. Ensure clicking tier buttons activates free beta access.

---

### ISSUE 3: `BUG-HIGH-004` — Helper Application Submission Disconnected from Database
- **Current Condition:** On `/helper-application`, submitting background qualifications only mutates React context memory (`updateUser()`). No network request is dispatched and data is lost on page refresh.
- **Root Cause:** Missing backend endpoint for updating `helper_profiles` in `userRoutes.js` and missing API call in `HelperApplicationPage.jsx`.
- **Proposed Solution:**
  1. Add endpoint `PUT /api/users/me/helper-profile` (or `POST /api/users/me/helper-application`) in `userRoutes.js`.
  2. Implement `updateHelperProfile` in `backend/src/controllers/profileController.js`:
     - Extracts `req.user.id` from trusted Better Auth session.
     - Validates qualifications, statement, and languages server-side.
     - Performs an `INSERT ... ON CONFLICT (user_id) DO UPDATE` into the existing `helper_profiles` table.
     - Strictly prevents the user from altering their own `verification_status` (remains `'pending'`).
  3. Update `HelperApplicationPage.jsx` to fetch existing saved helper profile on mount and submit real data via `authService.js` / `fetch`.
  4. Ensure submitted details display in the Admin Dashboard (`/admin/dashboard` under Listener Applications).
- **Files Affected:**
  - `backend/src/routes/userRoutes.js`
  - `backend/src/controllers/profileController.js`
  - `frontend/src/services/authService.js`
  - `frontend/src/pages/HelperApplicationPage.jsx`
- **API Changes:** Add `GET /api/users/me/helper-profile` and `PUT /api/users/me/helper-profile`.
- **Database Changes:** None (uses existing `helper_profiles` table from Migration 003).
- **Security Considerations:** Enforces server-side authentication and prevents self-escalation of verification status.
- **Testing Requirements:** Submit application, refresh page, verify data reloads accurately. Verify submission appears in NeonDB and admin dashboard.

---

### ISSUE 4: `BUG-HIGH-003` — Community Circles Posts Non-Persistent
- **Current Condition:** Posts, likes, and comments on `/community` only exist in local component state (`INITIAL_POSTS`) and disappear on browser refresh.
- **Root Cause:** No database tables, backend controllers, or API endpoints exist for community posts.
- **Proposed Solution (Beta Implementation):**
  1. Create Migration `008_create_community_tables.sql`:
     - `community_posts` (id, user_id, alias, avatar, topic, title, body, created_at)
     - `community_likes` (id, post_id, user_id, created_at, UNIQUE(post_id, user_id))
     - `community_comments` (id, post_id, user_id, author_alias, text, created_at)
  2. Implement `communityController.js` and `communityRoutes.js`:
     - `GET /api/community/posts` (public / authenticated, pagination, topic filter)
     - `POST /api/community/posts` (authenticated, content validation, profanity/crisis regex check)
     - `POST /api/community/posts/:id/like` (authenticated, toggle like)
     - `POST /api/community/posts/:id/comments` (authenticated, reply creation)
  3. Wire `CommunityPage.jsx` to fetch and submit real data via persistent API endpoints.
  4. Include a Safeguarding Notice: all posts are anonymous (showing user's chosen alias/avatar) and monitored by automated safety filters.
- **Files Affected:**
  - `backend/migrations/008_create_community_tables.sql`
  - `backend/src/routes/communityRoutes.js`
  - `backend/src/controllers/communityController.js`
  - `backend/src/routes/index.js`
  - `frontend/src/pages/CommunityPage.jsx`
  - `frontend/src/services/communityService.js`
- **Database Changes:** Add `community_posts`, `community_likes`, `community_comments` tables.
- **Security & Safeguarding:** Nickname-first anonymity (never expose real name or user ID to other seekers); content validation against self-harm / crisis keywords.
- **Testing Requirements:** Create a post, refresh browser, verify post persists. Like post, refresh, verify like status persists.

---

### ISSUE 5: `BUG-HIGH-005` — Password Reset Flow
- **Current Condition:** Clicking "Forgot password?" on `/login` displays an informational message that email backend is disconnected.
- **Root Cause:** No email transport configured for Better Auth password recovery.
- **Proposed Solution:**
  1. For production resilience without requiring paid third-party email API credentials in the repository, implement a clean, genuine password reset request API in `authController.js` / Better Auth.
  2. Implement an in-app password reset / recovery gateway: allow authenticated users to change passwords from their profile, and provide a clear, user-friendly password reset dialog with honest status handling.
- **Files Affected:** `frontend/src/pages/LoginPage.jsx`, `backend/src/controllers/authController.js`
- **Testing Requirements:** Verify password reset modal behavior and error handling.

---

### ISSUE 6: `BUG-MED-006` — Missing `robots.txt` & `sitemap.xml`
- **Current Condition:** Requests to `/robots.txt` and `/sitemap.xml` return `text/html` (the SPA `index.html`), causing crawler XML parsing failures.
- **Root Cause:** Files missing from `frontend/public/` directory, caught by Vercel's rewrite rule.
- **Proposed Solution:**
  1. Create `frontend/public/robots.txt` with correct user-agent rules and Sitemap directive.
  2. Create `frontend/public/sitemap.xml` with canonical routes (`/`, `/tools`, `/assessment`, `/support`, `/safety`, `/rules`, `/plans`).
  3. Create `frontend/public/favicon.ico`.
- **Files Affected:** `frontend/public/robots.txt`, `frontend/public/sitemap.xml`, `frontend/public/favicon.ico`
- **Testing Requirements:** Curl `/robots.txt` and `/sitemap.xml`; verify HTTP 200 with `text/plain` and `application/xml` content types.

---

### ISSUE 7: `BUG-MED-007` — Dead Render-Blocking FontAwesome in `index.html`
- **Current Condition:** `index.html` loads FontAwesome 6.4.0 from CDN (~100KB), but no components use FontAwesome icons (all use `lucide-react`).
- **Root Cause:** Legacy template leftover.
- **Proposed Solution:** Remove the `<link rel="stylesheet" href="...font-awesome...">` tag from `frontend/index.html`.
- **Files Affected:** `frontend/index.html`
- **Testing Requirements:** Verify application icons render cleanly and build passes without FontAwesome.

---

### ISSUE 8: `BUG-MED-008` — Broken Frontend Test Scripts
- **Current Condition:** `verify-auth-flows.mjs` crashes on `window.location.hostname`. `test-error-handling.js` crashes on CommonJS `require()` in an ES module.
- **Root Cause:** Missing Node.js environment polyfill for `window.location` and mixed module syntax.
- **Proposed Solution:**
  1. Update `frontend/scripts/verify-auth-flows.mjs` to define `globalThis.window.location = { hostname: 'localhost' }`.
  2. Convert `frontend/scripts/test-error-handling.js` and `test-cache.js` to standard ES module syntax (`import`).
- **Files Affected:** `frontend/scripts/verify-auth-flows.mjs`, `frontend/scripts/test-error-handling.js`
- **Testing Requirements:** Run `npm.cmd run test:auth` and verify clean execution.

---

### ISSUE 9: `BUG-MED-009` — Rate Limiter Hardening for Serverless
- **Current Condition:** In-memory `Map` in `backend/src/middleware/rateLimiter.js` resets on lambda cold starts.
- **Proposed Solution:** Harden `rateLimiter.js` with fallback safe sliding-window handling and ensure error handling is resilient across serverless instances.
- **Files Affected:** `backend/src/middleware/rateLimiter.js`

---

### ISSUE 10: `BUG-LOW-010` — "How it works" Hero Button Destination
- **Current Condition:** "How it works" button on `/` jumps directly into Question 1 of the assessment (`/assessment`).
- **Root Cause:** Hardcoded `to="/assessment"` in `HomePage.jsx:124`.
- **Proposed Solution:** Connect "How it works" to a dedicated explanatory workflow section on `/how-it-works` or smooth scroll to the 4-step journey cards on the homepage.
- **Files Affected:** `frontend/src/pages/HomePage.jsx`

---

### ISSUE 11: Missing Informational Pages
- **Current Condition:** Routes `/about`, `/how-it-works`, `/contact`, `/faq`, `/privacy`, `/terms` do not exist and trigger 404.
- **Proposed Solution:**
  1. Create `AboutPage.jsx` (`/about`): Mission, youth-first approach, privacy values.
  2. Create `HowItWorksPage.jsx` (`/how-it-works`): 4-step sanctuary journey walkthrough.
  3. Create `ContactPage.jsx` (`/contact`): Genuine team contact info, emergency notice, feedback form.
  4. Create `FaqPage.jsx` (`/faq`): Confidentiality, peer support vs therapy, pricing (free beta).
  5. Add redirect aliases `/terms` -> `/rules#terms` and `/privacy` -> `/rules#privacy`.
  6. Register new routes in `AppRoutes.jsx` and add links in `Navbar.jsx` / `Footer.jsx`.
- **Files Affected:**
  - `frontend/src/pages/AboutPage.jsx` & `.css`
  - `frontend/src/pages/HowItWorksPage.jsx` & `.css`
  - `frontend/src/pages/ContactPage.jsx` & `.css`
  - `frontend/src/pages/FaqPage.jsx` & `.css`
  - `frontend/src/routes/AppRoutes.jsx`
  - `frontend/src/components/layout/Navbar.jsx`
  - `frontend/src/components/layout/Footer.jsx`

---

## 3. IMPLEMENTATION PHASING & ORDER OF EXECUTION

```
[Phase A: Safety Fixes]
   ├── A1. Fix Fake Clinician Booking on /support (BUG-CRIT-001)
   └── A2. Remove Fake Payment & Establish Free Beta on /plans (BUG-CRIT-002)
          ↓
[Phase B: Backend Connectivity & Persistence]
   ├── B1. Database Migration 008 (Community Tables)
   ├── B2. Persistent Helper Application API & Controller (BUG-HIGH-004)
   ├── B3. Persistent Community Circles CRUD & Validation (BUG-HIGH-003)
   └── B4. Password Reset & Profile Security Dialog (BUG-HIGH-005)
          ↓
[Phase C: Staging Clarity & Honest Product Messaging]
   ├── C1. Transparent "Coming Soon / Phase 2" on /chat
   ├── C2. Transparent "Coming Soon / Phase 2" on /video-call
   ├── C3. Clean Real Empty State on /listener-portal
   └── C4. Honest Support Directory on /support
          ↓
[Phase D: Technical & SEO Fixes]
   ├── D1. Add static robots.txt, sitemap.xml, favicon.ico (BUG-MED-006)
   ├── D2. Remove FontAwesome CDN link from index.html (BUG-MED-007)
   ├── D3. Fix frontend test scripts (BUG-MED-008)
   ├── D4. Fix "How it works" button on / (BUG-LOW-010)
   └── D5. Implement missing pages: /about, /how-it-works, /contact, /faq, /privacy, /terms
          ↓
[Phase E & F: Security Hardening & Preserved Features Verification]
   ├── E1. Verify Better Auth, Seeker Setup, Tools, Sounds, Assessment
   └── F1. Remove hardcoded secret fallbacks and sanitize all API responses
          ↓
[Phase G & H: Testing & Build Verification]
   ├── G1. Full Frontend Production Build Check
   ├── G2. Run Unit & Integration Test Suites
   └── G3. Final QA Audit & Generation of Reports
```

---

## 4. ACCEPTANCE CRITERIA FOR FREE BETA READINESS

1. **Safety:** Zero deceptive or simulated clinical booking confirmations anywhere on the website.
2. **Compliance:** Zero raw payment card or CVV inputs on `/plans`; platform is labeled as Free Community Beta.
3. **Persistence:** Helper application data saves to NeonDB and reloads upon page refresh. Community posts save to database.
4. **Transparency:** Chat and Video sessions are clearly explained as Phase 2 features with active crisis helplines visible.
5. **SEO & Navigation:** `/robots.txt` and `/sitemap.xml` return valid MIME types. All footer and navigation links route to valid pages.
6. **Zero Regressions:** 10-Area Assessment, Box Breathing, Ambient Soundscapes with Volume Slider, Seeker Profile Setup, and Admin Dashboard continue functioning without flaws.
7. **Git Discipline:** All changes committed to branch `Dev` and pushed to `origin/Dev`. `main` remains untouched.
