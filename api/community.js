const { sql, getUserFromRequest, parseBody, jsonResponse } = require('./_db');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return jsonResponse(res, 200, { ok: true });
  }

  // GET: list posts
  if (req.method === 'GET') {
    try {
      const posts = await sql.query(
        `SELECT p.id, p.user_id, p.author_name, p.author_avatar, p.category,
                p.title, p.content, p.upvotes, p.comments_count, p.created_at
         FROM community_posts p
         ORDER BY p.created_at DESC
         LIMIT 50`
      );
      return jsonResponse(res, 200, { posts });
    } catch (err) {
      console.error('Fetch posts error:', err);
      return jsonResponse(res, 500, { error: err.message });
    }
  }

  // POST: create new post or upvote
  if (req.method === 'POST') {
    try {
      const user = await getUserFromRequest(req);
      const body = await parseBody(req);
      const { action, postId, title, content, category } = body;

      // Handle upvote action
      if (action === 'upvote' && postId) {
        const updated = await sql.query(
          'UPDATE community_posts SET upvotes = upvotes + 1 WHERE id = $1 RETURNING id, upvotes',
          [postId]
        );
        return jsonResponse(res, 200, { success: true, post: updated[0] });
      }

      // Handle post creation (requires login or valid author)
      if (!title || !content) {
        return jsonResponse(res, 400, { error: 'Post title and message are required.' });
      }

      const authorName = user ? (user.nickname || user.name || 'Anonymous Peer') : (body.author_name || 'Anonymous Peer');
      const authorAvatar = user ? (user.avatar || '🦊') : (body.author_avatar || '🦊');
      const postCategory = category || 'General';

      const inserted = await sql.query(
        `INSERT INTO community_posts (user_id, author_name, author_avatar, category, title, content)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, user_id, author_name, author_avatar, category, title, content, upvotes, comments_count, created_at`,
        [
          user ? user.id : null,
          authorName,
          authorAvatar,
          postCategory,
          title.trim(),
          content.trim()
        ]
      );

      return jsonResponse(res, 201, {
        message: 'Shared with Community Circles!',
        post: inserted[0]
      });
    } catch (err) {
      console.error('Create post error:', err);
      return jsonResponse(res, 500, { error: err.message });
    }
  }

  return jsonResponse(res, 405, { error: 'Method not allowed' });
};

