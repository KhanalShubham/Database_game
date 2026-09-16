import { useEffect } from 'react';
import { useGameStore } from './store/gameStore';
import IntroScreen from './components/IntroScreen';
import CityMap from './components/CityMap';
import LevelRunner from './components/LevelRunner';

function HealthBar() {
  const { health, xp, unlockedLevelId } = useGameStore();
  return (
    <div className="flex items-center gap-6 text-xs font-mono">
      <div className="flex flex-col items-end">
        <span className="text-slate-500">XP</span>
        <span className="text-primary font-bold">{xp}</span>
      </div>
      <div className="flex flex-col items-end">
        <span className="text-slate-500">LEVEL</span>
        <span className="text-foreground font-bold">{Math.max(0, unlockedLevelId - 1)} / 50</span>
      </div>
      <div className="flex flex-col items-end w-40">
        <div className="flex justify-between w-full">
          <span className="text-slate-500">SYSTEM HEALTH</span>
          <span className={`font-bold ${health < 40 ? 'text-destructive' : health < 70 ? 'text-warning' : 'text-primary'}`}>{health}%</span>
        </div>
        <div className="w-full h-1.5 bg-slate-800 mt-1 overflow-hidden border border-slate-700">
          <div
            className={`h-full transition-all duration-700 ${health < 40 ? 'bg-destructive' : health < 70 ? 'bg-warning' : 'bg-primary'}`}
            style={{ width: `${health}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function App() {
  const gameState = useGameStore((state) => state.gameState);
  const unlockedLevelId = useGameStore((state) => state.unlockedLevelId);
  const setGameState = useGameStore((state) => state.setGameState);

  useEffect(() => {
    const resume = () => {
      const s = useGameStore.getState();
      if (s.unlockedLevelId > 1 && s.gameState === 'INTRO') s.setGameState('MAP');
    };
    resume();
    return useGameStore.persist.onFinishHydration(resume);
  }, [setGameState, unlockedLevelId]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-mono overflow-hidden">
      {gameState !== 'INTRO' && (
        <header className="border-b border-slate-800 bg-slate-950 px-6 py-3 flex justify-between items-center z-20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="font-bold text-primary tracking-[0.2em] text-sm">DATABASE: ZERO</span>
          </div>
          <HealthBar />
        </header>
      )}

      <main className="flex-1 flex flex-col overflow-hidden">
        {gameState === 'INTRO' && <IntroScreen />}
        {gameState === 'MAP' && <CityMap />}
        {gameState === 'LEVEL' && <LevelRunner />}
      </main>
    </div>
  );
}

export default App;
