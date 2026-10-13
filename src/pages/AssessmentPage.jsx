import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  RotateCcw,
  ShieldAlert,
  Heart,
  Smile,
  Frown,
  Meh,
  Activity,
  Sparkles,
  ClipboardCheck,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import './AssessmentPage.css';

const ASSESSMENT_QUESTIONS = [
  {
    id: 1,
    category: 'Current Mood',
    title: 'How have you been feeling lately?',
    subtitle: 'Choose the option that feels closest to your overall emotional state over the last 2 weeks.',
    options: [
      { label: 'Very Low', emoji: '😔', score: 1, variant: 'pink', desc: 'Frequent sadness or heavy emptiness' },
      { label: 'Low', emoji: '🙁', score: 2, variant: 'peach', desc: 'Down more often than usual' },
      { label: 'Okay', emoji: '😐', score: 3, variant: 'yellow', desc: 'Neutral, getting through the days' },
      { label: 'Good', emoji: '🙂', score: 4, variant: 'mint', desc: 'Generally content and stable' },
      { label: 'Really Good', emoji: '😊', score: 5, variant: 'sky', desc: 'Joyful, optimistic and uplifted' },
    ],
  },
  {
    id: 2,
    category: 'Anxiety & Tension',
    title: 'How often do you experience inner restlessness or anxious thoughts?',
    subtitle: 'Racing heart, spiraling "what-if" thoughts, or physical tension.',
    options: [
      { label: 'Constant Dread', emoji: '😰', score: 1, variant: 'pink', desc: 'Frequent panic or paralyzing worry' },
      { label: 'Frequent Worry', emoji: '😟', score: 2, variant: 'peach', desc: 'Struggling to silence racing mind' },
      { label: 'Occasional Tension', emoji: '😐', score: 3, variant: 'yellow', desc: 'Manages fine on regular days' },
      { label: 'Mostly Calm', emoji: '😌', score: 4, variant: 'mint', desc: 'Handle stressful situations well' },
      { label: 'Deeply Peaceful', emoji: '✨', score: 5, variant: 'sky', desc: 'Grounded, centered and at ease' },
    ],
  },
  {
    id: 3,
    category: 'Sleep Quality',
    title: 'How has your sleep and rest been lately?',
    subtitle: 'Falling asleep, staying asleep, and feeling restored in the morning.',
    options: [
      { label: 'Chronic Insomnia', emoji: '🥱', score: 1, variant: 'pink', desc: 'Severe sleep disruption or night panic' },
      { label: 'Broken Sleep', emoji: '😴', score: 2, variant: 'peach', desc: 'Waking up frequently, feeling exhausted' },
      { label: 'Average Rest', emoji: '🛏️', score: 3, variant: 'yellow', desc: 'Roughly 6 hours, somewhat tired' },
      { label: 'Good Rest', emoji: '🌙', score: 4, variant: 'mint', desc: '7–8 hours of restful, solid sleep' },
      { label: 'Deeply Restorative', emoji: '☀️', score: 5, variant: 'sky', desc: 'Waking up energized and refreshed' },
    ],
  },
  {
    id: 4,
    category: 'Stress & Overwhelm',
    title: 'How manageable does your current daily workload feel?',
    subtitle: 'Academic deadlines, expectations, work tasks, or daily chores.',
    options: [
      { label: 'Crushing Burnout', emoji: '🌋', score: 1, variant: 'pink', desc: 'Completely shut down, unable to cope' },
      { label: 'Heavy Overload', emoji: '🏋️', score: 2, variant: 'peach', desc: 'Juggling too many pressures at once' },
      { label: 'Manageable Stress', emoji: '⚖️', score: 3, variant: 'yellow', desc: 'Pressure exists but getting through' },
      { label: 'In Flow', emoji: '🏄', score: 4, variant: 'mint', desc: 'Good rhythm and steady pace' },
      { label: 'Effortless Balance', emoji: '🧘', score: 5, variant: 'sky', desc: 'Calm control of time and energy' },
    ],
  },
  {
    id: 5,
    category: 'Physical Energy',
    title: 'How would you describe your baseline vitality and energy levels?',
    subtitle: 'Getting out of bed, motivation for physical movement, stamina.',
    options: [
      { label: 'Exhausted & Drained', emoji: '🪫', score: 1, variant: 'pink', desc: 'Physical heaviness and constant fatigue' },
      { label: 'Sluggish', emoji: '🐢', score: 2, variant: 'peach', desc: 'Forcing self through routine tasks' },
      { label: 'Moderate Energy', emoji: '🔋', score: 3, variant: 'yellow', desc: 'Sufficient to get by each day' },
      { label: 'Vibrant & Steady', emoji: '🏃', score: 4, variant: 'mint', desc: 'Healthy stamina throughout the day' },
      { label: 'Peak Vitality', emoji: '⚡', score: 5, variant: 'sky', desc: 'High enthusiasm and physical vigor' },
    ],
  },
  {
    id: 6,
    category: 'Academic & Work Pressure',
    title: 'How are you coping with study, career, or performance expectations?',
    subtitle: 'Fear of failure, comparison with peers, impostor syndrome.',
    options: [
      { label: 'Paralyzing Fear', emoji: '🛑', score: 1, variant: 'pink', desc: 'Debilitating anxiety over performance' },
      { label: 'Heavy Pressure', emoji: '📚', score: 2, variant: 'peach', desc: 'Constantly comparing self with others' },
      { label: 'Coping Okay', emoji: '📝', score: 3, variant: 'yellow', desc: 'Meeting baseline goals steadily' },
      { label: 'Confident & Focused', emoji: '🎯', score: 4, variant: 'mint', desc: 'Learning effectively without panic' },
      { label: 'Inspired Growth', emoji: '🚀', score: 5, variant: 'sky', desc: 'Deeply engaged and motivated' },
    ],
  },
  {
    id: 7,
    category: 'Relationships & Connection',
    title: 'Do you feel supported and heard by the people around you?',
    subtitle: 'Family, friends, peer circles, or romantic partners.',
    options: [
      { label: 'Isolated & Alienated', emoji: '💔', score: 1, variant: 'pink', desc: 'Feeling completely misunderstood and alone' },
      { label: 'Strained / Lonely', emoji: '🚪', score: 2, variant: 'peach', desc: 'Hard to open up, frequent distance' },
      { label: 'Some Support', emoji: '🤝', score: 3, variant: 'yellow', desc: '1 or 2 people I can occasionally reach' },
      { label: 'Warmly Connected', emoji: '🌿', score: 4, variant: 'mint', desc: 'Safe friends who listen and care' },
      { label: 'Deeply Cherished', emoji: '💖', score: 5, variant: 'sky', desc: 'Strong, nourishing circle of trust' },
    ],
  },
  {
    id: 8,
    category: 'Focus & Concentration',
    title: 'How easy is it to stay engaged with tasks without brain fog?',
    subtitle: 'Reading, attending lectures, finishing projects, mental clarity.',
    options: [
      { label: 'Severe Brain Fog', emoji: '🌫️', score: 1, variant: 'pink', desc: 'Cannot retain or complete simple tasks' },
      { label: 'Easily Distracted', emoji: '📱', score: 2, variant: 'peach', desc: 'Mind drifts constantly, forgetful' },
      { label: 'Adequate Focus', emoji: '☕', score: 3, variant: 'yellow', desc: 'Focus comes and goes in waves' },
      { label: 'Clear & Attentive', emoji: '💡', score: 4, variant: 'mint', desc: 'Can concentrate for extended stretches' },
      { label: 'Laser-Sharp Clarity', emoji: '💎', score: 5, variant: 'sky', desc: 'Effortless deep work and retention' },
    ],
  },
  {
    id: 9,
    category: 'Social Comfort',
    title: 'How do you feel about engaging in social situations?',
    subtitle: 'Gatherings, speaking up, new interactions, meeting friends.',
    options: [
      { label: 'Social Dread', emoji: '🙈', score: 1, variant: 'pink', desc: 'Avoiding all interactions out of fear' },
      { label: 'Self-Conscious', emoji: '🤐', score: 2, variant: 'peach', desc: 'Anxious about being judged by others' },
      { label: 'Selective Comfort', emoji: '👥', score: 3, variant: 'yellow', desc: 'Fine in small circles of close peers' },
      { label: 'Socially At Ease', emoji: '🗣️', score: 4, variant: 'mint', desc: 'Enjoyable, friendly interactions' },
      { label: 'Warmly Expressive', emoji: '🌈', score: 5, variant: 'sky', desc: 'Authentic, confident and outgoing' },
    ],
  },
  {
    id: 10,
    category: 'General Emotional State',
    title: 'Overall, how would you rate your baseline emotional resilience?',
    subtitle: 'Your inner foundation, hopefulness, and ability to bounce back.',
    options: [
      { label: 'Critical Distress', emoji: '❤️‍🩹', score: 1, variant: 'pink', desc: 'In urgent need of compassionate care' },
      { label: 'Fragile & Sensitive', emoji: '🌧️', score: 2, variant: 'peach', desc: 'Easily tipped over by small setbacks' },
      { label: 'Generally Steady', emoji: '🌱', score: 3, variant: 'yellow', desc: 'Navigating life day by day' },
      { label: 'Resilient & Hopeful', emoji: '☀️', score: 4, variant: 'mint', desc: 'Optimistic about my journey ahead' },
      { label: 'Flourishing', emoji: '🌻', score: 5, variant: 'sky', desc: 'Full of gratitude, peace and purpose' },
    ],
  },
];

