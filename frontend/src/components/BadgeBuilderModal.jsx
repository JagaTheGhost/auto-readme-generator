import React, { useState, useMemo } from 'react'

const BADGE_CATEGORIES = [
  { id: 'github', label: 'GitHub Metrics', icon: 'monitoring' },
  { id: 'tech', label: 'Tech Stack', icon: 'code' },
  { id: 'license', label: 'Licenses', icon: 'verified' },
  { id: 'social', label: 'Community & Social', icon: 'group' }
]

const COLOR_SWATCHES = [
  { name: 'Electric Indigo', hex: '6366f1' },
  { name: 'Bright Emerald', hex: '10b981' },
  { name: 'Amber Gold', hex: 'f59e0b' },
  { name: 'Rose Red', hex: 'ef4444' },
  { name: 'Cyber Cyan', hex: '06b6d4' },
  { name: 'Deep Slate', hex: '1e293b' },
  { name: 'Bright Blue', hex: '3b82f6' },
  { name: 'Purple Neon', hex: 'a855f7' }
]

const BADGE_STYLES = [
  { id: 'for-the-badge', label: 'For the Badge' },
  { id: 'flat-square', label: 'Flat Square' },
  { id: 'flat', label: 'Flat' },
  { id: 'plastic', label: 'Plastic' },
  { id: 'social', label: 'Social' }
]

const POPULAR_PRESETS = [
  {
    title: 'Version 1.0.0',
    label: 'version',
    message: '1.0.0',
    color: '6366f1',
    style: 'for-the-badge',
    logo: ''
  },
  {
    title: 'License MIT',
    label: 'license',
    message: 'MIT',
    color: '10b981',
    style: 'for-the-badge',
    logo: ''
  },
  {
    title: 'Build Passing',
    label: 'build',
    message: 'passing',
    color: '10b981',
    style: 'flat-square',
    logo: 'github'
  },
  {
    title: 'TypeScript 5.8',
    label: 'code',
    message: 'TypeScript 5.8',
    color: '3178c6',
    style: 'flat-square',
    logo: 'typescript'
  },
  {
    title: 'Docker Ready',
    label: 'docker',
    message: 'ready',
    color: '2496ed',
    style: 'flat-square',
    logo: 'docker'
  },
  {
    title: 'Discord Community',
    label: 'discord',
    message: 'chat',
    color: '5865f2',
    style: 'for-the-badge',
    logo: 'discord'
  }
]

