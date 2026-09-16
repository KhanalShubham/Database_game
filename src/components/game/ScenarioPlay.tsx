import { useState } from 'react';
import type { CaseConfig } from '../../lib/game/cases';
import type { DBTable } from '../../lib/normalization/engine';
import GameTable from '../database/GameTable';
import { cn } from '../../lib/utils';

function clone(t: DBTable): DBTable {
  return JSON.parse(JSON.stringify(t));
}

export default function ScenarioPlay({ c, onWin, onFail }: { c: CaseConfig; onWin: () => void; onFail: (m: string) => void }) {
  switch (c.kind) {
    case 'CLICK_UPDATE':
      return <ClickUpdate c={c} onWin={onWin} />;
    case 'SPLIT_ITEMS':
    case 'ADD_ROW':
      return <SplitAndAdd c={c} onWin={onWin} />;
    case 'IDENTITY_SLOT':
      return <Identity c={c} onWin={onWin} onFail={onFail} />;
    case 'COMBO_KEY':
      return <ComboKey c={c} onWin={onWin} onFail={onFail} />;
    case 'DRAW_DEP':
      return <DrawDep c={c} onWin={onWin} onFail={onFail} />;
    case 'CHAIN':
      return <Chain c={c} onWin={onWin} onFail={onFail} />;
    case 'DRAG_GROUPS':
      return <DragGroups c={c} onWin={onWin} onFail={onFail} />;
    case 'OWNER_DRAG':
    case 'TRAP_2NF':
      return <OwnerDrag c={c} onWin={onWin} onFail={onFail} />;
    case 'RULE_VS_DATA':
      return <RuleVsData c={c} onWin={onWin} onFail={onFail} />;
    case 'JUDGE':
      return <Judge c={c} onWin={onWin} onFail={onFail} />;
    case 'GHOST':
      return <Ghost c={c} onWin={onWin} onFail={onFail} />;
    case 'DOMAIN_SORT':
      return <DomainSort c={c} onWin={onWin} onFail={onFail} />;
    case 'FINAL':
      return <FinalCase c={c} onWin={onWin} onFail={onFail} />;
    default:
      return null;
  }
}

function ClickUpdate({ c, onWin }: { c: CaseConfig; onWin: () => void }) {
  const [table, setTable] = useState(() => clone(c.table));
  const [highlight, setHighlight] = useState<string | null>(null);
  const [warn, setWarn] = useState('');
  const col = c.task.column as string;
  const oldV = c.task.oldValue as string;
  const newV = c.task.newValue as string;

  return (
    <div className="space-y-3">
      <p className="text-sm text-ink-soft">Click a repeated phone number, then click it again to change one copy.</p>
      {warn && <div className="border border-amber-300 bg-amber-50 text-amber-900 p-3 text-sm">{warn}</div>}
      <GameTable
        table={table}
        highlightValue={highlight ? { column: col, value: highlight } : null}
        onCellClick={(column, value, rowIndex) => {
          if (column !== col) return;
          if (String(value) === oldV) {
            if (highlight === oldV) {
              const next = clone(table);
              next.rows[rowIndex][col] = newV;
              setTable(next);
              setWarn(`Warning: ${next.rows[0].Doctor || 'This person'} now has two phone numbers in the file.`);
              onWin();
            } else {
              setHighlight(oldV);
            }
          }
        }}
      />
    </div>
  );
}

