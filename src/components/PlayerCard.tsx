import { useState, useRef } from 'react'
import type { Player, MtgColor } from '../types'
import { COMMANDER_DAMAGE_THRESHOLD, POISON_THRESHOLD } from '../gameState'
import './PlayerCard.css'

const COLORS: MtgColor[] = ['white', 'blue', 'black', 'red', 'green', 'gold', 'colorless']
const COLOR_LABELS: Record<MtgColor, string> = {
  white: 'W', blue: 'U', black: 'B', red: 'R', green: 'G', gold: 'M', colorless: 'C',
}

interface Props {
  player: Player
  allPlayers: Player[]
  onLifeChange: (id: number, delta: number) => void
  onPoisonChange: (id: number, delta: number) => void
  onRename: (id: number, name: string) => void
  onRecolor: (id: number, color: MtgColor) => void
  onOpenCmdDamage: () => void
}

export default function PlayerCard({
  player, allPlayers, onLifeChange, onPoisonChange, onRename, onRecolor, onOpenCmdDamage,
}: Props) {
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState(player.name)
  const [showColors, setShowColors] = useState(false)
  const nameRef = useRef<HTMLInputElement>(null)

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
        <button
          className="color-dot"
          style={{ background: `var(--mtg-${player.color})` }}
          onClick={() => setShowColors(v => !v)}
          title="Change color"
        />
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
          <span className="player-name" onClick={() => { setEditingName(true); setNameInput(player.name) }}>
            {player.name}
          </span>
        )}

        {showColors && (
          <div className="color-picker">
            {COLORS.map(c => (
              <button
                key={c}
                className={`color-chip ${player.color === c ? 'active' : ''}`}
                style={{ background: `var(--mtg-${c})` }}
                title={c}
                onClick={() => { onRecolor(player.id, c); setShowColors(false) }}
              >
                {COLOR_LABELS[c]}
              </button>
            ))}
          </div>
        )}
      </div>

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
        {/* Poison */}
        <div className="counter-group">
          <button className="counter-btn" onClick={() => onPoisonChange(player.id, -1)}>−</button>
          <div className={`counter-display ${player.poison >= POISON_THRESHOLD ? 'danger' : ''}`}>
            <span className="counter-icon">☠</span>
            <span className="counter-val">{player.poison}</span>
          </div>
          <button className="counter-btn" onClick={() => onPoisonChange(player.id, 1)}>+</button>
        </div>

        {/* Commander damage summary */}
        <button
          className={`cmd-summary-btn ${totalCmdDamage >= COMMANDER_DAMAGE_THRESHOLD ? 'danger' : ''}`}
          onClick={onOpenCmdDamage}
          title="Commander damage"
        >
          <span className="counter-icon">⚔</span>
          <span className="counter-val">{totalCmdDamage}</span>
        </button>
      </div>

      {/* Commander damage breakdown */}
      {Object.entries(player.commanderDamage).some(([, v]) => v > 0) && (
        <div className="cmd-breakdown">
          {Object.entries(player.commanderDamage).map(([attackerId, dmg]) => {
            if (dmg === 0) return null
            const attacker = allPlayers.find(p => p.id === Number(attackerId))
            return (
              <span
                key={attackerId}
                className={`cmd-chip ${dmg >= COMMANDER_DAMAGE_THRESHOLD ? 'danger' : ''}`}
                style={{ background: `var(--mtg-${attacker?.color ?? 'colorless'})` }}
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
