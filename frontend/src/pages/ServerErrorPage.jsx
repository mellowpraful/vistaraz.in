import React, { useState, useEffect } from 'react';
import AppLayout from '../components/layout/AppLayout';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { RefreshCw, Home, Wifi, WifiOff, Phone } from 'lucide-react';
import './ServerErrorPage.css';

/**
 * ServerErrorPage
 * Assigned to: Developer 2
 * Source: 500.html
 * Route: /error-500
 *
 * Resilient server error sanctuary page with connectivity monitoring.
 */
export default function ServerErrorPage() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  function handleRetry() {
    setRetrying(true);
    setTimeout(() => {
      window.location.reload();
    }, 700);
  }

  return (
    <AppLayout>
      <div className="err500-page">
        {/* Icon */}
        <div className="err500-icon-wrap" aria-hidden="true">
          <span className="err500-icon">🌿</span>
        </div>

        {/* Eyebrow */}
        <span className="err500-eyebrow">TEMPORARY PAUSE · 500 SERVER REST</span>

        {/* Title */}
        <h1 className="err500-title">
          Taking a brief <br />
          <em className="err500-em">mindful breath.</em>
        </h1>

        {/* Description */}
        <p className="err500-desc">
          Our sanctuary servers encountered a momentary ripple while processing your request.
          Your account and personal data remain completely safe and protected.
        </p>

        {/* Connection Status */}
        <div className={`err500-status ${isOnline ? 'err500-status--online' : 'err500-status--offline'}`}>
          {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
          <span>
            {isOnline
              ? 'Internet connected · System stands ready'
              : 'Device is offline · Check connection'}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="err500-actions">
          <Button
            variant="primary"
            onClick={handleRetry}
            disabled={retrying}
            icon={<RefreshCw size={16} className={retrying ? 'err500-spin' : ''} />}
            iconPosition="left"
          >
            {retrying ? 'Reconnecting...' : 'Reconnect & Retry'}
          </Button>
          <Button to="/" variant="ghost" icon={<Home size={16} />} iconPosition="left">
            Home
          </Button>
        </div>

        {/* Crisis Safety Bar */}
        <Card variant="pink" padding="md" className="err500-crisis-bar">
          <div className="err500-crisis-content">
            <div className="err500-crisis-left">
              <Phone size={20} className="err500-crisis-icon" />
              <span className="err500-crisis-text">
                If you are experiencing an urgent crisis, help is available 24/7.
              </span>
            </div>
            <Button to="/safety" variant="primary" size="sm" className="err500-crisis-btn">
              Crisis Helplines
            </Button>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
