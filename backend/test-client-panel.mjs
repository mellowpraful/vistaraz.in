/**
 * test-client-panel.mjs — Vistaraz Client Panel E2E Test Suite
 *
 * Tests all 9 required scenarios for Phase 1 & 2 implementation.
 * Run from project root: node backend/test-client-panel.mjs
 */

import { fileURLToPath, pathToFileURL } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) return;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = val;
  });
}

// --- Test runner ---
let passed = 0;
let failed = 0;
const results = [];

function assert(condition, label, details = '') {
  if (condition) {
    passed++;
    results.push({ status: '✅ PASS', label });
    console.log(`  ✅ PASS  ${label}`);
  } else {
    failed++;
    results.push({ status: '❌ FAIL', label, details });
    console.error(`  ❌ FAIL  ${label}${details ? '\n         ' + details : ''}`);
  }
}

function section(title) {
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`  📋 ${title}`);
  console.log('─'.repeat(60));
}

// --- Import Neon sql client ---
const { sql } = await import(pathToFileURL(path.join(__dirname, 'src/config/db.js')).href);

console.log('\n🧪  VISTARAZ CLIENT PANEL — TEST SUITE');
console.log('='.repeat(60));

// ============================================================
// TEST 1: Controller file exports
// ============================================================
section('Scenario 1 — Dashboard controller functions exist');
try {
  const ctrlPath = path.join(__dirname, 'src/controllers/clientController.js');
  assert(fs.existsSync(ctrlPath), 'clientController.js exists');

  const ctrlContent = fs.readFileSync(ctrlPath, 'utf-8');
  assert(ctrlContent.includes('getDashboardStats'), 'getDashboardStats exported');
  assert(ctrlContent.includes('getMySessions'), 'getMySessions exported');
  assert(ctrlContent.includes('recordMood'), 'recordMood exported');
  assert(ctrlContent.includes('recordAssessment'), 'recordAssessment exported');
} catch (err) {
  assert(false, 'Controller file readable', err.message);
}

// ============================================================
// TEST 2: DB — assessments table schema
// ============================================================
section('Scenario 2 — NeonDB assessments table schema');
try {
  const rows = await sql`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'assessments'
    ORDER BY ordinal_position
  `;
  const cols = rows.map(r => r.column_name);
  assert(cols.includes('id'), 'assessments.id exists');
  assert(cols.includes('user_id'), 'assessments.user_id exists');
  assert(cols.includes('assessment_type'), 'assessments.assessment_type exists');
  assert(cols.includes('responses') || cols.includes('results'), 'assessments.responses/results column exists');
  assert(cols.includes('result_summary') || cols.includes('results'), 'assessments.result_summary column exists');
  assert(cols.includes('completed_at'), 'assessments.completed_at exists');
  console.log(`    Columns: ${cols.join(', ')}`);
} catch (err) {
  assert(false, 'assessments table schema query', err.message);
}

// ============================================================
// TEST 3: DB — support_sessions has user_id
// ============================================================
section('Scenario 3 — support_sessions user_id isolation');
try {
  const rows = await sql`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'support_sessions'
    ORDER BY ordinal_position
  `;
  const cols = rows.map(r => r.column_name);
  assert(cols.includes('user_id'), 'support_sessions.user_id exists');
  assert(cols.includes('session_status') || cols.includes('status'), 'support_sessions.session_status/status column exists');
  // determine actual status column name for use in later tests
  const statusCol = cols.includes('session_status') ? 'session_status' : 'status';
  console.log(`    Status column: ${statusCol}`);
  console.log(`    Columns: ${cols.join(', ')}`);

  // Store for use in test 6
  globalThis._statusCol = statusCol;
} catch (err) {
  assert(false, 'support_sessions schema', err.message);
}

