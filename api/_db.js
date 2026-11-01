const { neon } = require('@neondatabase/serverless');
const crypto = require('crypto');

const DEFAULT_DATABASE_URL = 'postgresql://neondb_owner:npg_b5MlSGgrIu2i@ep-autumn-paper-b5vo9bek-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require';
const DATABASE_URL = process.env.DATABASE_URL || process.env.VITE_DATABASE_URL || DEFAULT_DATABASE_URL;

const sql = neon(DATABASE_URL);

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  try {
    if (!storedHash || !storedHash.includes(':')) return false;
    const [salt, key] = storedHash.split(':');
    const keyBuffer = Buffer.from(key, 'hex');
    const derived = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derived);
  } catch (err) {
    console.error('Password verify error:', err);
    return false;
  }
}

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Helper to parse JSON request body across Vercel serverless and standard Node
 */
async function parseBody(req) {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }
  if (req.body && typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch (_) {
      return {};
    }
  }
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk) => { data += chunk; });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (e) {
        resolve({});
      }
    });
  });
}

function jsonResponse(res, statusCode, data) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.end(JSON.stringify(data));
}

/**
 * Extracts and verifies session token from Authorization header
 */
async function getUserFromRequest(req) {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      return null;
    }
    const token = authHeader.substring(7).trim();
    if (!token) return null;

    const sessions = await sql.query(
      'SELECT s.user_id, s.expires_at, u.id, u.email, u.name, u.nickname, u.role, u.avatar, u.plan, u.profile_type, u.qualification, u.languages, u.is_verified, u.is_online FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token = $1 AND s.expires_at > NOW() LIMIT 1',
      [token]
    );

    if (sessions && sessions.length > 0) {
      return sessions[0];
    }
    return null;
  } catch (err) {
    console.error('getUserFromRequest error:', err);
    return null;
  }
}

module.exports = {
  sql,
  DATABASE_URL,
  hashPassword,
  verifyPassword,
  generateToken,
  parseBody,
  jsonResponse,
  getUserFromRequest
};

