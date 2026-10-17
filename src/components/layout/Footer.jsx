import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Heart, Mail, ExternalLink } from 'lucide-react';
import logoImg from '../../assets/images/logo.png';
import './Footer.css';

/**
 * Vistaraz Footer Component
 * Human-centered, calming footer with crisis notices, quick links, and social connections.
 */
export default function Footer() {
  return (
    <footer className="vz-footer">
      <div className="vz-container">
        {/* Crisis Safeguarding Banner */}
        <div className="vz-footer__crisis-banner">
          <div className="vz-footer__crisis-left">
            <span className="vz-footer__crisis-icon">
              <ShieldAlert size={20} />
            </span>
            <div>
              <p className="vz-footer__crisis-title">In immediate distress or need urgent help?</p>
              <p className="vz-footer__crisis-desc">
                Vistaraz is for non-crisis peer and wellbeing guidance. For emergency support, view verified helplines.
              </p>
            </div>
          </div>
          <Link to="/safety" className="vz-footer__crisis-btn">
            Safety & Crisis Help →
          </Link>
        </div>

        {/* Footer Main Grid */}
        <div className="vz-footer__grid">
          {/* Brand Column */}
          <div className="vz-footer__brand-col">
            <Link to="/" className="vz-footer__brand" aria-label="Vistaraz Home">
              <img
                src={logoImg}
                alt="Vistaraz — A better way to reach out"
                className="vz-footer__logo-img"
              />
            </Link>
            <p className="vz-footer__mission">
              A private, judgement-free space for young people to pause, talk things through, and access compassionate support.
            </p>
          </div>

          {/* Quick Links Column */}
          <div className="vz-footer__col">
            <h4 className="vz-footer__heading">Support & Care</h4>
            <ul className="vz-footer__links">
              <li><Link to="/assessment">Wellbeing Check-in</Link></li>
              <li><Link to="/support">Find a Listener</Link></li>
              <li><Link to="/chat">Chat Support</Link></li>
              <li><Link to="/video-call">Voice & Video Sessions</Link></li>
              <li><Link to="/tools">Wellbeing Toolkit</Link></li>
            </ul>
          </div>

          {/* Community & Portal */}
          <div className="vz-footer__col">
            <h4 className="vz-footer__heading">Platform</h4>
            <ul className="vz-footer__links">
              <li><Link to="/community">Community Space</Link></li>
              <li><Link to="/plans">Membership Plans</Link></li>
              <li><Link to="/dashboard">User Dashboard</Link></li>
              <li><Link to="/client-panel">My Care Panel</Link></li>
              <li><Link to="/listener-portal">Support Listener Portal</Link></li>
            </ul>
          </div>

          {/* Legal & Trust */}
          <div className="vz-footer__col">
            <h4 className="vz-footer__heading">Safety & Trust</h4>
            <ul className="vz-footer__links">
              <li><Link to="/safety">Crisis & Safety Resources</Link></li>
              <li><Link to="/rules">Terms & Community Rules</Link></li>
              <li><Link to="/register?role=provider">Become a Listener</Link></li>
              <li><a href="mailto:vistaraz26@gmail.com">Contact Team</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="vz-footer__bottom">
          <p className="vz-footer__copyright">
            © 2026 Vistaraz · Innovate · Heal · Impact. Built with care for real life and real people.
          </p>
          <div className="vz-footer__socials">
            <a href="https://www.youtube.com/@Vistaraz26" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
              YouTube
            </a>
            <a href="https://www.instagram.com/vistaraz/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              Instagram
            </a>
            <a href="https://www.linkedin.com/company/vistaraz/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              LinkedIn
            </a>
            <a href="mailto:vistaraz26@gmail.com" aria-label="Email">
              vistaraz26@gmail.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
