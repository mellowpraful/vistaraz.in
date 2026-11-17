# VISTARAZ — PHASE 4: SECURITY & SAFEGUARDING ARCHITECTURE

**Subject:** Minor Protection, Crisis Handling, IDOR Prevention, and Privacy Guarantees  
**Compliance Standard:** Mental Health Platform Safety & Data Isolation Rules  
**Status:** Implemented & Verified in Test Suite  

---

## 1. Minor Safeguarding & Age-Band Gate

### 1.1 Policy & Architectural Boundary
In compliance with digital mental health safeguarding regulations:
- Unrestricted adult peer matching is **strictly forbidden** for minors.
- Environment variable `MINOR_LIVE_SUPPORT_ENABLED` defaults to `false`.
- When an applicant or seeker indicates age band `15_17`, the system automatically isolates the request.

### 1.2 Enforcement Implementation
In `backend/src/modules/support-requests/request.service.js`:
```javascript
if (age_band === '15_17' && !env.MINOR_LIVE_SUPPORT_ENABLED) {
  // 1. Log safeguarding incident for audit
  // 2. Provision dedicated safeguarding case record in database
  // 3. Return HTTP 422 with designated youth mental health helplines
  return {
    status: 'held_for_safeguarding',
    message: 'Direct peer matching is held for ages 15–17 in accordance with safety guidelines.',
    resources: {
      tele_manas: '14416',
      kiran: '1800-599-0019',
      childline: '1098'
    }
  };
}
```

---

## 2. Imminent Crisis Detection & Protocol

### 2.1 Keyword & Semantic Intercept
The platform maintains a curated non-clinical risk lexicon:
- Self-harm, suicide, severe violence, overdose, or acute medical emergencies.
- Intake notes and request metadata are screened prior to matching dispatch.

### 2.2 Crisis Action Protocol
1. **Immediate Matching Halt:** Request is transitioned to status `crisis_intercepted`. No peer listener is notified.
2. **Seeker Crisis Modal:** Immediate modal display showing round-the-clock national emergency numbers:
   - **Tele-MANAS:** `14416` / `1800-891-4416` (24/7 National Mental Health Helpline)
   - **Vandrevala Foundation:** `+91 9999 666 555` (Crisis Counseling)
   - **National Emergency:** `112`
3. **Audit Log:** An internal safety alert is flagged for the trust & safety team with no public disclosure.

---

## 3. IDOR Prevention & User Data Isolation

### 3.1 Session Authorization Matrix
Access to sessions, messages, feedback, and voice rooms is protected by multi-tier ownership verification in `session.service.js`:
- Only `assignment.seeker_id` OR `assignment.supporter_id` can access session messages.
- Third-party users, unassigned helpers, or arbitrary authenticated users receive immediate `403 Forbidden` errors.
- Verified in automated test suite: `Test 10: IDOR blocked — unassigned listener cannot view or access session`.

### 3.2 Privacy Isolation During Match Dispatch
During match dispatch:
- Supporter offer previews show **only non-identifying parameters**: Category, language, preferred communication mode, and urgency score.
- Seeker display name, real name, email, IP address, and private profile notes are **completely redacted**.
- Verified in automated test suite: `Test 7: Supporter receives offer with clean privacy isolation (zero seeker PII leaked)`.

---

## 4. WebRTC Voice Security & Ephemeral Rooms

1. **No Cold / Unscheduled Calling:** Voice connections require a prior confirmed scheduled booking (`scheduled_time`).
2. **Ephemeral WebRTC Tokens:** Room tokens are generated on demand via `POST /api/sessions/:id/voice/join-token` and expire upon session completion.
3. **No Audio Recording by Default:** Voice streams are strictly peer-to-peer or routed through media relays with call recording disabled by architecture.
4. **Instant End & Emergency Exit:** Either participant can terminate the call instantly via `POST /api/sessions/:id/voice/end` or `POST /api/sessions/:id/end`.
