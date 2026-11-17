/**
 * session.routes.js — Support Sessions & Voice REST API Routes
 *
 * Implements Section 8.3 & 8.4 API specification.
 */

import { Router } from 'express';
import { requireAuth } from '../../middleware/rbac.js';
import {
  getMySessions,
  getSessionById,
  startSession,
  endSession,
  getSessionMessages,
  sendSessionMessage,
  submitSessionFeedback,
  reportSessionConcern,
} from './session.controller.js';
import {
  createVoiceRoom,
  issueVoiceToken,
  issueVoiceJoinToken,
  scheduleVoiceSession,
  endVoiceRoom,
} from '../voice/voice.controller.js';

const router = Router();

router.use(requireAuth);

// Session overview & management
router.get('/me', getMySessions);
router.get('/:id', getSessionById);
router.post('/:id/start', startSession);
router.post('/:id/end', endSession);

// Private session messaging
router.get('/:id/messages', getSessionMessages);
router.post('/:id/messages', sendSessionMessage);

// Session reporting & feedback
router.post('/:id/feedback', submitSessionFeedback);
router.post('/:id/report', reportSessionConcern);

// WebRTC Voice Communication
router.post('/:id/voice-room', createVoiceRoom);
router.post('/:id/voice-token', issueVoiceToken);
router.post('/:id/voice/schedule', scheduleVoiceSession);
router.post('/:id/voice/join-token', issueVoiceJoinToken);
router.post('/:id/voice/end', endVoiceRoom);

export default router;
