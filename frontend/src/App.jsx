import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import './index.css'
import TopMenuBar from './components/TopMenuBar'
import ActivityBar from './components/ActivityBar'
import SidebarDrawer from './components/SidebarDrawer'
import TabBar from './components/TabBar'
import Preview from './components/Preview'
import StatusBar from './components/StatusBar'
import CommandPalette from './components/CommandPalette'
import ShortcutsModal from './components/ShortcutsModal'
import SettingsModal from './components/SettingsModal'
import Toast from './components/Toast'
import BadgeStudioTab from './components/studio/BadgeStudioTab'
import MobileUnsupportedOverlay from './components/MobileUnsupportedOverlay'
import DiagramStudioTab from './components/studio/DiagramStudioTab'
import TableStudioTab from './components/studio/TableStudioTab'
import SnippetStudioTab from './components/studio/SnippetStudioTab'
import axios from 'axios'
import { saveAs } from 'file-saver'

function App() {
  // Detect mobile / narrow viewports and show a fullscreen overlay if not desktop-sized
  const [isMobileView, setIsMobileView] = useState(() => window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  // LocalStorage-backed core state
  // If mobile view, show overlay
  // Mobile overlay will be rendered conditionally in JSX below
  const [repoUrl, setRepoUrl] = useState(() => localStorage.getItem('readme_repo_url') || '')
  const [description, setDescription] = useState(() => localStorage.getItem('readme_description') || '')
  const [selectedTechs, setSelectedTechs] = useState(() => {
    try {
      const saved = localStorage.getItem('readme_techs')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // Starter markdown default if empty
  const defaultMarkdown = `# README Studio ⚡

> Next-generation AI documentation studio. Generate production-grade READMEs and comprehensive multi-file documentation suites in seconds.

[![Status](https://img.shields.io/badge/status-active-10b981.svg)](#)
[![Version](https://img.shields.io/badge/version-1.0.0-6366f1.svg)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## ✨ Key Features
- [x] **Split IDE Code Editor:** Live syntax-highlighted code editor with numerical gutter and synchronized preview.
- [x] **Autonomous AI Engine:** Powered by Gemini 3.8 Flash for repo AST analysis and intelligent documentation synthesis.
- [x] **Multi-File Document Suite:** Full pack generation with \`CONTRIBUTING.md\`, \`SETUP.md\`, \`ARCHITECTURE.md\`, and \`LICENSE\`.
- [x] **Command Palette (Ctrl+K):** Instant keyboard accessibility for rapid commands and template loading.

## 🚀 Quick Start
\`\`\`bash
# 1. Enter your GitHub repository or project description on the left
# 2. Select detected technologies or customize your stack
# 3. Click "Generate with AI" or press Ctrl+Enter
\`\`\`

## 🛠️ Tech Stack
- **Frontend:** React 18, Vite, Prism.js, React-Markdown
- **Backend:** FastAPI, Python 3.11, Google Gemini AI
- **Deployment:** Vercel & Render Ready
`

  const [markdown, setMarkdown] = useState(() => localStorage.getItem('readme_draft_markdown') || defaultMarkdown)
  const [generateSuite, setGenerateSuite] = useState(true)
  const [theme, setTheme] = useState('default')
  const [sectionOrder, setSectionOrder] = useState([])
  const [additionalFiles, setAdditionalFiles] = useState(() => {
    try {
      const saved = localStorage.getItem('readme_additional_files')
      return saved ? JSON.parse(saved) : {
        'CONTRIBUTING.md': `# Contributing Guidelines 🤝\n\nThank you for considering contributing! Please review our workflow below.\n\n## Pull Request Process\n1. Fork the repo and create your branch from \`main\`.\n2. Ensure code passes all lint and test suites.\n3. Submit a descriptive Pull Request.\n`,
        'SETUP.md': `# Setup & Local Development 💻\n\n### Prerequisites\n- Node.js 18+\n- Python 3.10+\n\n\`\`\`bash\n# Install client dependencies\ncd frontend && npm install\n\n# Run development server\nnpm run dev\n\`\`\`\n`,
        'LICENSE': `MIT License\n\nCopyright (c) 2026 README Studio Contributors\n\nPermission is hereby granted, free of charge, to any person obtaining a copy\nof this software and associated documentation files (the "Software"), to deal\nin the Software without restriction...`
      }
    } catch {
      return {}
    }
  })

  const [activeFile, setActiveFile] = useState('README.md')
  const [hasGenerated, setHasGenerated] = useState(() => Boolean(localStorage.getItem('readme_has_generated')))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState({ message: '', type: 'success' })

  // IDE Workspace State
  const [activeActivityTab, setActiveActivityTab] = useState('generator') // 'explorer' | 'generator' | 'outline' | 'templates'
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [viewMode, setViewMode] = useState('split') // 'split' | 'editor' | 'preview'
  const [orientation, setOrientation] = useState('vertical') // 'vertical' (side-by-side) | 'horizontal' (stacked)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [fontSize, setFontSize] = useState(13)
  const [tabSize, setTabSize] = useState(2)
  const [wordWrap, setWordWrap] = useState(true)
  const [showLineNumbers, setShowLineNumbers] = useState(true)
  const [isZenMode, setIsZenMode] = useState(false)
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem('readme_ide_theme') || 'dark') // 'dark' | 'slate' | 'light'
  const [cursorPosition, setCursorPosition] = useState({ line: 1, col: 1 })
  const [scrollToHeadingTarget, setScrollToHeadingTarget] = useState('')

  // Modals & Studio tabs state
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false)
  const [settingsModalOpen, setSettingsModalOpen] = useState(false)
  const [findReplaceOpen, setFindReplaceOpen] = useState(false)
  const [findReplaceMode, setFindReplaceMode] = useState('find') // 'find' | 'replace'
  const [openStudioTabs, setOpenStudioTabs] = useState([]) // ['badges.studio', 'diagrams.studio', ...]
  const fileScrollPositions = useRef({})

  // Persistent storage effects
  useEffect(() => {
    localStorage.setItem('readme_repo_url', repoUrl)
  }, [repoUrl])

  useEffect(() => {
    localStorage.setItem('readme_description', description)
  }, [description])

  useEffect(() => {
    localStorage.setItem('readme_techs', JSON.stringify(selectedTechs))
  }, [selectedTechs])

  useEffect(() => {
    if (markdown) {
      localStorage.setItem('readme_draft_markdown', markdown)
    }
  }, [markdown])

  useEffect(() => {
    localStorage.setItem('readme_additional_files', JSON.stringify(additionalFiles))
  }, [additionalFiles])

  useEffect(() => {
    localStorage.setItem('readme_ide_theme', themeMode)
  }, [themeMode])

  const API_BASE_URL = import.meta.env.VITE_API_URL || ''

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type })
  }, [])

  // Documentation Generation
  const handleGenerate = async (url = repoUrl, desc = description, techStack = selectedTechs) => {
    if (!url?.trim() && !desc?.trim()) {
      setError('Please provide either a GitHub repository URL or a project description.')
      showToast('Please provide a repository URL or project description.', 'error')
      setActiveActivityTab('generator')
      setSidebarCollapsed(false)
      return
    }

    setLoading(true)
    setError('')
    setActiveFile('README.md')

    try {
      const endpoint = API_BASE_URL ? `${API_BASE_URL}/generate-readme` : '/api/generate-readme'
      const response = await axios.post(endpoint, {
        repo_url: url || null,
        description: desc || null,
        tech_stack: techStack.length > 0 ? techStack : null,
        generate_suite: generateSuite,
        theme: theme,
        section_order: sectionOrder.length > 0 ? sectionOrder : null,
      })

      if (response.data.markdown) {
        setMarkdown(response.data.markdown)
      }
      if (response.data.additional_files && Object.keys(response.data.additional_files).length > 0) {
        setAdditionalFiles(response.data.additional_files)
      }
      setHasGenerated(true)
      localStorage.setItem('readme_has_generated', 'true')

      if (response.data.rate_limited) {
        showToast('Generated! (GitHub rate limit reached; inferred via heuristics)', 'info')
      } else {
        showToast('✨ Documentation suite generated successfully!', 'success')
      }
    } catch (err) {
      console.warn('Generate documentation error:', err)
      const isConnError = err.code === 'ERR_NETWORK' || err.message?.includes('Network Error') || !err.response || (err.response?.status === 500 && !err.response?.data?.detail)
      let errorMsg = err.response?.data?.detail || err.message || 'Failed to generate documentation'
      if (isConnError) {
        errorMsg = 'Backend server is not reachable. Please ensure the Python backend is running on port 8000.'
      }
      setError(errorMsg)
      showToast(errorMsg, 'error')
    } finally {
      setLoading(false)
    }
  }

  // Active files map
  const allFiles = useMemo(() => ({
    'README.md': markdown,
    ...additionalFiles
  }), [markdown, additionalFiles])

  const currentContent = activeFile === 'README.md' ? markdown : (additionalFiles[activeFile] || '')

  const handleContentChange = (newContent) => {
    if (activeFile === 'README.md') {
      setMarkdown(newContent)
    } else {
      setAdditionalFiles((prev) => ({
        ...prev,
        [activeFile]: newContent
      }))
    }
  }

  // File management
  const handleCreateFile = (filename) => {
    if (!filename) return
    if (allFiles[filename]) {
      setActiveFile(filename)
      showToast(`Switched to existing ${filename}`, 'info')
      return
    }
    const initialContent = `# ${filename.replace('.md', '')}\n\nAdd content here.\n`
    setAdditionalFiles((prev) => ({
      ...prev,
      [filename]: initialContent
    }))
    setActiveFile(filename)
    showToast(`Created ${filename}`, 'success')
  }

  const handleDeleteFile = (filename) => {
    if (filename === 'README.md') {
      showToast('Cannot delete primary README.md', 'error')
      return
    }
    setAdditionalFiles((prev) => {
      const next = { ...prev }
      delete next[filename]
      return next
    })
    if (activeFile === filename) {
      setActiveFile('README.md')
    }
    showToast(`Deleted ${filename}`, 'info')
  }

  const handleSelectFile = useCallback((filename) => {
    const editorArea = document.querySelector('.editor-scroll-area')
    const previewArea = document.querySelector('.preview-pane')
    if (activeFile && !activeFile.endsWith('.studio')) {
      fileScrollPositions.current[activeFile] = {
        editor: editorArea ? editorArea.scrollTop : 0,
        preview: previewArea ? previewArea.scrollTop : 0
      }
    }
    setActiveFile(filename)
    if (!filename.endsWith('.studio')) {
      const saved = fileScrollPositions.current[filename] || { editor: 0, preview: 0 }
      const restore = () => {
        const ed = document.querySelector('.editor-scroll-area')
        const pr = document.querySelector('.preview-pane')
        const gt = document.querySelector('.editor-gutter')
        if (ed) ed.scrollTop = saved.editor
        if (pr) pr.scrollTop = saved.preview
        if (gt) gt.scrollTop = saved.editor
      }
      restore()
      window.requestAnimationFrame(restore)
      setTimeout(restore, 50)
      setTimeout(restore, 150)
    }
  }, [activeFile])

  const handleOpenStudioTab = useCallback((tabId) => {
    const editorArea = document.querySelector('.editor-scroll-area')
    const previewArea = document.querySelector('.preview-pane')
    if (activeFile && !activeFile.endsWith('.studio')) {
      fileScrollPositions.current[activeFile] = {
        editor: editorArea ? editorArea.scrollTop : 0,
        preview: previewArea ? previewArea.scrollTop : 0
      }
    }
    setOpenStudioTabs((prev) => (prev.includes(tabId) ? prev : [...prev, tabId]))
    setActiveFile(tabId)
  }, [activeFile])

  const handleCloseStudioTab = useCallback((tabId) => {
    setOpenStudioTabs((prev) => prev.filter((t) => t !== tabId))
    setActiveFile((current) => (current === tabId ? 'README.md' : current))
  }, [])

  const handleInsertSnippetIntoMarkdown = useCallback((snippet) => {
    const saved = fileScrollPositions.current['README.md'] || { editor: 0, preview: 0 }
    const editorArea = document.querySelector('.editor-scroll-area')
    const previewArea = document.querySelector('.preview-pane')
    const savedScrollTop = editorArea ? editorArea.scrollTop : saved.editor
    const savedPreviewTop = previewArea ? previewArea.scrollTop : saved.preview

    setMarkdown((prev) => `${prev.trimEnd()}\n\n${snippet}\n\n`)
    setActiveFile('README.md')

    const restoreScroll = () => {
      const ed = document.querySelector('.editor-scroll-area')
      const pr = document.querySelector('.preview-pane')
      const gt = document.querySelector('.editor-gutter')
      if (ed) ed.scrollTop = savedScrollTop
      if (pr) pr.scrollTop = savedPreviewTop
      if (gt) gt.scrollTop = savedScrollTop
    }

    restoreScroll()
    window.requestAnimationFrame(restoreScroll)
    setTimeout(restoreScroll, 50)
    setTimeout(restoreScroll, 150)
    setTimeout(restoreScroll, 300)
  }, [])

  const handleCloseFile = (filename) => {
    if (filename === 'README.md') {
      showToast('Primary README.md remains pinned', 'info')
      return
    }
    if (filename.endsWith('.studio')) {
      handleCloseStudioTab(filename)
      return
    }
    if (activeFile === filename) {
      setActiveFile('README.md')
    }
  }

  // Clipboard & Download
  const handleCopy = () => {
    if (!currentContent) return
    navigator.clipboard.writeText(currentContent)
    showToast(`Copied ${activeFile} to clipboard!`, 'success')
  }

  const handleDownload = async () => {
    try {
      if (Object.keys(additionalFiles).length > 0) {
        const { default: JSZip } = await import('jszip')
        const zip = new JSZip()
        zip.file('README.md', markdown)

        Object.entries(additionalFiles).forEach(([filename, content]) => {
          zip.file(filename, content)
        })

        const content = await zip.generateAsync({ type: 'blob' })
        saveAs(content, 'documentation-suite.zip')
        showToast('Downloaded documentation-suite.zip!', 'success')
      } else {
        const file = new Blob([currentContent], { type: 'text/markdown;charset=utf-8' })
        saveAs(file, activeFile)
        showToast(`Downloaded ${activeFile}!`, 'success')
      }
    } catch (err) {
      showToast('Failed to download files: ' + err.message, 'error')
    }
  }

  const handleDownloadHtml = () => {
    if (!currentContent) return
    const title = activeFile.replace('.md', '')
    const htmlDoc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — README Studio</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.5.1/github-markdown-dark.min.css">
  <style>
    body { background-color: #0d1117; color: #c9d1d9; padding: 2rem; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; }
    .markdown-body { box-sizing: border-box; min-width: 200px; max-width: 960px; margin: 0 auto; padding: 32px; background: transparent; }
  </style>
</head>
<body>
  <article class="markdown-body">
    <pre style="white-space: pre-wrap; font-family: inherit;">${currentContent.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
  </article>
</body>
</html>`
    const blob = new Blob([htmlDoc], { type: 'text/html;charset=utf-8' })
    saveAs(blob, `${title}.html`)
    showToast(`Exported ${title}.html!`, 'success')
  }

  const handleClear = () => {
    localStorage.removeItem('readme_draft_markdown')
    setMarkdown('')
    showToast('Reset active markdown buffer.', 'info')
  }

  const handleLoadTemplate = (content, title) => {
    setMarkdown(content)
    setActiveFile('README.md')
    showToast(`Loaded ${title} template into editor!`, 'success')

    // Reset scroll to top (line 1) across multiple frames so new preset template doesn't open scrolled down
    const resetScrollToTop = () => {
      const editorArea = document.querySelector('.editor-scroll-area')
      const previewArea = document.querySelector('.preview-pane')
      const gutter = document.querySelector('.editor-gutter')
      if (editorArea) editorArea.scrollTop = 0
      if (previewArea) previewArea.scrollTop = 0
      if (gutter) gutter.scrollTop = 0
    }
    resetScrollToTop()
    window.requestAnimationFrame(resetScrollToTop)
    setTimeout(resetScrollToTop, 50)
    setTimeout(resetScrollToTop, 150)
    setTimeout(resetScrollToTop, 300)
  }

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+K or Cmd+K -> Command Palette
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setCommandPaletteOpen((prev) => !prev)
      }
      // Ctrl+B or Cmd+B -> Toggle Sidebar
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault()
        setSidebarCollapsed((prev) => !prev)
      }
      // Ctrl+Enter or Cmd+Enter -> Generate
      else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        handleGenerate()
      }
      // Ctrl+S or Cmd+S -> Save status
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        showToast('✓ Documentation saved locally', 'success')
      }
      // Ctrl+Shift+E -> Explorer
      else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'e') {
        e.preventDefault()
        setActiveActivityTab('explorer')
        setSidebarCollapsed(false)
      }
      // Ctrl+Shift+G -> Generator
      else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'g') {
        e.preventDefault()
        setActiveActivityTab('generator')
        setSidebarCollapsed(false)
      }
      // Ctrl+Shift+P -> Cycle View Mode
      else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault()
        setViewMode((prev) => prev === 'split' ? 'preview' : prev === 'preview' ? 'editor' : 'split')
      }
      // Alt+Shift+0 or Ctrl+\ -> Toggle Split Orientation
      else if (
        (e.altKey && e.shiftKey && (e.key === '0' || e.code === 'Digit0')) ||
        ((e.ctrlKey || e.metaKey) && e.key === '\\')
      ) {
        e.preventDefault()
        setOrientation((prev) => (prev === 'horizontal' ? 'vertical' : 'horizontal'))
      }
      // Ctrl+F -> Find
      else if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'f') {
        e.preventDefault()
        setFindReplaceMode('find')
        setFindReplaceOpen(true)
      }
      // Ctrl+H -> Replace
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'h') {
        e.preventDefault()
        setFindReplaceMode('replace')
        setFindReplaceOpen(true)
      }
      // Ctrl+Shift+B -> Badges Studio Tab
      else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'b') {
        e.preventDefault()
        handleOpenStudioTab('badges.studio')
      }
      // Ctrl+Shift+M -> Diagrams Studio Tab
      else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'm') {
        e.preventDefault()
        handleOpenStudioTab('diagrams.studio')
      }
      // Ctrl+Shift+T -> Tables Studio Tab
      else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 't') {
        e.preventDefault()
        handleOpenStudioTab('tables.studio')
      }
      // Escape -> Close dialogs / Return to README
      else if (e.key === 'Escape') {
        if (findReplaceOpen) setFindReplaceOpen(false)
        else if (commandPaletteOpen) setCommandPaletteOpen(false)
        else if (shortcutsModalOpen) setShortcutsModalOpen(false)
        else if (settingsModalOpen) setSettingsModalOpen(false)
        else if (isZenMode) setIsZenMode(false)
        else if (activeFile.endsWith('.studio')) setActiveFile('README.md')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [commandPaletteOpen, shortcutsModalOpen, settingsModalOpen, findReplaceOpen, isZenMode, activeFile, handleOpenStudioTab, repoUrl, description, selectedTechs])

  // Commands for Command Palette
  const commands = useMemo(() => [
    {
      id: 'generate',
      title: 'Generate Documentation',
      description: 'Trigger documentation synthesis from inputs',
      icon: 'auto_awesome',
      category: 'Action',
      shortcut: 'Ctrl+Enter',
      action: () => handleGenerate()
    },
    {
      id: 'view-split',
      title: 'View: Split Editor & Preview',
      description: '50/50 Code Editor and GitHub preview',
      icon: 'vertical_split',
      category: 'Layout',
      action: () => setViewMode('split')
    },
    {
      id: 'view-editor',
      title: 'View: Editor Only',
      description: 'Maximize raw code editor space',
      icon: 'code',
      category: 'Layout',
      action: () => setViewMode('editor')
    },
    {
      id: 'view-preview',
      title: 'View: Preview Only',
      description: 'Read-only GitHub formatted documentation view',
      icon: 'visibility',
      category: 'Layout',
      action: () => setViewMode('preview')
    },
    {
      id: 'copy-md',
      title: `Copy ${activeFile} Markdown`,
      description: 'Copy active markdown text to system clipboard',
      icon: 'content_copy',
      category: 'Clipboard',
      shortcut: 'Ctrl+Shift+C',
      action: handleCopy
    },
    {
      id: 'download-suite',
      title: 'Export: Download Documentation Suite (.zip)',
      description: 'Bundle all markdown documents into a zip archive',
      icon: 'folder_zip',
      category: 'Export',
      action: handleDownload
    },
    {
      id: 'download-html',
      title: 'Export: Standalone HTML Page',
      description: 'Self-contained GitHub-styled HTML file',
      icon: 'html',
      category: 'Export',
      action: handleDownloadHtml
    },
    {
      id: 'toggle-sidebar',
      title: 'Toggle Primary Sidebar Drawer',
      description: 'Expand or collapse the left drawer panel',
      icon: 'view_sidebar',
      category: 'Layout',
      shortcut: 'Ctrl+B',
      action: () => setSidebarCollapsed(prev => !prev)
    },
    {
      id: 'zen-mode',
      title: 'Toggle Zen / Focus Mode',
      description: 'Hide sidebar and chrome for distraction-free writing',
      icon: 'fullscreen',
      category: 'Layout',
      action: () => setIsZenMode(prev => !prev)
    },
    {
      id: 'toggle-split-orientation',
      title: `Toggle Split Layout (${orientation === 'horizontal' ? 'Side-by-Side' : 'Top & Bottom'})`,
      description: 'Switch between side-by-side vertical split and top-and-bottom stacked horizontal split',
      icon: orientation === 'horizontal' ? 'vertical_split' : 'horizontal_split',
      category: 'Layout',
      shortcut: 'Alt+Shift+0',
      action: () => setOrientation((prev) => (prev === 'horizontal' ? 'vertical' : 'horizontal'))
    },
    {
      id: 'open-shortcuts',
      title: 'Open Keyboard Shortcuts Reference',
      description: 'View all IDE keybindings and navigation tips',
      icon: 'keyboard',
      category: 'Help',
      action: () => setShortcutsModalOpen(true)
    },
    {
      id: 'open-settings',
      title: 'Open Studio Settings',
      description: 'Configure fonts, themes, tab size, and formatting',
      icon: 'settings',
      category: 'Preferences',
      action: () => setSettingsModalOpen(true)
    },
    {
      id: 'badge-builder',
      title: 'Open Shields.io Badge Studio Tab',
      description: 'Interactive custom badge designer & generator',
      icon: 'shield',
      category: 'Studio',
      shortcut: 'Ctrl+Shift+B',
      action: () => handleOpenStudioTab('badges.studio')
    },
    {
      id: 'diagram-studio',
      title: 'Open Mermaid Architecture Studio Tab',
      description: 'Visually configure architecture diagrams, pipelines, and git graphs',
      icon: 'schema',
      category: 'Studio',
      shortcut: 'Ctrl+Shift+M',
      action: () => handleOpenStudioTab('diagrams.studio')
    },
    {
      id: 'table-studio',
      title: 'Open Visual Markdown Table Studio Tab',
      description: 'Interactive visual table builder with live preview',
      icon: 'table_chart',
      category: 'Studio',
      shortcut: 'Ctrl+Shift+T',
      action: () => handleOpenStudioTab('tables.studio')
    },
    {
      id: 'snippet-studio',
      title: 'Open Code & Callouts Snippets Studio Tab',
      description: 'GitHub alerts, multi-language code blocks, and collapsible sections',
      icon: 'code_blocks',
      category: 'Studio',
      action: () => handleOpenStudioTab('snippets.studio')
    },
    {
      id: 'find-replace',
      title: 'Find & Replace in Buffer',
      description: 'Search and replace text in current document',
      icon: 'find_replace',
      category: 'Editor',
      shortcut: 'Ctrl+F',
      action: () => {
        setFindReplaceMode('find')
        setFindReplaceOpen(true)
      }
    },
    {
      id: 'clear-draft',
      title: 'Reset Active Markdown Buffer',
      description: 'Clear the current file content',
      icon: 'delete_sweep',
      category: 'Danger',
      action: handleClear
    }
  ], [activeFile, handleCopy, handleDownload, handleDownloadHtml])

  return (
    <>
      {isMobileView ? (
        <MobileUnsupportedOverlay onBypass={() => setIsMobileView(false)} />
      ) : (
        <div className={`ide-app-root theme-${themeMode} ${isZenMode ? 'zen-mode' : ''}`}>
      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />

      {/* Top Application Bar (Hidden in Zen Mode) */}
      {!isZenMode && (
        <TopMenuBar
          activeFile={activeFile}
          repoUrl={repoUrl}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed(prev => !prev)}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onGenerate={() => handleGenerate()}
          onCopy={handleCopy}
          onDownload={handleDownload}
          onDownloadHtml={handleDownloadHtml}
          isDocPack={Object.keys(additionalFiles).length > 0}
          loading={loading}
          hasGenerated={hasGenerated}
          themeMode={themeMode}
          setThemeMode={setThemeMode}
        />
      )}

      {/* Main Workspace Frame */}
      <div className="ide-workspace-frame">
        {/* Left Activity Rail (Hidden in Zen Mode) */}
        {!isZenMode && (
          <ActivityBar
            activeTab={activeActivityTab}
            onTabChange={(tab) => {
              setActiveActivityTab(tab)
              setSidebarCollapsed(false)
            }}
            sidebarCollapsed={sidebarCollapsed}
            onToggleSidebar={() => setSidebarCollapsed(prev => !prev)}
            onOpenShortcuts={() => setShortcutsModalOpen(true)}
            onOpenSettings={() => setSettingsModalOpen(true)}
          />
        )}

        {/* Primary Collapsible Drawer (Hidden in Zen Mode) */}
        {!isZenMode && (
          <SidebarDrawer
            activeTab={activeActivityTab}
            collapsed={sidebarCollapsed}
            files={allFiles}
            activeFile={activeFile}
            onSelectFile={handleSelectFile}
            onCreateFile={handleCreateFile}
            onDeleteFile={handleDeleteFile}
            markdown={currentContent}
            onScrollToHeading={(headingText) => setScrollToHeadingTarget(headingText)}
            onLoadTemplate={handleLoadTemplate}
            openStudioTabs={openStudioTabs}
            onOpenStudioTab={handleOpenStudioTab}
            onCloseStudioTab={handleCloseStudioTab}
            onInsertInstantSyntax={(syntax) => {
              if (activeFile && !activeFile.endsWith('.studio')) {
                const editorArea = document.querySelector('.editor-scroll-area')
                const previewArea = document.querySelector('.preview-pane')
                const savedScrollTop = editorArea ? editorArea.scrollTop : 0
                const savedPreviewTop = previewArea ? previewArea.scrollTop : 0

                const updated = currentContent + (currentContent.endsWith('\n\n') ? '' : '\n\n') + syntax + '\n'
                handleContentChange(updated)
                showToast(`Inserted template into ${activeFile}`, 'success')

                // Maintain current scroll position without jumping down across multiple frames
                const restoreScroll = () => {
                  const ed = document.querySelector('.editor-scroll-area')
                  const pr = document.querySelector('.preview-pane')
                  const gt = document.querySelector('.editor-gutter')
                  if (ed) ed.scrollTop = savedScrollTop
                  if (pr) pr.scrollTop = savedPreviewTop
                  if (gt) gt.scrollTop = savedScrollTop
                }
                restoreScroll()
                window.requestAnimationFrame(restoreScroll)
                setTimeout(restoreScroll, 50)
                setTimeout(restoreScroll, 150)
                setTimeout(restoreScroll, 300)
              } else {
                showToast('Switch to a document tab (e.g. README.md) to insert template', 'info')
              }
            }}
            onGenerate={handleGenerate}
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
            error={error}
          />
        )}

        {/* Central Editor Canvas */}
        <main className="ide-main-editor-area">
          {/* Loading Overlay */}
          {loading && (
            <div className="ide-loading-overlay">
              <div className="ide-loading-card">
                <span className="material-symbols-outlined loading-sparkle-spin">auto_awesome</span>
                <h3>Synthesizing Documentation...</h3>
                <p>Analyzing project structure and generating documentation files.</p>
                <div className="loading-bar-track">
                  <div className="loading-bar-fill"></div>
                </div>
              </div>
            </div>
          )}

          {/* Document Tab Bar */}
          <TabBar
            files={allFiles}
            activeFile={activeFile}
            onSelectFile={handleSelectFile}
            onCloseFile={handleCloseFile}
            onCreateFile={handleCreateFile}
            openStudioTabs={openStudioTabs}
            onOpenStudioTab={handleOpenStudioTab}
            onCloseStudioTab={handleCloseStudioTab}
            onOpenToolsDrawer={() => {
              setActiveActivityTab('tools')
              setSidebarCollapsed(false)
            }}
            viewMode={viewMode}
            setViewMode={setViewMode}
            zoomLevel={zoomLevel}
            setZoomLevel={setZoomLevel}
            isZenMode={isZenMode}
            setIsZenMode={setIsZenMode}
            orientation={orientation}
            setOrientation={setOrientation}
          />

          {/* Central Workspace: Dedicated Studio Tabs or Markdown Preview */}
          <div className="ide-editor-container">
            {activeFile === 'badges.studio' ? (
              <BadgeStudioTab
                repoUrl={repoUrl}
                onInsertBadge={(badgeMd) => {
                  handleInsertSnippetIntoMarkdown(badgeMd)
                  showToast('Shields.io Badge inserted into README.md!', 'success')
                }}
                onBackToReadme={() => setActiveFile('README.md')}
              />
            ) : activeFile === 'diagrams.studio' ? (
              <DiagramStudioTab
                onInsertDiagram={(diagramMd) => {
                  handleInsertSnippetIntoMarkdown(diagramMd)
                  showToast('Mermaid Architecture Diagram inserted into README.md!', 'success')
                }}
                onBackToReadme={() => setActiveFile('README.md')}
              />
            ) : activeFile === 'tables.studio' ? (
              <TableStudioTab
                onInsertTable={(tableMd) => {
                  handleInsertSnippetIntoMarkdown(tableMd)
                  showToast('Markdown Table inserted into README.md!', 'success')
                }}
                onBackToReadme={() => setActiveFile('README.md')}
              />
            ) : activeFile === 'snippets.studio' ? (
              <SnippetStudioTab
                onInsertSnippet={(snippetMd) => {
                  handleInsertSnippetIntoMarkdown(snippetMd)
                  showToast('Code / Callout snippet inserted into README.md!', 'success')
                }}
                onBackToReadme={() => setActiveFile('README.md')}
              />
            ) : (
              <Preview
                markdown={currentContent}
                onMarkdownChange={handleContentChange}
                activeFile={activeFile}
                viewMode={viewMode}
                orientation={orientation}
                zoomLevel={zoomLevel}
                fontSize={fontSize}
                wordWrap={wordWrap}
                showLineNumbers={showLineNumbers}
                onCursorChange={(pos) => setCursorPosition(pos)}
                scrollToHeadingTarget={scrollToHeadingTarget}
                onOpenBadgeBuilder={() => handleOpenStudioTab('badges.studio')}
                onOpenDiagramStudio={() => handleOpenStudioTab('diagrams.studio')}
                onOpenTableStudio={() => handleOpenStudioTab('tables.studio')}
                onOpenSnippetStudio={() => handleOpenStudioTab('snippets.studio')}
                findReplaceOpen={findReplaceOpen}
                setFindReplaceOpen={setFindReplaceOpen}
                findReplaceMode={findReplaceMode}
              />
            )}
          </div>
        </main>
      </div>

      {/* Bottom Status Bar (Always present) */}
      <StatusBar
        cursorPosition={cursorPosition}
        charCount={currentContent.length}
        wordCount={currentContent.trim() ? currentContent.trim().split(/\s+/).length : 0}
        loading={loading}
        error={error}
      />

      {/* Command Palette Modal */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        commands={commands}
      />

      {/* Shortcuts Modal */}
      <ShortcutsModal
        isOpen={shortcutsModalOpen}
        onClose={() => setShortcutsModalOpen(false)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        themeMode={themeMode}
        setThemeMode={setThemeMode}
        tabSize={tabSize}
        setTabSize={setTabSize}
        fontSize={fontSize}
        setFontSize={setFontSize}
        wordWrap={wordWrap}
        setWordWrap={setWordWrap}
        showLineNumbers={showLineNumbers}
        setShowLineNumbers={setShowLineNumbers}
      />
    </div>
      )}
    </>
  )
}

export default App
