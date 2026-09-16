import { cases, phases, TOTAL_CASES } from '../lib/game/cases';
import { useGameStore } from '../store/gameStore';

export default function CaseBoard() {
  const { unlockedLevelId, startLevel, xp } = useGameStore();

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">Case files</p>
          <h1 className="font-display text-4xl mt-1">What’s the next problem?</h1>
          <p className="text-ink-soft mt-2 max-w-xl">Eighteen real databases. No lesson titles. Investigate, repair, then protect.</p>
        </div>

        <ol className="flex flex-wrap gap-3 text-sm">
          {phases.map((p) => (
            <li key={p.id} className="border border-stone-300 bg-white px-3 py-1.5">
              {p.label}
            </li>
          ))}
        </ol>

        {phases.map((p) => {
          const list = cases.filter((c) => c.phase === p.id);
          return (
            <section key={p.id}>
              <h2 className="text-xs uppercase tracking-[0.18em] text-ink-soft mb-3">{p.label}</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {list.map((c) => {
                  const open = c.id <= unlockedLevelId;
                  const done = c.id < unlockedLevelId;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      disabled={!open}
                      onClick={() => startLevel(c.id)}
                      className={`text-left bg-white border overflow-hidden ${open ? 'border-stone-300 hover:border-blue-700' : 'border-stone-200 opacity-60 cursor-not-allowed'}`}
                    >
                      <div className="h-28 overflow-hidden">
                        <img src={c.image} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="p-3">
                        <div className="text-[11px] text-ink-soft">Case {String(c.id).padStart(2, '0')}</div>
                        <div className="font-display text-lg leading-tight">{c.title}</div>
                        <div className="text-xs text-ink-soft mt-1">{c.place}</div>
                        <div className="text-xs mt-2">
                          {done ? `Solved · +${c.xp} XP` : open ? 'Open' : 'Locked'}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
        <p className="text-xs text-ink-soft">{Math.max(0, unlockedLevelId - 1)} / {TOTAL_CASES} solved · {xp} XP</p>
      </div>
    </div>
  );
}
