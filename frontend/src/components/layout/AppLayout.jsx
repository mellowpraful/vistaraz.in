import React from 'react';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import './AppLayout.css';

/**
 * Vistaraz AppLayout Component
 * Standard layout wrapper providing Header, Footer, and optional Sidebar.
 * The sidebar is rendered conditionally based on the user's authentication state.
 * Authenticated users see the sidebar when hasSidebar={true}.
 * Guest / non-logged-in users have the sidebar completely hidden without blank space.
 * 
 * @param {boolean} hasHeader - Whether to display top Header (default: true)
 * @param {boolean} hasFooter - Whether to display Footer (default: true)
 * @param {boolean} hasSidebar - Whether to display Left Sidebar for authenticated users (default: false)
 */
export default function AppLayout({
  children,
  hasHeader = true,
  hasFooter = true,
  hasSidebar = false,
}) {
  const { isAuthenticated } = useAuth();
  const shouldShowSidebar = Boolean(hasSidebar && isAuthenticated);

  return (
    <div className="vz-app-shell">
      {hasHeader && <Header />}

      {shouldShowSidebar ? (
        <div className="vz-dashboard-layout">
          <div className="vz-dashboard-sidebar-area">
            <Sidebar />
          </div>
          <main className="vz-dashboard-main-area vz-main-content">
            {children}
          </main>
        </div>
      ) : (
        <main className="vz-main-content">
          {children}
        </main>
      )}

      {hasFooter && <Footer />}
    </div>
  );
}

