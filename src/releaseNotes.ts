export interface ReleaseNote {
  version: string
  date: string
  changes: { type: 'new' | 'fix' | 'change'; text: string }[]
}

export const RELEASE_NOTES: ReleaseNote[] = [
  {
    version: '1.7.0',
    date: '2026-05-09',
    changes: [
      { type: 'new', text: 'Life total change history — taps are grouped into moments; running delta shown while tapping, committed after 2 s of idle' },
      { type: 'new', text: 'Per-player history panel (clock icon in status row) shows every life change with source, delta, and resulting total' },
      { type: 'new', text: 'Commander damage changes appear in history with the attacker\'s name and CMD set symbol' },
      { type: 'new', text: 'Partner commander support — tap the "2" button in any attacker cell to split tracking into Cmd 1 and Cmd 2; each is checked independently for the 21-damage rule' },
      { type: 'new', text: 'Starting life of 0 for ascending-life games (e.g. Lorcana) — first to 20 wins, life hitting 0 does not trigger elimination' },
      { type: 'new', text: 'Settings (players, starting life, hints) now live directly in the hamburger menu — one tap away instead of two' },
      { type: 'change', text: 'Hamburger menu moved to a fixed button at the centre of the board; opens a full-screen overlay' },
      { type: 'change', text: 'Reset moved into the hamburger menu with a two-tap confirmation' },
      { type: 'change', text: 'Poison icon updated to the New Phyrexia set symbol' },
      { type: 'fix', text: 'Modal overlays (Settings, Release Notes) now correctly layer above player cards' },
      { type: 'fix', text: 'Panel close buttons given clearance from the centre hamburger button' },
    ],
  },
  {
    version: '1.6.0',
    date: '2026-05-09',
    changes: [
      { type: 'new', text: 'Commander damage button replaced with a mini table grid — see all damage at a glance' },
      { type: 'new', text: 'Commander damage panel now shows a full grid mirroring the table layout; tap ±1, hold ±10' },
      { type: 'new', text: 'Self-commander damage supported — you can now deal damage from your own commander' },
      { type: 'change', text: 'MTG infect icon replaces skull for poison; all counter types now use official MTG icons; experience uses the Commander 2015 set symbol' },
      { type: 'change', text: 'Counters menu icon updated to the generic +1/+1 counter symbol' },
      { type: 'change', text: 'Removed circles from all +/− buttons; more spacing around life totals' },
    ],
  },
  {
    version: '1.5.0',
    date: '2026-05-09',
    changes: [
      { type: 'change', text: 'Poison moved into the Counters panel; shows danger color at 10' },
      { type: 'new', text: 'Eliminated players can be revived — adjust any value to recover from accidental death' },
      { type: 'change', text: 'Counters button moved to top-left corner (☠), diagonally opposite the commander damage button (⚔ bottom-right)' },
    ],
  },
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
