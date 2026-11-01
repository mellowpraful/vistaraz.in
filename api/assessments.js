const { sql, getUserFromRequest, parseBody, jsonResponse } = require('./_db');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return jsonResponse(res, 200, { ok: true });
  }

  const user = await getUserFromRequest(req);

  if (req.method === 'GET') {
    try {
      if (!user) {
        return jsonResponse(res, 200, { assessments: [] });
      }

      const assessments = await sql.query(
        'SELECT id, score, category, answers, notes, created_at FROM assessments WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10',
        [user.id]
      );
      return jsonResponse(res, 200, { assessments });
    } catch (err) {
      console.error('Fetch assessments error:', err);
      return jsonResponse(res, 500, { error: err.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const body = await parseBody(req);
      const { score, category, answers, notes, user_email } = body;

      if (score === undefined || !category) {
        return jsonResponse(res, 400, { error: 'Score and category are required.' });
      }

      const inserted = await sql.query(
        `INSERT INTO assessments (user_id, user_email, score, category, answers, notes)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, score, category, answers, notes, created_at`,
        [
          user ? user.id : null,
          user ? user.email : (user_email || null),
          parseInt(score, 10),
          category,
          answers ? JSON.stringify(answers) : null,
          notes || null
        ]
      );

      return jsonResponse(res, 201, {
        message: 'Assessment saved successfully!',
        assessment: inserted[0]
      });
    } catch (err) {
      console.error('Save assessment error:', err);
      return jsonResponse(res, 500, { error: err.message });
    }
  }

  return jsonResponse(res, 405, { error: 'Method not allowed' });
};

