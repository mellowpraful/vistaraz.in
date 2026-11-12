import React, { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from './Navbar';
import Button from '../common/Button';
import { Menu, X, ArrowRight, LogOut, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

/**
 * Vistaraz Header Component
 * Fixed/Sticky top navigation bar matching the design reference.
 * Brand logo points to homepage, actions reflect authentic auth state.
 *
 * Supports variant="client-dashboard" for consolidated single-navigation
 * in the authenticated Client Dashboard layout.
 */
export default function Header({ variant = 'default' }) {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  // Preserve return route for login and registration CTA links
  const currentPath = location.pathname + location.search;
  const isAuthPath =
    location.pathname === '/login' ||
    location.pathname === '/register' ||
    location.pathname === '/get-started' ||
    location.pathname === '/purpose' ||
    location.pathname === '/seeker-setup';
  const loginUrl = !isAuthPath && location.pathname !== '/'
    ? `/login?redirect=${encodeURIComponent(currentPath)}`
    : '/login';
  const getStartedUrl = !isAuthPath && location.pathname !== '/'
    ? `/get-started?redirect=${encodeURIComponent(currentPath)}`
    : '/get-started';

  const handleLogout = () => {
    logout();
    closeMobileMenu();
    navigate('/login', { replace: true });
  };

  // Determine if this is the authenticated Client Dashboard
  const isClientDashboard =
    variant === 'client-dashboard' ||
    (location.pathname === '/client-panel' && isAuthenticated);

  // Active state calculations for Client Dashboard navigation
  const currentTab = (searchParams.get('tab') || 'overview').toLowerCase();
  const isClientPanel = location.pathname === '/client-panel';

  const isOverviewActive = isClientPanel && (currentTab === 'overview' || currentTab === 'home');
  const isSessionsActive = isClientPanel && currentTab === 'sessions';
  const isCheckInsActive = isClientPanel && (currentTab === 'check-ins' || currentTab === 'check-in');
  const isCommunityActive = location.pathname === '/community';
  const isToolsActive = location.pathname === '/tools';
  const isProfileActive = isClientPanel && currentTab === 'profile';

  // Dashboard central nav items (Requirements 2 & 4: Overview, Sessions, Check-ins, Community, Tools)
  const dashboardNavItems = [
    {
      label: 'Overview',
      to: '/client-panel',
      key: 'Overview',
      isActive: () => isOverviewActive,
    },
    {
      label: 'Sessions',
      to: '/client-panel?tab=sessions',
      key: 'Sessions',
      isActive: () => isSessionsActive,
    },
    {
      label: 'Check-ins',
      to: '/client-panel?tab=check-ins',
      key: 'Check-ins',
      isActive: () => isCheckInsActive,
    },
    {
      label: 'Community',
      to: '/community',
      key: 'Community',
      isActive: () => isCommunityActive,
    },
    {
      label: 'Tools',
      to: '/tools',
      key: 'Tools',
      isActive: () => isToolsActive,
    },
  ];

  const portalRoute =
    user?.role === 'helper'
      ? user?.helperVerificationStatus === 'verified'
        ? '/listener-portal'
        : '/helper-application'
      : '/client-panel';

  const portalLabel = user?.role === 'helper' ? 'Helper Portal' : 'Client Panel';

  return (
    <header className={`vz-header ${isClientDashboard ? 'vz-header--dashboard' : ''}`}>
      <div className="vz-container vz-header__inner">
        {/* Brand Logo (Requirement 3: Left) */}
        <Link to="/" className="vz-header__brand brand" onClick={closeMobileMenu} aria-label="Return to Vistaraz Home">
          <img src="/logo.png" alt="Vistaraz" height="44" />
        </Link>

        {/* Desktop Central Navbar (Requirement 4: Centrally aligned) */}
        <div className="vz-header__nav-wrapper vz-hide-mobile">
          {isClientDashboard ? (
            <Navbar items={dashboardNavItems} onItemClick={closeMobileMenu} className="vz-navbar--dashboard" />
          ) : (
            <Navbar />
          )}
        </div>

        {/* Header Right Actions (Requirement 5: Profile and Sign Out on right) */}
        <div className="vz-header__actions">
          {isClientDashboard ? (
            <>
              {/* Profile Link */}
              <Link
                to="/client-panel?tab=profile"
                className={`vz-header__profile-link vz-hide-mobile ${
                  isProfileActive ? 'vz-header__profile-link--active' : ''
                }`}
                onClick={closeMobileMenu}
                id="header-profile-link"
                title="View Profile"
              >
                <User size={16} />
                <span>Profile</span>
              </Link>

              {/* Sign Out Button */}
              <button
                type="button"
                onClick={handleLogout}
                className="vz-btn vz-btn--ghost vz-btn--sm vz-header__signout-btn vz-hide-mobile"
                title="Sign Out"
                id="header-logout-btn"
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </>
          ) : isAuthenticated ? (
            <>
              <Link
                to={portalRoute}
                className="vz-header__login-link vz-hide-mobile"
                style={{ fontWeight: 600, color: 'var(--vz-primary)' }}
              >
                {portalLabel}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="vz-btn vz-btn--ghost vz-btn--sm vz-hide-mobile"
                title="Sign Out"
                id="header-logout-btn"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to={loginUrl}
                className="vz-header__login-link vz-hide-mobile"
                id="header-login-link"
              >
                Log In
              </Link>

              <Button
                to={getStartedUrl}
                variant="primary"
                size="sm"
                icon={<ArrowRight size={15} />}
                iconPosition="right"
                className="vz-header__cta"
                id="header-get-started-btn"
              >
                Get Started
              </Button>
            </>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            className="vz-header__mobile-toggle vz-show-mobile"
            onClick={toggleMobileMenu}
            aria-label={mobileMenuOpen ? 'Close navigation' : 'Open navigation'}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="vz-header__mobile-drawer">
          <div className="vz-header__mobile-drawer-inner">
            {isClientDashboard ? (
              <>
                <Navbar
                  items={dashboardNavItems}
                  direction="column"
                  onItemClick={closeMobileMenu}
                  className="vz-navbar--dashboard"
                />
                <div className="vz-header__mobile-drawer-footer">
                  <Link
                    to="/client-panel?tab=profile"
                    className={`vz-navbar__link vz-header__profile-link ${
                      isProfileActive ? 'vz-header__profile-link--active' : ''
                    }`}
                    onClick={closeMobileMenu}
                    style={{ width: '100%', justifyContent: 'flex-start', padding: '10px 16px' }}
                  >
                    <User size={16} />
                    <span>Profile</span>
                  </Link>
                  <Button
                    variant="ghost"
                    fullWidth
                    icon={<LogOut size={16} />}
                    onClick={handleLogout}
                  >
                    Sign Out
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Navbar direction="column" onItemClick={closeMobileMenu} />
                <div className="vz-header__mobile-drawer-footer">
                  {isAuthenticated ? (
                    <>
                      <Link
                        to={portalRoute}
                        className="vz-header__mobile-secondary-link"
                        onClick={closeMobileMenu}
                      >
                        {portalLabel}
                      </Link>
                      <Button
                        variant="ghost"
                        fullWidth
                        icon={<LogOut size={16} />}
                        onClick={handleLogout}
                      >
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link
                        to={loginUrl}
                        className="vz-header__mobile-secondary-link"
                        onClick={closeMobileMenu}
                      >
                        Log In
                      </Link>
                      <Button
                        to={getStartedUrl}
                        variant="primary"
                        fullWidth
                        icon={<ArrowRight size={16} />}
                        onClick={closeMobileMenu}
                      >
                        Get Started
                      </Button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
