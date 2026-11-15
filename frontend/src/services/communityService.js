/**
 * communityService.js — Community Sanctuary API Client
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Fetch all community posts, optionally filtered by topic.
 * @param {string} [topic]
 */
export async function fetchCommunityPosts(topic = 'All') {
  const url = new URL(`${API_BASE_URL}/api/community/posts`, window.location.origin);
  if (topic && topic !== 'All') {
    url.searchParams.set('topic', topic);
  }

  const res = await fetch(url.toString(), {
    method: 'GET',
    credentials: 'include',
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.error || 'Failed to fetch community discussions.');
  }

  return json.data || [];
}

/**
 * Creates a new community post.
 * @param {{ title: string, body: string, topic: string }} postData
 */
export async function createCommunityPost({ title, body, topic }) {
  const res = await fetch(`${API_BASE_URL}/api/community/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ title, body, topic }),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(json.error || 'Failed to create post.');
    error.crisisIntercept = json.crisisIntercept;
    error.code = json.code;
    throw error;
  }

  return json.data;
}

/**
 * Toggles a like on a post.
 * @param {string} postId
 */
export async function togglePostLike(postId) {
  const res = await fetch(`${API_BASE_URL}/api/community/posts/${postId}/like`, {
    method: 'POST',
    credentials: 'include',
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.error || 'Failed to toggle like.');
  }

  return json;
}

/**
 * Adds a comment/reply to a post.
 * @param {string} postId
 * @param {string} text
 */
export async function addPostComment(postId, text) {
  const res = await fetch(`${API_BASE_URL}/api/community/posts/${postId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ text }),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.error || 'Failed to add reply.');
  }

  return json.data;
}
