import React from 'react';
import Header from './Header';
import Footer from './Footer';
import './AppLayout.css';

/**
 * Vistaraz AppLayout Component
 * Unified layout wrapper providing Header and Footer.
 * Left navigation panel is eliminated across all pages, ensuring a clean,
 * consistent full-width experience both before and after login.
 *
 * @param {boolean} hasHeader - Whether to display top Header (default: true)
 * @param {boolean} hasFooter - Whether to display Footer (default: true)
 * @param {string} headerVariant - Header layout mode: 'default' | 'client-dashboard' (default: 'default')
 */
export default function AppLayout({
  children,
  hasHeader = true,
  hasFooter = true,
  headerVariant = 'default',
}) {
  return (
    <div className="vz-app-shell">
      {hasHeader && <Header variant={headerVariant} />}
      <main className="vz-main-content">
        {children}
      </main>
      {hasFooter && <Footer />}
    </div>
  );
}

