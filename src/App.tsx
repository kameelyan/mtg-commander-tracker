import { useState, useCallback } from 'react'
import type { GameState, MtgColor } from './types'
import {
  createInitialState,
  applyLifeChange,
  applyCommanderDamage,
  applyPoisonChange,
  renamePlayer,
  setPlayerColor,
  resetGame,
} from './gameState'
import PlayerCard from './components/PlayerCard'
import CommanderDamageModal from './components/CommanderDamageModal'
import SettingsModal from './components/SettingsModal'
import HamburgerMenu from './components/HamburgerMenu'
import ReleaseNotesModal from './components/ReleaseNotesModal'
import { RELEASE_NOTES } from './releaseNotes'
import { version } from '../package.json'
import './App.css'

export default function App() {
  const [game, setGame] = useState<GameState>(() => createInitialState(4, 40))
  const [cmdModal, setCmdModal] = useState<{ victimId: number } | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [releaseNotesOpen, setReleaseNotesOpen] = useState(false)

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

  const recolor = useCallback((playerId: number, color: MtgColor) => {
    setGame(g => setPlayerColor(g, playerId, color))
  }, [])

  const handleReset = useCallback((playerCount: number, startingLife: number) => {
    setGame(resetGame(playerCount, startingLife))
    setSettingsOpen(false)
  }, [])

  const activePlayers = game.players.filter(p => !p.eliminated)
  const winner = activePlayers.length === 1 ? activePlayers[0] : null

  return (
    <div className="app">
      <header className="app-header">
        <span className="app-title">⚔ Commander</span>
        <div className="header-actions">
          {winner && <span className="winner-badge">👑 {winner.name} wins!</span>}
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
            onOpenCmdDamage={() => setCmdModal({ victimId: player.id })}
          />
        ))}
      </main>

      {cmdModal && (
        <CommanderDamageModal
          victim={game.players.find(p => p.id === cmdModal.victimId)!}
          attackers={game.players.filter(p => p.id !== cmdModal.victimId)}
          onApply={applyCmd}
          onClose={() => setCmdModal(null)}
        />
      )}

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
