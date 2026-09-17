
export interface LiveDataTableProps {
  title?: string;
  subtitle?: string;
  columns: string[];
  rows: Array<Record<string, string | number | null | undefined>>;
  primaryKeys?: string[];
  foreignKeys?: string[];
  highlightCells?: Array<{ row: number; column: string; type?: 'warning' | 'error' | 'success' | 'info' }>;
  highlightRows?: number[];
  deletedRows?: number[];
  badge?: string;
  emptyMessage?: string;
  compact?: boolean;
  onRowClick?: (rowIndex: number) => void;
  selectedRowIndices?: number[];
  className?: string;
}

export default function LiveDataTable({
  title,
  subtitle,
  columns,
  rows,
  primaryKeys = [],
  foreignKeys = [],
  highlightCells = [],
  highlightRows = [],
  deletedRows = [],
  badge,
  emptyMessage = 'No records in table',
  compact = false,
  onRowClick,
  selectedRowIndices = [],
  className = '',
}: LiveDataTableProps) {
  const isPk = (col: string) =>
    primaryKeys.some((pk) => pk.toLowerCase().replace(/\s+/g, '') === col.toLowerCase().replace(/\s+/g, ''));
  const isFk = (col: string) =>
    foreignKeys.some((fk) => fk.toLowerCase().replace(/\s+/g, '') === col.toLowerCase().replace(/\s+/g, ''));

  return (
    <div className={`live-table-container ${className}`}>
      {(title || badge) && (
        <div className="live-table-header">
          <div className="live-table-title-wrap">
            {title && <span className="live-table-title">{title}</span>}
            {subtitle && <small className="live-table-subtitle">{subtitle}</small>}
          </div>
          {badge && <span className="live-table-badge">{badge}</span>}
        </div>
      )}

      <div className="live-table-scroll">
        <table className={`live-data-table ${compact ? 'table-compact' : ''}`}>
          <thead>
            <tr>
              {columns.map((col) => {
                const pk = isPk(col);
                const fk = isFk(col);
                return (
                  <th key={col} className={`${pk ? 'th-pk' : ''} ${fk ? 'th-fk' : ''}`}>
                    <div className="th-content">
                      <span>{col}</span>
                      {pk && <span className="pk-badge" title="Primary Key">PK</span>}
                      {fk && <span className="fk-badge" title="Foreign Key">FK</span>}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={Math.max(columns.length, 1)} className="td-empty">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row, rIdx) => {
                const isSelected = selectedRowIndices.includes(rIdx);
                const isHighlighted = highlightRows.includes(rIdx);
                const isDeleted = deletedRows.includes(rIdx);

                let rowClass = '';
                if (isSelected) rowClass = 'row-selected';
                else if (isDeleted) rowClass = 'row-deleted';
                else if (isHighlighted) rowClass = 'row-highlighted';

                return (
                  <tr
                    key={rIdx}
                    className={`${rowClass} ${onRowClick ? 'row-clickable' : ''}`}
                    onClick={() => onRowClick?.(rIdx)}
                  >
                    {columns.map((col) => {
                      const val = row[col];
                      const isNull = val === null || val === undefined || val === '';
                      const cellHighlight = highlightCells.find((c) => c.row === rIdx && c.column === col);

                      let cellClass = '';
                      if (cellHighlight) {
                        cellClass = `cell-highlight-${cellHighlight.type || 'warning'}`;
                      }

                      return (
                        <td key={col} className={`${cellClass} ${isNull ? 'cell-null' : ''}`}>
                          {isNull ? (
                            <span className="null-indicator">NULL</span>
                          ) : (
                            String(val)
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
