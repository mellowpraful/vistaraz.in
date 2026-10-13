import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

const DEFAULT_NAV_ITEMS = [
  { label: 'Home', to: '/' },
  { label: 'Assessment', to: '/assessment' },
  { label: 'Support', to: '/support' },
  { label: 'Community', to: '/community' },
  { label: 'Tools', to: '/tools' },
  { label: 'Plans', to: '/plans' },
];

/**
 * Vistaraz Navbar Component
 * Reusable navigation bar with active route detection and responsive modes.
 */
export default function Navbar({
  items = DEFAULT_NAV_ITEMS,
  direction = 'row',
  onItemClick,
  className = '',
}) {
  return (
    <nav className={`vz-navbar vz-navbar--${direction} ${className}`} aria-label="Main Navigation">
      <ul className="vz-navbar__list">
        {items.map((item) => (
          <li key={item.to} className="vz-navbar__item">
            <NavLink
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `vz-navbar__link ${isActive ? 'vz-navbar__link--active' : ''}`
              }
              onClick={onItemClick}
            >
              {item.icon && <span className="vz-navbar__link-icon">{item.icon}</span>}
              <span>{item.label}</span>
              {item.badge && <span className="vz-navbar__link-badge">{item.badge}</span>}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
