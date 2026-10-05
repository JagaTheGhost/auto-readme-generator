import React, { useState, useRef, useEffect } from 'react'

export default function TopMenuBar({
  activeFile,
  repoUrl,
  sidebarCollapsed,
  onToggleSidebar,
  onOpenCommandPalette,
  onGenerate,
  onCopy,
  onDownload,
  onDownloadHtml,
  isDocPack,
  loading,
  hasGenerated,
  themeMode,
  setThemeMode
}) {
  const [exportOpen, setExportOpen] = useState(false)
  const exportRef = useRef(null)

  // Close export dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (exportRef.current && !exportRef.current.contains(e.target)) {
        setExportOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Extract repo short name from URL if available
  const repoName = repoUrl
    ? repoUrl.replace(/^https?:\/\/github\.com\//, '').replace(/\/$/, '')
    : 'auto-readme-generator'

  return (
    <header className="ide-top-bar select-none">
      {/* Left: Window Dots + App Logo + Project Breadcrumb */}
      <div className="top-bar-left">

        {/* App Logo */}
        <div className="app-brand">
          <span className="material-symbols-outlined brand-icon">auto_awesome</span>
          <span className="brand-name">README Studio</span>
          <span className="ide-tag">v1.0</span>
        </div>

        <div className="top-divider"></div>

        {/* Project Breadcrumb */}
        <div className="breadcrumb-wrapper">
          <span className="breadcrumb-repo truncate" title={repoName}>
            {repoName}
          </span>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-file">
            <span className="material-symbols-outlined file-ico">description</span>
            {activeFile}
          </span>
        </div>
      </div>

      {/* Center: Command Palette Trigger */}
      <div className="top-bar-center">
        <button
          type="button"
          className="command-palette-btn"
          onClick={onOpenCommandPalette}
          title="Search commands, templates, or actions (Ctrl+K / ⌘K)"
        >
          <div className="command-search-label">
            <span className="material-symbols-outlined search-icon">search</span>
            <span>⌘K / Ctrl+K to search files, templates, or commands...</span>
          </div>
          <kbd className="cmd-kbd">⌘K</kbd>
        </button>
      </div>

      {/* Right: Quick Action Controls */}
      <div className="top-bar-right">
        {/* Generate Button with energetic glow */}
        <button
          type="button"
          className={`btn-top-generate ${loading ? 'loading' : ''}`}
          onClick={onGenerate}
          disabled={loading}
          title="Generate or regenerate documentation"
        >
          <span className="material-symbols-outlined icon-sparkle">
            {loading ? 'sync' : 'auto_awesome'}
          </span>
          <span>{loading ? 'Generating...' : (hasGenerated ? 'Regenerate' : 'Generate Documentation')}</span>
        </button>

        {/* Copy Button */}
        <button
          type="button"
          className="btn-top-ghost"
          onClick={onCopy}
          title={`Copy ${activeFile} markdown to clipboard`}
        >
          <span className="material-symbols-outlined icon-small">content_copy</span>
          <span className="hide-mobile">Copy</span>
        </button>

        {/* Export Dropdown */}
        <div className="export-dropdown-wrapper" ref={exportRef}>
          <button
            type="button"
            className="btn-top-secondary"
            onClick={() => setExportOpen((prev) => !prev)}
            title="Export documentation options"
          >
            <span className="material-symbols-outlined icon-small">file_download</span>
            <span className="hide-mobile">Export</span>
            <span className="material-symbols-outlined dropdown-arrow">
              {exportOpen ? 'arrow_drop_up' : 'arrow_drop_down'}
            </span>
          </button>

          {exportOpen && (
            <div className="export-menu">
              <div className="export-menu-header">Export Options</div>
              <button
                type="button"
                className="export-menu-item"
                onClick={() => {
                  onDownload()
                  setExportOpen(false)
                }}
              >
                <span className="material-symbols-outlined">description</span>
                <div>
                  <div className="item-title">{isDocPack ? 'Download Suite (.zip)' : `Save ${activeFile}`}</div>
                  <div className="item-desc">{isDocPack ? 'All generated documentation files' : 'Raw Markdown file'}</div>
                </div>
              </button>

              <button
                type="button"
                className="export-menu-item"
                onClick={() => {
                  onDownloadHtml()
                  setExportOpen(false)
                }}
              >
                <span className="material-symbols-outlined">html</span>
                <div>
                  <div className="item-title">Export as Standalone HTML</div>
                  <div className="item-desc">GitHub-styled ready for browser preview</div>
                </div>
              </button>
            </div>
          )}
        </div>

        <div className="top-divider"></div>

        {/* Theme Settings Toggle */}
        <button
          type="button"
          className="btn-top-icon"
          onClick={() => setThemeMode(prev => prev === 'dark' ? 'slate' : prev === 'slate' ? 'light' : 'dark')}
          title={`Theme: ${themeMode} (click to toggle)`}
        >
          <span className="material-symbols-outlined">
            {themeMode === 'light' ? 'light_mode' : themeMode === 'slate' ? 'palette' : 'dark_mode'}
          </span>
        </button>

        {/* Primary Sidebar Toggle */}
        <button
          type="button"
          className={`btn-top-icon ${sidebarCollapsed ? 'sidebar-closed' : 'sidebar-open'}`}
          onClick={onToggleSidebar}
          title={sidebarCollapsed ? "Expand Primary Sidebar (Ctrl+B)" : "Collapse Primary Sidebar (Ctrl+B)"}
        >
          <span className="material-symbols-outlined">
            {sidebarCollapsed ? 'dock_to_left' : 'view_sidebar'}
          </span>
        </button>
      </div>
    </header>
  )
}
