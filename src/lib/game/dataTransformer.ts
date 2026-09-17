export interface TableRecord {
  [key: string]: string | number | null;
}

export interface LiveTableData {
  name: string;
  columns: string[];
  primaryKeys?: string[];
  foreignKeys?: Array<{ column: string; targetTable: string }>;
  rows: TableRecord[];
  description?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// BASE PUBG TOURNAMENT DATASET (The original mixed 1NF table)
// ─────────────────────────────────────────────────────────────────────────────
export const BASE_TOURNAMENT_TABLE: LiveTableData = {
  name: 'ORIGINAL TOURNAMENT DATABASE',
  columns: ['PlayerID', 'PlayerName', 'SquadID', 'SquadName', 'MatchID', 'Map', 'Kills', 'Rank'],
  primaryKeys: ['PlayerID', 'MatchID'],
  rows: [
    { PlayerID: 'P01', PlayerName: 'RAVEN', SquadID: 'S01', SquadName: 'PHANTOM', MatchID: 'M01', Map: 'Erangel', Kills: 8, Rank: 2 },
    { PlayerID: 'P02', PlayerName: 'VENOM', SquadID: 'S01', SquadName: 'PHANTOM', MatchID: 'M01', Map: 'Erangel', Kills: 5, Rank: 4 },
    { PlayerID: 'P01', PlayerName: 'RAVEN', SquadID: 'S01', SquadName: 'PHANTOM', MatchID: 'M02', Map: 'Miramar', Kills: 3, Rank: 12 },
  ],
};

// Extended dataset for Final Boss with multi-valued weapons & captain details
export const FINAL_BOSS_DATASET: LiveTableData = {
  name: 'CORRUPTED TOURNAMENT CORE',
  columns: ['PlayerID', 'PlayerName', 'SquadID', 'SquadName', 'MatchID', 'Map', 'Weapons', 'Captain', 'CaptainPhone', 'Kills'],
  primaryKeys: ['PlayerID', 'MatchID'],
  rows: [
    { PlayerID: 'P01', PlayerName: 'RAVEN', SquadID: 'S01', SquadName: 'PHANTOM', MatchID: 'M07', Map: 'Erangel', Weapons: 'M416, Kar98k', Captain: 'ZERO', CaptainPhone: '9801', Kills: 8 },
    { PlayerID: 'P02', PlayerName: 'VENOM', SquadID: 'S01', SquadName: 'PHANTOM', MatchID: 'M07', Map: 'Erangel', Weapons: 'M416', Captain: 'ZERO', CaptainPhone: '9801', Kills: 5 },
    { PlayerID: 'P01', PlayerName: 'RAVEN', SquadID: 'S01', SquadName: 'PHANTOM', MatchID: 'M08', Map: 'Miramar', Weapons: 'UMP45', Captain: 'ZERO', CaptainPhone: '9801', Kills: 3 },
  ],
};

// Normalize column name aliases (e.g. 'Player ID' -> 'PlayerID', 'Match Map' -> 'Map')
export function normalizeColKey(col: string): string {
  const clean = col.replace(/\s+/g, '');
  const map: Record<string, string> = {
    PlayerID: 'PlayerID',
    PlayerName: 'PlayerName',
    SquadID: 'SquadID',
    SquadName: 'SquadName',
    MatchID: 'MatchID',
    Map: 'Map',
    MatchMap: 'Map',
    Kills: 'Kills',
    Rank: 'Rank',
    WeaponName: 'WeaponName',
    Weapons: 'Weapons',
    Captain: 'Captain',
    CaptainPhone: 'CaptainPhone',
    LeaderPhone: 'CaptainPhone',
    ClanID: 'ClanID',
    ClanName: 'ClanName',
    SeasonID: 'SeasonID',
    SeasonPrizeList: 'SeasonPrizeList',
    YourPrizeLevel: 'YourPrizeLevel',
    PrizeLevel: 'YourPrizeLevel',
    Damage: 'Damage',
    Ammo: 'Ammo',
  };
  return map[clean] || clean;
}

/**
 * Project source rows into a new table with distinct entity rows
 */
export function projectTableRows(
  sourceRows: TableRecord[],
  columns: string[],
  aliases?: Record<string, string>
): TableRecord[] {
  if (columns.length === 0) return [];

  const seen = new Set<string>();
  const results: TableRecord[] = [];

  for (const row of sourceRows) {
    const projectedRow: TableRecord = {};
    let hasAnyVal = false;

    for (const col of columns) {
      const sourceKey = aliases?.[col] || normalizeColKey(col);
      // Fallback searches if column has different casing or formatting
      let val = row[col] ?? row[sourceKey];
      if (val === undefined) {
        const foundEntry = Object.entries(row).find(([k]) => normalizeColKey(k).toLowerCase() === sourceKey.toLowerCase());
        if (foundEntry) val = foundEntry[1];
      }

      projectedRow[col] = val !== undefined ? val : '—';
      if (val !== undefined) hasAnyVal = true;
    }

    if (!hasAnyVal) continue;

    const signature = JSON.stringify(projectedRow);
    if (!seen.has(signature)) {
      seen.add(signature);
      results.push(projectedRow);
    }
  }

  return results;
}

/**
 * Standard table specifications for live normalization targets
 */
export const STANDARD_ENTITY_SCHEMAS: Record<string, { primaryKeys: string[]; foreignKeys?: Array<{ column: string; targetTable: string }> }> = {
  PLAYER: {
    primaryKeys: ['PlayerID', 'Player ID'],
    foreignKeys: [{ column: 'SquadID', targetTable: 'SQUAD' }, { column: 'Squad ID', targetTable: 'SQUAD' }, { column: 'Clan ID', targetTable: 'CLAN' }],
  },
  SQUAD: {
    primaryKeys: ['SquadID', 'Squad ID'],
  },
  MATCH: {
    primaryKeys: ['MatchID', 'Match ID'],
  },
  PLAYER_MATCH: {
    primaryKeys: ['PlayerID', 'MatchID', 'Player ID', 'Match ID'],
    foreignKeys: [
      { column: 'PlayerID', targetTable: 'PLAYER' },
      { column: 'Player ID', targetTable: 'PLAYER' },
      { column: 'MatchID', targetTable: 'MATCH' },
      { column: 'Match ID', targetTable: 'MATCH' },
    ],
  },
  WEAPON: {
    primaryKeys: ['WeaponID', 'Weapon ID', 'Weapon Name', 'Weapon'],
  },
  CLAN: {
    primaryKeys: ['ClanID', 'Clan ID'],
  },
  'PLAYER INFO': {
    primaryKeys: ['PlayerID', 'Player ID'],
  },
  'SEASON INFO': {
    primaryKeys: ['SeasonID', 'Season ID'],
  },
  'PLAYER IN SEASON': {
    primaryKeys: ['PlayerID', 'SeasonID', 'Player ID', 'Season ID'],
  },
};
