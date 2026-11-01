const { sql, getUserFromRequest, parseBody, jsonResponse } = require('./_db');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return jsonResponse(res, 200, { ok: true });
  }

  const user = await getUserFromRequest(req);

  if (req.method === 'GET') {
    try {
      if (!user) {
        return jsonResponse(res, 200, { moods: [] });
      }
      const moods = await sql.query(
        'SELECT id, mood, intensity, note, created_at FROM mood_logs WHERE user_id = $1 ORDER BY created_at DESC LIMIT 14',
        [user.id]
      );
      return jsonResponse(res, 200, { moods });
    } catch (err) {
      console.error('Fetch mood logs error:', err);
      return jsonResponse(res, 500, { error: err.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const body = await parseBody(req);
      const { mood, intensity = 5, note = '' } = body;

      if (!mood) {
        return jsonResponse(res, 400, { error: 'Mood is required.' });
      }

      if (!user) {
        return jsonResponse(res, 200, { message: 'Mood recorded locally.' });
      }

      const inserted = await sql.query(
        'INSERT INTO mood_logs (user_id, mood, intensity, note) VALUES ($1, $2, $3, $4) RETURNING id, mood, intensity, note, created_at',
        [user.id, mood, parseInt(intensity, 10), note]
      );

      return jsonResponse(res, 201, { message: 'Mood logged!', mood: inserted[0] });
    } catch (err) {
      console.error('Log mood error:', err);
      return jsonResponse(res, 500, { error: err.message });
    }
  }

  return jsonResponse(res, 405, { error: 'Method not allowed' });
};