function SplitAndAdd({ c, onWin }: { c: CaseConfig; onWin: () => void }) {
  const [table, setTable] = useState(() => clone(c.table));
  const [stage, setStage] = useState(0);

  const splitCell = (column: string, value: unknown, rowIndex: number) => {
    if (typeof value !== 'string' || !value.includes(',')) return;
    const parts = value.split(',').map((s) => s.trim());
    const row = table.rows[rowIndex];
    const others = table.rows.filter((_, i) => i !== rowIndex);
    const next: DBTable = {
      ...table,
      columns: c.kind === 'ADD_ROW' ? [{ name: 'Student' }, { name: 'Book' }] : table.columns,
      rows: [
        ...parts.map((p) => (c.kind === 'ADD_ROW' ? { Student: row.Student, Book: p } : { ...row, [column]: p })),
        ...others.flatMap((r) => {
          if (c.kind === 'ADD_ROW' && typeof r.Books_Borrowed === 'string' && r.Books_Borrowed.includes(',')) {
            return String(r.Books_Borrowed).split(',').map((p) => ({ Student: r.Student, Book: p.trim() }));
          }
          if (c.kind === 'ADD_ROW') return [{ Student: r.Student, Book: r.Books_Borrowed }];
          return [r];
        }),
      ],
    };
    setTable(next);
    if (c.kind !== 'ADD_ROW') onWin();
    else setStage(1);
  };

  const addBook = () => {
    setTable({ ...table, rows: [...table.rows, { Student: 'Ram', Book: c.task.addBook }] });
    onWin();
  };

  return (
    <div className="space-y-3">
      <GameTable table={table} onCellClick={splitCell} />
      {c.kind === 'ADD_ROW' && stage === 1 && (
        <button type="button" onClick={addBook} className="btn-primary">
          Add book: {String(c.task.addBook)}
        </button>
      )}
      {c.kind === 'ADD_ROW' && stage === 0 && <p className="text-sm text-ink-soft">Click the comma-separated cell first.</p>}
    </div>
  );
}

function Identity({ c, onWin, onFail }: { c: CaseConfig; onWin: () => void; onFail: (m: string) => void }) {
  const [slot, setSlot] = useState<string | null>(null);
  const [secondRam, setSecondRam] = useState(false);
  const options = c.task.options as string[];
  const correct = c.task.correct as string;

  const drop = (opt: string) => {
    setSlot(opt);
    if (opt === 'Name') {
      setSecondRam(true);
      onFail('Two students named Ram. Can you still tell them apart?');
      return;
    }
    if (opt === correct) onWin();
    else onFail('Email can change, and two people could share one. Try the identifier built for this.');
  };

  return (
    <div className="space-y-4">
      <GameTable table={c.table} />
      {secondRam && (
        <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 p-3">A second Ram just enrolled. Names collide.</p>
      )}
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button key={o} type="button" onClick={() => drop(o)} className="chip">
            {o}
          </button>
        ))}
      </div>
      <div className="border-2 border-dashed border-blue-300 min-h-20 p-4 text-center">
        <div className="text-[11px] uppercase tracking-wider text-ink-soft mb-1">Identity slot</div>
        <div className="text-lg font-display">{slot || 'Drop a token here'}</div>
      </div>
    </div>
  );
}

function ComboKey({ c, onWin, onFail }: { c: CaseConfig; onWin: () => void; onFail: (m: string) => void }) {
  const [sel, setSel] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const correct = c.task.correct as string[];

  const click = (col: string) => {
    const next = sel.includes(col) ? sel.filter((x) => x !== col) : [...sel, col];
    setSel(next);
    if (next.length === 1 && next[0] === 'Student') setNote('Ram appears twice. Not enough.');
    else if (next.length === 1 && next[0] === 'Course') setNote('Database appears twice. Not enough.');
    else if (next.length === 1 && next[0] === 'Attendance') {
      setNote('Attendance is a measurement, not an identity.');
      onFail('Attendance is not the identity.');
    }
    const ok = correct.every((x) => next.includes(x)) && next.length === correct.length;
    if (ok) {
      setNote('Every record is identifiable.');
      onWin();
    }
  };

  return (
    <div className="space-y-3">
      {note && <p className="text-sm border border-stone-200 bg-white p-3">{note}</p>}
      <GameTable table={c.table} selectedHeaders={sel} onHeaderClick={click} />
    </div>
  );
}