export default function BadgeBuilderModal({
  isOpen,
  onClose,
  onInsertBadge,
  repoUrl = ''
}) {
  const [activeCategory, setActiveCategory] = useState('github')
  const [label, setLabel] = useState('version')
  const [message, setMessage] = useState('1.0.0')
  const [color, setColor] = useState('6366f1')
  const [style, setStyle] = useState('for-the-badge')
  const [logo, setLogo] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [searchFilter, setSearchFilter] = useState('')

  // Compute clean owner/repo if available
  const cleanRepo = useMemo(() => {
    if (!repoUrl) return 'owner/repo'
    return repoUrl.replace(/^https?:\/\/github\.com\//, '').replace(/\/$/, '')
  }, [repoUrl])

  // Construct Shields.io URL
  const badgeImageUrl = useMemo(() => {
    const encodedLabel = encodeURIComponent(label.trim())
    const encodedMessage = encodeURIComponent(message.trim())
    let url = `https://img.shields.io/badge/${encodedLabel}-${encodedMessage}-${color}?style=${style}`
    if (logo) {
      url += `&logo=${encodeURIComponent(logo)}&logoColor=white`
    }
    return url
  }, [label, message, color, style, logo])

  // Construct Markdown snippet
  const markdownSnippet = useMemo(() => {
    const altText = `${label} ${message}`.trim()
    const targetLink = linkUrl.trim() || (repoUrl || '#')
    return `[![${altText}](${badgeImageUrl})](${targetLink})`
  }, [label, message, badgeImageUrl, linkUrl, repoUrl])

  const handleApplyPreset = (preset) => {
    setLabel(preset.label)
    setMessage(preset.message)
    setColor(preset.color)
    setStyle(preset.style)
    setLogo(preset.logo)
  }

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(markdownSnippet)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleInsert = () => {
    onInsertBadge(markdownSnippet)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="badge-modal-backdrop" onClick={onClose}>
      <div className="badge-modal-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="badge-modal-header">
          <div className="badge-modal-title-group">
            <span className="material-symbols-outlined text-primary">shield</span>
            <div>
              <h2 className="badge-modal-title">Shields.io Dynamic Badge Generator</h2>
              <p className="badge-modal-subtitle">Generate production badges with real-time preview and one-click editor insert</p>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            title="Close dialog (Esc)"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Category Tabs */}
        <div className="badge-category-strip">
          {BADGE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`badge-cat-tab ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              <span className="material-symbols-outlined icon-xs">{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Modal Body: Split 2 Columns */}
        <div className="badge-modal-body">
          {/* Left Column: Form Controls */}
          <div className="badge-form-column custom-scrollbar">
            {/* Quick Templates based on Active Category */}
            <div className="badge-form-section">
              <label className="badge-section-label">Category Quick Presets</label>
              <div className="badge-chips-grid">
                {activeCategory === 'github' && (
                  <>
                    <button
                      type="button"
                      className="preset-chip"
                      onClick={() => {
                        setLabel('stars')
                        setMessage('1.2k')
                        setColor('3b82f6')
                        setLogo('github')
                      }}
                    >
                      ⭐ Stars
                    </button>
                    <button
                      type="button"
                      className="preset-chip"
                      onClick={() => {
                        setLabel('forks')
                        setMessage('340')
                        setColor('6366f1')
                        setLogo('github')
                      }}
                    >
                      🍴 Forks
                    </button>
                    <button
                      type="button"
                      className="preset-chip"
                      onClick={() => {
                        setLabel('build')
                        setMessage('passing')
                        setColor('10b981')
                        setLogo('github-actions')
                      }}
                    >
                      🚀 CI / Build
                    </button>
                    <button
                      type="button"
                      className="preset-chip"
                      onClick={() => {
                        setLabel('PRs')
                        setMessage('welcome')
                        setColor('10b981')
                        setLogo('')
                      }}
                    >
                      🤝 PRs Welcome
                    </button>
                  </>
                )}

                {activeCategory === 'tech' && (
                  <>
                    <button
                      type="button"
                      className="preset-chip"
                      onClick={() => {
                        setLabel('React')
                        setMessage('18.3')
                        setColor('61dafb')
                        setLogo('react')
                      }}
                    >
                      ⚛️ React
                    </button>
                    <button
                      type="button"
                      className="preset-chip"
                      onClick={() => {
                        setLabel('FastAPI')
                        setMessage('0.110')
                        setColor('009688')
                        setLogo('fastapi')
                      }}
                    >
                      ⚡ FastAPI
                    </button>
                    <button
                      type="button"
                      className="preset-chip"
                      onClick={() => {
                        setLabel('Python')
                        setMessage('3.12+')
                        setColor('3776ab')
                        setLogo('python')
                      }}
                    >
                      🐍 Python
                    </button>
                    <button
                      type="button"
                      className="preset-chip"
                      onClick={() => {
                        setLabel('Docker')
                        setMessage('ready')
                        setColor('2496ed')
                        setLogo('docker')
                      }}
                    >
                      🐳 Docker
                    </button>
                  </>
                )}

                {activeCategory === 'license' && (
                  <>
                    <button
                      type="button"
                      className="preset-chip"
                      onClick={() => {
                        setLabel('License')
                        setMessage('MIT')
                        setColor('10b981')
                        setLogo('')
                      }}
                    >
                      📜 MIT
                    </button>
                    <button
                      type="button"
                      className="preset-chip"
                      onClick={() => {
                        setLabel('License')
                        setMessage('Apache 2.0')
                        setColor('f59e0b')
                        setLogo('')
                      }}
                    >
                      📜 Apache 2.0
                    </button>
                    <button
                      type="button"
                      className="preset-chip"
                      onClick={() => {
                        setLabel('License')
                        setMessage('GPL v3')
                        setColor('3b82f6')
                        setLogo('')
                      }}
                    >
                      📜 GPL-3.0
                    </button>
                  </>
                )}

                {activeCategory === 'social' && (
                  <>
                    <button
                      type="button"
                      className="preset-chip"
                      onClick={() => {
                        setLabel('discord')
                        setMessage('join chat')
                        setColor('5865f2')
                        setLogo('discord')
                      }}
                    >
                      💬 Discord
                    </button>
                    <button
                      type="button"
                      className="preset-chip"
                      onClick={() => {
                        setLabel('twitter')
                        setMessage('follow')
                        setColor('1da1f2')
                        setLogo('twitter')
                      }}
                    >
                      🐦 Twitter/X
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Label & Message Inputs */}
            <div className="badge-form-section">
              <div className="badge-inputs-row">
                <div className="badge-field">
                  <label className="badge-field-label">Badge Label</label>
                  <input
                    type="text"
                    className="badge-text-input"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="e.g. version, build, license"
                  />
                </div>
                <div className="badge-field">
                  <label className="badge-field-label">Badge Message</label>
                  <input
                    type="text"
                    className="badge-text-input"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="e.g. 1.0.0, passing, MIT"
                  />
                </div>
              </div>
            </div>

            {/* Visual Style Selector */}
            <div className="badge-form-section">
              <label className="badge-section-label">Display Style</label>
              <div className="badge-styles-grid">
                {BADGE_STYLES.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    className={`badge-style-pill ${style === st.id ? 'active' : ''}`}
                    onClick={() => setStyle(st.id)}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Swatch Picker */}
            <div className="badge-form-section">
              <label className="badge-section-label">Color Theme</label>
              <div className="color-swatches-grid">
                {COLOR_SWATCHES.map((swatch) => (
                  <button
                    key={swatch.hex}
                    type="button"
                    className={`color-swatch-circle ${color.toLowerCase() === swatch.hex.toLowerCase() ? 'active' : ''}`}
                    style={{ backgroundColor: `#${swatch.hex}` }}
                    onClick={() => setColor(swatch.hex)}
                    title={swatch.name}
                  />
                ))}
              </div>
              <div className="color-hex-row">
                <span className="hex-prefix">#</span>
                <input
                  type="text"
                  className="badge-hex-input"
                  value={color}
                  onChange={(e) => setColor(e.target.value.replace('#', ''))}
                  placeholder="HEX code (e.g. 6366f1)"
                  maxLength={6}
                />
              </div>
            </div>

            {/* Brand Logo & Destination Link */}
            <div className="badge-form-section">
              <div className="badge-inputs-row">
                <div className="badge-field">
                  <label className="badge-field-label">Logo Icon (Optional)</label>
                  <input
                    type="text"
                    className="badge-text-input"
                    value={logo}
                    onChange={(e) => setLogo(e.target.value)}
                    placeholder="e.g. github, react, docker, python"
                  />
                </div>
                <div className="badge-field">
                  <label className="badge-field-label">Click Target URL</label>
                  <input
                    type="text"
                    className="badge-text-input"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder={repoUrl || 'https://...'}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Render & Output */}
          <div className="badge-preview-column">
            {/* Live Canvas Box */}
            <div className="badge-live-canvas-card">
              <div className="canvas-header">
                <span className="canvas-title">Live Render Preview</span>
                <span className="canvas-style-tag">{style}</span>
              </div>
              <div className="canvas-render-area">
                <img
                  src={badgeImageUrl}
                  alt={`${label} ${message}`}
                  className="badge-render-img"
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                  onLoad={(e) => {
                    e.target.style.display = 'inline-block'
                  }}
                />
              </div>
            </div>

            {/* Generated Markdown Syntax Box */}
            <div className="badge-code-card">
              <div className="badge-code-header">
                <span>Markdown Syntax</span>
                <button
                  type="button"
                  className="badge-copy-mini-btn"
                  onClick={handleCopyMarkdown}
                >
                  <span className="material-symbols-outlined icon-xs">
                    {copied ? 'check' : 'content_copy'}
                  </span>
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="badge-code-readout"><code>{markdownSnippet}</code></pre>
            </div>

            {/* Popular Presets Rack */}
            <div className="preset-rack-container">
              <span className="preset-rack-title">Popular Presets</span>
              <div className="preset-rack-grid">
                {POPULAR_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="preset-rack-btn"
                    onClick={() => handleApplyPreset(preset)}
                  >
                    <span>{preset.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="badge-actions-tray">
              <button
                type="button"
                className="btn-badge-insert"
                onClick={handleInsert}
              >
                <span className="material-symbols-outlined">add_circle</span>
                <span>Insert at Cursor</span>
              </button>
              <button
                type="button"
                className="btn-badge-secondary"
                onClick={handleCopyMarkdown}
              >
                <span className="material-symbols-outlined">content_copy</span>
                <span>Copy Markdown</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
