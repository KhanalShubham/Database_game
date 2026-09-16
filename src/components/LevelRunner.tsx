import { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { levelMap } from '../lib/game/levels';
import { getHint } from '../lib/game/hintEngine';
import ChallengeHost from './game/ChallengeHost';

export default function LevelRunner() {
  const { currentLevelId, setGameState, completeLevel, takeDamage, xp, health } = useGameStore();
  const level = currentLevelId ? levelMap[currentLevelId] : null;

  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [hintStage, setHintStage] = useState(0);
  const [hintText, setHintText] = useState('');
  const [showExplain, setShowExplain] = useState(false);
  const [noteOpen, setNoteOpen] = useState(true);
  const [challengeKey, setChallengeKey] = useState(0);

  useEffect(() => {
    setIsSuccess(false);
    setErrorMsg('');
    setHintStage(0);
    setHintText('');
    setShowExplain(false);
    setChallengeKey((k) => k + 1);
  }, [currentLevelId]);

  if (!level) return null;

  const handleSuccess = () => {
    setIsSuccess(true);
    setErrorMsg('');
  };

  const handleFail = (msg: string) => {
    takeDamage(5);
    setErrorMsg(msg);
  };

  const handleProceed = () => {
    completeLevel(level.id, level.xpReward, level.unlocksConcept ? [level.unlocksConcept] : [], level.healthChange);
  };

  const useHint = () => {
    const h = getHint(level.hints, hintStage);
    setHintText(h.text);
    if (!h.exhausted) setHintStage(hintStage + 1);
    else setShowExplain(true);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-h-0">
      <div className="border-b border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3 bg-slate-950">
        <div className="flex items-center gap-3 min-w-0">
          {level.isBoss && (
            <span className="text-amber-300 text-[10px] font-semibold border border-amber-700/60 px-2 py-0.5">BOSS</span>
          )}
          <h1 className="font-semibold text-sm truncate">
            LEVEL {String(level.id).padStart(2, '0')} — {level.title.replace(/^⚔\s*/, '')}
          </h1>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span>XP {xp}</span>
          <span className="w-36">
            <span className="sr-only">Database health {health} percent</span>
            <div className="flex justify-between mb-0.5">
              <span>HEALTH</span>
              <span className={health < 40 ? 'text-red-400' : health < 70 ? 'text-amber-300' : 'text-emerald-400'}>{health}%</span>
            </div>
            <div className="h-1.5 bg-slate-800 overflow-hidden">
              <div className={`h-full ${health < 40 ? 'bg-red-500' : health < 70 ? 'bg-amber-400' : 'bg-emerald-500'}`} style={{ width: `${health}%` }} />
            </div>
          </span>
          <button type="button" onClick={() => setGameState('MAP')} className="text-slate-500 hover:text-slate-300 focus:outline focus:outline-2 focus:outline-emerald-500">
            Map
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_20rem] min-h-0 overflow-hidden">
        <div className="min-h-0 overflow-y-auto p-4 md:p-6 space-y-4">
          <p className="text-sm text-slate-300">{level.missionText}</p>
          {isSuccess && (
            <div className="border border-emerald-700 bg-emerald-950/40 p-3 space-y-2">
              <p className="text-sm text-emerald-200">{level.successFeedback}</p>
              <button
                type="button"
                onClick={handleProceed}
                className="border border-emerald-600 text-emerald-300 px-4 py-2 text-xs font-semibold hover:bg-emerald-950 focus:outline focus:outline-2 focus:outline-emerald-500"
              >
                Continue
              </button>
            </div>
          )}
          <ChallengeHost key={challengeKey} level={level} onSuccess={handleSuccess} onFail={handleFail} />
        </div>

        <aside className="border-t lg:border-t-0 lg:border-l border-slate-800 bg-slate-950 p-4 overflow-y-auto space-y-4">
          <section>
            <h2 className="text-[11px] uppercase tracking-wider text-slate-500 mb-2">Mission</h2>
            <ul className="text-xs text-slate-300 space-y-1">
              {level.storyBriefing.filter(Boolean).slice(0, 6).map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <div className="flex gap-2 mt-3">
              <button
                type="button"
                onClick={useHint}
                className="border border-slate-600 px-3 py-1.5 text-xs hover:border-amber-400 focus:outline focus:outline-2 focus:outline-emerald-500"
              >
                Hint
              </button>
            </div>
            {hintText && <p className="mt-2 text-xs text-amber-200">{hintText}</p>}
            {showExplain && <p className="mt-2 text-xs text-slate-400">{level.conceptDefinition || level.successFeedback}</p>}
            {errorMsg && (
              <p className="mt-3 text-xs text-red-300 border border-red-900/60 p-2" role="alert">
                {errorMsg}
                <span className="block text-slate-500 mt-1">Retry is allowed. −5 health.</span>
              </p>
            )}
            {isSuccess && (
              <div className="mt-3 space-y-2">
                <p className="text-xs text-emerald-300 border border-emerald-900 p-2">
                  Correct. {level.successFeedback}
                  <span className="block text-slate-400 mt-1">+{level.xpReward} XP · health {level.healthChange >= 0 ? '+' : ''}{level.healthChange}</span>
                  {level.unlocksConcept && <span className="block mt-1">Unlocked: {level.unlocksConcept}</span>}
                </p>
                <button
                  type="button"
                  onClick={handleProceed}
                  className="w-full border border-emerald-600 text-emerald-300 py-2 text-xs font-semibold hover:bg-emerald-950 focus:outline focus:outline-2 focus:outline-emerald-500"
                >
                  Continue
                </button>
              </div>
            )}
          </section>

          <section>
            <button
              type="button"
              onClick={() => setNoteOpen((v) => !v)}
              className="text-[11px] uppercase tracking-wider text-slate-500 mb-2"
            >
              Quick note {noteOpen ? '▾' : '▸'}
            </button>
            {noteOpen && (
              <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-line">
                {level.quickNote || level.conceptDefinition || 'Fix the database. Discover the rule after you act.'}
              </p>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