function DrawDep({ c, onWin, onFail }: { c: CaseConfig; onWin: () => void; onFail: (m: string) => void }) {
  const [from, setFrom] = useState<string | null>(null);
  const [ok, setOk] = useState<string[]>([]);
  const valid = c.task.valid as string[];
  const invalid = c.task.invalid as string[];

  const click = (col: string) => {
    if (!from) {
      setFrom(col);
      return;
    }
    const edge = `${from} → ${col}`;
    if (from === (c.task.source as string) && valid.includes(col)) {
      const next = [...new Set([...ok, edge])];
      setOk(next);
      setFrom(null);
      return;
    }
    if (invalid.includes(col) && from === c.task.source) {
      setFrom(null);
      if (ok.length >= 1) {
        onFail('101 takes two courses. Student ID does not determine Course.');
        onWin();
      } else {
        onFail('First connect something Student ID actually determines.');
      }
      return;
    }
    onFail('Start from Student_ID.');
    setFrom(null);
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-ink-soft">{from ? `${from} → ?` : 'Click Student_ID, then what it determines.'}</p>
      {ok.map((e) => (
        <p key={e} className="text-sm text-emerald-800">{e}</p>
      ))}
      <GameTable table={c.table} onHeaderClick={click} selectedHeaders={[from].filter(Boolean) as string[]} />
    </div>
  );
}

function Chain({ c, onWin, onFail }: { c: CaseConfig; onWin: () => void; onFail: (m: string) => void }) {
  const chain = c.task.chain as string[];
  const [got, setGot] = useState<string[]>([]);
  const click = (col: string) => {
    if (chain[got.length] !== col) {
      onFail('Follow who owns what, in order.');
      setGot([]);
      return;
    }
    const next = [...got, col];
    setGot(next);
    if (next.length === chain.length) onWin();
  };
  return (
    <div className="space-y-3">
      <p className="font-mono text-sm">{got.join(' → ') || 'Click the first column'}</p>
      <GameTable table={c.table} selectedHeaders={got} onHeaderClick={click} />
    </div>
  );
}

function DragGroups({ c, onWin, onFail }: { c: CaseConfig; onWin: () => void; onFail: (m: string) => void }) {
  const groups = c.task.groups as string[];
  const mapping = c.task.mapping as Record<string, string>;
  const extras = (c.task.extras as Record<string, string[]>) || {};
  const cols = [...new Set([...Object.keys(mapping), ...c.table.columns.map((x) => x.name)])];
  const [placed, setPlaced] = useState<Record<string, string[]>>({});
  const [hold, setHold] = useState<string | null>(null);

  const drop = (g: string) => {
    if (!hold) return;
    setPlaced((p) => ({ ...p, [hold]: [...new Set([...(p[hold] || []), g])] }));
    setHold(null);
  };

  const check = () => {
    const ok = Object.entries(mapping).every(([col, g]) => (placed[col] || []).includes(g));
    const extraOk = Object.entries(extras).every(([g, need]) => need.every((col) => (placed[col] || []).includes(g)));
    if (ok && extraOk) onWin();
    else onFail('Ask which thing this fact describes. Keys can live in more than one table.');
  };

  return (
    <div className="space-y-4">
      <GameTable table={c.table} />
      <div className="flex flex-wrap gap-2">
        {cols.filter((col) => !(placed[col] && placed[col].length)).map((col) => (
          <button key={col} type="button" onClick={() => setHold(col)} className={cn('chip', hold === col && 'chip-on')}>
            {col}
          </button>
        ))}
      </div>
      {hold && <p className="text-sm text-blue-800">Selected {hold}. Click a table. Click again to add it to another table.</p>}
      <div className="grid sm:grid-cols-3 gap-3">
        {groups.map((g) => (
          <button key={g} type="button" onClick={() => drop(g)} className="min-h-28 border border-dashed border-stone-300 p-3 text-left bg-white">
            <div className="text-xs font-semibold mb-2">{g}</div>
            {Object.entries(placed)
              .filter(([, gs]) => gs.includes(g))
              .map(([col]) => (
                <div key={col} className="text-xs text-blue-800">{col}</div>
              ))}
          </button>
        ))}
      </div>
      <button type="button" onClick={check} className="btn-primary">Check structure</button>
    </div>
  );
}

