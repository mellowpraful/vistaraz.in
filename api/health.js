const { sql, jsonResponse } = require('./_db');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return jsonResponse(res, 200, { ok: true });
  }

  try {
    const timeRes = await sql.query('SELECT NOW() as current_time');
    const countRes = await sql.query('SELECT COUNT(*) as users_count FROM users');
    const postsRes = await sql.query('SELECT COUNT(*) as posts_count FROM community_posts');

    return jsonResponse(res, 200, {
      status: 'healthy',
      database: 'Neon PostgreSQL',
      connected: true,
      serverTime: timeRes[0]?.current_time,
      usersCount: parseInt(countRes[0]?.users_count || 0, 10),
      postsCount: parseInt(postsRes[0]?.posts_count || 0, 10)
    });
  } catch (err) {
    return jsonResponse(res, 500, {
      status: 'unhealthy',
      database: 'Neon PostgreSQL',
      connected: false,
      error: err.message
    });
  }
};

