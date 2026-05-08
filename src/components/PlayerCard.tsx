import { useState, useRef } from 'react'
import type { Player, PlayerColor, CounterType } from '../types'
import { COMMANDER_DAMAGE_THRESHOLD, POISON_THRESHOLD } from '../gameState'
import { useLongPress } from '../hooks/useLongPress'
import './PlayerCard.css'

const PALETTE: PlayerColor[] = [
  'cobalt', 'crimson', 'emerald', 'violet',
  'amber', 'teal', 'rose', 'indigo',
  'orange', 'slate', 'jade', 'ruby',
]

const COUNTER_DEFS: { key: CounterType; label: string; icon: string }[] = [
  { key: 'energy',     label: 'Energy',     icon: '⚡' },
  { key: 'experience', label: 'Experience', icon: '⭐' },
  { key: 'rad',        label: 'Rad',        icon: '☢' },
  { key: 'charge',     label: 'Charge',     icon: '⚙' },
  { key: 'lore',       label: 'Lore',       icon: '📜' },
  { key: 'spore',      label: 'Spore',      icon: '🍄' },
  { key: 'level',      label: 'Level',      icon: '↑' },
  { key: 'loyalty',    label: 'Loyalty',    icon: '◆' },
  { key: 'time',       label: 'Time',       icon: '⏳' },
  { key: 'bounty',     label: 'Bounty',     icon: '💰' },
]

interface Props {
  player: Player
  allPlayers: Player[]
  onLifeChange: (id: number, delta: number) => void
  onPoisonChange: (id: number, delta: number) => void
  onApplyCmdDamage: (victimId: number, attackerId: number, delta: number) => void
  onExtraCounterChange: (id: number, counter: CounterType, delta: number) => void
  onRename: (id: number, name: string) => void
  onRecolor: (id: number, color: PlayerColor) => void
}

function AdjBtn({
  onTap,
  onHold,
  children,
  className = '',
  disabled,
}: {
  onTap: () => void
  onHold: () => void
  children: React.ReactNode
  className?: string
  disabled?: boolean
}) {
  const lp = useLongPress(onTap, onHold)
  return (
    <button
      className={className}
      disabled={disabled}
      {...lp}
    >
      {children}
    </button>
  )
}

export default function PlayerCard({
  player, allPlayers, onLifeChange, onPoisonChange,
  onApplyCmdDamage, onExtraCounterChange, onRename, onRecolor,
}: Props) {
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState(player.name)
  const [cmdOpen, setCmdOpen] = useState(false)
  const [countersOpen, setCountersOpen] = useState(false)
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
  const activeCounters = COUNTER_DEFS.filter(c => (player.extraCounters[c.key] ?? 0) > 0)

  return (
    <div className={`player-card color-${player.color} ${player.eliminated ? 'eliminated' : ''}`}>
      {player.eliminated && <div className="skull-overlay">💀</div>}

      {/* Commander damage panel */}
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
                      <AdjBtn
                        className="cmd-adj-btn"
                        onTap={() => onApplyCmdDamage(player.id, attacker.id, -1)}
                        onHold={() => onApplyCmdDamage(player.id, attacker.id, -10)}
                        disabled={dmg === 0}
                      >−</AdjBtn>
                      <span className={`cmd-row-val ${atLimit ? 'at-limit' : ''}`}>{dmg}</span>
                      <AdjBtn
                        className="cmd-adj-btn"
                        onTap={() => onApplyCmdDamage(player.id, attacker.id, 1)}
                        onHold={() => onApplyCmdDamage(player.id, attacker.id, 10)}
                      >+</AdjBtn>
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
          <p className="cmd-panel-note">Tap ±1 · Hold ±10</p>
        </div>
      )}

      {/* Extra counters panel */}
      {countersOpen && (
        <div className="counters-panel">
          <div className="counters-panel-header">
            <span className="counters-panel-title">Counters</span>
            <button className="cmd-panel-close" onClick={() => setCountersOpen(false)}>✕</button>
          </div>
          <div className="counters-panel-rows">
            {COUNTER_DEFS.map(({ key, label, icon }) => {
              const val = player.extraCounters[key] ?? 0
              return (
                <div key={key} className="counter-def-row">
                  <span className="counter-def-icon">{icon}</span>
                  <span className="counter-def-label">{label}</span>
                  <div className="counter-def-controls">
                    <AdjBtn
                      className="cmd-adj-btn"
                      onTap={() => onExtraCounterChange(player.id, key, -1)}
                      onHold={() => onExtraCounterChange(player.id, key, -10)}
                      disabled={val === 0}
                    >−</AdjBtn>
                    <span className="counter-def-val">{val}</span>
                    <AdjBtn
                      className="cmd-adj-btn"
                      onTap={() => onExtraCounterChange(player.id, key, 1)}
                      onHold={() => onExtraCounterChange(player.id, key, 10)}
                    >+</AdjBtn>
                  </div>
                </div>
              )
            })}
          </div>
          <p className="cmd-panel-note">Tap ±1 · Hold ±10</p>
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
        <AdjBtn
          className="life-btn minus"
          onTap={() => onLifeChange(player.id, -1)}
          onHold={() => onLifeChange(player.id, -10)}
        >−</AdjBtn>
        <div className="life-display">
          <span className="life-number">{player.life}</span>
          <span className="life-hint">tap ±1 · hold ±10</span>
        </div>
        <AdjBtn
          className="life-btn plus"
          onTap={() => onLifeChange(player.id, 1)}
          onHold={() => onLifeChange(player.id, 10)}
        >+</AdjBtn>
      </div>

      {/* Status row */}
      <div className="status-row">
        <div className="counter-group">
          <AdjBtn
            className="counter-btn"
            onTap={() => onPoisonChange(player.id, -1)}
            onHold={() => onPoisonChange(player.id, -5)}
          >−</AdjBtn>
          <div className={`counter-display ${player.poison >= POISON_THRESHOLD ? 'danger' : ''}`}>
            <span className="counter-icon">☠</span>
            <span className="counter-val">{player.poison}</span>
          </div>
          <AdjBtn
            className="counter-btn"
            onTap={() => onPoisonChange(player.id, 1)}
            onHold={() => onPoisonChange(player.id, 5)}
          >+</AdjBtn>
        </div>

        <button
          className={`cmd-summary-btn ${totalCmdDamage >= COMMANDER_DAMAGE_THRESHOLD ? 'danger' : ''}`}
          onClick={() => { setCmdOpen(v => !v); setCountersOpen(false) }}
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

      {activeCounters.length > 0 && !countersOpen && (
        <div className="extra-counter-chips">
          {activeCounters.map(({ key, icon }) => (
            <span key={key} className="extra-chip">
              {icon} {player.extraCounters[key]}
            </span>
          ))}
        </div>
      )}

      {/* Counters toggle — opposite end from the name */}
      <button
        className={`counters-toggle-btn ${countersOpen ? 'active' : ''}`}
        onClick={() => { setCountersOpen(v => !v); setCmdOpen(false) }}
      >
        <span className="counters-toggle-icons">⚡⭐☢</span>
        <span>{countersOpen ? 'Close' : 'Counters'}</span>
      </button>
    </div>
  )
}
