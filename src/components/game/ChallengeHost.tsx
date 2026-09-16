import { useState, type ComponentProps } from 'react';
import type { LevelConfig } from '../../lib/game/levels';
import type { DBTable } from '../../lib/normalization/engine';
import { checkAtomicity, checkRepeatingGroups } from '../../lib/normalization/engine';
import GameTable from '../database/GameTable';
import NormStatus from './NormStatus';
import { cn } from '../../lib/utils';

function cloneTables(tables: DBTable[]): DBTable[] {
  return JSON.parse(JSON.stringify(tables));
}

function setsEqual(a: string[], b: string[]) {
  return a.length === b.length && a.every((x) => b.includes(x));
}

interface Props {
  level: LevelConfig;
  onSuccess: () => void;
  onFail: (msg: string) => void;
}

export default function ChallengeHost({ level, onSuccess, onFail }: Props) {
  switch (level.challengeType) {
    case 'OBSERVE_REDUNDANCY':
      return <ObserveRedundancy level={level} onSuccess={onSuccess} onFail={onFail} />;
    case 'UPDATE_ANOMALY':
      return <UpdateAnomaly level={level} onSuccess={onSuccess} onFail={onFail} />;
    case 'DELETE_ANOMALY':
      return <DeleteAnomaly level={level} onSuccess={onSuccess} onFail={onFail} />;
    case 'INSERT_ANOMALY':
      return <InsertAnomaly level={level} onSuccess={onSuccess} onFail={onFail} />;
    case 'IDENTIFY_ANOMALY':
      return <IdentifyAnomaly level={level} onSuccess={onSuccess} onFail={onFail} />;
    case 'DRAG_GROUP':
    case 'SPLIT_TABLE':
    case 'FULL_NORMALIZE':
    case 'FINAL_CHALLENGE':
      return <DragTables level={level} onSuccess={onSuccess} onFail={onFail} />;
    case 'SELECT_KEY':
      return <SelectKey level={level} onSuccess={onSuccess} onFail={onFail} />;
    case 'SELECT_COMPOSITE_KEY':
      return <SelectCompositeKey level={level} onSuccess={onSuccess} onFail={onFail} />;
    case 'CONNECT_DEPENDENCY':
      return <ConnectDependency level={level} onSuccess={onSuccess} onFail={onFail} />;
    case 'IDENTIFY_DEPENDENCY':
      return <IdentifyDependency level={level} onSuccess={onSuccess} onFail={onFail} />;
    case 'FIX_ATOMICITY':
      return <FixAtomicity level={level} onSuccess={onSuccess} onFail={onFail} />;
    case 'REMOVE_REPEATING':
      return <RemoveRepeating level={level} onSuccess={onSuccess} onFail={onFail} />;
    case 'INTEGRITY_JUDGE':
      return <IntegrityJudge level={level} onSuccess={onSuccess} onFail={onFail} />;
    case 'FIND_VIOLATION':
      return <FindViolation level={level} onSuccess={onSuccess} onFail={onFail} />;
    case 'CHOOSE_DELETE_RULE':
      return <ChooseDeleteRule level={level} onSuccess={onSuccess} onFail={onFail} />;
    case 'INTEGRITY_REPAIR':
      return <IntegrityRepair level={level} onSuccess={onSuccess} onFail={onFail} />;
    default:
      return <IdentifyAnomaly level={level} onSuccess={onSuccess} onFail={onFail} />;
  }
}

function TableStack({
  tables,
  ...rest
}: {
  tables: DBTable[];
} & Omit<ComponentProps<typeof GameTable>, 'table'>) {
  return (
    <div className="space-y-3">
      {tables.map((t) => (
        <GameTable key={t.id} table={t} {...rest} />
      ))}
    </div>
  );
}

