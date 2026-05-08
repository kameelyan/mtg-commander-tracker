import type { Player } from '../types'
import { COMMANDER_DAMAGE_THRESHOLD } from '../gameState'
import './CommanderDamageModal.css'

interface Props {
  victim: Player
  attackers: Player[]
  onApply: (victimId: number, attackerId: number, delta: number) => void
  onClose: () => void
}

export default function CommanderDamageModal({ victim, attackers, onApply, onClose }: Props) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Commander Damage → <span className="victim-name">{victim.name}</span></h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <p className="modal-note">Each entry also adjusts {victim.name}'s life total.</p>

        <div className="attacker-list">
          {attackers.map(attacker => {
            const current = victim.commanderDamage[attacker.id] ?? 0
            const atLimit = current >= COMMANDER_DAMAGE_THRESHOLD
            return (
              <div
                key={attacker.id}
                className={`attacker-row ${atLimit ? 'at-limit' : ''}`}
              >
                <div
                  className="attacker-color-bar"
                  style={{ background: `var(--color-${attacker.color})` }}
                />
                <span className="attacker-name">{attacker.name}</span>
                <div className="cmd-controls">
                  <button
                    className="cmd-btn minus"
                    onClick={() => onApply(victim.id, attacker.id, -1)}
                    disabled={current === 0}
                  >−</button>
                  <span className={`cmd-value ${atLimit ? 'danger' : ''}`}>
                    {current}
                    {atLimit && ' ⚠'}
                  </span>
                  <button
                    className="cmd-btn plus"
                    onClick={() => onApply(victim.id, attacker.id, 1)}
                  >+</button>
                </div>
                <div className="cmd-pips">
                  {Array.from({ length: COMMANDER_DAMAGE_THRESHOLD }, (_, i) => (
                    <span
                      key={i}
                      className={`pip ${i < current ? 'filled' : ''} ${i >= COMMANDER_DAMAGE_THRESHOLD - 1 ? 'last' : ''}`}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
