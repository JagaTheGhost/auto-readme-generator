import React, { useState, useRef, useEffect } from 'react'

const STUDIO_TABS_CONFIG = {
  'badges.studio': {
    id: 'badges.studio',
    label: 'Shields.io Badges',
    icon: 'shield',
    colorClass: 'studio-badge-tab',
    iconColor: '#38bdf8'
  },
  'diagrams.studio': {
    id: 'diagrams.studio',
    label: 'Mermaid Diagrams',
    icon: 'schema',
    colorClass: 'studio-diagram-tab',
    iconColor: '#6366f1'
  },
  'tables.studio': {
    id: 'tables.studio',
    label: 'Table Designer',
    icon: 'table_chart',
    colorClass: 'studio-table-tab',
    iconColor: '#f59e0b'
  },
  'snippets.studio': {
    id: 'snippets.studio',
    label: 'Code & Callouts',
    icon: 'code_blocks',
    colorClass: 'studio-snippet-tab',
    iconColor: '#10b981'
  }
}

export default function TabBar({
  files,
  activeFile,
  onSelectFile,
  onCloseFile,
  onCreateFile,
  openStudioTabs = [],
  onOpenStudioTab = () => {},
  onCloseStudioTab = () => {},
  onOpenToolsDrawer = () => {},
  viewMode,
  setViewMode,
  zoomLevel,
  setZoomLevel,
  isZenMode,
  setIsZenMode,
  orientation,
  setOrientation
}) {
  const fileKeys = Object.keys(files)
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false)
  const toolsDropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (toolsDropdownRef.current && !toolsDropdownRef.current.contains(e.target)) {
        setToolsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleZoomToggle = () => {
    if (zoomLevel === 100) setZoomLevel(115)
    else if (zoomLevel === 115) setZoomLevel(90)
    else setZoomLevel(100)
  }

  const isStudioTabActive = activeFile && activeFile.endsWith('.studio')

  return (
    <div className="tab-strip-bar select-none">
      {/* Tabs List (Spacious & Clean, no tools clutter) */}
      <div className="tabs-container custom-scrollbar">
        {/* Markdown Document Tabs */}
        {fileKeys.map((fileName) => {
          const isActive = activeFile === fileName
          const isReadme = fileName === 'README.md'
          const isLicense = fileName.toLowerCase().includes('license')
          const isSetup = fileName.toLowerCase().includes('setup')

          let iconName = 'description'
          if (isLicense) iconName = 'verified'
          else if (isSetup) iconName = 'terminal'

          return (
            <div
              key={fileName}
              className={`editor-tab ${isActive ? 'active' : ''}`}
              onClick={() => onSelectFile(fileName)}
              title={fileName}
            >
              <span className={`material-symbols-outlined tab-file-icon ${isReadme ? 'readme-icon' : ''}`}>
                {iconName}
              </span>
              <span className="tab-file-title truncate">{fileName}</span>

              {/* Status bullet */}
              <span className="tab-dot" title="Saved"></span>

              {/* Close Tab button */}
              {!isReadme && (
                <button
                  type="button"
                  className="tab-close-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    onCloseFile(fileName)
                  }}
                  title={`Close ${fileName}`}
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              )}
            </div>
          )
        })}

        {/* User-Added Studio Tool Tabs */}
        {openStudioTabs.map((tabId) => {
          const config = STUDIO_TABS_CONFIG[tabId]
          if (!config) return null
          const isActive = activeFile === tabId

          return (
            <div
              key={tabId}
              className={`editor-tab studio-tool-tab ${config.colorClass} ${isActive ? 'active' : ''}`}
              onClick={() => onSelectFile(tabId)}
              title={`${config.label} Studio`}
            >
              <span
                className="material-symbols-outlined tab-file-icon"
                style={{ color: config.iconColor }}
              >
                {config.icon}
              </span>
              <span className="tab-file-title truncate">{config.label}</span>
              <span className="studio-tab-pill">STUDIO</span>

              <button
                type="button"
                className="tab-close-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  onCloseStudioTab(tabId)
                }}
                title={`Close ${config.label} tab`}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
          )
        })}

        {/* New Document File Button */}
        <button
          type="button"
          className="tab-add-btn"
          onClick={() => {
            const name = prompt('Enter document file name (e.g., DEPLOYMENT.md):')
            if (name && name.trim()) {
              onCreateFile(name.trim().endsWith('.md') ? name.trim() : `${name.trim()}.md`)
            }
          }}
          title="New document file (+)"
        >
          <span className="material-symbols-outlined">add</span>
        </button>
      </div>

      {/* Right Controls: View Mode, Zooms & Studio Tools Dropdown */}
      <div className="tab-controls-right">
        {!isStudioTabActive ? (
          <>
            {/* Segmented View Mode Toggle */}
            <div className="view-mode-segmented">
              <button
                type="button"
                className={`view-mode-pill ${viewMode === 'split' ? 'active' : ''}`}
                onClick={() => setViewMode('split')}
                title="Split Editor & Live Preview"
              >
                <span className="material-symbols-outlined pill-icon">vertical_split</span>
                <span>Split</span>
              </button>

              <button
                type="button"
                className={`view-mode-pill ${viewMode === 'editor' ? 'active' : ''}`}
                onClick={() => setViewMode('editor')}
                title="Editor Only View"
              >
                <span className="material-symbols-outlined pill-icon">code</span>
                <span>Editor</span>
              </button>

              <button
                type="button"
                className={`view-mode-pill ${viewMode === 'preview' ? 'active' : ''}`}
                onClick={() => setViewMode('preview')}
                title="Preview Only View"
              >
                <span className="material-symbols-outlined pill-icon">visibility</span>
                <span>Preview</span>
              </button>
            </div>

            {/* Zoom Level Indicator */}
            <button
              type="button"
              className="btn-tab-ctrl zoom-badge"
              onClick={handleZoomToggle}
              title="Zoom Level (Click to cycle 90% / 100% / 115%)"
            >
              {zoomLevel}%
            </button>

            {/* Split Orientation Toggle */}
            {viewMode === 'split' && (
              <button
                type="button"
                className={`btn-tab-ctrl ${orientation === 'horizontal' ? 'active' : ''}`}
                onClick={() => setOrientation((prev) => prev === 'horizontal' ? 'vertical' : 'horizontal')}
                title={
                  orientation === 'horizontal'
                    ? 'Switch to Side-by-Side Split (Left & Right)'
                    : 'Switch to Stacked Split (Top & Bottom)'
                }
              >
                <span className="material-symbols-outlined">
                  {orientation === 'horizontal' ? 'vertical_split' : 'horizontal_split'}
                </span>
              </button>
            )}
          </>
        ) : (
          <div className="studio-active-indicator">
            <span className="studio-pulse-dot"></span>
            <span className="studio-active-text">Interactive Studio Workspace</span>
          </div>
        )}

        {/* Studio Tools Dropdown Button (Add / Remove Tabs) */}
        <div className="relative-dropdown" ref={toolsDropdownRef}>
          <button
            type="button"
            className={`btn-tab-ctrl ${openStudioTabs.length > 0 ? 'active' : ''}`}
            onClick={() => setToolsDropdownOpen((prev) => !prev)}
            title="Studio Tools (Add / Remove Tabs)"
          >
            <span className="material-symbols-outlined">auto_fix_high</span>
          </button>

          {toolsDropdownOpen && (
            <div className="tools-dropdown-menu tools-dropdown-right">
              <div className="tools-dropdown-header">
                <span>Studio Tabs ({openStudioTabs.length}/4 added)</span>
              </div>
              {Object.values(STUDIO_TABS_CONFIG).map((tool) => {
                const isOpen = openStudioTabs.includes(tool.id)
                return (
                  <div key={tool.id} className="tool-dropdown-row">
                    <button
                      type="button"
                      className="tool-dropdown-item"
                      onClick={() => {
                        onOpenStudioTab(tool.id)
                        setToolsDropdownOpen(false)
                      }}
                    >
                      <span
                        className="material-symbols-outlined icon-tool"
                        style={{ color: tool.iconColor }}
                      >
                        {tool.icon}
                      </span>
                      <div className="tool-item-info">
                        <span className="tool-item-title">{tool.label}</span>
                        <span className="tool-item-sub">
                          {isOpen ? 'Added to tabs' : 'Click to open'}
                        </span>
                      </div>
                    </button>
                    <button
                      type="button"
                      className={`tool-tab-toggle-btn ${isOpen ? 'is-open' : ''}`}
                      onClick={() => {
                        if (isOpen) {
                          onCloseStudioTab(tool.id)
                        } else {
                          onOpenStudioTab(tool.id)
                        }
                      }}
                      title={isOpen ? 'Remove tab from bar' : 'Add tab to bar'}
                    >
                      <span className="material-symbols-outlined icon-xs">
                        {isOpen ? 'remove' : 'add'}
                      </span>
                    </button>
                  </div>
                )
              })}
              {onOpenToolsDrawer && (
                <div className="tools-dropdown-footer">
                  <button
                    type="button"
                    className="tools-drawer-link"
                    onClick={() => {
                      onOpenToolsDrawer()
                      setToolsDropdownOpen(false)
                    }}
                  >
                    <span className="material-symbols-outlined icon-xs">view_sidebar</span>
                    <span>Manage in Tools Drawer</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Zen / Fullscreen Mode */}
        <button
          type="button"
          className={`btn-tab-ctrl ${isZenMode ? 'active' : ''}`}
          onClick={() => setIsZenMode((prev) => !prev)}
          title={isZenMode ? 'Exit Zen Mode (Esc)' : 'Zen Mode / Fullscreen'}
        >
          <span className="material-symbols-outlined">
            {isZenMode ? 'fullscreen_exit' : 'fullscreen'}
          </span>
        </button>
      </div>
    </div>
  )
}
