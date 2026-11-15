/**
 * communityRoutes.js — Community Sanctuary Circles Endpoints
 *
 * Endpoints:
 * - GET  /api/community/posts           (Optional auth — lists posts with like status)
 * - POST /api/community/posts           (Require auth — creates post with crisis intercept)
 * - POST /api/community/posts/:id/like  (Require auth — toggles like)
 * - POST /api/community/posts/:id/comments (Require auth — adds reply)
 */

import { Router } from 'express';
import { requireAuth, optionalAuth } from '../middleware/rbac.js';
import {
  getCommunityPosts,
  createCommunityPost,
  togglePostLike,
  addPostComment,
} from '../controllers/communityController.js';

const router = Router();

router.get('/posts', optionalAuth, getCommunityPosts);
router.post('/posts', requireAuth, createCommunityPost);
router.post('/posts/:id/like', requireAuth, togglePostLike);
router.post('/posts/:id/comments', requireAuth, addPostComment);

export default router;
