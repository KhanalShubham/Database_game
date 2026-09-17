import { useEffect, useState } from 'react';
import type { PuzzleStep } from '../../lib/game/puzzleCases';
import LiveDataTable from './LiveDataTable';
import BeforeAfterTable from './BeforeAfterTable';
import LiveTableBuilder from './LiveTableBuilder';
import ConsequenceReveal from './ConsequenceReveal';

function fillPlayer(value: string | undefined | null, playerName: string): string {
  if (!value) return '';
  return String(value).replaceAll('{player}', playerName);
}

export default function PuzzlePlay({
  step,
  playerName,
  onContinue,
  onWrong,
}: {
  step: PuzzleStep;
  playerName: string;
  onContinue: () => void;
  onWrong: () => void;
}) {
  const show = (value: string | undefined | null) => fillPlayer(value, playerName);

  const [done, setDone] = useState(false);
  const [wrongMsg, setWrongMsg] = useState('');
  const [showClue, setShowClue] = useState(false);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [placements, setPlacements] = useState<Record<string, string>>({});
  const [verdicts, setVerdicts] = useState<Record<number, 'Accept' | 'Block'>>({});
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [links, setLinks] = useState<Record<string, string>>({});
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowClue(true), 12000);
    return () => window.clearTimeout(timer);
  }, []);

  const success = () => {
    setDone(true);
    setWrongMsg('');
  };

  const fail = (message: string) => {
    setWrongMsg(message);
    setShowClue(true);
    onWrong();
  };

  // 1. CHOICE HANDLER
  const choose = (index: number) => {
    if (done) return;
    setSelectedChoice(index);
    if (index === step.correctChoice) {
      success();
    } else {
      const customFail =
        step.choiceConsequences?.[index]?.explanation ||
        'That creates a data problem. Look at the result below.';
      fail(customFail);
    }
  };

  // 2. PAIR SELECTION (Row duplicate check)
  const selectRow = (index: number) => {
    if (done) return;
    const next = selectedRows.includes(index)
      ? selectedRows.filter((item) => item !== index)
      : [...selectedRows.slice(-1), index];
    setSelectedRows(next);

    if (next.length === 2) {
      const expected = [...(step.pair ?? [])].sort().join(',');
      if ([...next].sort().join(',') === expected) {
        success();
      } else {
        fail('Those rows have different IDs. Try another pair.');
        setSelectedRows([]);
      }
    }
  };

  // 3. GROUP HANDLER (Live Table Builder)
  const placeCard = (card: string, bin: string) => {
    if (done) return;
    const next = { ...placements, [card]: bin };
    setPlacements(next);
    setSelectedCard(null);

    if ((step.cards ?? []).every((c) => next[c])) {
      const valid = Object.entries(step.answers ?? {}).every(([c, owner]) => next[c] === owner);
      if (valid) {
        success();
      } else {
        fail('One field is in the wrong table. Tap it to move it.');
      }
    }
  };

  const quickPlace = (bin: string) => {
    if (selectedCard) placeCard(selectedCard, bin);
  };

  // 4. GUARD HANDLER (Domain Integrity)
  const judge = (index: number, verdict: 'Accept' | 'Block') => {
    if (done) return;
    const next = { ...verdicts, [index]: verdict };
    setVerdicts(next);
    if ((step.records ?? []).every((_, itemIndex) => next[itemIndex])) {
      const valid = (step.verdicts ?? []).every((answer, itemIndex) => next[itemIndex] === answer);
      if (valid) {
        success();
      } else {
        fail('One choice allows invalid data. Change it and try again.');
      }
    }
  };

  // 5. CONNECT HANDLER (Dependency Diagram)
  const connect = (source: string, target: string) => {
    if (done) return;
    const next = { ...links, [target]: source };
    setLinks(next);
    setSelectedSource(null);
    if (Object.keys(next).length === Object.keys(step.connections ?? {}).length) {
      const valid = Object.entries(step.connections ?? {}).every(
        ([expectedTarget, expectedSource]) => next[expectedTarget] === expectedSource
      );
      if (valid) {
        success();
      } else {
        fail('That arrow does not match the data. Try again.');
      }
    }
  };

  const resolvedTable = step.table
    ? {
        ...step.table,
        name: show(step.table.name),
        rows: step.table.rows.map((r) => {
          const nr: Record<string, string | number | null> = {};
          for (const [k, v] of Object.entries(r)) {
            nr[k] = typeof v === 'string' ? show(v) : v;
          }
          return nr;
        }),
      }
    : null;

  const currentConsequence =
    selectedChoice !== null && step.choiceConsequences?.[selectedChoice]
      ? step.choiceConsequences[selectedChoice]
      : null;

  return (
    <div className="puzzle-stage">
      {/* 1. SHORT STORY / SITUATION */}
      <div className="story-bubble">
        <span className="speaker-tag">{show(step.speaker)}</span>
        <p>“{show(step.message)}”</p>
      </div>

      {/* 2. REAL TABLE */}
      {resolvedTable && step.kind !== 'GROUP' && (
        <div className="puzzle-section-block">
          <LiveDataTable
            title={resolvedTable.name}
            columns={resolvedTable.columns}
            rows={resolvedTable.rows}
            primaryKeys={resolvedTable.primaryKeys}
            selectedRowIndices={selectedRows}
            onRowClick={step.kind === 'PAIR' ? selectRow : undefined}
            className="main-scenario-table"
          />
        </div>
      )}

      {/* 3. BEFORE / AFTER */}
      {step.beforeAfter && step.kind !== 'GROUP' && (
        <div className="puzzle-section-block">
          <BeforeAfterTable
            before={{
              title: show(step.beforeAfter.beforeTitle),
              columns: step.beforeAfter.beforeColumns,
              rows: step.beforeAfter.beforeRows.map((r) => {
                const nr: Record<string, string | number | null> = {};
                for (const [k, v] of Object.entries(r)) nr[k] = typeof v === 'string' ? show(v) : v;
                return nr;
              }),
            }}
            changeLabel={show(step.beforeAfter.changeLabel)}
            changeCountBadge={step.beforeAfter.changeBadge}
            evidenceNotes={step.beforeAfter.evidenceNotes}
            therefore={step.beforeAfter.therefore}
            after={
              step.beforeAfter.afterColumns
                ? {
                    title: show(step.beforeAfter.afterTitle || 'AFTER'),
                    columns: step.beforeAfter.afterColumns,
                    rows: (step.beforeAfter.afterRows || []).map((r) => {
                      const nr: Record<string, string | number | null> = {};
                      for (const [k, v] of Object.entries(r)) nr[k] = typeof v === 'string' ? show(v) : v;
                      return nr;
                    }),
                  }
                : undefined
            }
            warning={show(step.beforeAfter.warning)}
          />
        </div>
      )}

      {/* 4. QUESTION & INTERACTION */}
      <div className="puzzle-question-card">
        <h2 className="question-prompt">{show(step.prompt)}</h2>

        {/* --- CHOICE PUZZLE --- */}
        {step.kind === 'CHOICE' && (
          <div className="choice-stack">
            {step.choices?.map((choice, index) => {
              const isSelected = selectedChoice === index;
              const isCorrect = index === step.correctChoice;
              let btnClass = 'choice-btn';
              if (isSelected) {
                btnClass += isCorrect ? ' choice-correct' : ' choice-wrong';
              }

              return (
                <button
                  key={choice}
                  type="button"
                  className={btnClass}
                  onClick={() => choose(index)}
                  disabled={done}
                >
                  <span className="choice-text">{show(choice)}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* --- CHOICE RESULT / CONSEQUENCE --- */}
        {currentConsequence && (
          <ConsequenceReveal
            status={selectedChoice === step.correctChoice ? 'correct' : 'warning'}
            headline={show(currentConsequence.headline)}
            consequenceTable={currentConsequence.consequenceTable}
            impactNote={show(currentConsequence.impactNote)}
            explanation={show(currentConsequence.explanation)}
          />
        )}

        {/* --- PAIR PUZZLE --- */}
        {step.kind === 'PAIR' && (
          <div className="pair-selection-panel" aria-live="polite">
            <p className="pair-hint">
              {selectedRows.length === 0
                ? 'Tap two rows in the table above that have the same ID.'
                : `${selectedRows.length} of 2 rows selected`}
            </p>
          </div>
        )}

        {/* --- GROUP PUZZLE: LIVE TABLE BUILDER --- */}
        {step.kind === 'GROUP' && (
          <LiveTableBuilder
            sourceTable={step.sourceTable}
            cards={step.cards ?? []}
            bins={step.bins ?? []}
            placements={placements}
            selectedCard={selectedCard}
            onSelectCard={(card) => setSelectedCard(card)}
            onPlaceCard={placeCard}
            onQuickPlace={quickPlace}
            relations={step.relations}
            playerName={playerName}
            disabled={done}
          />
        )}

        {/* --- GUARD PUZZLE --- */}
        {step.kind === 'GUARD' && (
          <div className="guard-puzzle-layout">
            <div className="guard-stream-list">
              {step.records?.map((rec, index) => (
                <div key={rec} className="guard-stream-item">
                  <span className="record-data-code">{show(rec)}</span>
                  <div className="guard-btn-pair">
                    <button
                      type="button"
                      className={`guard-btn accept-btn ${verdicts[index] === 'Accept' ? 'verdict-active' : ''}`}
                      onClick={() => judge(index, 'Accept')}
                      disabled={done}
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      className={`guard-btn block-btn ${verdicts[index] === 'Block' ? 'verdict-active' : ''}`}
                      onClick={() => judge(index, 'Block')}
                      disabled={done}
                    >
                      Block
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="integrity-gate-visual" aria-live="polite">
              <div className="gate-column gate-accepted">
                <span className="gate-col-title">ACCEPTED</span>
                {(step.records ?? []).map(
                  (rec, idx) =>
                    verdicts[idx] === 'Accept' && (
                      <div key={rec} className="committed-tag">
                        <code>{show(rec)}</code>
                      </div>
                    )
                )}
                {!Object.values(verdicts).includes('Accept') && <small className="empty-gate">None</small>}
              </div>

              <div className="gate-column gate-blocked">
                <span className="gate-col-title">BLOCKED</span>
                {(step.records ?? []).map(
                  (rec, idx) =>
                    verdicts[idx] === 'Block' && (
                      <div key={rec} className="rejected-tag">
                        <code>{show(rec)}</code>
                      </div>
                    )
                )}
                {!Object.values(verdicts).includes('Block') && <small className="empty-gate">None</small>}
              </div>
            </div>
          </div>
        )}

        {/* --- CONNECT PUZZLE --- */}
        {step.kind === 'CONNECT' && (
          <div className="connect-puzzle-container">
            <div className="connect-puzzle-layout">
              <div className="connect-column">
                <span className="connect-header">DETERMINANT</span>
                <div className="connect-nodes-list">
                  {step.sources?.map((src) => {
                    const targetMatch = Object.entries(links).find(([, linkedSrc]) => linkedSrc === src)?.[0];
                    return (
                      <button
                        key={src}
                        type="button"
                        className={`connect-node ${selectedSource === src ? 'node-selected' : ''}`}
                        onClick={() => setSelectedSource(src)}
                        disabled={done}
                      >
                        <strong>{show(src)}</strong>
                        {targetMatch && <span className="link-indicator">→ {show(targetMatch)}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="connect-arrow-visual">
                <span>───►</span>
              </div>

              <div className="connect-column">
                <span className="connect-header">DEPENDENT</span>
                <div className="connect-nodes-list">
                  {step.targets?.map((tgt) => (
                    <button
                      key={tgt}
                      type="button"
                      className="connect-node target-node"
                      onClick={() => selectedSource && connect(selectedSource, tgt)}
                      disabled={done}
                    >
                      <strong>{show(tgt)}</strong>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {Object.entries(links).length > 0 && (
              <div className="live-dependency-diagram">
                {Object.entries(links).map(([tgt, src]) => (
                  <div key={tgt} className="dep-arrow-row">
                    <span className="dep-determinant">{show(src)}</span>
                    <span className="dep-arrow">─────────►</span>
                    <span className="dep-dependent">{show(tgt)}</span>
                  </div>
                ))}
                {done && (
                  <div className="dep-confirmation">
                    {Object.entries(links).map(([tgt, src]) => (
                      <p key={tgt}><strong>{show(src)}</strong> determines <strong>{show(tgt)}</strong>.</p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. FEEDBACK & HINT */}
      {wrongMsg && !done && (
        <div className="gentle-feedback-banner" role="alert">
          <p>{wrongMsg}</p>
        </div>
      )}

      {showClue && !done && (
        <div className="auto-clue-card">
          <span className="clue-tag">Hint</span>
          <p>{show(wrongMsg ? step.biggerClue : step.clue)}</p>
        </div>
      )}

      {/* 6. RESULT & CONTINUE */}
      {done && (
        <div className="step-success-card">
          <p className="success-msg">{show(step.success)}</p>
          <button type="button" className="btn-primary continue-btn" onClick={onContinue}>
            Continue
          </button>
        </div>
      )}
    </div>
  );
}
