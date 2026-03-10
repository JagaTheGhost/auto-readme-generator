import { useState } from 'react'
import './index.css'
import Input from './components/Input'
import Preview from './components/Preview'
import ActionButtons from './components/ActionButtons'
import axios from 'axios'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

function App() {
  const [markdown, setMarkdown] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [metadata, setMetadata] = useState(null)
  const [generateSuite, setGenerateSuite] = useState(false)
  const [theme, setTheme] = useState('default')
  const [sectionOrder, setSectionOrder] = useState([])
  const [additionalFiles, setAdditionalFiles] = useState({})
  const [hasGenerated, setHasGenerated] = useState(false) // Keep editor visible once generated

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

  const handleGenerate = async (repoUrl, description, techStack) => {
    setLoading(true)
    setError('')
    setMarkdown('')

    try {
      const response = await axios.post(`${API_BASE_URL}/generate-readme`, {
        repo_url: repoUrl || null,
        description: description || null,
        tech_stack: techStack.length > 0 ? techStack : null,
        generate_suite: generateSuite,
        theme: theme,
        section_order: sectionOrder.length > 0 ? sectionOrder : null,
      })

      setMarkdown(response.data.markdown)
      setMetadata(response.data.metadata)
      setAdditionalFiles(response.data.additional_files || {})
      setHasGenerated(true)
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to generate README'
      setError(errorMsg)
      setMarkdown('')
      setAdditionalFiles({})
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(markdown)
    alert('README copied to clipboard!')
  }

  const handleDownload = async () => {
    if (Object.keys(additionalFiles).length > 0) {
      // Create ZIP file
      const zip = new JSZip()
      zip.file("README.md", markdown)

      // Add additional files
      Object.entries(additionalFiles).forEach(([filename, content]) => {
        zip.file(filename, content)
      })

      const content = await zip.generateAsync({ type: "blob" })
      saveAs(content, "docs-pack.zip")
    } else {
      // Download single README
      const file = new Blob([markdown], { type: 'text/markdown' })
      saveAs(file, 'README.md')
    }
  }

  return (
    <div className="app dashboard-layout">
      {/* LEFT SIDEBAR - INPUTS */}
      <aside className="sidebar">
        <header className="sidebar-header">
          <h1>Auto README Generator</h1>
          <p>Generate professional READMEs in seconds</p>
        </header>

        <div className="sidebar-content">
          <Input
            onGenerate={handleGenerate}
            loading={loading}
            generateSuite={generateSuite}
            setGenerateSuite={setGenerateSuite}
            theme={theme}
            setTheme={setTheme}
            sectionOrder={sectionOrder}
            setSectionOrder={setSectionOrder}
          />

          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}
        </div>

        <footer className="sidebar-footer">
          <p>Built with React • FastAPI • ❤️</p>
        </footer>
      </aside>

      {/* RIGHT MAIN AREA - PREVIEW */}
      <main className="main-content">
        {loading && (
          <div className="loading-overlay">
            <div className="loading">
              <div className="spinner"></div>
              <p>Generating your documentation...</p>
            </div>
          </div>
        )}

        {!hasGenerated && !loading ? (
          <div className="placeholder-state">
            <div className="placeholder-content">
              <h2>Ready to Generate</h2>
              <p>Fill out the form on the left and click "Generate" to see your professional documentation suite here.</p>
              <div className="placeholder-dots">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            </div>
          </div>
        ) : (
          <div className={`workspace ${loading ? 'loading-blur' : ''}`}>
            {hasGenerated && (
              <ActionButtons
                onCopy={handleCopy}
                onDownload={handleDownload}
                isDocPack={Object.keys(additionalFiles).length > 0}
              />
            )}

            {(hasGenerated || markdown) && (
              <div className="editor-preview-wrapper">
                <Preview
                  markdown={markdown}
                  onMarkdownChange={(newMarkdown) => setMarkdown(newMarkdown)}
                />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default App
