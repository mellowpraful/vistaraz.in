-- Migration 007: Intern Applications, Review Notes, and Role Constraint Expansion
-- Supports Admin Portal oversight of peer listeners and academic interns

-- 1. Expand user_roles check constraint to permit 'intern' role
ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;
ALTER TABLE user_roles ADD CONSTRAINT user_roles_role_check 
    CHECK (role IN ('user', 'helper', 'professional', 'admin', 'intern'));

-- 2. Add administrative review notes column to helper_profiles
ALTER TABLE helper_profiles 
    ADD COLUMN IF NOT EXISTS review_notes TEXT;

-- 3. Create intern_applications table
CREATE TABLE IF NOT EXISTS intern_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    institution VARCHAR(255) NOT NULL,
    degree VARCHAR(255) NOT NULL,
    year_of_study VARCHAR(64),
    motivation TEXT,
    areas_of_interest TEXT[] DEFAULT ARRAY['General Wellbeing'],
    application_status VARCHAR(32) NOT NULL DEFAULT 'pending'
        CHECK (application_status IN ('pending', 'under_review', 'approved', 'rejected')),
    review_notes TEXT,
    reviewed_by TEXT REFERENCES "user"(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_intern_applications_user_id ON intern_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_intern_applications_status ON intern_applications(application_status);