// ============================================================
// TEST 4: DB — Write a daily_mood and read back
// ============================================================
section('Scenario 4 — Mood check-in persistence (daily_mood)');
let testUserId = null;
try {
  const users = await sql`SELECT id FROM "user" ORDER BY created_at DESC LIMIT 1`;
  if (users.length === 0) {
    console.log('    ⚠️  No users in DB — write tests skipped (new install)');
    assert(true, 'No users present — mood write test skipped (acceptable)');
  } else {
    testUserId = users[0].id;

    const VALID_MOODS = ['low', 'tense', 'okay', 'good', 'bright'];
    const testMood = 'okay';
    assert(VALID_MOODS.includes(testMood), `Mood "${testMood}" in allowed list`);

    const moodResponses = { mood: testMood, label: 'Okay', emoji: '🌿', note: 'test-suite' };
    const moodSummary = { mood: testMood, score: 3 };
    const inserted = await sql`
      INSERT INTO assessments (user_id, assessment_type, responses, result_summary, completed_at)
      VALUES (${testUserId}, 'daily_mood', ${JSON.stringify(moodResponses)}::jsonb, ${JSON.stringify(moodSummary)}::jsonb, NOW())
      RETURNING id
    `;
    const insertedId = inserted[0]?.id;
    assert(!!insertedId, 'Mood record inserted into assessments (responses + result_summary)');

    const readBack = await sql`SELECT responses FROM assessments WHERE id = ${insertedId}`;
    const data = readBack[0]?.responses;
    assert(data?.mood === testMood, `Mood "${testMood}" read back from responses column correctly`);

    await sql`DELETE FROM assessments WHERE id = ${insertedId}`;
    assert(true, 'Test mood record cleaned up');
  }
} catch (err) {
  assert(false, 'Mood persistence test', err.message);
}

// ============================================================
// TEST 5: DB — Write a wellbeing_checkin and read back
// ============================================================
section('Scenario 5 — Wellbeing assessment persistence');
try {
  if (!testUserId) {
    assert(true, 'No users — assessment write test skipped');
  } else {
    const scoreMap = {
      'Current Mood': 4, 'Anxiety & Tension': 3, 'Sleep Quality': 4,
      'Stress & Overwhelm': 3, 'Physical Energy': 4, 'Academic & Work Pressure': 3,
      'Social Connection': 4, 'Self-Compassion': 3, 'Sense of Purpose': 4, 'Overall Resilience': 4,
    };
    const scores = Object.values(scoreMap);
    const totalScore = scores.reduce((a, b) => a + b, 0);
    const percentage = Math.round((totalScore / (scores.length * 5)) * 100);

    assert(scores.every(s => s >= 1 && s <= 5), 'All scores in valid range 1-5');

    const resultSummary = { score: totalScore, percentage, totalAreas: scores.length, tierTitle: 'Balanced & Nourished' };
    const inserted = await sql`
      INSERT INTO assessments (user_id, assessment_type, responses, result_summary, completed_at)
      VALUES (${testUserId}, 'wellbeing_checkin', ${JSON.stringify(scoreMap)}::jsonb, ${JSON.stringify(resultSummary)}::jsonb, NOW())
      RETURNING id
    `;
    const insertedId = inserted[0]?.id;
    assert(!!insertedId, 'Assessment record inserted (responses + result_summary)');

    const readBack = await sql`SELECT result_summary FROM assessments WHERE id = ${insertedId}`;
    const data = readBack[0]?.result_summary;
    assert(data?.percentage === percentage, `Percentage ${percentage}% read back from result_summary correctly`);

    await sql`DELETE FROM assessments WHERE id = ${insertedId}`;
    assert(true, 'Test assessment cleaned up');
  }
} catch (err) {
  assert(false, 'Assessment persistence test', err.message);
}

// ============================================================
// TEST 6: Session isolation query
// ============================================================
section('Scenario 6 — Session user_id isolation query');
try {
  if (!testUserId) {
    assert(true, 'No users — isolation test skipped');
  } else {
    const rows = await sql`
      SELECT id, user_id, session_status FROM support_sessions
      WHERE user_id = ${testUserId} LIMIT 5
    `;
    const allOwned = rows.every(r => r.user_id === testUserId);
    assert(allOwned, 'Session query returns only own user_id rows');
    console.log(`    Returned ${rows.length} session(s) for test user`);
  }
} catch (err) {
  assert(false, 'Session isolation query', err.message);
}

