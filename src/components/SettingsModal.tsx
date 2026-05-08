import { useState } from 'react'
import './SettingsModal.css'

interface Props {
  currentPlayerCount: number
  currentStartingLife: number
  showHints: boolean
  onToggleHints: (val: boolean) => void
  onReset: (playerCount: number, startingLife: number) => void
  onClose: () => void
}

export default function SettingsModal({ currentPlayerCount, currentStartingLife, showHints, onToggleHints, onReset, onClose }: Props) {
  const [playerCount, setPlayerCount] = useState(currentPlayerCount)
  const [startingLife, setStartingLife] = useState(currentStartingLife)
  const [confirmReset, setConfirmReset] = useState(false)

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel settings-panel" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Game Settings</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="setting-row">
          <label>Players</label>
          <div className="player-count-btns">
            {[2, 3, 4, 5, 6].map(n => (
              <button
                key={n}
                className={`count-btn ${playerCount === n ? 'active' : ''}`}
                onClick={() => setPlayerCount(n)}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="setting-row">
          <label>Starting Life</label>
          <div className="life-select-btns">
            {[20, 30, 40].map(l => (
              <button
                key={l}
                className={`count-btn ${startingLife === l ? 'active' : ''}`}
                onClick={() => setStartingLife(l)}
              >
                {l}
              </button>
            ))}
            <input
              type="number"
              className="life-input"
              value={startingLife}
              min={1}
              max={999}
              onChange={e => setStartingLife(Math.max(1, Number(e.target.value)))}
            />
          </div>
        </div>

        <div className="setting-row">
          <label>Display</label>
          <label className="toggle-row">
            <span className="toggle-label">Show hold-to-adjust hints</span>
            <span className="toggle-desc">Tap ±1 · Hold ±10 labels on buttons</span>
            <input
              type="checkbox"
              className="toggle-input"
              checked={showHints}
              onChange={e => onToggleHints(e.target.checked)}
            />
            <span className="toggle-track">
              <span className="toggle-thumb" />
            </span>
          </label>
        </div>

        {!confirmReset ? (
          <button className="reset-btn" onClick={() => setConfirmReset(true)}>
            New Game
          </button>
        ) : (
          <div className="confirm-row">
            <span>Reset all life totals?</span>
            <button className="confirm-yes" onClick={() => onReset(playerCount, startingLife)}>
              Yes, reset
            </button>
            <button className="confirm-no" onClick={() => setConfirmReset(false)}>
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
