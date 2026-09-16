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
    <div className={cn('border border-stone-300 bg-white overflow-hidden shadow-sm', className)}>
      <div className="bg-stone-50 px-3 py-1.5 text-xs font-semibold tracking-wide text-stone-600 border-b border-stone-200">
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
                      'p-2 text-left text-xs font-semibold border-b border-stone-200 whitespace-nowrap',
                      onHeaderClick && 'cursor-pointer hover:bg-blue-50 focus:outline focus:outline-2 focus:outline-blue-700',
                      selected && 'bg-blue-100 text-blue-900',
                      isPk && !selected && 'text-blue-800',
                      !isPk && !selected && 'text-stone-500',
                    )}
                  >
                    {col.name}
                    {isPk ? ' 🔑' : ''}
                  </th>
                );
              })}
              {onRowAction && <th className="p-2 text-left text-xs text-stone-500 border-b border-stone-200">Action</th>}
            </tr>
          </thead>
          <tbody>
            {table.rows.length === 0 && (
              <tr>
                <td colSpan={colSpan} className="p-3 text-center text-stone-400 text-xs">
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
                    'border-b border-stone-100',
                    onRowClick && 'cursor-pointer hover:bg-stone-50 focus:bg-stone-50',
                    rowSelected && 'bg-red-50',
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
                          match && 'bg-amber-100 text-amber-950 font-medium ring-1 ring-inset ring-amber-400',
                          isNull && 'italic text-stone-400',
                        )}
                      >
                        {canEdit ? (
                          <input
                            aria-label={`Edit ${col.name} row ${ri + 1}`}
                            className="w-full bg-transparent border-b border-stone-400 outline-none focus:border-blue-700 px-0 py-0.5"
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
                        className="border border-stone-400 px-2 py-1 text-[11px] hover:border-red-500 hover:text-red-700"
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
