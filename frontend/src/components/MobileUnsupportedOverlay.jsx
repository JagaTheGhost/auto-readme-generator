import React, { useState, useEffect } from 'react';
import './MobileUnsupportedOverlay.css';

const FUN_NOTES = [
  {
    id: 1,
    icon: 'keyboard',
    tag: 'Ergonomics Fact',
    color: '#4edea3',
    title: 'Tactile Keyboard Power',
    text: 'Did you know? 94% of legendary GitHub READMEs are crafted on tactile desktop mechanical keyboards with custom macros.',
    metric: 'Latency: 0.2ms'
  },
  {
    id: 2,
    icon: 'splitscreen',
    tag: 'Screen Real Estate',
    color: '#7bd0ff',
    title: 'Multi-Pane Engineering',
    text: 'Split-screen Markdown diffing, AST syntax trees, and live SVG architecture diagrams need serious room to breathe!',
    metric: 'Optimal: ≥1280px'
  },
  {
    id: 3,
    icon: 'coffee',
    tag: 'Developer Flow',
    color: '#f59e0b',
    title: 'Desk Setup Energy',
    text: 'Grab a fresh coffee, jump onto your laptop or desktop rig, and build beautiful, comprehensive documentation in under 60 seconds.',
    metric: 'Deep Work Mode'
  },
  {
    id: 4,
    icon: 'rocket_launch',
    tag: 'Quick Move',
    color: '#c0c1ff',
    title: 'Fast Handoff',
    text: 'Email or bookmark this link to yourself right now to fire up the studio the moment you are back at your workstation.',
    metric: 'Instant Sync'
  }
];

