import { useState, useCallback, useRef } from 'react'
import type { GameState, PlayerColor } from './types'
import {
  createInitialState,
  applyLifeChange,
  applyCommanderDamage,
  applyPoisonChange,
  applyExtraCounter,
  renamePlayer,
  setPlayerColor,
  resetGame,
} from './gameState'
import type { CounterType } from './types'
import PlayerCard from './components/PlayerCard'
import SettingsModal from './components/SettingsModal'
import HamburgerMenu from './components/HamburgerMenu'
import ReleaseNotesModal from './components/ReleaseNotesModal'
import { RELEASE_NOTES } from './releaseNotes'
import { version } from '../package.json'
import './App.css'

export default function App() {
  const [game, setGame] = useState<GameState>(() => createInitialState(4, 40))
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [releaseNotesOpen, setReleaseNotesOpen] = useState(false)
  const [confirmingReset, setConfirmingReset] = useState(false)
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const adjustLife = useCallback((playerId: number, delta: number) => {
    setGame(g => applyLifeChange(g, playerId, delta))
  }, [])

  const adjustPoison = useCallback((playerId: number, delta: number) => {
    setGame(g => applyPoisonChange(g, playerId, delta))
  }, [])

  const applyCmd = useCallback((victimId: number, attackerId: number, delta: number) => {
    setGame(g => applyCommanderDamage(g, victimId, attackerId, delta))
  }, [])

  const rename = useCallback((playerId: number, name: string) => {
    setGame(g => renamePlayer(g, playerId, name))
  }, [])

  const recolor = useCallback((playerId: number, color: PlayerColor) => {
    setGame(g => setPlayerColor(g, playerId, color))
  }, [])

  const adjustExtraCounter = useCallback((playerId: number, counter: CounterType, delta: number) => {
    setGame(g => applyExtraCounter(g, playerId, counter, delta))
  }, [])

  const handleReset = useCallback((playerCount: number, startingLife: number) => {
    setGame(resetGame(playerCount, startingLife))
    setSettingsOpen(false)
  }, [])

  const handleQuickReset = useCallback(() => {
    if (!confirmingReset) {
      setConfirmingReset(true)
      resetTimerRef.current = setTimeout(() => setConfirmingReset(false), 3000)
    } else {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current)
      setConfirmingReset(false)
      setGame(g => resetGame(g.playerCount, g.startingLife))
    }
  }, [confirmingReset])

  const activePlayers = game.players.filter(p => !p.eliminated)
  const winner = activePlayers.length === 1 ? activePlayers[0] : null

  return (
    <div className="app">
      <header className="app-header">
        <span className="app-title">⚔ Commander</span>
        <div className="header-actions">
          {winner && <span className="winner-badge">👑 {winner.name} wins!</span>}
          <button
            className={`reset-quick-btn ${confirmingReset ? 'confirming' : ''}`}
            onClick={handleQuickReset}
            title={confirmingReset ? 'Tap again to reset' : 'Reset game'}
          >
            <span className="reset-icon">↺</span>
            {confirmingReset ? 'Sure?' : 'Reset'}
          </button>
          <HamburgerMenu
            version={version}
            onOpenSettings={() => setSettingsOpen(true)}
            onOpenReleaseNotes={() => setReleaseNotesOpen(true)}
          />
        </div>
      </header>

      <main className={`player-grid players-${game.playerCount}`}>
        {game.players.map(player => (
          <PlayerCard
            key={player.id}
            player={player}
            allPlayers={game.players}
            onLifeChange={adjustLife}
            onPoisonChange={adjustPoison}
            onRename={rename}
            onRecolor={recolor}
            onApplyCmdDamage={applyCmd}
            onExtraCounterChange={adjustExtraCounter}
          />
        ))}
      </main>

      {settingsOpen && (
        <SettingsModal
          currentPlayerCount={game.playerCount}
          currentStartingLife={game.startingLife}
          onReset={handleReset}
          onClose={() => setSettingsOpen(false)}
        />
      )}

      {releaseNotesOpen && (
        <ReleaseNotesModal
          notes={RELEASE_NOTES}
          currentVersion={version}
          onClose={() => setReleaseNotesOpen(false)}
        />
      )}
    </div>
  )
}
