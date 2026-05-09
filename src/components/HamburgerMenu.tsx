import { useState } from 'react'
import './HamburgerMenu.css'

interface Props {
  version: string
  playerCount: number
  startingLife: number
  showHints: boolean
  onReset: (playerCount: number, startingLife: number) => void
  onToggleHints: (val: boolean) => void
  onOpenReleaseNotes: () => void
}

export default function HamburgerMenu({
  version, playerCount, startingLife, showHints,
  onReset, onToggleHints, onOpenReleaseNotes,
}: Props) {
  const [open, setOpen] = useState(false)
  const [localPlayerCount, setLocalPlayerCount] = useState(playerCount)
  const [localStartingLife, setLocalStartingLife] = useState(startingLife)
  const [confirmingReset, setConfirmingReset] = useState(false)

  const openMenu = () => {
    setLocalPlayerCount(playerCount)
    setLocalStartingLife(startingLife)
    setConfirmingReset(false)
    setOpen(true)
  }

  const close = () => { setOpen(false); setConfirmingReset(false) }

  const handleNewGame = () => {
    if (!confirmingReset) {
      setConfirmingReset(true)
    } else {
      onReset(localPlayerCount, localStartingLife)
      close()
    }
  }

  return (
    <>
      <button
        className={`hamburger-btn ${open ? 'active' : ''}`}
        onClick={openMenu}
        aria-label="Menu"
      >
        <span /><span /><span />
      </button>

      {open && (
        <div className="hamburger-overlay" onClick={close}>
          <div className="hamburger-menu" onClick={e => e.stopPropagation()}>
            <div className="menu-header">
              <span className="menu-version">v{version}</span>
              <button className="menu-rn-link" onClick={() => { onOpenReleaseNotes(); close() }}>
                Release Notes
              </button>
              <button className="menu-close" onClick={close}>✕</button>
            </div>

            <div className="menu-section">
              <div className="menu-section-label">Players</div>
              <div className="menu-option-row">
                {[2, 3, 4, 5, 6].map(n => (
                  <button
                    key={n}
                    className={`menu-option-btn ${localPlayerCount === n ? 'active' : ''}`}
                    onClick={() => setLocalPlayerCount(n)}
                  >{n}</button>
                ))}
              </div>
            </div>

            <div className="menu-section">
              <div className="menu-section-label">Starting Life</div>
              <div className="menu-option-row">
                {[0, 20, 30, 40].map(l => (
                  <button
                    key={l}
                    className={`menu-option-btn ${localStartingLife === l ? 'active' : ''}`}
                    onClick={() => setLocalStartingLife(l)}
                  >{l === 0 ? '0 ↑' : l}</button>
                ))}
                <input
                  type="number"
                  className="menu-life-input"
                  value={localStartingLife}
                  min={0}
                  max={999}
                  onChange={e => setLocalStartingLife(Math.max(0, Number(e.target.value)))}
                />
              </div>
            </div>

            <label className="menu-toggle-row">
              <span className="menu-toggle-label">Hold-to-adjust hints</span>
              <input
                type="checkbox"
                className="menu-toggle-input"
                checked={showHints}
                onChange={e => onToggleHints(e.target.checked)}
              />
              <span className="menu-toggle-track">
                <span className="menu-toggle-thumb" />
              </span>
            </label>

            <div className="menu-divider" />

            <button
              className={`menu-item reset-item ${confirmingReset ? 'confirming' : ''}`}
              onClick={handleNewGame}
            >
              <span className="mi-icon">↺</span>
              {confirmingReset ? 'Tap again to confirm' : 'New Game'}
            </button>

          </div>
        </div>
      )}
    </>
  )
}
