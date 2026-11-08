import React from 'react';
import { ShieldAlert, CheckCircle2, ArrowLeft } from 'lucide-react';
import Button from './Button';
import './SupportDisclaimerModal.css';

/**
 * SupportDisclaimerModal
 *
 * Mandatory clinical and emergency disclaimer before entering Chat or Video support.
 * Explains:
 * 1. Vistaraz provides wellbeing support and guidance.
 * 2. Listeners are not automatically licensed mental-health professionals.
 * 3. Support interactions do not replace professional mental-health care.
 * 4. Vistaraz is not an emergency service.
 * 5. For emergencies in India, contact 112.
 * 6. Accepting this disclaimer does not mean a listener or video session is available.
 */
export default function SupportDisclaimerModal({
  isOpen,
  mode = 'chat', // 'chat' | 'video'
  onAcknowledge,
  onCancel,
  hasAcknowledged,
  setHasAcknowledged,
}) {
  if (!isOpen) return null;

  const isVideo = mode === 'video';

  return (
    <div
      className="vz-disclaimer-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="disclaimer-title"
    >
      <div className="vz-disclaimer-modal">
        <div className="vz-disclaimer-header">
          <div className="vz-disclaimer-icon-wrap" aria-hidden="true">
            <ShieldAlert size={28} className="vz-disclaimer-icon" />
          </div>
          <div>
            <span className="vz-eyebrow" style={{ color: 'var(--vz-primary)' }}>
              SAFETY &amp; SERVICE NOTICE
            </span>
            <h2 id="disclaimer-title" className="vz-disclaimer-title">
              {isVideo ? 'Video Support Sanctuary Notice' : 'Peer Chat Sanctuary Notice'}
            </h2>
          </div>
        </div>

        <div className="vz-disclaimer-body">
          <div className="vz-disclaimer-box">
            <h3 className="vz-disclaimer-box-title">Important Care Boundaries</h3>
            <ul className="vz-disclaimer-list">
              <li>
                <strong>Wellbeing Support:</strong> Vistaraz provides empathetic, non-clinical wellbeing support, active listening, and guided self-reflection.
              </li>
              <li>
                <strong>Non-Clinical Listeners:</strong> Support listeners are empathetic peers and guided responders; they are <em>not automatically licensed psychologists, psychiatrists, or medical professionals</em>.
              </li>
              <li>
                <strong>Not a Replacement:</strong> Vistaraz does not provide medical diagnoses, psychiatric prescriptions, or clinical therapy and does not replace professional mental-health treatment.
              </li>
              <li>
                <strong>Emergency Ineligibility:</strong> Vistaraz is strictly <em>not</em> an emergency or suicide crisis intervention platform.
              </li>
              <li>
                <strong>Immediate Emergency Helpline:</strong> If you or someone you know is in acute danger or experiencing a life-threatening mental health emergency, call <strong>112 (National Emergency Helpline, India)</strong> or Tele-MANAS at <strong>14416</strong> immediately.
              </li>
              <li>
                <strong>Service Availability:</strong> Acknowledging this notice confirms your understanding of our service limits and <em>does not imply or guarantee</em> that a live listener or active video session is currently connected.
              </li>
            </ul>
          </div>

          <label className="vz-disclaimer-checkbox-label">
            <input
              type="checkbox"
              id="disclaimer-ack-checkbox"
              className="vz-disclaimer-checkbox"
              checked={hasAcknowledged}
              onChange={(e) => setHasAcknowledged(e.target.checked)}
            />
            <span className="vz-disclaimer-checkbox-text">
              I have read, understood, and accept these care boundaries and acknowledge that Vistaraz is a supportive wellbeing sanctuary, not an emergency medical service.
            </span>
          </label>
        </div>

        <div className="vz-disclaimer-actions">
          <Button
            variant="ghost"
            size="md"
            onClick={onCancel}
            icon={<ArrowLeft size={16} />}
            iconPosition="left"
          >
            Go Back
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={onAcknowledge}
            disabled={!hasAcknowledged}
            icon={<CheckCircle2 size={16} />}
          >
            I Acknowledge &amp; Continue
          </Button>
        </div>
      </div>
    </div>
  );
}

