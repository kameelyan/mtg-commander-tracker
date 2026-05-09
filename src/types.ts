export type PlayerColor =
  | 'cobalt'    // deep blue
  | 'crimson'   // vivid red
  | 'emerald'   // forest green
  | 'violet'    // royal purple
  | 'amber'     // dark gold
  | 'teal'      // dark teal
  | 'rose'      // hot pink
  | 'indigo'    // deep indigo
  | 'orange'    // burnt orange
  | 'slate'     // dark slate
  | 'jade'      // deep jade
  | 'ruby'      // deep ruby

export type CounterType =
  | 'energy' | 'experience' | 'rad' | 'charge'
  | 'lore' | 'spore' | 'level' | 'loyalty'
  | 'time' | 'bounty'

export interface Player {
  id: number
  name: string
  life: number
  poison: number
  color: PlayerColor
  commanderCount: 1 | 2                   // 2 = partner commanders
  commanderDamage: Record<number, number>  // primary commander damage received per attacker
  commanderDamage2: Record<number, number> // partner commander damage received per attacker
  extraCounters: Partial<Record<CounterType, number>>
  eliminated: boolean
}

export interface LifeMoment {
  id: number
  playerId: number
  delta: number                        // net life change (positive = gain, negative = loss)
  newLife: number                      // life total after this moment
  source: 'life' | 'commander'
  attackerId?: number                  // set when source === 'commander'
  timestamp: number
}

export interface GameState {
  players: Player[]
  startingLife: number
  playerCount: number
  turn: number
}