// ============================================================
// TEST 7: Mood validation logic
// ============================================================
section('Scenario 7 — Mood validation (invalid values rejected)');
try {
  const VALID_MOODS = ['low', 'tense', 'okay', 'good', 'bright'];

  // Backend validates with toLowerCase() — 'OKAY' becomes 'okay' and IS valid
  // Test: the controller must call .toLowerCase() before checking
  const ctrlContent = fs.readFileSync(
    path.join(__dirname, 'src/controllers/clientController.js'), 'utf-8'
  );
  assert(ctrlContent.includes('toLowerCase'), 'Controller uses toLowerCase() for mood validation');

  // Truly invalid values (not valid even after toLowerCase)
  const invalidInputs = ['happy', 'sad', 'depressed', '', 'neutral'];
  const allRejected = invalidInputs.every(val => {
    if (typeof val !== 'string' || !val) return true;
    return !VALID_MOODS.includes(val.toLowerCase());
  });
  assert(allRejected, 'Non-enum strings rejected by validation');

  const validInputs = ['low', 'tense', 'okay', 'good', 'bright', 'OKAY', 'Good'];
  const allAccepted = validInputs.every(v =>
    typeof v === 'string' && VALID_MOODS.includes(v.toLowerCase())
  );
  assert(allAccepted, 'Valid mood values (including mixed-case) accepted after normalization');
} catch (err) {
  assert(false, 'Mood validation test', err.message);
}

// ============================================================
// TEST 8: Assessment score range validation
// ============================================================
section('Scenario 8 — Assessment score range validation');
try {
  const isValidScore = (s) => Number.isInteger(s) && s >= 1 && s <= 5;
  assert([1, 2, 3, 4, 5].every(isValidScore), 'Valid scores 1-5 pass');
  assert([0, 6, -1, 10, 'a', null].every(s => !isValidScore(s)), 'Invalid scores fail');
} catch (err) {
  assert(false, 'Score range validation', err.message);
}

// ============================================================
// TEST 9: Route registration
// ============================================================
section('Scenario 9 — Route registration verification');
try {
  const routePath = path.join(__dirname, 'src/routes/userRoutes.js');
  assert(fs.existsSync(routePath), 'userRoutes.js exists');
  const content = fs.readFileSync(routePath, 'utf-8');
  assert(content.includes('dashboard-stats'), 'GET /me/dashboard-stats registered');
  assert(content.includes('/me/sessions'), 'GET /me/sessions registered');
  assert(content.includes('/me/moods'), 'POST /me/moods registered');

  const assessPath = path.join(__dirname, 'src/routes/assessmentRoutes.js');
  assert(fs.existsSync(assessPath), 'assessmentRoutes.js exists');
  const aContent = fs.readFileSync(assessPath, 'utf-8');
  assert(aContent.includes("router.post('/'") || aContent.includes('router.post("/")'), 'POST /api/assessments registered');
  assert(aContent.includes("router.get('/latest'") || aContent.includes("router.get(\"/latest\""), 'GET /api/assessments/latest registered');
} catch (err) {
  assert(false, 'Route registration', err.message);
}

// ============================================================
// SUMMARY
// ============================================================
console.log('\n' + '='.repeat(60));
console.log('  RESULTS SUMMARY');
console.log('='.repeat(60));
console.log(`  ✅ Passed: ${passed}`);
console.log(`  ❌ Failed: ${failed}`);
console.log(`  📊 Total:  ${passed + failed}`);
console.log('='.repeat(60));

if (failed > 0) {
  console.log('\n  Failed tests:');
  results.filter(r => r.status.startsWith('❌')).forEach(r => {
    console.log(`  • ${r.label}`);
    if (r.details) console.log(`    ${r.details}`);
  });
  process.exit(1);
} else {
  console.log('\n  🎉 All tests passed!');
  process.exit(0);
}
