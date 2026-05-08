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
  commanderDamage: Record<number, number>
  extraCounters: Partial<Record<CounterType, number>>
  eliminated: boolean
}

export interface GameState {
  players: Player[]
  startingLife: number
  playerCount: number
  turn: number
}
