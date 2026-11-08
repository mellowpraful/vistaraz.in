import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as adminService from '../services/adminService';
import { AvatarImage } from '../utils/avatars';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  GraduationCap,
  Briefcase,
  Headphones,
  FileText,
  Settings,
  LogOut,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  Activity,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Menu,
  X,
  FileCheck,
} from 'lucide-react';
import './AdminDashboardPage.css';

export default function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active view from URL path
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/admin/seekers')) return 'seekers';
    if (path.includes('/admin/listener-applications')) return 'listeners';
    if (path.includes('/admin/intern-applications')) return 'interns';
    if (path.includes('/admin/professionals')) return 'professionals';
    if (path.includes('/admin/sessions')) return 'sessions';
    if (path.includes('/admin/reports')) return 'reports';
    if (path.includes('/admin/settings')) return 'settings';
    return 'overview';
  };

  const activeTab = getActiveTab();

  // State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Data states
  const [stats, setStats] = useState(null);
  const [seekers, setSeekers] = useState([]);
  const [seekerSearch, setSeekerSearch] = useState('');
  const [seekerPagination, setSeekerPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  const [listenerApps, setListenerApps] = useState([]);
  const [listenerFilter, setListenerFilter] = useState('all');
  const [selectedListenerApp, setSelectedListenerApp] = useState(null);
  const [listenerReviewNotes, setListenerReviewNotes] = useState('');

  const [internApps, setInternApps] = useState([]);
  const [internFilter, setInternFilter] = useState('all');
  const [selectedInternApp, setSelectedInternApp] = useState(null);
  const [internReviewNotes, setInternReviewNotes] = useState('');

  const [professionals, setProfessionals] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [reports, setReports] = useState([]);

  // Fetch overview stats
  const loadStats = useCallback(async () => {
    try {
      const res = await adminService.getAdminStats();
      if (res.success) setStats(res.data);
    } catch (err) {
      console.warn('Failed to load stats:', err);
    }
  }, []);

  // Fetch view-specific data
  const loadTabData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'overview') {
        await loadStats();
      } else if (activeTab === 'seekers') {
        const res = await adminService.getSeekers({ search: seekerSearch, page: 1 });
        if (res.success) {
          setSeekers(res.data);
          setSeekerPagination(res.pagination);
        }
      } else if (activeTab === 'listeners') {
        const res = await adminService.getListenerApplications(listenerFilter);
        if (res.success) setListenerApps(res.data);
      } else if (activeTab === 'interns') {
        const res = await adminService.getInternApplications(internFilter);
        if (res.success) setInternApps(res.data);
      } else if (activeTab === 'professionals') {
        const res = await adminService.getProfessionals();
        if (res.success) setProfessionals(res.data);
      } else if (activeTab === 'sessions') {
        const res = await adminService.getSupportSessions();
        if (res.success) setSessions(res.data);
      } else if (activeTab === 'reports') {
        const res = await adminService.getAuditReports();
        if (res.success) setReports(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load module data.');
    } finally {
      setLoading(false);
    }
  }, [activeTab, listenerFilter, internFilter, seekerSearch, loadStats]);

  useEffect(() => {
    loadTabData();
  }, [loadTabData]);

  // Handle Seeker Search
  const handleSeekerSearchSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await adminService.getSeekers({ search: seekerSearch, page: 1 });
      if (res.success) {
        setSeekers(res.data);
        setSeekerPagination(res.pagination);
      }
    } catch (err) {
      setError(err.message || 'Search failed.');
    } finally {
      setLoading(false);
    }
  };

  // Review Listener Application
  const handleReviewListener = async (action) => {
    if (!selectedListenerApp) return;
    setActionLoading(true);
    try {
      const res = await adminService.reviewListenerApplication(selectedListenerApp.id, {
        action,
        reviewNotes: listenerReviewNotes,
      });
      if (res.success) {
        setSuccessMessage(`Application ${action === 'approve' ? 'approved' : 'rejected'} successfully.`);
        setSelectedListenerApp(null);
        setListenerReviewNotes('');
        await loadTabData();
        setTimeout(() => setSuccessMessage(''), 4000);
      }
    } catch (err) {
      setError(err.message || 'Review failed.');
    } finally {
      setActionLoading(false);
    }
  };

  // Review Intern Application
  const handleReviewIntern = async (action) => {
    if (!selectedInternApp) return;
    setActionLoading(true);
    try {
      const res = await adminService.reviewInternApplication(selectedInternApp.id, {
        action,
        reviewNotes: internReviewNotes,
      });
      if (res.success) {
        setSuccessMessage(`Intern application ${action === 'approve' ? 'approved' : 'rejected'} successfully.`);
        setSelectedInternApp(null);
        setInternReviewNotes('');
        await loadTabData();
        setTimeout(() => setSuccessMessage(''), 4000);
      }
    } catch (err) {
      setError(err.message || 'Review failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  // Navigation Items
  const navItems = [
    { key: 'overview', label: 'Overview', to: '/admin/dashboard', icon: LayoutDashboard },
    { key: 'seekers', label: 'Seeker Management', to: '/admin/seekers', icon: Users },
    { key: 'listeners', label: 'Listener Applications', to: '/admin/listener-applications', icon: UserCheck },
    { key: 'interns', label: 'Intern Applications', to: '/admin/intern-applications', icon: GraduationCap },
    { key: 'professionals', label: 'Professional Management', to: '/admin/professionals', icon: Briefcase },
    { key: 'sessions', label: 'Support Sessions', to: '/admin/sessions', icon: Headphones },
    { key: 'reports', label: 'Reports & Audits', to: '/admin/reports', icon: FileText },
    { key: 'settings', label: 'Settings', to: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="vz-admin-layout">
      {/* ── Mobile overlay backdrop ── */}
      {mobileMenuOpen && (
        <div
          className="vz-admin-sidebar-overlay vz-admin-sidebar-overlay--visible"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside className={`vz-admin-sidebar ${mobileMenuOpen ? 'vz-admin-sidebar--open' : ''}`}>
        <div className="vz-admin-sidebar__header">
          <Link to="/admin/dashboard" className="vz-admin-brand" onClick={() => setMobileMenuOpen(false)}>
            <div className="vz-admin-brand-icon">🛡️</div>
            <div>
              <span className="vz-admin-brand-title">Vistaraz</span>
              <span className="vz-admin-brand-sub">Admin Portal</span>
            </div>
          </Link>
          <button
            type="button"
            className="vz-admin-sidebar-close vz-show-mobile"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="vz-admin-sidebar__nav" aria-label="Admin Navigation">
          <ul className="vz-admin-nav-list">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.key;
              return (
                <li key={item.key}>
                  <Link
                    to={item.to}
                    className={`vz-admin-nav-link ${isActive ? 'vz-admin-nav-link--active' : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon size={18} className="vz-admin-nav-icon" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="vz-admin-sidebar__footer">
          <div className="vz-admin-user-pill">
            <div className="vz-admin-avatar">A</div>
            <div className="vz-admin-user-info">
              <span className="vz-admin-user-name">{user?.name || 'Administrator'}</span>
              <span className="vz-admin-user-role">Super Admin</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="vz-admin-logout-btn"
            title="Log out of Admin Portal"
            id="admin-logout-btn"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <div className="vz-admin-main">
        {/* Top Navbar */}
        <header className="vz-admin-topbar">
          <button
            type="button"
            className="vz-admin-hamburger vz-show-mobile"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu size={22} />
          </button>

          <div className="vz-admin-topbar__title">
            <h2>{navItems.find((n) => n.key === activeTab)?.label || 'Console'}</h2>
            <span className="vz-admin-badge-live">● Live NeonDB</span>
          </div>

          <div className="vz-admin-topbar__actions">
            <button
              type="button"
              className="vz-admin-btn vz-admin-btn--ghost"
              onClick={loadTabData}
              title="Refresh current data"
            >
              <RefreshCw size={15} className={loading ? 'vz-spin' : ''} />
              <span className="vz-hide-mobile">Refresh</span>
            </button>
          </div>
        </header>

        {/* Global Feedback Banners */}
        {error && (
          <div className="vz-admin-alert vz-admin-alert--error" role="alert">
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}
        {successMessage && (
          <div className="vz-admin-alert vz-admin-alert--success" role="status">
            <CheckCircle size={18} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Module Content */}
        <main className="vz-admin-body">
          {/* ────────────────── OVERVIEW ────────────────── */}
          {activeTab === 'overview' && (
            <div className="vz-admin-view vz-admin-view--overview">
              <div className="vz-admin-kpi-grid">
                <div className="vz-admin-kpi-card">
                  <div className="vz-admin-kpi-header">
                    <span>Total Registered Users</span>
                    <Users size={18} color="#6366f1" />
                  </div>
                  <strong className="vz-admin-kpi-val">{stats?.totalUsers ?? '—'}</strong>
                  <span className="vz-admin-kpi-sub">Across all roles</span>
                </div>

                <div className="vz-admin-kpi-card">
                  <div className="vz-admin-kpi-header">
                    <span>Support Seekers</span>
                    <Users size={18} color="#10b981" />
                  </div>
                  <strong className="vz-admin-kpi-val">{stats?.totalSeekers ?? '—'}</strong>
                  <span className="vz-admin-kpi-sub">Active members seeking support</span>
                </div>

                <div className="vz-admin-kpi-card">
                  <div className="vz-admin-kpi-header">
                    <span>Active Listeners</span>
                    <UserCheck size={18} color="#8b5cf6" />
                  </div>
                  <strong className="vz-admin-kpi-val">{stats?.approvedListeners ?? '—'}</strong>
                  <span className="vz-admin-kpi-sub">{stats?.totalListeners ?? 0} total assigned</span>
                </div>

                <div className="vz-admin-kpi-card vz-admin-kpi-card--highlight">
                  <div className="vz-admin-kpi-header">
                    <span>Pending Listener Apps</span>
                    <Clock size={18} color="#f59e0b" />
                  </div>
                  <strong className="vz-admin-kpi-val">{stats?.pendingListenerApplications ?? '—'}</strong>
                  <Link to="/admin/listener-applications" className="vz-admin-kpi-link">
                    Review applications →
                  </Link>
                </div>

                <div className="vz-admin-kpi-card">
                  <div className="vz-admin-kpi-header">
                    <span>Pending Intern Apps</span>
                    <GraduationCap size={18} color="#ec4899" />
                  </div>
                  <strong className="vz-admin-kpi-val">{stats?.pendingInternApplications ?? '—'}</strong>
                  <Link to="/admin/intern-applications" className="vz-admin-kpi-link">
                    Review interns →
                  </Link>
                </div>

                <div className="vz-admin-kpi-card">
                  <div className="vz-admin-kpi-header">
                    <span>Active Support Sessions</span>
                    <Activity size={18} color="#06b6d4" />
                  </div>
                  <strong className="vz-admin-kpi-val">{stats?.activeSupportSessions ?? '—'}</strong>
                  <span className="vz-admin-kpi-sub">{stats?.totalSupportSessions ?? 0} total sessions logged</span>
                </div>
              </div>

              {/* Quick Launchpad */}
              <div className="vz-admin-section">
                <h3 className="vz-admin-section-title">Administrative Actions</h3>
                <div className="vz-admin-action-row">
                  <Link to="/admin/listener-applications" className="vz-admin-action-card">
                    <UserCheck size={22} color="var(--vz-primary)" />
                    <div>
                      <strong>Peer Listener Review Queue</strong>
                      <p>Inspect education, language capabilities, and approve listener credentials.</p>
                    </div>
                    <ChevronRight size={18} className="vz-admin-action-arrow" />
                  </Link>

                  <Link to="/admin/intern-applications" className="vz-admin-action-card">
                    <GraduationCap size={22} color="#ec4899" />
                    <div>
                      <strong>Academic Intern Queue</strong>
                      <p>Evaluate university institution credentials, statement of purpose, and assign intern role.</p>
                    </div>
                    <ChevronRight size={18} className="vz-admin-action-arrow" />
                  </Link>

                  <Link to="/admin/seekers" className="vz-admin-action-card">
                    <Users size={22} color="#10b981" />
                    <div>
                      <strong>Seeker Accounts Directory</strong>
                      <p>Audit registered support seeker profiles and onboarding completion states.</p>
                    </div>
                    <ChevronRight size={18} className="vz-admin-action-arrow" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* ────────────────── SEEKER MANAGEMENT ────────────────── */}
          {activeTab === 'seekers' && (
            <div className="vz-admin-view">
              <div className="vz-admin-toolbar">
                <form onSubmit={handleSeekerSearchSubmit} className="vz-admin-search-form">
                  <Search size={16} className="vz-admin-search-icon" />
                  <input
                    type="text"
                    placeholder="Search by name, pseudonym or email..."
                    value={seekerSearch}
                    onChange={(e) => setSeekerSearch(e.target.value)}
                    className="vz-admin-search-input"
                  />
                  <button type="submit" className="vz-admin-btn vz-admin-btn--primary">
                    Search
                  </button>
                </form>
              </div>

              <div className="vz-admin-table-wrap">
                <table className="vz-admin-table">
                  <thead>
                    <tr>
                      <th>Avatar</th>
                      <th>Account Name</th>
                      <th>Confidential Real Name</th>
                      <th>Email</th>
                      <th>Profile Status</th>
                      <th>Joined Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {seekers.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="vz-admin-empty">
                          No seekers found matching search criteria.
                        </td>
                      </tr>
                    ) : (
                      seekers.map((s) => (
                        <tr key={s.id}>
                          <td>
                            {s.avatarId ? (
                              <AvatarImage avatarId={s.avatarId} size={32} />
                            ) : (
                              <span className="vz-admin-avatar-stub">👤</span>
                            )}
                          </td>
                          <td style={{ fontWeight: 600 }}>{s.name}</td>
                          <td>{s.realName || <em className="vz-muted">Not Set</em>}</td>
                          <td>{s.email}</td>
                          <td>
                            {s.isProfileCompleted ? (
                              <span className="vz-badge vz-badge--green">Completed</span>
                            ) : (
                              <span className="vz-badge vz-badge--yellow">Pending Setup</span>
                            )}
                          </td>
                          <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                {seekerPagination.totalPages > 1 && (
                  <div className="vz-admin-pagination">
                    <span>
                      Showing page {seekerPagination.page} of {seekerPagination.totalPages} ({seekerPagination.total} total registered)
                    </span>
                    <div className="vz-admin-pagination-actions">
                      <button
                        type="button"
                        className="vz-admin-btn vz-admin-btn--sm vz-admin-btn--outline"
                        disabled={seekerPagination.page <= 1}
                        onClick={async () => {
                          const newPage = seekerPagination.page - 1;
                          const res = await adminService.getSeekers({ search: seekerSearch, page: newPage });
                          if (res.success) {
                            setSeekers(res.data);
                            setSeekerPagination(res.pagination);
                          }
                        }}
                      >
                        Previous
                      </button>
                      <button
                        type="button"
                        className="vz-admin-btn vz-admin-btn--sm vz-admin-btn--outline"
                        disabled={seekerPagination.page >= seekerPagination.totalPages}
                        onClick={async () => {
                          const newPage = seekerPagination.page + 1;
                          const res = await adminService.getSeekers({ search: seekerSearch, page: newPage });
                          if (res.success) {
                            setSeekers(res.data);
                            setSeekerPagination(res.pagination);
                          }
                        }}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ────────────────── LISTENER APPLICATIONS ────────────────── */}
          {activeTab === 'listeners' && (
            <div className="vz-admin-view">
              <div className="vz-admin-toolbar">
                <div className="vz-admin-filter-group">
                  {['all', 'pending', 'approved', 'rejected'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      className={`vz-admin-filter-pill ${listenerFilter === st ? 'vz-admin-filter-pill--active' : ''}`}
                      onClick={() => setListenerFilter(st)}
                    >
                      {st.charAt(0).toUpperCase() + st.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="vz-admin-table-wrap">
                <table className="vz-admin-table">
                  <thead>
                    <tr>
                      <th>Applicant</th>
                      <th>Qualification</th>
                      <th>Languages</th>
                      <th>Application Status</th>
                      <th>Verification Status</th>
                      <th>Applied On</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listenerApps.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="vz-admin-empty">
                          No listener applications found in this queue.
                        </td>
                      </tr>
                    ) : (
                      listenerApps.map((app) => (
                        <tr key={app.id}>
                          <td>
                            <strong>{app.applicantName}</strong>
                            <div className="vz-sub-meta">{app.applicantEmail}</div>
                          </td>
                          <td>{app.qualification || 'Peer Supporter'}</td>
                          <td>{(app.languages || ['en']).join(', ')}</td>
                          <td>
                            <span className={`vz-badge vz-badge--${app.applicationStatus === 'approved' ? 'green' : app.applicationStatus === 'rejected' ? 'red' : 'yellow'}`}>
                              {app.applicationStatus}
                            </span>
                          </td>
                          <td>
                            <span className={`vz-badge vz-badge--${app.verificationStatus === 'verified' ? 'green' : app.verificationStatus === 'rejected' ? 'red' : 'yellow'}`}>
                              {app.verificationStatus}
                            </span>
                          </td>
                          <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                          <td>
                            <button
                              type="button"
                              className="vz-admin-btn vz-admin-btn--sm vz-admin-btn--outline"
                              onClick={() => {
                                setSelectedListenerApp(app);
                                setListenerReviewNotes(app.reviewNotes || '');
                              }}
                            >
                              Review Details
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Review Modal */}
              {selectedListenerApp && (
                <div className="vz-admin-modal-overlay" onClick={() => setSelectedListenerApp(null)}>
                  <div className="vz-admin-modal" onClick={(e) => e.stopPropagation()}>
                    <div className="vz-admin-modal-header">
                      <h3>Review Listener Application</h3>
                      <button type="button" onClick={() => setSelectedListenerApp(null)} className="vz-modal-close">
                        <X size={20} />
                      </button>
                    </div>

                    <div className="vz-admin-modal-body">
                      <div className="vz-app-detail-row">
                        <strong>Applicant:</strong>
                        <span>{selectedListenerApp.applicantName} ({selectedListenerApp.applicantEmail})</span>
                      </div>
                      <div className="vz-app-detail-row">
                        <strong>Qualification / Background:</strong>
                        <span>{selectedListenerApp.qualification || 'General Peer Supporter'}</span>
                      </div>
                      <div className="vz-app-detail-row">
                        <strong>Languages:</strong>
                        <span>{(selectedListenerApp.languages || []).join(', ')}</span>
                      </div>
                      <div className="vz-app-detail-row">
                        <strong>Self Introduction:</strong>
                        <p className="vz-app-intro-box">{selectedListenerApp.introduction || 'No self-introduction provided.'}</p>
                      </div>

                      <div className="vz-app-review-section">
                        <label className="vz-admin-auth-label">Internal Administrative Review Notes</label>
                        <textarea
                          rows={3}
                          className="vz-admin-textarea"
                          placeholder="Document your review decisions or verification notes..."
                          value={listenerReviewNotes}
                          onChange={(e) => setListenerReviewNotes(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="vz-admin-modal-footer">
                      <button
                        type="button"
                        className="vz-admin-btn vz-admin-btn--danger"
                        disabled={actionLoading}
                        onClick={() => handleReviewListener('reject')}
                      >
                        <XCircle size={16} /> Reject Application
                      </button>
                      <button
                        type="button"
                        className="vz-admin-btn vz-admin-btn--success"
                        disabled={actionLoading}
                        onClick={() => handleReviewListener('approve')}
                      >
                        <CheckCircle size={16} /> Approve &amp; Activate Listener
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ────────────────── INTERN APPLICATIONS ────────────────── */}
          {activeTab === 'interns' && (
            <div className="vz-admin-view">
              <div className="vz-admin-toolbar">
                <div className="vz-admin-filter-group">
                  {['all', 'pending', 'approved', 'rejected'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      className={`vz-admin-filter-pill ${internFilter === st ? 'vz-admin-filter-pill--active' : ''}`}
                      onClick={() => setInternFilter(st)}
                    >
                      {st.charAt(0).toUpperCase() + st.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="vz-admin-table-wrap">
                <table className="vz-admin-table">
                  <thead>
                    <tr>
                      <th>Applicant</th>
                      <th>Academic Institution</th>
                      <th>Degree &amp; Year</th>
                      <th>Status</th>
                      <th>Applied Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {internApps.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="vz-admin-empty">
                          No intern applications found in this queue.
                        </td>
                      </tr>
                    ) : (
                      internApps.map((app) => (
                        <tr key={app.id}>
                          <td>
                            <strong>{app.applicantName}</strong>
                            <div className="vz-sub-meta">{app.applicantEmail}</div>
                          </td>
                          <td>{app.institution}</td>
                          <td>{app.degree} ({app.yearOfStudy || 'Undergraduate'})</td>
                          <td>
                            <span className={`vz-badge vz-badge--${app.applicationStatus === 'approved' ? 'green' : app.applicationStatus === 'rejected' ? 'red' : 'yellow'}`}>
                              {app.applicationStatus}
                            </span>
                          </td>
                          <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                          <td>
                            <button
                              type="button"
                              className="vz-admin-btn vz-admin-btn--sm vz-admin-btn--outline"
                              onClick={() => {
                                setSelectedInternApp(app);
                                setInternReviewNotes(app.reviewNotes || '');
                              }}
                            >
                              Review Intern
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Intern Review Modal */}
              {selectedInternApp && (
                <div className="vz-admin-modal-overlay" onClick={() => setSelectedInternApp(null)}>
                  <div className="vz-admin-modal" onClick={(e) => e.stopPropagation()}>
                    <div className="vz-admin-modal-header">
                      <h3>Review Academic Intern Application</h3>
                      <button type="button" onClick={() => setSelectedInternApp(null)} className="vz-modal-close">
                        <X size={20} />
                      </button>
                    </div>

                    <div className="vz-admin-modal-body">
                      <div className="vz-app-detail-row">
                        <strong>Student:</strong>
                        <span>{selectedInternApp.applicantName} ({selectedInternApp.applicantEmail})</span>
                      </div>
                      <div className="vz-app-detail-row">
                        <strong>Institution:</strong>
                        <span>{selectedInternApp.institution}</span>
                      </div>
                      <div className="vz-app-detail-row">
                        <strong>Degree &amp; Year:</strong>
                        <span>{selectedInternApp.degree} — {selectedInternApp.yearOfStudy || 'Current'}</span>
                      </div>
                      <div className="vz-app-detail-row">
                        <strong>Statement of Purpose / Motivation:</strong>
                        <p className="vz-app-intro-box">{selectedInternApp.motivation || 'No statement provided.'}</p>
                      </div>

                      <div className="vz-app-review-section">
                        <label className="vz-admin-auth-label">Internal Review Notes</label>
                        <textarea
                          rows={3}
                          className="vz-admin-textarea"
                          placeholder="Document verification of enrollment or student supervisor checks..."
                          value={internReviewNotes}
                          onChange={(e) => setInternReviewNotes(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="vz-admin-modal-footer">
                      <button
                        type="button"
                        className="vz-admin-btn vz-admin-btn--danger"
                        disabled={actionLoading}
                        onClick={() => handleReviewIntern('reject')}
                      >
                        <XCircle size={16} /> Reject Intern
                      </button>
                      <button
                        type="button"
                        className="vz-admin-btn vz-admin-btn--success"
                        disabled={actionLoading}
                        onClick={() => handleReviewIntern('approve')}
                      >
                        <CheckCircle size={16} /> Accept &amp; Assign Intern Role
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ────────────────── PROFESSIONALS ────────────────── */}
          {activeTab === 'professionals' && (
            <div className="vz-admin-view">
              <div className="vz-admin-notice-box">
                <Shield size={18} />
                <span>
                  Clinical Governance Notice: Professional accounts represent licensed clinical practitioners (psychologists, therapists). Formal license verification is conducted offline by credentialing committees before clinical queues are unlocked.
                </span>
              </div>

              <div className="vz-admin-table-wrap">
                <table className="vz-admin-table">
                  <thead>
                    <tr>
                      <th>Practitioner</th>
                      <th>Title &amp; Qualifications</th>
                      <th>License #</th>
                      <th>Licensing Body</th>
                      <th>Specialties</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {professionals.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="vz-admin-empty">
                          No professional mental-health accounts registered.
                        </td>
                      </tr>
                    ) : (
                      professionals.map((p) => (
                        <tr key={p.id}>
                          <td>
                            <strong>{p.name}</strong>
                            <div className="vz-sub-meta">{p.email}</div>
                          </td>
                          <td>
                            <strong>{p.title}</strong>
                            <div className="vz-sub-meta">{p.qualifications}</div>
                          </td>
                          <td><code>{p.licenseNumber}</code></td>
                          <td>{p.licensingBody}</td>
                          <td>{(p.specialties || []).join(', ')}</td>
                          <td>
                            <span className={`vz-badge vz-badge--${p.verificationStatus === 'verified' ? 'green' : 'yellow'}`}>
                              {p.verificationStatus}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ────────────────── SUPPORT SESSIONS ────────────────── */}
          {activeTab === 'sessions' && (
            <div className="vz-admin-view">
              <div className="vz-admin-notice-box">
                <Shield size={18} />
                <span>
                  Privacy Boundary: Session metadata is monitored to track platform queue health. In compliance with sanctuary ethics, private chat messages and audio streams are end-to-end encrypted and never exposed in the admin dashboard.
                </span>
              </div>

              <div className="vz-admin-table-wrap">
                <table className="vz-admin-table">
                  <thead>
                    <tr>
                      <th>Session ID</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Support Seeker</th>
                      <th>Assigned Listener</th>
                      <th>Started / Scheduled</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="vz-admin-empty">
                          No active or scheduled sessions logged.
                        </td>
                      </tr>
                    ) : (
                      sessions.map((sess) => (
                        <tr key={sess.id}>
                          <td><code>{sess.id.slice(0, 8)}...</code></td>
                          <td>
                            <span className="vz-chip mint">{sess.sessionType}</span>
                          </td>
                          <td>
                            <span className={`vz-badge vz-badge--${sess.sessionStatus === 'active' ? 'green' : sess.sessionStatus === 'scheduled' ? 'blue' : 'gray'}`}>
                              {sess.sessionStatus}
                            </span>
                          </td>
                          <td>
                            <strong>{sess.seekerName}</strong>
                            <div className="vz-sub-meta">{sess.seekerEmail}</div>
                          </td>
                          <td>
                            <strong>{sess.helperName}</strong>
                            {sess.helperEmail && <div className="vz-sub-meta">{sess.helperEmail}</div>}
                          </td>
                          <td>{new Date(sess.startedAt || sess.scheduledFor || sess.createdAt).toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ────────────────── REPORTS & AUDITS ────────────────── */}
          {activeTab === 'reports' && (
            <div className="vz-admin-view">
              <div className="vz-admin-table-wrap">
                <table className="vz-admin-table">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>Action</th>
                      <th>Actor</th>
                      <th>Resource Type</th>
                      <th>Resource ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="vz-admin-empty">
                          No audit trail events recorded.
                        </td>
                      </tr>
                    ) : (
                      reports.map((r) => (
                        <tr key={r.id}>
                          <td>{new Date(r.createdAt).toLocaleString()}</td>
                          <td>
                            <span className="vz-badge vz-badge--blue">{r.action}</span>
                          </td>
                          <td>
                            <strong>{r.actorName}</strong>
                            {r.actorEmail && <div className="vz-sub-meta">{r.actorEmail}</div>}
                          </td>
                          <td><code>{r.resourceType}</code></td>
                          <td><code>{r.resourceId ? r.resourceId.slice(0, 8) + '...' : '—'}</code></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ────────────────── SETTINGS ────────────────── */}
          {activeTab === 'settings' && (
            <div className="vz-admin-view vz-admin-view--settings">
              <div className="vz-admin-settings-card">
                <h3>System Architecture &amp; Security Specifications</h3>
                <div className="vz-admin-spec-grid">
                  <div className="vz-spec-item">
                    <span className="vz-spec-label">Environment</span>
                    <strong className="vz-spec-val">Production / Staging</strong>
                  </div>
                  <div className="vz-spec-item">
                    <span className="vz-spec-label">Authentication Engine</span>
                    <strong className="vz-spec-val">Better Auth v1.7.18</strong>
                  </div>
                  <div className="vz-spec-item">
                    <span className="vz-spec-label">Database Infrastructure</span>
                    <strong className="vz-spec-val">NeonDB Serverless PostgreSQL</strong>
                  </div>
                  <div className="vz-spec-item">
                    <span className="vz-spec-label">Access Control Model</span>
                    <strong className="vz-spec-val">Strict Server-side RBAC</strong>
                  </div>
                  <div className="vz-spec-item">
                    <span className="vz-spec-label">Session Storage</span>
                    <strong className="vz-spec-val">HTTP-only Secure Cookies</strong>
                  </div>
                  <div className="vz-spec-item">
                    <span className="vz-spec-label">Registered Admin Identity</span>
                    <strong className="vz-spec-val">{user?.email || 'admin@vistaraz.in'}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

