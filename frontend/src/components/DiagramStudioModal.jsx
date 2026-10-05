import React, { useState, useMemo } from 'react'
import MermaidRenderer from './MermaidRenderer'

const DIAGRAM_CATEGORIES = [
  { id: 'architecture', label: 'Architecture & Cloud', icon: 'schema' },
  { id: 'cicd', label: 'CI/CD Pipelines', icon: 'rocket_launch' },
  { id: 'sequence', label: 'Sequence & Auth', icon: 'sync_alt' },
  { id: 'git', label: 'Git Flow & Branching', icon: 'fork_left' },
  { id: 'database', label: 'Database & ER', icon: 'database' },
  { id: 'statemachine', label: 'State Machine', icon: 'linear_scale' }
]

const PRESET_TEMPLATES = [
  // --- ARCHITECTURE ---
  {
    id: 'arch-microservices',
    category: 'architecture',
    title: 'Microservices & API Gateway',
    description: 'Envoy Gateway, Auth/Core microservices, Redis cache, PostgreSQL DB, and Kafka bus.',
    badge: 'Flowchart TD',
    code: `graph TD
  Client([Web & Mobile Client]) -->|HTTPS / WSS| APIGW[API Gateway :: Envoy]

  subgraph Core Cluster [Microservices Mesh]
    APIGW --> AuthSvc[Auth & Policy Svc]
    APIGW --> AppSvc[Core Application API]
    AppSvc --> Cache[(Redis Cache Cluster)]
    AppSvc --> DB[(PostgreSQL Primary)]
  end

  AppSvc -->|Async Events| Broker{{Kafka Event Bus}}
  Broker --> Worker[Background Telemetry Worker]`
  },
  {
    id: 'arch-fullstack',
    category: 'architecture',
    title: 'Modern Full-Stack Web App',
    description: 'Cloudflare CDN, React Vite SPA, FastAPI REST endpoints, and database connection.',
    badge: 'Flowchart LR',
    code: `graph LR
  User((End User)) --> CDN[Cloudflare CDN / Edge]
  CDN --> SPA[React / Vite Frontend]
  SPA -->|REST / JSON| API[FastAPI Backend Engine]
  API --> Auth[OAuth 2.0 / Auth Provider]
  API --> DB[(PostgreSQL Database)]
  API --> Cache[(Redis KV Cache)]`
  },
  {
    id: 'arch-serverless',
    category: 'architecture',
    title: 'Serverless Cloud Architecture',
    description: 'Route 53, CloudFront CDN, S3, API Gateway, AWS Lambda workers, and DynamoDB.',
    badge: 'Flowchart TD',
    code: `graph TD
  DNS[Route 53 DNS] --> CF[CloudFront CDN]
  CF --> S3[Static S3 Asset Bucket]
  CF --> APIGW[Amazon API Gateway]

  subgraph Serverless Compute
    APIGW --> LambdaAuth[Auth Authorizer Lambda]
    APIGW --> LambdaApp[Core API Lambda]
    LambdaApp --> Dynamo[(DynamoDB NoSQL)]
    LambdaApp --> SQS[SQS Message Queue]
    SQS --> LambdaWorker[Async Batch Worker]
  end`
  },

  // --- CI/CD PIPELINES ---
  {
    id: 'cicd-github-actions',
    category: 'cicd',
    title: 'GitHub Actions Delivery Pipeline',
    description: 'Git Push/PR -> Lint & Security -> Pytest/Jest -> Docker Build -> Prod Deploy.',
    badge: 'Pipeline LR',
    code: `graph LR
  Push[Git Push / PR Open] --> Lint[Linter & Static Analysis]
  Lint --> Test[Unit & Integration Tests]
  Test --> Scan[Security Vulnerability Scan]
  Scan --> Build[Multi-Stage Docker Build]
  Build --> Reg[Container Registry :: GHCR]
  Reg --> Deploy[Kubernetes Production Cluster]`
  },
  {
    id: 'cicd-release-workflow',
    category: 'cicd',
    title: 'Automated SemVer Release Pipeline',
    description: 'Tag creation, changelog compilation, multi-platform artifact builds, and distribution.',
    badge: 'Pipeline TD',
    code: `graph TD
  Tag[Git Tag Trigger v*.*.*] --> Release[Trigger GitHub Release]
  Release --> Changelog[Compile Automated Changelog]
  Release --> Binaries[Build Cross-Platform Binaries]

  subgraph Distribution Channels
    Binaries --> PyPI[Publish to PyPI / NPM]
    Binaries --> GHAssets[Attach Assets to GitHub Release]
    Binaries --> DockerHub[Push Docker Multi-Arch Image]
  end`
  },

  // --- SEQUENCE & AUTH ---
  {
    id: 'seq-jwt-auth',
    category: 'sequence',
    title: 'JWT Authentication Handshake',
    description: 'Step-by-step token generation, validation, and session establishment.',
    badge: 'Sequence',
    code: `sequenceDiagram
  autonumber
  actor User
  participant Client as Web Client
  participant API as API Gateway
  participant Auth as Auth Service
  participant DB as PostgreSQL DB

  User->>Client: Enter Credentials
  Client->>API: POST /api/auth/login
  API->>Auth: Verify Credentials
  Auth->>DB: Query User & Password Hash
  DB-->>Auth: Record Found (Valid)
  Auth-->>API: Issue JWT Access & Refresh Token
  API-->>Client: 200 OK (Set-Cookie / Bearer Token)
  Client-->>User: Redirect to Studio Dashboard`
  },
  {
    id: 'seq-async-task',
    category: 'sequence',
    title: 'Asynchronous Job Processing',
    description: 'Decoupled request dispatching, queue polling, and worker completion.',
    badge: 'Sequence',
    code: `sequenceDiagram
  autonumber
  actor Dev as Developer
  participant Frontend as React IDE
  participant Backend as FastAPI
  participant Queue as Redis Queue
  participant Worker as Celery Worker

  Dev->>Frontend: Click "Generate README"
  Frontend->>Backend: POST /api/generate-readme
  Backend->>Queue: Enqueue Task Payload
  Backend-->>Frontend: 202 Accepted (Task ID: #4092)
  Queue->>Worker: Dispatch Job
  Worker->>Worker: LLM Synthesis & AST Parsing
  Worker-->>Queue: Save Generated Markdown
  Frontend->>Backend: GET /api/tasks/#4092 (Poll)
  Backend-->>Frontend: 200 OK (Completed Markdown)
  Frontend-->>Dev: Display in Editor & Preview`
  },

  // --- GIT GRAPH ---
  {
    id: 'git-flow',
    category: 'git',
    title: 'Git Flow Branching Model',
    description: 'Production main, development branch, feature branches, and tagged releases.',
    badge: 'GitGraph',
    code: `gitGraph
  commit id: "init-v1.0"
  branch develop
  checkout develop
  commit id: "dev-setup"
  branch feature/ast-scanner
  checkout feature/ast-scanner
  commit id: "add-scanner"
  commit id: "add-tests"
  checkout develop
  merge feature/ast-scanner
  checkout main
  merge develop tag: "v1.1.0"`
  },
  {
    id: 'git-trunk',
    category: 'git',
    title: 'Trunk-Based Delivery Model',
    description: 'Single main branch with short-lived feature spikes and immediate merge.',
    badge: 'GitGraph',
    code: `gitGraph
  commit id: "feat-base"
  branch quick-fix
  checkout quick-fix
  commit id: "hotfix-badge"
  checkout main
  merge quick-fix
  commit id: "feat-preview"
  commit id: "release-v1.2"`
  },

  // --- DATABASE & ER ---
  {
    id: 'er-doc-system',
    category: 'database',
    title: 'Documentation Studio Entity Schema',
    description: 'User, Workspace, Project, Document, Badge, and Architecture Diagram tables.',
    badge: 'ER Model',
    code: `erDiagram
  USER ||--o{ WORKSPACE : owns
  WORKSPACE ||--o{ PROJECT : manages
  PROJECT ||--o{ DOCUMENT : contains
  DOCUMENT ||--o{ BADGE : embeds
  DOCUMENT ||--o{ DIAGRAM : visualizes

  USER {
    string id PK
    string email
    string hashed_password
    datetime created_at
  }
  DOCUMENT {
    string id PK
    string title
    text markdown_content
    string status
  }`
  },

  // --- STATE MACHINE ---
  {
    id: 'state-doc-lifecycle',
    category: 'statemachine',
    title: 'Document Generation Lifecycle',
    description: 'States from initial draft to scanning, AI synthesis, review, and export.',
    badge: 'State Diagram',
    code: `stateDiagram-v2
  [*] --> Draft
  Draft --> ASTScanning : Enter Repo URL & Click Scan
  ASTScanning --> AISynthesizing : Parse Dependencies & Metadata
  AISynthesizing --> ReviewReady : AI Generates Complete README
  ReviewReady --> ManualEditing : User Refines Markdown in Editor
  ManualEditing --> ReviewReady : Live Preview Sync
  ReviewReady --> Exported : Download Zip / Copy to Clipboard
  Exported --> [*]`
  }
]

