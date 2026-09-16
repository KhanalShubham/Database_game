import { useGameStore } from '../store/gameStore';
import { levels, worlds } from '../lib/game/levels';

export default function CityMap() {
  const { unlockedLevelId, startLevel } = useGameStore();

  return (
    <div className="flex-1 overflow-y-auto py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-10">
        <div className="text-center">
          <div className="text-slate-500 text-xs tracking-widest mb-2">DATABASE WORLD</div>
          <h2 className="text-2xl font-semibold">Repair the database</h2>
        </div>

        {worlds.map((world) => {
          const worldLevels = levels.filter((l) => l.worldId === world.id);
          const completed = worldLevels.filter((l) => l.id < unlockedLevelId).length;

          return (
            <section key={world.id} className="border border-slate-800 p-5">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <div className="text-[11px] text-slate-500">WORLD {world.id}</div>
                  <h3 className="text-lg font-semibold">{world.name}</h3>
                  <p className="text-sm text-slate-400">{world.subtitle}</p>
                </div>
                <div className="text-xs text-slate-400">
                  {completed} / {worldLevels.length}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {worldLevels.map((level) => {
                  const unlocked = level.id <= unlockedLevelId;
                  const done = level.id < unlockedLevelId;
                  const current = level.id === unlockedLevelId;
                  return (
                    <button
                      key={level.id}
                      type="button"
                      disabled={!unlocked}
                      onClick={() => startLevel(level.id)}
                      aria-label={`Level ${level.id} ${level.title}${unlocked ? '' : ' locked'}`}
                      className={`px-3 py-3 border text-left text-xs min-h-20 focus:outline focus:outline-2 focus:outline-emerald-500 ${
                        done
                          ? 'border-emerald-800 bg-emerald-950/30 text-emerald-200'
                          : current
                            ? 'border-emerald-500 text-emerald-200'
                            : unlocked
                              ? 'border-slate-600'
                              : 'border-slate-800 text-slate-600 cursor-not-allowed'
                      }`}
                    >
                      <div className="font-semibold">
                        {String(level.id).padStart(2, '0')}
                        {level.isBoss ? ' ★' : ''}
                      </div>
                      <div className="mt-1 leading-snug">{level.title.replace(/^⚔\s*/, '')}</div>
                      <div className="text-[10px] mt-2 text-slate-500">
                        {done ? 'Cleared' : current ? 'Open' : 'Locked'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
