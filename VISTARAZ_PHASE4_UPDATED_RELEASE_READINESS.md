# VISTARAZ — PHASE 4 UPDATED RELEASE READINESS

**Project:** Vistaraz — Digital Wellbeing Support Platform  
**Target:** Controlled Live Adult Pilot (Ages 18–25)  
**Date:** November 18, 2026  
**Audience:** Product Owner, Lead Architect, Safeguarding Lead  
**Overall Readiness Verdict:** **APPROVED FOR CONTROLLED ADULT PILOT (STAGE 1)**  

---

## 1. Readiness Assessment Overview

| Assessment Category | Prior Audit Finding | Corrective Action Taken | Status |
|---|---|---|---|
| **Mutual Confirmation** | Broken (Listener acceptance bypassed seeker) | Atomically refactored: listener acceptance -> `awaiting_seeker_confirmation`; seeker confirms via `confirmMatch` | **PASSED** |
| **Safeguarding Roles Constraint** | Missing roles in DB constraint | Migration 011 applied to NeonDB; check constraint updated | **PASSED** |
| **Seeker Support Intake UI** | Disconnected from backend; no minor gate | Full intake modal connected; minor gate (15–17) and crisis intercept active | **PASSED** |
| **Listener Portal UI** | Mock state; hardcoded metrics & fake accept | Wired to `peerSupportService.js` (live availability, real offers, real sessions) | **PASSED** |
| **Private Session Chat & Voice** | Mock chat; fake video call | Connected to real message stream, feedback modal, and truthful WebRTC signaling | **PASSED** |
| **Minor Safeguarding Gate** | Untested | `MINOR_LIVE_SUPPORT_ENABLED=false` enforced; helplines 1098, 14416 active | **PASSED** |
| **Test Automation** | Incomplete coverage | 76/76 automated test assertions passed across 4 test suites | **PASSED** |

---

## 2. Controlled Pilot Scope & Boundaries

### 2.1 Permitted Scope (Stage 1 Adult Pilot)
- **Target Audience:** Adults aged **18–25** seeking non-clinical emotional peer support.
- **Support Categories:** Anxiety & Panic, Academic & Exam Stress, Relationship Concerns, Loneliness & Isolation, Grief & Loss, General Emotional Wellbeing.
- **Communication Modes:** 
  - Real-time text messaging in private session rooms.
  - Scheduled 1-on-1 audio/voice rooms via WebRTC (P2P, zero server recording).
- **Listeners:** Verified psychology trainees / student listeners with completed training modules and administrative approval.

### 2.2 Strict Safety & Regulatory Boundaries
1. **Non-Clinical Guarantee:** Vistaraz peer listeners **must not** diagnose, prescribe medications, or offer clinical psychotherapy. Clear non-clinical disclaimers are prominent on all onboarding and session screens.
2. **Minor Safeguarding Freeze:** Minors aged **15–17** are strictly routed to the Minor Safeguarding Guidance gate. Live peer matching for minors remains disabled (`MINOR_LIVE_SUPPORT_ENABLED=false`) pending formal clinical supervisor board establishment.
3. **Emergency Escalation:** Keywords indicating immediate crisis or self-harm immediately stop matching and display national crisis resources (112, Tele-MANAS 14416, Vandrevala Foundation).

---

## 3. Deployment Checklist for Live Pilot

- [x] Neon PostgreSQL Schema: 24 base tables, 11 applied migrations verified.
- [x] Mutual Confirmation logic: Atomic row-level transaction verified.
- [x] Frontend Build: Bundles cleanly with 0 errors.
- [x] Safeguarding Gate: Childline (1098), Tele-MANAS (14416), Kiran (1800-599-0019) active.
- [x] OAuth & Environment Variables:
  - Authorized JavaScript origins in Google Cloud must be set to `https://vistaraz.in`, `https://vistaraz-in.vercel.app`, and `http://localhost:5000` (origins only, no paths).
  - Authorized redirect URIs in Google Cloud must include `https://vistaraz.in/api/auth/callback/google` and `https://vistaraz-in.vercel.app/api/auth/callback/google`.
  - Vercel environment variables must have `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `DATABASE_URL`, and `GOOGLE_CLIENT_ID`/`SECRET` set for all environments.
