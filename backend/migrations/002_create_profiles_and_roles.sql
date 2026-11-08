-- Migration 002: Create Profiles and User Roles Tables
-- Connects Vistaraz user profile details and role management to Better Auth users

-- 1. PROFILES TABLE
-- Extended user information, sanctuary preferences, and language
CREATE TABLE IF NOT EXISTS profiles (
    user_id TEXT PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    nickname TEXT,
    avatar_url TEXT,
    preferred_language VARCHAR(10) NOT NULL DEFAULT 'en',
    privacy_preferences JSONB NOT NULL DEFAULT '{"anonymous_chat": true, "show_activity": false}'::jsonb,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. USER_ROLES TABLE
-- Role assignments: user, helper, professional, admin
-- Note: A user may have roles assigned, but duplicate role assignment is prevented by unique constraint.
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    role VARCHAR(32) NOT NULL CHECK (role IN ('user', 'helper', 'professional', 'admin')),
    assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    assigned_by TEXT REFERENCES "user"(id) ON DELETE SET NULL,
    CONSTRAINT uq_user_roles_user_role UNIQUE (user_id, role)
);

-- Performance and lookup indexes
CREATE INDEX IF NOT EXISTS idx_profiles_preferred_language ON profiles(preferred_language);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);
CREATE INDEX IF NOT EXISTS idx_user_roles_assigned_by ON user_roles(assigned_by);

