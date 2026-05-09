# MTG Commander Life Tracker

A mobile-first PWA for tracking life totals, commander damage, poison counters, and extra counters during Commander (EDH) games of Magic: The Gathering.

**Live:** https://kameelyan.github.io/mtg-commander-tracker

---

## Features

- Quadrant layout — each player's card faces them (top row rotated 180°)
- Life total tracking with tap ±1 / hold ±10
- Life change history — moments grouped with 2 s idle timeout, per-player panel
- Commander damage matrix with partner commander support (Cmd 1 / Cmd 2)
- Poison counter tracking (elimination at 10)
- Extra counters: Energy, Experience, Rad, Charge, Lore, Spore, Level, Loyalty, Time, Bounty
- Player elimination detection (0 life, 10 poison, or 21 commander damage from any one commander)
- Ascending-life mode (starting life = 0, e.g. Lorcana — first to 20 wins)
- 2–6 players, custom starting life
- MTG color identity themes per player
- Installable PWA — works offline on Android and Chrome OS
- Rename players in-place

---

## Ideas Backlog

Things worth doing but not yet scheduled. Rough priority order within each section.

### Gameplay

- [ ] **Pauper Commander mode** — preset that sets starting life to 30 and commander damage threshold to 16
- [ ] **Monarch tracking** — crown icon that passes between players; visible on the board at a glance
- [ ] **The Ring tracking** — ring tempts you mechanic; track which player is the ring-bearer and ring level (1–4)
- [ ] **Mana pool tracker** — quick floating panel to track floating mana mid-turn
- [ ] **Storm count** — simple incrementing counter for the current turn, auto-resets on next turn
- [ ] **Turn order indicator** — highlight whose turn it is; arrow or glow around their card
- [ ] **Game timer** — total elapsed time + optional per-turn timer
- [ ] **Dice roller** — inline die roller (d4, d6, d8, d10, d12, d20, d100) accessible from the hamburger menu
- [ ] **Random starting player** — button that randomly highlights one player as the first to take a turn

### UX / Polish

- [ ] **Undo last change** — single-tap undo button (or shake gesture) that reverses the last life/counter delta
- [ ] **Haptic feedback** — vibrate on tap/hold for tactile confirmation (Web Vibration API)
- [ ] **Player color picker** — let players choose their own color identity instead of auto-assigned
- [ ] **Commander card art background** — search for your commander via Scryfall API and use the card art as the player card background
- [ ] **Landscape / tablet layout** — alternate grid layout optimised for horizontal screens
- [ ] **Font size scaling** — accessibility setting to bump up life total font size
- [ ] **Sound effects** — optional subtle click/chime on life changes

### Social / Session

- [ ] **Game log export** — share a plain-text or CSV summary of all life moments from the session
- [ ] **Multi-device sync** — real-time sync across phones so each player can control their own card
- [ ] **Game history across sessions** — persist completed games with winner and final life totals

### Meta / Links

- [ ] **GitHub link** — link to the repo in the hamburger menu or about section
- [ ] **Ko-fi link** — support / tip jar link in the hamburger menu

### Technical

- [ ] **Custom PWA icons** — replace generic icons with CMD-symbol branded 192/512 px PNGs
- [ ] **Dark / light mode toggle** — respect system preference by default, manual override in menu
- [ ] **Accessibility audit** — ARIA labels, focus management for keyboard/switch-access users
