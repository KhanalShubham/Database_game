import LiveDataTable from './LiveDataTable';
import type { LiveTableData } from '../../lib/game/dataTransformer';

export interface ConsequenceRevealProps {
  status: 'correct' | 'wrong' | 'warning' | 'info';
  headline: string;
  consequenceTable?: LiveTableData;
  impactNote?: string;
  explanation: string;
  className?: string;
}

export default function ConsequenceReveal({
  status,
  headline,
  consequenceTable,
  impactNote,
  explanation,
  className = '',
}: ConsequenceRevealProps) {
  return (
    <div className={`consequence-reveal-card status-${status} ${className}`}>
      <h3 className="consequence-headline">{headline}</h3>

      {consequenceTable && (
        <div className="consequence-table-wrap">
          <LiveDataTable
            title={consequenceTable.name}
            columns={consequenceTable.columns}
            rows={consequenceTable.rows}
            primaryKeys={consequenceTable.primaryKeys}
            compact
            className="consequence-data-table"
          />
        </div>
      )}

      {impactNote && (
        <div className="consequence-impact-callout">
          <span>{impactNote}</span>
        </div>
      )}

      <div className="consequence-explanation">
        <p>{explanation}</p>
      </div>
    </div>
  );
}
