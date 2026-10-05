import React, { useState, useMemo } from 'react'

const SNIPPET_CATEGORIES = [
  { id: 'callouts', label: 'GitHub Alerts & Callouts', icon: 'campaign' },
  { id: 'codeblock', label: 'Code Blocks & CLI', icon: 'code_blocks' },
  { id: 'collapsible', label: 'Collapsible Sections', icon: 'unfold_more' },
  { id: 'license', label: 'License & Copyright', icon: 'verified' }
]

const CALLOUT_TYPES = [
  { type: 'NOTE', icon: 'info', color: '#38bdf8', label: 'Note', defaultTitle: 'Useful context or general notes' },
  { type: 'TIP', icon: 'lightbulb', color: '#10b981', label: 'Tip', defaultTitle: 'Pro-tip or performance optimization suggestion' },
  { type: 'IMPORTANT', icon: 'error_outline', color: '#a855f7', label: 'Important', defaultTitle: 'Crucial information required for successful setup' },
  { type: 'WARNING', icon: 'warning', color: '#f59e0b', label: 'Warning', defaultTitle: 'Critical advisory to prevent configuration mistakes' },
  { type: 'CAUTION', icon: 'dangerous', color: '#ef4444', label: 'Caution', defaultTitle: 'High-risk action that may cause data loss or breakdown' }
]

const CODE_LANGUAGES = [
  'bash', 'python', 'javascript', 'typescript', 'yaml', 'dockerfile', 'json', 'sql', 'rust', 'go'
]

