import React from 'react'

export default function SettingsModal({
  isOpen,
  onClose,
  themeMode,
  setThemeMode,
  tabSize,
  setTabSize,
  fontSize,
  setFontSize,
  wordWrap,
  setWordWrap,
  showLineNumbers,
  setShowLineNumbers
}) {
  if (!isOpen) return null

  return (
    <div className="palette-backdrop" onClick={onClose}>
      <div className="settings-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <div className="dialog-title-group">
            <span className="material-symbols-outlined dialog-icon">settings</span>
            <span className="dialog-title">Editor & Workspace Settings</span>
          </div>
          <button type="button" className="dialog-close-btn" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="dialog-body custom-scrollbar">
          {/* Theme Option */}
          <div className="setting-row">
            <div>
              <div className="setting-label">Interface Color Theme</div>
              <div className="setting-sublabel">Select aesthetic styling for canvas & code preview</div>
            </div>
            <select
              className="setting-select"
              value={themeMode}
              onChange={(e) => setThemeMode(e.target.value)}
            >
              <option value="dark">Dark Charcoal (#0d1117)</option>
              <option value="slate">Sleek Slate (#10141a)</option>
              <option value="light">Crisp Light Mode</option>
            </select>
          </div>

          {/* Font Size Option */}
          <div className="setting-row">
            <div>
              <div className="setting-label">Editor Font Size</div>
              <div className="setting-sublabel">Scale code editor monospaced font size</div>
            </div>
            <select
              className="setting-select"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
            >
              <option value={12}>12px (Compact)</option>
              <option value={13}>13px (Default)</option>
              <option value={14}>14px (Comfortable)</option>
              <option value={16}>16px (Large)</option>
            </select>
          </div>

          {/* Tab Size */}
          <div className="setting-row">
            <div>
              <div className="setting-label">Indentation (Tab Size)</div>
              <div className="setting-sublabel">Number of spaces per indentation level</div>
            </div>
            <select
              className="setting-select"
              value={tabSize}
              onChange={(e) => setTabSize(Number(e.target.value))}
            >
              <option value={2}>2 spaces (Standard)</option>
              <option value={4}>4 spaces</option>
            </select>
          </div>

          {/* Word Wrap */}
          <div className="setting-row">
            <div>
              <div className="setting-label">Editor Word Wrap</div>
              <div className="setting-sublabel">Wrap long markdown lines at viewport boundary</div>
            </div>
            <input
              type="checkbox"
              className="setting-checkbox"
              checked={wordWrap}
              onChange={(e) => setWordWrap(e.target.checked)}
            />
          </div>

          {/* Show Line Numbers */}
          <div className="setting-row">
            <div>
              <div className="setting-label">Show Line Numbers Gutter</div>
              <div className="setting-sublabel">Display numerical line gutter in code editor</div>
            </div>
            <input
              type="checkbox"
              className="setting-checkbox"
              checked={showLineNumbers}
              onChange={(e) => setShowLineNumbers(e.target.checked)}
            />
          </div>

          <div className="settings-section-divider"></div>
          <div className="settings-section-title">
            <span className="material-symbols-outlined icon-xs text-primary">auto_awesome</span>
            <span>AI Model & Synthesis Engine (Optional)</span>
          </div>

          {/* AI Provider */}
          <div className="setting-row">
            <div>
              <div className="setting-label">AI Engine Provider</div>
              <div className="setting-sublabel">Select model for automated codebase synthesis</div>
            </div>
            <select
              className="setting-select"
              value={localStorage.getItem('readme_ai_provider') || 'gemini'}
              onChange={(e) => localStorage.setItem('readme_ai_provider', e.target.value)}
            >
              <option value="gemini">Google Gemini 3.8 Flash (Recommended)</option>
              <option value="openai">OpenAI GPT-4o / Turbo</option>
              <option value="ollama">Local Ollama (localhost:11434)</option>
            </select>
          </div>

          {/* API Key */}
          <div className="setting-row">
            <div>
              <div className="setting-label">Custom API Key</div>
              <div className="setting-sublabel">Saved securely in browser local storage</div>
            </div>
            <input
              type="password"
              className="setting-text-input"
              placeholder="AIzaSy... or sk-..."
              defaultValue={localStorage.getItem('readme_api_key') || ''}
              onChange={(e) => localStorage.setItem('readme_api_key', e.target.value.trim())}
            />
          </div>
        </div>

        <div className="dialog-footer">
          <button type="button" className="btn-primary-compact" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
