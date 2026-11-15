import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoginGate from '../components/common/LoginGate';
import { useAuth } from '../context/AuthContext';
import {
  Check,
  Sparkles,
  ShieldCheck,
  GraduationCap,
  HeartHandshake,
  CheckCircle2,
  X,
  ArrowRight,
  Flame,
  Clock
} from 'lucide-react';
import './PlansPage.css';

const BETA_CORE_FEATURES = [
  'Unlimited Somatic Breathing Exercises (Box, 4-7-8, Vagus Reset)',
  'Full Soundscape Studio (Waterfall, Piano, 432Hz Sanctuary, Pink & Brown Noise)',
  'Self-Paced Worry Shredder & Sensory Grounding 5-4-3-2-1',
  'Evidence-Based Psychological Assessments (Anxiety, Mood, Stress)',
  'Moderated Anonymous Community Circles & Peer Discussion',
  '24/7 Verified Emergency Helpline Direct Access (Tele-MANAS, KIRAN, NIMHANS)',
];

const FUTURE_TIERS = [
  {
    id: 'silver',
    name: 'Silver',
    tagline: 'Trained Peer Connection',
    plannedPrice: '₹149',
    desc: 'For structured, one-on-one text chats with verified peer listeners.',
    features: [
      'Everything in Free Beta Included',
      '4 hrs Scheduled Peer Chat / month',
      'Dedicated Listener Match',
      'Session Notes & Personal Reflection',
    ],
    highlight: false,
  },
  {
    id: 'gold',
    name: 'Gold',
    tagline: 'Comprehensive Care',
    plannedPrice: '₹399',
    desc: 'Regular ongoing peer conversations plus certified clinical check-ins.',
    features: [
      'Everything in Free Beta Included',
      'Unlimited Peer Chat Allowance',
      '1 Certified Clinical Session / month',
      'Priority Availability & Matching',
      'Custom Stress & Sleep Tracking',
    ],
    highlight: true,
  },
  {
    id: 'platinum',
    name: 'Platinum',
    tagline: 'Intensive Clinical Care',
    plannedPrice: '₹799',
    desc: 'Full-spectrum clinical therapy and supervised care management.',
    features: [
      'Everything in Free Beta Included',
      '4 Clinical Psychology Sessions / month',
      'Direct Clinical Supervisor Line',
      'Comprehensive Personalized Care Plan',
      'Campus & Institutional Sponsorships',
    ],
    highlight: false,
  },
];

