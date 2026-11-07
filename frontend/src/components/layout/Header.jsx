import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Button from '../common/Button';
import { Menu, X, ArrowRight, LogOut, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

/**
 * Vistaraz Header Component
 * Fixed/Sticky top navigation bar matching the design reference.
 * Brand logo points to homepage, actions reflect authentic auth state.
 */
export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleLogout = () => {
    logout();
    closeMobileMenu();
    navigate('/login', { replace: true });
  };

  const portalRoute =
    user?.role === 'helper'
      ? user?.helperVerificationStatus === 'verified'
        ? '/listener-portal'
        : '/helper-application'
      : '/client-panel';

  const portalLabel = user?.role === 'helper' ? 'Helper Portal' : 'Client Panel';

  return (
    <header className="vz-header">
      <div className="vz-container vz-header__inner">
        {/* Brand Logo */}
        <Link to="/" className="vz-header__brand brand" onClick={closeMobileMenu}>
          <img src="/logo.png" alt="Vistaraz" height="44" />
        </Link>

        {/* Desktop Navbar */}
        <div className="vz-header__nav-wrapper vz-hide-mobile">
          <Navbar />
        </div>

        {/* Header Right Actions */}
        <div className="vz-header__actions">
          {isAuthenticated ? (
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
                to="/login"
                className="vz-header__login-link vz-hide-mobile"
                id="header-login-link"
              >
                Log In
              </Link>

              <Button
                to="/get-started"
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
                    to="/login"
                    className="vz-header__mobile-secondary-link"
                    onClick={closeMobileMenu}
                  >
                    Log In
                  </Link>
                  <Button
                    to="/get-started"
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
          </div>
        </div>
      )}
    </header>
  );
}
