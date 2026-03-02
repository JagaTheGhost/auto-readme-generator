import React, { useRef } from 'react'
import Editor from 'react-simple-code-editor'
import Prism from 'prismjs'
import 'prismjs/components/prism-markdown'
import 'prismjs/themes/prism-tomorrow.css' // Switched to tomorrow to remove twilight borders
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks' // Allows single-enter newlines in markdown
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import EditorToolbar from './EditorToolbar'

export default function Preview({ markdown, onMarkdownChange }) {
  const safeMarkdown = markdown || ''

  const editorRef = useRef(null)
  const scrollContainerRef = useRef(null)
  const previewRef = useRef(null)

  // Flag to prevent infinite scroll loops
  let isSyncingLeft = false;
  let isSyncingRight = false;

  const handleEditorScroll = (e) => {
    if (isSyncingLeft) {
      isSyncingLeft = false;
      return;
    }
    if (!previewRef.current) return;

    const editor = e.target;
    const preview = previewRef.current;

    // Calculate scroll percentage (0 to 1)
    const scrollPercentage = editor.scrollTop / (editor.scrollHeight - editor.clientHeight);

    // Apply percentage to preview pane
    isSyncingRight = true;
    preview.scrollTop = scrollPercentage * (preview.scrollHeight - preview.clientHeight);
  };

  const handlePreviewScroll = (e) => {
    if (isSyncingRight) {
      isSyncingRight = false;
      return;
    }
    if (!editorRef.current) return;

    const preview = e.target;
    const editor = editorRef.current;

    // Calculate scroll percentage (0 to 1)
    const scrollPercentage = preview.scrollTop / (preview.scrollHeight - preview.clientHeight);

    // Apply percentage to editor pane
    isSyncingLeft = true;
    editor.scrollTop = scrollPercentage * (editor.scrollHeight - editor.clientHeight);
  };

  return (
    <section className="preview-section">
      <div className="preview-header">
        <span className="preview-title">Markdown Editor</span>
        <span className="preview-title">Live Preview</span>
      </div>
      <div className="preview-container">
        {/* INTERACTIVE RAW MARKDOWN EDITOR */}
        <div className="preview-raw-container">
          <EditorToolbar
            markdown={safeMarkdown}
            setMarkdown={onMarkdownChange}
            textareaRef={editorRef}
          />
          <div
            className="preview-raw"
            ref={scrollContainerRef}
            onScroll={handleEditorScroll}
          >
            <Editor
              ref={editorRef}
              value={safeMarkdown}
              onValueChange={onMarkdownChange}
              highlight={(code) => {
                if (Prism.languages.markdown) {
                  return Prism.highlight(code || '', Prism.languages.markdown, 'markdown');
                }
                return code || '';
              }}
              padding={24}
              className="editor-textarea-highlighted"
              style={{
                fontFamily: 'ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, monospace',
                fontSize: 14,
                backgroundColor: 'transparent',
                minHeight: '100%',
                width: '100%'
              }}
            />
          </div>
        </div>

        {/* RENDERED HTML PREVIEW */}
        <div
          className="preview-rendered"
          ref={previewRef}
          onScroll={handlePreviewScroll}
        >
          <div className="markdown-preview">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkBreaks]}
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '')
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={vscDarkPlus}
                      language={match[1]}
                      PreTag="div"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  )
                }
              }}
            >
              {safeMarkdown}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </section>
  )
}
