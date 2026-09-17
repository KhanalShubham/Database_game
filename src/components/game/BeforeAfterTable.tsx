import LiveDataTable from './LiveDataTable';

export interface EvidenceHighlight {
  label: string;
  from: string;
  to: string;
  status: 'CHANGED' | 'DID NOT CHANGE';
}

export interface ThereforeFlow {
  determinant: string;
  dependent: string;
  explanation?: string;
}

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
  evidenceNotes?: EvidenceHighlight[];
  therefore?: ThereforeFlow;
  after?: TableSnapshot;
  warning?: string;
  className?: string;
}

export default function BeforeAfterTable({
  before,
  changeLabel,
  changeCountBadge,
  evidenceNotes,
  therefore,
  after,
  warning,
  className = '',
}: BeforeAfterTableProps) {
  return (
    <div className={`before-after-container ${className}`}>
      <div className={`before-after-grid ${!after ? 'single-panel-grid' : ''}`}>
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

        {evidenceNotes && evidenceNotes.length > 0 && (
          <div className="evidence-diff-panel">
            <div className="evidence-diff-header">DATA OBSERVATION</div>
            <div className="evidence-items-grid">
              {evidenceNotes.map((item, idx) => {
                const isChanged = item.status === 'CHANGED';
                return (
                  <div
                    key={idx}
                    className={`evidence-card ${isChanged ? 'is-changed' : 'is-unchanged'}`}
                  >
                    <div className="evidence-field-label">{item.label}</div>
                    <div className="evidence-values">
                      <span className="ev-val ev-val-from">{item.from}</span>
                      <span className="ev-arrow">→</span>
                      <span className="ev-val ev-val-to">{item.to}</span>
                    </div>
                    <span className={`evidence-badge ${isChanged ? 'badge-changed' : 'badge-unchanged'}`}>
                      {item.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {therefore && (
          <div className="therefore-card">
            <span className="therefore-badge">THEREFORE</span>
            <div className="therefore-diagram">
              <span className="therefore-node determinant-node">{therefore.determinant}</span>
              <div className="therefore-determines-arrow">
                <span className="arrow-stem">─────────►</span>
                <span className="arrow-text">determines</span>
              </div>
              <span className="therefore-node dependent-node">{therefore.dependent}</span>
            </div>
            {therefore.explanation && (
              <p className="therefore-subtext">{therefore.explanation}</p>
            )}
          </div>
        )}

        {after && (
          <>
            <div className="transformation-connector">
              <div className="flow-arrow-down">↓</div>
              <div className="change-label-bubble">
                <strong>{changeLabel}</strong>
                {changeCountBadge && <span className="change-count-pill">{changeCountBadge}</span>}
              </div>
              <div className="flow-arrow-down">↓</div>
            </div>

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
          </>
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
