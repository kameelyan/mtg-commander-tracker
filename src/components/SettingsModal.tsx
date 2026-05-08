import { useState } from 'react'
import './SettingsModal.css'

interface Props {
  currentPlayerCount: number
  currentStartingLife: number
  onReset: (playerCount: number, startingLife: number) => void
  onClose: () => void
}

export default function SettingsModal({ currentPlayerCount, currentStartingLife, onReset, onClose }: Props) {
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
