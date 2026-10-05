import { useState, useMemo } from 'react'
import axios from 'axios'
import SectionOrder from './SectionOrder'

const TECH_STACK_OPTIONS = [
  // Frontend
  { id: 'react', label: 'React', category: 'Frontend' },
  { id: 'nextjs', label: 'Next.js', category: 'Frontend' },
  { id: 'vue', label: 'Vue', category: 'Frontend' },
  { id: 'angular', label: 'Angular', category: 'Frontend' },
  { id: 'svelte', label: 'Svelte', category: 'Frontend' },
  { id: 'typescript', label: 'TypeScript', category: 'Frontend' },
  { id: 'tailwind', label: 'Tailwind CSS', category: 'Frontend' },
  { id: 'vite', label: 'Vite', category: 'Frontend' },
  { id: 'webpack', label: 'Webpack', category: 'Frontend' },
  { id: 'remix', label: 'Remix', category: 'Frontend' },

  // Backend
  { id: 'node', label: 'Node.js', category: 'Backend' },
  { id: 'fastapi', label: 'FastAPI', category: 'Backend' },
  { id: 'flask', label: 'Flask', category: 'Backend' },
  { id: 'django', label: 'Django', category: 'Backend' },
  { id: 'golang', label: 'Go', category: 'Backend' },
  { id: 'rust', label: 'Rust', category: 'Backend' },
  { id: 'java', label: 'Java/Spring', category: 'Backend' },
  { id: 'dotnet', label: '.NET/C#', category: 'Backend' },
  { id: 'python', label: 'Python', category: 'Backend' },
  { id: 'php', label: 'PHP/Laravel', category: 'Backend' },

  // Database
  { id: 'mongodb', label: 'MongoDB', category: 'Database' },
  { id: 'mysql', label: 'MySQL', category: 'Database' },
  { id: 'postgresql', label: 'PostgreSQL', category: 'Database' },
  { id: 'sqlite', label: 'SQLite', category: 'Database' },
  { id: 'redis', label: 'Redis', category: 'Database' },
  { id: 'dynamodb', label: 'DynamoDB', category: 'Database' },
  { id: 'firestore', label: 'Firestore', category: 'Database' },
  { id: 'elasticsearch', label: 'Elasticsearch', category: 'Database' },

  // DevOps/Cloud
  { id: 'docker', label: 'Docker', category: 'DevOps' },
  { id: 'kubernetes', label: 'Kubernetes', category: 'DevOps' },
  { id: 'aws', label: 'AWS', category: 'DevOps' },
  { id: 'gcp', label: 'Google Cloud', category: 'DevOps' },
  { id: 'azure', label: 'Azure', category: 'DevOps' },
  { id: 'vercel', label: 'Vercel', category: 'DevOps' },
  { id: 'netlify', label: 'Netlify', category: 'DevOps' },
  { id: 'github-actions', label: 'GitHub Actions', category: 'DevOps' },

  // Testing & Tools
  { id: 'jest', label: 'Jest', category: 'Testing' },
  { id: 'pytest', label: 'Pytest', category: 'Testing' },
  { id: 'cypress', label: 'Cypress', category: 'Testing' },
  { id: 'postman', label: 'Postman', category: 'Testing' },
  { id: 'git', label: 'Git', category: 'Tools' },
  { id: 'graphql', label: 'GraphQL', category: 'Tools' },
  { id: 'rest', label: 'REST API', category: 'Tools' },
]

const PRESET_TEMPLATES = [
  {
    name: '🚀 Full-Stack SaaS',
    desc: 'A modern full-stack web application featuring user authentication, dashboard analytics, responsive design, and database persistence.',
    techs: ['React', 'TypeScript', 'Tailwind CSS', 'FastAPI', 'PostgreSQL', 'Docker', 'Vercel']
  },
  {
    name: '🐍 Python CLI / App',
    desc: 'A fast, developer-friendly Python command-line utility with automated testing, colored terminal output, and zero configuration.',
    techs: ['Python', 'FastAPI', 'Pytest', 'Docker']
  },
  {
    name: '⚛️ React Component Lib',
    desc: 'An accessible, production-ready React component library with Storybook documentation and TypeScript type declarations.',
    techs: ['React', 'TypeScript', 'Tailwind CSS', 'Vite']
  },
  {
    name: '🌐 REST API Service',
    desc: 'A high-throughput RESTful API microservice with OpenAPI Swagger documentation, rate limiting, and database caching.',
    techs: ['FastAPI', 'Node.js', 'PostgreSQL', 'Redis', 'Docker']
  }
]

