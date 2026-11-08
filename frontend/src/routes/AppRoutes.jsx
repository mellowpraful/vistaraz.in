import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Core Authentication & Onboarding Pages
import PurposeSelectionPage from '../pages/PurposeSelectionPage';
import RegisterPage from '../pages/RegisterPage';
import LoginPage from '../pages/LoginPage';
import SeekerProfileSetupPage from '../pages/SeekerProfileSetupPage';
import HelperApplicationPage from '../pages/HelperApplicationPage';
import ProtectedRoute from '../components/common/ProtectedRoute';

// Admin Portal
import AdminLoginPage from '../pages/AdminLoginPage';
import AdminDashboardPage from '../pages/AdminDashboardPage';

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
      <Route path="/error-500" element={<ServerErrorPage />} />

      {/* --- Authentication & Onboarding Flow --- */}
      <Route path="/get-started" element={<PurposeSelectionPage />} />
      <Route path="/purpose" element={<PurposeSelectionPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* --- First-Time Seeker Profile Setup --- */}
      <Route
        path="/seeker-setup"
        element={
          <ProtectedRoute allowedRoles={['support_seeker', 'user']}>
            <SeekerProfileSetupPage />
          </ProtectedRoute>
        }
      />

      {/* --- Support Seeker Journey & Check-in --- */}
      <Route path="/assessment" element={<AssessmentPage />} />

      {/* --- Protected Support Seeker Routes --- */}
      <Route
        path="/client-panel"
        element={
          <ProtectedRoute allowedRoles={['support_seeker', 'user']} requireSeekerProfile={true}>
            <ClientPanelPage />
          </ProtectedRoute>
        }
      />
      {/* Automatically redirect /dashboard to /client-panel to avoid duplicate experiences */}
      <Route
        path="/dashboard"
        element={<Navigate to="/client-panel" replace />}
      />

      {/* --- Protected Support Interaction Routes --- */}
      <Route
        path="/chat"
        element={
          <ProtectedRoute allowedRoles={['support_seeker', 'user']} requireSeekerProfile={true}>
            <ChatPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/video-call"
        element={
          <ProtectedRoute allowedRoles={['support_seeker', 'user']} requireSeekerProfile={true}>
            <VideoCallPage />
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

      {/* ── Admin Portal (direct URL access only, no public link) ── */}
      {/* Public admin login — no auth required */}
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* Protected admin dashboard routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/seekers"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/listener-applications"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/intern-applications"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/professionals"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/sessions"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />

      {/* --- Fallback 404 Route --- */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
