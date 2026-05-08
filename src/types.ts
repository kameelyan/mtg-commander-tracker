export type MtgColor = 'white' | 'blue' | 'black' | 'red' | 'green' | 'gold' | 'colorless'

export interface Player {
  id: number
  name: string
  life: number
  poison: number
  color: MtgColor
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
