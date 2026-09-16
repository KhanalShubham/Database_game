import { useState } from 'react';
import { cn } from '../../lib/utils';

export function ValidInvalidQuiz({
  items,
  onSuccess,
  onFail,
}: {
  items: Array<{ from: string; to?: string; valid: boolean; explanation?: string }>;
  onSuccess: () => void;
  onFail: (msg: string) => void;
}) {
  const [answers, setAnswers] = useState<Record<number, boolean | null>>({});
  const [notes, setNotes] = useState<Record<number, string>>({});

  const pick = (i: number, chosen: boolean) => {
    const correct = items[i].valid;
    const next = { ...answers, [i]: chosen };
    setAnswers(next);
    if (chosen !== correct) {
      const msg = items[i].explanation || 'If I know X, can I always find exactly one Y?';
      setNotes((n) => ({ ...n, [i]: msg }));
      onFail(msg);
      return;
    }
    setNotes((n) => ({
      ...n,
      [i]: chosen
        ? 'Valid: knowing the left side always gives one right side.'
        : 'Invalid: the left side does not determine exactly one value.',
    }));
    if (items.every((d, idx) => (idx === i ? chosen : next[idx]) === d.valid)) onSuccess();
  };

  return (
    <div className="space-y-3 relative z-20">
      {items.map((d, i) => {
        const chosen = answers[i];
        const isRight = chosen != null && chosen === d.valid;
        return (
          <div key={i} className="border border-slate-700 p-4 space-y-3 bg-slate-950">
            <p className="text-sm font-medium">
              {d.to ? `${d.from} → ${d.to}` : d.from}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => pick(i, true)}
                className={cn(
                  'relative z-20 min-h-11 min-w-28 cursor-pointer border px-4 py-2 text-sm',
                  chosen === true ? (d.valid ? 'border-emerald-400 bg-emerald-950 text-emerald-200' : 'border-red-400 bg-red-950 text-red-200') : 'border-slate-500 hover:border-emerald-400',
                )}
              >
                Valid
              </button>
              <button
                type="button"
                onClick={() => pick(i, false)}
                className={cn(
                  'relative z-20 min-h-11 min-w-28 cursor-pointer border px-4 py-2 text-sm',
                  chosen === false ? (!d.valid ? 'border-emerald-400 bg-emerald-950 text-emerald-200' : 'border-red-400 bg-red-950 text-red-200') : 'border-slate-500 hover:border-emerald-400',
                )}
              >
                Invalid
              </button>
            </div>
            {notes[i] && (
              <p className={cn('text-xs', isRight ? 'text-emerald-300' : 'text-amber-200')}>{notes[i]}</p>
            )}
          </div>
        );
      })}
      <p className="text-xs text-slate-500">
        {Object.values(answers).filter((v) => v != null).length} / {items.length} marked
      </p>
    </div>
  );
}

export function ClassifyQuiz({
  items,
  options,
  onSuccess,
  onFail,
  failText,
}: {
  items: Array<{ prompt: string; answer: string }>;
  options: string[];
  onSuccess: () => void;
  onFail: (msg: string) => void;
  failText: string;
}) {
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const pick = (i: number, v: string) => {
    const next = { ...answers, [i]: v };
    setAnswers(next);
    if (v !== items[i].answer) {
      onFail(failText);
      return;
    }
    if (items.every((it, idx) => (idx === i ? v : next[idx]) === it.answer)) onSuccess();
  };

  return (
    <div className="space-y-4 relative z-20">
      {items.map((it, i) => (
        <div key={i} className="space-y-2 border border-slate-700 p-3">
          <p className="text-sm">{it.prompt}</p>
          <div className="flex flex-wrap gap-2">
            {options.map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => pick(i, o)}
                className={cn(
                  'relative z-20 min-h-10 cursor-pointer border px-3 py-2 text-xs',
                  answers[i] === o
                    ? o === it.answer
                      ? 'border-emerald-400 text-emerald-200 bg-emerald-950'
                      : 'border-red-400 text-red-200 bg-red-950'
                    : 'border-slate-500 hover:border-emerald-400',
                )}
              >
                {o}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
