import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Core Authentication & Onboarding Pages
import PurposeSelectionPage from '../pages/PurposeSelectionPage';
import RegisterPage from '../pages/RegisterPage';
import LoginPage from '../pages/LoginPage';
import HelperApplicationPage from '../pages/HelperApplicationPage';
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
import ClientPanelPage from '../pages/ClientPanelPage';
import ListenerPortalPage from '../pages/ListenerPortalPage';
import VideoCallPage from '../pages/VideoCallPage';
import SafetyPage from '../pages/SafetyPage';
import RulesPage from '../pages/RulesPage';
import ServerErrorPage from '../pages/ServerErrorPage';
import NotFoundPage from '../pages/NotFoundPage';

/**
 * Vistaraz Application Routes
 * 
 * Enforces the finalized user onboarding flow:
 * Homepage -> Get Started -> Purpose Selection -> Login/Register -> Relevant User Journey
 * 
 * Includes server-backed role-based protected routes for support seekers and helpers.
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
      <Route path="/chat" element={<ChatPage />} />
      <Route path="/video-call" element={<VideoCallPage />} />
      <Route path="/error-500" element={<ServerErrorPage />} />

      {/* --- Authentication & Onboarding Flow --- */}
      <Route path="/get-started" element={<PurposeSelectionPage />} />
      <Route path="/purpose" element={<PurposeSelectionPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* --- Support Seeker Journey & Check-in --- */}
      <Route path="/assessment" element={<AssessmentPage />} />

      {/* --- Protected Support Seeker Routes --- */}
      <Route
        path="/client-panel"
        element={
          <ProtectedRoute allowedRoles={['support_seeker', 'user']}>
            <ClientPanelPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['support_seeker', 'user']}>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* --- Helper Journey & Protected Routes --- */}
      <Route
        path="/helper-application"
        element={
          <ProtectedRoute allowedRoles={['helper']}>
            <HelperApplicationPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/listener-portal"
        element={
          <ProtectedRoute allowedRoles={['helper']} requireVerifiedHelper={true}>
            <ListenerPortalPage />
          </ProtectedRoute>
        }
      />

      {/* --- Fallback 404 Route --- */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
