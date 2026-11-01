const { sql, getUserFromRequest, jsonResponse } = require('../_db');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return jsonResponse(res, 200, { ok: true });
  }

  if (req.method !== 'GET') {
    return jsonResponse(res, 405, { error: 'Method not allowed' });
  }

  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return jsonResponse(res, 401, { error: 'Unauthorized or session expired.' });
    }

    return jsonResponse(res, 200, { user });
  } catch (err) {
    console.error('Auth verification error:', err);
    return jsonResponse(res, 500, { error: 'Session check failed: ' + err.message });
  }
};

