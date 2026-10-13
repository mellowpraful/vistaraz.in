import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Button from '../common/Button';
import { Menu, X, ArrowRight, Search, ShieldCheck } from 'lucide-react';
import './Header.css';

/**
 * Vistaraz Header Component
 * Fixed/Sticky top navigation bar matching the design reference.
 */
export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="vz-header">
      <div className="vz-container vz-header__inner">
        {/* Brand Logo */}
        <Link to="/" className="vz-header__brand" onClick={closeMobileMenu}>
          <div className="vz-header__brand-mark">
            <span className="vz-header__logo-text">Vistaraz</span>
            <span className="vz-header__sprout">🌱</span>
          </div>
        </Link>

        {/* Desktop Navbar */}
        <div className="vz-header__nav-wrapper vz-hide-mobile">
          <Navbar />
        </div>

        {/* Header Right Actions */}
        <div className="vz-header__actions">
          <Link
            to="/dashboard"
            className="vz-header__login-link vz-hide-mobile"
          >
            Dashboard
          </Link>

          <Button
            to="/register"
            variant="primary"
            size="sm"
            icon={<ArrowRight size={15} />}
            iconPosition="right"
            className="vz-header__cta"
          >
            Get Started
          </Button>

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
              <Link
                to="/dashboard"
                className="vz-header__mobile-secondary-link"
                onClick={closeMobileMenu}
              >
                Dashboard
              </Link>
              <Button
                to="/register"
                variant="primary"
                fullWidth
                icon={<ArrowRight size={16} />}
                onClick={closeMobileMenu}
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
