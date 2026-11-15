import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { Mail, Phone, MapPin, Send, CheckCircle2, ShieldAlert } from 'lucide-react';
import './AboutPages.css';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim() || !message.trim()) return;
    setSent(true);
  };

  return (
    <AppLayout>
      <div className="vz-info-page-container">
        <section className="vz-info-hero">
          <span className="vz-eyebrow">GET IN TOUCH</span>
          <h1 className="vz-info-hero__title">
            We’re here to <em className="vz-text-violet">listen.</em>
          </h1>
          <p className="vz-info-hero__desc">
            Whether you have questions about the platform, feedback on our tools, or want to explore college partnerships,
            our team is ready to connect with you.
          </p>
        </section>

        <div className="vz-contact-grid">
          {/* Contact Details */}
          <div className="vz-contact-info-col">
            <Card variant="default" padding="lg">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '16px' }}>Direct Communication</h3>
              
              <div className="vz-contact-item">
                <Mail size={20} color="var(--vz-primary)" />
                <div>
                  <strong>Email Us</strong>
                  <p style={{ margin: 0 }}>
                    <a href="mailto:vistaraz26@gmail.com" style={{ color: 'var(--vz-primary)', fontWeight: 600 }}>
                      vistaraz26@gmail.com
                    </a>
                  </p>
                </div>
              </div>

              <div className="vz-contact-item" style={{ marginTop: '20px' }}>
                <Phone size={20} color="#059669" />
                <div>
                  <strong>National Crisis Line (24/7)</strong>
                  <p style={{ margin: 0 }}>
                    Tele-MANAS: <a href="tel:14416" style={{ color: '#059669', fontWeight: 700 }}>14416</a>
                  </p>
                </div>
              </div>

              <div className="vz-contact-item" style={{ marginTop: '20px' }}>
                <MapPin size={20} color="#6366f1" />
                <div>
                  <strong>Location</strong>
                  <p style={{ margin: 0, color: 'var(--vz-text-secondary)', fontSize: '0.9rem' }}>
                    New Delhi, India
                  </p>
                </div>
              </div>

              <div style={{ marginTop: '28px', paddingTop: '16px', borderTop: '1px solid var(--vz-border-light)' }}>
                <Link to="/safety" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#e11d48', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}>
                  <ShieldAlert size={16} /> Urgent 24/7 Crisis Helplines →
                </Link>
              </div>
            </Card>
          </div>

          {/* Form */}
          <div className="vz-contact-form-col">
            <Card variant="default" padding="lg">
              {!sent ? (
                <form onSubmit={handleSubmit}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '8px' }}>Send us a message</h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--vz-text-secondary)', marginBottom: '20px' }}>
                    We typically reply within 24 hours.
                  </p>

                  <div className="vz-auth-field" style={{ marginBottom: '14px' }}>
                    <label className="vz-auth-label">Your Name (Optional)</label>
                    <input
                      type="text"
                      className="vz-auth-input"
                      placeholder="e.g. Praful"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="vz-auth-field" style={{ marginBottom: '14px' }}>
                    <label className="vz-auth-label">Your Email *</label>
                    <input
                      type="email"
                      className="vz-auth-input"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="vz-auth-field" style={{ marginBottom: '20px' }}>
                    <label className="vz-auth-label">Your Message *</label>
                    <textarea
                      className="vz-auth-input"
                      rows={4}
                      placeholder="What would you like to ask or share with us?"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      style={{ resize: 'vertical' }}
                    />
                  </div>

                  <Button type="submit" variant="primary" fullWidth size="lg" icon={<Send size={16} />}>
                    Send Message
                  </Button>
                </form>
              ) : (
                <div style={{ textAlign: 'center', padding: '32px 12px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#ecfdf5', color: '#059669', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '8px' }}>Message Received!</h3>
                  <p style={{ color: 'var(--vz-text-secondary)', fontSize: '0.92rem', lineHeight: 1.5, marginBottom: '24px' }}>
                    Thank you for reaching out. We have logged your note and our team will get back to you at <strong>{email}</strong> shortly.
                  </p>
                  <Button variant="outline" onClick={() => setSent(false)}>
                    Send another message
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
