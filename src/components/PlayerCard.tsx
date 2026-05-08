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
  onApplyCmdDamage: (victimId: number, attackerId: number, delta: number) => void
  onRename: (id: number, name: string) => void
  onRecolor: (id: number, color: PlayerColor) => void
}

export default function PlayerCard({
  player, allPlayers, onLifeChange, onPoisonChange, onApplyCmdDamage, onRename, onRecolor,
}: Props) {
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState(player.name)
  const [cmdOpen, setCmdOpen] = useState(false)
  const nameRef = useRef<HTMLInputElement>(null)

  const startEdit = () => { setEditingName(true); setNameInput(player.name) }

  const commitName = () => {
    const trimmed = nameInput.trim()
    if (trimmed) onRename(player.id, trimmed)
    else setNameInput(player.name)
    setEditingName(false)
  }

  const attackers = allPlayers.filter(p => p.id !== player.id)
  const totalCmdDamage = Object.values(player.commanderDamage).reduce((a, b) => a + b, 0)

  return (
    <div className={`player-card color-${player.color} ${player.eliminated ? 'eliminated' : ''}`}>
      {player.eliminated && <div className="skull-overlay">💀</div>}

      {/* Commander damage panel — inline overlay, inherits quadrant rotation */}
      {cmdOpen && (
        <div className="cmd-panel">
          <div className="cmd-panel-header">
            <span className="cmd-panel-title">⚔ Damage taken</span>
            <button className="cmd-panel-close" onClick={() => setCmdOpen(false)}>✕</button>
          </div>
          <div className="cmd-panel-rows">
            {attackers.map(attacker => {
              const dmg = player.commanderDamage[attacker.id] ?? 0
              const pct = Math.min(dmg / COMMANDER_DAMAGE_THRESHOLD, 1)
              const atLimit = dmg >= COMMANDER_DAMAGE_THRESHOLD
              return (
                <div key={attacker.id} className="cmd-panel-row">
                  <div className="cmd-row-top">
                    <span className="cmd-row-name">{attacker.name}</span>
                    <div className="cmd-row-controls">
                      <button
                        className="cmd-adj-btn"
                        onClick={() => onApplyCmdDamage(player.id, attacker.id, -1)}
                        disabled={dmg === 0}
                      >−</button>
                      <span className={`cmd-row-val ${atLimit ? 'at-limit' : ''}`}>{dmg}</span>
                      <button
                        className="cmd-adj-btn"
                        onClick={() => onApplyCmdDamage(player.id, attacker.id, 1)}
                      >+</button>
                    </div>
                  </div>
                  <div className="cmd-progress-track">
                    <div
                      className={`cmd-progress-fill ${atLimit ? 'at-limit' : ''}`}
                      style={{
                        width: `${pct * 100}%`,
                        background: `var(--color-${attacker.color})`,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
          <p className="cmd-panel-note">Damage also reduces life total</p>
        </div>
      )}

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

      {editingName && (
        <div className="color-picker">
          {PALETTE.map(c => (
            <button
              key={c}
              className={`color-chip ${player.color === c ? 'active' : ''}`}
              style={{ background: `var(--color-${c})` }}
              title={c}
              onMouseDown={e => {
                e.preventDefault()
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
          onClick={() => setCmdOpen(v => !v)}
        >
          <span className="counter-icon">⚔</span>
          <span className="counter-val">{totalCmdDamage}</span>
        </button>
      </div>

      {Object.entries(player.commanderDamage).some(([, v]) => v > 0) && !cmdOpen && (
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