export default function AssessmentPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const question = ASSESSMENT_QUESTIONS[currentStep];
  const progressPercent = Math.round(((currentStep + 1) / ASSESSMENT_QUESTIONS.length) * 100);

  const handleSelectOption = (score) => {
    setAnswers((prev) => ({
      ...prev,
      [question.id]: score,
    }));
  };

  const handleNext = () => {
    if (answers[question.id] === undefined) return;
    if (currentStep < ASSESSMENT_QUESTIONS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleRestart = () => {
    setAnswers({});
    setCurrentStep(0);
    setIsCompleted(false);
  };

  // Score calculation
  const totalScore = Object.values(answers).reduce((acc, val) => acc + val, 0);
  const maxPossible = ASSESSMENT_QUESTIONS.length * 5;
  const percentage = Math.round((totalScore / maxPossible) * 100);

  let resultTier = {
    title: 'Balanced & Nourished',
    color: '#059669',
    bg: '#ecfdf5',
    summary: 'You have a healthy emotional foundation. Keep nurturing your daily self-care rituals and supportive connections.',
    actionRoute: '/community',
    actionLabel: 'Explore Community Circles',
  };

  if (percentage < 45) {
    resultTier = {
      title: 'Tender & In Need of Gentle Care',
      color: '#b91c1c',
      bg: '#fef2f2',
      summary: 'You are carrying significant weight right now. You do not have to walk through this alone. We strongly encourage talking to an empathetic listener or professional.',
      actionRoute: '/chat',
      actionLabel: 'Start Free Peer Chat Now',
    };
  } else if (percentage < 70) {
    resultTier = {
      title: 'Navigating Pressure & Weariness',
      color: '#d97706',
      bg: '#fffbeb',
      summary: 'You are coping, but stress is taking a noticeable toll on your energy. Giving yourself permission to pause and vent will help prevent burnout.',
      actionRoute: '/tools',
      actionLabel: 'Try Somatic Wellbeing Tools',
    };
  }

  return (
    <AppLayout hasSidebar={true}>
      <div className="vz-assessment-container">
        {!isCompleted ? (
          <div className="vz-assessment-wizard">
            {/* Wizard Header */}
            <div className="vz-assessment-wizard__top">
              <div>
                <span className="vz-eyebrow">
                  AREA {question.id} OF {ASSESSMENT_QUESTIONS.length} · {question.category.toUpperCase()}
                </span>
                <h1 className="vz-assessment-wizard__title">{question.title}</h1>
                <p className="vz-assessment-wizard__subtitle">{question.subtitle}</p>
              </div>

              <div className="vz-assessment-wizard__meta">
                <span className="vz-assessment-counter">
                  {currentStep + 1} / {ASSESSMENT_QUESTIONS.length}
                </span>
                <button
                  type="button"
                  className="vz-assessment-exit-btn"
                  onClick={() => navigate('/')}
                  title="Save & return to home"
                >
                  Save & Exit
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="vz-assessment-progress-track">
              <div
                className="vz-assessment-progress-bar"
                style={{ width: `${progressPercent}%` }}
                role="progressbar"
                aria-valuenow={progressPercent}
                aria-valuemin="0"
                aria-valuemax="100"
              />
            </div>

            {/* 5-Card Option Grid matching reference image */}
            <div className="vz-assessment-options-grid">
              {question.options.map((opt) => {
                const isSelected = answers[question.id] === opt.score;
                return (
                  <div
                    key={opt.label}
                    className={`vz-assessment-option-card vz-assessment-option-card--${opt.variant} ${
                      isSelected ? 'vz-assessment-option-card--selected' : ''
                    }`}
                    onClick={() => handleSelectOption(opt.score)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') handleSelectOption(opt.score);
                    }}
                  >
                    <div className="vz-assessment-option-card__emoji">{opt.emoji}</div>
                    <strong className="vz-assessment-option-card__label">{opt.label}</strong>
                    <span className="vz-assessment-option-card__desc">{opt.desc}</span>
                  </div>
                );
              })}
            </div>

            {/* Wizard Navigation Footer */}
            <div className="vz-assessment-wizard__footer">
              <Button
                variant="ghost"
                size="md"
                onClick={handlePrev}
                disabled={currentStep === 0}
                icon={<ArrowLeft size={16} />}
                iconPosition="left"
              >
                Previous
              </Button>

              <div className="vz-assessment-footer-center">
                <span className="vz-text-muted" style={{ fontSize: '0.85rem' }}>
                  🔒 100% Private · Non-diagnostic self-reflection
                </span>
              </div>

              <Button
                variant="primary"
                size="md"
                onClick={handleNext}
                disabled={answers[question.id] === undefined}
                icon={<ArrowRight size={16} />}
              >
                {currentStep === ASSESSMENT_QUESTIONS.length - 1 ? 'View Profile' : 'Next →'}
              </Button>
            </div>
          </div>
        ) : (
          /* Assessment Results Screen */
          <div className="vz-assessment-results">
            <Card variant="default" padding="lg" className="vz-results-card">
              <div className="vz-results-header" style={{ backgroundColor: resultTier.bg }}>
                <div className="vz-results-score-circle" style={{ borderColor: resultTier.color }}>
                  <span className="vz-results-score-number" style={{ color: resultTier.color }}>
                    {percentage}%
                  </span>
                  <span className="vz-results-score-label">Wellbeing Index</span>
                </div>

                <div className="vz-results-tier-info">
                  <span className="vz-chip mint" style={{ backgroundColor: '#ffffff' }}>
                    <ClipboardCheck size={14} /> Reflection Complete
                  </span>
                  <h2 style={{ fontSize: '1.8rem', color: resultTier.color, margin: '8px 0' }}>
                    {resultTier.title}
                  </h2>
                  <p style={{ color: 'var(--vz-text-secondary)', maxWidth: '520px' }}>
                    {resultTier.summary}
                  </p>
                </div>
              </div>

              <div className="vz-results-breakdown">
                <h3 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>10-Area Breakdown</h3>
                <div className="vz-results-area-grid">
                  {ASSESSMENT_QUESTIONS.map((q) => {
                    const ans = answers[q.id] || 3;
                    const opt = q.options.find((o) => o.score === ans);
                    return (
                      <div key={q.id} className="vz-results-area-item">
                        <div className="vz-results-area-item__top">
                          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{q.category}</span>
                          <span className="vz-results-area-tag">{opt?.emoji} {opt?.label}</span>
                        </div>
                        <div className="vz-results-area-meter">
                          <div
                            className="vz-results-area-meter-fill"
                            style={{ width: `${(ans / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Disclaimer */}
              <div className="vz-results-disclaimer">
                <ShieldAlert size={18} color="var(--vz-primary)" />
                <p>
                  <strong>Clinical Notice:</strong> This wellbeing check-in provides self-guided awareness and is not a medical or psychiatric diagnosis. If you are in acute crisis, please visit our <Link to="/safety" className="vz-text-violet">Crisis Safety Support</Link>.
                </p>
              </div>

              {/* Actions */}
              <div className="vz-results-actions">
                <Button to={resultTier.actionRoute} variant="primary" size="lg" icon={<ArrowRight size={18} />}>
                  {resultTier.actionLabel}
                </Button>
                <Button to="/support" variant="outline" size="lg">
                  Browse Support Listeners
                </Button>
                <button
                  type="button"
                  className="vz-btn vz-btn--ghost vz-btn--md"
                  onClick={handleRestart}
                >
                  <RotateCcw size={16} style={{ marginRight: '6px' }} /> Retake Assessment
                </button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
