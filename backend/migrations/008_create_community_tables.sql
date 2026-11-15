-- Migration 008: Create Community Tables for Sanctuary Circles
-- Provides persistent storage for peer discussions, support circles, likes, and comments.

-- 1. COMMUNITY_POSTS TABLE
CREATE TABLE IF NOT EXISTS community_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    author_alias VARCHAR(100) NOT NULL,
    avatar_id VARCHAR(32) NOT NULL DEFAULT 'avatar_01',
    topic VARCHAR(64) NOT NULL DEFAULT 'general',
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    likes_count INT NOT NULL DEFAULT 0,
    comments_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. COMMUNITY_LIKES TABLE
CREATE TABLE IF NOT EXISTS community_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_community_likes_post_user UNIQUE (post_id, user_id)
);

-- 3. COMMUNITY_COMMENTS TABLE
CREATE TABLE IF NOT EXISTS community_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    author_alias VARCHAR(100) NOT NULL,
    avatar_id VARCHAR(32) NOT NULL DEFAULT 'avatar_01',
    body TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for query optimization
CREATE INDEX IF NOT EXISTS idx_community_posts_topic ON community_posts(topic);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_community_likes_post_id ON community_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_community_likes_user_id ON community_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_post_id ON community_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_created_at ON community_comments(created_at ASC);
