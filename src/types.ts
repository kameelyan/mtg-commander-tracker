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

export interface Player {
  id: number
  name: string
  life: number
  poison: number
  color: PlayerColor
  // commanderDamage[attackerId] = damage taken from that commander
  commanderDamage: Record<number, number>
  eliminated: boolean
}

export interface GameState {
  players: Player[]
  startingLife: number
  playerCount: number
  turn: number
}