function OwnerDrag({ c, onWin, onFail }: { c: CaseConfig; onWin: () => void; onFail: (m: string) => void }) {
  const facts = (c.task.facts as string[]) || ['Student_Name', 'Course_Name', 'Grade'];
  const slots = (c.task.slots as string[]) || ['Student_ID', 'Course_ID', 'Student_ID + Course_ID'];
  const mapping = c.task.mapping as Record<string, string>;
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [hold, setHold] = useState<string | null>(null);

  const drop = (slot: string) => {
    if (!hold) return;
    const next = { ...placed, [hold]: slot };
    setPlaced(next);
    setHold(null);
    if (c.kind === 'TRAP_2NF' && hold === 'Student_Name' && slot === 'Student_ID + Course_ID') {
      onFail('Think again. Does Course ID help determine Student Name?');
    }
    if (facts.every((f) => next[f] === mapping[f])) onWin();
  };

  return (
    <div className="space-y-4">
      <GameTable table={c.table} />
      <div className="flex flex-wrap gap-2">
        {facts.filter((f) => !placed[f]).map((f) => (
          <button key={f} type="button" className={cn('chip', hold === f && 'chip-on')} onClick={() => setHold(f)}>
            {f}
          </button>
        ))}
      </div>
      <div className="grid sm:grid-cols-3 gap-3">
        {slots.map((s) => (
          <button key={s} type="button" onClick={() => drop(s)} className="min-h-24 border border-dashed border-stone-300 p-3 text-left bg-white">
            <div className="text-xs font-semibold mb-2">{s}</div>
            {Object.entries(placed)
              .filter(([, v]) => v === s)
              .map(([k]) => (
                <div key={k} className="text-xs text-blue-800">{k}</div>
              ))}
          </button>
        ))}
      </div>
    </div>
  );
}