function ObserveRedundancy({ level, onSuccess, onFail }: Props) {
  const tables = level.initialTables;
  const task = level.task;
  const [highlight, setHighlight] = useState<{ column?: string; value?: unknown } | null>(null);
  const [selectedHeaders, setSelectedHeaders] = useState<string[]>([]);
  const [clickedRepeats, setClickedRepeats] = useState<Set<string>>(new Set());

  const onCellClick = (column: string, value: unknown) => {
    setHighlight({ column, value });
    const repeats = tables.some((t) => t.rows.filter((r) => String(r[column]) === String(value)).length > 1);
    if (repeats) {
      const next = new Set(clickedRepeats);
      next.add(column);
      setClickedRepeats(next);
      if (!task.selectHeaders && next.size >= (task.minSelectionsRequired || 1)) onSuccess();
    } else {
      onFail('That value appears only once. Look for information stored many times.');
    }
  };

  const onHeaderClick = (column: string) => {
    if (!task.selectHeaders) return;
    const already = selectedHeaders.includes(column);
    const next = already ? selectedHeaders.filter((c) => c !== column) : [...selectedHeaders, column];
    setSelectedHeaders(next);
    const targets: string[] = task.targetColumnHeaders || task.repeatingColumns;
    if (targets.every((c) => next.includes(c)) && next.length === targets.length) onSuccess();
    else if (next.length >= targets.length && !targets.every((c) => next.includes(c))) {
      onFail('Not quite. Which facts belong to the course, not each enrollment?');
    }
  };

  return (
    <div className="space-y-3">
      {highlight && <p className="text-xs text-amber-300">This information is stored multiple times.</p>}
      <TableStack
        tables={tables}
        highlightValue={highlight}
        selectedHeaders={selectedHeaders}
        onCellClick={onCellClick}
        onHeaderClick={task.selectHeaders ? onHeaderClick : undefined}
      />
    </div>
  );
}

