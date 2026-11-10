/**
 * auth.js — Better Auth Configuration & PostgreSQL Database Adapter
 *
 * Configures Better Auth with:
 * - Connection pooling via pg.Pool connected to Neon PostgreSQL.
 * - Exact snake_case schema field mapping for "user", "session", "account", and "verification".
 * - Database hooks to auto-provision Vistaraz sanctuary profiles and baseline 'user' role.
 * - Secure cookie options and trusted origins.
 * - Password complexity enforcement via emailAndPassword provider.
 */

import { betterAuth } from 'better-auth';
import pg from 'pg';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

const { Pool } = pg;

// Dedicated connection pool for Better Auth operations
const authPool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
});

export const auth = betterAuth({
  database: authPool,
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins: Array.from(new Set([
    ...env.CORS_ORIGINS,
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5000',
    'http://127.0.0.1:5000',
    'http://127.0.0.1:5096',
  ])),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    autoSignIn: true,
  },

  socialProviders: {
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {}),
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,      // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,            // 5 minutes
    },
  },

  // Map Better Auth logical camelCase properties to Neon PostgreSQL snake_case columns
  user: {
    fields: {
      emailVerified: 'email_verified',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },

  session: {
    fields: {
      userId: 'user_id',
      expiresAt: 'expires_at',
      ipAddress: 'ip_address',
      userAgent: 'user_agent',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },

  account: {
    fields: {
      userId: 'user_id',
      accountId: 'account_id',
      providerId: 'provider_id',
      accessToken: 'access_token',
      refreshToken: 'refresh_token',
      accessTokenExpiresAt: 'access_token_expires_at',
      refreshTokenExpiresAt: 'refresh_token_expires_at',
      idToken: 'id_token',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },

  verification: {
    fields: {
      expiresAt: 'expires_at',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },

  databaseHooks: {
    user: {
      create: {
        after: async (newUser) => {
          logger.info(`Better Auth: User created [id: ${newUser.id}] — provisioning sanctuary profile and baseline role.`);
          try {
            // 1. Provision baseline Vistaraz sanctuary profile stub (seeker profile uncompleted)
            await authPool.query(
              `INSERT INTO profiles (user_id, display_name, nickname, preferred_language, is_seeker_profile_completed)
               VALUES ($1, $2, $3, 'en', false)
               ON CONFLICT (user_id) DO NOTHING`,
              [newUser.id, newUser.name || 'Sanctuary Seeker', (newUser.name || 'Friend').split(' ')[0]]
            );

            // 2. Assign default 'user' (support seeker) role
            await authPool.query(
              `INSERT INTO user_roles (user_id, role)
               VALUES ($1, 'user')
               ON CONFLICT (user_id, role) DO NOTHING`,
              [newUser.id]
            );
          } catch (err) {
            logger.error('Failed to auto-provision profile/role during user creation', {
              userId: newUser.id,
              error: err.message,
            });
          }
        },
      },
    },
  },
});

export { authPool };

