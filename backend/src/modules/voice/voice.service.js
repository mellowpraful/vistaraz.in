/**
 * voice.service.js — WebRTC Voice Room & Ephemeral Token Service
 *
 * Implements Section 10 & Section 8.4 of the Phase 4 specification.
 * - Restricts voice room creation strictly to assigned session participants
 * - Generates ephemeral, cryptographically secure room participant tokens
 * - Supplies standard STUN ICE servers for peer-to-peer audio
 * - Manages clean room teardown
 * - STRICT SAFETY RULE: Call recording is NEVER enabled by default.
 */

import crypto from 'crypto';
import { authPool } from '../../config/auth.js';
import { SessionService } from '../sessions/session.service.js';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

export class VoiceService {
  /**
   * Creates or fetches an authorized voice room for a support session.
   */
  static async getOrCreateVoiceRoom(sessionId, userId) {
    const { session, roleInSession } = await SessionService.verifyParticipant(sessionId, userId);

    if (['completed', 'cancelled', 'no_show'].includes(session.session_status)) {
      throw new Error('Cannot create voice room for an ended session.');
    }

    // Check existing room
    const existing = await authPool.query(
      `SELECT * FROM voice_rooms WHERE session_id = $1`,
      [sessionId]
    );

    let room = existing.rows[0];
    if (!room) {
      const providerRoomId = `vistaraz-voice-${sessionId}-${crypto.randomBytes(4).toString('hex')}`;
      const insertRes = await authPool.query(
        `INSERT INTO voice_rooms (session_id, provider_room_id, room_status)
         VALUES ($1, $2, 'created')
         RETURNING *`,
        [sessionId, providerRoomId]
      );
      room = insertRes.rows[0];
      logger.info(`Voice room [${room.provider_room_id}] created for session [${sessionId}].`);
    }

    return {
      roomId: room.id,
      providerRoomId: room.provider_room_id,
      roomStatus: room.room_status,
      sessionType: session.session_type,
      userRoleInSession: roleInSession,
    };
  }

  /**
   * Issues a short-lived participant token for WebRTC connection.
   */
  static async issueParticipantToken(sessionId, userId) {
    const roomInfo = await this.getOrCreateVoiceRoom(sessionId, userId);
    const { session, roleInSession } = await SessionService.verifyParticipant(sessionId, userId);

    const secret = env.BETTER_AUTH_SECRET || 'vistaraz-voice-ephemeral-key';
    const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60; // 1 hour validity

    const tokenPayload = {
      sessionId,
      roomId: roomInfo.roomId,
      providerRoomId: roomInfo.providerRoomId,
      userId,
      role: roleInSession,
      displayName: roleInSession === 'supporter' ? (session.supporter_alias || 'Peer Listener') : 'Seeker',
      exp: expiresAt,
    };

    const tokenString = Buffer.from(JSON.stringify(tokenPayload)).toString('base64url');
    const signature = crypto.createHmac('sha256', secret).update(tokenString).digest('base64url');
    const token = `${tokenString}.${signature}`;

    // Standard public STUN configuration
    const iceServers = [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
    ];

    // Mark room active
    await authPool.query(
      `UPDATE voice_rooms SET room_status = 'active' WHERE id = $1 AND room_status = 'created'`,
      [roomInfo.roomId]
    );

    return {
      token,
      roomId: roomInfo.roomId,
      providerRoomId: roomInfo.providerRoomId,
      expiresAt: new Date(expiresAt * 1000).toISOString(),
      role: roleInSession,
      displayName: tokenPayload.displayName,
      iceServers,
    };
  }

  /**
   * Closes an active voice room.
   */
  static async closeVoiceRoom(sessionId, userId) {
    await SessionService.verifyParticipant(sessionId, userId);

    const res = await authPool.query(
      `UPDATE voice_rooms
       SET room_status = 'closed', closed_at = CURRENT_TIMESTAMP
       WHERE session_id = $1 AND room_status != 'closed'
       RETURNING *`,
      [sessionId]
    );

    return { success: true, closedCount: res.rows.length };
  }
}
