import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Button from '../common/Button';
import { Menu, X, ArrowRight, LogOut, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import logoImg from '../../assets/images/logo.png';
import './Header.css';

/**
 * Vistaraz Header Component
 * Fixed/Sticky top navigation bar matching the official design.
 * Features live authentication status, user profile chips, role navigation, and sign-out.
 */
export default function Header() {
  const { user, isAuthenticated, signOut, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleSignOut = async () => {
    closeMobileMenu();
    if (signOut) await signOut();
    else if (logout) logout();
    navigate('/');
  };

  const isHelper = user?.role === 'helper' || user?.role === 'provider';
  const isHelperVerified = user?.is_verified || user?.helperVerificationStatus === 'verified';

  const portalRoute = isHelper
    ? (isHelperVerified ? '/listener-portal' : '/helper-application')
    : '/client-panel';

  const portalLabel = isHelper
    ? (isHelperVerified ? 'Listener Portal' : 'Helper Application')
    : 'My Care Panel';

  return (
    <header className="vz-header">
      <div className="vz-container vz-header__inner">
        {/* Brand Logo */}
        <Link to="/" className="vz-header__brand" onClick={closeMobileMenu}>
          <img
            src={logoImg}
            alt="Vistaraz"
            className="vz-header__logo-img"
          />
        </Link>

        {/* Desktop Navbar */}
        <div className="vz-header__nav-wrapper vz-hide-mobile">
          <Navbar />
        </div>

        {/* Header Right Actions */}
        <div className="vz-header__actions">
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} className="vz-hide-mobile">
              <Link
                to={portalRoute}
                className="vz-header__login-link"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--vz-bg-subtle)' }}
              >
                <span>{user?.avatar || '🦊'}</span>
                <span>{user?.nickname || user?.name || 'Member'}</span>
              </Link>

              <Button
                to={portalRoute}
                variant="primary"
                size="sm"
                icon={<ArrowRight size={14} />}
                iconPosition="right"
                className="vz-header__cta"
              >
                {portalLabel}
              </Button>

              <button
                type="button"
                onClick={handleSignOut}
                className="vz-header__login-link"
                title="Sign Out"
                id="header-logout-btn"
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} className="vz-hide-mobile">
              <Link
                to="/login"
                className="vz-header__login-link"
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
            </div>
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'var(--vz-bg-subtle)', borderRadius: '8px' }}>
                    <span>{user?.avatar || '🦊'}</span>
                    <strong style={{ fontSize: '0.95rem' }}>{user?.nickname || user?.name}</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--vz-text-muted)', marginLeft: 'auto' }}>
                      {isHelper ? 'Helper' : 'Seeker'}
                    </span>
                  </div>
                  <Button
                    to={portalRoute}
                    variant="primary"
                    fullWidth
                    icon={<ArrowRight size={16} />}
                    onClick={closeMobileMenu}
                  >
                    Open {portalLabel}
                  </Button>
                  <Button
                    variant="ghost"
                    fullWidth
                    icon={<LogOut size={16} />}
                    onClick={handleSignOut}
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    to="/login"
                    variant="outline"
                    fullWidth
                    onClick={closeMobileMenu}
                  >
                    Log In
                  </Button>
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
