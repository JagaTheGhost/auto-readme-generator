export default function ActionButtons({ onCopy, onDownload }) {
  return (
    <section className="action-buttons">
      <button className="btn btn-secondary" onClick={onCopy}>
        📋 Copy to Clipboard
      </button>
      <button className="btn btn-secondary" onClick={onDownload}>
        ⬇️ Download README.md
      </button>
    </section>
  )
}
