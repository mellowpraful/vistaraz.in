/**
 * request.controller.js — Seeker Support Request Controller
 */

import { RequestService } from './request.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';

export async function createSupportRequest(req, res) {
  try {
    const result = await RequestService.createRequest(req.user.id, req.body);
    return sendSuccess(res, result, 'Support request processed successfully', 201);
  } catch (err) {
    return sendError(res, err.message, 400, 'REQUEST_CREATION_FAILED');
  }
}

export async function getMySupportRequests(req, res) {
  try {
    const requests = await RequestService.getMyRequests(req.user.id);
    return sendSuccess(res, requests, 'Support requests retrieved successfully');
  } catch (err) {
    return sendError(res, err.message, 500, 'SERVER_ERROR');
  }
}

export async function getSupportRequestById(req, res) {
  try {
    const { id } = req.params;
    const request = await RequestService.getRequestById(req.user.id, id);
    if (!request) {
      return sendError(res, 'Support request not found.', 404, 'NOT_FOUND');
    }
    return sendSuccess(res, request, 'Support request details retrieved');
  } catch (err) {
    return sendError(res, err.message, 500, 'SERVER_ERROR');
  }
}

export async function cancelSupportRequest(req, res) {
  try {
    const { id } = req.params;
    const cancelled = await RequestService.cancelRequest(req.user.id, id);
    return sendSuccess(res, cancelled, 'Support request cancelled successfully');
  } catch (err) {
    return sendError(res, err.message, 400, 'CANCEL_FAILED');
  }
}

export async function getMatchStatus(req, res) {
  try {
    const { id } = req.params;
    const matchStatus = await RequestService.getMatchStatus(req.user.id, id);
    return sendSuccess(res, matchStatus, 'Match status retrieved');
  } catch (err) {
    return sendError(res, err.message, 400, 'MATCH_STATUS_ERROR');
  }
}

export async function rematchSupportRequest(req, res) {
  try {
    const { id } = req.params;
    const rematchResult = await RequestService.rematch(req.user.id, id);
    return sendSuccess(res, rematchResult, 'Rematching initiated', 202);
  } catch (err) {
    return sendError(res, err.message, 400, 'REMATCH_FAILED');
  }
}

export async function confirmMatch(req, res) {
  try {
    const { id } = req.params;
    const { offerId, decision } = req.body;
    const result = await RequestService.confirmMatch(req.user.id, id, { offerId, decision });
    return sendSuccess(res, result, result.message || 'Match confirmation recorded');
  } catch (err) {
    return sendError(res, err.message, 400, 'CONFIRMATION_FAILED');
  }
}
