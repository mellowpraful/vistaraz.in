-- Migration 004: Create Support Requests and Sessions Tables
-- Manages support inquiries and matched peer/professional sessions

-- 1. SUPPORT_REQUESTS TABLE
-- Initial support intake / help requests submitted by users
CREATE TABLE IF NOT EXISTS support_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    category VARCHAR(64) NOT NULL,
    concern_description TEXT,
    preferred_support_type VARCHAR(32) NOT NULL DEFAULT 'peer_helper'
        CHECK (preferred_support_type IN ('peer_helper', 'professional', 'any')),
    urgency VARCHAR(32) NOT NULL DEFAULT 'medium'
        CHECK (urgency IN ('low', 'medium', 'high', 'crisis')),
    status VARCHAR(32) NOT NULL DEFAULT 'open'
        CHECK (status IN ('open', 'matched', 'in_progress', 'resolved', 'closed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. SUPPORT_SESSIONS TABLE
-- Scheduled or live interactive sessions between seekers and verified helpers/professionals
CREATE TABLE IF NOT EXISTS support_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    support_request_id UUID REFERENCES support_requests(id) ON DELETE SET NULL,
    user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    assigned_peer_id TEXT REFERENCES "user"(id) ON DELETE SET NULL,
    session_type VARCHAR(32) NOT NULL DEFAULT 'text'
        CHECK (session_type IN ('text', 'audio', 'video')),
    session_status VARCHAR(32) NOT NULL DEFAULT 'scheduled'
        CHECK (session_status IN ('scheduled', 'active', 'completed', 'cancelled', 'no_show')),
    scheduled_for TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for active session discovery and queue monitoring
CREATE INDEX IF NOT EXISTS idx_support_requests_user_id ON support_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_support_requests_status ON support_requests(status);
CREATE INDEX IF NOT EXISTS idx_support_requests_category ON support_requests(category);
CREATE INDEX IF NOT EXISTS idx_support_requests_urgency ON support_requests(urgency);

CREATE INDEX IF NOT EXISTS idx_support_sessions_user_id ON support_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_support_sessions_assigned_peer_id ON support_sessions(assigned_peer_id);
CREATE INDEX IF NOT EXISTS idx_support_sessions_request_id ON support_sessions(support_request_id);
CREATE INDEX IF NOT EXISTS idx_support_sessions_status ON support_sessions(session_status);
CREATE INDEX IF NOT EXISTS idx_support_sessions_scheduled ON support_sessions(scheduled_for);

