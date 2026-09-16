import { useGameStore } from '../store/gameStore';

export default function IntroScreen() {
  const setGameState = useGameStore((s) => s.setGameState);
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-lg bg-white border border-stone-200 p-8 space-y-5">
        <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">Database: Zero</p>
        <h1 className="font-display text-4xl leading-tight">The file is failing. Repair it.</h1>
        <p className="text-ink-soft">You are the new database engineer. There is no lecture. There is a mess on the desk.</p>
        <p className="text-sm">Health 37%. Start with the hospital reception book.</p>
        <button type="button" className="btn-primary" onClick={() => setGameState('MAP')}>
          Open case files
        </button>
      </div>
    </div>
  );
}
