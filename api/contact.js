const { sql, parseBody, jsonResponse } = require('./_db');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return jsonResponse(res, 200, { ok: true });
  }

  if (req.method !== 'POST') {
    return jsonResponse(res, 405, { error: 'Method not allowed' });
  }

  try {
    const body = await parseBody(req);
    const { name, email, subject, message } = body;

    if (!email || !message) {
      return jsonResponse(res, 400, { error: 'Email and message are required.' });
    }

    const inserted = await sql.query(
      `INSERT INTO contact_messages (name, email, subject, message)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, subject, message, created_at`,
      [name || 'Anonymous Seeker', email.trim().toLowerCase(), subject || 'Support Inquiry', message.trim()]
    );

    return jsonResponse(res, 201, {
      message: 'Thank you for reaching out. A support coordinator will reply shortly.',
      contact: inserted[0]
    });
  } catch (err) {
    console.error('Contact error:', err);
    return jsonResponse(res, 500, { error: err.message });
  }
};