export default function DiagramStudioModal({
  isOpen,
  onClose,
  onInsertDiagram
}) {
  const [activeCategory, setActiveCategory] = useState('architecture')
  const [selectedPresetId, setSelectedPresetId] = useState('arch-microservices')
  const [code, setCode] = useState(PRESET_TEMPLATES[0].code)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [copied, setCopied] = useState(false)

  // Filter templates by selected category
  const filteredTemplates = useMemo(() => {
    return PRESET_TEMPLATES.filter((tmpl) => tmpl.category === activeCategory)
  }, [activeCategory])

  // Count lines and estimated nodes
  const stats = useMemo(() => {
    const lines = code.split('\n').length
    const nodeMatches = code.match(/\[.*?\]|\(.*?\)|{.*?}|\[\(.*?\)\]/g) || []
    return {
      lines,
      nodes: nodeMatches.length
    }
  }, [code])

  // Toggle orientation if diagram is flowchart
  const canToggleOrientation = useMemo(() => {
    return /^(graph|flowchart)\s+(TD|TB|LR|RL)/m.test(code)
  }, [code])

  const handleToggleOrientation = () => {
    if (/^(graph|flowchart)\s+(TD|TB)/m.test(code)) {
      setCode((prev) => prev.replace(/^(graph|flowchart)\s+(TD|TB)/m, '$1 LR'))
    } else if (/^(graph|flowchart)\s+LR/m.test(code)) {
      setCode((prev) => prev.replace(/^(graph|flowchart)\s+LR/m, '$1 TD'))
    }
  }

  // Insert syntax helper into code
  const handleInsertHelper = (snippet) => {
    setCode((prev) => {
      const trimmed = prev.trimEnd()
      return `${trimmed}\n  ${snippet}`
    })
  }

  // Apply preset
  const handleApplyPreset = (preset) => {
    setSelectedPresetId(preset.id)
    setCode(preset.code)
  }

  // Switch category
  const handleSelectCategory = (catId) => {
    setActiveCategory(catId)
    const firstInCat = PRESET_TEMPLATES.find((p) => p.category === catId)
    if (firstInCat) {
      setSelectedPresetId(firstInCat.id)
      setCode(firstInCat.code)
    }
  }

  // Copy raw mermaid block
  const markdownBlock = `\`\`\`mermaid\n${code.trim()}\n\`\`\``

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(markdownBlock)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Insert into document
  const handleInsert = () => {
    if (!code.trim()) return
    onInsertDiagram(markdownBlock)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="ide-modal-backdrop" onClick={onClose}>
      <div
        className="diagram-modal-dialog select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="diagram-modal-header">
          <div className="diagram-modal-title-group">
            <div className="diagram-icon-halo">
              <span className="material-symbols-outlined text-primary">schema</span>
            </div>
            <div>
              <div className="diagram-title-row">
                <h2 className="diagram-modal-title">Mermaid.js Architecture Studio</h2>
                <span className="diagram-version-badge">Mermaid v10.9 · Live AST</span>
              </div>
              <p className="diagram-modal-subtitle">
                Visually configure architecture flowcharts, CI/CD pipelines, sequence handshakes, and Git graphs.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="diagram-modal-close-btn"
            onClick={onClose}
            title="Close (Esc)"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Category Navigation Bar */}
        <div className="diagram-category-bar">
          {DIAGRAM_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`diagram-cat-btn ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => handleSelectCategory(cat.id)}
            >
              <span className="material-symbols-outlined icon-xs">{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Main 2-Column Studio Grid */}
        <div className="diagram-studio-body">
          {/* LEFT COLUMN: Presets Rack, Syntax Helpers & Code Editor */}
          <div className="diagram-editor-column custom-scrollbar">
            {/* Template Presets Cards */}
            <div className="diagram-section">
              <label className="diagram-section-label">Architecture Presets</label>
              <div className="diagram-preset-list">
                {filteredTemplates.map((preset) => (
                  <div
                    key={preset.id}
                    className={`diagram-preset-card ${selectedPresetId === preset.id ? 'selected' : ''}`}
                    onClick={() => handleApplyPreset(preset)}
                  >
                    <div className="preset-card-top">
                      <span className="preset-card-title">{preset.title}</span>
                      <span className="preset-type-tag">{preset.badge}</span>
                    </div>
                    <p className="preset-card-desc">{preset.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Syntax Helpers Toolbar */}
            <div className="diagram-section">
              <div className="helpers-header-row">
                <label className="diagram-section-label">Syntax Quick Helpers</label>
                <span className="helper-hint">Click to append to diagram</span>
              </div>
              <div className="syntax-helpers-rack">
                <button
                  type="button"
                  className="syntax-pill"
                  onClick={() => handleInsertHelper('NodeA[Service Name]')}
                  title="Add Rectangular Box Node"
                >
                  <span className="pill-prefix">+</span> [Node]
                </button>
                <button
                  type="button"
                  className="syntax-pill"
                  onClick={() => handleInsertHelper('User([Client / User])')}
                  title="Add Rounded Pill Node"
                >
                  <span className="pill-prefix">+</span> ([Pill])
                </button>
                <button
                  type="button"
                  className="syntax-pill"
                  onClick={() => handleInsertHelper('DB[(PostgreSQL Database)]')}
                  title="Add Cylindrical Database Node"
                >
                  <span className="pill-prefix">+</span> [(Database)]
                </button>
                <button
                  type="button"
                  className="syntax-pill"
                  onClick={() => handleInsertHelper('Check{Is Valid?}')}
                  title="Add Diamond Decision Node"
                >
                  <span className="pill-prefix">+</span> {'{Decision}'}
                </button>
                <button
                  type="button"
                  className="syntax-pill"
                  onClick={() => handleInsertHelper('A --> B')}
                  title="Add Directed Arrow"
                >
                  <span className="pill-prefix">+</span> --&gt;
                </button>
                <button
                  type="button"
                  className="syntax-pill"
                  onClick={() => handleInsertHelper('A -->|HTTPS / JSON| B')}
                  title="Add Labeled Arrow Connection"
                >
                  <span className="pill-prefix">+</span> --&gt;|Label|
                </button>
                <button
                  type="button"
                  className="syntax-pill"
                  onClick={() => handleInsertHelper('A -.->|Async| B')}
                  title="Add Dotted Arrow"
                >
                  <span className="pill-prefix">+</span> -.-&gt;
                </button>
                <button
                  type="button"
                  className="syntax-pill"
                  onClick={() => handleInsertHelper('subgraph Cluster [Cluster Name]\n    NodeX[Worker Node]\n  end')}
                  title="Add Subgraph Enclosure"
                >
                  <span className="pill-prefix">+</span> Subgraph
                </button>
              </div>
            </div>

            {/* Mermaid Source Code Editor */}
            <div className="diagram-section editor-section">
              <div className="code-editor-header">
                <div className="file-indicator">
                  <span className="material-symbols-outlined icon-xs text-secondary">code</span>
                  <span className="file-name">architecture.mmd</span>
                </div>
                <div className="code-stats">
                  <span>{stats.lines} lines</span>
                  <span className="stat-separator">•</span>
                  <span>{stats.nodes} nodes</span>
                </div>
              </div>
              <textarea
                className="diagram-code-textarea custom-scrollbar"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter Mermaid.js diagram source code..."
                rows={12}
                spellCheck={false}
              />
            </div>
          </div>

          {/* RIGHT COLUMN: Live SVG Diagram Canvas & Actions */}
          <div className="diagram-preview-column">
            {/* Live Canvas Box */}
            <div className="diagram-canvas-card">
              <div className="canvas-header-bar">
                <div className="canvas-status-tag">
                  <span className="live-dot"></span>
                  <span>Live Rendered Canvas</span>
                </div>
                <div className="canvas-controls-group">
                  {canToggleOrientation && (
                    <button
                      type="button"
                      className="canvas-hud-btn"
                      onClick={handleToggleOrientation}
                      title="Toggle Orientation (TD ↔ LR)"
                    >
                      <span className="material-symbols-outlined icon-xs">rotate_right</span>
                      <span>Orientation</span>
                    </button>
                  )}
                  <button
                    type="button"
                    className="canvas-hud-btn"
                    onClick={() => setZoomLevel((z) => Math.max(50, z - 10))}
                    title="Zoom Out"
                  >
                    <span className="material-symbols-outlined icon-xs">remove</span>
                  </button>
                  <span className="zoom-readout">{zoomLevel}%</span>
                  <button
                    type="button"
                    className="canvas-hud-btn"
                    onClick={() => setZoomLevel((z) => Math.min(150, z + 10))}
                    title="Zoom In"
                  >
                    <span className="material-symbols-outlined icon-xs">add</span>
                  </button>
                  <button
                    type="button"
                    className="canvas-hud-btn"
                    onClick={() => setZoomLevel(100)}
                    title="Reset Zoom"
                  >
                    <span className="material-symbols-outlined icon-xs">restart_alt</span>
                  </button>
                </div>
              </div>

              {/* Render Area */}
              <div className="diagram-svg-viewport custom-scrollbar">
                <div
                  className="diagram-scale-container"
                  style={{
                    transform: `scale(${zoomLevel / 100})`,
                    transformOrigin: 'top center'
                  }}
                >
                  <MermaidRenderer chart={code} />
                </div>
              </div>
            </div>

            {/* Markdown Syntax Code Snippet */}
            <div className="diagram-snippet-card">
              <div className="snippet-header">
                <span className="snippet-title">Generated Markdown Code Block</span>
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
              <pre className="snippet-pre custom-scrollbar">
                <code>{markdownBlock}</code>
              </pre>
            </div>

            {/* Action Tray */}
            <div className="diagram-actions-tray">
              <button
                type="button"
                className="btn-diagram-insert"
                onClick={handleInsert}
              >
                <span className="material-symbols-outlined">add_circle</span>
                <span>Insert into README</span>
              </button>
              <button
                type="button"
                className="btn-diagram-secondary"
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
