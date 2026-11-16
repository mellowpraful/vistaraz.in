-- Migration 009: Create Peer Support & Intelligent Matching Infrastructure
-- Extends helper and support tables, establishes matching candidates, concurrency-safe assignments,
-- private session messaging, WebRTC voice rooms, feedback, reporting, and safeguarding.

-- 1. EXTEND HELPER_PROFILES
ALTER TABLE helper_profiles
    ADD COLUMN IF NOT EXISTS display_alias VARCHAR(80),
    ADD COLUMN IF NOT EXISTS availability_status VARCHAR(20) DEFAULT 'offline',
    ADD COLUMN IF NOT EXISTS max_active_sessions INTEGER DEFAULT 1,
    ADD COLUMN IF NOT EXISTS training_status VARCHAR(30) DEFAULT 'not_started',
    ADD COLUMN IF NOT EXISTS safeguarding_approved BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS supported_age_bands TEXT[] DEFAULT ARRAY['18-20', '21-25'],
    ADD COLUMN IF NOT EXISTS supported_categories TEXT[] DEFAULT ARRAY['general_wellbeing', 'stress', 'anxiety', 'loneliness'],
    ADD COLUMN IF NOT EXISTS supported_modes TEXT[] DEFAULT ARRAY['text', 'voice'],
    ADD COLUMN IF NOT EXISTS code_of_conduct_accepted_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS last_availability_updated_at TIMESTAMP WITH TIME ZONE;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_helper_availability_status') THEN
        ALTER TABLE helper_profiles ADD CONSTRAINT chk_helper_availability_status 
            CHECK (availability_status IN ('offline', 'available', 'busy', 'paused'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_helper_max_active_sessions') THEN
        ALTER TABLE helper_profiles ADD CONSTRAINT chk_helper_max_active_sessions 
            CHECK (max_active_sessions BETWEEN 1 AND 5);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_helper_training_status') THEN
        ALTER TABLE helper_profiles ADD CONSTRAINT chk_helper_training_status 
            CHECK (training_status IN ('not_started', 'in_progress', 'completed'));
    END IF;
END $$;

-- 2. EXTEND SUPPORT_REQUESTS
ALTER TABLE support_requests
    ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(10) DEFAULT 'en',
    ADD COLUMN IF NOT EXISTS communication_mode VARCHAR(20) DEFAULT 'text',
    ADD COLUMN IF NOT EXISTS preferred_time_start TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS preferred_time_end TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS age_band VARCHAR(20) DEFAULT '18-20',
    ADD COLUMN IF NOT EXISTS privacy_mode VARCHAR(20) DEFAULT 'private';

DO $$
BEGIN
    ALTER TABLE support_requests DROP CONSTRAINT IF EXISTS support_requests_status_check;
    ALTER TABLE support_requests ADD CONSTRAINT support_requests_status_check
        CHECK (status IN ('open', 'requested', 'safety_check', 'matching', 'offered', 'matched', 'in_progress', 'resolved', 'closed', 'cancelled', 'escalated'));

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_request_communication_mode') THEN
        ALTER TABLE support_requests ADD CONSTRAINT chk_request_communication_mode
            CHECK (communication_mode IN ('text', 'voice', 'both'));
    END IF;
END $$;

-- 3. SUPPORTER TRAINING MODULES TABLE
CREATE TABLE IF NOT EXISTS supporter_training (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supporter_id UUID NOT NULL REFERENCES helper_profiles(id) ON DELETE CASCADE,
    module_id VARCHAR(50) NOT NULL,
    module_title VARCHAR(255) NOT NULL,
    score INTEGER,
    status VARCHAR(30) NOT NULL DEFAULT 'completed' CHECK (status IN ('in_progress', 'completed')),
    completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_supporter_training_module UNIQUE (supporter_id, module_id)
);

-- 4. MATCH CANDIDATES TABLE
CREATE TABLE IF NOT EXISTS match_candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES support_requests(id) ON DELETE CASCADE,
    supporter_id UUID NOT NULL REFERENCES helper_profiles(id) ON DELETE CASCADE,
    match_score NUMERIC(5,2) NOT NULL,
    eligibility_status VARCHAR(20) NOT NULL DEFAULT 'eligible',
    offer_status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (offer_status IN ('pending', 'offered', 'accepted', 'declined', 'expired')),
    offered_at TIMESTAMP WITH TIME ZONE,
    responded_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_match_candidates_req_supporter UNIQUE (request_id, supporter_id)
);

-- 5. SUPPORT ASSIGNMENTS TABLE (Atomic assignment lock)
CREATE TABLE IF NOT EXISTS support_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES support_requests(id) ON DELETE CASCADE,
    supporter_id UUID NOT NULL REFERENCES helper_profiles(id) ON DELETE RESTRICT,
    seeker_user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    assignment_status VARCHAR(30) NOT NULL DEFAULT 'accepted'
        CHECK (assignment_status IN ('accepted', 'active', 'ended', 'cancelled', 'escalated')),
    accepted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_support_assignments_request UNIQUE (request_id)
);

