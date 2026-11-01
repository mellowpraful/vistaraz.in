import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Core Authentication & Onboarding Pages
import PurposeSelectionPage from '../pages/PurposeSelectionPage';
import RegisterPage from '../pages/RegisterPage';
import LoginPage from '../pages/LoginPage';
import HelperApplicationPage from '../pages/HelperApplicationPage';
import ProtectedRoute from '../components/common/ProtectedRoute';

// Core Sanctuary & Informational Pages
import HomePage from '../pages/HomePage';
import AssessmentPage from '../pages/AssessmentPage';
import SupportPage from '../pages/SupportPage';
import ChatPage from '../pages/ChatPage';
import ToolsPage from '../pages/ToolsPage';
import CommunityPage from '../pages/CommunityPage';
import DashboardPage from '../pages/DashboardPage';
import PlansPage from '../pages/PlansPage';

// Portal & Workspace Pages
import ClientPanelPage from '../pages/ClientPanelPage';
import ListenerPortalPage from '../pages/ListenerPortalPage';
import VideoCallPage from '../pages/VideoCallPage';
import SafetyPage from '../pages/SafetyPage';
import RulesPage from '../pages/RulesPage';
import ServerErrorPage from '../pages/ServerErrorPage';
import NotFoundPage from '../pages/NotFoundPage';

/**
 * Vistaraz Application Routes
 * Enforces onboarding flow and role-based protected routes.
 */
export default function AppRoutes() {
  return (
    <Routes>
      {/* --- Public Landing & Information Pages --- */}
      <Route path="/" element={<HomePage />} />
      <Route path="/safety" element={<SafetyPage />} />
      <Route path="/rules" element={<RulesPage />} />
      <Route path="/plans" element={<PlansPage />} />
      <Route path="/tools" element={<ToolsPage />} />
      <Route path="/support" element={<SupportPage />} />
      <Route path="/community" element={<CommunityPage />} />
      <Route path="/assessment" element={<AssessmentPage />} />
      <Route path="/error-500" element={<ServerErrorPage />} />

      {/* --- Authentication & Onboarding Flow --- */}
      <Route path="/get-started" element={<PurposeSelectionPage />} />
      <Route path="/purpose" element={<PurposeSelectionPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* --- Protected Support Seeker Routes --- */}
      <Route
        path="/client-panel"
        element={
          <ProtectedRoute allowedRoles={['support_seeker', 'seeker']}>
            <ClientPanelPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['support_seeker', 'seeker']}>
            <DashboardPage />
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

      {/* --- Helper / Listener Journey & Protected Routes --- */}
      <Route
        path="/helper-application"
        element={
          <ProtectedRoute allowedRoles={['helper', 'provider']}>
            <HelperApplicationPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/listener-portal"
        element={
          <ProtectedRoute allowedRoles={['helper', 'provider']}>
            <ListenerPortalPage />
          </ProtectedRoute>
        }
      />

      {/* --- Fallback 404 Route --- */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
