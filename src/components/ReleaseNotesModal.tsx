import type { ReleaseNote } from '../releaseNotes'
import './ReleaseNotesModal.css'

const TYPE_LABEL: Record<ReleaseNote['changes'][number]['type'], string> = {
  new: 'New',
  fix: 'Fix',
  change: 'Change',
}

interface Props {
  notes: ReleaseNote[]
  currentVersion: string
  onClose: () => void
}

export default function ReleaseNotesModal({ notes, currentVersion, onClose }: Props) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel rn-panel" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Release Notes</h2>
            <span className="rn-current">Current: v{currentVersion}</span>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="rn-list">
          {notes.map(release => (
            <section key={release.version} className="rn-release">
              <div className="rn-release-header">
                <span className="rn-version">v{release.version}</span>
                <span className="rn-date">{release.date}</span>
              </div>
              <ul className="rn-changes">
                {release.changes.map((c, i) => (
                  <li key={i} className={`rn-change rn-${c.type}`}>
                    <span className="rn-badge">{TYPE_LABEL[c.type]}</span>
                    {c.text}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
