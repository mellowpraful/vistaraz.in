const { sql, hashPassword, generateToken, parseBody, jsonResponse } = require('../_db');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return jsonResponse(res, 200, { ok: true });
  }

  if (req.method !== 'POST') {
    return jsonResponse(res, 405, { error: 'Method not allowed' });
  }

  try {
    const body = await parseBody(req);
    const {
      email,
      password,
      role = 'seeker',
      name = '',
      nickname = '',
      avatar = '🦊',
      profile_type = 'anon',
      qualification = '',
      languages = ['English']
    } = body;

    if (!email || !email.includes('@')) {
      return jsonResponse(res, 400, { error: 'A valid email address is required.' });
    }
    if (!password || password.length < 6) {
      return jsonResponse(res, 400, { error: 'Password must be at least 6 characters.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanRole = role === 'provider' ? 'provider' : 'seeker';
    const cleanNickname = nickname.trim() || (cleanRole === 'provider' ? (name.trim() || 'Peer Listener') : 'Friend');
    const cleanName = name.trim() || cleanNickname;

    // Check if user already exists
    const existing = await sql.query('SELECT id FROM users WHERE email = $1 LIMIT 1', [cleanEmail]);
    if (existing && existing.length > 0) {
      return jsonResponse(res, 409, { error: 'An account with this email already exists. Please sign in.' });
    }

    const passwordHash = hashPassword(password);

    const insertedUsers = await sql.query(
      `INSERT INTO users (
        email, password_hash, name, nickname, role, avatar,
        profile_type, qualification, languages, plan, is_verified, is_online
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id, email, name, nickname, role, avatar, profile_type, qualification, languages, plan, is_verified, is_online, created_at`,
      [
        cleanEmail,
        passwordHash,
        cleanName,
        cleanNickname,
        cleanRole,
        avatar || '🦊',
        profile_type || 'anon',
        qualification || null,
        Array.isArray(languages) ? languages : ['English'],
        'Free',
        cleanRole === 'provider' ? false : true,
        cleanRole === 'provider' ? true : false
      ]
    );

    const newUser = insertedUsers[0];

    // Create session token (valid for 30 days)
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await sql.query(
      'INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [newUser.id, token, expiresAt]
    );

    return jsonResponse(res, 201, {
      message: 'Registration successful! Welcome to Vistaraz.',
      user: newUser,
      token
    });
  } catch (err) {
    console.error('Registration error:', err);
    return jsonResponse(res, 500, { error: 'Registration failed: ' + err.message });
  }
};

