export default function ActionButtons({ onCopy, onDownload, isDocPack }) {
  return (
    <section className="action-buttons">
      <button className="btn btn-secondary" onClick={onCopy}>
        📋 Copy to Clipboard
      </button>
      <button className="btn btn-secondary" onClick={onDownload}>
        ⬇️ {isDocPack ? 'Download Doc Pack (.zip)' : 'Download README.md'}
      </button>
    </section>
  )
}
