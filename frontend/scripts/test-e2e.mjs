/**
 * E2E Frontend-to-Backend Authentication Test Runner
 * Starts backend server, executes verify-auth-flows.mjs against live endpoints, and cleanly shuts down.
 */

import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendDir = path.resolve(__dirname, '../../backend');

console.log('🚀 Spawning Vistaraz backend server for E2E authentication validation...');

const backend = spawn('node', ['src/server.js'], {
  cwd: backendDir,
  stdio: ['ignore', 'pipe', 'pipe'],
  env: { ...process.env, PORT: '5000', NODE_ENV: 'development' },
});

let serverReady = false;

backend.stdout.on('data', (d) => {
  const msg = d.toString();
  if (msg.includes('Vistaraz sanctuary backend listening') || msg.includes('5000')) {
    serverReady = true;
  }
  process.stdout.write(msg);
});

backend.stderr.on('data', (d) => {
  process.stderr.write(d.toString());
});

// Poll for server readiness
const maxWaitMs = 12000;
const start = Date.now();

while (!serverReady && Date.now() - start < maxWaitMs) {
  try {
    const res = await fetch('http://localhost:5000/api/health');
    if (res.ok) {
      serverReady = true;
      break;
    }
  } catch {
    await new Promise((r) => setTimeout(r, 400));
  }
}

if (!serverReady) {
  console.error('❌ Failed to connect to backend server within timeout.');
  backend.kill('SIGTERM');
  process.exit(1);
}

console.log('✅ Backend server is online and healthy at http://localhost:5000');

try {
  // Execute verify-auth-flows.mjs
  await import('./verify-auth-flows.mjs');
} finally {
  console.log('🧹 Shutting down backend test server process...');
  backend.kill('SIGTERM');
  await new Promise((r) => setTimeout(r, 500));
  backend.kill('SIGKILL');

  // Clean up any test users created during the run
  try {
    const { getPool, closePool } = await import('../../backend/src/config/db.js');
    const pool = getPool();
    await pool.query("DELETE FROM \"user\" WHERE email LIKE 'frontend_test_%'");
    await closePool();
    console.log('✅ Cleaned up temporary test accounts from database.');
  } catch {
    // Non-fatal cleanup
  }
}
