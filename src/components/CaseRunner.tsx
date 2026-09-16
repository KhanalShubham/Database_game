import { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { caseMap } from '../lib/game/cases';
import ScenarioPlay from './game/ScenarioPlay';

export default function CaseRunner() {
  const { currentLevelId, setGameState, completeLevel, takeDamage, xp, health, unlockedConcepts } = useGameStore();
  const c = currentLevelId ? caseMap[currentLevelId] : null;
  const [won, setWon] = useState(false);
  const [err, setErr] = useState('');
  const [hintI, setHintI] = useState(0);
  const [hint, setHint] = useState('');
  const [key, setKey] = useState(0);

  useEffect(() => {
    setWon(false);
    setErr('');
    setHintI(0);
    setHint('');
    setKey((k) => k + 1);
  }, [currentLevelId]);

  if (!c) return null;

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      <div className="shrink-0 border-b border-stone-200 bg-white px-4 py-3 flex justify-between gap-3 items-center">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-ink-soft">Case {String(c.id).padStart(2, '0')} · {c.place}</div>
          <h1 className="font-display text-xl">{c.title}</h1>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span>XP {xp}</span>
          <span className="w-36">
            <div className="flex justify-between"><span>Health</span><span>{health}%</span></div>
            <div className="h-1.5 bg-stone-200 mt-0.5">
              <div className="h-full bg-blue-800" style={{ width: `${health}%` }} />
            </div>
          </span>
          <button type="button" onClick={() => setGameState('MAP')} className="text-ink-soft">Cases</button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6 space-y-4">
          <div className="h-40 overflow-hidden border border-stone-200">
            <img src={c.image} alt="" className="w-full h-full object-cover" />
          </div>
          <blockquote className="font-display text-lg text-stone-800 border-l-2 border-blue-800 pl-4">{c.quote}</blockquote>
          <p className="text-sm">{c.mission}</p>
          {err && <p className="text-sm text-red-800 bg-red-50 border border-red-200 p-3" role="alert">{err}</p>}
          {won && (
            <div className="border border-emerald-300 bg-emerald-50 p-4 space-y-2">
              <p className="text-xs uppercase tracking-wider text-emerald-800">You discovered</p>
              <p className="font-display text-2xl">{c.revealTitle}</p>
              <p className="text-sm">{c.reveal}</p>
              {c.unlockTool && <p className="text-sm">New tool: {c.unlockTool}</p>}
              <p className="text-xs text-ink-soft">+{c.xp} XP · health +{c.health}</p>
              <button
                type="button"
                className="btn-primary"
                onClick={() => completeLevel(c.id, c.xp, c.unlockTool ? [c.unlockTool] : [], c.health)}
              >
                Next case
              </button>
            </div>
          )}
          <ScenarioPlay
            key={key}
            c={c}
            onWin={() => {
              setWon(true);
              setErr('');
            }}
            onFail={(m) => {
              takeDamage(4);
              setErr(m);
            }}
          />
        </div>
        <aside className="lg:w-72 shrink-0 border-t lg:border-t-0 lg:border-l border-stone-200 bg-white p-4 space-y-4 max-h-48 lg:max-h-none overflow-y-auto">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-ink-soft mb-2">Investigation</div>
            <button
              type="button"
              className="chip"
              onClick={() => {
                setHint(c.hints[Math.min(hintI, 2)]);
                if (hintI < 2) setHintI(hintI + 1);
              }}
            >
              Hint
            </button>
            {hint && <p className="text-sm mt-2 text-ink-soft">{hint}</p>}
          </div>
          {unlockedConcepts.length > 0 && (
            <div>
              <div className="text-[11px] uppercase tracking-wider text-ink-soft mb-2">Tools</div>
              <ul className="text-sm space-y-1">{unlockedConcepts.map((t) => <li key={t}>{t}</li>)}</ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
