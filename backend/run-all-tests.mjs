/**
 * run-all-tests.mjs
 * Master test runner that runs all test suites sequentially and provides
 * complete reconciled test results across the entire Vistaraz platform.
 */

import { spawn } from 'child_process';
import http from 'http';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function waitForHealth(maxAttempts = 30) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const check = () => {
      attempts++;
      const req = http.get('http://127.0.0.1:5000/api/health', (res) => {
        if (res.statusCode === 200) {
          resolve();
        } else if (attempts < maxAttempts) {
          setTimeout(check, 500);
        } else {
          reject(new Error(`Server health check failed with status ${res.statusCode}`));
        }
      });
      req.on('error', () => {
        if (attempts < maxAttempts) {
          setTimeout(check, 500);
        } else {
          reject(new Error('Server did not start within expected time'));
        }
      });
    };
    check();
  });
}

function runScript(scriptPath, cwd = rootDir) {
  return new Promise((resolve) => {
    console.log(`\n============================================================`);
    console.log(`▶ RUNNING: ${scriptPath}`);
    console.log(`============================================================`);
    const proc = spawn('node', [scriptPath], {
      cwd,
      stdio: 'inherit',
      shell: true,
      env: { ...process.env },
    });
    proc.on('close', (code) => {
      resolve({ path: scriptPath, exitCode: code });
    });
  });
}

async function main() {
  console.log('🚀 Executing standalone test suites first...\n');

  const standaloneSuites = [
    { name: 'Database Health & Connection Resilience', path: 'backend/test-db-health.mjs' },
    { name: 'NeonDB Schema, Migrations & Cascades', path: 'backend/test-schema-validation.mjs' },
    { name: 'Better Auth & RBAC Security Suite', path: 'backend/test-phase4-rbac.mjs' },
    { name: 'Seeker Profile Setup & Idempotent Upsert', path: 'backend/test-seeker-profile-flow.mjs' },
    { name: 'Client Panel & User Data Isolation', path: 'backend/test-client-panel.mjs' },
    { name: 'Frontend Role Normalization & LocalStorage Security', path: 'frontend/scripts/verify-auth-flows.mjs' },
  ];

  const results = [];
  for (const suite of standaloneSuites) {
    const res = await runScript(suite.path);
    results.push({ ...suite, exitCode: res.exitCode });
  }

  console.log('\n🚀 Starting Vistaraz API Server for Live Integration Test Suites...');
  const server = spawn('node', ['src/server.js'], {
    cwd: path.resolve(rootDir, 'backend'),
    stdio: 'ignore',
    shell: true,
    env: { ...process.env, PORT: '5000' },
  });

  try {
    await waitForHealth();
    console.log('✅ API Server is live on http://127.0.0.1:5000\n');

    const liveSuites = [
      { name: 'Admin Portal RBAC & Privilege Escalation', path: 'backend/test-admin-portal.mjs' },
      { name: 'Phase 3 Independent Verification (Crisis, Helper, Posts)', path: 'backend/test-phase3-verification.mjs' },
    ];

    for (const suite of liveSuites) {
      const res = await runScript(suite.path);
      results.push({ ...suite, exitCode: res.exitCode });
    }
  } catch (err) {
    console.error('Fatal live runner error:', err);
  } finally {
    console.log('\n🛑 Stopping API Server...');
    server.kill();
  }

  console.log('\n============================================================');
  console.log('🏁 GRAND TEST EXECUTION SUMMARY');
  console.log('============================================================');
  let allPassed = true;
  for (const r of results) {
    const status = r.exitCode === 0 ? '✅ PASSED' : '❌ FAILED';
    if (r.exitCode !== 0) allPassed = false;
    console.log(`${status} — ${r.name} (${r.path})`);
  }
  console.log('============================================================');
  if (allPassed) {
    console.log('🎉 ALL TEST SUITES COMPLETED WITH 100% PASS RATE!');
  } else {
    console.log('⚠️ SOME SUITES ENCOUNTERED FAILURES');
  }
}

main();
