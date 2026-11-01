import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute';

// Developer 1 Pages (1 to 8)
import HomePage from '../pages/HomePage';
import AssessmentPage from '../pages/AssessmentPage';
import SupportPage from '../pages/SupportPage';
import ChatPage from '../pages/ChatPage';
import ToolsPage from '../pages/ToolsPage';
import CommunityPage from '../pages/CommunityPage';
import DashboardPage from '../pages/DashboardPage';
import PlansPage from '../pages/PlansPage';

// Developer 2 Pages (9 to 16)
import RegisterPage from '../pages/RegisterPage';
import ClientPanelPage from '../pages/ClientPanelPage';
import ListenerPortalPage from '../pages/ListenerPortalPage';
import VideoCallPage from '../pages/VideoCallPage';
import SafetyPage from '../pages/SafetyPage';
import RulesPage from '../pages/RulesPage';
import ServerErrorPage from '../pages/ServerErrorPage';
import NotFoundPage from '../pages/NotFoundPage';

/**
 * Vistaraz Application Routes
 * Maps all pages with proper authentication guards and role protection.
 */
export default function AppRoutes() {
  return (
    <Routes>
      {/* --- Public Exploratory Routes --- */}
      <Route path="/" element={<HomePage />} />
      <Route path="/assessment" element={<AssessmentPage />} />
      <Route path="/support" element={<SupportPage />} />
      <Route path="/tools" element={<ToolsPage />} />
      <Route path="/community" element={<CommunityPage />} />
      <Route path="/plans" element={<PlansPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/safety" element={<SafetyPage />} />
      <Route path="/rules" element={<RulesPage />} />
      <Route path="/error-500" element={<ServerErrorPage />} />

      {/* --- Protected User / Seeker Routes --- */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/client-panel"
        element={
          <ProtectedRoute>
            <ClientPanelPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/video-call"
        element={
          <ProtectedRoute>
            <VideoCallPage />
          </ProtectedRoute>
        }
      />

      {/* --- Protected Provider / Listener Routes --- */}
      <Route
        path="/listener-portal"
        element={
          <ProtectedRoute requiredRole="provider">
            <ListenerPortalPage />
          </ProtectedRoute>
        }
      />

      {/* --- Fallback 404 Route --- */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
