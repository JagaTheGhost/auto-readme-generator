import React from 'react'

export default function StatusBar({
  cursorPosition = { line: 1, col: 1 },
  charCount = 0,
  wordCount = 0,
  loading = false,
  error = ''
}) {
  const readMinutes = Math.max(1, Math.ceil(wordCount / 200))

  return (
    <footer className="ide-status-bar select-none">
      {/* Left Cluster */}
      <div className="status-cluster-left">
        {/* Git Branch */}
        <div className="status-item git-branch" title="Git Branch">
          <span className="material-symbols-outlined status-icon">fork_right</span>
          <span>main*</span>
        </div>

        {/* Diagnostics (Errors / Warnings) */}
        <div className="status-item diagnostics" title="Editor Diagnostics">
          <span className={`diag-count ${error ? 'has-error' : ''}`}>
            <span className="material-symbols-outlined status-icon">cancel</span>
            {error ? 1 : 0}
          </span>
          <span className="diag-count">
            <span className="material-symbols-outlined status-icon text-amber">warning</span>
            0
          </span>
        </div>

        {/* Position & Typography details */}
        <div className="status-item cursor-pos hide-tablet" title="Cursor Line and Column">
          <span>Ln {cursorPosition.line}, Col {cursorPosition.col}</span>
        </div>

        <div className="status-item hide-mobile" title="Indentation">
          <span>Spaces: 2</span>
        </div>

        <div className="status-item hide-mobile" title="Encoding">
          <span>UTF-8</span>
        </div>

        <div className="status-item format-badge" title="Language Mode">
          <span className="lang-dot"></span>
          <span>Markdown</span>
        </div>

        <div className="status-item stats-badge hide-tablet" title="Document Word Count">
          <span>{wordCount.toLocaleString()} words</span>
        </div>
      </div>

      {/* Center Beacon: Engine Status */}
      <div className="status-cluster-center">
        <div className="ai-beacon-pill" title="Documentation Engine Ready">
          <span className={`beacon-dot ${loading ? 'generating' : 'ready'}`}></span>
          <span className="beacon-text">
            {loading ? 'Synthesizing Documentation...' : 'Markdown Engine Ready'}
          </span>
        </div>
      </div>

      {/* Right Cluster */}
      <div className="status-cluster-right">
        {/* Estimated Reading Time */}
        <div className="status-item hide-mobile" title="Estimated Reading Time">
          <span>⏱️ ~{readMinutes} min read</span>
        </div>

        {/* Character Count */}
        <div className="status-item hide-tablet" title="Total Characters">
          <span>{charCount.toLocaleString()} chars</span>
        </div>

        {/* Auto-save */}
        <div className="status-item sync-status" title="Local state auto-saved">
          <span className="material-symbols-outlined status-icon text-emerald">check_circle</span>
          <span className="hide-mobile">Auto-saved</span>
        </div>
      </div>
    </footer>
  )
}
