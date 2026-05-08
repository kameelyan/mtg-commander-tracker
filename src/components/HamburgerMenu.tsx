import { useState, useEffect, useRef } from 'react'
import './HamburgerMenu.css'

interface Props {
  onOpenSettings: () => void
  onOpenReleaseNotes: () => void
  version: string
}

export default function HamburgerMenu({ onOpenSettings, onOpenReleaseNotes, version }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const pick = (fn: () => void) => { fn(); setOpen(false) }

  return (
    <div className="hamburger-wrap" ref={ref}>
      <button
        className={`hamburger-btn ${open ? 'active' : ''}`}
        onClick={() => setOpen(v => !v)}
        aria-label="Menu"
      >
        <span /><span /><span />
      </button>

      {open && (
        <div className="hamburger-dropdown">
          <div className="dropdown-version">v{version}</div>
          <button className="dropdown-item" onClick={() => pick(onOpenSettings)}>
            <span className="di-icon">⚙</span> Settings
          </button>
          <button className="dropdown-item" onClick={() => pick(onOpenReleaseNotes)}>
            <span className="di-icon">📋</span> Release Notes
          </button>
        </div>
      )}
    </div>
  )
}
