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
    title: 'FastAPI Backend',
    label: 'backend',
    message: 'FastAPI',
    color: '009688',
    style: 'for-the-badge',
    logo: 'fastapi'
  },
  {
    title: 'React 19',
    label: 'frontend',
    message: 'React 19',
    color: '61dafb',
    style: 'for-the-badge',
    logo: 'react'
  },
  {
    title: 'Docker Container',
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

export default function BadgeStudioTab({
  onInsertBadge,
  repoUrl = '',
  onBackToReadme
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

  const cleanRepo = useMemo(() => {
    if (!repoUrl) return 'owner/repo'
    return repoUrl.replace(/^https?:\/\/github\.com\//, '').replace(/\/$/, '')
  }, [repoUrl])

  const categoryPresets = useMemo(() => {
    switch (activeCategory) {
      case 'github':
        return [
          { label: 'stars', message: 'GitHub Stars', color: 'f59e0b', style: 'social', link: `https://github.com/${cleanRepo}/stargazers`, logo: 'github' },
          { label: 'forks', message: 'GitHub Forks', color: '3b82f6', style: 'social', link: `https://github.com/${cleanRepo}/network/members`, logo: 'github' },
          { label: 'issues', message: 'Open Issues', color: '10b981', style: 'flat-square', link: `https://github.com/${cleanRepo}/issues`, logo: 'github' },
          { label: 'PRs', message: 'welcome', color: '10b981', style: 'flat-square', link: `https://github.com/${cleanRepo}/pulls`, logo: 'git' },
          { label: 'contributors', message: 'Contributors', color: '06b6d4', style: 'flat-square', link: `https://github.com/${cleanRepo}/graphs/contributors`, logo: 'github' },
          { label: 'release', message: 'v1.0.0', color: '6366f1', style: 'for-the-badge', link: `https://github.com/${cleanRepo}/releases`, logo: 'github' }
        ]
      case 'tech':
        return [
          { label: 'python', message: '3.11+', color: '3776ab', style: 'flat-square', logo: 'python' },
          { label: 'node', message: '>=18.0', color: '339933', style: 'flat-square', logo: 'nodedotjs' },
          { label: 'fastapi', message: 'v0.115', color: '009688', style: 'for-the-badge', logo: 'fastapi' },
          { label: 'react', message: '19.0', color: '61dafb', style: 'for-the-badge', logo: 'react' },
          { label: 'tailwind', message: 'v4.0', color: '06b6d4', style: 'flat-square', logo: 'tailwindcss' },
          { label: 'docker', message: 'compose', color: '2496ed', style: 'flat-square', logo: 'docker' },
          { label: 'postgresql', message: '16.0', color: '4169e1', style: 'for-the-badge', logo: 'postgresql' },
          { label: 'redis', message: 'cache', color: 'dc382d', style: 'flat-square', logo: 'redis' }
        ]
      case 'license':
        return [
          { label: 'license', message: 'MIT', color: '10b981', style: 'for-the-badge', logo: '' },
          { label: 'license', message: 'Apache-2.0', color: '3b82f6', style: 'for-the-badge', logo: '' },
          { label: 'license', message: 'GPL-3.0', color: 'f59e0b', style: 'for-the-badge', logo: '' },
          { label: 'license', message: 'BSD-3', color: '6366f1', style: 'flat-square', logo: '' }
        ]
      case 'social':
        return [
          { label: 'discord', message: 'Join Chat', color: '5865f2', style: 'for-the-badge', logo: 'discord' },
          { label: 'twitter', message: 'Follow', color: '1da1f2', style: 'for-the-badge', logo: 'twitter' },
          { label: 'youtube', message: 'Subscribe', color: 'ff0000', style: 'for-the-badge', logo: 'youtube' },
          { label: 'linkedin', message: 'Connect', color: '0077b5', style: 'for-the-badge', logo: 'linkedin' }
        ]
      default:
        return []
    }
  }, [activeCategory, cleanRepo])

  const filteredPresets = useMemo(() => {
    if (!searchFilter.trim()) return categoryPresets
    const q = searchFilter.toLowerCase()
    return categoryPresets.filter(
      p => p.label.toLowerCase().includes(q) || p.message.toLowerCase().includes(q)
    )
  }, [categoryPresets, searchFilter])

  const badgeImageUrl = useMemo(() => {
    const cleanLabel = encodeURIComponent(label.trim())
    const cleanMessage = encodeURIComponent(message.trim())
    const cleanColor = color.replace('#', '').trim() || '6366f1'

    let url = `https://img.shields.io/badge/${cleanLabel}-${cleanMessage}-${cleanColor}?style=${style}`
    if (logo.trim()) {
      url += `&logo=${encodeURIComponent(logo.trim())}&logoColor=white`
    }
    return url
  }, [label, message, color, style, logo])

  const markdownSnippet = useMemo(() => {
    const altText = `${label} - ${message}`
    const targetLink = linkUrl.trim() || repoUrl || '#'
    return `[![${altText}](${badgeImageUrl})](${targetLink})`
  }, [label, message, badgeImageUrl, linkUrl, repoUrl])

  const handleApplyPreset = (preset) => {
    const formCol = document.querySelector('.studio-form-column')
    const savedTop = formCol ? formCol.scrollTop : 0
    if (preset.label) setLabel(preset.label)
    if (preset.message) setMessage(preset.message)
    if (preset.color) setColor(preset.color)
    if (preset.style) setStyle(preset.style)
    if (preset.logo !== undefined) setLogo(preset.logo)
    if (preset.link) setLinkUrl(preset.link)
    if (formCol) {
      window.requestAnimationFrame(() => {
        formCol.scrollTop = savedTop
      })
      setTimeout(() => {
        if (formCol) formCol.scrollTop = savedTop
      }, 50)
    }
  }

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(markdownSnippet)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleInsert = () => {
    onInsertBadge(markdownSnippet)
  }

  return (
    <div className="studio-tab-view select-none">
      {/* Studio Top Control Strip */}
      <div className="studio-top-bar">
        <div className="studio-bar-left">
          <div className="studio-badge-halo">
            <span className="material-symbols-outlined text-secondary">shield</span>
          </div>
          <div>
            <div className="studio-title-row">
              <h2 className="studio-title">Shields.io Badge Studio</h2>
              <span className="studio-tag">Interactive Builder</span>
            </div>
            <p className="studio-subtitle">
              Design dynamic status badges, tech stack indicators, licenses, and GitHub metric counters.
            </p>
          </div>
        </div>

        <div className="studio-bar-actions">
          {onBackToReadme && (
            <button
              type="button"
              className="btn-studio-secondary"
              onClick={onBackToReadme}
              title="Return to active markdown document"
            >
              <span className="material-symbols-outlined icon-xs">arrow_back</span>
              <span>Back to Editor</span>
            </button>
          )}
          <button
            type="button"
            className="btn-studio-secondary"
            onClick={handleCopyMarkdown}
          >
            <span className="material-symbols-outlined icon-xs">
              {copied ? 'check' : 'content_copy'}
            </span>
            <span>{copied ? 'Copied!' : 'Copy Markdown'}</span>
          </button>
          <button
            type="button"
            className="btn-studio-primary"
            onClick={handleInsert}
          >
            <span className="material-symbols-outlined icon-xs">add_circle</span>
            <span>Insert into README.md</span>
          </button>
        </div>
      </div>

      {/* Main Studio Body: 2-Column Responsive Layout */}
      <div className="studio-content-grid">
        {/* Left Column: Form & Presets */}
        <div className="studio-form-column custom-scrollbar">
          {/* Category Tabs */}
          <div className="studio-section">
            <label className="studio-section-label">Category</label>
            <div className="studio-category-tabs">
              {BADGE_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`studio-category-tab ${activeCategory === cat.id ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  <span className="material-symbols-outlined icon-xs">{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Category Presets Rack */}
          <div className="studio-section">
            <div className="studio-section-header">
              <label className="studio-section-label">Preset Badges</label>
              <input
                type="text"
                className="studio-search-mini"
                placeholder="Search presets..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
              />
            </div>
            <div className="studio-chips-rack">
              {filteredPresets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="studio-chip-btn"
                  onClick={() => handleApplyPreset(preset)}
                >
                  <span className="chip-prefix">{preset.label}:</span>
                  <span className="chip-value">{preset.message}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Label & Message Inputs */}
          <div className="studio-section">
            <label className="studio-section-label">Content</label>
            <div className="studio-input-duo">
              <div className="studio-field">
                <span className="studio-field-label">Left Label</span>
                <input
                  type="text"
                  className="studio-text-input"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g. version, build, license"
                />
              </div>
              <div className="studio-field">
                <span className="studio-field-label">Right Message</span>
                <input
                  type="text"
                  className="studio-text-input"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="e.g. 1.0.0, passing, MIT"
                />
              </div>
            </div>
          </div>

          {/* Badge Style Selector */}
          <div className="studio-section">
            <label className="studio-section-label">Badge Style</label>
            <div className="studio-segmented-styles">
              {BADGE_STYLES.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  className={`studio-style-btn ${style === st.id ? 'active' : ''}`}
                  onClick={() => setStyle(st.id)}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color Swatch Picker */}
          <div className="studio-section">
            <label className="studio-section-label">Color Theme</label>
            <div className="studio-swatches-grid">
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
            <div className="studio-hex-row">
              <span className="hex-prefix">#</span>
              <input
                type="text"
                className="studio-hex-input"
                value={color}
                onChange={(e) => setColor(e.target.value.replace('#', ''))}
                placeholder="HEX code (e.g. 6366f1)"
                maxLength={6}
              />
            </div>
          </div>

          {/* Brand Logo & Target URL */}
          <div className="studio-section">
            <div className="studio-input-duo">
              <div className="studio-field">
                <span className="studio-field-label">Logo Icon (SimpleIcons)</span>
                <input
                  type="text"
                  className="studio-text-input"
                  value={logo}
                  onChange={(e) => setLogo(e.target.value)}
                  placeholder="e.g. github, react, docker, python"
                />
              </div>
              <div className="studio-field">
                <span className="studio-field-label">Target Hyperlink URL</span>
                <input
                  type="text"
                  className="studio-text-input"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder={repoUrl || 'https://...'}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Render & Markdown Preview */}
        <div className="studio-preview-column custom-scrollbar">
          {/* Live Render Canvas Card */}
          <div className="studio-card">
            <div className="studio-card-header">
              <span className="studio-card-title">Live Render Preview</span>
              <span className="studio-card-tag">{style}</span>
            </div>
            <div className="studio-render-canvas">
              <img
                src={badgeImageUrl}
                alt={`${label} ${message}`}
                className="badge-render-img"
                onError={(e) => { e.target.style.display = 'none' }}
                onLoad={(e) => { e.target.style.display = 'inline-block' }}
              />
            </div>
          </div>

          {/* Markdown Output Card */}
          <div className="studio-card">
            <div className="studio-card-header">
              <span className="studio-card-title">Generated Markdown Syntax</span>
              <button
                type="button"
                className="snippet-copy-btn"
                onClick={handleCopyMarkdown}
              >
                <span className="material-symbols-outlined icon-xs">
                  {copied ? 'check' : 'content_copy'}
                </span>
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="studio-code-block custom-scrollbar">
              <code>{markdownSnippet}</code>
            </pre>
          </div>

          {/* Popular Presets Rack */}
          <div className="studio-card">
            <div className="studio-card-header">
              <span className="studio-card-title">Curated Quick Presets</span>
            </div>
            <div className="studio-presets-grid">
              {POPULAR_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="studio-preset-pill"
                  onClick={() => handleApplyPreset(preset)}
                >
                  <span>{preset.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