export default function SnippetStudioTab({
  onInsertSnippet,
  onBackToReadme
}) {
  const [activeCategory, setActiveCategory] = useState('callouts')
  const [copied, setCopied] = useState(false)

  // Callouts state
  const [selectedCallout, setSelectedCallout] = useState('NOTE')
  const [calloutText, setCalloutText] = useState('This project requires Python 3.11+ and Node.js 18+ to execute full documentation synthesis pipelines.')

  // Code Block state
  const [codeLang, setCodeLang] = useState('bash')
  const [codeTitle, setCodeTitle] = useState('Installation & Setup')
  const [codeContent, setCodeContent] = useState(`# Clone the repository\ngit clone https://github.com/owner/project.git\ncd project\n\n# Install backend & frontend dependencies\npip install -r requirements.txt\nnpm --prefix frontend install\n\n# Start both local development servers\npython backend/app.py &\nnpm --prefix frontend run dev`)

  // Collapsible state
  const [summaryText, setSummaryText] = useState('Click to expand advanced configuration options')
  const [detailsBody, setDetailsBody] = useState('### Advanced Environment Flags\n\n- `DOC_CACHE_ENABLED=true`: Caches AST repo parsing locally.\n- `MERMAID_THEME=dark`: Enforces dark vector rendering.\n- `RATE_LIMIT_FALLBACK=heuristic`: Uses heuristic inference if GitHub token is unavailable.')

  // License state
  const [licenseType, setLicenseType] = useState('MIT')
  const [licenseAuthor, setLicenseAuthor] = useState('Project Contributors')
  const [licenseYear, setLicenseYear] = useState(new Date().getFullYear().toString())

  // Generate markdown snippet based on active category
  const generatedSnippet = useMemo(() => {
    switch (activeCategory) {
      case 'callouts':
        return `> [!${selectedCallout}]\n> ${calloutText.replace(/\n/g, '\n> ')}`
      case 'codeblock':
        return `### ${codeTitle}\n\n\`\`\`${codeLang}\n${codeContent.trim()}\n\`\`\``
      case 'collapsible':
        return `<details>\n<summary><b>${summaryText}</b></summary>\n\n${detailsBody.trim()}\n\n</details>`
      case 'license':
        return `## License\n\nDistributed under the **${licenseType} License**. See [\`LICENSE\`](./LICENSE) for more information.\n\nCopyright (c) ${licenseYear} ${licenseAuthor}.`
      default:
        return ''
    }
  }, [activeCategory, selectedCallout, calloutText, codeLang, codeTitle, codeContent, summaryText, detailsBody, licenseType, licenseAuthor, licenseYear])

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedSnippet)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleInsert = () => {
    onInsertSnippet(generatedSnippet)
  }

  return (
    <div className="studio-tab-view select-none">
      {/* Top Control Bar */}
      <div className="studio-top-bar">
        <div className="studio-bar-left">
          <div className="studio-badge-halo">
            <span className="material-symbols-outlined text-emerald">code_blocks</span>
          </div>
          <div>
            <div className="studio-title-row">
              <h2 className="studio-title">Code & Feature Snippets Studio</h2>
              <span className="studio-tag">Interactive Component Builder</span>
            </div>
            <p className="studio-subtitle">
              Build GitHub-styled alert callouts, multi-language code blocks, collapsible drawers, and license blocks.
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
            onClick={handleCopy}
          >
            <span className="material-symbols-outlined icon-xs">
              {copied ? 'check' : 'content_copy'}
            </span>
            <span>{copied ? 'Copied!' : 'Copy Snippet'}</span>
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
        {/* Left Column: Category Navigation & Interactive Configurator */}
        <div className="studio-form-column custom-scrollbar">
          {/* Category Tabs */}
          <div className="studio-section">
            <label className="studio-section-label">Component Category</label>
            <div className="studio-category-tabs">
              {SNIPPET_CATEGORIES.map((cat) => (
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

          {/* Configuration Form Based on Category */}
          {activeCategory === 'callouts' && (
            <>
              <div className="studio-section">
                <label className="studio-section-label">Alert Severity Type</label>
                <div className="callout-types-grid">
                  {CALLOUT_TYPES.map((c) => (
                    <button
                      key={c.type}
                      type="button"
                      className={`callout-type-btn ${selectedCallout === c.type ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedCallout(c.type)
                        setCalloutText(c.defaultTitle)
                      }}
                      style={selectedCallout === c.type ? { borderColor: c.color, backgroundColor: `${c.color}15` } : {}}
                    >
                      <span className="material-symbols-outlined icon-xs" style={{ color: c.color }}>{c.icon}</span>
                      <span>{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="studio-section">
                <label className="studio-section-label">Callout Message Content</label>
                <textarea
                  className="studio-text-area custom-scrollbar"
                  rows={4}
                  value={calloutText}
                  onChange={(e) => setCalloutText(e.target.value)}
                  placeholder="Enter notice description..."
                />
              </div>
            </>
          )}

          {activeCategory === 'codeblock' && (
            <>
              <div className="studio-section">
                <div className="studio-input-duo">
                  <div className="studio-field">
                    <span className="studio-field-label">Section Title</span>
                    <input
                      type="text"
                      className="studio-text-input"
                      value={codeTitle}
                      onChange={(e) => setCodeTitle(e.target.value)}
                      placeholder="e.g. Getting Started"
                    />
                  </div>
                  <div className="studio-field">
                    <span className="studio-field-label">Syntax Language</span>
                    <select
                      className="studio-select-input"
                      value={codeLang}
                      onChange={(e) => setCodeLang(e.target.value)}
                    >
                      {CODE_LANGUAGES.map((lang) => (
                        <option key={lang} value={lang}>{lang}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="studio-section">
                <label className="studio-section-label">Code / Shell Commands</label>
                <textarea
                  className="studio-text-area studio-code-area custom-scrollbar"
                  rows={8}
                  value={codeContent}
                  onChange={(e) => setCodeContent(e.target.value)}
                  placeholder="Enter shell script or code..."
                  spellCheck={false}
                />
              </div>
            </>
          )}

          {activeCategory === 'collapsible' && (
            <>
              <div className="studio-section">
                <label className="studio-section-label">Summary Header (Always Visible)</label>
                <input
                  type="text"
                  className="studio-text-input"
                  value={summaryText}
                  onChange={(e) => setSummaryText(e.target.value)}
                  placeholder="e.g. Click to view optional dependencies"
                />
              </div>

              <div className="studio-section">
                <label className="studio-section-label">Expanded Content (Markdown)</label>
                <textarea
                  className="studio-text-area custom-scrollbar"
                  rows={6}
                  value={detailsBody}
                  onChange={(e) => setDetailsBody(e.target.value)}
                  placeholder="Hidden markdown content when collapsed..."
                />
              </div>
            </>
          )}

          {activeCategory === 'license' && (
            <>
              <div className="studio-section">
                <label className="studio-section-label">License Type</label>
                <div className="studio-segmented-styles">
                  {['MIT', 'Apache-2.0', 'GPL-3.0', 'BSD-3-Clause', 'ISC'].map((lic) => (
                    <button
                      key={lic}
                      type="button"
                      className={`studio-style-btn ${licenseType === lic ? 'active' : ''}`}
                      onClick={() => setLicenseType(lic)}
                    >
                      {lic}
                    </button>
                  ))}
                </div>
              </div>

              <div className="studio-section">
                <div className="studio-input-duo">
                  <div className="studio-field">
                    <span className="studio-field-label">Copyright Holder / Organization</span>
                    <input
                      type="text"
                      className="studio-text-input"
                      value={licenseAuthor}
                      onChange={(e) => setLicenseAuthor(e.target.value)}
                      placeholder="e.g. Acme Corp / Maintainers"
                    />
                  </div>
                  <div className="studio-field">
                    <span className="studio-field-label">Copyright Year</span>
                    <input
                      type="text"
                      className="studio-text-input"
                      value={licenseYear}
                      onChange={(e) => setLicenseYear(e.target.value)}
                      placeholder="2026"
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Column: Live Render & Markdown Output */}
        <div className="studio-preview-column custom-scrollbar">
          {/* Live Render Card */}
          <div className="studio-card">
            <div className="studio-card-header">
              <span className="studio-card-title">Live GitHub Visual Render</span>
              <span className="studio-card-tag">{activeCategory}</span>
            </div>
            <div className="snippet-render-viewport custom-scrollbar">
              {activeCategory === 'callouts' && (
                <div className={`github-callout callout-${selectedCallout.toLowerCase()}`}>
                  <div className="callout-header">
                    <span className="material-symbols-outlined icon-xs">
                      {CALLOUT_TYPES.find(c => c.type === selectedCallout)?.icon || 'info'}
                    </span>
                    <span className="callout-title">{selectedCallout}</span>
                  </div>
                  <p className="callout-body">{calloutText}</p>
                </div>
              )}

              {activeCategory === 'codeblock' && (
                <div className="code-render-preview">
                  <div className="code-render-header">
                    <span className="code-title-tag">{codeTitle}</span>
                    <span className="code-lang-tag">{codeLang}</span>
                  </div>
                  <pre className="code-render-body"><code>{codeContent}</code></pre>
                </div>
              )}

              {activeCategory === 'collapsible' && (
                <div className="details-render-preview">
                  <details open>
                    <summary className="details-summary"><b>{summaryText}</b></summary>
                    <div className="details-content">
                      <pre className="details-pre"><code>{detailsBody}</code></pre>
                    </div>
                  </details>
                </div>
              )}

              {activeCategory === 'license' && (
                <div className="license-render-preview">
                  <div className="license-header">
                    <span className="material-symbols-outlined text-emerald">verified</span>
                    <span className="license-title">{licenseType} License</span>
                  </div>
                  <p className="license-text">
                    Distributed under the <strong>{licenseType} License</strong>. See <code>LICENSE</code> for full details.
                  </p>
                  <p className="license-subtext">
                    Copyright (c) {licenseYear} {licenseAuthor}.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Generated Markdown Syntax Block */}
          <div className="studio-card">
            <div className="studio-card-header">
              <span className="studio-card-title">Generated Markdown Code</span>
              <button
                type="button"
                className="snippet-copy-btn"
                onClick={handleCopy}
              >
                <span className="material-symbols-outlined icon-xs">
                  {copied ? 'check' : 'content_copy'}
                </span>
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="studio-code-block custom-scrollbar">
              <code>{generatedSnippet}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
