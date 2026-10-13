import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
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
  Share2
} from 'lucide-react';
import './CommunityPage.css';

const INITIAL_POSTS = [
  {
    id: 1,
    alias: 'moonlitmango',
    avatar: '🌙',
    time: '8 min ago',
    topic: 'Connection',
    title: 'Is it normal to feel lonely even when you have friends?',
    body: 'I’m around people all the time in college lectures, but I still feel completely separate from everyone. Like nobody actually knows what’s going on inside my head.',
    likes: 24,
    likedByUser: false,
    replies: [
      {
        id: 101,
        author: 'peachtea22',
        text: 'Going through the exact same thing in my 3rd year. Realizing proximity doesn’t always equal emotional safety. Sending a hug.',
        time: '5 min ago',
      },
    ],
  },
  {
    id: 2,
    alias: 'bluepencil',
    avatar: '🦊',
    time: '42 min ago',
    topic: 'Study & career',
    title: 'How do you deal with the intense pressure to have a five-year plan?',
    body: 'I keep thinking everyone else has their career trajectory figured out and I am already falling hopelessly behind.',
    likes: 38,
    likedByUser: true,
    proReply: {
      expert: 'Dr. Rhea Mehta (Clinical Psychologist)',
      text: 'Remember that "five-year plans" are mostly social performances. In your early twenties, neuroplasticity and values are constantly shifting. Focus on the next 6 months of genuine curiosity rather than an entire decade of imaginary perfection.',
    },
    replies: [
      {
        id: 201,
        author: 'quietriver',
        text: 'This pro reply just took so much anxiety off my chest. Thank you.',
        time: '20 min ago',
      },
    ],
  },
  {
    id: 3,
    alias: 'chai_and_clouds',
    avatar: '☕',
    time: '2 hours ago',
    topic: 'Stress & overthinking',
    title: 'Small tip: The 20-minute worry postponement trick',
    body: 'Whenever I start spiraling during exam revision, I write down the thought in a notebook and tell my brain: "We will worry about this at 5:00 PM for 10 minutes." 9 times out of 10, by 5:00 PM the urgency is gone.',
    likes: 56,
    likedByUser: false,
    replies: [],
  },
];

export default function CommunityPage() {
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newTopic, setNewTopic] = useState('Connection');
  const [activeReplyPostId, setActiveReplyPostId] = useState(null);
  const [replyText, setReplyText] = useState('');

  const topics = [
    'All',
    'Study & career',
    'Connection',
    'Stress & overthinking',
    'Relationships',
  ];

  const handleLike = (id) => {
    setPosts(
      posts.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            likes: p.likedByUser ? p.likes - 1 : p.likes + 1,
            likedByUser: !p.likedByUser,
          };
        }
        return p;
      })
    );
  };

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newBody.trim()) return;

    const newPostObj = {
      id: Date.now(),
      alias: 'quietseeker' + Math.floor(Math.random() * 90 + 10),
      avatar: '🌿',
      time: 'Just now',
      topic: newTopic,
      title: newTitle,
      body: newBody,
      likes: 1,
      likedByUser: true,
      replies: [],
    };

    setPosts([newPostObj, ...posts]);
    setNewTitle('');
    setNewBody('');
  };

  const handleAddReply = (postId) => {
    if (!replyText.trim()) return;
    setPosts(
      posts.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            replies: [
              ...p.replies,
              {
                id: Date.now(),
                author: 'gentlefriend',
                text: replyText,
                time: 'Just now',
              },
            ],
          };
        }
        return p;
      })
    );
    setReplyText('');
    setActiveReplyPostId(null);
  };

  const filteredPosts = posts.filter((p) => {
    if (selectedTopic === 'All') return true;
    return p.topic.toLowerCase() === selectedTopic.toLowerCase();
  });

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
              <form onSubmit={handleCreatePost} style={{ marginTop: '8px' }}>
                <input
                  type="text"
                  className="vz-composer-title-input"
                  placeholder="What’s on your mind? (Headline)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
                <textarea
                  className="vz-composer-body-input"
                  rows={3}
                  placeholder="Share only what feels safe. Avoid personal contact details or real names..."
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  required
                />
                <div className="vz-composer-actions">
                  <select
                    className="vz-composer-select"
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                  >
                    <option value="Study & career">Study & career</option>
                    <option value="Connection">Connection</option>
                    <option value="Stress & overthinking">Stress & overthinking</option>
                    <option value="Relationships">Relationships</option>
                  </select>
                  <Button type="submit" variant="primary" size="sm" icon={<Send size={14} />}>
                    Post with care
                  </Button>
                </div>
              </form>
            </Card>

            {/* Posts List */}
            <div className="vz-community-posts-list">
              {filteredPosts.map((post) => (
                <Card key={post.id} variant="default" padding="lg" className="vz-post-card">
                  <div className="vz-post-card__header">
                    <div className="vz-post-card__author">
                      <span className="vz-post-card__avatar">{post.avatar}</span>
                      <div>
                        <strong>{post.alias}</strong>
                        <span className="vz-post-card__time">· {post.time}</span>
                      </div>
                    </div>
                    <span className="vz-chip sky">{post.topic}</span>
                  </div>

                  <h3 className="vz-post-card__title">{post.title}</h3>
                  <p className="vz-post-card__body">{post.body}</p>

                  {/* Professional Reply Highlight */}
                  {post.proReply && (
                    <div className="vz-pro-reply-box">
                      <div className="vz-pro-reply-box__badge">
                        <CheckCircle2 size={15} color="var(--vz-primary)" />
                        <strong>Verified Clinician Insight · {post.proReply.expert}</strong>
                      </div>
                      <p>{post.proReply.text}</p>
                    </div>
                  )}

                  {/* Reply Stream */}
                  {post.replies.length > 0 && (
                    <div className="vz-post-replies-list">
                      {post.replies.map((rep) => (
                        <div key={rep.id} className="vz-post-reply-item">
                          <small><strong>{rep.author}</strong> · {rep.time}</small>
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
                      />
                      <Button variant="primary" size="sm" onClick={() => handleAddReply(post.id)}>
                        Reply
                      </Button>
                      <button
                        type="button"
                        className="vz-btn vz-btn--ghost vz-btn--sm"
                        onClick={() => setActiveReplyPostId(null)}
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
                      <Heart size={16} fill={post.likedByUser ? '#e11d48' : 'none'} color={post.likedByUser ? '#e11d48' : 'currentColor'} />
                      <span>{post.likes}</span>
                    </button>

                    <button
                      type="button"
                      className="vz-post-action-btn"
                      onClick={() =>
                        setActiveReplyPostId(activeReplyPostId === post.id ? null : post.id)
                      }
                    >
                      <MessageSquare size={16} />
                      <span>{post.replies.length} replies</span>
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