export default function Input({
  onGenerate,
  loading,
  generateSuite,
  setGenerateSuite,
  theme,
  setTheme,
  sectionOrder,
  setSectionOrder,
  repoUrl,
  setRepoUrl,
  description,
  setDescription,
  selectedTechs,
  setSelectedTechs
}) {
  const [customTech, setCustomTech] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [techSearch, setTechSearch] = useState('')
  const [scanning, setScanning] = useState(false)
  const [scanResult, setScanResult] = useState(null)
  const [scanError, setScanError] = useState('')

  const handleScanRepo = async () => {
    if (!repoUrl || !repoUrl.trim()) return
    setScanning(true)
    setScanError('')
    try {
      const apiBase = import.meta.env.VITE_API_URL || ''
      const endpoint = apiBase ? `${apiBase}/api/scan-repo` : '/api/scan-repo'
      const response = await axios.post(endpoint, { repo_url: repoUrl.trim() })
      if (response.data && response.data.success) {
        const data = response.data
        setScanResult(data)
        if (!description && data.description) {
          setDescription(data.description)
        }
        if (data.detected_tech && Array.isArray(data.detected_tech)) {
          setSelectedTechs((prev) => Array.from(new Set([...prev, ...data.detected_tech])))
        }
      }
    } catch (err) {
      console.warn('Scan repo API error:', err)
      const isConnError = err.code === 'ERR_NETWORK' || err.message?.includes('Network Error') || (err.response?.status === 500 && !err.response?.data?.detail)
      const detail = err.response?.data?.detail
      if (detail) {
        setScanError(detail)
      } else if (isConnError) {
        setScanError('Backend server is not reachable. Please ensure the Python backend is running on port 8000.')
      } else {
        setScanError('Failed to scan repository. Please verify the URL.')
      }
    } finally {
      setScanning(false)
    }
  }

  const categories = ['All', 'Frontend', 'Backend', 'Database', 'DevOps', 'Testing', 'Tools']

  const handleTechToggle = (techLabel) => {
    setSelectedTechs((prev) =>
      prev.includes(techLabel) ? prev.filter((t) => t !== techLabel) : [...prev, techLabel]
    )
  }

  const handleAddCustomTech = () => {
    if (customTech.trim() && !selectedTechs.includes(customTech.trim())) {
      setSelectedTechs((prev) => [...prev, customTech.trim()])
      setCustomTech('')
    }
  }

  const handleRemoveTech = (tech) => {
    setSelectedTechs((prev) => prev.filter((t) => t !== tech))
  }

  const handleApplyPreset = (preset) => {
    if (loading) return
    const drawerBody = document.querySelector('.drawer-body')
    const savedTop = drawerBody ? drawerBody.scrollTop : 0
    setDescription(preset.desc)
    setSelectedTechs(preset.techs)
    if (drawerBody) {
      window.requestAnimationFrame(() => {
        drawerBody.scrollTop = savedTop
      })
      setTimeout(() => {
        if (drawerBody) drawerBody.scrollTop = savedTop
      }, 50)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onGenerate(repoUrl, description, selectedTechs)
  }

  // Filter tech stack options based on category and search query
  const filteredTechs = useMemo(() => {
    return TECH_STACK_OPTIONS.filter((item) => {
      const matchesCategory = activeCategory === 'All' || item.category === activeCategory
      const matchesSearch = techSearch
        ? item.label.toLowerCase().includes(techSearch.toLowerCase())
        : true
      return matchesCategory && matchesSearch
    })
  }, [activeCategory, techSearch])

  return (
    <div className="generator-config-wrapper">
      <form onSubmit={handleSubmit} className="generator-form">
        {/* ==================== 1. QUICK PRESETS ==================== */}
        <div className="config-card">
          <div className="config-card-header">
            <span className="material-symbols-outlined card-header-icon text-amber">bolt</span>
            <span className="config-card-title">Quick Presets</span>
          </div>
          <div className="preset-chips-grid">
            {PRESET_TEMPLATES.map((p) => (
              <button
                key={p.name}
                type="button"
                className="preset-chip"
                onClick={() => handleApplyPreset(p)}
                disabled={loading}
                title={p.desc}
              >
                <span>{p.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ==================== 2. REPO URL & DESCRIPTION ==================== */}
        <div className="config-card">
          <div className="config-card-header">
            <span className="material-symbols-outlined card-header-icon text-secondary">source</span>
            <span className="config-card-title">Project Context</span>
          </div>
          <p className="config-card-subtitle">
            Provide a GitHub URL, a project description, or both.
          </p>

          <div className="form-field">
            <div className="field-label-row">
              <label className="field-label" htmlFor="repo-url">
                GitHub Repository URL
              </label>
              {repoUrl && repoUrl.trim() && (
                <button
                  type="button"
                  className={`btn-scan-repo ${scanning ? 'scanning' : ''}`}
                  onClick={handleScanRepo}
                  disabled={scanning || loading}
                  title="Deep scan repository for dependencies, languages, and structure"
                >
                  <span className={`material-symbols-outlined icon-xs ${scanning ? 'spin-icon' : ''}`}>
                    {scanning ? 'sync' : 'radar'}
                  </span>
                  <span>{scanning ? 'Scanning...' : 'Scan & Auto-Detect'}</span>
                </button>
              )}
            </div>
            <div className="input-with-icon">
              <span className="material-symbols-outlined input-prefix-icon">link</span>
              <input
                id="repo-url"
                type="url"
                className="ide-input"
                placeholder="https://github.com/username/repository"
                value={repoUrl}
                onChange={(e) => {
                  setRepoUrl(e.target.value)
                  if (scanResult) setScanResult(null)
                  if (scanError) setScanError('')
                }}
                disabled={loading}
              />
            </div>
            <span className="field-hint">Extracts topics, languages, licenses & file structure</span>

            {/* AST Scan Result Card */}
            {scanResult && (
              <div className="ast-scan-result-card">
                <div className="ast-card-header">
                  <span className="material-symbols-outlined text-primary icon-xs">verified</span>
                  <span className="ast-repo-name truncate">{scanResult.full_name || scanResult.repo_name}</span>
                  <span className="ast-stat-pill">⭐ {scanResult.stars}</span>
                  <span className="ast-stat-pill">{scanResult.license}</span>
                </div>
                {scanResult.detected_tech && scanResult.detected_tech.length > 0 && (
                  <div className="ast-detected-techs">
                    <span className="ast-detected-label">Detected Tech Stack:</span>
                    <div className="ast-chips-row">
                      {scanResult.detected_tech.map((t) => (
                        <span key={t} className="ast-tech-chip">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {scanError && (
              <div className="ast-error-note">
                <span className="material-symbols-outlined icon-xs text-amber">info</span>
                <span>{scanError}</span>
              </div>
            )}
          </div>

          <div className="form-field">
            <label className="field-label" htmlFor="description">
              Project Description / Focus
            </label>
            <textarea
              id="description"
              className="ide-textarea custom-scrollbar"
              placeholder="Describe your project, CLI commands, key features, or architectural notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              disabled={loading}
            />
            <span className="field-hint">Used to infer features, installation steps & overview</span>
          </div>
        </div>

        {/* ==================== 3. TECH STACK (REBUILT CLEAN PILLS) ==================== */}
        <div className="config-card">
          <div className="config-card-header">
            <div className="header-left">
              <span className="material-symbols-outlined card-header-icon text-primary">layers</span>
              <span className="config-card-title">Tech Stack</span>
            </div>
            {selectedTechs.length > 0 && (
              <span className="selected-count-badge">
                {selectedTechs.length} Selected
              </span>
            )}
          </div>

          {/* Active Selected Tags Tray */}
          {selectedTechs.length > 0 && (
            <div className="selected-tags-tray custom-scrollbar">
              {selectedTechs.map((tech) => (
                <span key={tech} className="selected-tag-pill">
                  <span>{tech}</span>
                  <button
                    type="button"
                    className="remove-tag-btn"
                    onClick={() => handleRemoveTech(tech)}
                    title={`Remove ${tech}`}
                    disabled={loading}
                  >
                    ×
                  </button>
                </span>
              ))}
              <button
                type="button"
                className="clear-all-tags-btn"
                onClick={() => setSelectedTechs([])}
                title="Clear all selected"
              >
                Clear
              </button>
            </div>
          )}

          {/* Category Filter Tabs */}
          <div className="tech-category-tabs custom-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`category-tab-pill ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search or Custom Add Field */}
          <div className="tech-add-bar">
            <div className="input-with-icon mini">
              <span className="material-symbols-outlined input-prefix-icon">search</span>
              <input
                type="text"
                className="ide-input mini"
                placeholder="Filter or type custom tech..."
                value={customTech || techSearch}
                onChange={(e) => {
                  setTechSearch(e.target.value)
                  setCustomTech(e.target.value)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddCustomTech()
                  }
                }}
                disabled={loading}
              />
            </div>
            {customTech.trim() && (
              <button
                type="button"
                className="btn-add-pill"
                onClick={handleAddCustomTech}
                disabled={loading}
              >
                + Add
              </button>
            )}
          </div>

          {/* Interactive Clickable Tech Pills (NOT raw naked checkboxes) */}
          <div className="tech-chips-wall custom-scrollbar">
            {filteredTechs.map((item) => {
              const isSelected = selectedTechs.includes(item.label)
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`tech-chip-toggle ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleTechToggle(item.label)}
                  disabled={loading}
                >
                  <span className="chip-indicator">
                    {isSelected ? '✓' : '+'}
                  </span>
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* ==================== 4. THEME & SECTION ORDER ==================== */}
        <div className="config-card">
          <div className="config-card-header">
            <span className="material-symbols-outlined card-header-icon text-secondary">palette</span>
            <span className="config-card-title">Output Style & Sections</span>
          </div>

          {/* Readme Theme Select */}
          <div className="form-field">
            <label className="field-label" htmlFor="theme-select">Markdown Template Style</label>
            <select
              id="theme-select"
              className="ide-select"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              disabled={loading}
            >
              <option value="default">Default — Comprehensive & Professional</option>
              <option value="minimalist">Minimalist — Clean, Compact & Direct</option>
              <option value="hacker">Hacker — Terminal & ASCII Aesthetic</option>
            </select>
          </div>

          {/* Section Order Accordion */}
          <SectionOrder
            sectionOrder={sectionOrder}
            setSectionOrder={setSectionOrder}
            disabled={loading}
          />

          {/* Doc Pack Toggle Card */}
          <div className="doc-pack-card">
            <label className="doc-pack-label">
              <input
                type="checkbox"
                className="doc-pack-checkbox"
                checked={generateSuite}
                onChange={(e) => setGenerateSuite(e.target.checked)}
                disabled={loading}
              />
              <div className="doc-pack-info">
                <span className="doc-pack-title">Multi-File Documentation Pack</span>
                <span className="doc-pack-sub">Generates README.md, CONTRIBUTING.md, and LICENSE</span>
              </div>
            </label>
          </div>
        </div>

        {/* ==================== 5. STICKY / PROMINENT SUBMIT CTA ==================== */}
        <div className="generator-submit-tray">
          <button
            type="submit"
            className={`btn-generate-main ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            <span className="material-symbols-outlined generate-btn-icon">
              {loading ? 'sync' : 'auto_awesome'}
            </span>
            <span className="generate-btn-text">
              {loading ? 'Generating Documentation...' : 'Generate Documentation'}
            </span>
            <kbd className="btn-shortcut-badge">Ctrl+↵</kbd>
          </button>
        </div>
      </form>
    </div>
  )
}
