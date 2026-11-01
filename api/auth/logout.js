const { sql, jsonResponse } = require('../_db');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return jsonResponse(res, 200, { ok: true });
  }

  try {
    const authHeader = req.headers.authorization || req.headers.Authorization || '';
    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      if (token) {
        await sql.query('DELETE FROM sessions WHERE token = $1', [token]);
      }
    }

    return jsonResponse(res, 200, { message: 'Signed out successfully.' });
  } catch (err) {
    console.error('Logout error:', err);
    return jsonResponse(res, 500, { error: 'Sign out failed: ' + err.message });
  }
};

