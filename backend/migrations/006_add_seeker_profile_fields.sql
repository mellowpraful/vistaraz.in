-- Migration 006: Add Seeker Profile Fields
-- Extends the existing profiles table to support First-Time Seeker Profile Setup
-- Tracks user's real name, predefined illustrated avatar ID, and setup completion flag

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS real_name TEXT,
ADD COLUMN IF NOT EXISTS avatar_id VARCHAR(64),
ADD COLUMN IF NOT EXISTS is_seeker_profile_completed BOOLEAN NOT NULL DEFAULT false;

-- Indexes for performance and quick profile status lookup
CREATE INDEX IF NOT EXISTS idx_profiles_avatar_id ON profiles(avatar_id);
CREATE INDEX IF NOT EXISTS idx_profiles_seeker_completed ON profiles(is_seeker_profile_completed);

