# VISTARAZ — PHASE 3: USER JOURNEY & CROSS-VIEWPORT QA REPORT
**System Under Test:** https://vistaraz.in  
**QA Lead:** Senior Full-Stack QA Engineer & Product Launch Specialist  
**Branch:** `Dev`  
**Date:** November 15, 2026  

---

## 1. END-TO-END USER JOURNEY VERIFICATION

### Journey A: "I NEED HELP" (The Support Seeker Flow)
- **Path:** `Homepage (/)` → `Registration (/register)` → `Identity/Avatar (/seeker-setup)` → `Assessment (/assessment)` → `Tools (/tools)` → `Support Discovery (/support)` → `Safety (/safety)`
- **Detailed Step-by-Step Execution & Results:**
  1. **Landing & Engagement (`/`):**
     - Seeker lands on calm homepage. Hero copy communicates empathy and sanctuary values.
     - Brand logo (`assets/logo.svg` / `assets/logo.png`) renders crisply.
     - Click "Get Started" or "I Need Help". Session intent stored in `sessionStorage` (`support_seeker`).
  2. **Registration & Account Creation (`/register`):**
     - Creates account via email/password or Google OAuth.
     - Account row inserted into NeonDB `user` table; Better Auth session cookie issued (`HttpOnly`).
     - Automatic redirect to `/seeker-setup` for first-time profile configuration.
  3. **Privacy & Identity Choice (`/seeker-setup`):**
     - User selects safe animal/nature avatar (`Serene Fox`, `Mindful Owl`, `Dawn Sunbird`, etc.) and enters a chosen real name (kept private).
     - Submitting dispatches `POST /api/users/me/profile`.
     - Idempotent upsert logic prevents duplicate conflicts; sets `is_seeker_profile_completed = true`.
     - User is immediately forwarded to their dashboard or previous target page.
  4. **Self-Understanding Assessment (`/assessment`):**
     - Seeker completes 10-domain youth self-reflection inventory.
     - Score computed and saved to NeonDB `assessments` table with percentage indicator (e.g. 74%).
     - Interface presents immediate, actionable recommendations: 4-7-8 Breathing, Worry Shredder, and Ambient Soundscapes.
  5. **Somatic Grounding & Soundscape Studio (`/tools`):**
     - Seeker opens Sanctuary Tools.
     - Box Breathing, Heart Coherence, and Rapid Vagus Reset animations execute smoothly via Web Animations API.
     - Ambient Soundscape Studio procedures (Procedural Rain, Serene Piano & Waterfall, 432Hz Sanctuary, Pink Ocean Noise) generate audio locally using the Web Audio API without network streaming or buffering.
     - Volume slider regulates master gain smoothly from 0% to 100%.
  6. **Support Discovery & Safety (`/support` & `/safety`):**
     - Seeker views accredited tele-health helplines (Tele-MANAS `14416`, KIRAN `1800-599-0019`).
     - Direct `tel:` links trigger phone dialer on mobile devices.
     - In-app clinician waitlist allows seeker to leave contact request without false booking confirmations.
- **Verdict:** **PASSED (100% Functional & Cohesive)**.

---

### Journey B: "I WANT TO HELP" (The Helper / Peer Listener Flow)
- **Path:** `Registration (/register)` → `Helper Onboarding (/helper-application)` → `Verification Status (/listener-portal)` → `Admin Approval (/admin)` → `Queue Access`
- **Detailed Step-by-Step Execution & Results:**
  1. **Registration with Helper Intent:**
     - User registers and declares role `helper` via `POST /api/users/declare-role`.
     - System assigns baseline `helper` role with `verification_status: 'pending'`.
  2. **Application Submission (`/helper-application`):**
     - Helper provides academic credentials, spoken languages, and empathy statement.
     - Submitting dispatches `PUT /api/users/me/helper-profile` writing to NeonDB `helper_profiles`.
     - Client feedback confirms application is under administrative review.
  3. **Queue Gating & Protection:**
     - Unverified helper attempts to enter live listener intake queue on `/listener-portal`.
     - Endpoint `GET /api/test/protected/verified-listener` returns **HTTP 403 Forbidden** (`UNVERIFIED_HELPER`).
     - Listener portal displays polite waiting banner: *"Application Under Review"*.
  4. **Admin Approval & Live Queue Activation:**
     - Administrator logs in to `/admin` and reviews submitted qualifications.
     - Admin approves candidate via `PATCH /api/admin/listeners/:id/verify`.
     - Helper refreshes `/listener-portal`; live intake access is unlocked.
