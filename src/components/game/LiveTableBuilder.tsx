import LiveDataTable from './LiveDataTable';
import {
  BASE_TOURNAMENT_TABLE,
  projectTableRows,
  STANDARD_ENTITY_SCHEMAS,
  type LiveTableData,
  type TableRecord,
} from '../../lib/game/dataTransformer';

export interface LiveTableBuilderProps {
  sourceTable?: LiveTableData;
  cards: string[];
  bins: string[];
  placements: Record<string, string>;
  selectedCard: string | null;
  onSelectCard: (card: string) => void;
  onPlaceCard: (card: string, bin: string) => void;
  onQuickPlace: (bin: string) => void;
  relations?: Array<{ from: string; to: string; label: string }>;
  playerName: string;
  disabled?: boolean;
}

export default function LiveTableBuilder({
  sourceTable = BASE_TOURNAMENT_TABLE,
  cards,
  bins,
  placements,
  selectedCard,
  onSelectCard,
  onPlaceCard,
  onQuickPlace,
  relations = [],
  playerName,
  disabled = false,
}: LiveTableBuilderProps) {
  const resolvedSourceRows = sourceTable.rows.map((row) => {
    const nextRow: TableRecord = {};
    for (const [k, v] of Object.entries(row)) {
      nextRow[k] = typeof v === 'string' ? v.replaceAll('{player}', playerName) : v;
    }
    return nextRow;
  });

  const builtBins = bins.filter((bin) => Object.values(placements).includes(bin));

  const activeRelations = relations.filter(
    ({ from, to }) => builtBins.includes(from) && builtBins.includes(to)
  );

  return (
    <div className="live-table-builder-container">
      {/* 1. ORIGINAL DATA */}
      <div className="builder-section">
        <h3 className="builder-section-title">Original data</h3>
        <LiveDataTable
          columns={sourceTable.columns}
          rows={resolvedSourceRows}
          primaryKeys={sourceTable.primaryKeys}
          compact
          className="source-dataset-table"
        />
      </div>

      {/* 2. CHOOSE WHERE EACH FIELD BELONGS */}
      <div className="builder-controls-section">
        <h3 className="builder-section-title">Choose where each field belongs</h3>
        
        <div className="attribute-card-tray">
          {cards.map((card) => {
            const assignedBin = placements[card];
            const isSelected = selectedCard === card;
            return (
              <button
                key={card}
                type="button"
                className={`attr-card ${isSelected ? 'attr-card-selected' : ''} ${assignedBin ? 'attr-card-assigned' : ''}`}
                onClick={() => onSelectCard(card)}
                disabled={disabled}
                draggable={!disabled}
                onDragStart={(e) => e.dataTransfer.setData('text/plain', card)}
              >
                <span className="attr-name">{card.replaceAll('{player}', playerName)}</span>
                {assignedBin && <span className="attr-home-badge">→ {assignedBin}</span>}
              </button>
            );
          })}
        </div>

        <div className="target-bin-row">
          {bins.map((bin) => (
            <button
              key={bin}
              type="button"
              className={`target-bin-btn ${selectedCard ? 'bin-ready-to-receive' : ''}`}
              onClick={() => onQuickPlace(bin)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const card = e.dataTransfer.getData('text/plain');
                if (card) onPlaceCard(card, bin);
              }}
              disabled={disabled}
            >
              Put in {bin}
            </button>
          ))}
        </div>
      </div>

      {/* 3. LIVE DATABASE */}
      <div className="builder-section">
        <h3 className="builder-section-title">Live database</h3>

        {builtBins.length === 0 ? (
          <p className="empty-build-note">Choose a field above to start building.</p>
        ) : (
          <div className="constructed-tables-grid">
            {builtBins.map((bin) => {
              const assignedCols = cards.filter((c) => placements[c] === bin);
              const schemaSpec = STANDARD_ENTITY_SCHEMAS[bin];
              const projectedRows = projectTableRows(resolvedSourceRows, assignedCols);

              const fkCols = schemaSpec?.foreignKeys
                ?.filter((fk) => builtBins.includes(fk.targetTable) && assignedCols.includes(fk.column))
                .map((fk) => fk.column) || [];

              return (
                <div key={bin} className="constructed-table-card">
                  <LiveDataTable
                    title={bin}
                    columns={assignedCols}
                    rows={projectedRows}
                    primaryKeys={schemaSpec?.primaryKeys || []}
                    foreignKeys={fkCols}
                    compact
                    emptyMessage="Add fields to populate records"
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* 4. RELATIONSHIPS */}
        {activeRelations.length > 0 && (
          <div className="active-relations-panel">
            <span className="relations-label">Relationships:</span>
            <div className="relations-list">
              {activeRelations.map(({ from, to, label }) => (
                <div key={`${from}-${to}-${label}`} className="relation-tag">
                  <span className="relation-from">{from}</span>
                  <span className="relation-arrow">── {label} ──→</span>
                  <span className="relation-to">{to}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