function UpdateAnomaly({ level, onSuccess }: Props) {
  const [tables, setTables] = useState(() => cloneTables(level.initialTables));
  const [note, setNote] = useState('');
  const [won, setWon] = useState(false);
  const task = level.task;
  const remaining = tables[0].rows.filter((r) => String(r[task.column]) === String(task.targetValue)).length;

  const apply = (column: string, value: unknown, rowIndex: number) => {
    if (won) return;
    if (column !== task.column) return;
    if (String(value) !== String(task.targetValue)) return;
    const next = cloneTables(tables);
    next[0].rows[rowIndex][column] = task.newValue;
    setTables(next);
    const left = next[0].rows.filter((r) => String(r[column]) === String(task.targetValue)).length;
    const updated = next[0].rows.filter((r) => String(r[column]) === String(task.newValue)).length;
    if (updated > 0 && left > 0) {
      setNote(`Inconsistent database: ${updated} rows say ${task.newValue}, ${left} still say ${task.targetValue}.`);
      setWon(true);
      onSuccess();
    } else if (left === 0 && updated > 0) {
      setNote('You had to change every copy of the same fact. That is an UPDATE ANOMALY.');
      setWon(true);
      onSuccess();
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-300">
        Click every <span className="text-amber-300">{task.targetValue}</span> in {task.column} to change it to{' '}
        <span className="text-emerald-300">{task.newValue}</span>. {remaining} left.
      </p>
      {note && <p className="text-sm text-amber-300">{note}</p>}
      <TableStack
        tables={tables}
        highlightValue={{ column: task.column, value: task.targetValue }}
        onCellClick={apply}
      />
    </div>
  );
}

function DeleteAnomaly({ level, onSuccess, onFail }: Props) {
  const [tables, setTables] = useState(() => cloneTables(level.initialTables));
  const [lost, setLost] = useState<string[]>([]);
  const where = level.task.deleteRowWhere as Record<string, unknown>;

  const onRowAction = (rowIndex: number) => {
    const row = tables[0].rows[rowIndex];
    const match = Object.entries(where).every(([k, v]) => String(row[k]) === String(v));
    if (!match) {
      onFail('Delete the student who is leaving — Sita (102). Then watch the course data.');
      return;
    }
    const remaining = tables[0].rows.filter((_, i) => i !== rowIndex);
    const lostCols = (level.task.lostInformation as string[]).filter((col) => {
      const val = row[col];
      return !remaining.some((r) => String(r[col]) === String(val));
    });
    setTables([{ ...tables[0], rows: remaining }]);
    setLost(lostCols.length ? lostCols : ['related course facts']);
    onSuccess();
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-300">Delete Sita (Student 102). Watch whether her course survives.</p>
      {lost.length > 0 && (
        <div className="border border-amber-800 bg-amber-950/30 p-3 text-sm text-amber-200">
          After deleting Sita, these facts also vanished: {lost.join(', ')}.
        </div>
      )}
      <TableStack tables={tables} rowActionLabel="Delete" onRowAction={onRowAction} />
    </div>
  );
}

function InsertAnomaly({ level, onSuccess }: Props) {
  const rec = level.task.attemptInsert as Record<string, unknown>;
  const [studentId, setStudentId] = useState('');
  const [attempted, setAttempted] = useState(false);

  const tryInsert = () => {
    setAttempted(true);
    onSuccess();
  };

  return (
    <div className="space-y-4">
      <TableStack tables={level.initialTables} />
      <div className="border border-slate-700 p-4 space-y-3 text-sm">
        <div className="text-xs text-slate-500">Add course C04 BIT — no students enrolled yet</div>
        {Object.entries(rec).map(([k, v]) => (
          <label key={k} className="flex items-center justify-between gap-4">
            <span className="text-slate-400">{k}</span>
            {k === 'Student_ID' ? (
              <input
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="empty — there is no student"
                className="bg-transparent border-b border-slate-600 px-1 py-0.5 text-right outline-none focus:border-emerald-400 w-48"
              />
            ) : v == null ? (
              <span className="italic text-red-400">NULL</span>
            ) : (
              <span>{String(v)}</span>
            )}
          </label>
        ))}
      </div>
      <button
        type="button"
        onClick={tryInsert}
        className="border border-slate-500 px-4 py-2 text-sm hover:border-emerald-400 hover:text-emerald-300 focus:outline focus:outline-2 focus:outline-emerald-500"
      >
        Try adding this course
      </button>
      {attempted && (
        <p className="text-sm text-amber-300">
          {studentId.trim()
            ? 'You had to invent a fake student just to store a course. The table mixes different facts.'
            : level.task.reason}{' '}
          This is an INSERTION ANOMALY.
        </p>
      )}
    </div>
  );
}

function IdentifyAnomaly({ level, onSuccess, onFail }: Props) {
  const scenarios = (level.task.scenarios || []) as Array<{
    text: string;
    answer: string;
    options?: string[];
  }>;
  const globalOptions: string[] = level.task.options || [];
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const submit = (i: number, value: string) => {
    const next = { ...answers, [i]: value };
    setAnswers(next);
    if (value !== scenarios[i].answer) {
      onFail('Not quite. Match the problem to what you already saw happen.');
      return;
    }
    if (scenarios.every((s, idx) => next[idx] === s.answer)) onSuccess();
  };

  return (
    <div className="space-y-4">
      {level.initialTables.length > 0 && <TableStack tables={level.initialTables} />}
      {scenarios.map((s, i) => {
        const opts = s.options?.length ? s.options : globalOptions;
        return (
          <div key={i} className="space-y-2">
            <p className="text-sm">{s.text}</p>
            <div className="flex flex-wrap gap-2">
              {opts.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => submit(i, opt)}
                  className={cn(
                    'text-xs border px-3 py-2 text-left hover:border-emerald-400 focus:outline focus:outline-2 focus:outline-emerald-500',
                    answers[i] === opt
                      ? opt === s.answer
                        ? 'border-emerald-500 text-emerald-300 bg-emerald-950/40'
                        : 'border-red-500 text-red-300'
                      : 'border-slate-700',
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DragTables({ level, onSuccess, onFail }: Props) {
  const groups: string[] =
    level.task.groups ||
    (level.task.targetTables || level.task.expectedFinalTables || []).map((t: { name: string }) => t.name);
  const columns: string[] =
    level.task.columns ||
    level.initialTables.flatMap((t) => t.columns.map((c) => c.name));
  const mapping: Record<string, string> =
    level.task.correctMapping ||
    Object.fromEntries(
      (level.task.targetTables || level.task.expectedFinalTables || []).flatMap(
        (t: { name: string; expectedColumns?: string[]; requiredColumns?: string[] }) =>
          (t.expectedColumns || t.requiredColumns || []).map((c: string) => [c, t.name]),
      ),
    );

  const extraKeys = Object.keys(mapping).filter((c) => !columns.includes(c));
  const pool = [...new Set([...columns, ...extraKeys])];

  const expectedByTable: Record<string, string[]> = Object.fromEntries(
    (level.task.targetTables || level.task.expectedFinalTables || []).map(
      (t: { name: string; expectedColumns?: string[]; requiredColumns?: string[] }) => [
        t.name,
        t.expectedColumns || t.requiredColumns || [],
      ],
    ),
  );
  const allowed: Record<string, string[]> = {};
  if (Object.keys(expectedByTable).length) {
    for (const [tableName, cols] of Object.entries(expectedByTable)) {
      for (const c of cols) {
        allowed[c] = [...(allowed[c] || []), tableName];
      }
    }
  } else {
    for (const [c, g] of Object.entries(mapping)) allowed[c] = [g];
  }

  const [placed, setPlaced] = useState<Record<string, string[]>>({});
  const [dragCol, setDragCol] = useState<string | null>(null);
  const [stage, setStage] = useState(0);
  const stages: Array<{ name: string; instruction: string }> = level.task.stages || [];

  const unplaced = pool.filter((c) => !(placed[c] && placed[c].length));

  const drop = (group: string) => {
    if (!dragCol) return;
    setPlaced((p) => ({ ...p, [dragCol]: [...new Set([...(p[dragCol] || []), group])] }));
    setDragCol(null);
  };

  const check = () => {
    const ok = Object.keys(allowed).every((c) => (placed[c] || []).some((g) => allowed[c].includes(g)));
    const tablesOk =
      !Object.keys(expectedByTable).length ||
      Object.entries(expectedByTable).every(([tableName, cols]) =>
        cols.every((c) => (placed[c] || []).includes(tableName)),
      );
    if (!ok || !tablesOk) {
      onFail('Check which fact belongs to which entity. Keys can sit in more than one table.');
      return;
    }
    if (stages.length && stage < stages.length - 1) {
      setStage(stage + 1);
      return;
    }
    onSuccess();
  };

  return (
    <div className="space-y-4">
      {level.initialTables.length > 0 && <TableStack tables={level.initialTables} />}
      {level.task.liveChecks && <NormStatus tables={level.initialTables} deps={level.initialDeps} />}
      {stages[stage] && (
        <p className="text-sm text-emerald-300">
          {stages[stage].name}: {stages[stage].instruction}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {unplaced.map((c) => (
          <button
            key={c}
            type="button"
            draggable
            onDragStart={() => setDragCol(c)}
            onClick={() => setDragCol(c)}
            className={cn('border px-2 py-1 text-xs', dragCol === c ? 'border-emerald-400 text-emerald-300' : 'border-slate-600')}
          >
            {c}
          </button>
        ))}
      </div>
      {dragCol && <p className="text-xs text-slate-400">Selected {dragCol}. Click a table, or drag onto it.</p>}
      <div className="grid sm:grid-cols-3 gap-3">
        {groups.map((g) => (
          <div
            key={g}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => drop(g)}
            onClick={() => dragCol && drop(g)}
            className="min-h-28 border border-dashed border-slate-600 p-3 space-y-2"
          >
            <div className="text-xs font-semibold text-slate-300">{g}</div>
            {Object.entries(placed)
              .filter(([, groups]) => groups.includes(g))
              .map(([c]) => (
                <button
                  key={c}
                  type="button"
                  className="block text-xs text-emerald-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPlaced((p) => {
                      const next = (p[c] || []).filter((x) => x !== g);
                      const n = { ...p };
                      if (next.length) n[c] = next;
                      else delete n[c];
                      return n;
                    });
                  }}
                >
                  {c}
                </button>
              ))}
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={check}
        className="border border-emerald-600 text-emerald-300 px-4 py-2 text-sm hover:bg-emerald-950 focus:outline focus:outline-2 focus:outline-emerald-500"
      >
        Check structure
      </button>
    </div>
  );
}

function SelectKey({ level, onSuccess, onFail }: Props) {
  const task = level.task;
  const [note, setNote] = useState('');

  const onHeaderClick = (column: string) => {
    if (task.mode === 'inspect' || task.minClicks) {
      setNote('Attribute = a property that describes an entity.');
      onSuccess();
      return;
    }
    const correct = task.correctPK || task.correctAnswer;
    if (column === correct) {
      setNote(`${column} identifies one unique row.`);
      onSuccess();
    } else {
      const hint = task.wrongOptions?.[column];
      onFail(hint || 'That does not uniquely identify each row.');
    }
  };

  return (
    <div className="space-y-3">
      {task.question && <p className="text-sm">{task.question}</p>}
      {note && <p className="text-sm text-emerald-300">{note}</p>}
      <TableStack tables={level.initialTables} onHeaderClick={onHeaderClick} />
    </div>
  );
}

function SelectCompositeKey({ level, onSuccess, onFail }: Props) {
  const [selected, setSelected] = useState<string[]>([]);
  const correct: string[] = level.task.correctComposite;

  const onHeaderClick = (column: string) => {
    if (selected.length < 2 && !selected.includes(column) && level.task.wrongSingle?.[column] && !correct.includes(column)) {
      onFail(level.task.wrongSingle[column]);
    }
    const next = selected.includes(column) ? selected.filter((c) => c !== column) : [...selected, column].slice(-3);
    setSelected(next);
    if (setsEqual(next, correct)) onSuccess();
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-400">Select the columns that together identify a row. Selected: {selected.join(' + ') || 'none'}</p>
      <TableStack tables={level.initialTables} selectedHeaders={selected} onHeaderClick={onHeaderClick} />
    </div>
  );
}

function ConnectDependency({ level, onSuccess, onFail }: Props) {
  const task = level.task;
  const [chain, setChain] = useState<string[]>([]);
  const [from, setFrom] = useState<string | null>(null);
  const [drawn, setDrawn] = useState<string[]>([]);

  const onHeaderClick = (column: string) => {
    if (task.chainMode) {
      const next = [...chain, column];
      const expected: string[] = task.correctChain;
      if (expected[next.length - 1] !== column) {
        onFail('Follow the chain in order.');
        setChain([]);
        return;
      }
      setChain(next);
      if (next.length === expected.length) onSuccess();
      return;
    }
    if (!from) {
      setFrom(column);
      return;
    }
    const ok = column !== from && task.source === from && (task.validTargets as string[]).includes(column);
    if (ok) {
      const label = `${from} → ${column}`;
      const next = [...drawn, label];
      setDrawn(next);
      setFrom(null);
      if (next.length >= (task.requiredDeps || 1)) onSuccess();
    } else {
      onFail('If I know the first attribute, can I always determine the second?');
      setFrom(null);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-400">
        {task.chainMode
          ? `Chain: ${chain.join(' → ') || 'click the first attribute'}`
          : from
            ? `${from} → ?`
            : 'Click the determinant, then what it determines.'}
      </p>
      {drawn.map((d) => (
        <div key={d} className="text-sm text-emerald-300">
          {d}
        </div>
      ))}
      <TableStack tables={level.initialTables} selectedHeaders={[...chain, from].filter(Boolean) as string[]} onHeaderClick={onHeaderClick} />
    </div>
  );
}

function IdentifyDependency({ level, onSuccess, onFail }: Props) {
  const task = level.task;
  const mode = task.mode as string | undefined;

  if (mode === 'yes_no') {
    return (
      <div className="space-y-4">
        {level.initialTables.length > 0 && <TableStack tables={level.initialTables} />}
        <p className="text-sm">{task.question}</p>
        <div className="flex gap-2">
          {['YES', 'NO'].map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => {
                const yes = label === 'YES';
                if (yes === task.answer) onSuccess();
                else onFail(task.explanation || 'Look at whether the name stays the same when the course changes.');
              }}
              className="border border-slate-600 px-4 py-2 text-sm hover:border-emerald-400"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (mode === 'single_choice') {
    return (
      <div className="space-y-3">
        <p className="text-sm">{task.question}</p>
        {(task.options as Array<{ label: string; correct: boolean; hint?: string }>).map((opt) => (
          <button
            key={opt.label}
            type="button"
            onClick={() => (opt.correct ? onSuccess() : onFail(opt.hint || 'Not that type of dependency.'))}
            className="w-full text-left border border-slate-700 p-3 text-sm hover:border-emerald-400"
          >
            {opt.label}
          </button>
        ))}
      </div>
    );
  }

  if (mode === 'select_columns') {
    const [sel, setSel] = useState<string[]>([]);
    const correct: string[] = task.correctColumns;
    const toggle = (c: string) => {
      if (task.wrongColumns?.[c] && !correct.includes(c)) onFail(task.wrongColumns[c]);
      const next = sel.includes(c) ? sel.filter((x) => x !== c) : [...sel, c];
      setSel(next);
      if (setsEqual(next, correct)) onSuccess();
    };
    const cols = level.initialTables[0]?.columns.map((c) => c.name) || correct;
    return (
      <div className="space-y-3">
        <p className="text-sm">{task.question}</p>
        {level.initialTables.length > 0 && <TableStack tables={level.initialTables} selectedHeaders={sel} onHeaderClick={toggle} />}
        {level.initialTables.length === 0 && (
          <div className="flex flex-wrap gap-2">
            {cols.map((c) => (
              <button key={c} type="button" onClick={() => toggle(c)} className={cn('border px-3 py-1 text-xs', sel.includes(c) ? 'border-emerald-400' : 'border-slate-600')}>
                {c}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (mode === 'find_remaining') {
    return (
      <div className="space-y-3">
        <p className="text-sm">Click the remaining problem column.</p>
        <TableStack
          tables={level.initialTables}
          onHeaderClick={(column) => {
            if (column === task.targetColumn) onSuccess();
            else onFail('Does this attribute describe the course, or something else?');
          }}
        />
      </div>
    );
  }

  if (mode === 'classify_partial') {
    const attrs = task.attributes as Array<{ name: string; partialDep: boolean }>;
    const [answers, setAnswers] = useState<Record<string, boolean>>({});
    const setA = (name: string, partial: boolean) => {
      const next = { ...answers, [name]: partial };
      setAnswers(next);
      if (attrs.every((a) => next[a.name] === a.partialDep)) onSuccess();
    };
    return (
      <div className="space-y-3">
        {attrs.map((a) => (
          <div key={a.name} className="flex items-center justify-between gap-3 text-sm border border-slate-800 p-2">
            <span>{a.name}</span>
            <div className="flex gap-2">
              <button type="button" className="border border-slate-600 px-2 py-1 text-xs" onClick={() => setA(a.name, true)}>
                Partial
              </button>
              <button type="button" className="border border-slate-600 px-2 py-1 text-xs" onClick={() => setA(a.name, false)}>
                Full key
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (mode === 'classify' || mode === 'classify_integrity') {
    const items = (task.dependencies || task.items) as Array<{ from?: string; question?: string; type?: string; answer?: string }>;
    const options: string[] = task.options;
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const pick = (i: number, v: string) => {
      const expected = items[i].type || items[i].answer;
      const next = { ...answers, [i]: v };
      setAnswers(next);
      if (v !== expected) onFail('Ask whether it depends on the full key, part of the key, or another non-key.');
      else if (items.every((it, idx) => next[idx] === (it.type || it.answer))) onSuccess();
    };
    return (
      <div className="space-y-4">
        {level.initialTables.length > 0 && <TableStack tables={level.initialTables} />}
        {items.map((it, i) => (
          <div key={i} className="space-y-2">
            <p className="text-sm">{it.from || it.question}</p>
            <div className="flex flex-wrap gap-2">
              {options.map((o) => (
                <button key={o} type="button" onClick={() => pick(i, o)} className={cn('text-xs border px-2 py-1', answers[i] === o ? 'border-emerald-400' : 'border-slate-600')}>
                  {o}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (mode === 'identify_transitive') {
    const deps = task.dependencies as Array<{ from: string; isTransitive: boolean }>;
    const [picked, setPicked] = useState<number | null>(null);
    return (
      <div className="space-y-3">
        {deps.map((d, i) => (
          <button
            key={i}
            type="button"
            onClick={() => {
              setPicked(i);
              if (d.isTransitive) onSuccess();
              else onFail('That one describes the course directly.');
            }}
            className={cn('w-full text-left border p-3 text-sm', picked === i ? 'border-emerald-400' : 'border-slate-700')}
          >
            {d.from}
          </button>
        ))}
      </div>
    );
  }

  const deps = (task.dependencies || []) as Array<{ from: string; to: string; valid: boolean; explanation?: string }>;
  const [answers, setAnswers] = useState<Record<number, boolean | null>>({});
  const pick = (i: number, valid: boolean) => {
    const next = { ...answers, [i]: valid };
    setAnswers(next);
    if (valid !== deps[i].valid) onFail(deps[i].explanation || 'If I know X, can I always find exactly one Y?');
    else if (deps.every((d, idx) => next[idx] === d.valid)) onSuccess();
  };

  return (
    <div className="space-y-3">
      {deps.map((d, i) => (
        <div key={i} className="border border-slate-800 p-3 space-y-2">
          <p className="text-sm font-medium">
            {d.from} → {d.to}
          </p>
          <div className="flex gap-2">
            <button type="button" className="border border-slate-600 px-3 py-1 text-xs" onClick={() => pick(i, true)}>
              Valid
            </button>
            <button type="button" className="border border-slate-600 px-3 py-1 text-xs" onClick={() => pick(i, false)}>
              Invalid
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function splitCommaCell(table: DBTable, rowIndex: number, column: string, values: string[]): DBTable {
  const row = table.rows[rowIndex];
  const others = table.rows.filter((_, i) => i !== rowIndex);
  const newRows = values.map((v) => ({ ...row, [column]: v.trim() }));
  return { ...table, rows: [...newRows, ...others] };
}

function FixAtomicity({ level, onSuccess, onFail }: Props) {
  const task = level.task;

  if (task.mode === 'classify') {
    const values = task.values as Array<{ value: string; atomic: boolean; reason?: string }>;
    const [answers, setAnswers] = useState<Record<number, boolean>>({});
    const pick = (i: number, atomic: boolean) => {
      const next = { ...answers, [i]: atomic };
      setAnswers(next);
      if (atomic !== values[i].atomic) onFail(values[i].reason || 'An atomic value cannot be split further.');
      else if (values.every((v, idx) => next[idx] === v.atomic)) onSuccess();
    };
    return (
      <div className="space-y-3">
        {values.map((v, i) => (
          <div key={i} className="flex flex-wrap items-center justify-between gap-2 border border-slate-800 p-2 text-sm">
            <code className="text-xs">{v.value}</code>
            <div className="flex gap-2">
              <button type="button" className="border border-slate-600 px-2 py-1 text-xs" onClick={() => pick(i, true)}>
                Atomic
              </button>
              <button type="button" className="border border-slate-600 px-2 py-1 text-xs" onClick={() => pick(i, false)}>
                Not atomic
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const [tables, setTables] = useState(() => cloneTables(level.initialTables));
  const live = !!task.liveChecks || !!task.bossMode;

  const split = () => {
    const col = task.targetCell?.column;
    const idx = task.targetCell?.rowIndex ?? 0;
    const values: string[] | undefined = task.splitValues;
    if (!col || !values) {
      const t = tables[0];
      const v = checkAtomicity(t);
      if (v.length === 0 && checkRepeatingGroups(t).length === 0) {
        onSuccess();
        return;
      }
      const first = v[0];
      if (!first) {
        onFail('Remove repeating columns as well as lists in cells.');
        return;
      }
      const parts = String(t.rows[first.rowIndex][first.column])
        .split(',')
        .map((s) => s.trim());
      setTables([splitCommaCell(t, first.rowIndex, first.column, parts)]);
      return;
    }
    const next = [splitCommaCell(tables[0], idx, col, values)];
    if (task.bossMode) {
      next[0] = {
        ...next[0],
        columns: next[0].columns.filter((c) => !['Item1', 'Item2'].includes(c.name)),
        rows: next[0].rows.map((r) => {
          const n = { ...r };
          delete n.Item1;
          delete n.Item2;
          return n;
        }),
      };
    }
    setTables(next);
    const atomic = checkAtomicity(next[0]).length === 0;
    const repeating = checkRepeatingGroups(next[0]).length === 0;
    if (atomic && repeating) onSuccess();
  };

  return (
    <div className="space-y-3">
      {live && <NormStatus tables={tables} />}
      <p className="text-sm text-slate-300">Click the cell that holds more than one value.</p>
      <TableStack
        tables={tables}
        onCellClick={(column, value, rowIndex) => {
          if (typeof value !== 'string' || !value.includes(',')) return;
          const parts = value.split(',').map((s) => s.trim());
          const next = [splitCommaCell(tables[0], rowIndex, column, parts)];
          if (task.bossMode) {
            next[0] = {
              ...next[0],
              columns: next[0].columns.filter((c) => !['Item1', 'Item2'].includes(c.name)),
              rows: next[0].rows.map((r) => {
                const n = { ...r };
                delete n.Item1;
                delete n.Item2;
                return n;
              }),
            };
          }
          setTables(next);
          if (checkAtomicity(next[0]).length === 0 && checkRepeatingGroups(next[0]).length === 0) onSuccess();
        }}
      />
      <button type="button" onClick={split} className="border border-emerald-600 text-emerald-300 px-4 py-2 text-sm">
        Split multi-value cells into rows
      </button>
    </div>
  );
}

function RemoveRepeating({ level, onSuccess }: Props) {
  const [tables, setTables] = useState(() => cloneTables(level.initialTables));
  const [done, setDone] = useState(false);

  const convert = () => {
    const group: string[] = level.task.repeatingGroup;
    const src = tables[0];
    const keep = src.columns.filter((c) => !group.includes(c.name)).map((c) => c.name);
    const rows: Record<string, unknown>[] = [];
    src.rows.forEach((row) => {
      group.forEach((g) => {
        if (row[g] != null && row[g] !== '') {
          const r: Record<string, unknown> = {};
          keep.forEach((k) => {
            r[k] = row[k];
          });
          r.Course_ID = row[g];
          rows.push(r);
        }
      });
    });
    const next: DBTable = {
      ...src,
      columns: [...keep.map((name) => ({ name })), { name: 'Course_ID' }],
      rows,
    };
    setTables([next]);
    setDone(true);
    onSuccess();
  };

  return (
    <div className="space-y-3">
      <NormStatus tables={tables} />
      <TableStack tables={tables} />
      {!done && (
        <button type="button" onClick={convert} className="border border-emerald-600 text-emerald-300 px-4 py-2 text-sm">
          Convert repeating columns into rows
        </button>
      )}
    </div>
  );
}

function IntegrityJudge({ level, onSuccess, onFail }: Props) {
  const rec = level.task.incomingRecord as Record<string, unknown>;
  return (
    <div className="space-y-4">
      <TableStack tables={level.initialTables} />
      <div className="border border-amber-700/50 p-3 text-sm space-y-1">
        <div className="text-xs text-slate-500">Incoming record</div>
        {Object.entries(rec).map(([k, v]) => (
          <div key={k}>
            {k}: {v == null ? <span className="text-red-400">NULL</span> : String(v)}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        {['ACCEPT', 'REJECT'].map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => (d === level.task.correctDecision ? onSuccess() : onFail(level.task.reason))}
            className="border border-slate-600 px-4 py-2 text-sm hover:border-emerald-400"
          >
            {d}
          </button>
        ))}
      </div>
    </div>
  );
}

function FindViolation({ level, onSuccess, onFail }: Props) {
  const targetName = level.task.targetTable as string;
  const targetRow = level.task.targetRow as number;
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {level.initialTables.map((t) => (
        <GameTable
          key={t.id}
          table={t}
          selectedRows={t.name === targetName && selected != null ? [selected] : []}
          onRowClick={
            t.name === targetName
              ? (i) => {
                  setSelected(i);
                  if (i === targetRow) onSuccess();
                  else onFail('That row is valid. Look for the impossible or missing identity.');
                }
              : undefined
          }
        />
      ))}
    </div>
  );
}

function ChooseDeleteRule({ level, onSuccess }: Props) {
  const [choice, setChoice] = useState<string | null>(null);
  const [tables, setTables] = useState(() => cloneTables(level.initialTables));
  const task = level.task;
  const rules = task.rules as Record<string, string>;

  const apply = (action: string) => {
    const next = cloneTables(tables);
    const parent = next.find((t) => t.name === task.parentTable)!;
    const child = next.find((t) => t.name === task.childTable)!;
    if (action === 'CASCADE') {
      parent.rows = parent.rows.filter((r) => r[task.parentKey] !== task.parentValue);
      child.rows = child.rows.filter((r) => r[task.childKey] !== task.parentValue);
    } else if (action === 'SET NULL') {
      parent.rows = parent.rows.filter((r) => r[task.parentKey] !== task.parentValue);
      child.rows = child.rows.map((r) => (r[task.childKey] === task.parentValue ? { ...r, [task.childKey]: null } : r));
    }
    setTables(next);
    setChoice(action);
    onSuccess();
  };

  return (
    <div className="space-y-4">
      <TableStack tables={tables} />
      <div className="grid grid-cols-3 gap-2">
        {Object.keys(rules).map((a) => (
          <button
            key={a}
            type="button"
            disabled={!!choice}
            onClick={() => apply(a)}
            className={cn('border p-2 text-xs', choice === a ? 'border-emerald-400' : 'border-slate-600')}
          >
            {a}
          </button>
        ))}
      </div>
      {choice && <p className="text-sm text-amber-300">{rules[choice]}</p>}
    </div>
  );
}

function IntegrityRepair({ level, onSuccess, onFail }: Props) {
  const violations = level.task.violations as Array<{ table: string; rowIndex: number; type: string }>;
  const [found, setFound] = useState<string[]>([]);
  const [pending, setPending] = useState<{ table: string; rowIndex: number } | null>(null);

  const mark = (type: string) => {
    if (!pending) return;
    const hit = violations.find((v) => v.table === pending.table && v.rowIndex === pending.rowIndex && v.type === type);
    const key = `${pending.table}:${pending.rowIndex}:${type}`;
    if (!hit) {
      onFail('Wrong rule for that problem.');
      return;
    }
    if (found.includes(key)) return;
    const next = [...found, key];
    setFound(next);
    setPending(null);
    if (next.length >= (level.task.totalViolations || violations.length)) onSuccess();
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-400">
        Click a bad row, then label the rule. Found {found.length} / {level.task.totalViolations}
      </p>
      {level.initialTables.map((t) => (
        <GameTable
          key={t.id}
          table={t}
          onRowClick={(i) => setPending({ table: t.name, rowIndex: i })}
          selectedRows={pending?.table === t.name ? [pending.rowIndex] : []}
        />
      ))}
      {pending && (
        <div className="flex flex-wrap gap-2">
          {['ENTITY', 'REFERENTIAL', 'DOMAIN', 'UNIQUE'].map((type) => (
            <button key={type} type="button" onClick={() => mark(type)} className="border border-slate-600 px-3 py-1 text-xs">
              {type}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
