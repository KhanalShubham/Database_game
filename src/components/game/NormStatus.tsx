import { calculateNormalizationStatus, type DBTable, type FunctionalDep } from '../../lib/normalization/engine';
import { cn } from '../../lib/utils';

export default function NormStatus({
  tables,
  deps = [],
}: {
  tables: DBTable[];
  deps?: FunctionalDep[];
}) {
  if (!tables.length) return null;
  const s = calculateNormalizationStatus(tables, deps);
  const rows = [
    { label: '1NF', ok: s.is1NF, problem: s.atomicViolations.length ? 'Non-atomic values' : s.repeatingGroups.length ? 'Repeating groups' : null },
    { label: '2NF', ok: s.is2NF, problem: s.partialDeps.length ? `Partial dependency: ${s.partialDeps.map((d) => d.to).join(', ')}` : !s.is1NF ? 'Requires 1NF first' : null },
    { label: '3NF', ok: s.is3NF, problem: s.transitiveDeps.length ? `Transitive dependency: ${s.transitiveDeps.map((d) => d.to).join(', ')}` : !s.is2NF ? 'Requires 2NF first' : null },
  ];

  return (
    <div className="border border-slate-700 bg-slate-950 p-3 space-y-2" aria-live="polite">
      <div className="text-[11px] uppercase tracking-wider text-slate-500">Normalization</div>
      {rows.map((r) => (
        <button
          key={r.label}
          type="button"
          className="w-full text-left text-xs flex items-start justify-between gap-2"
          title={r.problem || `${r.label} achieved`}
        >
          <span className="font-semibold">{r.label}</span>
          <span className={cn('text-right', r.ok ? 'text-emerald-400' : 'text-red-400')}>
            {r.ok ? '✓' : '✕'} {r.ok ? 'ACHIEVED' : r.problem}
          </span>
        </button>
      ))}
    </div>
  );
}
