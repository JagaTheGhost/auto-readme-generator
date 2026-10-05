import React, { useRef, useState, useEffect, useMemo } from 'react'
import Editor from 'react-simple-code-editor'
import Prism from 'prismjs'
import 'prismjs/components/prism-markdown'
import 'prismjs/themes/prism-tomorrow.css'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import rehypeRaw from 'rehype-raw'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import EditorToolbar from './EditorToolbar'
import MermaidRenderer from './MermaidRenderer'
import FindReplaceWidget from './FindReplaceWidget'

// Reusable CodeBlock component with language badge and copy action
function CodeBlock({ language, value, ...props }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="code-block-wrapper">
      <div className="code-block-header">
        <span className="code-block-lang">{language || 'text'}</span>
        <button
          type="button"
          className="code-copy-btn"
          onClick={handleCopy}
          title="Copy code snippet"
        >
          <span className="material-symbols-outlined icon-copy-btn">
            {copied ? 'check' : 'content_copy'}
          </span>
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={language}
        PreTag="div"
        customStyle={{
          margin: 0,
          background: 'var(--surface-container-lowest, #0a0e14)',
          borderRadius: '0 0 var(--radius-sm, 4px) var(--radius-sm, 4px)',
          fontSize: '0.82rem',
          lineHeight: '1.5',
          border: '1px solid var(--border-color, #30363d)',
          borderTop: 'none'
        }}
        {...props}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  )
}

