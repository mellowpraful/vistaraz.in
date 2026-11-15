/**
 * communityController.js — Community Sanctuary Circles Handlers
 *
 * Provides persistent, anonymous peer discussions, community topics,
 * upvotes/likes, and supportive replies with safeguarding crisis intercept.
 */

import { authPool } from '../config/auth.js';
import { logger } from '../utils/logger.js';

// High-risk self-harm and crisis phrases for immediate safeguarding intercept
const CRISIS_PATTERNS = [
  /\b(suicid|kill\s*myself|end\s*my\s*life|want\s*to\s*die|hanging\s*myself|cut\s*my\s*wrists)\b/i,
];

const SEED_POSTS = [
  {
    alias: 'moonlitmango',
    avatar: 'avatar_03',
    topic: 'Connection',
    title: 'Is it normal to feel lonely even when you have friends?',
    body: 'I’m around people all the time in college lectures, but I still feel completely separate from everyone. Like nobody actually knows what’s going on inside my head.',
    likes_count: 24,
    comments: [
      {
        alias: 'peachtea22',
        avatar: 'avatar_05',
        body: 'Going through the exact same thing in my 3rd year. Realizing proximity doesn’t always equal emotional safety. Sending a hug.',
      },
    ],
  },
  {
    alias: 'bluepencil',
    avatar: 'avatar_01',
    topic: 'Study & career',
    title: 'How do you deal with the intense pressure to have a five-year plan?',
    body: 'I keep thinking everyone else has their career trajectory figured out and I am already falling hopelessly behind.',
    likes_count: 38,
    comments: [
      {
        alias: 'quietriver',
        avatar: 'avatar_02',
        body: 'In your early twenties, your values and interests are still evolving. Focus on the next few months of genuine curiosity rather than an entire decade of imaginary perfection.',
      },
    ],
  },
  {
    alias: 'chai_and_clouds',
    avatar: 'avatar_07',
    topic: 'Stress & overthinking',
    title: 'Small practice: The 20-minute worry postponement trick',
    body: 'Whenever I start spiraling during exam revision, I write down the thought in a notebook and tell my brain: "We will worry about this at 5:00 PM for 10 minutes." 9 times out of 10, by 5:00 PM the urgency is gone.',
    likes_count: 56,
    comments: [],
  },
];

/**
 * Seeds initial posts if database community table is empty.
 */
async function ensureSeedPosts(client) {
  try {
    const check = await client.query('SELECT COUNT(*)::int AS count FROM community_posts');
    if (check.rows[0].count === 0) {
      // Find a system user or first user to anchor seed posts
      const userRes = await client.query('SELECT id FROM "user" LIMIT 1');
      if (userRes.rows.length > 0) {
        const seedUserId = userRes.rows[0].id;
        for (const post of SEED_POSTS) {
          const insertPost = await client.query(
            `INSERT INTO community_posts (user_id, author_alias, avatar_id, topic, title, body, likes_count, comments_count, is_pinned)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, false)
             RETURNING id`,
            [seedUserId, post.alias, post.avatar, post.topic, post.title, post.body, post.likes_count, post.comments.length]
          );
          const postId = insertPost.rows[0].id;
          for (const comm of post.comments) {
            await client.query(
              `INSERT INTO community_comments (post_id, user_id, author_alias, avatar_id, body)
               VALUES ($1, $2, $3, $4, $5)`,
              [postId, seedUserId, comm.alias, comm.avatar, comm.body]
            );
          }
        }
        logger.info('Community sanctuary posts seeded successfully.');
      }
    }
  } catch (err) {
    logger.warn('Seed community posts check error:', err.message);
  }
}

/**
 * GET /api/community/posts
 * Lists community posts with likes status and comments.
 */
