import { useEffect, useRef } from 'react';
import { demoCases, puzzleCases, PUZZLE_TOTAL } from '../lib/game/puzzleCases';
import { useGameStore } from '../store/gameStore';

export default function PuzzleCaseBoard() {
  const { unlockedLevelId, startLevel, xp, playerName } = useGameStore();
  const solved = Math.min(PUZZLE_TOTAL, Math.max(0, unlockedLevelId - 1));
  const activeRung = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => activeRung.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 250);
    return () => window.clearTimeout(timer);
  }, [unlockedLevelId]);

  return (
    <div className="ladder-page">
      <header className="ladder-header">
        <div>
          <span>Nepal PUBG Championship · Data recovery</span>
          <h1>DATA SURVIVOR</h1>
        </div>
        <div className="launch-clock"><strong>{PUZZLE_TOTAL - solved}</strong><span>zones to extraction</span></div>
      </header>

      <div className="ladder-layout">
        <aside className="mission-panel">
          <span>Mission</span>
          <h2>Publish the tournament results</h2>
          <p>Repair {playerName}’s corrupted profile and survive every data zone.</p>
          <div className="core-health">
            <small>Core restored</small>
            <div><i style={{ width: `${(solved / PUZZLE_TOTAL) * 100}%` }} /></div>
            <strong>{Math.round((solved / PUZZLE_TOTAL) * 100)}%</strong>
          </div>
        </aside>

        <main className="data-ladder">
          <div className="ladder-core">🏆<strong>DATABASE MASTER</strong></div>
          {[...puzzleCases].reverse().map((item) => {
            const done = item.id < unlockedLevelId;
            const active = item.id === unlockedLevelId;
            return (
              <div ref={active ? activeRung : undefined} key={item.id} className={`ladder-rung ${done ? 'cleared' : active ? 'active' : 'locked'}`}>
                <div className="ladder-rail" />
                <button type="button" disabled={!done && !active} onClick={() => startLevel(item.id)}>
                  <span>{done ? '✓' : active ? '!' : '🔒'}</span>
                  <div>
                    <small>{item.phase} · SCENE {String(item.id).padStart(2, '0')}</small>
                    <strong>{item.rung}</strong>
                    <em>{done ? item.title : active ? `${item.title} →` : 'Encrypted incident'}</em>
                  </div>
                </button>
                {active && <div className="team-climber">{playerName.toUpperCase()} ▲</div>}
              </div>
            );
          })}
          <div className="ladder-start">🪂 DROP ZONE · CORRUPTED PROFILE</div>
        </main>

        <div className="ladder-side">
          <section className="teacher-demos">
            <span>Teacher access</span>
            <h2>Two playable demos</h2>
            <p>Use these before students begin the main ladder.</p>
            {demoCases.map((demo, index) => (
              <button type="button" key={demo.id} onClick={() => startLevel(demo.id)}>
                <small>DEMO {index + 1}</small>
                <strong>{demo.title}</strong>
                <em>{index === 0 ? 'Show a visual data problem' : 'Build tables live'}</em>
              </button>
            ))}
          </section>
          <aside className="survivor-panel">
            <span>Your survivor</span>
            <h2>{playerName}</h2>
            <div><span>Player ID</span><strong>784219</strong></div>
            <div><span>Rank</span><strong>Crown III</strong></div>
            <div><span>Matches</span><strong>428</strong></div>
            <div><span>K/D</span><strong>4.82</strong></div>
            <div><span>Clan</span><strong>SHADOW</strong></div>
            <div><span>Recovery score</span><strong>{xp}</strong></div>
          </aside>
        </div>
      </div>
    </div>
  );
}
