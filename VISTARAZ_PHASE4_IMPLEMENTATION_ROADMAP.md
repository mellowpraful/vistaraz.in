# VISTARAZ — PHASE 4: IMPLEMENTATION ROADMAP
## Human Peer Support & Intelligent Matching Infrastructure

**Platform:** Vistaraz (https://vistaraz.in)  
**Technology Baseline:** React 19, Vite, Node.js, Express 5, Better Auth, Neon Serverless PostgreSQL  
**Active Development Branch:** `Dev`  
**Status:** In Progress — Phase 4 Execution

---

## 1. Executive Summary & Core Product Journey

Phase 4 establishes Vistaraz's core human peer-support and intelligent matching infrastructure. It connects individuals seeking emotional wellbeing support with trained, verified, and available peer listeners within clear ethical, non-clinical, and safeguarding boundaries.

The implementation strictly maintains Vistaraz's central journey:
$$\text{Understand Yourself} \longrightarrow \text{Choose Privacy} \longrightarrow \text{Get Personalized Support} \longrightarrow \text{Connect with Humans} \longrightarrow \text{Access Professional Care When Needed}$$

---

## 2. Technical Architecture & Module Structure

The backend is modularized under `backend/src/modules/` alongside existing core infrastructure:

```text
backend/src/
  modules/
    supporters/          # Listener profile, training, and operational capacity
    availability/        # Working hours, status toggles, concurrency tracking
    support-requests/    # Support intake, preference specification, age-band validation
    matching/            # Hard eligibility filtering, scoring, atomic offer queue
    assignments/         # Concurrency-safe assignments and state transitions
    sessions/            # Session lifecycle (scheduled, active, completed, cancelled)
    messaging/           # Private, encrypted session text messaging
    voice/               # WebRTC signaling, STUN/TURN, ephemeral session tokens
    safeguarding/        # Age-band gates (15–17 lock), crisis routing, incident reports
    feedback/            # Post-session mutual ratings and helpfulness reviews
    notifications/       # In-app notification dispatcher
```

---

## 3. Database Schema Blueprint (`009_create_peer_support_infrastructure.sql`)

Building additively on the existing 17 NeonDB tables, Migration 009 establishes:

1. **`helper_profiles` Enhancements**:
   - `display_alias` VARCHAR(80)
   - `availability_status` VARCHAR(20) ('offline', 'available', 'busy', 'paused')
   - `max_active_sessions` INTEGER (1 to 5)
   - `training_status` VARCHAR(30) ('not_started', 'in_progress', 'completed')
   - `safeguarding_approved` BOOLEAN
   - `supported_age_bands` TEXT[] ('18-20', '21-25')
   - `supported_categories` TEXT[]
   - `supported_modes` TEXT[] ('text', 'voice')
   - `code_of_conduct_accepted_at` TIMESTAMPTZ

2. **`support_requests` Enhancements**:
   - `preferred_language` VARCHAR(10)
   - `communication_mode` VARCHAR(20) ('text', 'voice', 'both')
   - `preferred_time_start` & `preferred_time_end` TIMESTAMPTZ
   - `age_band` VARCHAR(20) ('15-17', '18-20', '21-25')
   - `privacy_mode` VARCHAR(20) ('private', 'anonymous')

3. **`match_candidates`**:
   - `request_id` (FK to support_requests)
   - `supporter_id` (FK to helper_profiles)
   - `match_score` NUMERIC(5,2)
   - `offer_status` ('pending', 'offered', 'accepted', 'declined', 'expired')
   - `expires_at` TIMESTAMPTZ

4. **`support_assignments`**:
   - Unique `request_id` constraint (strictly one active assignment per request)
   - `supporter_id`, `seeker_user_id`
   - `assignment_status` ('accepted', 'active', 'ended', 'cancelled', 'escalated')

5. **`session_messages`**:
   - `session_id`, `sender_user_id`, `message_body` (1-5000 chars), `is_read`, timestamps

6. **`voice_rooms`**:
   - `session_id` (unique), `provider_room_id`, `room_status`, ephemeral credentials

7. **`session_feedback`**:
   - Unique per `(session_id, submitted_by)`

8. **`support_reports` & `safeguarding_cases`**:
   - Restricted incident tracking, role-gated to administrative & safeguarding leads

---

## 4. Phase-by-Phase Implementation Track

| Phase | Description | Deliverables | Status |
| :--- | :--- | :--- | :--- |
| **Phase 4A** | Foundation & Additive Schema | Migration 009, models, DB constraints, audit logs | 🔄 In Progress |
| **Phase 4B** | Listener Onboarding & Verification | Application flow, training modules, admin approval, availability | ⏳ Queued |
| **Phase 4C** | Intelligent Matching Engine | Eligibility filters, weighted scoring, offer dispatch, atomic assignment | ⏳ Queued |
| **Phase 4D** | Private Text Support | Session message persistence, REST API, real-time polling/SSE | ⏳ Queued |
| **Phase 4E** | Voice Support Infrastructure | WebRTC signaling endpoints, ephemeral token generation, voice rooms | ⏳ Queued |
| **Phase 4F** | Safeguarding & Crisis Pathways | Age 15–17 protection gate, crisis intervention routing, incident reports | ⏳ Queued |
| **Phase 4G** | Testing, Verification & Pilot | Unit/Integration tests, concurrency simulation, regression validation | ⏳ Queued |
