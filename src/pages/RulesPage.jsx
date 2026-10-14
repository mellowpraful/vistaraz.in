import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import {
  FileText, ShieldAlert, AlertTriangle, ArrowLeft, Printer,
  Search, CheckCircle2, ChevronRight, Phone, Mail, Globe,
  ShieldCheck, HelpCircle, Lock, BookOpen
} from 'lucide-react';
import './RulesPage.css';

/**
 * RulesPage
 * Assigned to: Developer 2
 * Source: rules.html
 * Route: /rules
 *
 * Terms & Conditions, Code of Conduct & Sanctuary Rules
 * 17 complete legal clauses, interactive Table of Contents jump links,
 * instant clause search filter, warning banners, and print layout.
 */

const SECTIONS = [
  { id: 'acceptance', num: '1', title: 'Acceptance of Terms' },
  { id: 'platform', num: '2', title: 'About Vistaraz' },
  { id: 'eligibility', num: '3', title: 'Eligibility & Account Use' },
  { id: 'user-conduct', num: '4', title: 'User & Student Conduct' },
  { id: 'supporter-responsibility', num: '5', title: 'Supporter & Listener Responsibilities' },
  { id: 'interactions', num: '6', title: 'User-to-User Interactions' },
  { id: 'advice', num: '7', title: 'Guidance & Information Disclaimer' },
  { id: 'liability', num: '8', title: 'Limitation of Liability' },
  { id: 'privacy', num: '9', title: 'Privacy & Personal Information' },
  { id: 'intellectual-property', num: '10', title: 'Intellectual Property' },
  { id: 'prohibited', num: '11', title: 'Prohibited Activities' },
  { id: 'suspension', num: '12', title: 'Suspension & Termination' },
  { id: 'availability', num: '13', title: 'Platform Availability' },
  { id: 'third-party', num: '14', title: 'Third-Party Services & Links' },
  { id: 'changes', num: '15', title: 'Changes to These Terms' },
  { id: 'law', num: '16', title: 'Governing Law & Jurisdiction' },
  { id: 'contact', num: '17', title: 'Contact & Grievance Information' },
];

