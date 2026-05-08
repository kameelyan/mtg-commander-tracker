import { useState, useRef } from 'react'
import type { Player, PlayerColor } from '../types'
import { COMMANDER_DAMAGE_THRESHOLD, POISON_THRESHOLD } from '../gameState'
import './PlayerCard.css'

const PALETTE: PlayerColor[] = [
  'cobalt', 'crimson', 'emerald', 'violet',
  'amber', 'teal', 'rose', 'indigo',
  'orange', 'slate', 'jade', 'ruby',
]

interface Props {
  player: Player
  allPlayers: Player[]
  onLifeChange: (id: number, delta: number) => void
  onPoisonChange: (id: number, delta: number) => void
  onRename: (id: number, name: string) => void
  onRecolor: (id: number, color: PlayerColor) => void
  onOpenCmdDamage: () => void
}

export default function PlayerCard({
  player, allPlayers, onLifeChange, onPoisonChange, onRename, onRecolor, onOpenCmdDamage,
}: Props) {
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState(player.name)
  const nameRef = useRef<HTMLInputElement>(null)

  const startEdit = () => { setEditingName(true); setNameInput(player.name) }

  const commitName = () => {
    const trimmed = nameInput.trim()
    if (trimmed) onRename(player.id, trimmed)
    else setNameInput(player.name)
    setEditingName(false)
  }

  const totalCmdDamage = Object.values(player.commanderDamage).reduce((a, b) => a + b, 0)

  return (
    <div className={`player-card color-${player.color} ${player.eliminated ? 'eliminated' : ''}`}>
      {player.eliminated && <div className="skull-overlay">💀</div>}

      {/* Name row */}
      <div className="name-row">
        {editingName ? (
          <input
            ref={nameRef}
            className="name-input"
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            onBlur={commitName}
            onKeyDown={e => { if (e.key === 'Enter') commitName() }}
            autoFocus
          />
        ) : (
          <span className="player-name" onClick={startEdit}>{player.name}</span>
        )}
      </div>

      {/* Color picker — visible only while editing name */}
      {editingName && (
        <div className="color-picker">
          {PALETTE.map(c => (
            <button
              key={c}
              className={`color-chip ${player.color === c ? 'active' : ''}`}
              style={{ background: `var(--color-${c})` }}
              title={c}
              onMouseDown={e => {
                e.preventDefault() // prevent blur on the name input
                onRecolor(player.id, c)
              }}
            />
          ))}
        </div>
      )}

      {/* Life total */}
      <div className="life-section">
        <button className="life-btn minus" onClick={() => onLifeChange(player.id, -1)}>−</button>
        <div className="life-display">
          <span className="life-number">{player.life}</span>
        </div>
        <button className="life-btn plus" onClick={() => onLifeChange(player.id, 1)}>+</button>
      </div>

      {/* Quick increments */}
      <div className="quick-btns">
        {[-10, -5, +5, +10].map(d => (
          <button key={d} className="quick-btn" onClick={() => onLifeChange(player.id, d)}>
            {d > 0 ? `+${d}` : d}
          </button>
        ))}
      </div>

      {/* Status row */}
      <div className="status-row">
        <div className="counter-group">
          <button className="counter-btn" onClick={() => onPoisonChange(player.id, -1)}>−</button>
          <div className={`counter-display ${player.poison >= POISON_THRESHOLD ? 'danger' : ''}`}>
            <span className="counter-icon">☠</span>
            <span className="counter-val">{player.poison}</span>
          </div>
          <button className="counter-btn" onClick={() => onPoisonChange(player.id, 1)}>+</button>
        </div>

        <button
          className={`cmd-summary-btn ${totalCmdDamage >= COMMANDER_DAMAGE_THRESHOLD ? 'danger' : ''}`}
          onClick={onOpenCmdDamage}
          title="Commander damage"
        >
          <span className="counter-icon">⚔</span>
          <span className="counter-val">{totalCmdDamage}</span>
        </button>
      </div>

      {/* Commander damage breakdown chips */}
      {Object.entries(player.commanderDamage).some(([, v]) => v > 0) && (
        <div className="cmd-breakdown">
          {Object.entries(player.commanderDamage).map(([attackerId, dmg]) => {
            if (dmg === 0) return null
            const attacker = allPlayers.find(p => p.id === Number(attackerId))
            return (
              <span
                key={attackerId}
                className={`cmd-chip ${dmg >= COMMANDER_DAMAGE_THRESHOLD ? 'danger' : ''}`}
              >
                {attacker?.name.slice(0, 3) ?? '?'}: {dmg}
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}
