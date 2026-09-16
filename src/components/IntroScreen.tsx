import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';

const LINES = [
  { text: 'DATABASE: ZERO', delay: 200 },
  { text: 'SYSTEM STATUS: CRITICAL', delay: 700, color: 'text-red-400' },
  { text: 'DATABASE HEALTH: 37%', delay: 1200, color: 'text-amber-300' },
  { text: '', delay: 1700 },
  { text: 'You are the new Database Engineer.', delay: 2100, color: 'text-foreground' },
  { text: 'The database is corrupted.', delay: 2600, color: 'text-foreground' },
  { text: 'Your mission: REPAIR THE DATABASE.', delay: 3100, color: 'text-emerald-400' },
];

export default function IntroScreen() {
  const setGameState = useGameStore(state => state.setGameState);
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    const timers = LINES.map((line, i) =>
      setTimeout(() => setVisibleLines(i + 1), line.delay)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  const showButton = visibleLines >= LINES.length;

  return (
    <div className="flex-1 flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-lg border border-primary/30 bg-slate-950 shadow-[0_0_40px_rgba(16,185,129,0.1)]">
        {/* Title bar */}
        <div className="border-b border-primary/20 px-4 py-2 flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-destructive" />
          <div className="w-2.5 h-2.5 rounded-full bg-warning" />
          <div className="w-2.5 h-2.5 rounded-full bg-primary" />
          <span className="ml-3 text-xs text-slate-500 tracking-widest">DATABASE: ZERO — SYSTEM TERMINAL</span>
        </div>

        {/* Terminal content */}
        <div className="p-6 font-mono text-sm min-h-[300px] space-y-1">
          {LINES.slice(0, visibleLines).map((line, i) => (
            <div key={i} className={line.color || 'text-primary'}>
              {line.text !== '' && <span className="text-primary/40 mr-2">&gt;</span>}
              {line.text}
              {i === visibleLines - 1 && line.text !== '' && (
                <span className="ml-1 inline-block w-2 h-4 bg-primary animate-pulse align-middle" />
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="border-t border-primary/20 p-6">
          <button
            onClick={() => setGameState('MAP')}
            disabled={!showButton}
            className="w-full py-3 border-2 border-primary text-primary font-bold tracking-[0.2em] hover:bg-primary hover:text-primary-foreground transition-all disabled:opacity-0 disabled:cursor-not-allowed text-sm"
          >
            [ ENTER SYSTEM ]
          </button>
        </div>
      </div>
    </div>
  );
}
