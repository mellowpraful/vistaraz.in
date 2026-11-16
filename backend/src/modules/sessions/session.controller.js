/**
 * session.controller.js — Support Sessions REST Controller
 */

import { SessionService } from './session.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';

export async function getMySessions(req, res) {
  try {
    const sessions = await SessionService.getMySessions(req.user.id);
    return sendSuccess(res, sessions, 'Sessions retrieved successfully');
  } catch (err) {
    return sendError(res, err.message, 500, 'SERVER_ERROR');
  }
}

export async function getSessionById(req, res) {
  try {
    const { id } = req.params;
    const session = await SessionService.getSessionById(id, req.user.id);
    return sendSuccess(res, session, 'Session details retrieved');
  } catch (err) {
    const status = err.statusCode || 500;
    return sendError(res, err.message, status, err.code || 'SESSION_ERROR');
  }
}

export async function startSession(req, res) {
  try {
    const { id } = req.params;
    const session = await SessionService.startSession(id, req.user.id);
    return sendSuccess(res, session, 'Session started successfully');
  } catch (err) {
    const status = err.statusCode || 400;
    return sendError(res, err.message, status, err.code || 'SESSION_START_FAILED');
  }
}

export async function endSession(req, res) {
  try {
    const { id } = req.params;
    const session = await SessionService.endSession(id, req.user.id);
    return sendSuccess(res, session, 'Session ended successfully');
  } catch (err) {
    const status = err.statusCode || 400;
    return sendError(res, err.message, status, err.code || 'SESSION_END_FAILED');
  }
}

export async function getSessionMessages(req, res) {
  try {
    const { id } = req.params;
    const { limit, before } = req.query;
    const messages = await SessionService.getMessages(id, req.user.id, limit, before);
    return sendSuccess(res, messages, 'Session messages retrieved');
  } catch (err) {
    const status = err.statusCode || 500;
    return sendError(res, err.message, status, err.code || 'MESSAGE_RETRIEVAL_FAILED');
  }
}

export async function sendSessionMessage(req, res) {
  try {
    const { id } = req.params;
    const { messageBody } = req.body;
    const message = await SessionService.sendMessage(id, req.user.id, messageBody);
    return sendSuccess(res, message, 'Message sent successfully', 201);
  } catch (err) {
    const status = err.statusCode || 400;
    return sendError(res, err.message, status, err.code || 'MESSAGE_SEND_FAILED');
  }
}

export async function submitSessionFeedback(req, res) {
  try {
    const { id } = req.params;
    const feedback = await SessionService.submitFeedback(id, req.user.id, req.body);
    return sendSuccess(res, feedback, 'Feedback recorded successfully');
  } catch (err) {
    const status = err.statusCode || 400;
    return sendError(res, err.message, status, err.code || 'FEEDBACK_SUBMISSION_FAILED');
  }
}

export async function reportSessionConcern(req, res) {
  try {
    const { id } = req.params;
    const report = await SessionService.submitReport(id, req.user.id, req.body);
    return sendSuccess(res, report, 'Concern reported. Our safety team will review this incident.');
  } catch (err) {
    const status = err.statusCode || 400;
    return sendError(res, err.message, status, err.code || 'REPORT_FAILED');
  }
}
