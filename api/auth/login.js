const { sql, verifyPassword, generateToken, parseBody, jsonResponse } = require('../_db');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return jsonResponse(res, 200, { ok: true });
  }

  if (req.method !== 'POST') {
    return jsonResponse(res, 405, { error: 'Method not allowed' });
  }

  try {
    const body = await parseBody(req);
    const { email, password } = body;

    if (!email || !password) {
      return jsonResponse(res, 400, { error: 'Please provide both email and password.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    const users = await sql.query(
      `SELECT id, email, password_hash, name, nickname, role, avatar,
              profile_type, qualification, languages, plan, is_verified, is_online, created_at
       FROM users WHERE email = $1 LIMIT 1`,
      [cleanEmail]
    );

    if (!users || users.length === 0) {
      return jsonResponse(res, 401, { error: 'No account found with this email. Please check or register.' });
    }

    const user = users[0];
    const passwordValid = verifyPassword(password, user.password_hash);

    if (!passwordValid) {
      return jsonResponse(res, 401, { error: 'Incorrect password. Please try again.' });
    }

    // Create session token (valid for 30 days)
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await sql.query(
      'INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, token, expiresAt]
    );

    // Don't send password hash to client
    delete user.password_hash;

    return jsonResponse(res, 200, {
      message: 'Sign in successful! Welcome back.',
      user,
      token
    });
  } catch (err) {
    console.error('Login error:', err);
    return jsonResponse(res, 500, { error: 'Sign in failed: ' + err.message });
  }
};

