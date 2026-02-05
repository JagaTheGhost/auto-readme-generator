import { useEffect, useState } from 'react'

export default function Preview({ markdown }) {
  const [renderedHtml, setRenderedHtml] = useState('')

  useEffect(() => {
    // Simple markdown to HTML conversion
    let html = markdown
      // Headers
      .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
      .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
      .replace(/^# (.*?)$/gm, '<h1>$1</h1>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Lists
      .replace(/^\- (.*?)$/gm, '<li>$1</li>')
      .replace(/(<li>.*?<\/li>)/s, '<ul>$1</ul>')
      // Code blocks
      .replace(/```[\s\S]*?```/g, (match) => {
        const code = match.replace(/```/g, '')
        return `<pre><code>${escapeHtml(code)}</code></pre>`
      })
      // Inline code
      .replace(/`(.*?)`/g, '<code>$1</code>')
      // Line breaks
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .split('</p><p>')
      .map((line) => {
        if (line.includes('<')) return line
        return `<p>${line}</p>`
      })
      .join('')

    setRenderedHtml(html)
  }, [markdown])

  function escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    }
    return text.replace(/[&<>"']/g, (m) => map[m])
  }

  return (
    <section className="preview-section">
      <div className="preview-container">
        <div className="preview-raw">
          <h3>Raw Markdown</h3>
          <pre className="markdown-code">
            <code>{markdown}</code>
          </pre>
        </div>

        <div className="preview-rendered">
          <h3>Preview</h3>
          <div
            className="markdown-preview"
            dangerouslySetInnerHTML={{ __html: renderedHtml }}
          />
        </div>
      </div>
    </section>
  )
}
