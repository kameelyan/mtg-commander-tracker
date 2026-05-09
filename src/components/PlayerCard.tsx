import { useState, useRef } from 'react'
import type { Player, CounterType, LifeMoment } from '../types'
import { COMMANDER_DAMAGE_THRESHOLD, POISON_THRESHOLD } from '../gameState'
import { useLongPress } from '../hooks/useLongPress'
import './PlayerCard.css'


const COUNTER_DEFS: { key: CounterType; label: string; icon: React.ReactNode }[] = [
  { key: 'energy',     label: 'Energy',     icon: <i className="ms ms-e ms-cost" /> },
  { key: 'experience', label: 'Experience', icon: <i className="ss ss-c15" /> },
  { key: 'rad',        label: 'Rad',        icon: <i className="ms ms-counter-doom" /> },
  { key: 'charge',     label: 'Charge',     icon: <i className="ms ms-counter-charge" /> },
  { key: 'lore',       label: 'Lore',       icon: <i className="ms ms-counter-lore" /> },
  { key: 'spore',      label: 'Spore',      icon: <i className="ms ms-counter-fungus" /> },
  { key: 'level',      label: 'Level',      icon: <i className="ms ms-counter-arrow" /> },
  { key: 'loyalty',    label: 'Loyalty',    icon: <i className="ms ms-counter-loyalty" /> },
  { key: 'time',       label: 'Time',       icon: <i className="ms ms-counter-time" /> },
  { key: 'bounty',     label: 'Bounty',     icon: <i className="ms ms-counter-gold" /> },
]

interface Props {
  player: Player
  allPlayers: Player[]
  onLifeChange: (id: number, delta: number) => void
  onPoisonChange: (id: number, delta: number) => void
  onApplyCmdDamage: (victimId: number, attackerId: number, delta: number, cmdIndex?: 1 | 2) => void
  onSetCommanderCount: (id: number, count: 1 | 2) => void
  onExtraCounterChange: (id: number, counter: CounterType, delta: number) => void
  onRename: (id: number, name: string) => void
  onLifeMoment: (id: number, delta: number, newLife: number, source: 'life' | 'commander', attackerId?: number) => void
  playerHistory: LifeMoment[]
  showHints: boolean
}

function gridCols(count: number) {
  if (count <= 2) return 1
  if (count <= 4) return 2
  return 3
}

function CmdMiniGrid({ player, allPlayers, active, onClick }: {
  player: Player
  allPlayers: Player[]
  active: boolean
  onClick: () => void
}) {
  const cols = gridCols(allPlayers.length)
  const spanLast = allPlayers.length === 3 || allPlayers.length === 5
  const hasDanger = allPlayers.some(p => {
    if (p.id === player.id) return false
    const d1 = player.commanderDamage[p.id] ?? 0
    const d2 = player.commanderDamage2[p.id] ?? 0
    return d1 >= COMMANDER_DAMAGE_THRESHOLD || d2 >= COMMANDER_DAMAGE_THRESHOLD
  })

  return (
    <button
      className={`cmd-mini-grid ${active ? 'active' : ''} ${hasDanger ? 'danger' : ''}`}
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      onClick={onClick}
    >
      {allPlayers.map((p, i) => {
        const isMe = p.id === player.id
        const d1 = player.commanderDamage[p.id] ?? 0
        const d2 = player.commanderDamage2[p.id] ?? 0
        const hasPartner = p.commanderCount === 2
        const atLimit = !isMe && (d1 >= COMMANDER_DAMAGE_THRESHOLD || d2 >= COMMANDER_DAMAGE_THRESHOLD)
        const isLast = i === allPlayers.length - 1
        return (
          <span
            key={p.id}
            className={`cmd-mini-cell ${isMe ? 'me' : ''} ${atLimit ? 'at-limit' : ''}`}
            style={spanLast && isLast ? { gridColumn: '1 / -1' } : undefined}
          >
            {isMe ? 'me' : hasPartner ? `${d1}/${d2}` : d1}
          </span>
        )
      })}
    </button>
  )
}

