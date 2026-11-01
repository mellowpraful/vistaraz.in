const { sql, getUserFromRequest, parseBody, jsonResponse } = require('./_db');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return jsonResponse(res, 200, { ok: true });
  }

  const user = await getUserFromRequest(req);

  // GET: list appointments for user or listener
  if (req.method === 'GET') {
    try {
      if (!user) {
        return jsonResponse(res, 200, { appointments: [] });
      }

      let appointments;
      if (user.role === 'provider') {
        appointments = await sql.query(
          `SELECT id, user_id, provider_id, client_name, client_email, provider_name,
                  session_type, scheduled_for, status, notes, meeting_link, created_at
           FROM appointments
           WHERE provider_id = $1 OR provider_id IS NULL
           ORDER BY scheduled_for ASC`,
          [user.id]
        );
      } else {
        appointments = await sql.query(
          `SELECT id, user_id, provider_id, client_name, client_email, provider_name,
                  session_type, scheduled_for, status, notes, meeting_link, created_at
           FROM appointments
           WHERE user_id = $1
           ORDER BY scheduled_for ASC`,
          [user.id]
        );
      }

      return jsonResponse(res, 200, { appointments });
    } catch (err) {
      console.error('Fetch appointments error:', err);
      return jsonResponse(res, 500, { error: err.message });
    }
  }

  // POST: book an appointment
  if (req.method === 'POST') {
    try {
      const body = await parseBody(req);
      const {
        provider_name = 'Peer Listener',
        provider_id = null,
        session_type = 'chat',
        scheduled_for = null,
        notes = ''
      } = body;

      const clientName = user ? (user.nickname || user.name || 'Friend') : (body.client_name || 'Friend');
      const clientEmail = user ? user.email : (body.client_email || 'guest@vistaraz.in');
      const scheduleDate = scheduled_for ? new Date(scheduled_for) : new Date(Date.now() + 24 * 60 * 60 * 1000);
      const meetingLink = `/video-call?room=${Math.random().toString(36).substring(2, 9)}`;

      const inserted = await sql.query(
        `INSERT INTO appointments (
          user_id, provider_id, client_name, client_email, provider_name,
          session_type, scheduled_for, status, notes, meeting_link
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id, client_name, provider_name, session_type, scheduled_for, status, meeting_link, created_at`,
        [
          user ? user.id : null,
          provider_id,
          clientName,
          clientEmail,
          provider_name,
          session_type,
          scheduleDate,
          'confirmed',
          notes,
          meetingLink
        ]
      );

      return jsonResponse(res, 201, {
        message: 'Support session confirmed!',
        appointment: inserted[0]
      });
    } catch (err) {
      console.error('Book appointment error:', err);
      return jsonResponse(res, 500, { error: err.message });
    }
  }

  return jsonResponse(res, 405, { error: 'Method not allowed' });
};

