import { useEffect } from 'react';
import { useGameStore } from './store/gameStore';
import IntroScreen from './components/IntroScreen';
import CaseBoard from './components/CaseBoard';
import CaseRunner from './components/CaseRunner';
import { TOTAL_CASES } from './lib/game/cases';

function HealthBar() {
  const { health, xp, unlockedLevelId } = useGameStore();
  return (
    <div className="flex items-center gap-6 text-xs">
      <div>
        <div className="text-ink-soft">XP</div>
        <div className="font-semibold text-primary">{xp}</div>
      </div>
      <div>
        <div className="text-ink-soft">Cases</div>
        <div className="font-semibold">{Math.max(0, unlockedLevelId - 1)} / {TOTAL_CASES}</div>
      </div>
      <div className="w-40">
        <div className="flex justify-between text-ink-soft">
          <span>Health</span>
          <span className="text-foreground">{health}%</span>
        </div>
        <div className="h-1.5 bg-stone-200 mt-1">
          <div className="h-full bg-primary" style={{ width: `${health}%` }} />
        </div>
      </div>
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
          <span className="font-display text-lg text-primary">Database: Zero</span>
          <HealthBar />
        </header>
      )}
      <main className="flex-1 flex flex-col overflow-hidden">
        {gameState === 'INTRO' && <IntroScreen />}
        {gameState === 'MAP' && <CaseBoard />}
        {gameState === 'LEVEL' && <CaseRunner />}
      </main>
    </div>
  );
}

export default App;
