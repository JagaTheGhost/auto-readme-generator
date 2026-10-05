import React, { useState, useMemo } from 'react'

const TABLE_PRESETS = [
  {
    id: 'features',
    title: 'Feature Matrix',
    description: 'Feature name, description, and status overview.',
    headers: ['Feature', 'Description', 'Status'],
    alignments: ['left', 'left', 'center'],
    rows: [
      ['AST Repository Scanner', 'Deep-scans dependencies and languages automatically', '✅ Ready'],
      ['Shields.io Badge Studio', 'Interactive dynamic badge designer with live preview', '✅ Ready'],
      ['Mermaid Architecture', 'Live rendering of system flowcharts & pipelines', '✅ Ready'],
      ['AI Model Configurator', 'Supports Gemini 3.8, OpenAI GPT-4o, and Local Ollama', '⚡ Active']
    ]
  },
  {
    id: 'api-endpoints',
    title: 'REST API Endpoints',
    description: 'HTTP method, path, authentication requirement, and summary.',
    headers: ['Method', 'Endpoint', 'Auth', 'Description'],
    alignments: ['center', 'left', 'center', 'left'],
    rows: [
      ['`POST`', '`/api/generate-readme`', 'Bearer Token', 'Synthesizes full documentation suite from inputs'],
      ['`POST`', '`/api/scan-repo`', 'None', 'Deep-scans GitHub repository tree and package files'],
      ['`GET`', '`/api/health`', 'None', 'Returns system status and LLM connectivity']
    ]
  },
  {
    id: 'env-vars',
    title: 'Environment Variables',
    description: 'Configuration options, defaults, and necessity.',
    headers: ['Variable', 'Type', 'Default', 'Description'],
    alignments: ['left', 'center', 'center', 'left'],
    rows: [
      ['`GEMINI_API_KEY`', 'String', 'None', 'Google AI Studio API key for Gemini 3.8 models'],
      ['`PORT`', 'Number', '`8000`', 'Port for the FastAPI backend service'],
      ['`DEBUG`', 'Boolean', '`false`', 'Enable verbose server logging and tracebacks']
    ]
  },
  {
    id: 'tech-stack',
    title: 'Tech Stack Specifications',
    description: 'Layer, technology, minimum version, and architectural role.',
    headers: ['Architecture Layer', 'Technology', 'Version', 'Role'],
    alignments: ['left', 'left', 'center', 'left'],
    rows: [
      ['Frontend', 'React 19 + Vite', '5.4+', 'High-density technical IDE user interface'],
      ['Backend', 'FastAPI + Python', '3.11+', 'High-throughput asynchronous REST gateway'],
      ['Diagram Engine', 'Mermaid.js', '10.9+', 'Live vector SVG architecture visualization'],
      ['Markdown Pipeline', 'Markdown-it / Prism', 'Latest', 'Real-time AST parsing and live preview rendering']
    ]
  }
]

