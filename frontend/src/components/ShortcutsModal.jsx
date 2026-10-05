import React from 'react'

export default function ShortcutsModal({ isOpen, onClose }) {
  if (!isOpen) return null

  const shortcutGroups = [
    {
      group: 'Navigation & Workspace',
      items: [
        { key: 'Ctrl + K', desc: 'Open Command Palette' },
        { key: 'Ctrl + B', desc: 'Toggle Primary Sidebar' },
        { key: 'Ctrl + Shift + E', desc: 'Open File Explorer' },
        { key: 'Ctrl + Shift + G', desc: 'Open AI Configurator' },
        { key: 'Ctrl + Shift + O', desc: 'Open Document Headings Outline' },
        { key: 'Esc', desc: 'Close dialogs or exit Zen mode' }
      ]
    },
    {
      group: 'AI & Generation',
      items: [
        { key: 'Ctrl + Enter', desc: 'Trigger AI Documentation Generation' },
        { key: 'Ctrl + S', desc: 'Quick save & auto-format' }
      ]
    },
    {
      group: 'View & Editor',
      items: [
        { key: 'Ctrl + F', desc: 'Find in Editor Buffer' },
        { key: 'Ctrl + H', desc: 'Find & Replace in Buffer' },
        { key: 'Ctrl + Shift + B', desc: 'Open Shields.io Badges Studio Tab' },
        { key: 'Ctrl + Shift + M', desc: 'Open Mermaid Diagram Studio Tab' },
        { key: 'Ctrl + Shift + T', desc: 'Open Markdown Table Studio Tab' },
        { key: 'Ctrl + Shift + P', desc: 'Toggle Split / Preview Mode' },
        { key: 'Alt + Shift + 0', desc: 'Toggle Split Layout (Side-by-Side / Stacked)' },
        { key: 'Ctrl + Alt + Z', desc: 'Toggle Zen / Focus Mode' },
        { key: 'Ctrl + Shift + C', desc: 'Copy Active Markdown to Clipboard' }
      ]
    }
  ]

  return (
    <div className="palette-backdrop" onClick={onClose}>
      <div className="shortcuts-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <div className="dialog-title-group">
            <span className="material-symbols-outlined dialog-icon">keyboard</span>
            <span className="dialog-title">Keyboard Shortcuts</span>
          </div>
          <button type="button" className="dialog-close-btn" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="dialog-body custom-scrollbar">
          {shortcutGroups.map((group, idx) => (
            <div key={idx} className="shortcut-group">
              <div className="shortcut-group-title">{group.group}</div>
              <div className="shortcut-grid">
                {group.items.map((item, itemIdx) => (
                  <div key={itemIdx} className="shortcut-row">
                    <span className="shortcut-desc">{item.desc}</span>
                    <kbd className="shortcut-kbd">{item.key}</kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="dialog-footer">
          <span>Press <kbd className="footer-kbd">Esc</kbd> to close</span>
        </div>
      </div>
    </div>
  )
}
