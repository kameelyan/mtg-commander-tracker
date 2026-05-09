import { useState, useCallback, useRef } from 'react'
import type { GameState, LifeMoment } from './types'
import {
  createInitialState,
  applyLifeChange,
  applyCommanderDamage,
  applyPoisonChange,
  applyExtraCounter,
  renamePlayer,
  setCommanderCount,
  resetGame,
  WIN_THRESHOLD,
} from './gameState'
import type { CounterType } from './types'
import PlayerCard from './components/PlayerCard'
import HamburgerMenu from './components/HamburgerMenu'
import ReleaseNotesModal from './components/ReleaseNotesModal'
import { RELEASE_NOTES } from './releaseNotes'
import { version } from '../package.json'
import './App.css'

export default function App() {
  const [game, setGame] = useState<GameState>(() => createInitialState(4, 40))
  const [history, setHistory] = useState<LifeMoment[]>([])
  const nextMomentId = useRef(0)
  const [showHints, setShowHints] = useState(() => {
    const v = localStorage.getItem('showHints')
    return v === null ? true : v === 'true'
  })
  const toggleHints = useCallback((val: boolean) => {
    setShowHints(val)
    localStorage.setItem('showHints', String(val))
  }, [])
  const [releaseNotesOpen, setReleaseNotesOpen] = useState(false)

  const adjustLife = useCallback((playerId: number, delta: number) => {
    setGame(g => applyLifeChange(g, playerId, delta))
  }, [])

  const addMoment = useCallback((
    playerId: number, delta: number, newLife: number,
    source: 'life' | 'commander', attackerId?: number,
  ) => {
    setHistory(h => [...h, { id: nextMomentId.current++, playerId, delta, newLife, source, attackerId, timestamp: Date.now() }])
  }, [])

  const adjustPoison = useCallback((playerId: number, delta: number) => {
    setGame(g => applyPoisonChange(g, playerId, delta))
  }, [])

  const applyCmd = useCallback((victimId: number, attackerId: number, delta: number, cmdIndex?: 1 | 2) => {
    setGame(g => applyCommanderDamage(g, victimId, attackerId, delta, cmdIndex ?? 1))
  }, [])

  const toggleCommanderCount = useCallback((playerId: number, count: 1 | 2) => {
    setGame(g => setCommanderCount(g, playerId, count))
  }, [])

  const rename = useCallback((playerId: number, name: string) => {
    setGame(g => renamePlayer(g, playerId, name))
  }, [])

  const adjustExtraCounter = useCallback((playerId: number, counter: CounterType, delta: number) => {
    setGame(g => applyExtraCounter(g, playerId, counter, delta))
  }, [])

  const handleReset = useCallback((playerCount: number, startingLife: number) => {
    setGame(resetGame(playerCount, startingLife))
    setHistory([])
  }, [])

  const activePlayers = game.players.filter(p => !p.eliminated)
  const winner = game.startingLife === 0
    ? (game.players.find(p => p.life >= WIN_THRESHOLD) ?? null)
    : (activePlayers.length === 1 ? activePlayers[0] : null)

  return (
    <div className="app">
      <main className={`player-grid players-${game.playerCount}`}>
        {game.players.map(player => (
          <PlayerCard
            key={player.id}
            player={player}
            allPlayers={game.players}
            onLifeChange={adjustLife}
            onPoisonChange={adjustPoison}
            onRename={rename}

            onApplyCmdDamage={applyCmd}
            onSetCommanderCount={toggleCommanderCount}
            onExtraCounterChange={adjustExtraCounter}
            onLifeMoment={addMoment}
            playerHistory={history.filter(m => m.playerId === player.id)}
            showHints={showHints}
          />
        ))}
      </main>

      {winner && (
        <div className="winner-banner">👑 {winner.name} wins!</div>
      )}

      <HamburgerMenu
        version={version}
        playerCount={game.playerCount}
        startingLife={game.startingLife}
        showHints={showHints}
        onReset={handleReset}
        onToggleHints={toggleHints}
        onOpenReleaseNotes={() => setReleaseNotesOpen(true)}
      />

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
