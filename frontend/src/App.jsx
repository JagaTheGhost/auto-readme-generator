import { useState } from 'react'
import './index.css'
import Input from './components/Input'
import Preview from './components/Preview'
import ActionButtons from './components/ActionButtons'
import axios from 'axios'

function App() {
  const [markdown, setMarkdown] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [metadata, setMetadata] = useState(null)

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
      })

      setMarkdown(response.data.markdown)
      setMetadata(response.data.metadata)
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to generate README'
      setError(errorMsg)
      setMarkdown('')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(markdown)
    alert('README copied to clipboard!')
  }

  const handleDownload = () => {
    const element = document.createElement('a')
    const file = new Blob([markdown], { type: 'text/markdown' })
    element.href = URL.createObjectURL(file)
    element.download = 'README.md'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1>Auto README Generator</h1>
          <p>Generate professional README.md files in seconds</p>
        </div>
      </header>

      <main className="container">
        <div className="content">
          <Input onGenerate={handleGenerate} loading={loading} />

          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}

          {markdown && (
            <>
              <Preview markdown={markdown} />
              <ActionButtons
                onCopy={handleCopy}
                onDownload={handleDownload}
              />
            </>
          )}

          {loading && (
            <div className="loading">
              <div className="spinner"></div>
              <p>Generating your README...</p>
            </div>
          )}
        </div>
      </main>

      <footer className="footer">
        <p>Built with React • FastAPI • ❤️</p>
      </footer>
    </div>
  )
}

export default App
