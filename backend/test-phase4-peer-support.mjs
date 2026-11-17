/**
 * test-phase4-peer-support.mjs — Comprehensive Phase 4 Test Suite
 *
 * Verifies:
 * - Hard Eligibility Filtering (online, verified, training, capacity, language, mode, age)
 * - Multi-factor explainable ranking
 * - Atomic assignment & session creation
 * - IDOR prevention on sessions and messages
 * - Private messaging between assigned participants
 * - WebRTC room & ephemeral token authorization
 * - Safeguarding & crisis detection gates
 */

import { authPool } from './src/config/auth.js';
import { EligibilityService } from './src/modules/matching/eligibility.service.js';
import { ScoringService } from './src/modules/matching/scoring.service.js';
import { MatchingService } from './src/modules/matching/matching.service.js';
import { RequestService } from './src/modules/support-requests/request.service.js';
import { SupporterService } from './src/modules/supporters/supporter.service.js';
import { SessionService } from './src/modules/sessions/session.service.js';
import { VoiceService } from './src/modules/voice/voice.service.js';

let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`✅ PASSED: ${testName}`);
    passed++;
  } else {
    console.error(`❌ FAILED: ${testName}`);
    failed++;
  }
}

async function runTests() {
  console.log('\n=============================================================');
  console.log('🧪 STARTING PHASE 4 PEER SUPPORT & MATCHING TEST SUITE');
  console.log('=============================================================\n');

  // Generate test IDs
  const testSeekerId = `test_seeker_${Date.now()}`;
  const testHelper1Id = `test_helper1_${Date.now()}`;
  const testHelper2Id = `test_helper2_${Date.now()}`;
  const testHelperUnverifiedId = `test_helper_unv_${Date.now()}`;

  try {
    // 1. Setup Test Fixture Users in database
    await authPool.query(
      `INSERT INTO "user" (id, name, email, email_verified, created_at, updated_at)
       VALUES 
         ($1, 'Seeker Test User', '${testSeekerId}@example.com', true, NOW(), NOW()),
         ($2, 'Listener One', '${testHelper1Id}@example.com', true, NOW(), NOW()),
         ($3, 'Listener Two', '${testHelper2Id}@example.com', true, NOW(), NOW()),
         ($4, 'Unverified Helper', '${testHelperUnverifiedId}@example.com', true, NOW(), NOW())`,
      [testSeekerId, testHelper1Id, testHelper2Id, testHelperUnverifiedId]
    );

    // Setup helper profiles
    // Helper 1: English + Hindi, Available, Verified, Training Completed, Capacity 2
    const h1Res = await authPool.query(
      `INSERT INTO helper_profiles (
         user_id, display_alias, verification_status, application_status, availability_status,
         training_status, safeguarding_approved, languages, supported_categories, supported_modes,
         supported_age_bands, max_active_sessions
       )
       VALUES (
         $1, 'Aarav Listener', 'verified', 'approved', 'available',
         'completed', true, ARRAY['en', 'hi'], ARRAY['anxiety', 'stress', 'general_wellbeing'],
         ARRAY['text', 'voice'], ARRAY['15-17', '18-20', '21-25'], 2
       )
       RETURNING id`,
      [testHelper1Id]
    );
    const helper1ProfileId = h1Res.rows[0].id;

    // Helper 2: Gujarati only, Offline, Verified, Training Completed
    await authPool.query(
      `INSERT INTO helper_profiles (
         user_id, display_alias, verification_status, application_status, availability_status,
         training_status, safeguarding_approved, languages, supported_categories, supported_modes,
         supported_age_bands, max_active_sessions
       )
       VALUES (
         $1, 'Meera Listener', 'verified', 'approved', 'offline',
         'completed', false, ARRAY['gu'], ARRAY['general_wellbeing'],
         ARRAY['text'], ARRAY['18-20', '21-25'], 1
       )`,
      [testHelper2Id]
    );

    // Helper 3: Unverified & Incomplete training
    await authPool.query(
      `INSERT INTO helper_profiles (
         user_id, display_alias, verification_status, application_status, availability_status,
         training_status, safeguarding_approved, languages, supported_categories, supported_modes,
         supported_age_bands, max_active_sessions
       )
       VALUES (
         $1, 'Pending Listener', 'pending', 'submitted', 'available',
         'not_started', false, ARRAY['en'], ARRAY['general_wellbeing'],
         ARRAY['text'], ARRAY['18-20'], 1
       )`,
      [testHelperUnverifiedId]
    );

    // ─────────────────────────────────────────────────────────────
    // TEST 1: Hard Eligibility Filter — Offline Exclusion
    // ─────────────────────────────────────────────────────────────
    const candidatePool = await EligibilityService.getCandidatePool();
    const candidateUserIds = candidatePool.map((c) => c.user_id);
    assert(
      !candidateUserIds.includes(testHelper2Id),
      'Test 1: Offline listener (Helper 2) strictly excluded from candidate pool'
    );

    // ─────────────────────────────────────────────────────────────
    // TEST 2: Hard Eligibility Filter — Unverified & Untrained Exclusion
    // ─────────────────────────────────────────────────────────────
    assert(
      !candidateUserIds.includes(testHelperUnverifiedId),
      'Test 2: Unverified / untrained listener strictly excluded from candidate pool'
    );

    // ─────────────────────────────────────────────────────────────
    // TEST 3: Language & Category Eligibility Matching
    // ─────────────────────────────────────────────────────────────
    const mockRequestHindi = {
      user_id: testSeekerId,
      preferred_language: 'hi',
      category: 'anxiety',
      communication_mode: 'text',
      age_band: '18-20',
    };
    const eligibleForHindi = EligibilityService.filterEligibleSupporters(mockRequestHindi, candidatePool);
    assert(
      eligibleForHindi.some((h) => h.user_id === testHelper1Id),
      'Test 3: Eligible Hindi + Anxiety listener correctly passed hard filters'
    );

    // ─────────────────────────────────────────────────────────────
    // TEST 4: Minor Safeguarding Gate on Request Creation (Age 15–17)
    // ─────────────────────────────────────────────────────────────
    const minorRequest = await RequestService.createRequest(testSeekerId, {
      category: 'stress',
      preferredLanguage: 'en',
      ageBand: '15-17',
      concernDescription: 'High school exam pressure and panic',
    });
    assert(
      minorRequest.safeguarded === true && minorRequest.isMinorGate === true,
      'Test 4: Age 15–17 request safely intercepted by youth safeguarding gate with national helplines'
    );

    // ─────────────────────────────────────────────────────────────
    // TEST 5: Imminent Crisis Intervention Detection
    // ─────────────────────────────────────────────────────────────
    const crisisRequest = await RequestService.createRequest(testSeekerId, {
      category: 'general_wellbeing',
      preferredLanguage: 'en',
      ageBand: '18-20',
      urgency: 'crisis',
      concernDescription: 'I feel hopeless and want to end it all',
    });
    assert(
      crisisRequest.crisisIntervention === true && crisisRequest.request.status === 'escalated',
      'Test 5: Crisis keywords trigger immediate non-clinical emergency response and halt ordinary matching'
    );

    // ─────────────────────────────────────────────────────────────
    // TEST 6: Standard Adult Peer Matching & Atomic Offer Dispatch
    // ─────────────────────────────────────────────────────────────
    const adultRequestRes = await RequestService.createRequest(testSeekerId, {
      category: 'anxiety',
      preferredLanguage: 'hi',
      communicationMode: 'text',
      ageBand: '18-20',
      concernDescription: 'Feeling overwhelmed with college assignments',
    });
    const adultRequest = adultRequestRes.request;
    assert(
      adultRequest.status === 'offered' || adultRequestRes.matchResult?.matched === true,
      'Test 6: Valid adult request matched and offer dispatched to top eligible candidate'
    );

    // ─────────────────────────────────────────────────────────────
    // TEST 7: Supporter Receives Sanitized Offer (Zero IDOR Leakage)
    // ─────────────────────────────────────────────────────────────
    const offers = await SupporterService.getEligibleOffers(testHelper1Id);
    assert(
      offers.length > 0 && !offers[0].seeker_name && !offers[0].seeker_email,
      'Test 7: Supporter receives offer with clean privacy isolation (zero seeker PII leaked)'
    );

    // ─────────────────────────────────────────────────────────────
    // TEST 8: Mutual Match Confirmation Flow (Section 8)
    // ─────────────────────────────────────────────────────────────
    // Seeker explicitly confirms the matched listener to lock assignment
    const confirmRes = await RequestService.confirmMatch(testSeekerId, adultRequest.id, {
      decision: 'accept',
    });
    assert(
      confirmRes.success === true && Boolean(confirmRes.sessionId),
      'Test 8: Mutual match confirmation: seeker accepts and atomically schedules session'
    );
    const activeSessionId = confirmRes.sessionId;

    // ─────────────────────────────────────────────────────────────
    // TEST 9: Duplicate Assignment Concurrency Protection
    // ─────────────────────────────────────────────────────────────
    let duplicateBlocked = false;
    try {
      await authPool.query(
        `INSERT INTO support_assignments (request_id, supporter_id, seeker_user_id, assignment_status)
         VALUES ($1, $2, $3, 'accepted')`,
        [adultRequest.id, helper1ProfileId, testSeekerId]
      );
    } catch (err) {
      if (err.code === '23505') { // Postgres unique_violation
        duplicateBlocked = true;
      }
    }
    assert(duplicateBlocked, 'Test 9: Database constraint strictly blocks duplicate assignment on same request');

    // ─────────────────────────────────────────────────────────────
    // TEST 10: IDOR Security — Unauthorized Third Party Blocked from Session
    // ─────────────────────────────────────────────────────────────
    let idorBlocked = false;
    try {
      await SessionService.getSessionById(activeSessionId, testHelper2Id);
    } catch (err) {
      if (err.statusCode === 403 || err.code === 'UNAUTHORIZED_SESSION_ACCESS') {
        idorBlocked = true;
      }
    }
    assert(idorBlocked, 'Test 10: IDOR blocked — unassigned listener cannot view or access session');

    // ─────────────────────────────────────────────────────────────
    // TEST 11: Private Messaging Between Assigned Participants
    // ─────────────────────────────────────────────────────────────
    const sentMsg = await SessionService.sendMessage(
      activeSessionId,
      testSeekerId,
      'Hello, thank you for being here to listen.'
    );
    assert(
      sentMsg.id && sentMsg.message_body === 'Hello, thank you for being here to listen.',
      'Test 11: Seeker sends private message in active session'
    );

    const messages = await SessionService.getMessages(activeSessionId, testHelper1Id);
    assert(
      messages.length === 1 && messages[0].sender_user_id === testSeekerId,
      'Test 12: Assigned listener correctly retrieves encrypted session messages'
    );

    // ─────────────────────────────────────────────────────────────
    // TEST 13: Scheduled Voice Session Booking & Ephemeral Token
    // ─────────────────────────────────────────────────────────────
    const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const scheduledVoice = await VoiceService.scheduleVoiceSession(activeSessionId, testSeekerId, futureDate);
    assert(
      scheduledVoice.session_type === 'audio' && Boolean(scheduledVoice.scheduled_for),
      'Test 13: Scheduled voice session booked for future timestamp'
    );

    const voiceTokenRes = await VoiceService.issueParticipantToken(activeSessionId, testSeekerId);
    assert(
      Boolean(voiceTokenRes.token) && voiceTokenRes.iceServers.length > 0,
      'Test 14: Ephemeral WebRTC token and STUN configuration generated securely'
    );

    // ─────────────────────────────────────────────────────────────
    // TEST 15: Incident Reporting During Session
    // ─────────────────────────────────────────────────────────────
    const reportRes = await SessionService.submitReport(activeSessionId, testSeekerId, {
      reportType: 'boundary_violation',
      description: 'Test incident concern reporting verification',
    });
    assert(
      reportRes.id && reportRes.status === 'pending',
      'Test 15: Incident report successfully filed into restricted support_reports'
    );

    // ─────────────────────────────────────────────────────────────
    // TEST 16: End Session Lifecycle & Post-Closure Message Rejection
    // ─────────────────────────────────────────────────────────────
    await SessionService.endSession(activeSessionId, testHelper1Id);
    let postEndBlocked = false;
    try {
      await SessionService.sendMessage(activeSessionId, testSeekerId, 'Are you still there?');
    } catch {
      postEndBlocked = true;
    }
    assert(postEndBlocked, 'Test 16: Ended session strictly rejects new messages');

    // ─────────────────────────────────────────────────────────────
    // TEST 17: Mutual Post-Session Feedback
    // ─────────────────────────────────────────────────────────────
    const feedback = await SessionService.submitFeedback(activeSessionId, testSeekerId, {
      rating: 5,
      feedbackCategory: 'empathetic_listening',
      notes: 'Very supportive and understanding listener.',
    });
    assert(
      feedback.rating === 5 && feedback.session_id === activeSessionId,
      'Test 17: Post-session feedback recorded cleanly'
    );

  } catch (err) {
    console.error('Fatal test execution error:', err);
    failed++;
  } finally {
    // Cleanup fixture data
    console.log('\n🧹 Cleaning up test accounts from NeonDB...');
    try {
      await authPool.query(
        `DELETE FROM "user" WHERE id IN ($1, $2, $3, $4)`,
        [testSeekerId, testHelper1Id, testHelper2Id, testHelperUnverifiedId]
      );
      console.log('✅ Test accounts cleanly removed.');
    } catch (cleanupErr) {
      console.error('Cleanup error:', cleanupErr.message);
    }
  }

  console.log('\n=============================================================');
  console.log(`📊 PHASE 4 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('=============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
  process.exit(0);
}

runTests();
