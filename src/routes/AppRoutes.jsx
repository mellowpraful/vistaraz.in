import React from 'react';
import { Routes, Route } from 'react-router-dom';

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
 * Maps all 16 original HTML pages to their corresponding React components.
 * 
 * Developer 1: Pages 1-8 (/ , /assessment, /support, /chat, /tools, /community, /dashboard, /plans)
 * Developer 2: Pages 9-16 (/register, /client-panel, /listener-portal, /video-call, /safety, /rules, /error-500, *)
 */
export default function AppRoutes() {
  return (
    <Routes>
      {/* --- Developer 1 Routes (Pages 1 to 8) --- */}
      <Route path="/" element={<HomePage />} />
      <Route path="/assessment" element={<AssessmentPage />} />
      <Route path="/support" element={<SupportPage />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="/tools" element={<ToolsPage />} />
      <Route path="/community" element={<CommunityPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/plans" element={<PlansPage />} />

      {/* --- Developer 2 Routes (Pages 9 to 16) --- */}
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/client-panel" element={<ClientPanelPage />} />
      <Route path="/listener-portal" element={<ListenerPortalPage />} />
      <Route path="/video-call" element={<VideoCallPage />} />
      <Route path="/safety" element={<SafetyPage />} />
      <Route path="/rules" element={<RulesPage />} />
      <Route path="/error-500" element={<ServerErrorPage />} />

      {/* --- Fallback 404 Route --- */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
