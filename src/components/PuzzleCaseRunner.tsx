import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { puzzleCaseMap, PUZZLE_TOTAL } from '../lib/game/puzzleCases';
import PuzzlePlay from './game/PuzzlePlay';

export default function PuzzleCaseRunner() {
  const { currentLevelId, unlockedLevelId, completeLevel, setGameState, xp, playerName, addXP } = useGameStore();
  const puzzleCase = currentLevelId ? puzzleCaseMap[currentLevelId] : null;
  const [stepIndex, setStepIndex] = useState(0);
  const [showReveal, setShowReveal] = useState(false);
  const [puzzleKey, setPuzzleKey] = useState(0);

  if (!puzzleCase) return null;
  const step = puzzleCase.steps[stepIndex];
  const isDemo = Boolean(puzzleCase.demo);
  const isFirstClear = !isDemo && puzzleCase.id >= unlockedLevelId;

  const continueCase = () => {
    if (stepIndex < puzzleCase.steps.length - 1) {
      setStepIndex((value) => value + 1);
      setPuzzleKey((value) => value + 1);
    } else {
      setShowReveal(true);
      if (isFirstClear) addXP(puzzleCase.xp);
    }
  };

  const losePoints = () => {
    if (!isFirstClear) return;
    addXP(-10);
  };

  return (
    <div className="puzzle-page">
      <div className="case-mini-header">
        <button type="button" onClick={() => setGameState('MAP')}>← Extraction route</button>
        <span>{isDemo ? puzzleCase.rung : `PUBG Data Zone ${String(puzzleCase.id).padStart(2, '0')} / ${PUZZLE_TOTAL}`}</span>
        <span>{playerName.toUpperCase()} · {xp} pts</span>
      </div>

      <div className="puzzle-screen-layout">
        <main className="puzzle-card">
        <div className="case-scene">
          <img src={puzzleCase.image} alt="" />
          <div>
            <span>{puzzleCase.place} · {puzzleCase.time}</span>
            <h1>{puzzleCase.title}</h1>
          </div>
        </div>

        {!showReveal ? (
          <>
            <div className="step-dots" aria-label={`Step ${stepIndex + 1} of ${puzzleCase.steps.length}`}>
              {puzzleCase.steps.map((_, index) => <span key={index} className={index <= stepIndex ? 'filled' : ''} />)}
            </div>
            <PuzzlePlay
              key={`${puzzleKey}-${stepIndex}`}
              step={step}
              playerName={playerName}
              onContinue={continueCase}
              onWrong={losePoints}
            />
            <button
              type="button"
              className="reset-puzzle"
              onClick={() => setPuzzleKey((value) => value + 1)}
            >
              <RotateCcw size={13} /> Start this step again
            </button>
          </>
        ) : (
          <div className="concept-reveal">
            <div className="ladder-up" aria-hidden="true">
              <span>{playerName.toUpperCase()}</span>
              <strong>▲</strong>
              <em>ZONE CLEARED</em>
            </div>
            <span className="reveal-label">You discovered</span>
            <h2>{puzzleCase.revealTitle}</h2>
            <p>{puzzleCase.reveal}</p>
            <div className="tiny-reward">
              {isDemo ? 'Teacher demo · progress and score are unchanged' : isFirstClear ? `Database stabilized · +${puzzleCase.xp} recovery points` : 'Practice replay · no score change'}
            </div>
            <button
              type="button"
              className="btn-primary"
              onClick={() => isDemo ? setGameState('MAP') : completeLevel(puzzleCase.id, 0, [puzzleCase.revealTitle], 4)}
            >
              {isDemo ? 'Return to demo menu' : puzzleCase.id === PUZZLE_TOTAL ? 'Publish tournament results' : 'Climb to the next rung'}
            </button>
          </div>
        )}
        </main>
      </div>
    </div>
  );
}
