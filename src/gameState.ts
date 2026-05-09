import type { GameState, PlayerColor, Player, CounterType } from './types'

const COLORS: PlayerColor[] = ['cobalt', 'crimson', 'emerald', 'violet', 'amber', 'teal', 'rose', 'indigo', 'orange', 'slate', 'jade', 'ruby']
const DEFAULT_NAMES = ['Aragorn', 'Breya', 'Chandra', 'Dimir', 'Edgar', 'Freyalise']

export const COMMANDER_DAMAGE_THRESHOLD = 21
export const POISON_THRESHOLD = 10
export const WIN_THRESHOLD = 20   // used in ascending-life modes (e.g. Lorcana)

export function createPlayer(id: number, playerCount: number, startingLife: number): Player {
  const commanderDamage: Record<number, number> = {}
  for (let i = 0; i < playerCount; i++) {
    if (i !== id) commanderDamage[i] = 0
  }
  return {
    id,
    name: DEFAULT_NAMES[id] ?? `Player ${id + 1}`,
    life: startingLife,
    poison: 0,
    color: COLORS[id % COLORS.length],
    commanderCount: 1,
    commanderDamage,
    commanderDamage2: {},
    extraCounters: {},
    eliminated: false,
  }
}

export function createInitialState(playerCount = 4, startingLife = 40): GameState {
  return {
    playerCount,
    startingLife,
    turn: 1,
    players: Array.from({ length: playerCount }, (_, i) =>
      createPlayer(i, playerCount, startingLife)
    ),
  }
}

// startingLife === 0 means ascending-life mode (e.g. Lorcana) — life hitting 0 is not death
export function checkEliminated(player: Player, startingLife: number): boolean {
  if (startingLife !== 0 && player.life <= 0) return true
  if (player.poison >= POISON_THRESHOLD) return true
  for (const dmg of Object.values(player.commanderDamage)) {
    if (dmg >= COMMANDER_DAMAGE_THRESHOLD) return true
  }
  // Check partner commander damage separately — each must independently reach 21
  for (const dmg of Object.values(player.commanderDamage2)) {
    if (dmg >= COMMANDER_DAMAGE_THRESHOLD) return true
  }
  return false
}

export function applyLifeChange(state: GameState, playerId: number, delta: number): GameState {
  return {
    ...state,
    players: state.players.map(p => {
      if (p.id !== playerId) return p
      const updated = { ...p, life: p.life + delta }
      return { ...updated, eliminated: checkEliminated(updated, state.startingLife) }
    }),
  }
}

export function applyCommanderDamage(
  state: GameState,
  victimId: number,
  attackerId: number,
  delta: number,
  cmdIndex: 1 | 2 = 1,
): GameState {
  return {
    ...state,
    players: state.players.map(p => {
      if (p.id !== victimId) return p
      const dmgKey = cmdIndex === 1 ? 'commanderDamage' : 'commanderDamage2'
      const prevDmg = p[dmgKey][attackerId] ?? 0
      const newDmg = Math.max(0, prevDmg + delta)
      const actualDelta = newDmg - prevDmg
      const newLife = p.life - actualDelta
      const updated = {
        ...p,
        life: newLife,
        [dmgKey]: { ...p[dmgKey], [attackerId]: newDmg },
      }
      return { ...updated, eliminated: checkEliminated(updated, state.startingLife) }
    }),
  }
}

export function applyPoisonChange(state: GameState, playerId: number, delta: number): GameState {
  return {
    ...state,
    players: state.players.map(p => {
      if (p.id !== playerId) return p
      const updated = { ...p, poison: Math.max(0, p.poison + delta) }
      return { ...updated, eliminated: checkEliminated(updated, state.startingLife) }
    }),
  }
}

export function renamePlayer(state: GameState, playerId: number, name: string): GameState {
  return {
    ...state,
    players: state.players.map(p => (p.id === playerId ? { ...p, name } : p)),
  }
}

export function setPlayerColor(state: GameState, playerId: number, color: PlayerColor): GameState {
  return {
    ...state,
    players: state.players.map(p => (p.id === playerId ? { ...p, color } : p)),
  }
}

export function setCommanderCount(state: GameState, playerId: number, count: 1 | 2): GameState {
  return {
    ...state,
    players: state.players.map(p => (p.id === playerId ? { ...p, commanderCount: count } : p)),
  }
}

export function applyExtraCounter(
  state: GameState,
  playerId: number,
  counter: CounterType,
  delta: number,
): GameState {
  return {
    ...state,
    players: state.players.map(p => {
      if (p.id !== playerId) return p
      const current = p.extraCounters[counter] ?? 0
      const next = Math.max(0, current + delta)
      return { ...p, extraCounters: { ...p.extraCounters, [counter]: next } }
    }),
  }
}

export function resetGame(playerCount: number, startingLife: number): GameState {
  return createInitialState(playerCount, startingLife)
}
