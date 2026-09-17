import { useEffect } from 'react';
import { useGameStore } from './store/gameStore';
import IntroScreen from './components/IntroScreen';
import PuzzleCaseBoard from './components/PuzzleCaseBoard';
import PuzzleCaseRunner from './components/PuzzleCaseRunner';
import { PUZZLE_TOTAL } from './lib/game/puzzleCases';

function GameProgress() {
  const { xp, unlockedLevelId } = useGameStore();
  const solved = Math.min(PUZZLE_TOTAL, Math.max(0, unlockedLevelId - 1));
  return (
    <div className="header-progress">
      <span>Zone {Math.min(unlockedLevelId, PUZZLE_TOTAL)} / {PUZZLE_TOTAL}</span>
      <div>{Array.from({ length: 8 }, (_, index) => <i key={index} className={index < Math.ceil(solved / 2) ? 'on' : ''} />)}</div>
      <strong>⭐ {xp} XP</strong>
    </div>
  );
}

function App() {
  const gameState = useGameStore((s) => s.gameState);

  useEffect(() => {
    return useGameStore.persist.onFinishHydration(() => {
      const s = useGameStore.getState();
      if (s.unlockedLevelId > 1 && s.gameState === 'INTRO') s.setGameState('MAP');
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground overflow-hidden">
      {gameState !== 'INTRO' && (
        <header className="border-b border-stone-200 bg-white px-6 py-3 flex justify-between items-center shrink-0">
          <span className="font-display text-lg text-primary">PUBG // Data Survivor</span>
          <GameProgress />
        </header>
      )}
      <main className="flex-1 flex flex-col overflow-hidden">
        {gameState === 'INTRO' && <IntroScreen />}
        {gameState === 'MAP' && <PuzzleCaseBoard />}
        {gameState === 'LEVEL' && <PuzzleCaseRunner />}
      </main>
    </div>
  );
}

export default App;