export default function RulesPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSections = SECTIONS.filter(s =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function handlePrint() {
    window.print();
  }

  return (
    <AppLayout>
      <div className="rules-page-container">
        {/* Header Hero */}
        <header className="rules-hero">
          <div className="rules-hero__top">
            <span className="vz-eyebrow" style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
              PLATFORM GOVERNANCE &amp; ETHICS CODE
            </span>
            <div className="rules-hero__actions">
              <Button
                variant="outline"
                size="sm"
                icon={<Printer size={14} />}
                onClick={handlePrint}
                className="rules-print-btn"
              >
                Print Document
              </Button>
            </div>
          </div>

          <h1 className="rules-hero__title">Terms, Conditions &amp; Sanctuary Rules</h1>

          <p className="rules-hero__desc">
            These Terms &amp; Conditions govern access to and use of Vistaraz, an interactive chat, tele-support,
            and peer guidance sanctuary connecting seekers with trained supporters and support listener interns.
          </p>

          <div className="rules-hero__meta">
            <span className="rules-badge">Effective Date: 24 August 2026</span>
            <span className="rules-badge">Version 2.4 (Peer Care &amp; Student Safety Verified)</span>
          </div>
        </header>

        {/* Layout Grid: Sidebar TOC + Main Content */}
        <div className="rules-layout">
          {/* Sticky Table of Contents Sidebar */}
          <aside className="rules-sidebar">
            <div className="rules-toc-card">
              <div className="rules-search-box">
                <Search size={14} className="rules-search-icon" />
                <input
                  type="text"
                  placeholder="Filter clauses..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="rules-search-input"
                  aria-label="Filter clauses"
                />
              </div>

              <div className="rules-toc-header">
                <strong>Table of Contents</strong>
                <span className="rules-toc-count">{filteredSections.length} Sections</span>
              </div>

              <nav className="rules-toc-nav" aria-label="Table of Contents">
                <ul>
                  {filteredSections.map(s => (
                    <li key={s.id}>
                      <button
                        onClick={() => scrollToSection(s.id)}
                        className="rules-toc-link"
                      >
                        <span className="rules-toc-num">{s.num}.</span>
                        <span className="rules-toc-text">{s.title}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="rules-toc-footer">
                <ShieldCheck size={16} color="var(--vz-success)" />
                <span>Safeguarded Sanctuary Platform</span>
              </div>
            </div>
          </aside>

          {/* Main Article Content */}
          <article className="rules-content">
            {/* Introductory Notice Card */}
            <div className="rules-intro-box">
              <div className="rules-intro-icon">
                <BookOpen size={22} color="var(--vz-primary)" />
              </div>
              <div>
                <strong>Please read these Terms carefully before participating.</strong>
                <p>
                  By accessing, registering for, or using Vistaraz, you acknowledge that you have read, understood,
                  and agreed to be bound by these Terms &amp; Conditions, the Student Sanctuary Conduct Code, and
                  all applicable safeguarding protocols.
                </p>
              </div>
            </div>

            {/* ── 1. Acceptance of Terms ── */}
            <section id="acceptance" className="rules-section">
              <div className="rules-section__num-pill">1</div>
              <h2>Acceptance of Terms</h2>
              <p>
                These Terms &amp; Conditions constitute a legally binding agreement between you and Vistaraz regarding
                your access to and use of the platform, web applications, and related guidance services.
              </p>
              <p>
                If you do not agree with these Terms, you must immediately discontinue use of Vistaraz.
              </p>
              <p>
                Continued use of the platform following the posting of any updates or amendments constitutes acceptance
                of the revised Terms, subject to applicable regulations.
              </p>
            </section>

            {/* ── 2. About Vistaraz ── */}
            <section id="platform" className="rules-section">
              <div className="rules-section__num-pill">2</div>
              <h2>About Vistaraz</h2>
              <p>
                Vistaraz is an interactive peer-support and wellbeing technology platform designed to facilitate
                empathic communication, mindful conversations, active listening, and guidance interactions between
                students and participating peer supporters or psychology student interns.
              </p>
              <p>
                Vistaraz primarily serves students, adolescents, learners, and young adults seeking accessible guidance,
                conversation, stress relief, and community belonging.
              </p>
              <p>
                Vistaraz acts strictly as a technology facilitator and communication intermediary. The platform does
                not represent that every supporter, statement, recommendation, or conversation will be suitable,
                clinically definitive, complete, or beneficial for every individual's unique health situation.
              </p>
            </section>

            {/* ── 3. Eligibility & Account Use ── */}
            <section id="eligibility" className="rules-section">
              <div className="rules-section__num-pill">3</div>
              <h2>Eligibility &amp; Account Use</h2>
              <p>
                You are responsible for ensuring that your participation on Vistaraz complies with all applicable local,
                state, and national laws in your jurisdiction.
              </p>
              <ul className="rules-list">
                <li>You must provide profile and onboarding information that is truthful and not intentionally deceptive.</li>
                <li>You must maintain the confidentiality of your session keys, access links, and credentials.</li>
                <li>You are solely responsible for all actions conducted through your active account or anonymous pseudonym.</li>
                <li>You must not impersonate any other individual, student, licensed therapist, clinician, or platform administrator.</li>
                <li>Users below the legal age of majority must participate only with required parental/guardian consent where applicable.</li>
              </ul>
            </section>

            {/* ── 4. User & Student Conduct ── */}
            <section id="user-conduct" className="rules-section">
              <div className="rules-section__num-pill">4</div>
              <h2>User &amp; Student Conduct</h2>
              <p>
                Vistaraz is maintained as a safe, compassionate sanctuary. Every user and student is expected to treat
                supporters, peers, and trainees with dignity, courtesy, and respect.
              </p>
              <div className="rules-subbox prohibited">
                <h4>Strict Prohibitions for Seekers &amp; Students:</h4>
                <ul className="rules-list">
                  <li>Harassing, threatening, insulting, stalking, or verbally abusing supporters or interns.</li>
                  <li>Using hate speech, sexually explicit materials, or derogatory language.</li>
                  <li>Attempting to pressure, manipulate, or solicit personal romantic connections with listeners.</li>
                  <li>Soliciting or demanding private phone numbers, personal social media handles, or residential addresses.</li>
                  <li>Recording, screen-capturing, or publishing private support chats without legal consent.</li>
                  <li>Using the platform to facilitate commercial promotion or unlawful transactions.</li>
                </ul>
              </div>
              <p className="rules-highlight">
                Violation of these conduct standards will result in immediate permanent banning and revocation of platform access.
              </p>
            </section>

            {/* ── 5. Supporter & Listener Responsibilities ── */}
            <section id="supporter-responsibility" className="rules-section">
              <div className="rules-section__num-pill">5</div>
              <h2>Supporter &amp; Listener Responsibilities</h2>
              <p>
                Peer listeners and psychology interns participating on Vistaraz are held to strict ethical codes and
                boundaries during every voice, video, or chat interaction:
              </p>
              <ul className="rules-list">
                <li>Supporters must maintain compassionate, non-judgmental, and professional boundaries at all times.</li>
                <li>Listeners must never bring their own personal crises, financial distress, or private disputes into client sessions.</li>
                <li>Listeners are strictly prohibited from cultivating emotional, romantic, financial, or personal dependency.</li>
                <li>Listeners must never monetize, exploit, or retain personal disclosures shared by clients.</li>
                <li>Listeners must clearly identify themselves as <strong>Support Listeners / Trainees</strong> and never claim to be licensed psychiatrists or medical physicians unless formally credentialed.</li>
                <li>Listeners must immediately trigger the Clinical Supervisor Escalation protocol whenever an immediate safety risk is identified.</li>
              </ul>
            </section>

            {/* ── 6. User-to-User Interactions ── */}
            <section id="interactions" className="rules-section">
              <div className="rules-section__num-pill">6</div>
              <h2>User-to-User Interactions</h2>
              <p>
                Vistaraz provides the technical medium for supportive connection but cannot control every private
                sentiment expressed between participants.
              </p>
              <p>
                Users are strongly advised to exercise caution: never share financial account details, passwords,
                official identity cards (Aadhaar, PAN), or precise residential addresses.
              </p>
              <p>
                Any personal relationship, dispute, or communication occurring outside the official Vistaraz portal
                is solely the responsibility of the individuals involved.
              </p>
            </section>

            {/* ── 7. Guidance & Information Disclaimer ── */}
            <section id="advice" className="rules-section">
              <div className="rules-section__num-pill">7</div>
              <h2>Guidance &amp; Information Disclaimer</h2>
              <p>
                Information, reflections, self-assessment scores, and conversations provided on Vistaraz are designed
                exclusively for emotional wellness education, comfort, and active listening.
              </p>
              <p>
                <strong>Vistaraz is not a medical provider and does not furnish psychiatric diagnosis or emergency psychiatric intervention.</strong>
              </p>

              <div className="rules-emergency-box">
                <div className="rules-emergency-head">
                  <AlertTriangle size={20} color="#b91c1c" />
                  <strong>Immediate Crisis Protocol</strong>
                </div>
                <p>
                  If you or someone you know is experiencing acute suicidal ideation, self-harm impulses, or a life-threatening
                  medical emergency, please call <strong>14416 (Tele-MANAS)</strong>, <strong>1800-599-0019 (KIRAN)</strong>,
                  or <strong>112 (National Emergency)</strong> immediately. Do not rely on peer chat in critical emergencies.
                </p>
              </div>
            </section>

            {/* ── 8. Limitation of Liability ── */}
            <section id="liability" className="rules-section rules-warning-card">
              <div className="rules-warning-badge">
                <ShieldAlert size={14} /> Crucial Legal Clause
              </div>
              <h2>Limitation of Liability</h2>
              <p className="rules-bold-lead">
                To the fullest extent permitted by applicable law, Vistaraz operates strictly as a technology intermediary
                and assumes ZERO liability for personal disputes, emotional distress, incorrect suggestions, or statements
                made during user interactions.
              </p>
              <p>Specifically, Vistaraz is not liable for:</p>
              <ul className="rules-list">
                <li>Disagreements, misunderstandings, or subjective offense taken during peer listening.</li>
                <li>Decisions or actions taken by a seeker following a guidance discussion.</li>
                <li>Inaccuracies in non-clinical self-check questionnaires or wellbeing trackers.</li>
                <li>Interactions or agreements made between participants outside the verified Vistaraz domain.</li>
                <li>Technical interruptions, server downtime, or third-party telecommunication dropouts.</li>
              </ul>
            </section>

            {/* ── 9. Privacy & Personal Information ── */}
            <section id="privacy" className="rules-section">
              <div className="rules-section__num-pill">9</div>
              <h2>Privacy &amp; Personal Information</h2>
              <p>
                Data collection on Vistaraz is governed by minimal-collection and end-to-end encryption standards.
                We do not sell student data, chat transcripts, or behavioral metrics to marketing brokers.
              </p>
              <p>
                All personal details are processed strictly in accordance with our Privacy Policy and relevant digital
                data protection statutes.
              </p>
            </section>

            {/* ── 10. Intellectual Property ── */}
            <section id="intellectual-property" className="rules-section">
              <div className="rules-section__num-pill">10</div>
              <h2>Intellectual Property</h2>
              <p>
                All brand marks, logos, user interface assets, animations, interactive soundscape audio, and
                software code are the exclusive intellectual property of Vistaraz.
              </p>
              <p>
                Users may not scrape, reverse engineer, replicate, or commercially exploit any platform tools or
                proprietary assessment engines without prior written authorization.
              </p>
            </section>

            {/* ── 11. Prohibited Activities ── */}
            <section id="prohibited" className="rules-section">
              <div className="rules-section__num-pill">11</div>
              <h2>Prohibited Activities</h2>
              <p>Platform security is paramount. The following technical and behavioral acts are strictly banned:</p>
              <ul className="rules-list">
                <li>Deploying spiders, scrapers, automated bot scripts, or denial-of-service stress tests.</li>
                <li>Attempting to bypass role-based authentication or access another user's encrypted vault.</li>
                <li>Uploading malicious payloads, virus vectors, or deceptive phishing links.</li>
                <li>Impersonating university officials or institutional partners.</li>
              </ul>
            </section>

            {/* ── 12. Suspension & Termination ── */}
            <section id="suspension" className="rules-section">
              <div className="rules-section__num-pill">12</div>
              <h2>Suspension &amp; Termination</h2>
              <p>
                Vistaraz reserves the right to suspend or permanently terminate any seeker, listener, or provider account
                without prior warning if there is reasonable cause to believe safety policies have been breached.
              </p>
              <p>
                Provisions regarding intellectual property, indemnification, and liability limitations shall survive
                any termination of access.
              </p>
            </section>

            {/* ── 13. Platform Availability ── */}
            <section id="availability" className="rules-section">
              <div className="rules-section__num-pill">13</div>
              <h2>Platform Availability</h2>
              <p>
                While our systems utilize high-availability server clusters, Vistaraz cannot guarantee continuous,
                uninterrupted uptime. Scheduled maintenance and security upgrades will be conducted with minimal disruption.
              </p>
            </section>

            {/* ── 14. Third-Party Services & Links ── */}
            <section id="third-party" className="rules-section">
              <div className="rules-section__num-pill">14</div>
              <h2>Third-Party Services &amp; Links</h2>
              <p>
                Vistaraz may link to verified national helpline directories, WebRTC media relays, or academic institutional
                portals. Vistaraz is not responsible for the privacy practices or independent content of third-party domains.
              </p>
            </section>

            {/* ── 15. Changes to These Terms ── */}
            <section id="changes" className="rules-section">
              <div className="rules-section__num-pill">15</div>
              <h2>Changes to These Terms</h2>
              <p>
                These Terms may be revised periodically to incorporate new care tools or regulatory standards.
                Material revisions will be prominently signaled with an updated effective date at the top of this document.
              </p>
            </section>

            {/* ── 16. Governing Law & Jurisdiction ── */}
            <section id="law" className="rules-section">
              <div className="rules-section__num-pill">16</div>
              <h2>Governing Law &amp; Jurisdiction</h2>
              <p>
                These Terms shall be interpreted and governed in accordance with the substantive laws applicable to
                Vistaraz's operating jurisdiction, without regard to conflict of law principles.
              </p>
              <p>
                Courts located in New Delhi, India shall have exclusive jurisdiction over any legal proceedings arising
                from platform disputes.
              </p>
            </section>

            {/* ── 17. Contact & Grievance Information ── */}
            <section id="contact" className="rules-section">
              <div className="rules-section__num-pill">17</div>
              <h2>Contact &amp; Grievance Redressal</h2>
              <p>
                For legal notices, compliance queries, privacy rights requests, or community safeguarding reports,
                reach out to our designated Grievance Officer:
              </p>

              <div className="rules-contact-card">
                <div className="rules-contact-row">
                  <Globe size={18} color="var(--vz-primary)" />
                  <div>
                    <span className="label">Official Website:</span>
                    <a href="https://vistaraz.in/" target="_blank" rel="noopener noreferrer">vistaraz.in</a>
                  </div>
                </div>

                <div className="rules-contact-row">
                  <Mail size={18} color="var(--vz-success)" />
                  <div>
                    <span className="label">Support Inquiries:</span>
                    <a href="mailto:support@vistaraz.in">support@vistaraz.in</a>
                  </div>
                </div>

                <div className="rules-contact-row">
                  <ShieldCheck size={18} color="#8b5cf6" />
                  <div>
                    <span className="label">Grievance &amp; Legal Officer:</span>
                    <a href="mailto:mellowpraful@gmail.com">mellowpraful@gmail.com</a>
                  </div>
                </div>
              </div>
            </section>

            {/* Document Footer */}
            <footer className="rules-doc-footer">
              <p>© 2026 Vistaraz Sanctuary Platform. All rights reserved.</p>
              <p className="rules-subtext">
                Designed with care to ensure a secure, respectful, and empowering peer space for every student.
              </p>
            </footer>
          </article>
        </div>
      </div>
    </AppLayout>
  );
}
