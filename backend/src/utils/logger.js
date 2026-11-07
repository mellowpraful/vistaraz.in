/**
 * logger.js — Lightweight structured logger utility
 *
 * Wraps console methods with ISO timestamp, log level, and optional
 * context tags.  Keeps dependencies at zero for Phase 1.
 * Can be swapped for winston/pino in a later phase without
 * changing call sites.
 */

const LEVELS = {
  info: 'INFO ',
  warn: 'WARN ',
  error: 'ERROR',
  debug: 'DEBUG',
};

function format(level, message, meta) {
  const timestamp = new Date().toISOString();
  const tag = LEVELS[level] ?? 'LOG  ';
  const base = `[${timestamp}] [${tag}] ${message}`;
  return meta ? `${base} ${JSON.stringify(meta)}` : base;
}

export const logger = {
  info(message, meta) {
    console.log(format('info', message, meta));
  },
  warn(message, meta) {
    console.warn(format('warn', message, meta));
  },
  error(message, meta) {
    console.error(format('error', message, meta));
  },
  debug(message, meta) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(format('debug', message, meta));
    }
  },
};

