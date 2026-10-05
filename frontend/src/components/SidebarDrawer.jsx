import React, { useState, useMemo } from 'react'
import Input from './Input'

export default function SidebarDrawer({
  activeTab,
  collapsed,
  files,
  activeFile,
  onSelectFile,
  onCreateFile,
  onDeleteFile,
  markdown,
  onScrollToHeading,
  onLoadTemplate,
  openStudioTabs = [],
  onOpenStudioTab = () => {},
  onCloseStudioTab = () => {},
  onInsertInstantSyntax = () => {},
  // Props for Input (AI Generator)
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
  setSelectedTechs,
  error
}) {
  const [newFileName, setNewFileName] = useState('')
  const [isAddingFile, setIsAddingFile] = useState(false)

  // Parse document outline from active markdown
  const outline = useMemo(() => {
    if (!markdown) return []
    const lines = markdown.split('\n')
    const headings = []
    lines.forEach((line, idx) => {
      const match = line.match(/^(#{1,4})\s+(.+)$/)
      if (match) {
        headings.push({
          level: match[1].length,
          text: match[2].replace(/[#*_`]/g, '').trim(),
          lineNumber: idx + 1
        })
      }
    })
    return headings
  }, [markdown])

  const handleCreateFileSubmit = (e) => {
    e.preventDefault()
    if (!newFileName.trim()) return
    let name = newFileName.trim()
    if (!name.includes('.')) name += '.md'
    onCreateFile(name)
    setNewFileName('')
    setIsAddingFile(false)
  }

  // Studio Tools definition
  const studioToolsList = [
    {
      id: 'badges.studio',
      title: 'Shields.io Badge Studio',
      icon: 'shield',
      color: '#38bdf8',
      description: 'Design custom SVG shields and badges. Choose from over 100+ devicon presets, custom hex colors, styles, and live labels.',
      features: ['100+ Devicon Presets', 'Custom Hex Swatches', 'Flat / Plastic / Social Styles'],
      instantSyntax: `[![Version](https://img.shields.io/badge/version-1.0.0-6366f1.svg)](#) [![License: MIT](https://img.shields.io/badge/License-MIT-10b981.svg)](#) [![Build Passing](https://img.shields.io/badge/build-passing-brightgreen.svg)](#)`
    },
    {
      id: 'diagrams.studio',
      title: 'Mermaid Diagram Studio',
      icon: 'schema',
      color: '#6366f1',
      description: 'Visually assemble system architecture flowcharts, API sequences, ER diagrams, and Git graphs with real-time SVG rendering.',
      features: ['Live Mermaid Engine', 'Multi-Layer Flowcharts', 'One-Click README Insertion'],
      instantSyntax: `\`\`\`mermaid
graph TD
  A[Client Web App] -->|HTTPS REST| B[FastAPI Gateway]
  B --> C[Documentation Engine]
  C -->|Markdown AST| D[Output Renderer]
  D -->|Live Sync| A
\`\`\``
    },
    {
      id: 'tables.studio',
      title: 'Visual Markdown Table Designer',
      icon: 'table_chart',
      color: '#f59e0b',
      description: 'Interactive visual spreadsheet editor. Insert rows/columns, customize column alignments, and live preview rendered tables.',
      features: ['Spreadsheet-like Grid', 'Per-Column Alignment', 'Preset Blueprints (Features, APIs)'],
      instantSyntax: `| Module | Responsibility | Status |
| :--- | :---: | ---: |
| Authentication | OAuth2 & JWT Sessions | Active |
| Storage Engine | Redis & Postgres Cache | Stable |
| Telemetry | Prometheus & OpenTelemetry | In Progress |`
    },
    {
      id: 'snippets.studio',
      title: 'Code & Callouts Snippets',
      icon: 'code_blocks',
      color: '#10b981',
      description: 'Create GitHub alert callouts ([!NOTE], [!TIP], [!WARNING], [!CAUTION]), multi-language code blocks, and collapsible sections.',
      features: ['GitHub Callout Types', 'Syntax Highlight Blocks', 'Collapsible Details Accordions'],
      instantSyntax: `> [!NOTE]
> Useful information that highlights key points even when skimming.

> [!TIP]
> Helpful advice or recommendations for optimizing system performance.`
    }
  ]

  // Pre-configured templates list
  const templatesList = [
    {
      id: 'fullstack',
      title: '🚀 Full-Stack SaaS',
      category: 'Web App',
      description: 'Production-ready README with Architecture, Setup, Docker, and API endpoints.',
      tags: ['React', 'FastAPI', 'PostgreSQL', 'Docker'],
      content: `# Nexus SaaS Platform ⚡

> Next-generation cloud operations platform for modern engineering teams.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](#)
[![Coverage](https://img.shields.io/badge/coverage-96%25-success.svg)](#)

## 🌟 Key Features
- **Real-Time Telemetry:** Live websocket streaming with sub-millisecond response latency.
- **Role-Based Access Control:** Enterprise-grade authentication and team workspaces.
- **Docker Ready:** Single-command local environment spinning via docker-compose.

## 🛠️ Tech Stack
- **Frontend:** React 18, Tailwind CSS, Vite
- **Backend:** FastAPI (Python 3.11), Pydantic v2
- **Database:** PostgreSQL, Redis
- **Infra:** Docker, GitHub Actions, Vercel

## 🚀 Quick Start

### 1. Clone Repository
\`\`\`bash
git clone https://github.com/example/nexus-saas.git
cd nexus-saas
\`\`\`

### 2. Environment Variables
\`\`\`bash
cp .env.example .env
\`\`\`

### 3. Run with Docker
\`\`\`bash
docker-compose up -d --build
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to view the client.

## 📄 License
Distributed under the MIT License. See \`LICENSE\` for details.
`
    },
    {
      id: 'cli-tool',
      title: '⚡ Developer CLI Utility',
      category: 'Dev Tool',
      description: 'Optimized for terminal tools with installation guides, flags table, and examples.',
      tags: ['Rust', 'Python', 'Go', 'CLI'],
      content: `# hyper-fetch ⚡

> Blazing fast asynchronous HTTP and documentation generator terminal tool.

[![Crates.io](https://img.shields.io/badge/crates.io-v1.2.0-orange.svg)](#)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](#)

## 📦 Installation

\`\`\`bash
# Via Cargo
cargo install hyper-fetch

# Via Homebrew
brew install hyper-fetch
\`\`\`

## 💻 Usage

\`\`\`bash
# Analyze a repository and generate docs
hyper-fetch generate --repo https://github.com/user/project --output ./docs

# Watch mode
hyper-fetch watch --live
\`\`\`

## ⚙️ Command Options
| Flag | Short | Description | Default |
| :--- | :--- | :--- | :--- |
| \`--output\` | \`-o\` | Output directory path | \`./dist\` |
| \`--verbose\` | \`-v\` | Verbose debug telemetry | \`false\` |
| \`--format\` | \`-f\` | Output format (\`md\` or \`html\`) | \`md\` |

## 🤝 Contributing
Contributions are welcomed! See \`CONTRIBUTING.md\` for testing instructions.
`
    },
    {
      id: 'react-lib',
      title: '⚛️ React Component Library',
      category: 'Frontend',
      description: 'Clean documentation with live code snippets, props tables, and Storybook links.',
      tags: ['React', 'TypeScript', 'Tailwind', 'Rollup'],
      content: `# @ui-craft/core 🎨

> Accessible, headless, and themeable React UI primitives for high-performance applications.

[![npm version](https://img.shields.io/npm/v/@ui-craft/core.svg)](https://npmjs.org)
[![Downloads](https://img.shields.io/npm/dm/@ui-craft/core.svg)](#)

## 📦 Install
\`\`\`bash
npm install @ui-craft/core
# or
pnpm add @ui-craft/core
\`\`\`

## 🚀 Basic Example

\`\`\`tsx
import React from 'react';
import { Button, Modal, useDisclosure } from '@ui-craft/core';

export function App() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <div>
      <Button variant="primary" onClick={onOpen}>
        Open Studio Modal
      </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <h2>Studio Workspace</h2>
      </Modal>
    </div>
  );
}
\`\`\`

## 📚 Props Table
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| \`variant\` | \`'primary' | 'secondary' | 'ghost'\` | \`'primary'\` | Visual button hierarchy |
| \`size\` | \`'sm' | 'md' | 'lg'\` | \`'md'\` | Component size scaling |
| \`disabled\` | \`boolean\` | \`false\` | Disable interactions |

## 📄 License
MIT © Open Source Community
`
    }
  ]

  if (collapsed) {
    return null
  }

  return (
    <aside className="sidebar-drawer select-none">
      {/* Header with Title */}
      <div className="drawer-header">
        <div className="drawer-title-group">
          <span className="material-symbols-outlined drawer-title-icon">
            {activeTab === 'explorer' && 'folder'}
            {activeTab === 'generator' && 'tune'}
            {activeTab === 'outline' && 'toc'}
            {activeTab === 'templates' && 'bookmark_border'}
            {activeTab === 'tools' && 'auto_fix_high'}
          </span>
          <span className="drawer-title-text">
            {activeTab === 'explorer' && 'Workspace Docs'}
            {activeTab === 'generator' && 'Documentation Config'}
            {activeTab === 'outline' && 'Document Outline'}
            {activeTab === 'templates' && 'Templates & Presets'}
            {activeTab === 'tools' && 'Studio Tools & Builders'}
          </span>
        </div>
      </div>

      {/* Drawer Body Container */}
      <div className="drawer-body custom-scrollbar">
        {/* ==================== 1. EXPLORER PANEL ==================== */}
        {activeTab === 'explorer' && (
          <div className="explorer-panel">
            <div className="explorer-section-header">
              <span className="section-label">DOC FILES ({Object.keys(files).length})</span>
              <div className="section-actions">
                <button
                  type="button"
                  className="icon-mini-btn"
                  onClick={() => setIsAddingFile(prev => !prev)}
                  title="Add new documentation file"
                >
                  <span className="material-symbols-outlined">post_add</span>
                </button>
              </div>
            </div>

            {/* Inline Add File Input */}
            {isAddingFile && (
              <form onSubmit={handleCreateFileSubmit} className="inline-add-file-form">
                <span className="material-symbols-outlined file-type-icon">description</span>
                <input
                  type="text"
                  placeholder="e.g. DEPLOYMENT.md"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  autoFocus
                  className="inline-file-input"
                />
                <button type="submit" className="inline-btn-check" title="Confirm file">
                  <span className="material-symbols-outlined">check</span>
                </button>
                <button
                  type="button"
                  className="inline-btn-cancel"
                  onClick={() => {
                    setIsAddingFile(false)
                    setNewFileName('')
                  }}
                  title="Cancel"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </form>
            )}

            {/* File Tree List */}
            <div className="file-tree-list">
              {Object.entries(files).map(([fileName, content]) => {
                const isActive = activeFile === fileName
                const isReadme = fileName === 'README.md'
                const isLicense = fileName.toLowerCase().includes('license')
                const isSetup = fileName.toLowerCase().includes('setup') || fileName.toLowerCase().includes('install')
                const isContrib = fileName.toLowerCase().includes('contrib')

                let iconName = 'description'
                if (isLicense) iconName = 'verified'
                else if (isSetup) iconName = 'terminal'
                else if (isContrib) iconName = 'groups'

                const charLength = content ? content.length : 0
                const sizeLabel = charLength > 1024
                  ? `${(charLength / 1024).toFixed(1)} KB`
                  : `${charLength} B`

                return (
                  <div
                    key={fileName}
                    className={`file-tree-item ${isActive ? 'active' : ''}`}
                    onClick={() => onSelectFile(fileName)}
                  >
                    <div className="file-info">
                      <span className={`material-symbols-outlined file-tree-icon ${isReadme ? 'icon-readme' : ''}`}>
                        {iconName}
                      </span>
                      <span className="file-tree-name truncate">{fileName}</span>
                    </div>

                    <div className="file-meta">
                      {isActive && <span className="active-pill">Active</span>}
                      <span className="file-size-tag">{sizeLabel}</span>
                      {!isReadme && (
                        <button
                          type="button"
                          className="file-delete-btn"
                          onClick={(e) => {
                            e.stopPropagation()
                            onDeleteFile(fileName)
                          }}
                          title={`Delete ${fileName}`}
                        >
                          <span className="material-symbols-outlined">close</span>
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Project Summary Card */}
            <div className="sidebar-metrics-card">
              <div className="metrics-card-title">Document Suite Overview</div>
              <div className="metrics-grid">
                <div className="metric-box">
                  <span className="metric-val">{Object.keys(files).length}</span>
                  <span className="metric-lbl">Files</span>
                </div>
                <div className="metric-box">
                  <span className="metric-val">
                    {Object.values(files).reduce((acc, f) => acc + (f ? f.trim().split(/\s+/).length : 0), 0)}
                  </span>
                  <span className="metric-lbl">Total Words</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== 2. AI GENERATOR PANEL ==================== */}
        {activeTab === 'generator' && (
          <div className="generator-panel">
            <Input
              onGenerate={onGenerate}
              loading={loading}
              generateSuite={generateSuite}
              setGenerateSuite={setGenerateSuite}
              theme={theme}
              setTheme={setTheme}
              sectionOrder={sectionOrder}
              setSectionOrder={setSectionOrder}
              repoUrl={repoUrl}
              setRepoUrl={setRepoUrl}
              description={description}
              setDescription={setDescription}
              selectedTechs={selectedTechs}
              setSelectedTechs={setSelectedTechs}
            />

            {error && (
              <div className="error-card">
                <span className="material-symbols-outlined error-icon">error</span>
                <p>{error}</p>
              </div>
            )}
          </div>
        )}

        {/* ==================== 3. OUTLINE PANEL ==================== */}
        {activeTab === 'outline' && (
          <div className="outline-panel">
            <div className="outline-header">
              <span className="section-label">HEADINGS IN {activeFile}</span>
              <span className="outline-count">{outline.length} found</span>
            </div>

            {outline.length === 0 ? (
              <div className="outline-empty">
                <span className="material-symbols-outlined">format_list_bulleted</span>
                <p>No headings detected yet. Add # Headings to your markdown to see an interactive table of contents.</p>
              </div>
            ) : (
              <div className="outline-tree">
                {outline.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`outline-item level-${item.level}`}
                    onClick={() => onScrollToHeading(item.text)}
                    title={`Jump to "${item.text}" (Line ${item.lineNumber})`}
                  >
                    <span className="outline-hash">{'#'.repeat(item.level)}</span>
                    <span className="outline-text truncate">{item.text}</span>
                    <span className="outline-line">L{item.lineNumber}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================== 4. TEMPLATES PANEL ==================== */}
        {activeTab === 'templates' && (
          <div className="templates-panel">
            <div className="templates-intro">
              <span className="section-label">STARTER BLUEPRINTS</span>
              <p className="templates-sub">Click any template to instantly load a production-ready documentation draft into your editor.</p>
            </div>

            <div className="templates-list">
              {templatesList.map((tpl) => (
                <div key={tpl.id} className="template-card">
                  <div className="template-card-header">
                    <span className="template-card-title">{tpl.title}</span>
                    <span className="template-category-badge">{tpl.category}</span>
                  </div>
                  <p className="template-card-desc">{tpl.description}</p>
                  <div className="template-tags">
                    {tpl.tags.map(t => (
                      <span key={t} className="template-tag-pill">{t}</span>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="template-load-btn"
                    onClick={() => onLoadTemplate(tpl.content, tpl.title)}
                  >
                    <span className="material-symbols-outlined">bolt</span>
                    Load into Editor
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== 5. STUDIO TOOLS & BUILDERS PANEL ==================== */}
        {activeTab === 'tools' && (
          <div className="tools-panel">
            <div className="tools-intro">
              <span className="section-label">STUDIO TOOLS & BUILDERS</span>
              <p className="tools-sub">Visual designers for users who spend dedicated time improving their documentation with badges, architecture diagrams, data tables, and callouts.</p>
            </div>

            <div className="tools-grid-list">
              {studioToolsList.map((tool) => {
                const isOpen = openStudioTabs.includes(tool.id)
                const isActive = activeFile === tool.id

                return (
                  <div
                    key={tool.id}
                    className={`studio-tool-card ${isOpen ? 'is-open' : ''} ${isActive ? 'is-active' : ''}`}
                  >
                    <div className="tool-card-top">
                      <div
                        className="tool-card-icon-wrap"
                        style={{
                          backgroundColor: `${tool.color}18`,
                          borderColor: `${tool.color}50`
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ color: tool.color }}>
                          {tool.icon}
                        </span>
                      </div>
                      <div className="tool-card-info">
                        <div className="tool-card-title-row">
                          <span className="tool-card-title">{tool.title}</span>
                          {isOpen ? (
                            <span className="status-badge-open">In Tabs</span>
                          ) : (
                            <span className="status-badge-idle">Optional Tab</span>
                          )}
                        </div>
                        <span className="tool-card-id">{tool.id}</span>
                      </div>
                    </div>

                    <p className="tool-card-desc">{tool.description}</p>

                    <div className="tool-card-features">
                      {tool.features.map((feat, i) => (
                        <span key={i} className="tool-feat-pill">
                          <span className="material-symbols-outlined icon-xs">check</span>
                          {feat}
                        </span>
                      ))}
                    </div>

                    <div className="tool-card-actions">
                      {isOpen ? (
                        <>
                          <button
                            type="button"
                            className={`tool-action-btn primary ${isActive ? 'current' : ''}`}
                            onClick={() => onSelectFile(tool.id)}
                            title={`Switch to open ${tool.title} tab`}
                          >
                            <span className="material-symbols-outlined icon-xs">
                              {isActive ? 'visibility' : 'tab'}
                            </span>
                            {isActive ? 'Viewing Tab' : 'Switch to Tab'}
                          </button>
                          <button
                            type="button"
                            className="tool-action-btn remove-btn"
                            onClick={() => onCloseStudioTab(tool.id)}
                            title="Remove tab from top bar"
                          >
                            <span className="material-symbols-outlined icon-xs">close</span>
                            Remove
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          className="tool-action-btn primary"
                          onClick={() => onOpenStudioTab(tool.id)}
                          title="Add dedicated tab to top bar & open"
                        >
                          <span className="material-symbols-outlined icon-xs">add</span>
                          Add Tab & Open
                        </button>
                      )}

                      <button
                        type="button"
                        className="tool-action-btn quick-insert"
                        onClick={() => onInsertInstantSyntax(tool.instantSyntax)}
                        title="Insert instant template into active markdown buffer"
                      >
                        <span className="material-symbols-outlined icon-xs">bolt</span>
                        Quick Insert
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
