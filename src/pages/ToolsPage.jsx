import React from 'react';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { Sparkles, Wind, Volume2, Trash2, Compass, Activity, BookOpen, AlertCircle } from 'lucide-react';

/**
 * ToolsPage
 * Assigned to: Developer 1
 * Source: tools.html
 * Route: /tools
 */
export default function ToolsPage() {
  const tools = [
    { title: 'Box Breathing Studio', icon: Wind, desc: '4-4-4-4 guided rhythmic breathing to calm racing thoughts.', tag: 'Calm' },
    { title: 'Ambient Soundscape Synth', icon: Volume2, desc: 'Procedural white noise, rain, and lo-fi audio textures.', tag: 'Focus' },
    { title: 'Worry Shredder', icon: Trash2, desc: 'Type out distressing thoughts and watch them dissolve safely.', tag: 'Release' },
    { title: '5-4-3-2-1 Grounding Wizard', icon: Compass, desc: 'Sensory awareness exercise to bring you back to the present.', tag: 'Grounding' },
    { title: 'Full Body Scan', icon: Activity, desc: 'Progressive muscle relaxation and tension mapping.', tag: 'Relaxation' },
    { title: 'Sanctuary Journal', icon: BookOpen, desc: 'Encrypted, local-first reflection prompts and gratitude logs.', tag: 'Clarity' },
  ];

  return (
    <AppLayout hasSidebar={true}>
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '32px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <span className="vz-eyebrow">SANCTUARY TOOLKIT</span>
            <h1>Interactive Wellbeing Tools</h1>
            <p>Immediate, self-guided relief exercises designed for overthinking and stress.</p>
          </div>
          <span className="vz-chip lavender">
            <Sparkles size={14} /> Developer 1 Assignment
          </span>
        </div>

        {/* Tools Grid Preview */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          {tools.map((t) => {
            const Icon = t.icon;
            return (
              <Card key={t.title} variant="default" padding="md" hoverable={true}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: 'var(--vz-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--vz-primary)' }}>
                    <Icon size={22} />
                  </div>
                  <span className="vz-chip sky">{t.tag}</span>
                </div>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '8px' }}>{t.title}</h3>
                <p style={{ fontSize: '0.88rem', marginBottom: '20px' }}>{t.desc}</p>
                <Button variant="outline" size="sm" fullWidth>
                  Open Exercise →
                </Button>
              </Card>
            );
          })}
        </div>

        {/* Developer Migration Notes */}
        <Card variant="default" padding="md">
          <p style={{ fontSize: '0.9rem', color: 'var(--vz-text-secondary)' }}>
            <strong>Developer 1 Notice:</strong> Migrated from <code>tools.html</code> & <code>assets/js/tools.js</code>. Contains interactive Web Audio synth, SVG breathing animations, interactive canvas / shredder effects, and local storage reflection store.
          </p>
        </Card>
      </div>
    </AppLayout>
  );
}
