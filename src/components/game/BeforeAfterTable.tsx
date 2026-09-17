import LiveDataTable from './LiveDataTable';

export interface TableSnapshot {
  title: string;
  columns: string[];
  rows: Array<Record<string, string | number | null | undefined>>;
  primaryKeys?: string[];
  highlightCells?: Array<{ row: number; column: string; type?: 'warning' | 'error' | 'success' | 'info' }>;
  highlightRows?: number[];
  deletedRows?: number[];
  badge?: string;
}

export interface BeforeAfterTableProps {
  before: TableSnapshot;
  changeLabel: string;
  changeCountBadge?: string;
  after?: TableSnapshot;
  warning?: string;
  className?: string;
}

export default function BeforeAfterTable({
  before,
  changeLabel,
  changeCountBadge,
  after,
  warning,
  className = '',
}: BeforeAfterTableProps) {
  return (
    <div className={`before-after-container ${className}`}>
      <div className="before-after-grid">
        <div className="state-panel state-panel-before">
          <div className="panel-badge-bar">
            <span className="panel-phase-badge before-badge">BEFORE</span>
            {before.badge && <span className="custom-badge">{before.badge}</span>}
          </div>
          <LiveDataTable
            title={before.title}
            columns={before.columns}
            rows={before.rows}
            primaryKeys={before.primaryKeys}
            highlightCells={before.highlightCells}
            highlightRows={before.highlightRows}
            deletedRows={before.deletedRows}
            compact
          />
        </div>

        <div className="transformation-connector">
          <div className="flow-arrow-down">↓</div>
          <div className="change-label-bubble">
            <strong>{changeLabel}</strong>
            {changeCountBadge && <span className="change-count-pill">{changeCountBadge}</span>}
          </div>
          <div className="flow-arrow-down">↓</div>
        </div>

        {after && (
          <div className="state-panel state-panel-after">
            <div className="panel-badge-bar">
              <span className="panel-phase-badge after-badge">AFTER</span>
              {after.badge && <span className="custom-badge">{after.badge}</span>}
            </div>
            <LiveDataTable
              title={after.title}
              columns={after.columns}
              rows={after.rows}
              primaryKeys={after.primaryKeys}
              highlightCells={after.highlightCells}
              highlightRows={after.highlightRows}
              deletedRows={after.deletedRows}
              compact
            />
          </div>
        )}
      </div>

      {warning && (
        <div className="transformation-warning">
          <span className="warning-text">{warning}</span>
        </div>
      )}
    </div>
  );
}