export default function Preview({
  markdown,
  onMarkdownChange,
  activeFile = 'README.md',
  viewMode = 'split',
  orientation = 'vertical',
  zoomLevel = 100,
  fontSize = 13,
  wordWrap = true,
  showLineNumbers = true,
  onCursorChange,
  scrollToHeadingTarget,
  onOpenBadgeBuilder,
  onOpenDiagramStudio,
  onOpenTableStudio,
  onOpenSnippetStudio,
  findReplaceOpen = false,
  setFindReplaceOpen = () => {},
  findReplaceMode = 'find'
}) {
  const safeMarkdown = markdown || ''
  const editorScrollRef = useRef(null)
  const previewRef = useRef(null)
  const gutterRef = useRef(null)
  const lastActiveFileRef = useRef(activeFile)

  const isSyncingLeft = useRef(false)
  const isSyncingRight = useRef(false)

  // Reset scroll to top when switching active files
  useEffect(() => {
    if (lastActiveFileRef.current !== activeFile) {
      lastActiveFileRef.current = activeFile
      if (editorScrollRef.current) editorScrollRef.current.scrollTop = 0
      if (previewRef.current) previewRef.current.scrollTop = 0
      if (gutterRef.current) gutterRef.current.scrollTop = 0
    }
  }, [activeFile])

  // Calculate line numbers
  const lines = useMemo(() => {
    const splitLines = safeMarkdown.split('\n')
    return splitLines.length > 0 ? splitLines : ['']
  }, [safeMarkdown])

  const [activeLine, setActiveLine] = useState(1)

  // Track cursor position from textarea events
  const handleEditorKeyUpOrClick = (e) => {
    const textarea = e.target
    if (!textarea || typeof textarea.selectionStart !== 'number') return
    const selStart = textarea.selectionStart
    const textBefore = safeMarkdown.substring(0, selStart)
    const lineNum = textBefore.split('\n').length
    const lastNewline = textBefore.lastIndexOf('\n')
    const colNum = selStart - lastNewline

    setActiveLine(lineNum)
    if (onCursorChange) {
      onCursorChange({ line: lineNum, col: colNum })
    }
  }

  // Handle synchronized scrolling
  const handleEditorScroll = (e) => {
    // Sync gutter scrolling
    if (gutterRef.current) {
      gutterRef.current.scrollTop = e.target.scrollTop
    }

    if (viewMode !== 'split') return
    if (isSyncingLeft.current) {
      isSyncingLeft.current = false
      return
    }
    if (!previewRef.current) return

    const editor = e.target
    const preview = previewRef.current
    const maxScroll = editor.scrollHeight - editor.clientHeight
    if (maxScroll <= 0) return

    const scrollPercentage = editor.scrollTop / maxScroll
    isSyncingRight.current = true
    preview.scrollTop = scrollPercentage * (preview.scrollHeight - preview.clientHeight)
  }

  const handlePreviewScroll = (e) => {
    if (viewMode !== 'split') return
    if (isSyncingRight.current) {
      isSyncingRight.current = false
      return
    }
    if (!editorScrollRef.current) return

    const preview = e.target
    const editor = editorScrollRef.current
    const maxScroll = preview.scrollHeight - preview.clientHeight
    if (maxScroll <= 0) return

    const scrollPercentage = preview.scrollTop / maxScroll
    isSyncingLeft.current = true
    editor.scrollTop = scrollPercentage * (editor.scrollHeight - editor.clientHeight)
  }

  // Smooth scroll to heading when target prop updates
  useEffect(() => {
    if (!scrollToHeadingTarget || !previewRef.current) return

    const targetSlug = scrollToHeadingTarget.toLowerCase().replace(/[^\w\s-]/g, '').trim()
    const headings = previewRef.current.querySelectorAll('h1, h2, h3, h4')
    for (const h of headings) {
      const headingText = h.textContent.toLowerCase().replace(/[^\w\s-]/g, '').trim()
      if (headingText.includes(targetSlug) || targetSlug.includes(headingText)) {
        h.scrollIntoView({ behavior: 'smooth', block: 'start' })
        h.classList.add('heading-highlight-flash')
        setTimeout(() => h.classList.remove('heading-highlight-flash'), 2000)
        break
      }
    }
  }, [scrollToHeadingTarget])

  return (
    <div
      className={`editor-workspace-split mode-${viewMode} orientation-${orientation}`}
      style={{ '--editor-font-size': `${fontSize}px`, transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top left' }}
    >
      {/* ==================== LEFT PANE: CODE EDITOR ==================== */}
      {(viewMode === 'split' || viewMode === 'editor') && (
        <div className="editor-pane">
          {/* Sub Toolbar for Formatting */}
          <EditorToolbar
            markdown={safeMarkdown}
            setMarkdown={onMarkdownChange}
            textareaRef={editorScrollRef}
            onOpenBadgeBuilder={onOpenBadgeBuilder}
            onOpenDiagramStudio={onOpenDiagramStudio}
            onOpenTableStudio={onOpenTableStudio}
            onOpenSnippetStudio={onOpenSnippetStudio}
            onOpenFindReplace={() => setFindReplaceOpen(true)}
          />

          {/* Floating Find & Replace Widget */}
          <FindReplaceWidget
            isOpen={findReplaceOpen}
            onClose={() => setFindReplaceOpen(false)}
            markdown={safeMarkdown}
            onMarkdownChange={onMarkdownChange}
            showReplaceInitially={findReplaceMode === 'replace'}
          />

          {/* Editor Container with Gutter */}
          <div className="editor-surface">
            {/* Numerical Line Gutter */}
            {showLineNumbers && (
              <div className="editor-gutter custom-scrollbar" ref={gutterRef}>
                {lines.map((_, idx) => {
                  const lineNum = idx + 1
                  const isCurrent = lineNum === activeLine
                  return (
                    <div
                      key={lineNum}
                      className={`gutter-line ${isCurrent ? 'active' : ''}`}
                    >
                      {lineNum}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Code Text Area */}
            <div
              className={`editor-scroll-area custom-scrollbar ${wordWrap ? 'wrap' : 'nowrap'}`}
              ref={editorScrollRef}
              onScroll={handleEditorScroll}
              onClick={handleEditorKeyUpOrClick}
              onKeyUp={handleEditorKeyUpOrClick}
            >
              <Editor
                value={safeMarkdown}
                onValueChange={onMarkdownChange}
                highlight={(code) => {
                  if (Prism.languages.markdown) {
                    return Prism.highlight(code || '', Prism.languages.markdown, 'markdown')
                  }
                  return code || ''
                }}
                padding={16}
                tabSize={2}
                insertSpaces={true}
                className="ide-code-textarea"
                style={{
                  fontFamily: "'JetBrains Mono', ui-monospace, SFMono-Regular, monospace",
                  fontSize: fontSize,
                  backgroundColor: 'transparent',
                  minHeight: '100%',
                  width: '100%',
                  outline: 'none'
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Split Divider handle for visual separation */}
      {viewMode === 'split' && <div className="split-resizer-handle"></div>}

      {/* ==================== RIGHT PANE: LIVE PREVIEW ==================== */}
      {(viewMode === 'split' || viewMode === 'preview') && (
        <div
          className="preview-pane custom-scrollbar"
          ref={previewRef}
          onScroll={handlePreviewScroll}
        >
          <div className="preview-canvas markdown-body">
            {safeMarkdown.trim() ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkBreaks]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '')
                    const codeText = String(children).replace(/\n$/, '')
                    if (!inline && match && match[1] === 'mermaid') {
                      return <MermaidRenderer chart={codeText} />
                    }
                    return !inline && match ? (
                      <CodeBlock
                        language={match[1]}
                        value={codeText}
                        {...props}
                      />
                    ) : (
                      <code className={`inline-code-badge ${className || ''}`} {...props}>
                        {children}
                      </code>
                    )
                  },
                  h1({ node, children, ...props }) {
                    return (
                      <h1 className="preview-h1" {...props}>
                        {children}
                      </h1>
                    )
                  },
                  h2({ node, children, ...props }) {
                    return (
                      <h2 className="preview-h2" {...props}>
                        {children}
                      </h2>
                    )
                  },
                  h3({ node, children, ...props }) {
                    return (
                      <h3 className="preview-h3" {...props}>
                        {children}
                      </h3>
                    )
                  },
                  table({ node, children, ...props }) {
                    return (
                      <div className="preview-table-container">
                        <table className="preview-table" {...props}>
                          {children}
                        </table>
                      </div>
                    )
                  },
                  blockquote({ node, children, ...props }) {
                    return (
                      <blockquote className="preview-callout" {...props}>
                        {children}
                      </blockquote>
                    )
                  },
                  input({ node, ...props }) {
                    if (props.type === 'checkbox') {
                      return (
                        <input
                          type="checkbox"
                          className="preview-task-checkbox"
                          checked={props.checked}
                          readOnly
                        />
                      )
                    }
                    return <input {...props} />
                  }
                }}
              >
                {safeMarkdown}
              </ReactMarkdown>
            ) : (
              <div className="preview-empty-state">
                <span className="material-symbols-outlined empty-icon">auto_awesome</span>
                <h3>Document Canvas Ready</h3>
                <p>Start typing Markdown on the left, load a starter template, or click <strong>Generate with AI</strong> to synthesize documentation.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