export async function getCommunityPosts(req, res) {
  try {
    const userId = req.user?.id || null;
    const { topic } = req.query;
    const limit = Math.min(Number(req.query.limit) || 30, 50);
    const offset = Number(req.query.offset) || 0;

    await ensureSeedPosts(authPool);

    let queryText = `
      SELECT 
        p.id,
        p.user_id,
        p.author_alias,
        p.avatar_id,
        p.topic,
        p.title,
        p.body,
        p.is_pinned,
        p.likes_count,
        p.comments_count,
        p.created_at,
        p.updated_at,
        CASE 
          WHEN $1::text IS NOT NULL THEN EXISTS (
            SELECT 1 FROM community_likes l WHERE l.post_id = p.id AND l.user_id = $1
          )
          ELSE FALSE
        END AS liked_by_user
      FROM community_posts p
    `;

    const params = [userId];
    if (topic && topic.toLowerCase() !== 'all') {
      params.push(topic);
      queryText += ` WHERE LOWER(p.topic) = LOWER($${params.length}) `;
    }

    params.push(limit);
    queryText += ` ORDER BY p.is_pinned DESC, p.created_at DESC LIMIT $${params.length} `;
    params.push(offset);
    queryText += ` OFFSET $${params.length} `;

    const postsRes = await authPool.query(queryText, params);
    const posts = postsRes.rows;

    if (posts.length > 0) {
      const postIds = posts.map((p) => p.id);
      const commentsRes = await authPool.query(
        `SELECT id, post_id, author_alias, avatar_id, body, created_at
         FROM community_comments
         WHERE post_id = ANY($1::uuid[])
         ORDER BY created_at ASC`,
        [postIds]
      );

      const commentsByPost = {};
      for (const row of commentsRes.rows) {
        if (!commentsByPost[row.post_id]) commentsByPost[row.post_id] = [];
        commentsByPost[row.post_id].push({
          id: row.id,
          author: row.author_alias,
          avatar: row.avatar_id,
          text: row.body,
          createdAt: row.created_at,
        });
      }

      for (const p of posts) {
        p.replies = commentsByPost[p.id] || [];
      }
    }

    return res.status(200).json({
      success: true,
      data: posts.map((p) => ({
        id: p.id,
        alias: p.author_alias,
        avatar: p.avatar_id,
        topic: p.topic,
        title: p.title,
        body: p.body,
        isPinned: p.is_pinned,
        likes: Number(p.likes_count) || 0,
        likedByUser: Boolean(p.liked_by_user),
        repliesCount: Number(p.comments_count) || 0,
        replies: p.replies || [],
        createdAt: p.created_at,
      })),
    });
  } catch (err) {
    logger.error('Failed to get community posts', { error: err.message });
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve community posts.',
      code: 'SERVER_ERROR',
    });
  }
}

/**
 * POST /api/community/posts
 * Creates a new anonymous community post.
 */
export async function createCommunityPost(req, res) {
  try {
    const userId = req.user.id;
    const { title, body, topic } = req.body;

    if (!title || typeof title !== 'string' || title.trim().length < 3) {
      return res.status(400).json({
        success: false,
        error: 'Title must be at least 3 characters.',
        code: 'INVALID_TITLE',
      });
    }

    if (!body || typeof body !== 'string' || body.trim().length < 5) {
      return res.status(400).json({
        success: false,
        error: 'Body must be at least 5 characters.',
        code: 'INVALID_BODY',
      });
    }

    // Crisis Safeguard Check
    const combinedText = `${title} ${body}`;
    for (const pattern of CRISIS_PATTERNS) {
      if (pattern.test(combinedText)) {
        return res.status(422).json({
          success: false,
          crisisIntercept: true,
          error:
            'It sounds like you may be experiencing severe emotional distress or crisis. Please connect with our 24/7 verified emergency crisis line (Tele-MANAS: 14416 or KIRAN: 1800-599-0019) immediately. Your life and safety matter.',
          code: 'CRISIS_INTERCEPT',
        });
      }
    }

    // Retrieve user alias and avatar from profiles
    const profRes = await authPool.query(
      'SELECT display_name, real_name, avatar_id FROM profiles WHERE user_id = $1',
      [userId]
    );

    const prof = profRes.rows[0];
    const authorAlias =
      prof?.display_name || (prof?.real_name ? `${prof.real_name.split(' ')[0]}_seeker` : `seeker_${userId.slice(0, 5)}`);
    const avatarId = prof?.avatar_id || 'avatar_01';
    const postTopic = typeof topic === 'string' && topic.trim() ? topic.trim() : 'Connection';

    const insertRes = await authPool.query(
      `INSERT INTO community_posts (user_id, author_alias, avatar_id, topic, title, body, likes_count, comments_count)
       VALUES ($1, $2, $3, $4, $5, $6, 1, 0)
       RETURNING id, author_alias, avatar_id, topic, title, body, likes_count, comments_count, created_at`,
      [userId, authorAlias, avatarId, postTopic, title.trim(), body.trim()]
    );

    const post = insertRes.rows[0];

    // Auto-like author's own post
    await authPool.query(
      'INSERT INTO community_likes (post_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [post.id, userId]
    );

    return res.status(201).json({
      success: true,
      message: 'Post shared in Community Sanctuary.',
      data: {
        id: post.id,
        alias: post.author_alias,
        avatar: post.avatar_id,
        topic: post.topic,
        title: post.title,
        body: post.body,
        likes: 1,
        likedByUser: true,
        repliesCount: 0,
        replies: [],
        createdAt: post.created_at,
      },
    });
  } catch (err) {
    logger.error('Failed to create community post', { error: err.message });
    return res.status(500).json({
      success: false,
      error: 'Failed to share community post.',
      code: 'SERVER_ERROR',
    });
  }
}

