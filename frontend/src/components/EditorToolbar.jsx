import React from 'react';

export default function EditorToolbar({ markdown, setMarkdown, textareaRef }) {
    const insertText = (before, after = '') => {
        if (!textareaRef.current) return;

        const start = textareaRef.current.selectionStart;
        const end = textareaRef.current.selectionEnd;
        const selectedText = markdown.substring(start, end);

        const newText =
            markdown.substring(0, start) +
            before + selectedText + after +
            markdown.substring(end);

        setMarkdown(newText);

        // Reset focus and cursor position after React re-renders
        setTimeout(() => {
            textareaRef.current.focus();
            textareaRef.current.setSelectionRange(
                start + before.length,
                end + before.length
            );
        }, 0);
    };

    const handleBold = () => insertText('**', '**');
    const handleItalic = () => insertText('*', '*');
    const handleH1 = () => insertText('# ', '');
    const handleH2 = () => insertText('## ', '');
    const handleH3 = () => insertText('### ', '');
    const handleQuote = () => insertText('> ', '');
    const handleCode = () => insertText('`', '`');
    const handleCodeBlock = () => insertText('\n```\n', '\n```\n');
    const handleLink = () => insertText('[', '](url)');
    const handleList = () => insertText('- ', '');
    const handleNumberedList = () => insertText('1. ', '');

    return (
        <div className="editor-toolbar">
            <div className="toolbar-group">
                <button className="toolbar-btn text-bold" onClick={handleBold} title="Bold">B</button>
                <button className="toolbar-btn text-italic" onClick={handleItalic} title="Italic">I</button>
            </div>
            <span className="toolbar-divider"></span>
            <div className="toolbar-group">
                <button className="toolbar-btn text-h1" onClick={handleH1} title="Heading 1">H1</button>
                <button className="toolbar-btn text-h2" onClick={handleH2} title="Heading 2">H2</button>
                <button className="toolbar-btn text-h3" onClick={handleH3} title="Heading 3">H3</button>
            </div>
            <span className="toolbar-divider"></span>
            <div className="toolbar-group">
                <button className="toolbar-btn icon-quote" onClick={handleQuote} title="Quote">❞</button>
                <button className="toolbar-btn icon-code" onClick={handleCode} title="Inline Code">{'<>'}</button>
                <button className="toolbar-btn icon-code-block" onClick={handleCodeBlock} title="Code Block">{"```"}</button>
                <button className="toolbar-btn icon-link" onClick={handleLink} title="Link">🔗</button>
            </div>
            <span className="toolbar-divider"></span>
            <div className="toolbar-group">
                <button className="toolbar-btn icon-list" onClick={handleList} title="Unordered List">•</button>
                <button className="toolbar-btn icon-num-list" onClick={handleNumberedList} title="Ordered List">1.</button>
            </div>
        </div>
    );
}
