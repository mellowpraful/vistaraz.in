import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  Smile,
  MessageCircle,
  Video,
  Users,
  Briefcase,
  BookOpen,
  User,
  Settings,
  Shield,
  LifeBuoy
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import logoImg from '../../assets/images/logo.png';
import './Sidebar.css';

const DEFAULT_SIDEBAR_LINKS = [
  { label: 'Home', to: '/', icon: Home },
  { label: 'Mood Check-in', to: '/assessment', icon: Smile },
  { label: 'Chat Support', to: '/chat', icon: MessageCircle },
  { label: 'Voice / Video', to: '/video-call', icon: Video },
  { label: 'Find a Listener', to: '/support', icon: Users },
  { label: 'Professional Help', to: '/support#pro', icon: Briefcase },
  { label: 'Sanctuary Tools', to: '/tools', icon: BookOpen },
  { label: 'My Care Panel', to: '/client-panel', icon: User },
];

/**
 * Vistaraz Sidebar Component
 * Left application sidebar navigation as featured in Assessment, Chat, and Support dashboards.
 * 
 * @param {Array} links
 * @param {string} title
 * @param {React.ReactNode} headerExtra
 */
export default function Sidebar({
  links = DEFAULT_SIDEBAR_LINKS,
  title = 'Vistaraz',
  headerExtra,
  className = '',
}) {
  const { user, isAuthenticated } = useAuth();
  const profileLink = isAuthenticated
    ? (user?.role === 'provider' ? '/listener-portal' : '/client-panel')
    : '/register?action=login';
  return (
    <aside className={`vz-sidebar ${className}`} aria-label="Portal Sidebar Navigation">
      <div className="vz-sidebar__header">
        <NavLink to="/" className="vz-sidebar__brand" aria-label="Vistaraz Home">
          <img
            src={logoImg}
            alt={title || "Vistaraz"}
            className="vz-sidebar__logo-img"
          />
        </NavLink>
        {headerExtra}
      </div>

      <nav className="vz-sidebar__nav">
        <ul className="vz-sidebar__list">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <li key={link.to} className="vz-sidebar__item">
                <NavLink
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    `vz-sidebar__link ${isActive ? 'vz-sidebar__link--active' : ''}`
                  }
                >
                  {Icon && <Icon className="vz-sidebar__link-icon" size={18} />}
                  <span className="vz-sidebar__link-text">{link.label}</span>
                  {link.badge && (
                    <span className="vz-sidebar__badge">{link.badge}</span>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="vz-sidebar__footer">
        <NavLink to="/safety" className="vz-sidebar__footer-link">
          <Shield size={16} />
          <span>Safety & Crisis</span>
        </NavLink>
        <NavLink to={profileLink} className="vz-sidebar__user-card">
          <div className="vz-sidebar__user-avatar">
            <span>{isAuthenticated ? (user?.avatar || '🦊') : '👤'}</span>
          </div>
          <div className="vz-sidebar__user-info">
            <span className="vz-sidebar__user-name">
              {isAuthenticated ? (user?.nickname || user?.name || 'Member') : 'Guest Member'}
            </span>
            <span className="vz-sidebar__user-role">
              {isAuthenticated
                ? (user?.role === 'provider' ? 'Verified Listener' : `${user?.plan || 'Free'} Sanctuary`)
                : 'Click to Sign In'}
            </span>
          </div>
        </NavLink>
      </div>
    </aside>
  );
}
