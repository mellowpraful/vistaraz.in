import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoginGate from '../components/common/LoginGate';
import { useAuth } from '../context/AuthContext';
import { AvatarImage } from '../utils/avatars';
import {
  fetchCommunityPosts,
  createCommunityPost,
  togglePostLike,
  addPostComment,
} from '../services/communityService';
import {
  MessageSquare,
  Heart,
  Shield,
  ShieldAlert,
  Send,
  Users,
  CheckCircle2,
  Filter,
  Sparkles,
  Share2,
  Loader2,
  AlertTriangle,
  PhoneCall
} from 'lucide-react';
import './CommunityPage.css';

function formatTimeAgo(dateString) {
  if (!dateString) return 'Just now';
  const diffMs = Date.now() - new Date(dateString).getTime();
  if (isNaN(diffMs)) return 'Recently';
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  return `${diffDays}d ago`;
}

function renderPostAvatar(avatarId) {
  if (typeof avatarId === 'string' && avatarId.startsWith('avatar_')) {
    return <AvatarImage avatarId={avatarId} size={32} />;
  }
  return <span style={{ fontSize: '1.25rem' }}>{avatarId || '🌱'}</span>;
}

export default function CommunityPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [crisisAlert, setCrisisAlert] = useState(null);

  const [selectedTopic, setSelectedTopic] = useState('All');
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newTopic, setNewTopic] = useState('Connection');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [activeReplyPostId, setActiveReplyPostId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Load posts from NeonDB
  useEffect(() => {
    let isMounted = true;

    async function loadFeed() {
      try {
        setLoading(true);
        setError('');
        const data = await fetchCommunityPosts(selectedTopic);
        if (isMounted) {
          setPosts(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Could not load community feed.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (isAuthenticated) {
      loadFeed();
    }

    return () => {
      isMounted = false;
    };
  }, [selectedTopic, isAuthenticated]);

  const handleGuestDismiss = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  if (!isAuthenticated) {
    return (
      <AppLayout>
        <LoginGate
          isOpen={true}
          onClose={handleGuestDismiss}
          title="Join the Sanctuary Circle"
          description="Sign in to explore Community Circles — our nickname-first, moderated space for real conversations and kind support."
          badgeText="Community Circles"
          dismissText="Maybe Later"
        />
      </AppLayout>
    );
  }

  const topics = [
    'All',
    'Study & career',
    'Connection',
    'Stress & overthinking',
    'Relationships',
  ];

  const handleLike = async (postId) => {
    // Optimistic UI update
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const newLiked = !p.likedByUser;
          return {
            ...p,
            likedByUser: newLiked,
            likes: newLiked ? p.likes + 1 : Math.max(0, p.likes - 1),
          };
        }
        return p;
      })
    );

    try {
      const res = await togglePostLike(postId);
      // Synchronize exact count from server
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, likes: res.likesCount, likedByUser: res.liked } : p))
      );
    } catch {
      // Revert on error
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id === postId) {
            const revertedLiked = !p.likedByUser;
            return {
              ...p,
              likedByUser: revertedLiked,
              likes: revertedLiked ? p.likes + 1 : Math.max(0, p.likes - 1),
            };
          }
          return p;
        })
      );
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newBody.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setCrisisAlert(null);
    setError('');

    try {
      const created = await createCommunityPost({
        title: newTitle.trim(),
        body: newBody.trim(),
        topic: newTopic,
      });

      setPosts((prev) => [created, ...prev]);
      setNewTitle('');
      setNewBody('');
    } catch (err) {
      if (err.crisisIntercept) {
        setCrisisAlert(err.message);
      } else {
        setError(err.message || 'Failed to submit post.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReplyClick = (postId) => {
    setActiveReplyPostId(activeReplyPostId === postId ? null : postId);
    setReplyText('');
  };

  const handleAddReply = async (postId) => {
    if (!replyText.trim() || isSubmittingReply) return;

    setIsSubmittingReply(true);
    try {
      const newComment = await addPostComment(postId, replyText.trim());
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id === postId) {
            return {
              ...p,
              repliesCount: (p.repliesCount || p.replies.length) + 1,
              replies: [...p.replies, newComment],
            };
          }
          return p;
        })
      );
      setReplyText('');
      setActiveReplyPostId(null);
    } catch (err) {
      alert(err.message || 'Failed to add reply. Please try again.');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  return (
    <AppLayout>
      <div className="vz-community-container">
        {/* Header Hero */}
        <section className="vz-community-header">
          <span className="vz-eyebrow">NICKNAME-FIRST COMMUNITY</span>
          <h1 className="vz-community-header__title">
            Real questions. <em className="vz-text-violet">Kind responses.</em>
          </h1>
          <p className="vz-community-header__desc">
            A moderated, safe space to share what’s on your mind and find recognition. No real names or judgment.
          </p>
        </section>

        {/* Crisis Safeguard Alert Banner */}
        {crisisAlert && (
          <div
            style={{
              backgroundColor: '#fff1f2',
              border: '2px solid #f43f5e',
              borderRadius: '16px',
              padding: '20px 24px',
              marginBottom: '32px',
              color: '#9f1239',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px',
            }}
          >
            <AlertTriangle size={28} color="#e11d48" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
              <strong style={{ fontSize: '1.05rem', display: 'block', marginBottom: '6px' }}>
                Compassionate Crisis Safeguard Notice
              </strong>
              <p style={{ margin: '0 0 14px', fontSize: '0.92rem', lineHeight: 1.5 }}>{crisisAlert}</p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <a
                  href="tel:14416"
                  className="vz-btn vz-btn--primary vz-btn--sm"
                  style={{ backgroundColor: '#e11d48', borderColor: '#e11d48', textDecoration: 'none' }}
                >
                  <PhoneCall size={14} style={{ marginRight: '6px' }} /> Call Tele-MANAS (14416)
                </a>
                <a
                  href="tel:18005990019"
                  className="vz-btn vz-btn--outline vz-btn--sm"
                  style={{ textDecoration: 'none' }}
                >
                  Call KIRAN (1800-599-0019)
                </a>
              </div>
            </div>
          </div>
        )}

        <div className="vz-community-layout">
          {/* Sidebar */}
          <aside className="vz-community-sidebar">
            <Card variant="default" padding="md" className="vz-community-topics-card">
              <span className="vz-eyebrow">EXPLORE TOPICS</span>
              <ul className="vz-community-topics-list">
                {topics.map((t) => (
                  <li key={t}>
                    <button
                      type="button"
                      className={`vz-topic-btn ${selectedTopic === t ? 'active' : ''}`}
                      onClick={() => setSelectedTopic(t)}
                    >
                      {t === 'All' ? 'All conversations' : t}
                    </button>
                  </li>
                ))}
              </ul>

              <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--vz-border-light)' }}>
                <Link to="/safety" className="vz-community-safety-link">
                  <ShieldAlert size={16} />
                  <span>Urgent Support Resources</span>
                </Link>
              </div>
            </Card>
          </aside>

          {/* Main Feed */}
          <div className="vz-community-feed">
            {/* Create Post Card */}
            <Card variant="default" padding="lg" className="vz-community-composer">
              <span className="vz-eyebrow" style={{ color: 'var(--vz-primary)' }}>
                SHARE A QUESTION
              </span>
              {error && (
                <div style={{ color: '#b91c1c', fontSize: '0.88rem', margin: '8px 0' }}>
                  {error}
                </div>
              )}
              <form onSubmit={handleCreatePost} style={{ marginTop: '8px' }}>
                <input
                  type="text"
                  className="vz-composer-title-input"
                  placeholder="What’s on your mind? (Headline)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
                <textarea
                  className="vz-composer-body-input"
                  rows={3}
                  placeholder="Share only what feels safe. Avoid personal contact details or real names..."
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
                <div className="vz-composer-actions">
                  <select
                    className="vz-composer-select"
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    disabled={isSubmitting}
                  >
                    <option value="Study & career">Study & career</option>
                    <option value="Connection">Connection</option>
                    <option value="Stress & overthinking">Stress & overthinking</option>
                    <option value="Relationships">Relationships</option>
                  </select>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    icon={isSubmitting ? <Loader2 size={14} className="vz-spin" /> : <Send size={14} />}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Posting...' : 'Post with care'}
                  </Button>
                </div>
              </form>
            </Card>

            {/* Posts Feed */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--vz-text-muted)' }}>
                <Loader2 size={32} className="vz-spin" style={{ margin: '0 auto 12px', display: 'block' }} />
                <span>Loading Sanctuary discussions...</span>
              </div>
            ) : posts.length === 0 ? (
              <Card variant="default" padding="lg" style={{ textAlign: 'center', padding: '48px 24px' }}>
                <p style={{ color: 'var(--vz-text-secondary)', margin: 0 }}>
                  No posts found in this topic yet. Be the first to start a conversation!
                </p>
              </Card>
            ) : (
              <div className="vz-community-posts-list">
                {posts.map((post) => (
                  <Card key={post.id} variant="default" padding="lg" className="vz-post-card">
                    <div className="vz-post-card__header">
                      <div className="vz-post-card__author" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className="vz-post-card__avatar">{renderPostAvatar(post.avatar)}</span>
                        <div>
                          <strong>{post.alias}</strong>
                          <span className="vz-post-card__time"> · {formatTimeAgo(post.createdAt || post.time)}</span>
                        </div>
                      </div>
                      <span className="vz-chip sky">{post.topic}</span>
                    </div>

                    <h3 className="vz-post-card__title">{post.title}</h3>
                    <p className="vz-post-card__body">{post.body}</p>

                    {/* Verified National Clinical Insight (if present) */}
                    {post.proReply && (
                      <div className="vz-pro-reply-box">
                        <div className="vz-pro-reply-box__badge">
                          <CheckCircle2 size={15} color="var(--vz-primary)" />
                          <strong>Verified Clinical Insight · {post.proReply.expert}</strong>
                        </div>
                        <p>{post.proReply.text}</p>
                      </div>
                    )}

                    {/* Reply Stream */}
                    {post.replies && post.replies.length > 0 && (
                      <div className="vz-post-replies-list">
                        {post.replies.map((rep) => (
                          <div key={rep.id} className="vz-post-reply-item">
                            <small>
                              <strong>{rep.author}</strong> · {formatTimeAgo(rep.createdAt || rep.time)}
                            </small>
                            <p>{rep.text}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Inline Reply Composer */}
                    {activeReplyPostId === post.id && (
                      <div className="vz-reply-composer">
                        <input
                          type="text"
                          placeholder="Write a supportive, kind thought..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddReply(post.id);
                          }}
                          disabled={isSubmittingReply}
                        />
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleAddReply(post.id)}
                          disabled={isSubmittingReply}
                        >
                          {isSubmittingReply ? 'Sending...' : 'Reply'}
                        </Button>
                        <button
                          type="button"
                          className="vz-btn vz-btn--ghost vz-btn--sm"
                          onClick={() => setActiveReplyPostId(null)}
                          disabled={isSubmittingReply}
                        >
                          Cancel
                        </button>
                      </div>
                    )}

                    {/* Post Footer Actions */}
                    <div className="vz-post-card__footer">
                      <button
                        type="button"
                        className={`vz-post-action-btn ${post.likedByUser ? 'liked' : ''}`}
                        onClick={() => handleLike(post.id)}
                      >
                        <Heart
                          size={16}
                          fill={post.likedByUser ? '#e11d48' : 'none'}
                          color={post.likedByUser ? '#e11d48' : 'currentColor'}
                        />
                        <span>{post.likes}</span>
                      </button>

                      <button
                        type="button"
                        className="vz-post-action-btn"
                        onClick={() => handleReplyClick(post.id)}
                      >
                        <MessageSquare size={16} />
                        <span>{(post.replies && post.replies.length) || post.repliesCount || 0} replies</span>
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
