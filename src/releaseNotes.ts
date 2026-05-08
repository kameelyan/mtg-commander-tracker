export interface ReleaseNote {
  version: string
  date: string
  changes: { type: 'new' | 'fix' | 'change'; text: string }[]
}

export const RELEASE_NOTES: ReleaseNote[] = [
  {
    version: '1.4.0',
    date: '2026-05-08',
    changes: [
      { type: 'change', text: 'Hold repeat interval slowed to 300ms for easier control' },
      { type: 'new', text: 'Setting to show/hide hold-to-adjust hints (on by default, persisted across sessions)' },
    ],
  },
  {
    version: '1.3.0',
    date: '2026-05-08',
    changes: [
      { type: 'change', text: 'Removed quick ±5/±10 buttons — tap any ± for 1, hold for 10' },
      { type: 'change', text: 'Long-press applies to life, poison, commander damage, and all extra counters' },
    ],
  },
  {
    version: '1.2.0',
    date: '2026-05-08',
    changes: [
      { type: 'new', text: 'Counter panel per quadrant: Energy ⚡, Experience ⭐, Rad ☢, Charge ⚙, Lore 📜, Spore 🍄, Level ↑, Loyalty ◆, Time ⏳, Bounty 💰' },
      { type: 'new', text: 'Active counter chips shown on card face when panel is closed' },
    ],
  },
  {
    version: '1.1.0',
    date: '2026-05-08',
    changes: [
      { type: 'new', text: 'Inline commander damage panel per quadrant — all players can manage simultaneously' },
      { type: 'change', text: 'MTG mana-inspired color palette: Island blue, Mountain red, Forest green, Swamp purple, Plains gold, and more' },
    ],
  },
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
