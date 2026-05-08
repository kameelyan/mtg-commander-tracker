import type { GameState, MtgColor, Player } from './types'

const COLORS: MtgColor[] = ['white', 'blue', 'black', 'red', 'green', 'gold', 'colorless']
const DEFAULT_NAMES = ['Aragorn', 'Breya', 'Chandra', 'Dimir', 'Edgar', 'Freyalise']

export const COMMANDER_DAMAGE_THRESHOLD = 21
export const POISON_THRESHOLD = 10

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
    commanderDamage,
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

export function checkEliminated(player: Player): boolean {
  if (player.life <= 0) return true
  if (player.poison >= POISON_THRESHOLD) return true
  for (const dmg of Object.values(player.commanderDamage)) {
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
      return { ...updated, eliminated: checkEliminated(updated) }
    }),
  }
}

export function applyCommanderDamage(
  state: GameState,
  victimId: number,
  attackerId: number,
  delta: number
): GameState {
  return {
    ...state,
    players: state.players.map(p => {
      if (p.id !== victimId) return p
      const prevDmg = p.commanderDamage[attackerId] ?? 0
      const newDmg = Math.max(0, prevDmg + delta)
      const actualDelta = newDmg - prevDmg
      const newLife = p.life - actualDelta
      const updated = {
        ...p,
        life: newLife,
        commanderDamage: { ...p.commanderDamage, [attackerId]: newDmg },
      }
      return { ...updated, eliminated: checkEliminated(updated) }
    }),
  }
}

export function applyPoisonChange(state: GameState, playerId: number, delta: number): GameState {
  return {
    ...state,
    players: state.players.map(p => {
      if (p.id !== playerId) return p
      const updated = { ...p, poison: Math.max(0, p.poison + delta) }
      return { ...updated, eliminated: checkEliminated(updated) }
    }),
  }
}

export function renamePlayer(state: GameState, playerId: number, name: string): GameState {
  return {
    ...state,
    players: state.players.map(p => (p.id === playerId ? { ...p, name } : p)),
  }
}

export function setPlayerColor(state: GameState, playerId: number, color: MtgColor): GameState {
  return {
    ...state,
    players: state.players.map(p => (p.id === playerId ? { ...p, color } : p)),
  }
}

export function resetGame(playerCount: number, startingLife: number): GameState {
  return createInitialState(playerCount, startingLife)
}