/**
 * POST /api/community/posts/:id/like
 * Toggles like for the authenticated user.
 */
export async function togglePostLike(req, res) {
  try {
    const userId = req.user.id;
    const postId = req.params.id;

    // Check if like exists
    const existingRes = await authPool.query(
      'SELECT id FROM community_likes WHERE post_id = $1 AND user_id = $2',
      [postId, userId]
    );

    let liked = false;
    if (existingRes.rows.length > 0) {
      // Remove like
      await authPool.query('DELETE FROM community_likes WHERE post_id = $1 AND user_id = $2', [postId, userId]);
      await authPool.query(
        'UPDATE community_posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = $1',
        [postId]
      );
      liked = false;
    } else {
      // Add like
      await authPool.query(
        'INSERT INTO community_likes (post_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [postId, userId]
      );
      await authPool.query('UPDATE community_posts SET likes_count = likes_count + 1 WHERE id = $1', [postId]);
      liked = true;
    }

    const countRes = await authPool.query('SELECT likes_count FROM community_posts WHERE id = $1', [postId]);
    const likesCount = Number(countRes.rows[0]?.likes_count) || 0;

    return res.status(200).json({
      success: true,
      liked,
      likesCount,
    });
  } catch (err) {
    logger.error('Failed to toggle post like', { error: err.message });
    return res.status(500).json({
      success: false,
      error: 'Failed to update like.',
      code: 'SERVER_ERROR',
    });
  }
}

/**
 * POST /api/community/posts/:id/comments
 * Adds a supportive reply to a community post.
 */
export async function addPostComment(req, res) {
  try {
    const userId = req.user.id;
    const postId = req.params.id;
    const { text, body } = req.body;

    const commentText = (text || body || '').trim();
    if (!commentText || commentText.length < 1) {
      return res.status(400).json({
        success: false,
        error: 'Comment text cannot be empty.',
        code: 'INVALID_COMMENT',
      });
    }

    // Get user alias
    const profRes = await authPool.query(
      'SELECT display_name, real_name, avatar_id FROM profiles WHERE user_id = $1',
      [userId]
    );
    const prof = profRes.rows[0];
    const authorAlias =
      prof?.display_name || (prof?.real_name ? `${prof.real_name.split(' ')[0]}_seeker` : `seeker_${userId.slice(0, 5)}`);
    const avatarId = prof?.avatar_id || 'avatar_01';

    const insertRes = await authPool.query(
      `INSERT INTO community_comments (post_id, user_id, author_alias, avatar_id, body)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, post_id, author_alias, avatar_id, body, created_at`,
      [postId, userId, authorAlias, avatarId, commentText]
    );

    await authPool.query('UPDATE community_posts SET comments_count = comments_count + 1 WHERE id = $1', [postId]);

    const comment = insertRes.rows[0];

    return res.status(201).json({
      success: true,
      data: {
        id: comment.id,
        author: comment.author_alias,
        avatar: comment.avatar_id,
        text: comment.body,
        createdAt: comment.created_at,
      },
    });
  } catch (err) {
    logger.error('Failed to add comment', { error: err.message });
    return res.status(500).json({
      success: false,
      error: 'Failed to add reply.',
      code: 'SERVER_ERROR',
    });
  }
}