function AdjBtn({
  onTap, onHold, children, className = '', disabled,
}: {
  onTap: () => void
  onHold: () => void
  children: React.ReactNode
  className?: string
  disabled?: boolean
}) {
  const lp = useLongPress(onTap, onHold)
  return <button className={className} disabled={disabled} {...lp}>{children}</button>
}

const MOMENT_TIMEOUT = 2000

export default function PlayerCard({
  player, allPlayers, onLifeChange, onPoisonChange,
  onApplyCmdDamage, onSetCommanderCount, onExtraCounterChange, onRename,
  onLifeMoment, playerHistory, showHints,
}: Props) {
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState(player.name)
  const [cmdOpen, setCmdOpen]           = useState(false)
  const [countersOpen, setCountersOpen] = useState(false)
  const [historyOpen, setHistoryOpen]   = useState(false)
  // Per-attacker, per-commander running delta shown in the cmd panel during an active moment
  const [cmdMomentDeltas, setCmdMomentDeltas] = useState<Record<number, { c1: number; c2: number }>>({})
  const nameRef = useRef<HTMLInputElement>(null)

  // ── Life-change moment tracking ──────────────────────────────────────────
  const momentDeltaRef    = useRef(0)
  const momentStartLife   = useRef(0)
  const [momentDelta, setMomentDelta] = useState(0)
  const momentTimerRef    = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleLifeChange = (delta: number) => {
    if (momentDeltaRef.current === 0) momentStartLife.current = player.life
    onLifeChange(player.id, delta)
    momentDeltaRef.current += delta
    setMomentDelta(momentDeltaRef.current)
    if (momentTimerRef.current) clearTimeout(momentTimerRef.current)
    momentTimerRef.current = setTimeout(() => {
      const d = momentDeltaRef.current
      if (d !== 0) {
        onLifeMoment(player.id, d, momentStartLife.current + d, 'life')
        momentDeltaRef.current = 0
        setMomentDelta(0)
      }
    }, MOMENT_TIMEOUT)
  }

  // ── Commander-damage moment tracking (per attacker) ──────────────────────
  type CmdRef = { delta: number; startLife: number; timer: ReturnType<typeof setTimeout> | null }
  const cmdMomentRefs = useRef<Record<number, CmdRef>>({})

  const handleCmdDamage = (attackerId: number, delta: number, cmdIndex: 1 | 2 = 1) => {
    // Mirror the clamping logic in applyCommanderDamage so life delta is accurate
    const dmgRecord   = cmdIndex === 1 ? player.commanderDamage : player.commanderDamage2
    const prevDmg     = dmgRecord[attackerId] ?? 0
    const newDmg      = Math.max(0, prevDmg + delta)
    const actualDelta = newDmg - prevDmg   // can differ from delta when clamped at 0
    if (actualDelta === 0) { onApplyCmdDamage(player.id, attackerId, delta, cmdIndex); return }

    onApplyCmdDamage(player.id, attackerId, delta, cmdIndex)

    if (!cmdMomentRefs.current[attackerId]) {
      cmdMomentRefs.current[attackerId] = { delta: 0, startLife: 0, timer: null }
    }
    const ref = cmdMomentRefs.current[attackerId]
    if (ref.delta === 0) ref.startLife = player.life
    ref.delta += -actualDelta  // life change is negative of damage change

    // Keep per-commander display delta in sync
    setCmdMomentDeltas(prev => {
      const cur = prev[attackerId] ?? { c1: 0, c2: 0 }
      return {
        ...prev,
        [attackerId]: cmdIndex === 1
          ? { ...cur, c1: cur.c1 + actualDelta }
          : { ...cur, c2: cur.c2 + actualDelta },
      }
    })

    if (ref.timer) clearTimeout(ref.timer)
    ref.timer = setTimeout(() => {
      const d = ref.delta
      if (d !== 0) {
        onLifeMoment(player.id, d, ref.startLife + d, 'commander', attackerId)
        ref.delta = 0
      }
      setCmdMomentDeltas(prev => ({ ...prev, [attackerId]: { c1: 0, c2: 0 } }))
    }, MOMENT_TIMEOUT)
  }

  // ── Helpers ──────────────────────────────────────────────────────────────
  const startEdit = () => { setEditingName(true); setNameInput(player.name) }
  const commitName = () => {
    const trimmed = nameInput.trim()
    if (trimmed) onRename(player.id, trimmed)
    else setNameInput(player.name)
    setEditingName(false)
  }

  const attackers      = allPlayers
  const activeCounters = COUNTER_DEFS.filter(c => (player.extraCounters[c.key] ?? 0) > 0)
  const poisonAtLimit  = player.poison >= POISON_THRESHOLD

  return (
    <div className={`player-card ${player.eliminated ? 'eliminated' : ''}`}>
      {player.eliminated && <div className="skull-overlay">💀</div>}

      {/* ── Commander damage panel ─────────────────────────────────────── */}
      {cmdOpen && (
        <div className="cmd-panel">
          <div className="cmd-panel-header">
            <span className="cmd-panel-title"><i className="ss ss-cmd" /> Commander Damage Taken</span>
            <button className="cmd-panel-close" onClick={() => setCmdOpen(false)}>✕</button>
          </div>
          <div
            className="cmd-panel-grid"
            style={{ gridTemplateColumns: `repeat(${gridCols(allPlayers.length)}, 1fr)` }}
          >
            {attackers.map((attacker, i) => {
              const isMe = attacker.id === player.id
              const isPartner = attacker.commanderCount === 2
              const dmg1 = player.commanderDamage[attacker.id] ?? 0
              const dmg2 = player.commanderDamage2[attacker.id] ?? 0
              const atLimit1 = dmg1 >= COMMANDER_DAMAGE_THRESHOLD
              const atLimit2 = dmg2 >= COMMANDER_DAMAGE_THRESHOLD
              const atLimit = atLimit1 || atLimit2
              const spanLast = (allPlayers.length === 3 || allPlayers.length === 5) && i === attackers.length - 1
              const deltas = cmdMomentDeltas[attacker.id] ?? { c1: 0, c2: 0 }
              const topDmg = Math.max(dmg1, isPartner ? dmg2 : 0)

              return (
                <div
                  key={attacker.id}
                  className={`cmd-grid-cell ${atLimit ? 'at-limit' : ''} ${isMe ? 'is-me' : ''}`}
                  style={spanLast ? { gridColumn: '1 / -1' } : undefined}
                >
                  {/* Cell header: name + partner toggle */}
                  <div className="cmd-grid-name-row">
                    <span className="cmd-grid-name">{isMe ? 'me' : attacker.name}</span>
                    {!isMe && (
                      <button
                        className={`cmd-partner-btn ${isPartner ? 'active' : ''}`}
                        onClick={() => onSetCommanderCount(attacker.id, isPartner ? 1 : 2)}
                        title={isPartner ? 'Single commander' : 'Partner commanders'}
                      >2</button>
                    )}
                  </div>

                  {isPartner && !isMe ? (
                    <>
                      {/* Commander 1 */}
                      <div className="cmd-sub-row">
                        <span className="cmd-sub-label">Cmd 1</span>
                        <div className="cmd-grid-controls">
                          <AdjBtn className="cmd-grid-btn" onTap={() => handleCmdDamage(attacker.id, -1, 1)} onHold={() => handleCmdDamage(attacker.id, -10, 1)} disabled={dmg1 === 0}>−</AdjBtn>
                          <span className={`cmd-grid-val ${atLimit1 ? 'at-limit' : ''}`}>{dmg1}</span>
                          <AdjBtn className="cmd-grid-btn" onTap={() => handleCmdDamage(attacker.id, 1, 1)} onHold={() => handleCmdDamage(attacker.id, 10, 1)}>+</AdjBtn>
                        </div>
                        {deltas.c1 !== 0 && <span className={`cmd-cell-delta ${deltas.c1 > 0 ? 'neg' : 'pos'}`}>{deltas.c1 > 0 ? '+' : ''}{deltas.c1}</span>}
                      </div>
                      {/* Commander 2 */}
                      <div className="cmd-sub-row">
                        <span className="cmd-sub-label">Cmd 2</span>
                        <div className="cmd-grid-controls">
                          <AdjBtn className="cmd-grid-btn" onTap={() => handleCmdDamage(attacker.id, -1, 2)} onHold={() => handleCmdDamage(attacker.id, -10, 2)} disabled={dmg2 === 0}>−</AdjBtn>
                          <span className={`cmd-grid-val ${atLimit2 ? 'at-limit' : ''}`}>{dmg2}</span>
                          <AdjBtn className="cmd-grid-btn" onTap={() => handleCmdDamage(attacker.id, 1, 2)} onHold={() => handleCmdDamage(attacker.id, 10, 2)}>+</AdjBtn>
                        </div>
                        {deltas.c2 !== 0 && <span className={`cmd-cell-delta ${deltas.c2 > 0 ? 'neg' : 'pos'}`}>{deltas.c2 > 0 ? '+' : ''}{deltas.c2}</span>}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="cmd-grid-controls">
                        <AdjBtn className="cmd-grid-btn" onTap={() => handleCmdDamage(attacker.id, -1)} onHold={() => handleCmdDamage(attacker.id, -10)} disabled={dmg1 === 0}>−</AdjBtn>
                        <span className={`cmd-grid-val ${atLimit1 ? 'at-limit' : ''}`}>{dmg1}</span>
                        <AdjBtn className="cmd-grid-btn" onTap={() => handleCmdDamage(attacker.id, 1)} onHold={() => handleCmdDamage(attacker.id, 10)}>+</AdjBtn>
                      </div>
                      {deltas.c1 !== 0 && <span className={`cmd-cell-delta ${deltas.c1 > 0 ? 'neg' : 'pos'}`}>{deltas.c1 > 0 ? '+' : ''}{deltas.c1}</span>}
                    </>
                  )}

                  <div className="cmd-grid-track">
                    <div
                      className={`cmd-grid-fill ${atLimit ? 'at-limit' : ''}`}
                      style={{ width: `${Math.min(topDmg / COMMANDER_DAMAGE_THRESHOLD, 1) * 100}%`, background: `var(--color-${attacker.color})` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
          {showHints && <p className="cmd-panel-note">Tap ±1 · Hold ±10</p>}
        </div>
      )}

      {/* ── Counters panel ────────────────────────────────────────────── */}
      {countersOpen && (
        <div className="counters-panel">
          <div className="counters-panel-header">
            <span className="counters-panel-title">Counters</span>
            <button className="cmd-panel-close" onClick={() => setCountersOpen(false)}>✕</button>
          </div>
          <div className="counters-grid">
            <div className={`counter-grid-cell ${poisonAtLimit ? 'at-limit' : ''}`}>
              <span className="counter-grid-name"><i className="ss ss-nph" /> Poison</span>
              <div className="counter-grid-controls">
                <AdjBtn className="cmd-adj-btn" onTap={() => onPoisonChange(player.id, -1)} onHold={() => onPoisonChange(player.id, -5)} disabled={player.poison === 0}>−</AdjBtn>
                <span className={`counter-grid-val ${poisonAtLimit ? 'at-limit' : ''}`}>{player.poison}</span>
                <AdjBtn className="cmd-adj-btn" onTap={() => onPoisonChange(player.id, 1)} onHold={() => onPoisonChange(player.id, 5)}>+</AdjBtn>
              </div>
            </div>
            {COUNTER_DEFS.map(({ key, label, icon }) => {
              const val = player.extraCounters[key] ?? 0
              return (
                <div key={key} className="counter-grid-cell">
                  <span className="counter-grid-name">{icon} {label}</span>
                  <div className="counter-grid-controls">
                    <AdjBtn className="cmd-adj-btn" onTap={() => onExtraCounterChange(player.id, key, -1)} onHold={() => onExtraCounterChange(player.id, key, -10)} disabled={val === 0}>−</AdjBtn>
                    <span className="counter-grid-val">{val}</span>
                    <AdjBtn className="cmd-adj-btn" onTap={() => onExtraCounterChange(player.id, key, 1)} onHold={() => onExtraCounterChange(player.id, key, 10)}>+</AdjBtn>
                  </div>
                </div>
              )
            })}
          </div>
          {showHints && <p className="cmd-panel-note">Tap ±1 · Hold ±10</p>}
        </div>
      )}

      {/* ── History panel ─────────────────────────────────────────────── */}
      {historyOpen && (
        <div className="history-panel">
          <div className="history-panel-header">
            <span className="history-panel-title">Life History</span>
            <button className="cmd-panel-close" onClick={() => setHistoryOpen(false)}>✕</button>
          </div>
          <div className="history-list">
            {playerHistory.length === 0 ? (
              <p className="history-empty">No changes yet</p>
            ) : (
              [...playerHistory].reverse().map(m => {
                const attackerName = m.source === 'commander'
                  ? (allPlayers.find(p => p.id === m.attackerId)?.name ?? 'Unknown')
                  : null
                return (
                  <div key={m.id} className={`history-entry ${m.delta > 0 ? 'pos' : 'neg'}`}>
                    {attackerName && <span className="history-attacker">{attackerName}</span>}
                    <span className="history-source">
                      {m.source === 'commander'
                        ? <i className="ss ss-cmd" />
                        : <span className="history-source-life">♥</span>}
                    </span>
                    <span className="history-delta">{m.delta > 0 ? '+' : ''}{m.delta}</span>
                    <span className="history-arrow">→</span>
                    <span className="history-newlife">{m.newLife}</span>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* ── Name row (physical TOP = near board center for ALL players) ── */}
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

      {/* ── Life total ────────────────────────────────────────────────── */}
      <div className="life-section">
        <AdjBtn className="life-btn minus" onTap={() => handleLifeChange(-1)} onHold={() => handleLifeChange(-10)}>−</AdjBtn>
        <div className="life-display">
          {momentDelta !== 0 ? (
            <span className={`life-delta ${momentDelta > 0 ? 'pos' : 'neg'}`}>
              {momentDelta > 0 ? '+' : ''}{momentDelta}
            </span>
          ) : showHints ? (
            <span className="life-hint">tap ±1 · hold ±10</span>
          ) : null}
          <span className="life-number">{player.life}</span>
        </div>
        <AdjBtn className="life-btn plus" onTap={() => handleLifeChange(1)} onHold={() => handleLifeChange(10)}>+</AdjBtn>
      </div>

      {/* ── Status row (physical BOTTOM = opposite the name for ALL players) ──
           counters (left) · cmd-grid (centre) · history (right)
           All three sit at the outer edge near the player, consistent across
           rotated and non-rotated cards because physical bottom is always outer. */}
      <div className="status-row">
        <button
          className={`counters-corner-btn ${countersOpen ? 'active' : ''}`}
          onClick={() => { setCountersOpen(v => !v); setCmdOpen(false); setHistoryOpen(false) }}
          title="Counters"
        ><i className="ms ms-counter-plus" /></button>
        <CmdMiniGrid
          player={player}
          allPlayers={allPlayers}
          active={cmdOpen}
          onClick={() => { setCmdOpen(v => !v); setCountersOpen(false); setHistoryOpen(false) }}
        />
        <button
          className={`history-corner-btn ${historyOpen ? 'active' : ''}`}
          onClick={() => { setHistoryOpen(v => !v); setCmdOpen(false); setCountersOpen(false) }}
          title="Life history"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
            <path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7a6.995 6.995 0 0 1-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
          </svg>
        </button>
      </div>

      {/* ── Active counter chips ─────────────────────────────────────── */}
      {(player.poison > 0 || activeCounters.length > 0) && !countersOpen && (
        <div className="extra-counter-chips">
          {player.poison > 0 && (
            <span className={`extra-chip ${poisonAtLimit ? 'danger' : ''}`}>
              <i className="ss ss-nph" /> {player.poison}
            </span>
          )}
          {activeCounters.map(({ key, icon }) => (
            <span key={key} className="extra-chip">
              {icon} {player.extraCounters[key]}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
