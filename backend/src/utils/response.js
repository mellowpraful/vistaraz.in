/**
 * response.js — Standardised API response helpers
 *
 * Every API endpoint uses these helpers so the response envelope
 * is consistent across the entire backend.
 *
 * Success envelope:
 *   { success: true,  data: <payload>,  message: <string> }
 *
 * Error envelope:
 *   { success: false, error: <message>, code: <string> }
 */

/**
 * Send a 200 OK success response.
 * @param {import('express').Response} res
 * @param {*} data         Payload to include under the `data` key.
 * @param {string} message Human-readable success message.
 * @param {number} status  HTTP status code (default 200).
 */
export function sendSuccess(res, data = null, message = 'Success', status = 200) {
  return res.status(status).json({
    success: true,
    message,
    data,
  });
}

/**
 * Send an error response.
 * @param {import('express').Response} res
 * @param {string} message Human-readable error description.
 * @param {number} status  HTTP status code (default 500).
 * @param {string} code    Machine-readable error code for the client.
 */
export function sendError(res, message = 'Internal Server Error', status = 500, code = 'SERVER_ERROR') {
  return res.status(status).json({
    success: false,
    error: message,
    code,
  });
}

