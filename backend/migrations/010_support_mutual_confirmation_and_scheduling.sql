-- Migration 010: Support Mutual Match Confirmation, Reservation, and Scheduled Voice
-- Expands status checks on support_requests and match_candidates to support 2-step mutual acceptance

-- 1. Expand support_requests status check constraint
DO $$
BEGIN
    ALTER TABLE support_requests DROP CONSTRAINT IF EXISTS support_requests_status_check;
    ALTER TABLE support_requests ADD CONSTRAINT support_requests_status_check
        CHECK (status IN (
            'open', 'requested', 'safety_check', 'matching', 'offered',
            'awaiting_seeker_confirmation', 'confirmed', 'matched',
            'in_progress', 'resolved', 'closed', 'cancelled', 'escalated'
        ));
END $$;

-- 2. Expand match_candidates offer_status check constraint & add seeker_responded_at
ALTER TABLE match_candidates
    ADD COLUMN IF NOT EXISTS seeker_responded_at TIMESTAMP WITH TIME ZONE;

DO $$
BEGIN
    ALTER TABLE match_candidates DROP CONSTRAINT IF EXISTS match_candidates_offer_status_check;
    ALTER TABLE match_candidates ADD CONSTRAINT match_candidates_offer_status_check
        CHECK (offer_status IN (
            'pending', 'offered', 'listener_accepted', 'listener_declined',
            'accepted', 'declined', 'expired', 'seeker_confirmed', 'seeker_declined', 'cancelled'
        ));
END $$;

-- 3. Extend voice_rooms with provider column
ALTER TABLE voice_rooms
    ADD COLUMN IF NOT EXISTS provider VARCHAR(64) NOT NULL DEFAULT 'webrtc_standard';
