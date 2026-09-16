import type { DBTable } from '../../lib/normalization/engine';
import { cn } from '../../lib/utils';

export interface GameTableProps {
  table: DBTable;
  highlightValue?: { column?: string; value?: unknown } | null;
  selectedHeaders?: string[];
  selectedRows?: number[];
  onCellClick?: (column: string, value: unknown, rowIndex: number) => void;
  onHeaderClick?: (column: string) => void;
  onRowClick?: (rowIndex: number) => void;
  onCellEdit?: (rowIndex: number, column: string, value: string) => void;
  editable?: boolean;
  editColumn?: string;
  rowActionLabel?: string;
  onRowAction?: (rowIndex: number) => void;
  className?: string;
}

export default function GameTable({
  table,
  highlightValue,
  selectedHeaders = [],
  selectedRows = [],
  onCellClick,
  onHeaderClick,
  onRowClick,
  onCellEdit,
  editable = false,
  editColumn,
  rowActionLabel,
  onRowAction,
  className,
}: GameTableProps) {
  const cols = table.columns;
  const colSpan = cols.length + (onRowAction ? 1 : 0);

  return (
    <div className={cn('border border-slate-700 bg-slate-950 overflow-hidden', className)}>
      <div className="bg-slate-900 px-3 py-1.5 text-xs font-semibold tracking-wide text-slate-300 border-b border-slate-800">
        {table.name}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-max" aria-label={table.name}>
          <thead>
            <tr>
              {cols.map((col) => {
                const isPk = col.isPrimaryKey || col.isCompositeKey || table.primaryKey?.includes(col.name);
                const selected = selectedHeaders.includes(col.name);
                return (
                  <th
                    key={col.name}
                    scope="col"
                    tabIndex={onHeaderClick ? 0 : undefined}
                    onClick={() => onHeaderClick?.(col.name)}
                    onKeyDown={(e) => {
                      if (onHeaderClick && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        onHeaderClick(col.name);
                      }
                    }}
                    className={cn(
                      'p-2 text-left text-xs font-semibold border-b border-slate-800 whitespace-nowrap',
                      onHeaderClick && 'cursor-pointer hover:bg-slate-800 focus:outline focus:outline-2 focus:outline-emerald-500',
                      selected && 'bg-emerald-950 text-emerald-300',
                      isPk && !selected && 'text-amber-300',
                      !isPk && !selected && 'text-slate-500',
                    )}
                  >
                    {col.name}
                    {isPk ? ' 🔑' : ''}
                  </th>
                );
              })}
              {onRowAction && <th className="p-2 text-left text-xs text-slate-500 border-b border-slate-800">Action</th>}
            </tr>
          </thead>
          <tbody>
            {table.rows.length === 0 && (
              <tr>
                <td colSpan={colSpan} className="p-3 text-center text-slate-600 text-xs">
                  Empty
                </td>
              </tr>
            )}
            {table.rows.map((row, ri) => {
              const rowSelected = selectedRows.includes(ri);
              return (
                <tr
                  key={ri}
                  onClick={() => onRowClick?.(ri)}
                  tabIndex={onRowClick ? 0 : undefined}
                  onKeyDown={(e) => {
                    if (onRowClick && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      onRowClick(ri);
                    }
                  }}
                  className={cn(
                    'border-b border-slate-800/60',
                    onRowClick && 'cursor-pointer hover:bg-slate-900 focus:bg-slate-900',
                    rowSelected && 'bg-red-950/40',
                  )}
                >
                  {cols.map((col) => {
                    const v = row[col.name];
                    const isNull = v === null || v === undefined || v === '';
                    const match =
                      highlightValue &&
                      (highlightValue.column ? highlightValue.column === col.name : true) &&
                      String(v) === String(highlightValue.value);
                    const canEdit = editable && (!editColumn || editColumn === col.name);
                    return (
                      <td
                        key={col.name}
                        onClick={(e) => {
                          e.stopPropagation();
                          onCellClick?.(col.name, v, ri);
                        }}
                        className={cn(
                          'p-2 whitespace-nowrap',
                          onCellClick && 'cursor-pointer',
                          match && 'bg-amber-500/25 text-amber-100 font-medium ring-1 ring-inset ring-amber-400/40',
                          isNull && 'italic text-slate-500',
                        )}
                      >
                        {canEdit ? (
                          <input
                            aria-label={`Edit ${col.name} row ${ri + 1}`}
                            className="w-full bg-transparent border-b border-slate-600 outline-none focus:border-emerald-400 px-0 py-0.5"
                            defaultValue={isNull ? '' : String(v)}
                            onBlur={(e) => onCellEdit?.(ri, col.name, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : isNull ? (
                          'NULL'
                        ) : (
                          String(v)
                        )}
                      </td>
                    );
                  })}
                  {onRowAction && (
                    <td className="p-2">
                      <button
                        type="button"
                        className="border border-slate-600 px-2 py-1 text-[11px] hover:border-red-400 hover:text-red-300 focus:outline focus:outline-2 focus:outline-emerald-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRowAction(ri);
                        }}
                      >
                        {rowActionLabel || 'Delete'}
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