-- 6. EXTEND SUPPORT_SESSIONS
ALTER TABLE support_sessions
    ADD COLUMN IF NOT EXISTS assignment_id UUID REFERENCES support_assignments(id) ON DELETE SET NULL;

-- 7. SESSION MESSAGES TABLE (Private session chat)
CREATE TABLE IF NOT EXISTS session_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES support_sessions(id) ON DELETE CASCADE,
    sender_user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    message_body TEXT NOT NULL CHECK (char_length(message_body) BETWEEN 1 AND 5000),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 8. VOICE ROOMS TABLE (WebRTC room tracking)
CREATE TABLE IF NOT EXISTS voice_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL UNIQUE REFERENCES support_sessions(id) ON DELETE CASCADE,
    provider_room_id VARCHAR(255) NOT NULL,
    room_status VARCHAR(20) NOT NULL DEFAULT 'created'
        CHECK (room_status IN ('created', 'active', 'closed')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP WITH TIME ZONE
);

-- 9. SESSION FEEDBACK TABLE
CREATE TABLE IF NOT EXISTS session_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES support_sessions(id) ON DELETE CASCADE,
    submitted_by TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    rating SMALLINT CHECK (rating BETWEEN 1 AND 5),
    feedback_category VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_session_feedback_session_user UNIQUE (session_id, submitted_by)
);

-- 10. SUPPORT REPORTS TABLE
CREATE TABLE IF NOT EXISTS support_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES support_sessions(id) ON DELETE SET NULL,
    reporter_user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    reported_user_id TEXT REFERENCES "user"(id) ON DELETE SET NULL,
    report_type VARCHAR(50) NOT NULL
        CHECK (report_type IN ('inappropriate_behavior', 'boundary_violation', 'harassment', 'safety_concern', 'other')),
    description TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'under_review', 'resolved', 'dismissed')),
    resolution_notes TEXT,
    resolved_by TEXT REFERENCES "user"(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 11. SAFEGUARDING CASES TABLE
CREATE TABLE IF NOT EXISTS safeguarding_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES support_sessions(id) ON DELETE SET NULL,
    seeker_user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    age_band VARCHAR(20) NOT NULL,
    risk_level VARCHAR(20) NOT NULL
        CHECK (risk_level IN ('low', 'moderate', 'high', 'imminent_danger')),
    case_notes TEXT NOT NULL,
    referral_destination VARCHAR(100),
    assigned_lead_id TEXT REFERENCES "user"(id) ON DELETE SET NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'opened'
        CHECK (status IN ('opened', 'escalated', 'referred', 'resolved', 'closed')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 12. PERFORMANCE & RETRIEVAL INDEXES
CREATE INDEX IF NOT EXISTS idx_helper_profiles_availability_status ON helper_profiles(availability_status);
CREATE INDEX IF NOT EXISTS idx_match_candidates_req_id ON match_candidates(request_id);
CREATE INDEX IF NOT EXISTS idx_match_candidates_supporter_id ON match_candidates(supporter_id);
CREATE INDEX IF NOT EXISTS idx_match_candidates_offer_status ON match_candidates(offer_status);
CREATE INDEX IF NOT EXISTS idx_support_assignments_supporter_id ON support_assignments(supporter_id);
CREATE INDEX IF NOT EXISTS idx_support_assignments_seeker_id ON support_assignments(seeker_user_id);
CREATE INDEX IF NOT EXISTS idx_session_messages_session_id ON session_messages(session_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_voice_rooms_session_id ON voice_rooms(session_id);
CREATE INDEX IF NOT EXISTS idx_support_reports_status ON support_reports(status);
CREATE INDEX IF NOT EXISTS idx_safeguarding_cases_status ON safeguarding_cases(status);