function RuleVsData({ c, onWin, onFail }: { c: CaseConfig; onWin: () => void; onFail: (m: string) => void }) {
  const [step, setStep] = useState(0);
  const [table, setTable] = useState(() => clone(c.table));

  return (
    <div className="space-y-4">
      <GameTable table={table} />
      {step === 0 && (
        <div className="space-y-2">
          <p className="text-sm">From these rows, does Student determine City?</p>
          <div className="flex gap-2">
            <button type="button" className="chip" onClick={() => setStep(1)}>It looks like yes</button>
            <button type="button" className="chip" onClick={() => setStep(1)}>Not sure — only three rows</button>
          </div>
        </div>
      )}
      {step === 1 && (
        <div className="space-y-2">
          <p className="text-sm">Ram moves to Pokhara. Did the rule change, or did the data change?</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="chip"
              onClick={() => {
                const next = clone(table);
                next.rows[0].City = 'Pokhara';
                setTable(next);
                onWin();
              }}
            >
              The data changed. City was never a guaranteed rule.
            </button>
            <button type="button" className="chip" onClick={() => onFail('People move. A sample is not a rule.')}>
              The rule broke, so Student → City was real.
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Judge({ c, onWin, onFail }: { c: CaseConfig; onWin: () => void; onFail: (m: string) => void }) {
  const [step, setStep] = useState(0);
  return (
    <div className="space-y-4">
      <GameTable table={c.table} />
      {step === 0 && (
        <div className="space-y-2">
          <p className="text-sm">Can both patients have Student ID 101?</p>
          <div className="flex gap-2">
            <button type="button" className="chip" onClick={() => onFail('Two people cannot share an identity.')}>Accept</button>
            <button type="button" className="chip" onClick={() => setStep(1)}>Reject</button>
          </div>
        </div>
      )}
      {step === 1 && (
        <div className="space-y-2">
          <p className="text-sm">Incoming: Student ID = NULL, Name = Hari</p>
          <div className="flex gap-2">
            <button type="button" className="chip" onClick={() => onFail('NULL is not an identity.')}>Accept</button>
            <button type="button" className="chip" onClick={onWin}>Reject</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Ghost({ c, onWin, onFail }: { c: CaseConfig; onWin: () => void; onFail: (m: string) => void }) {
  const parent: DBTable = {
    id: 'st',
    name: 'Students',
    columns: [{ name: 'Student_ID' }, { name: 'Name' }],
    rows: c.task.parent as Record<string, unknown>[],
  };
  return (
    <div className="space-y-4">
      <GameTable table={parent} />
      <GameTable
        table={c.table}
        onRowClick={(i) => {
          if (i === c.task.targetRow) onWin();
          else onFail('That student exists. Look for the ID that is missing from Students.');
        }}
      />
    </div>
  );
}

function DomainSort({ c, onWin, onFail }: { c: CaseConfig; onWin: () => void; onFail: (m: string) => void }) {
  const items = c.task.items as Array<{ label: string; valid: boolean }>;
  const [placed, setPlaced] = useState<Record<string, 'VALID' | 'INVALID'>>({});
  const [hold, setHold] = useState<string | null>(null);
  const drop = (bucket: 'VALID' | 'INVALID') => {
    if (!hold) return;
    const item = items.find((x) => x.label === hold)!;
    const next = { ...placed, [hold]: bucket };
    setPlaced(next);
    setHold(null);
    const want = item.valid ? 'VALID' : 'INVALID';
    if (bucket !== want) onFail(item.valid ? 'That value is allowed.' : 'That value is outside the allowed set.');
    if (items.every((x) => next[x.label] === (x.valid ? 'VALID' : 'INVALID'))) onWin();
  };
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {items.filter((x) => !placed[x.label]).map((x) => (
          <button key={x.label} type="button" className={cn('chip', hold === x.label && 'chip-on')} onClick={() => setHold(x.label)}>
            {x.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {(['VALID', 'INVALID'] as const).map((b) => (
          <button key={b} type="button" onClick={() => drop(b)} className="min-h-28 border border-dashed p-3 text-left bg-white">
            <div className="text-xs font-semibold mb-2">{b}</div>
            {Object.entries(placed)
              .filter(([, v]) => v === b)
              .map(([k]) => (
                <div key={k} className="text-xs">{k}</div>
              ))}
          </button>
        ))}
      </div>
    </div>
  );
}

function FinalCase({ c, onWin, onFail }: { c: CaseConfig; onWin: () => void; onFail: (m: string) => void }) {
  const [stage, setStage] = useState(0);
  return (
    <div className="space-y-4">
      {stage === 0 && (
        <div className="space-y-3">
          <p className="text-sm">Lists are hiding in Events_Joined. Split Ram’s list.</p>
          <SplitAndAdd
            c={{ ...c, kind: 'SPLIT_ITEMS', task: { column: 'Events_Joined', rowIndex: 0, values: ['E01', 'E03'] } }}
            onWin={() => setStage(1)}
          />
        </div>
      )}
      {stage === 1 && (
        <div className="space-y-3">
          <p className="text-sm">Now group the facts.</p>
          <DragGroups c={c} onWin={() => setStage(2)} onFail={onFail} />
        </div>
      )}
      {stage === 2 && (
        <div className="space-y-3">
          <p className="text-sm">Incoming junk. Reject what would break the database.</p>
          {[
            { t: 'Duplicate Student ID 101', ok: 'REJECT' },
            { t: 'Student ID NULL', ok: 'REJECT' },
            { t: 'Event ID E99 (unknown)', ok: 'REJECT' },
          ].map((row) => (
            <div key={row.t} className="flex items-center justify-between gap-3 border border-stone-200 p-3 bg-white">
              <span className="text-sm">{row.t}</span>
              <button type="button" className="chip" onClick={() => row.ok === 'REJECT' && setStage((s) => s)}>
                Reject
              </button>
            </div>
          ))}
          <button type="button" className="btn-primary" onClick={onWin}>
            Seal the database
          </button>
        </div>
      )}
    </div>
  );
}
