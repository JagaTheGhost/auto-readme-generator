import React, { useState, useRef, useEffect } from 'react'

export default function EditorToolbar({
  markdown,
  setMarkdown,
  textareaRef,
  onOpenBadgeBuilder,
  onOpenDiagramStudio,
  onOpenTableStudio,
  onOpenSnippetStudio,
  onOpenFindReplace
}) {
  const [headingDropdownOpen, setHeadingDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setHeadingDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const insertText = (before, after = '') => {
    const scrollContainer = textareaRef.current
    const textarea = scrollContainer?.querySelector
      ? scrollContainer.querySelector('textarea')
      : scrollContainer

    if (!textarea) return

    // Save exact scroll position of editor, preview, and gutter before text modification
    const savedScrollTop = scrollContainer ? scrollContainer.scrollTop : 0
    const savedScrollLeft = scrollContainer ? scrollContainer.scrollLeft : 0
    const previewArea = document.querySelector('.preview-pane')
    const savedPreviewTop = previewArea ? previewArea.scrollTop : 0

    const start = typeof textarea.selectionStart === 'number' ? textarea.selectionStart : markdown.length
    const end = typeof textarea.selectionEnd === 'number' ? textarea.selectionEnd : markdown.length
    const selectedText = markdown.substring(start, end)

    const newText =
      markdown.substring(0, start) +
      before + selectedText + after +
      markdown.substring(end)

    setMarkdown(newText)

    const restoreExactScroll = () => {
      if (scrollContainer) {
        scrollContainer.scrollTop = savedScrollTop
        scrollContainer.scrollLeft = savedScrollLeft
      }
      const preview = document.querySelector('.preview-pane')
      if (preview) {
        preview.scrollTop = savedPreviewTop
      }
      const gutter = document.querySelector('.editor-gutter')
      if (gutter && scrollContainer) {
        gutter.scrollTop = savedScrollTop
      }
    }

    setTimeout(() => {
      // Focus without browser forcing scroll down to cursor
      textarea.focus({ preventScroll: true })
      const newCursor = start + before.length + (selectedText ? selectedText.length : 0)
      textarea.setSelectionRange(newCursor, newCursor)

      // Strictly restore scroll position so it stays right where the user was
      restoreExactScroll()
      window.requestAnimationFrame(restoreExactScroll)
      setTimeout(restoreExactScroll, 40)
      setTimeout(restoreExactScroll, 120)
    }, 0)
  }

  const handleBold = () => insertText('**', '**')
  const handleItalic = () => insertText('*', '*')
  const handleStrikethrough = () => insertText('~~', '~~')
  const handleH1 = () => { insertText('# ', ''); setHeadingDropdownOpen(false) }
  const handleH2 = () => { insertText('## ', ''); setHeadingDropdownOpen(false) }
  const handleH3 = () => { insertText('### ', ''); setHeadingDropdownOpen(false) }
  const handleQuote = () => insertText('> ', '')
  const handleCode = () => insertText('`', '`')
  const handleCodeBlock = () => insertText('\n```bash\n', '\n```\n')
  const handleLink = () => insertText('[', '](https://)')
  const handleImage = () => insertText('![Alt text](', 'https://)')
  const handleList = () => insertText('- ', '')
  const handleNumberedList = () => insertText('1. ', '')
  const handleTaskList = () => insertText('- [ ] ', '')
  const handleTable = () => insertText('\n| Feature | Description | Status |\n| :--- | :--- | :--- |\n| Core Engine | High performance state management | Ready |\n| Telemetry | Live metrics collection | Active |\n\n')
  const handleDivider = () => insertText('\n\n---\n\n')

  const handleBadges = () => {
    insertText(
      '\n[![Version](https://img.shields.io/badge/version-1.0.0-6366f1.svg)](#) ' +
      '[![License: MIT](https://img.shields.io/badge/License-MIT-10b981.svg)](#) ' +
      '[![Build Passing](https://img.shields.io/badge/build-passing-brightgreen.svg)](#) ' +
      '[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](#)\n\n'
    )
  }

  const handleMermaid = () => {
    insertText(
      '\n```mermaid\ngraph TD\n  A[Client Browser] -->|HTTP / REST| B[FastAPI Gateway]\n  B --> C[Documentation Engine]\n  C -->|Markdown AST| D[Markdown Generator]\n  D -->|Markdown Stream| C\n  C -->|Response| B\n  B -->|Render Live| A\n```\n\n'
    )
  }

  const handleCallout = () => {
    insertText('\n> [!NOTE]\n> Highlights information that users should take into account, even when skimming.\n\n')
  }

  return (
    <div className="editor-sub-toolbar select-none">
      {/* Formatting Tools Group */}
      <div className="toolbar-left-group">
        {/* Heading Dropdown */}
        <div className="relative-dropdown" ref={dropdownRef}>
          <button
            type="button"
            className="toolbar-tool-btn dropdown-btn"
            onClick={() => setHeadingDropdownOpen(prev => !prev)}
            title="Headings (H1, H2, H3)"
          >
            <span>Headings</span>
            <span className="material-symbols-outlined icon-xs">
              {headingDropdownOpen ? 'arrow_drop_up' : 'arrow_drop_down'}
            </span>
          </button>

          {headingDropdownOpen && (
            <div className="heading-dropdown-menu">
              <button type="button" onClick={handleH1} className="heading-item">
                <span className="item-h1">#</span> Heading 1
              </button>
              <button type="button" onClick={handleH2} className="heading-item">
                <span className="item-h2">##</span> Heading 2
              </button>
              <button type="button" onClick={handleH3} className="heading-item">
                <span className="item-h3">###</span> Heading 3
              </button>
            </div>
          )}
        </div>

        <span className="tool-separator"></span>

        {/* Text Styles */}
        <button type="button" className="toolbar-tool-btn" onClick={handleBold} title="Bold (Ctrl+B)">
          <span className="material-symbols-outlined icon-tool">format_bold</span>
        </button>
        <button type="button" className="toolbar-tool-btn" onClick={handleItalic} title="Italic (Ctrl+I)">
          <span className="material-symbols-outlined icon-tool">format_italic</span>
        </button>
        <button type="button" className="toolbar-tool-btn" onClick={handleStrikethrough} title="Strikethrough">
          <span className="material-symbols-outlined icon-tool">strikethrough_s</span>
        </button>
        <button type="button" className="toolbar-tool-btn" onClick={handleQuote} title="Blockquote (> )">
          <span className="material-symbols-outlined icon-tool">format_quote</span>
        </button>

        <span className="tool-separator"></span>

        {/* Code & Links */}
        <button type="button" className="toolbar-tool-btn" onClick={handleCode} title="Inline Code (`code`)">
          <span className="material-symbols-outlined icon-tool">code</span>
        </button>
        <button type="button" className="toolbar-tool-btn" onClick={handleCodeBlock} title="Code Block (```bash)">
          <span className="material-symbols-outlined icon-tool">code_blocks</span>
        </button>
        <button type="button" className="toolbar-tool-btn" onClick={handleLink} title="Hyperlink ([text](url))">
          <span className="material-symbols-outlined icon-tool">link</span>
        </button>
        <button type="button" className="toolbar-tool-btn" onClick={handleImage} title="Image (![alt](url))">
          <span className="material-symbols-outlined icon-tool">image</span>
        </button>

        <span className="tool-separator"></span>

        {/* Lists & Dividers */}
        <button type="button" className="toolbar-tool-btn" onClick={handleList} title="Bullet List (- )">
          <span className="material-symbols-outlined icon-tool">format_list_bulleted</span>
        </button>
        <button type="button" className="toolbar-tool-btn" onClick={handleNumberedList} title="Numbered List (1. )">
          <span className="material-symbols-outlined icon-tool">format_list_numbered</span>
        </button>
        <button type="button" className="toolbar-tool-btn" onClick={handleTaskList} title="Task Checklist (- [ ])">
          <span className="material-symbols-outlined icon-tool">check_box</span>
        </button>
        <button type="button" className="toolbar-tool-btn" onClick={handleDivider} title="Horizontal Divider (---)">
          <span className="material-symbols-outlined icon-tool">horizontal_rule</span>
        </button>

        <span className="tool-separator"></span>

        {/* Instant Markdown Inserters (Compact icon buttons for quick inline creation) */}
        <button
          type="button"
          className="toolbar-tool-btn"
          onClick={handleTable}
          title="Instant Markdown Table (or open Table Studio Tab via Tools)"
        >
          <span className="material-symbols-outlined icon-tool">table</span>
        </button>

        <button
          type="button"
          className="toolbar-tool-btn"
          onClick={handleMermaid}
          title="Instant Mermaid Flowchart (or open Diagram Studio Tab via Tools)"
        >
          <span className="material-symbols-outlined icon-tool">schema</span>
        </button>

        <button
          type="button"
          className="toolbar-tool-btn"
          onClick={handleBadges}
          title="Instant Badges (or open Badges Studio Tab via Tools)"
        >
          <span className="material-symbols-outlined icon-tool">shield</span>
        </button>

        <button
          type="button"
          className="toolbar-tool-btn"
          onClick={handleCallout}
          title="Instant GitHub Alert Callout (> [!NOTE])"
        >
          <span className="material-symbols-outlined icon-tool">campaign</span>
        </button>

        <span className="tool-separator"></span>

        {/* In-Editor Search */}
        <button
          type="button"
          className="toolbar-tool-btn"
          onClick={onOpenFindReplace}
          title="Find & Replace in Buffer (Ctrl+F / Ctrl+H)"
        >
          <span className="material-symbols-outlined icon-tool">find_replace</span>
        </button>
      </div>
    </div>
  )
}