export default function TableStudioTab({
  onInsertTable,
  onBackToReadme
}) {
  const [headers, setHeaders] = useState(TABLE_PRESETS[0].headers)
  const [alignments, setAlignments] = useState(TABLE_PRESETS[0].alignments)
  const [rows, setRows] = useState(TABLE_PRESETS[0].rows)
  const [copied, setCopied] = useState(false)

  // Alignments helper
  const cycleAlignment = (colIndex) => {
    setAlignments((prev) => {
      const next = [...prev]
      const current = next[colIndex] || 'left'
      if (current === 'left') next[colIndex] = 'center'
      else if (current === 'center') next[colIndex] = 'right'
      else next[colIndex] = 'left'
      return next
    })
  }

  // Row and Column operations
  const handleAddColumn = () => {
    const newColNum = headers.length + 1
    setHeaders((prev) => [...prev, `Column ${newColNum}`])
    setAlignments((prev) => [...prev, 'left'])
    setRows((prev) => prev.map((row) => [...row, '']))
  }

  const handleRemoveColumn = (colIndex) => {
    if (headers.length <= 1) return
    setHeaders((prev) => prev.filter((_, idx) => idx !== colIndex))
    setAlignments((prev) => prev.filter((_, idx) => idx !== colIndex))
    setRows((prev) => prev.map((row) => row.filter((_, idx) => idx !== colIndex)))
  }

  const handleAddRow = () => {
    const emptyRow = new Array(headers.length).fill('')
    setRows((prev) => [...prev, emptyRow])
  }

  const handleRemoveRow = (rowIndex) => {
    if (rows.length <= 1) return
    setRows((prev) => prev.filter((_, idx) => idx !== rowIndex))
  }

  const handleHeaderChange = (idx, value) => {
    setHeaders((prev) => {
      const next = [...prev]
      next[idx] = value
      return next
    })
  }

  const handleCellChange = (rowIndex, colIndex, value) => {
    setRows((prev) => {
      const next = [...prev]
      next[rowIndex] = [...next[rowIndex]]
      next[rowIndex][colIndex] = value
      return next
    })
  }

  const handleApplyPreset = (preset) => {
    const formCol = document.querySelector('.studio-form-column')
    const savedTop = formCol ? formCol.scrollTop : 0
    setHeaders(preset.headers)
    setAlignments(preset.alignments)
    setRows(preset.rows)
    if (formCol) {
      window.requestAnimationFrame(() => {
        formCol.scrollTop = savedTop
      })
      setTimeout(() => {
        if (formCol) formCol.scrollTop = savedTop
      }, 50)
    }
  }

  // Generate markdown table string
  const markdownTable = useMemo(() => {
    const formatAlign = (align) => {
      if (align === 'center') return ':---:'
      if (align === 'right') return '---:'
      return ':---'
    }

    const headerLine = `| ${headers.map((h) => h || ' ').join(' | ')} |`
    const dividerLine = `| ${alignments.map((a) => formatAlign(a)).join(' | ')} |`
    const bodyLines = rows.map(
      (row) => `| ${headers.map((_, colIdx) => row[colIdx] || '').join(' | ')} |`
    )

    return `${headerLine}\n${dividerLine}\n${bodyLines.join('\n')}\n`
  }, [headers, alignments, rows])

  const handleCopy = () => {
    navigator.clipboard.writeText(markdownTable)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleInsert = () => {
    onInsertTable(markdownTable)
  }

  return (
    <div className="studio-tab-view select-none">
      {/* Top Control Bar */}
      <div className="studio-top-bar">
        <div className="studio-bar-left">
          <div className="studio-badge-halo">
            <span className="material-symbols-outlined text-warning">table_chart</span>
          </div>
          <div>
            <div className="studio-title-row">
              <h2 className="studio-title">Visual Markdown Table Studio</h2>
              <span className="studio-tag">Interactive Grid Builder</span>
            </div>
            <p className="studio-subtitle">
              Construct high-contrast technical tables with custom alignments, dynamic cells, and auto-formatting.
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
            <span>{copied ? 'Copied!' : 'Copy Table'}</span>
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
        {/* Left Column: Visual Grid Editor & Presets */}
        <div className="studio-form-column custom-scrollbar">
          {/* Quick Presets Bar */}
          <div className="studio-section">
            <label className="studio-section-label">Table Presets</label>
            <div className="studio-presets-row">
              {TABLE_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className="studio-preset-pill"
                  onClick={() => handleApplyPreset(p)}
                >
                  <span>{p.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Grid Dimension Controls */}
          <div className="studio-section">
            <div className="table-controls-bar">
              <span className="dimension-stats">
                {headers.length} columns × {rows.length} rows
              </span>
              <div className="table-btn-group">
                <button
                  type="button"
                  className="table-action-pill"
                  onClick={handleAddColumn}
                  title="Add new column to the right"
                >
                  <span className="material-symbols-outlined icon-xs">view_column</span>
                  <span>+ Column</span>
                </button>
                <button
                  type="button"
                  className="table-action-pill"
                  onClick={handleAddRow}
                  title="Add new row at the bottom"
                >
                  <span className="material-symbols-outlined icon-xs">table_rows</span>
                  <span>+ Row</span>
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Editable Visual Table */}
          <div className="studio-section table-grid-container custom-scrollbar">
            <table className="interactive-table-editor">
              <thead>
                <tr>
                  <th className="row-number-header">#</th>
                  {headers.map((header, colIdx) => (
                    <th key={colIdx} className="table-header-cell">
                      <div className="header-cell-inner">
                        <input
                          type="text"
                          className="table-header-input"
                          value={header}
                          onChange={(e) => handleHeaderChange(colIdx, e.target.value)}
                          placeholder={`Col ${colIdx + 1}`}
                        />
                        <button
                          type="button"
                          className="align-cycle-btn"
                          onClick={() => cycleAlignment(colIdx)}
                          title={`Alignment: ${alignments[colIdx] || 'left'} (Click to cycle)`}
                        >
                          <span className="material-symbols-outlined icon-xs">
                            {alignments[colIdx] === 'center'
                              ? 'format_align_center'
                              : alignments[colIdx] === 'right'
                              ? 'format_align_right'
                              : 'format_align_left'}
                          </span>
                        </button>
                        {headers.length > 1 && (
                          <button
                            type="button"
                            className="col-delete-btn"
                            onClick={() => handleRemoveColumn(colIdx)}
                            title="Remove this column"
                          >
                            <span className="material-symbols-outlined icon-xs">close</span>
                          </button>
                        )}
                      </div>
                    </th>
                  ))}
                  <th className="row-action-header"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIdx) => (
                  <tr key={rowIdx}>
                    <td className="row-number-cell">{rowIdx + 1}</td>
                    {headers.map((_, colIdx) => (
                      <td key={colIdx} className="table-data-cell">
                        <input
                          type="text"
                          className="table-cell-input"
                          value={row[colIdx] || ''}
                          onChange={(e) => handleCellChange(rowIdx, colIdx, e.target.value)}
                          placeholder="Cell text..."
                        />
                      </td>
                    ))}
                    <td className="row-delete-cell">
                      {rows.length > 1 && (
                        <button
                          type="button"
                          className="row-delete-btn"
                          onClick={() => handleRemoveRow(rowIdx)}
                          title="Remove this row"
                        >
                          <span className="material-symbols-outlined icon-xs">delete</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Live Render & Markdown Output */}
        <div className="studio-preview-column custom-scrollbar">
          {/* Live Preview Table Card */}
          <div className="studio-card">
            <div className="studio-card-header">
              <span className="studio-card-title">Live Markdown Render</span>
              <span className="studio-card-tag">GitHub Style</span>
            </div>
            <div className="table-render-viewport custom-scrollbar">
              <table className="rendered-markdown-table">
                <thead>
                  <tr>
                    {headers.map((header, idx) => (
                      <th
                        key={idx}
                        style={{ textAlign: alignments[idx] || 'left' }}
                      >
                        {header || `Column ${idx + 1}`}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rIdx) => (
                    <tr key={rIdx}>
                      {headers.map((_, cIdx) => (
                        <td
                          key={cIdx}
                          style={{ textAlign: alignments[cIdx] || 'left' }}
                        >
                          {row[cIdx] || '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
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
              <code>{markdownTable}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
