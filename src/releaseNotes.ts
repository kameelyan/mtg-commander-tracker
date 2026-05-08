export interface ReleaseNote {
  version: string
  date: string
  changes: { type: 'new' | 'fix' | 'change'; text: string }[]
}

export const RELEASE_NOTES: ReleaseNote[] = [
  {
    version: '1.0.0',
    date: '2026-05-08',
    changes: [
      { type: 'new', text: 'Quadrant table layout — each player\'s card faces them, top row rotated 180°' },
      { type: 'new', text: 'Commander damage matrix: tracking per-attacker with automatic life total sync' },
      { type: 'new', text: 'Poison counter tracking with elimination at 10' },
      { type: 'new', text: 'Player elimination detection (0 life, 10 poison, or 21 commander damage)' },
      { type: 'new', text: 'Per-player MTG color identity themes (W/U/B/R/G/M/C)' },
      { type: 'new', text: 'Quick ±1, ±5, ±10 life buttons' },
      { type: 'new', text: 'Tap player name to rename in-place' },
      { type: 'new', text: 'Settings: 2–6 players, custom starting life, new game reset' },
      { type: 'new', text: 'Responsive layout for ZFold 5 (portrait & unfolded) and Chromebook' },
      { type: 'new', text: 'PWA — installable on Android and Chrome OS, works offline' },
      { type: 'new', text: 'Hamburger menu with Settings and Release Notes' },
    ],
  },
]
