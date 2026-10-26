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
  CreditCard,
  QrCode,
  Building,
  CheckCircle2,
  X,
  ArrowRight,
  ShieldCheck,
  GraduationCap
} from 'lucide-react';
import './PlansPage.css';

const PLANS_DATA = [
  {
    id: 'silver',
    name: 'Silver',
    tagline: 'Start here',
    price: 149,
    desc: 'For basic, text-based emotional support and guided grounding.',
    features: [
      '4 hrs Peer Chat Allowance / month',
      '30 min Voice / Video Call',
      'Full Access to Wellbeing Toolkit',
      'Moderated Community Circles',
    ],
    highlight: false,
  },
  {
    id: 'gold',
    name: 'Gold',
    tagline: 'More room',
    price: 399,
    desc: 'Regular ongoing support plus certified professional check-ins.',
    features: [
      'Unlimited Peer Chat Allowance',
      '2 hrs Voice / Video Sessions',
      '1 Professional Session / month included',
      'Priority Listener Availability',
      'Custom Sleep & Stress Tracking',
    ],
    highlight: true,
  },
  {
    id: 'platinum',
    name: 'Platinum',
    tagline: 'Deeper support',
    price: 799,
    desc: 'Comprehensive clinical therapy and continuous care management.',
    features: [
      'Unlimited Peer Chat & Video Sessions',
      '4 Professional Sessions / month included',
      'Direct Clinical Supervisor Line',
      'Dedicated Listener Match',
      'Institutional Sponsorship Matching',
    ],
    highlight: false,
  },
];

