# VISTARAZ — PHASE 4: API SPECIFICATION & INTEGRATION GUIDE

**Platform:** Vistaraz Human Peer Support & Intelligent Matching Infrastructure  
**Version:** 4.0.0-beta  
**Environment:** Development & Production (Neon PostgreSQL + Node.js Express 5 + Better Auth)  
**Base URL:** `/api`  

---

## 1. Overview & Authentication
All peer support endpoints require authentication through Better Auth session cookies (`better-auth.session_token` or `__Secure-better-auth.session_token`).
Requests return JSON bodies and standard HTTP status codes:
- `200 OK` / `201 Created`: Request succeeded
- `400 Bad Request`: Validation failure or schema violation
- `401 Unauthorized`: Unauthenticated / missing session
- `403 Forbidden`: RBAC authorization failure or user-to-user IDOR access block
- `404 Not Found`: Resource does not exist
- `409 Conflict`: Concurrency conflict (e.g. duplicate assignment or conflicting offer status)
- `422 Unprocessable Entity`: Crisis or youth safeguarding boundary violation

---

## 2. Supporter & Availability Endpoints (`/api/supporters`, `/api/listeners`)

### `GET /api/supporters/profile`
Retrieve the authenticated supporter's profile, verification status, and training readiness.
- **Authorization:** `helper` or `admin`
- **Response 200:**
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "user_id": "uuid",
      "display_name": "Sanctuary Listener",
      "verification_status": "approved",
      "is_available": true,
      "max_concurrent_sessions": 2,
      "active_sessions_count": 0,
      "languages": ["en", "hi"],
      "categories": ["stress", "anxiety", "loneliness"],
      "preferred_modes": ["chat", "scheduled_voice"],
      "training_completed": true,
      "readiness_status": "ready"
    }
  }
  ```

### `PATCH /api/supporters/availability`
Update current live availability and toggle online/offline state.
- **Authorization:** `helper`
- **Request Body:**
  ```json
  {
    "is_available": true,
    "max_concurrent_sessions": 2
  }
  ```
- **Response 200:** Updated availability record.

### `GET /api/supporters/offers` / `GET /api/listeners/offers`
Fetch active dispatch offers awaiting supporter decision.
- **Authorization:** `helper`
- **Response 200:**
  ```json
  {
    "success": true,
    "data": [
      {
        "candidate_id": "uuid",
        "request_id": "uuid",
        "category": "stress",
        "preferred_language": "hi",
        "preferred_mode": "chat",
        "score": 90,
        "expires_at": "2026-11-17T18:17:00.000Z"
      }
    ]
  }
  ```
  *(Note: Privacy isolated — Zero seeker PII leaked).*

### `POST /api/supporters/offers/:id/accept`
Accept a match candidate offer.
- **Authorization:** Assigned `helper`
- **Response 200:** Sets candidate offer status to `listener_accepted` and transitions support request to `awaiting_seeker_confirmation`.

### `POST /api/supporters/offers/:id/decline`
Decline an offer. Automatically triggers the matching sweep to dispatch the offer to the next ranked candidate.
- **Authorization:** Assigned `helper`
- **Response 200:** Offer updated to `declined`, sweep executed.

---

## 3. Support Requests & Matching Endpoints (`/api/support-requests`)

### `POST /api/support-requests`
Create a support intake request.
- **Authorization:** `user` (support seeker)
- **Request Body:**
  ```json
  {
    "category": "anxiety",
    "notes": "Feeling overwhelmed with college exams",
    "preferred_language": "en",
    "preferred_mode": "chat",
    "age_band": "18_25",
    "topics": ["academics", "overthinking"]
  }
  ```
- **Safety Gate Responses:**
  - **Age 15–17 Holding Gate (422):**
    ```json
    {
      "success": false,
      "code": "YOUTH_SAFEGUARDING_HOLD",
      "message": "Direct peer matching is held for ages 15–17 in accordance with safety guidelines.",
      "resources": {
        "tele_manas": "14416",
        "kiran": "1800-599-0019",
        "childline": "1098"
      }
    }
    ```
  - **Crisis Gate Intercept (422):**
    ```json
    {
      "success": false,
      "code": "CRISIS_INTERCEPTED",
      "message": "Crisis indicators detected. Immediate non-clinical safety response initiated.",
      "emergency_contacts": {
        "tele_manas": "14416",
        "vandrevala": "+919999666555",
        "emergency": "112"
      }
    }
    ```
- **Success Response 201:**
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "status": "matching",
      "category": "anxiety",
      "preferred_language": "en",
      "created_at": "timestamp"
    }
  }
  ```

### `POST /api/support-requests/:id/confirm-match`
Mutual confirmation endpoint. Seeker confirms or declines an accepted peer listener offer.
- **Authorization:** Request owner (`seeker`)
- **Request Body:**
  ```json
  {
    "candidate_id": "uuid",
    "decision": "accept"
  }
  ```
- **Response 200:**
  ```json
  {
    "success": true,
    "status": "confirmed",
    "session": {
      "id": "uuid",
      "status": "scheduled",
      "supporter_id": "uuid"
    }
  }
  ```

---

## 4. Sessions & Communication Endpoints (`/api/sessions`)

### `GET /api/sessions/:id`
Fetch session details and state. Strict IDOR protection ensures only assigned seeker or supporter can access.

### `GET /api/sessions/:id/messages`
Retrieve encrypted session text messages.
- **Response 200:** Array of message objects with sequence numbers, timestamps, and sender aliases.

### `POST /api/sessions/:id/messages`
Send a private message within an active session.
- **Validation:** 1–5,000 characters. Session must be in `scheduled` or `in_progress` status.

### `POST /api/sessions/:id/voice/schedule`
Schedule a voice session with confirmed future timestamp.
- **Request Body:**
  ```json
  {
    "scheduled_time": "2026-11-18T18:00:00.000Z"
  }
  ```

### `POST /api/sessions/:id/voice/join-token`
Issue ephemeral WebRTC credentials and STUN/TURN server configuration for an authorized scheduled voice room.
- **Security:** Tokens expire after room lifespan; call recording strictly disabled by default.

### `POST /api/sessions/:id/end`
Terminate the active session. Transitions status to `completed` and unlocks supporter capacity.

### `POST /api/sessions/:id/feedback`
Submit post-session rating (1–5), helpfulness score, and optional confidential feedback.

### `POST /api/sessions/:id/report`
File an incident or safeguarding violation report directly to the administrative trust & safety queue.
