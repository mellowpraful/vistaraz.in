/**
 * voice.controller.js — Voice Room & Ephemeral Token Controller
 */

import { VoiceService } from './voice.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';

export async function createVoiceRoom(req, res) {
  try {
    const { id } = req.params;
    const room = await VoiceService.getOrCreateVoiceRoom(id, req.user.id);
    return sendSuccess(res, room, 'Voice room ready', 201);
  } catch (err) {
    const status = err.statusCode || 400;
    return sendError(res, err.message, status, err.code || 'VOICE_ROOM_FAILED');
  }
}

export async function issueVoiceToken(req, res) {
  try {
    const { id } = req.params;
    const tokenData = await VoiceService.issueParticipantToken(id, req.user.id);
    return sendSuccess(res, tokenData, 'Voice participant token issued');
  } catch (err) {
    const status = err.statusCode || 400;
    return sendError(res, err.message, status, err.code || 'TOKEN_ISSUANCE_FAILED');
  }
}

export async function endVoiceRoom(req, res) {
  try {
    const { id } = req.params;
    const result = await VoiceService.closeVoiceRoom(id, req.user.id);
    return sendSuccess(res, result, 'Voice room closed successfully');
  } catch (err) {
    const status = err.statusCode || 400;
    return sendError(res, err.message, status, err.code || 'VOICE_CLOSE_FAILED');
  }
}
