-- Migration 003: Create Helper and Professional Profiles
-- Strictly separates peer supporters (helpers) from licensed clinical practitioners (professionals)

-- 1. HELPER_PROFILES TABLE
-- Peer supporters / active listeners undergoing verification
CREATE TABLE IF NOT EXISTS helper_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL UNIQUE REFERENCES "user"(id) ON DELETE CASCADE,
    introduction TEXT,
    qualification TEXT,
    languages TEXT[] NOT NULL DEFAULT ARRAY['en'],
    verification_status VARCHAR(32) NOT NULL DEFAULT 'pending' 
        CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    application_status VARCHAR(32) NOT NULL DEFAULT 'submitted'
        CHECK (application_status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected')),
    availability JSONB NOT NULL DEFAULT '{"is_online": false, "active_days": ["Mon","Tue","Wed","Thu","Fri"], "hours": "10:00-18:00"}'::jsonb,
    verified_by TEXT REFERENCES "user"(id) ON DELETE SET NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. PROFESSIONAL_PROFILES TABLE
-- Licensed mental-health practitioners (psychologists, therapists, counselors)
CREATE TABLE IF NOT EXISTS professional_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL UNIQUE REFERENCES "user"(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    qualifications TEXT NOT NULL,
    license_number VARCHAR(100) NOT NULL,
    licensing_body VARCHAR(150) NOT NULL,
    specialties TEXT[] NOT NULL DEFAULT ARRAY['General Wellbeing'],
    languages TEXT[] NOT NULL DEFAULT ARRAY['en'],
    verification_status VARCHAR(32) NOT NULL DEFAULT 'pending'
        CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    approval_status VARCHAR(32) NOT NULL DEFAULT 'submitted'
        CHECK (approval_status IN ('submitted', 'under_review', 'approved', 'rejected')),
    approved_by TEXT REFERENCES "user"(id) ON DELETE SET NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for status checks and verification workflows
CREATE INDEX IF NOT EXISTS idx_helper_profiles_user_id ON helper_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_helper_profiles_verification_status ON helper_profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_helper_profiles_application_status ON helper_profiles(application_status);

CREATE INDEX IF NOT EXISTS idx_professional_profiles_user_id ON professional_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_professional_profiles_verification_status ON professional_profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_professional_profiles_license ON professional_profiles(license_number);

