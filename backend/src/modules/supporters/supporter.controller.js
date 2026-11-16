/**
 * supporter.controller.js — Peer Supporter REST Controllers
 */

import { SupporterService } from './supporter.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';

export async function getMySupporterProfile(req, res) {
  try {
    const profile = await SupporterService.getProfileByUserId(req.user.id);
    if (!profile) {
      return sendError(res, 'Supporter profile not found. Please complete listener onboarding.', 404, 'NOT_FOUND');
    }
    return sendSuccess(res, profile, 'Supporter profile retrieved successfully');
  } catch (err) {
    return sendError(res, err.message, 500, 'SERVER_ERROR');
  }
}

export async function updateMySupporterProfile(req, res) {
  try {
    const updated = await SupporterService.updateProfile(req.user.id, req.body);
    return sendSuccess(res, updated, 'Supporter profile updated successfully');
  } catch (err) {
    return sendError(res, err.message, 400, 'UPDATE_ERROR');
  }
}

export async function getMySupporterStatus(req, res) {
  try {
    const profile = await SupporterService.getProfileByUserId(req.user.id);
    if (!profile) {
      return sendSuccess(res, { isRegistered: false }, 'No supporter profile');
    }
    return sendSuccess(
      res,
      {
        isRegistered: true,
        verificationStatus: profile.verification_status,
        applicationStatus: profile.application_status,
        availabilityStatus: profile.availability_status,
        trainingStatus: profile.training_status,
        safeguardingApproved: profile.safeguarding_approved,
        maxActiveSessions: profile.max_active_sessions,
        activeSessionsCount: profile.active_sessions_count,
      },
      'Supporter operational status'
    );
  } catch (err) {
    return sendError(res, err.message, 500, 'SERVER_ERROR');
  }
}

export async function updateMyAvailability(req, res) {
  try {
    const updated = await SupporterService.updateAvailability(req.user.id, req.body);
    return sendSuccess(res, updated, 'Availability updated successfully');
  } catch (err) {
    return sendError(res, err.message, 400, 'AVAILABILITY_ERROR');
  }
}

export async function getMyOffers(req, res) {
  try {
    const offers = await SupporterService.getEligibleOffers(req.user.id);
    return sendSuccess(res, offers, 'Eligible support offers retrieved');
  } catch (err) {
    return sendError(res, err.message, 500, 'SERVER_ERROR');
  }
}

export async function acceptOffer(req, res) {
  try {
    const { id } = req.params;
    const result = await SupporterService.acceptOffer(req.user.id, id);
    return sendSuccess(res, result, 'Support offer accepted. Active session initiated.');
  } catch (err) {
    return sendError(res, err.message, 400, 'ACCEPT_ERROR');
  }
}

export async function declineOffer(req, res) {
  try {
    const { id } = req.params;
    const result = await SupporterService.declineOffer(req.user.id, id);
    return sendSuccess(res, result, 'Support offer declined.');
  } catch (err) {
    return sendError(res, err.message, 400, 'DECLINE_ERROR');
  }
}