export default function PlansPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentTab, setPaymentTab] = useState('card'); // 'card', 'upi', 'netbanking'
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [showLoginGate, setShowLoginGate] = useState(false);

  // Form states
  const [cardNumber, setCardNumber] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [upiId, setUpiId] = useState('');

  const handleOpenPayment = (plan) => {
    if (!isAuthenticated) {
      setShowLoginGate(true);
      return;
    }
    setSelectedPlan(plan);
    setPaymentSuccess(false);
    setIsProcessing(false);
  };

  const handleProcessPayment = (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
    }, 1200);
  };

  return (
    <AppLayout>
      <div className="vz-plans-container">
        {/* Header */}
        <section className="vz-plans-header">
          <span className="vz-eyebrow">ACCESSIBLE BY DESIGN</span>
          <h1 className="vz-plans-header__title">
            Support should feel <em className="vz-text-violet">possible.</em>
          </h1>
          <p className="vz-plans-header__desc">
            Essential tools and your first conversation remain completely free. Choose a plan when you need more room.
          </p>

          <div className="vz-plans-billing-badge">
            <span>Monthly Subscription · Cancel Anytime</span>
          </div>
        </section>

        {/* 3 Tier Grid */}
        <div className="vz-plans-grid">
          {PLANS_DATA.map((plan) => (
            <Card
              key={plan.id}
              variant="default"
              padding="lg"
              className={`vz-plan-card ${plan.highlight ? 'vz-plan-card--featured' : ''}`}
            >
              {plan.highlight && (
                <div className="vz-plan-card__ribbon">
                  Recommended
                </div>
              )}

              <span className="vz-eyebrow" style={{ color: plan.highlight ? 'var(--vz-primary)' : 'var(--vz-text-muted)' }}>
                {plan.name.toUpperCase()}
              </span>
              <h3 className="vz-plan-card__name">{plan.tagline}</h3>

              <div className="vz-plan-card__price-row">
                <span className="vz-plan-card__price">₹{plan.price}</span>
                <span className="vz-plan-card__period">/ month</span>
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

              <div style={{ marginTop: 'auto', paddingTop: '24px' }}>
                <Button
                  variant={plan.highlight ? 'accent' : 'outline'}
                  size="md"
                  fullWidth
                  onClick={() => handleOpenPayment(plan)}
                >
                  Select {plan.name} Plan
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* University Sponsorship Callout */}
        <div className="vz-plans-university-box">
          <GraduationCap size={24} color="var(--vz-primary)" />
          <p>
            Are you a college student? Check if your university campus provides a{' '}
            <Link to="/register" style={{ color: 'var(--vz-primary)', fontWeight: 600, textDecoration: 'underline' }}>
              free sponsored care membership
            </Link>.
          </p>
        </div>

        {/* Checkout Modal */}
        {selectedPlan && (
          <div className="vz-modal-backdrop" onClick={() => setSelectedPlan(null)}>
            <div className="vz-modal-card vz-checkout-modal" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="vz-modal-close"
                onClick={() => setSelectedPlan(null)}
              >
                <X size={20} />
              </button>

              {!paymentSuccess ? (
                <>
                  <h2 style={{ fontSize: '1.45rem', marginBottom: '4px' }}>Complete Membership</h2>
                  <p style={{ fontSize: '0.88rem', color: 'var(--vz-text-secondary)', marginBottom: '20px' }}>
                    Plan: <strong style={{ color: 'var(--vz-primary)' }}>{selectedPlan.name}</strong> ·{' '}
                    <strong>₹{selectedPlan.price} / month</strong>
                  </p>

                  {/* Payment Tabs */}
                  <div className="vz-checkout-tabs">
                    <button
                      type="button"
                      className={`vz-checkout-tab-btn ${paymentTab === 'card' ? 'active' : ''}`}
                      onClick={() => setPaymentTab('card')}
                    >
                      <CreditCard size={16} /> Card
                    </button>
                    <button
                      type="button"
                      className={`vz-checkout-tab-btn ${paymentTab === 'upi' ? 'active' : ''}`}
                      onClick={() => setPaymentTab('upi')}
                    >
                      <QrCode size={16} /> UPI / QR
                    </button>
                    <button
                      type="button"
                      className={`vz-checkout-tab-btn ${paymentTab === 'netbanking' ? 'active' : ''}`}
                      onClick={() => setPaymentTab('netbanking')}
                    >
                      <Building size={16} /> Net Banking
                    </button>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleProcessPayment}>
                    {paymentTab === 'card' && (
                      <div className="vz-checkout-form">
                        <div className="vz-input-group">
                          <label>Card Number</label>
                          <input
                            type="text"
                            placeholder="4532 •••• •••• 8892"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            required
                          />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <div className="vz-input-group">
                            <label>Expiry Date</label>
                            <input
                              type="text"
                              placeholder="MM/YY"
                              value={cardExp}
                              onChange={(e) => setCardExp(e.target.value)}
                              required
                            />
                          </div>
                          <div className="vz-input-group">
                            <label>CVV</label>
                            <input
                              type="password"
                              placeholder="•••"
                              maxLength={4}
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value)}
                              required
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {paymentTab === 'upi' && (
                      <div className="vz-checkout-form" style={{ textAlign: 'center' }}>
                        <div className="vz-upi-qr-box">
                          <img
                            src="/qr-code.png"
                            alt="Scan UPI QR Code"
                            style={{ width: '130px', height: '130px', margin: '0 auto', display: 'block' }}
                          />
                          <span style={{ fontSize: '0.78rem', color: 'var(--vz-text-muted)', marginTop: '8px', display: 'block' }}>
                            Scan with GPay, PhonePe or Paytm
                          </span>
                        </div>
                        <div className="vz-input-group" style={{ textAlign: 'left', marginTop: '16px' }}>
                          <label>Or enter UPI ID</label>
                          <input
                            type="text"
                            placeholder="yourname@okhdfcbank"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                          />
                        </div>
                      </div>
                    )}

                    {paymentTab === 'netbanking' && (
                      <div className="vz-checkout-form">
                        <div className="vz-input-group">
                          <label>Select Bank</label>
                          <select style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--vz-border-light)' }}>
                            <option>HDFC Bank</option>
                            <option>State Bank of India</option>
                            <option>ICICI Bank</option>
                            <option>Axis Bank</option>
                            <option>Kotak Mahindra Bank</option>
                          </select>
                        </div>
                      </div>
                    )}

                    <div style={{ marginTop: '24px' }}>
                      <Button
                        type="submit"
                        variant="primary"
                        fullWidth
                        size="lg"
                        disabled={isProcessing}
                      >
                        {isProcessing ? 'Verifying with Gateway...' : `Authorize ₹${selectedPlan.price}`}
                      </Button>
                    </div>
                  </form>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#ecfdf5', color: '#059669', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                    <CheckCircle2 size={36} />
                  </div>
                  <h3 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Membership Activated!</h3>
                  <p style={{ color: 'var(--vz-text-secondary)', marginBottom: '24px', fontSize: '0.92rem' }}>
                    Welcome to the {selectedPlan.name} Tier. Your updated allowances and session tokens are now ready in your dashboard.
                  </p>
                  <Button to="/dashboard" variant="primary" fullWidth onClick={() => setSelectedPlan(null)}>
                    Go to Dashboard
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Login Gate Modal */}
      <LoginGate
        isOpen={showLoginGate}
        onClose={() => setShowLoginGate(false)}
        title="Continue Your Journey"
        description="Sign in to choose a care membership and continue your Vistaraz journey."
        badgeText="Care Membership"
      />
    </AppLayout>
  );
}
