# VISTARAZ — PHASE 3: APPLICATION SECURITY & AUTHORIZATION REPORT
**System:** https://vistaraz.in  
**Security Lead:** Application Security Engineer & Principal Architect  
**Branch:** `Dev`  
**Date:** November 15, 2026  

---

## 1. THREAT MODEL & SECURITY POSTURE OVERVIEW

Vistaraz is a youth-oriented digital mental wellbeing sanctuary. Security in this application directly protects the psychological safety, privacy, and personal disclosures of vulnerable young seekers. The primary security objectives are:
1. **Zero Leaks of Personal Distress or Session Notes (Confidentiality).**
2. **Strict Role-Based Access Control preventing unauthorized peer or clinical impersonation (Integrity).**
3. **Protection against privilege escalation to the Admin or Verified Listener roles.**
4. **Hardened API endpoints resilient against injection, session hijacking, and CSRF attacks.**

---

## 2. SECURITY DOMAIN EVALUATION

### A. Authentication & Session Security
- **Authentication Engine:** Better Auth v1.7.18.
- **Session Mechanism:** Cryptographically signed session tokens stored in standard server-managed PostgreSQL tables (`session`, `account`, `user`, `verification`).
- **Cookie Attributes:**
  - `HttpOnly`: Enforced. Client-side JavaScript cannot access session tokens.
  - `SameSite=Lax` / `SameSite=None` with `Secure`: Cookies are encrypted in transit over HTTPS.
  - `Path=/`: Scoped appropriately.
- **Token Security in Frontend:** An automated security audit in `verify-auth-flows.mjs` confirmed that **zero** JWT tokens, passwords, or authentication keys are persisted in `localStorage` or `sessionStorage`. Only volatile UI preference keys (e.g. `vistaraz_purpose`) are saved in `sessionStorage`.

### B. Server-Side RBAC & Route Authorization
- **Implementation:** Middleware pipeline in `backend/src/middleware/auth.js`:
  - `requireAuth`: Validates Better Auth session.
  - `requireRole(role)`: Validates that the user's active role satisfies role requirements (`admin`, `professional`, `helper`, `user`).
  - `requireVerifiedListener`: Ensures that a user with role `helper` has `verification_status === 'verified'` before permitting access to the live support queue.
- **Privilege Escalation Defense:**
  - `POST /api/users/declare-role`: When a seeker attempts to self-escalate to `admin` or `professional`, the endpoint strictly returns **HTTP 403 Forbidden**.
  - When a user declares the `helper` role, `verification_status` defaults to `'pending'`. Any user payload attempting to pass `{ verification_status: 'verified' }` or `{ application_status: 'approved' }` is completely ignored by the controller.
  - Only authorized administrators authenticated via `/api/admin/*` can toggle verification status in the database.

### C. Admin Route Protection
- **Endpoints:** `/api/admin/stats`, `/api/admin/seekers`, `/api/admin/listeners/applications`, `/api/admin/interns/applications`, `/api/admin/professionals`, `/api/admin/sessions`, `/api/admin/reports`.
- **RBAC Enforcement:** Protected by `requireRole('admin')`.
- **Automated Verification:** Verified in `backend/test-admin-portal.mjs` (23 assertions passed):
  - Unauthenticated requests: **HTTP 401 Unauthorized**.
  - Logged-in support seekers (`user` role): **HTTP 403 Forbidden**.
  - Logged-in helpers (`helper` role): **HTTP 403 Forbidden**.
  - Legitimate admin session: **HTTP 200 OK**.

### D. Insecure Direct Object References (IDOR) & User Isolation
- **User Dashboard & Sessions:** All queries for user mood check-ins (`/api/users/me/moods`), personal assessment histories (`/api/assessments/latest`), and support sessions (`/api/users/me/sessions`) retrieve the user ID strictly from `req.user.id` extracted from the verified session context.
- **Test Evidence:** In `backend/test-phase3-verification.mjs`, User 2 attempted to read User 1's private mood reflections and support statistics. User 2 received strictly isolated personal data (`userId !== user1.id`). No URL parameters (e.g. `/api/users/123/moods`) are exposed to user manipulation.

### E. Injection & XSS Vulnerability Analysis
- **SQL Injection:**
  - All database queries across all controllers utilize parameterized SQL statements via `@neondatabase/serverless` and `pg.Pool` (e.g. `SELECT * FROM profiles WHERE user_id = $1`).
  - Zero dynamic string concatenation is used in query building.
- **Cross-Site Scripting (XSS):**
  - Frontend relies on React 19 JSX virtual DOM escaping, preventing reflected and stored HTML injections in forum posts and comments.
  - In `backend/src/controllers/communityController.js`, post bodies and titles are typed, length-checked, and stripped of unescaped control sequences.

### F. CORS & CSRF Hardening
- **CORS Architecture (`backend/src/config/cors.js`):**
  - Tightened during Phase 3 to eliminate overly broad wildcard matching.
  - Allowed Origins: `http://localhost:3000`, `http://localhost:5173`, `https://vistaraz.in`, `https://www.vistaraz.in`, and regex `^https:\/\/(?:vistaraz[a-z0-9-]*)\.vercel\.app$`.
  - Credentials: `Access-Control-Allow-Credentials: true` is only sent to strictly matched Vistaraz domains.
- **CSRF Defense:**
  - Better Auth utilizes custom HTTP headers (`Content-Type: application/json`) and `SameSite` cookie protections, neutralizing standard browser form-based CSRF exploits.

### G. Rate Limiting & Secrets Management
- **Rate Limiting:** Better Auth includes built-in rate-limiting on sensitive authentication endpoints (`/sign-in`, `/sign-up`, `/reset-password`). Configured with `advanced.ipAddress.ipAddressHeaders: ['x-forwarded-for', 'x-real-ip']` to ensure accurate IP resolution behind Vercel edge proxies.
- **Secrets Management:**
  - `BETTER_AUTH_SECRET`: Strictly validated at startup in `backend/src/config/env.js`. If missing in production mode (`NODE_ENV === 'production'`), the server immediately throws a fatal exception and refuses to boot.
  - Zero API keys or database connection strings are bundled into frontend client distributions.

---

## 3. SECURITY VERIFICATION SUMMARY

```
┌──────────────────────────────────────┬───────────────────────┬──────────┐
│ Security Control                     │ Verification Method   │ Status   │
├──────────────────────────────────────┼───────────────────────┼──────────┤
│ Better Auth Session Lifecycle        │ Automated E2E Suite   │ PASSED   │
│ Role-Based Access Control (RBAC)     │ Automated 15-Test RBAC│ PASSED   │
│ Admin Portal Route Gating            │ 23 Integration Tests  │ PASSED   │
│ IDOR & User Data Isolation           │ Cross-User E2E Tests  │ PASSED   │
│ Prevention of Self-Verification      │ Integration Injection │ PASSED   │
│ SQL Injection Parameterization       │ Source Code Audit     │ PASSED   │
│ Zero Auth Tokens in LocalStorage     │ Client Storage Audit  │ PASSED   │
│ Strict Domain CORS Regex             │ Configuration Audit   │ PASSED   │
│ Fatal Exit on Missing Prod Secrets   │ Startup Invariant Test│ PASSED   │
└──────────────────────────────────────┴───────────────────────┴──────────┘
```
**Conclusion:** The application security posture satisfies the requirements for a public Free Community Beta.