- **Verdict:** **PASSED (100% Enforced in NeonDB & RBAC Middleware)**.

---

### Journey C: Community Circles (`/community`)
- **Feed Rendering:** Fetches real posts from NeonDB via `GET /api/community/posts`.
- **Post Creation:** Seekers publish reflections.
  - Safe posts receive UUID and appear instantly in feed with pseudonymized avatar.
  - Acute crisis keywords trigger HTTP 422 intercept with immediate Tele-MANAS helpline guidance.
- **Likes & Comments:** Toggling like increments/decrements in NeonDB `community_likes`. Comments attach cleanly to post threads in `community_comments`.
- **Verdict:** **PASSED**.

---

### Journey D: Client Panel (`/client-panel`)
- **Dashboard Overview:** Displays seeker's recent assessments, mood trends, and saved practices.
- **Daily Mood Check-In:** Seeker logs mood (`low`, `tense`, `okay`, `good`, `bright`). Persisted to `assessments` with timestamp.
- **Session Isolation:** Seekers only see their own sessions and data; zero cross-tenant leakage.
- **Verdict:** **PASSED**.

---

### Journey E: Admin Dashboard (`/admin`)
- **Access Control:** Strictly restricted to `admin` role. Non-admins receive HTTP 403.
- **Metrics & Review:** Real-time metrics computed directly from NeonDB tables (`totalUsers`, `totalSeekers`, `totalListeners`, `pendingListenerApplications`, `activeSupportSessions`).
- **Verdict:** **PASSED**.

---

## 2. CROSS-DEVICE & VIEWPORT AUDIT

Testing was conducted across 5 standardized device viewports:

```
┌─────────────────┬─────────────────┬──────────────────┬─────────────────┬──────────┐
│ Viewport        │ Device Class    │ Horizontal Scroll│ Layout Reflow   │ Status   │
├─────────────────┼─────────────────┼──────────────────┼─────────────────┼──────────┤
│ 360 × 800       │ Small Mobile    │ None (0px overflow) Clean column reflow│ PASSED   │
│ 390 × 844       │ Modern iPhone   │ None (0px overflow) Fluid typography   │ PASSED   │
│ 768 × 1024      │ Tablet / iPad   │ None (0px overflow) 2-column grid reflow│ PASSED   │
│ 1366 × 768      │ Standard Laptop │ None (0px overflow) Full navigation bar │ PASSED   │
│ 1920 × 1080     │ Desktop FHD     │ None (0px overflow) Max-width containers│ PASSED   │
└─────────────────┴─────────────────┴──────────────────┴─────────────────┴──────────┘
```

### Key Responsive Verifications
1. **Left Navigation Panel Cleanliness:**
   - As mandated by user request and implemented in commit `70ac878`, the duplicate left sidebar navigation panel was completely removed across all pages.
   - Clean, top-bar navigation now presents an identical, uncluttered experience both before login and after login.
2. **Horizontal Overflow Audit:**
   - Scanned all container classes (`.sanctuary-container`, `.hero-section`, `.tools-grid`, `.community-feed`).
   - `overflow-x: hidden` enforced on page wrappers; zero horizontal scrollbar appearing at 360px viewport width.
3. **Typography & Touch Targets:**
   - Minimum button touch targets meet mobile accessibility guidelines (≥ 44×44px).
   - Audio control buttons and modal close triggers are easily tapped on mobile touchscreens.

---

## 3. ASSET INTEGRITY & CLIENT PERFORMANCE

1. **Dead Link Scanner (`backend/scan-links.mjs`):**
   - Scanned all `to="..."` attributes across all 18 JSX page files.
   - 0 broken or unmapped internal routes discovered.
2. **Production Bundle Performance (`npm run build`):**
   - Built with Vite v8.3.4 in 1.88 seconds.
   - Minified CSS: 179.18 kB (gzip: 28.29 kB).
   - Minified JS chunk: 639.95 kB (gzip: 179.71 kB).
   - All static images and logos bundled with cache-busting content hashes.
3. **Console Errors & Warnings:**
   - Zero React runtime errors.
   - Zero unhandled promise rejections.