export default function PlansPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [selectedPlanInfo, setSelectedPlanInfo] = useState(null);
  const [showLoginGate, setShowLoginGate] = useState(false);

  const handleBetaAction = () => {
    if (isAuthenticated) {
      navigate('/tools');
    } else {
      setShowLoginGate(true);
    }
  };

  const handleLearnMore = (plan) => {
    setSelectedPlanInfo(plan);
  };

  return (
    <AppLayout>
      <div className="vz-plans-container">
        {/* Header */}
        <section className="vz-plans-header">
          <div className="vz-plans-beta-pill">
            <Sparkles size={14} /> 100% FREE COMMUNITY BETA
          </div>
          <h1 className="vz-plans-header__title">
            Support should be <em className="vz-text-violet">accessible to everyone.</em>
          </h1>
          <p className="vz-plans-header__desc">
            Mental health care should never be out of reach. During our open beta launch, all Vistaraz somatic tools,
            soundscapes, self-reflection exercises, and community circles are completely free. No payments, no credit cards.
          </p>
        </section>

        {/* Free Community Beta Spotlight Banner */}
        <div className="vz-beta-spotlight-card">
          <div className="vz-beta-spotlight-content">
            <div className="vz-beta-spotlight-tag">
              <ShieldCheck size={16} /> ACTIVE TIER · FREE COMMUNITY ACCESS
            </div>
            <h2 className="vz-beta-spotlight-title">Vistaraz Free Community Beta</h2>
            <p className="vz-beta-spotlight-desc">
              Every young person deserves a gentle, confidential space to regulate emotions, unburden racing thoughts,
              and find grounding. Get full access to our entire evidence-based toolkit right now at zero cost.
            </p>
            <div className="vz-beta-features-grid">
              {BETA_CORE_FEATURES.map((feat) => (
                <div key={feat} className="vz-beta-feature-item">
                  <CheckCircle2 size={18} className="vz-beta-check-icon" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="vz-beta-spotlight-action">
            <div className="vz-beta-price-tag">
              <span className="vz-beta-price">₹0</span>
              <span className="vz-beta-price-sub">/ Always Free in Beta</span>
            </div>
            <p className="vz-beta-no-card-notice">No credit card or payment required.</p>
            <Button
              variant="accent"
              size="lg"
              fullWidth
              icon={<ArrowRight size={18} />}
              onClick={handleBetaAction}
            >
              {isAuthenticated ? 'Open Sanctuary Tools' : 'Get Started Free'}
            </Button>
          </div>
        </div>

        {/* Future Plans Section Header */}
        <div className="vz-future-plans-intro">
          <span className="vz-eyebrow">ROADMAP PREVIEW</span>
          <h2>Planned Subsidized Care Tiers</h2>
          <p>
            As we onboard licensed clinical psychologists and trained peer listeners, optional subsidized memberships
            will be introduced. All self-help tools above will remain permanently free.
          </p>
        </div>

        {/* 3 Tier Grid (Future Preview) */}
        <div className="vz-plans-grid">
          {FUTURE_TIERS.map((plan) => (
            <Card
              key={plan.id}
              variant="default"
              padding="lg"
              className={`vz-plan-card ${plan.highlight ? 'vz-plan-card--featured' : ''}`}
            >
              <div className="vz-plan-card__preview-badge">
                <Clock size={12} style={{ marginRight: '4px' }} />
                Future Tier · Free in Beta
              </div>

              <span
                className="vz-eyebrow"
                style={{
                  color: plan.highlight ? 'var(--vz-primary)' : 'var(--vz-text-muted)',
                  marginTop: '12px'
                }}
              >
                {plan.name.toUpperCase()}
              </span>
              <h3 className="vz-plan-card__name">{plan.tagline}</h3>

              <div className="vz-plan-card__price-row">
                <span className="vz-plan-card__price">{plan.plannedPrice}</span>
                <span className="vz-plan-card__period">/ month (Planned)</span>
              </div>

              <p className="vz-plan-card__desc">{plan.desc}</p>

              <ul className="vz-plan-card__features">
                {plan.features.map((feat) => (
                  <li key={feat}>
                    <Check size={16} color="#059669" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
                <Button
                  variant={plan.highlight ? 'primary' : 'outline'}
                  size="md"
                  fullWidth
                  onClick={() => handleLearnMore(plan)}
                >
                  Included Free in Beta
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* University Sponsorship Callout */}
        <div className="vz-plans-university-box">
          <GraduationCap size={28} color="var(--vz-primary)" />
          <div>
            <strong>Are you a college student or university administrator?</strong>
            <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: '#4338ca' }}>
              Vistaraz collaborates with student welfare cells and campuses to provide free subsidized clinical counseling.
              Reach out to our care team to explore student chapter partnerships.
            </p>
          </div>
        </div>

        {/* Info Modal */}
        {selectedPlanInfo && (
          <div className="vz-modal-backdrop" onClick={() => setSelectedPlanInfo(null)}>
            <div className="vz-modal-card vz-beta-info-modal" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="vz-modal-close"
                onClick={() => setSelectedPlanInfo(null)}
              >
                <X size={20} />
              </button>

              <div style={{ textAlign: 'center', padding: '16px 8px 8px' }}>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    backgroundColor: '#ede9fe',
                    color: 'var(--vz-primary)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px'
                  }}
                >
                  <Sparkles size={28} />
                </div>
                <h3 style={{ fontSize: '1.35rem', marginBottom: '8px' }}>
                  {selectedPlanInfo.name} Tier · Free Access Active
                </h3>
                <p style={{ color: 'var(--vz-text-secondary)', fontSize: '0.92rem', lineHeight: 1.5, marginBottom: '20px' }}>
                  During our open Beta, all community self-regulation tools, audio sanctuaries, and community circles
                  are 100% unlocked for everyone. When one-on-one appointments launch in Phase 2, you will be notified.
                </p>

                <div
                  style={{
                    backgroundColor: 'var(--vz-bg-subtle)',
                    padding: '14px 18px',
                    borderRadius: '12px',
                    textAlign: 'left',
                    marginBottom: '20px',
                    fontSize: '0.88rem',
                    color: 'var(--vz-text-primary)'
                  }}
                >
                  <strong>What you get right now:</strong>
                  <ul style={{ paddingLeft: '20px', margin: '8px 0 0' }}>
                    <li>Breathing Sanctuary (Box breathing, 4-7-8, Vagus nerve reset)</li>
                    <li>Full procedural audio soundscape studio</li>
                    <li>Interactive Worry Shredder & 5-4-3-2-1 Sensory Grounding</li>
                    <li>Self-reflection wellbeing assessments</li>
                  </ul>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <Button
                    variant="primary"
                    fullWidth
                    size="lg"
                    icon={<ArrowRight size={18} />}
                    onClick={() => {
                      setSelectedPlanInfo(null);
                      navigate('/tools');
                    }}
                  >
                    Open Sanctuary Tools
                  </Button>
                  <Button
                    variant="outline"
                    fullWidth
                    size="lg"
                    onClick={() => setSelectedPlanInfo(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Login Gate Modal */}
      <LoginGate
        isOpen={showLoginGate}
        onClose={() => setShowLoginGate(false)}
        title="Join Free Community Beta"
        description="Sign in or create an anonymous account to track your wellbeing progress and join community circles."
        badgeText="Free Community Access"
      />
    </AppLayout>
  );
}