const MobileUnsupportedOverlay = ({ onBypass }) => {
  const [activeNoteIndex, setActiveNoteIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showDesktopGuide, setShowDesktopGuide] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-rotate fun facts every 5 seconds unless paused
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveNoteIndex((prev) => (prev + 1) % FUN_NOTES.length);
    }, 4800);
    return () => clearInterval(interval);
  }, [isPaused]);

  const handleCopyLink = () => {
    const url = window.location.href;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }).catch(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const currentNote = FUN_NOTES[activeNoteIndex];

  return (
    <div className="mobile-overlay-wrapper">
      {/* Background ambient glow orbs */}
      <div className="mobile-glow-orb mobile-glow-orb-top" />
      <div className="mobile-glow-orb mobile-glow-orb-bottom" />

      <div className="mobile-overlay-scroll-container">
        {/* Top Header Bar */}
        <header className="mobile-overlay-header">
          <div className="mobile-header-brand">
            <div className="mobile-brand-icon-box">
              <span className="material-symbols-outlined">auto_awesome</span>
            </div>
            <div className="mobile-brand-text">
              <span className="mobile-brand-name">README Studio</span>
              <span className="mobile-brand-badge">v1.0</span>
            </div>
          </div>

          <div className="mobile-status-pill">
            <span className="mobile-pulse-dot" />
            <span className="mobile-status-text">Desktop Studio</span>
          </div>
        </header>

        {/* Hero Workstation Mockup (No 3 traffic light dots) */}
        <div className="mobile-hero-section">
          <div className="mobile-mockup-laptop">
            <div className="mobile-laptop-glow" />
            <div className="mobile-laptop-frame">
              {/* Screen Top Bar */}
              <div className="mobile-screen-bar">
                <span className="mobile-screen-title">
                  <span className="material-symbols-outlined screen-icon">terminal</span>
                  README.md — Split Editor
                </span>
                <span className="mobile-screen-sync">LIVE AST</span>
              </div>

              {/* Screen Body */}
              <div className="mobile-screen-body">
                <div className="mobile-screen-pane left-pane">
                  <span className="code-line hl-cyan"># Architecture</span>
                  <span className="code-line hl-muted">```mermaid</span>
                  <span className="code-line hl-green">graph TD</span>
                  <span className="code-line hl-muted pl">Client → API</span>
                  <span className="code-line hl-indigo">! [CI-Pass]</span>
                </div>
                <div className="mobile-screen-pane right-pane">
                  <div className="mock-preview-header">
                    <span className="mock-preview-tag">PREVIEW</span>
                    <span className="mock-preview-pill">SYNCED</span>
                  </div>
                  <div className="mock-diagram-box">
                    <span className="mock-box-cli">CLI</span>
                    <span className="mock-arrow">→</span>
                    <span className="mock-box-ast">AST</span>
                  </div>
                  <div className="mock-badges-row">
                    <span className="mock-badge">MIT</span>
                    <span className="mock-badge badge-blue">v1.0</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Laptop Base Hinge */}
            <div className="mobile-laptop-base">
              <div className="mobile-laptop-notch" />
            </div>
          </div>
        </div>

        {/* Main Pitch & Warm Sentiment */}
        <section className="mobile-pitch-section">
          <div className="mobile-pill-tag">
            <span className="material-symbols-outlined tag-icon">desktop_mac</span>
            <span>Crafted for Big Screens</span>
          </div>
          <h1 className="mobile-pitch-title">
            Built for Big Screens &amp; High Productivity <span className="pitch-bolt">⚡️</span>
          </h1>
          <p className="mobile-pitch-description">
            README Studio is a multi-pane developer environment designed for wide code diffs,
            live Mermaid architecture diagrams, and real-time badge authoring.
          </p>
        </section>

        {/* Secret Hack / Pro Tip Card */}
        <section className="mobile-tip-card">
          <div className="mobile-tip-icon-box">
            <span className="material-symbols-outlined">lightbulb</span>
          </div>
          <div className="mobile-tip-body">
            <div className="mobile-tip-header">
              <span className="mobile-tip-title">PRO TIP / SECRET HACK</span>
              <span className="mobile-tip-sparkle">✨</span>
            </div>
            <p className="mobile-tip-text">
              Want to sneak in right now? Request <strong>"Desktop Site"</strong> in your mobile
              browser menu to unlock the full editor interface immediately!
            </p>
            <button
              type="button"
              className="mobile-tip-expand-btn"
              onClick={() => setShowDesktopGuide(!showDesktopGuide)}
            >
              <span>{showDesktopGuide ? 'Hide instructions' : 'How do I do this?'}</span>
              <span className="material-symbols-outlined expand-chevron">
                {showDesktopGuide ? 'expand_less' : 'expand_more'}
              </span>
            </button>

            {showDesktopGuide && (
              <div className="mobile-guide-steps">
                <div className="guide-step">
                  <span className="step-num">1</span>
                  <div className="step-text">
                    <strong>Chrome / Android:</strong> Tap the <code>⋮</code> menu in the top right, then check <strong>"Desktop site"</strong>.
                  </div>
                </div>
                <div className="guide-step">
                  <span className="step-num">2</span>
                  <div className="step-text">
                    <strong>Safari / iOS:</strong> Tap the <code>aA</code> icon on the address bar, then select <strong>"Request Desktop Website"</strong>.
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Interactive Rotating Dev Notes & Fun Facts */}
        <section
          className="mobile-carousel-section"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          <div className="carousel-header">
            <span className="carousel-label">DEV NOTES &amp; FUN FACTS</span>
            <div className="carousel-nav">
              <button
                type="button"
                className="carousel-btn"
                title="Previous note"
                onClick={() => setActiveNoteIndex((prev) => (prev - 1 + FUN_NOTES.length) % FUN_NOTES.length)}
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button
                type="button"
                className="carousel-btn"
                title="Next note"
                onClick={() => setActiveNoteIndex((prev) => (prev + 1) % FUN_NOTES.length)}
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>

          <div className="carousel-card-wrapper">
            <div className="carousel-card" style={{ borderColor: `${currentNote.color}40` }}>
              <div className="card-top-row">
                <div className="card-tag-group" style={{ color: currentNote.color }}>
                  <span className="material-symbols-outlined card-icon">{currentNote.icon}</span>
                  <span className="card-tag-name">{currentNote.tag}</span>
                </div>
                <span className="card-counter">{activeNoteIndex + 1}/{FUN_NOTES.length}</span>
              </div>
              <h3 className="card-title">{currentNote.title}</h3>
              <p className="card-body-text">{currentNote.text}</p>
              <div className="card-footer-row">
                <span className="card-metric">{currentNote.metric}</span>
                <span className="card-pulse" style={{ background: currentNote.color }} />
              </div>
            </div>
          </div>

          {/* Dot Indicators */}
          <div className="carousel-dots">
            {FUN_NOTES.map((note, idx) => (
              <button
                key={note.id}
                type="button"
                className={`carousel-dot ${idx === activeNoteIndex ? 'active' : ''}`}
                onClick={() => setActiveNoteIndex(idx)}
                aria-label={`Go to fact ${idx + 1}`}
              />
            ))}
          </div>
        </section>

        {/* Action Buttons Section */}
        <section className="mobile-action-section">
          {/* Primary CTA: Copy Studio Link */}
          <button
            type="button"
            className="mobile-btn-primary"
            onClick={handleCopyLink}
          >
            <span className="material-symbols-outlined">
              {copied ? 'check' : 'content_copy'}
            </span>
            <span>{copied ? 'Studio Link Copied!' : 'Copy Studio Link'}</span>
          </button>

          {/* Secondary Action Row */}
          <div className="mobile-btn-row">
            <a
              href="mailto:?subject=README%20Studio%20Desktop%20Link&body=Here%20is%20the%20link%20to%20open%20README%20Studio%20on%20your%20PC%20or%20laptop:%20https://github.com/JagaTheGhost/auto-readme-generator"
              className="mobile-btn-secondary"
            >
              <span className="material-symbols-outlined">mail</span>
              <span>Send to Email</span>
            </a>
            <a
              href="https://github.com/JagaTheGhost/auto-readme-generator"
              target="_blank"
              rel="noopener noreferrer"
              className="mobile-btn-secondary"
            >
              <span className="material-symbols-outlined gh-star">star</span>
              <span>GitHub Repo</span>
            </a>
          </div>

          {onBypass && (
            <button
              type="button"
              className="mobile-btn-ghost"
              onClick={onBypass}
            >
              <span>Continue in Mobile Preview (Experimental)</span>
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          )}
        </section>

        {/* Bottom Terminal Status Bar */}
        <footer className="mobile-terminal-footer">
          <div className="footer-status">
            <span className="footer-status-dot" />
            <span>Ready on macOS, Windows &amp; Linux</span>
          </div>
          <span className="footer-domain">readme-studio.dev</span>
        </footer>
      </div>

      {/* Copy Toast feedback */}
      {copied && (
        <div className="mobile-copy-toast">
          <span className="material-symbols-outlined toast-check">check_circle</span>
          <span>Link copied to clipboard! Open on your PC or Mac.</span>
        </div>
      )}
    </div>
  );
};

export default MobileUnsupportedOverlay;
