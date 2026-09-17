import pubg1 from '../../../pubg.jpg';
import pubg2 from '../../../pubg2.jpg';
import pubg3 from '../../../pubg3.jpg';
import pubg4 from '../../../pubg4.jpg';
import pubg5 from '../../../pubg5.jpg';
import pubg6 from '../../../pubg6.jpg';
import pubg7 from '../../../pubg7.webp';
import pubg8 from '../../../pubg8.jpg';
import pubg9 from '../../../.0pubg9.jpg';
import pubg10 from '../../../pubg10.jpg';
import pubg11 from '../../../pubg11.jpg';
import {
  BASE_TOURNAMENT_TABLE,
  FINAL_BOSS_DATASET,
  type LiveTableData,
} from './dataTransformer';

export type PuzzleKind = 'CHOICE' | 'PAIR' | 'GROUP' | 'GUARD' | 'CONNECT';
export type Difficulty = 'EASY' | 'MEDIUM' | 'TRICKY' | 'CHAOS' | 'HARD' | 'FINAL';

export interface ChoiceConsequence {
  headline: string;
  consequenceTable?: LiveTableData;
  impactNote?: string;
  explanation: string;
}

export interface BeforeAfterData {
  beforeTitle: string;
  beforeColumns: string[];
  beforeRows: Array<Record<string, string | number | null>>;
  changeLabel: string;
  changeBadge?: string;
  afterTitle?: string;
  afterColumns?: string[];
  afterRows?: Array<Record<string, string | number | null>>;
  warning: string;
}

export interface PuzzleStep {
  speaker: string;
  message: string;
  prompt: string;
  actionLabel: string;
  kind: PuzzleKind;
  table?: LiveTableData;
  sourceTable?: LiveTableData;
  beforeAfter?: BeforeAfterData;
  choices?: string[];
  correctChoice?: number;
  choiceConsequences?: Record<number, ChoiceConsequence>;
  pair?: [number, number];
  cards?: string[];
  bins?: string[];
  answers?: Record<string, string>;
  records?: string[];
  verdicts?: Array<'Accept' | 'Block'>;
  sources?: string[];
  targets?: string[];
  connections?: Record<string, string>;
  relations?: Array<{ from: string; to: string; label: string }>;
  success: string;
  clue: string;
  biggerClue: string;
}

export interface PuzzleCase {
  id: number;
  demo?: boolean;
  phase: Difficulty;
  rung: string;
  title: string;
  place: string;
  time: string;
  image: string;
  steps: PuzzleStep[];
  revealTitle: string;
  reveal: string;
  xp: number;
}

export const puzzleCases: PuzzleCase[] = [
  // ───────────────────────────────────────────────────────────────────────────
  // ZONE 01: IDENTITY BEFORE DUPLICATION (Entity Integrity)
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 1,
    phase: 'EASY',
    rung: 'DROP ZONE',
    title: 'One Player. Two Identities?',
    place: 'Tournament Registration',
    time: '08:00',
    image: pubg1,
    xp: 100,
    steps: [
      {
        speaker: 'Registration Bot',
        message: 'Two rows claim Player ID P01. Is this a duplicate player record or two distinct players?',
        prompt: 'Which attribute proves whether both rows describe the same player?',
        actionLabel: 'Inspect identity attribute',
        kind: 'CHOICE',
        table: {
          name: 'LIVE TOURNAMENT REGISTRATION FEED',
          columns: ['PlayerID', 'PlayerName', 'SquadID', 'SquadName'],
          primaryKeys: ['PlayerID'],
          rows: [
            { PlayerID: 'P01', PlayerName: 'RAVEN', SquadID: 'S01', SquadName: 'PHANTOM' },
            { PlayerID: 'P02', PlayerName: 'VENOM', SquadID: 'S01', SquadName: 'PHANTOM' },
            { PlayerID: 'P01', PlayerName: 'RAVEN', SquadID: 'S01', SquadName: 'PHANTOM' },
          ],
        },
        choices: ['PlayerName', 'PlayerID', 'SquadName', 'Current Ping'],
        correctChoice: 1,
        choiceConsequences: {
          0: {
            headline: 'Player Names Can Collide',
            consequenceTable: {
              name: 'NAME COLLISION RISK',
              columns: ['PlayerID', 'PlayerName', 'Status'],
              rows: [
                { PlayerID: 'P01', PlayerName: 'RAVEN', Status: 'Registered 08:00' },
                { PlayerID: 'P88', PlayerName: 'RAVEN', Status: 'New registrant with same nickname' },
              ],
            },
            impactNote: 'Different players can have the same gamer tag. Name alone does not enforce entity integrity.',
            explanation: 'Player Name is not guaranteed to be unique. Only Player ID serves as the definitive primary key.',
          },
          1: {
            headline: 'Primary Key Uniquely Identifies The Entity',
            consequenceTable: {
              name: 'DEDUPLICATED PLAYER REGISTRATION',
              columns: ['PlayerID', 'PlayerName', 'SquadID'],
              primaryKeys: ['PlayerID'],
              rows: [
                { PlayerID: 'P01', PlayerName: 'RAVEN', SquadID: 'S01' },
                { PlayerID: 'P02', PlayerName: 'VENOM', SquadID: 'S01' },
              ],
            },
            impactNote: 'Duplicate P01 row is flagged and safely merged.',
            explanation: 'Both rows share Player ID P01, proving they represent the exact same player record.',
          },
          2: {
            headline: 'Squad Name Represents A Group, Not An Individual',
            explanation: 'Multiple players share SquadName PHANTOM. It cannot identify an individual player.',
          },
          3: {
            headline: 'Ping Is Ephemeral Telemetry',
            explanation: 'Ping changes every millisecond and cannot define persistent identity.',
          },
        },
        beforeAfter: {
          beforeTitle: 'REGISTRATION FEED (3 ROWS)',
          beforeColumns: ['PlayerID', 'PlayerName', 'SquadID'],
          beforeRows: [
            { PlayerID: 'P01', PlayerName: 'RAVEN', SquadID: 'S01' },
            { PlayerID: 'P02', PlayerName: 'VENOM', SquadID: 'S01' },
            { PlayerID: 'P01', PlayerName: 'RAVEN', SquadID: 'S01' },
          ],
          changeLabel: 'DUPLICATE PRIMARY KEY DETECTED',
          changeBadge: 'P01 REPEATED',
          afterTitle: 'ENTITY INTEGRITY RESOLUTION',
          afterColumns: ['PlayerID', 'PlayerName', 'Action'],
          afterRows: [
            { PlayerID: 'P01', PlayerName: 'RAVEN', Action: 'Keep Primary' },
            { PlayerID: 'P01', PlayerName: 'RAVEN', Action: 'Merge / Drop Duplicate' },
          ],
          warning: 'Two rows share primary key P01. A primary key must be unique and not null.',
        },
        success: 'Correct. Player ID P01 is the primary key that proves both rows describe the same player.',
        clue: 'Names and scores can change or collide; unique primary keys define row identity.',
        biggerClue: 'Look for the primary key attribute: Player ID.',
      },
    ],
    revealTitle: 'Entity Integrity & Unique Keys',
    reveal: 'A primary key like Player ID uniquely identifies each entity row in a relational database.',
  },

  // ───────────────────────────────────────────────────────────────────────────
  // ZONE 02: 1NF - ATOMIC WEAPON INVENTORY
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 2,
    phase: 'EASY',
    rung: 'INVENTORY',
    title: 'The Backpack Problem',
    place: 'Inventory Service',
    time: '08:04',
    image: pubg2,
    xp: 100,
    steps: [
      {
        speaker: 'Inventory Bot',
        message: 'RAVEN drops only the Kar98k. But all 3 weapons are crammed inside a single text cell!',
        prompt: 'What database structure correctly solves this non-atomic cell problem?',
        actionLabel: 'Choose 1NF design',
        kind: 'CHOICE',
        table: {
          name: 'NON-ATOMIC INVENTORY TABLE (0NF)',
          columns: ['PlayerID', 'Weapons'],
          rows: [{ PlayerID: 'P01', Weapons: 'M416, Kar98k, UMP45' }],
        },
        choices: [
          'Parse and edit the comma-separated string on every drop',
          'Add columns Weapon1, Weapon2, Weapon3, Weapon4',
          'Store each weapon as its own row (Atomic 1NF)',
          'Create a new Player ID for every weapon carried',
        ],
        correctChoice: 2,
        choiceConsequences: {
          0: {
            headline: 'String Manipulation Is Fragile',
            explanation: 'Searching or deleting a weapon requires parsing text strings instead of standard database operations.',
          },
          1: {
            headline: 'Repeating Columns Waste Space and Limit Capacity',
            consequenceTable: {
              name: 'REPEATING COLUMNS (FLAWED)',
              columns: ['PlayerID', 'Weapon1', 'Weapon2', 'Weapon3', 'Weapon4'],
              rows: [{ PlayerID: 'P01', Weapon1: 'M416', Weapon2: 'Kar98k', Weapon3: 'UMP45', Weapon4: null }],
            },
            impactNote: 'Fixed columns limit inventory size and fill the database with NULLs.',
            explanation: 'Repeating groups violate 1NF and create rigid schemas.',
          },
          2: {
            headline: 'Atomic 1NF Table Structure',
            consequenceTable: {
              name: 'ATOMIC INVENTORY (1NF)',
              columns: ['PlayerID', 'Weapon'],
              primaryKeys: ['PlayerID', 'Weapon'],
              rows: [
                { PlayerID: 'P01', Weapon: 'M416' },
                { PlayerID: 'P01', Weapon: 'Kar98k' },
                { PlayerID: 'P01', Weapon: 'UMP45' },
              ],
            },
            impactNote: 'Deleting Kar98k is now a simple DELETE WHERE Weapon="Kar98k".',
            explanation: 'Each cell holds exactly one atomic value, making queries and updates clean.',
          },
        },
        beforeAfter: {
          beforeTitle: 'BEFORE (NON-ATOMIC CELL)',
          beforeColumns: ['PlayerID', 'Weapons'],
          beforeRows: [{ PlayerID: 'P01', Weapons: 'M416, Kar98k, UMP45' }],
          changeLabel: 'SPLIT INTO ATOMIC ROWS (1NF)',
          changeBadge: '3 ATOMIC ROWS',
          afterTitle: 'AFTER (1NF ATOMIC INVENTORY)',
          afterColumns: ['PlayerID', 'Weapon'],
          afterRows: [
            { PlayerID: 'P01', Weapon: 'M416' },
            { PlayerID: 'P01', Weapon: 'Kar98k' },
            { PlayerID: 'P01', Weapon: 'UMP45' },
          ],
          warning: 'A cell containing multiple comma-separated values cannot be indexed or updated atomically.',
        },
        success: 'Perfect! Breaking the list into atomic rows satisfies First Normal Form (1NF).',
        clue: 'Relational tables require atomic (indivisible) values in every cell.',
        biggerClue: 'Each weapon should be stored in its own row.',
      },
    ],
    revealTitle: 'First Normal Form (1NF)',
    reveal: '1NF requires every cell to contain a single atomic value and eliminates repeating groups.',
  },

  // ───────────────────────────────────────────────────────────────────────────
  // ZONE 03: COMPOSITE KEYS (Who Owns the Score?)
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 3,
    phase: 'MEDIUM',
    rung: 'MATCH HISTORY',
    title: 'Who Owns the Score?',
    place: 'Match Archive',
    time: '08:09',
    image: pubg3,
    xp: 120,
    steps: [
      {
        speaker: 'Result Bot',
        message: 'I need RAVEN’s performance in Match M01. I must identify exactly one row.',
        prompt: 'If you only know Player ID = P01, can you uniquely identify one performance record?',
        actionLabel: 'Determine composite key',
        kind: 'CHOICE',
        table: {
          name: 'PLAYER_MATCH PERFORMANCE RECORDS',
          columns: ['PlayerID', 'MatchID', 'Map', 'Kills', 'Rank'],
          primaryKeys: ['PlayerID', 'MatchID'],
          rows: [
            { PlayerID: 'P01', MatchID: 'M01', Map: 'Erangel', Kills: 8, Rank: 2 },
            { PlayerID: 'P02', MatchID: 'M01', Map: 'Erangel', Kills: 5, Rank: 4 },
            { PlayerID: 'P01', MatchID: 'M02', Map: 'Miramar', Kills: 3, Rank: 12 },
          ],
        },
        choices: [
          'PlayerID alone is sufficient',
          'MatchID alone is sufficient',
          'PlayerID + MatchID together are required (Composite Key)',
          'Kills alone is sufficient',
        ],
        correctChoice: 2,
        choiceConsequences: {
          0: {
            headline: 'PlayerID Returns Multiple Matches',
            consequenceTable: {
              name: 'QUERY: WHERE PlayerID = "P01"',
              columns: ['PlayerID', 'MatchID', 'Kills', 'Rank'],
              rows: [
                { PlayerID: 'P01', MatchID: 'M01', Kills: 8, Rank: 2 },
                { PlayerID: 'P01', MatchID: 'M02', Kills: 3, Rank: 12 },
              ],
            },
            impactNote: '2 rows returned! PlayerID alone cannot pinpoint a single match score.',
            explanation: 'RAVEN plays multiple tournament matches, so PlayerID repeats.',
          },
          1: {
            headline: 'MatchID Returns Multiple Players',
            consequenceTable: {
              name: 'QUERY: WHERE MatchID = "M01"',
              columns: ['PlayerID', 'MatchID', 'Kills', 'Rank'],
              rows: [
                { PlayerID: 'P01', MatchID: 'M01', Kills: 8, Rank: 2 },
                { PlayerID: 'P02', MatchID: 'M01', Kills: 5, Rank: 4 },
              ],
            },
            impactNote: '2 rows returned! MatchID alone cannot pinpoint a single player score.',
            explanation: 'Match M01 contains multiple players.',
          },
          2: {
            headline: 'Composite Key Uniquely Identifies The Record',
            consequenceTable: {
              name: 'QUERY: WHERE PlayerID="P01" AND MatchID="M01"',
              columns: ['PlayerID', 'MatchID', 'Map', 'Kills', 'Rank'],
              primaryKeys: ['PlayerID', 'MatchID'],
              rows: [{ PlayerID: 'P01', MatchID: 'M01', Map: 'Erangel', Kills: 8, Rank: 2 }],
            },
            impactNote: 'Exactly 1 row identified!',
            explanation: 'PlayerID and MatchID together form a composite primary key.',
          },
        },
        beforeAfter: {
          beforeTitle: 'SEARCH BY PlayerID = P01',
          beforeColumns: ['PlayerID', 'MatchID', 'Kills'],
          beforeRows: [
            { PlayerID: 'P01', MatchID: 'M01', Kills: 8 },
            { PlayerID: 'P01', MatchID: 'M02', Kills: 3 },
          ],
          changeLabel: 'COMBINE [PlayerID] + [MatchID]',
          changeBadge: 'COMPOSITE KEY',
          afterTitle: 'UNIQUE TARGET RESULT',
          afterColumns: ['PlayerID', 'MatchID', 'Result'],
          afterRows: [{ PlayerID: 'P01', MatchID: 'M01', Result: '8 Kills · Rank 2' }],
          warning: 'Neither PlayerID nor MatchID alone is unique. Both are required together.',
        },
        success: 'Spot on! PlayerID + MatchID together form a composite primary key.',
        clue: 'A player participates in many matches, and a match contains many players.',
        biggerClue: 'You need both IDs together to pinpoint one match performance.',
      },
    ],
    revealTitle: 'Composite Primary Keys',
    reveal: 'When no single attribute is unique, two or more attributes combine to form a composite primary key.',
  },

  // ───────────────────────────────────────────────────────────────────────────
  // ZONE 04: 2NF - PARTIAL DEPENDENCY
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 4,
    phase: 'MEDIUM',
    rung: 'HALF-KEY TRAP',
    title: 'Does the Name Need the Match?',
    place: 'Match Warehouse',
    time: '08:14',
    image: pubg4,
    xp: 130,
    steps: [
      {
        speaker: 'Warehouse AI',
        message: 'In PLAYER_MATCH, PlayerName is stored alongside MatchID. But does PlayerName really depend on MatchID?',
        prompt: 'Which attribute determines Player Name?',
        actionLabel: 'Connect functional dependency',
        kind: 'CONNECT',
        table: {
          name: 'UNNORMALIZED PLAYER_MATCH (2NF VIOLATION)',
          columns: ['PlayerID', 'MatchID', 'PlayerName', 'Map', 'Kills'],
          primaryKeys: ['PlayerID', 'MatchID'],
          rows: [
            { PlayerID: 'P01', MatchID: 'M01', PlayerName: 'RAVEN', Map: 'Erangel', Kills: 8 },
            { PlayerID: 'P01', MatchID: 'M02', PlayerName: 'RAVEN', Map: 'Miramar', Kills: 3 },
            { PlayerID: 'P02', MatchID: 'M01', PlayerName: 'VENOM', Map: 'Erangel', Kills: 5 },
          ],
        },
        sources: ['PlayerID', 'MatchID', 'PlayerID + MatchID'],
        targets: ['PlayerName'],
        connections: { PlayerName: 'PlayerID' },
        beforeAfter: {
          beforeTitle: 'MIXED PLAYER_MATCH TABLE',
          beforeColumns: ['PlayerID', 'MatchID', 'PlayerName'],
          beforeRows: [
            { PlayerID: 'P01', MatchID: 'M01', PlayerName: 'RAVEN' },
            { PlayerID: 'P01', MatchID: 'M02', PlayerName: 'RAVEN' },
          ],
          changeLabel: 'TEST DEPENDENCY: PlayerID → PlayerName',
          changeBadge: 'PARTIAL DEPENDENCY DETECTED',
          afterTitle: 'SEPARATED 2NF TABLES',
          afterColumns: ['PLAYER Table', 'PLAYER_MATCH Table'],
          afterRows: [
            { 'PLAYER Table': 'P01 → RAVEN', 'PLAYER_MATCH Table': 'P01 + M01 → 8 Kills' },
            { 'PLAYER Table': 'P02 → VENOM', 'PLAYER_MATCH Table': 'P01 + M02 → 3 Kills' },
          ],
          warning: 'PlayerName depends on only part of the composite key (PlayerID). This is a partial dependency.',
        },
        success: 'Correct! PlayerName depends only on PlayerID. Storing it in PLAYER_MATCH violates 2NF.',
        clue: 'Notice that RAVEN is the same name whether the match is M01 or M02.',
        biggerClue: 'Connect PlayerID to PlayerName.',
      },
    ],
    revealTitle: 'Second Normal Form (2NF)',
    reveal: '2NF requires tables in 1NF to have no partial dependencies: every non-key attribute must depend on the whole primary key.',
  },

  // ───────────────────────────────────────────────────────────────────────────
  // ZONE 05: UPDATE ANOMALY
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 5,
    phase: 'MEDIUM',
    rung: 'SQUAD SIGNAL',
    title: 'The Squad Leader Changed',
    place: 'Squad Control',
    time: '08:19',
    image: pubg5,
    xp: 130,
    steps: [
      {
        speaker: 'Squad Manager',
        message: 'Squad S01 renamed from TITAN to PHANTOM. But we updated only one row in the match feed.',
        prompt: 'What anomaly occurred because SquadName was stored in every match row?',
        actionLabel: 'Identify the anomaly',
        kind: 'CHOICE',
        table: {
          name: 'MATCH FEED WITH INCONSISTENT SQUAD NAME',
          columns: ['MatchID', 'PlayerID', 'SquadID', 'SquadName'],
          rows: [
            { MatchID: 'M01', PlayerID: 'P01', SquadID: 'S01', SquadName: 'TITAN' },
            { MatchID: 'M02', PlayerID: 'P01', SquadID: 'S01', SquadName: 'TITAN' },
            { MatchID: 'M03', PlayerID: 'P01', SquadID: 'S01', SquadName: 'PHANTOM' },
            { MatchID: 'M04', PlayerID: 'P01', SquadID: 'S01', SquadName: 'TITAN' },
          ],
        },
        choices: [
          'Deletion Anomaly: Player P01 was deleted',
          'Update Anomaly: Squad S01 now has two conflicting names',
          'Insertion Anomaly: Cannot create match M05',
          'Domain Violation: Squad name has invalid characters',
        ],
        correctChoice: 1,
        choiceConsequences: {
          1: {
            headline: 'Update Anomaly & Inconsistent State',
            consequenceTable: {
              name: 'CONFLICTING SQUAD NAMES IN DATABASE',
              columns: ['SquadID', 'Observed Names', 'Conflict'],
              rows: [
                { SquadID: 'S01', 'Observed Names': 'TITAN (3 rows), PHANTOM (1 row)', Conflict: '⚠ Inconsistent Data' },
              ],
            },
            impactNote: 'Queries asking for Squad S01 name now return conflicting results.',
            explanation: 'Storing SquadName repeatedly in match rows requires updating every copy. Missing one causes an update anomaly.',
          },
        },
        beforeAfter: {
          beforeTitle: 'BEFORE (4 MATCH ROWS)',
          beforeColumns: ['Match', 'SquadID', 'SquadName'],
          beforeRows: [
            { Match: 'M01', SquadID: 'S01', SquadName: 'TITAN' },
            { Match: 'M02', SquadID: 'S01', SquadName: 'TITAN' },
            { Match: 'M03', SquadID: 'S01', SquadName: 'TITAN' },
            { Match: 'M04', SquadID: 'S01', SquadName: 'TITAN' },
          ],
          changeLabel: 'SQUAD S01 RENAMED TO PHANTOM',
          changeBadge: '4 ROWS MUST CHANGE',
          afterTitle: 'AFTER INCOMPLETE UPDATE',
          afterColumns: ['Match', 'SquadID', 'SquadName'],
          afterRows: [
            { Match: 'M01', SquadID: 'S01', SquadName: 'TITAN' },
            { Match: 'M02', SquadID: 'S01', SquadName: 'TITAN' },
            { Match: 'M03', SquadID: 'S01', SquadName: 'PHANTOM (Updated)' },
            { Match: 'M04', SquadID: 'S01', SquadName: 'TITAN' },
          ],
          warning: 'Inconsistent state: Squad S01 is called both TITAN and PHANTOM in the same database.',
        },
        success: 'Exactly. Redundant data causes update anomalies when changes are not propagated to every row.',
        clue: 'Notice that one row says PHANTOM while three rows still say TITAN.',
        biggerClue: 'Look for the Update Anomaly.',
      },
    ],
    revealTitle: 'Update Anomalies',
    reveal: 'When entity facts are copied across multiple rows, updates must touch every row or the database becomes inconsistent.',
  },

  // ───────────────────────────────────────────────────────────────────────────
  // ZONE 06: KEYS FOLLOW REAL WORLD RULES
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 6,
    phase: 'TRICKY',
    rung: 'PLAYER LOCK',
    title: 'The Four-Player Squad',
    place: 'PHANTOM Results Desk',
    time: '08:24',
    image: pubg6,
    xp: 140,
    steps: [
      {
        speaker: 'Junior Admin',
        message: 'I want to use SquadID + MatchID to find a player’s kills. Why will this fail?',
        prompt: 'Why can SquadID + MatchID NOT identify a single player’s performance?',
        actionLabel: 'Evaluate key constraint',
        kind: 'CHOICE',
        table: {
          name: 'SQUAD PERFORMANCE ATTEMPT',
          columns: ['SquadID', 'MatchID', 'PlayerID', 'PlayerName', 'Kills'],
          rows: [
            { SquadID: 'S01', MatchID: 'M01', PlayerID: 'P01', PlayerName: 'RAVEN', Kills: 8 },
            { SquadID: 'S01', MatchID: 'M01', PlayerID: 'P02', PlayerName: 'VENOM', Kills: 5 },
            { SquadID: 'S01', MatchID: 'M01', PlayerID: 'P03', PlayerName: 'GHOST', Kills: 4 },
            { SquadID: 'S01', MatchID: 'M01', PlayerID: 'P04', PlayerName: 'NOVA', Kills: 1 },
          ],
        },
        choices: [
          'Squad IDs cannot be combined with Match IDs',
          'One squad contains 4 players in the same match',
          'Match IDs are formatted with the letter M',
          'Kills are numerical values',
        ],
        correctChoice: 1,
        choiceConsequences: {
          1: {
            headline: '1 Squad In 1 Match Contains Multiple Player Rows',
            consequenceTable: {
              name: 'QUERY: WHERE SquadID="S01" AND MatchID="M01"',
              columns: ['PlayerName', 'Kills'],
              rows: [
                { PlayerName: 'RAVEN', Kills: 8 },
                { PlayerName: 'VENOM', Kills: 5 },
                { PlayerName: 'GHOST', Kills: 4 },
                { PlayerName: 'NOVA', Kills: 1 },
              ],
            },
            impactNote: '4 rows returned! SquadID + MatchID does not yield a unique record.',
            explanation: 'A squad has multiple players, so PlayerID is required to identify a single player score.',
          },
        },
        beforeAfter: {
          beforeTitle: 'SEARCH WITH [SquadID + MatchID]',
          beforeColumns: ['SquadID', 'MatchID', 'Returned Players'],
          beforeRows: [{ SquadID: 'S01', MatchID: 'M01', 'Returned Players': 'RAVEN, VENOM, GHOST, NOVA' }],
          changeLabel: 'KEY FAILS UNIQUENESS',
          changeBadge: '4 ROWS RETURNED',
          afterTitle: 'CORRECT COMPOSITE KEY',
          afterColumns: ['PlayerID', 'MatchID', 'Result'],
          afterRows: [{ PlayerID: 'P01', MatchID: 'M01', Result: 'RAVEN · 8 Kills (1 Row)' }],
          warning: 'A primary key must uniquely identify exactly one row.',
        },
        success: 'Correct. A squad is a 1-to-many relationship with players, so SquadID cannot pinpoint one player.',
        clue: 'How many players are on a squad roster in a match?',
        biggerClue: 'A squad has 4 players in every match.',
      },
    ],
    revealTitle: 'Keys Model Real-World Cardinality',
    reveal: 'Database keys must match real-world business rules: squads have multiple players, so SquadID cannot uniquely identify one player.',
  },

  // ───────────────────────────────────────────────────────────────────────────
  // ZONE 07: 3NF - TRANSITIVE DEPENDENCY
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 7,
    phase: 'TRICKY',
    rung: 'CLAN CHAIN',
    title: 'The Clan Leader’s Phone',
    place: 'Clan Network',
    time: '08:30',
    image: pubg7,
    xp: 150,
    steps: [
      {
        speaker: 'Clan Bot',
        message: 'Captain ZERO changed his phone number. Why does this affect every player in the clan?',
        prompt: 'Trace the functional dependency chain from Player to Captain Phone.',
        actionLabel: 'Connect transitive chain',
        kind: 'CONNECT',
        table: {
          name: 'MIXED PLAYER_CLAN TABLE (3NF VIOLATION)',
          columns: ['PlayerID', 'PlayerName', 'ClanID', 'ClanName', 'CaptainPhone'],
          primaryKeys: ['PlayerID'],
          rows: [
            { PlayerID: 'P01', PlayerName: 'RAVEN', ClanID: 'S01', ClanName: 'PHANTOM', CaptainPhone: '9801' },
            { PlayerID: 'P02', PlayerName: 'VENOM', ClanID: 'S01', ClanName: 'PHANTOM', CaptainPhone: '9801' },
            { PlayerID: 'P03', PlayerName: 'GHOST', ClanID: 'S01', ClanName: 'PHANTOM', CaptainPhone: '9801' },
          ],
        },
        sources: ['PlayerID', 'ClanID'],
        targets: ['ClanID', 'CaptainPhone'],
        connections: { ClanID: 'PlayerID', CaptainPhone: 'ClanID' },
        beforeAfter: {
          beforeTitle: 'DEPENDENCY CHAIN',
          beforeColumns: ['Step', 'Determinant', 'Dependent'],
          beforeRows: [
            { Step: '1', Determinant: 'PlayerID (Primary Key)', Dependent: 'ClanID' },
            { Step: '2', Determinant: 'ClanID (Non-Key)', Dependent: 'CaptainPhone' },
          ],
          changeLabel: 'TRANSITIVE DEPENDENCY DETECTED',
          changeBadge: 'PK → A → B',
          afterTitle: 'SPLIT INTO 3NF TABLES',
          afterColumns: ['PLAYER Table', 'CLAN Table'],
          afterRows: [
            { 'PLAYER Table': 'P01, RAVEN, S01', 'CLAN Table': 'S01, PHANTOM, 9801' },
            { 'PLAYER Table': 'P02, VENOM, S01', 'CLAN Table': '(Phone stored once)' },
          ],
          warning: 'CaptainPhone depends on ClanID, not directly on PlayerID. This is a transitive dependency.',
        },
        success: 'Great! PlayerID determines ClanID, and ClanID determines CaptainPhone.',
        clue: 'First find the player’s clan, then find the clan’s phone.',
        biggerClue: 'PlayerID → ClanID and ClanID → CaptainPhone.',
      },
      {
        speaker: 'Clan Bot',
        message: 'Now separate the mixed attributes into clean 3NF tables.',
        prompt: 'Place each attribute into PLAYER or CLAN.',
        actionLabel: 'Build 3NF tables',
        kind: 'GROUP',
        cards: ['PlayerID', 'PlayerName', 'ClanID', 'ClanName', 'LeaderPhone'],
        bins: ['PLAYER', 'CLAN'],
        answers: {
          PlayerID: 'PLAYER',
          PlayerName: 'PLAYER',
          ClanID: 'CLAN',
          ClanName: 'CLAN',
          LeaderPhone: 'CLAN',
        },
        relations: [{ from: 'PLAYER', to: 'CLAN', label: 'ClanID' }],
        beforeAfter: {
          beforeTitle: 'MIXED RECORD',
          beforeColumns: ['PlayerID', 'PlayerName', 'ClanID', 'ClanName', 'LeaderPhone'],
          beforeRows: [{ PlayerID: 'P01', PlayerName: 'RAVEN', ClanID: 'S01', ClanName: 'PHANTOM', LeaderPhone: '9801' }],
          changeLabel: 'DECOMPOSE TO 3NF',
          changeBadge: '2 CLEAN TABLES',
          afterTitle: 'NORMALIZED (3NF)',
          afterColumns: ['PLAYER (PlayerID, PlayerName, ClanID FK)', 'CLAN (ClanID, ClanName, LeaderPhone)'],
          afterRows: [{ 'PLAYER (PlayerID, PlayerName, ClanID FK)': 'P01, RAVEN, S01', 'CLAN (ClanID, ClanName, LeaderPhone)': 'S01, PHANTOM, 9801' }],
          warning: 'CaptainPhone is now stored in only one row in CLAN.',
        },
        success: 'Excellent. The clan phone is now stored in exactly one place in CLAN.',
        clue: 'LeaderPhone and ClanName describe the clan.',
        biggerClue: 'Put ClanID, ClanName, and LeaderPhone into CLAN.',
      },
    ],
    revealTitle: 'Third Normal Form (3NF)',
    reveal: '3NF removes transitive dependencies (A → B → C) by placing non-key facts into their own entity tables.',
  },

  // ───────────────────────────────────────────────────────────────────────────
  // ZONE 08: ROYALE PASS & SEASONS (Separate Entities)
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 8,
    phase: 'TRICKY',
    rung: 'SEASON SYSTEM',
    title: 'Ten Thousand Elite Passes',
    place: 'Royale Pass Service',
    time: '08:36',
    image: pubg9,
    xp: 160,
    steps: [
      {
        speaker: 'Season Manager',
        message: 'Season 22 updated its prize list. We must avoid updating 10,000 player profiles.',
        prompt: 'Decompose these attributes into three clean entity tables.',
        actionLabel: 'Assign attributes to tables',
        kind: 'GROUP',
        cards: ['PlayerID', 'PlayerName', 'SeasonID', 'SeasonPrizeList', 'YourPrizeLevel'],
        bins: ['PLAYER INFO', 'SEASON INFO', 'PLAYER IN SEASON'],
        answers: {
          PlayerID: 'PLAYER INFO',
          PlayerName: 'PLAYER INFO',
          SeasonID: 'SEASON INFO',
          SeasonPrizeList: 'SEASON INFO',
          YourPrizeLevel: 'PLAYER IN SEASON',
        },
        relations: [
          { from: 'PLAYER INFO', to: 'PLAYER IN SEASON', label: 'PlayerID' },
          { from: 'SEASON INFO', to: 'PLAYER IN SEASON', label: 'SeasonID' },
        ],
        beforeAfter: {
          beforeTitle: 'BEFORE: 10,000 COPIED PRIZE LISTS',
          beforeColumns: ['Player', 'Season', 'Prize List (Repeated 10,000x)'],
          beforeRows: [
            { Player: 'RAVEN', Season: 'S22', 'Prize List (Repeated 10,000x)': 'Tier 1-100 Elite Crates' },
            { Player: 'VENOM', Season: 'S22', 'Prize List (Repeated 10,000x)': 'Tier 1-100 Elite Crates' },
          ],
          changeLabel: 'EXTRACT SEASON INFO',
          changeBadge: 'PRIZES STORED ONCE',
          afterTitle: 'AFTER: 3 CLEAN TABLES',
          afterColumns: ['PLAYER INFO', 'SEASON INFO', 'PLAYER IN SEASON'],
          afterRows: [
            { 'PLAYER INFO': 'P01, RAVEN', 'SEASON INFO': 'S22, Elite Crates (1 row)', 'PLAYER IN SEASON': 'P01, S22, Level 48' },
          ],
          warning: 'Prize list updates now require changing exactly 1 row in SEASON INFO instead of 10,000 rows.',
        },
        success: 'Terrific! Season details are stored once, and player progress links player to season.',
        clue: 'SeasonPrizeList describes the season; YourPrizeLevel describes player progress.',
        biggerClue: 'SeasonPrizeList goes in SEASON INFO. YourPrizeLevel goes in PLAYER IN SEASON.',
      },
    ],
    revealTitle: 'Entity-Relationship Separation',
    reveal: 'Separating entities and their junction relationships prevents massive multi-row update burdens.',
  },

  // ───────────────────────────────────────────────────────────────────────────
  // ZONE 09: DOMAIN INTEGRITY & DATA GATES
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 9,
    phase: 'CHAOS',
    rung: 'K/D CHECK',
    title: 'The K/D God',
    place: 'Anti-Cheat Review',
    time: '08:42',
    image: pubg10,
    xp: 120,
    steps: [
      {
        speaker: 'Anti-Cheat Engine',
        message: 'A player claims 97 kills in 2 matches. K/D is 48.50. What is the correct protocol?',
        prompt: 'How should the database investigate unusual statistics?',
        actionLabel: 'Choose verification protocol',
        kind: 'CHOICE',
        table: {
          name: 'SUSPICIOUS TELEMETRY REPORT',
          columns: ['PlayerID', 'PlayerName', 'MatchesPlayed', 'TotalKills', 'CalculatedKD'],
          rows: [{ PlayerID: 'P99', PlayerName: 'GOD_AIM', MatchesPlayed: 2, TotalKills: 97, CalculatedKD: '48.50' }],
        },
        choices: [
          'Accept immediately without cross-referencing',
          'Cross-reference individual match records and telemetry',
          'Instantly delete the player account without log inspection',
          'Change PlayerID to random digits',
        ],
        correctChoice: 1,
        choiceConsequences: {
          1: {
            headline: 'Cross-Referencing Validates Match Truth',
            explanation: 'Cross-referencing telemetry ensures high numbers are audited against actual match records.',
          },
        },
        beforeAfter: {
          beforeTitle: 'PROFILE CLAIM',
          beforeColumns: ['Matches', 'Claimed Kills', 'Calculated KD'],
          beforeRows: [{ Matches: 2, 'Claimed Kills': 97, 'Calculated KD': 48.5 }],
          changeLabel: 'CROSS-CHECK MATCH ROWS',
          changeBadge: '2 MATCH RECORDS',
          afterTitle: 'VERIFICATION AUDIT',
          afterColumns: ['MatchID', 'Recorded Kills', 'Status'],
          afterRows: [
            { MatchID: 'M901', 'Recorded Kills': 49, Status: 'Verified in replay log' },
            { MatchID: 'M902', 'Recorded Kills': 48, Status: 'Verified in replay log' },
          ],
          warning: 'High values must be verified against underlying transaction records before taking action.',
        },
        success: 'Correct. Check the actual match records before making database decisions.',
        clue: 'An extraordinary score must be verified against transaction logs.',
        biggerClue: 'Cross-reference match records.',
      },
      {
        speaker: 'Anti-Cheat Gate',
        message: 'A corrupted packet sends −4 kills for VENOM. Kills cannot be negative.',
        prompt: 'Accept or block each incoming match result based on domain rules (Kills >= 0).',
        actionLabel: 'Evaluate domain integrity',
        kind: 'GUARD',
        records: ['RAVEN · 8 kills', 'VENOM · −4 kills', 'GHOST · 12 kills'],
        verdicts: ['Accept', 'Block', 'Accept'],
        beforeAfter: {
          beforeTitle: 'INCOMING DATA STREAM',
          beforeColumns: ['Player', 'Kills Value', 'Domain Rule (Kills >= 0)'],
          beforeRows: [
            { Player: 'RAVEN', 'Kills Value': 8, 'Domain Rule (Kills >= 0)': 'Valid' },
            { Player: 'VENOM', 'Kills Value': -4, 'Domain Rule (Kills >= 0)': 'VIOLATION' },
            { Player: 'GHOST', 'Kills Value': 12, 'Domain Rule (Kills >= 0)': 'Valid' },
          ],
          changeLabel: 'DOMAIN INTEGRITY FILTER',
          changeBadge: 'CHECK CONSTRAINT',
          afterTitle: 'GATE VERDICT',
          afterColumns: ['Database Ingested', 'Blocked & Logged'],
          afterRows: [
            { 'Database Ingested': 'RAVEN (8), GHOST (12)', 'Blocked & Logged': 'VENOM (-4 Kills rejected)' },
          ],
          warning: '-4 violates domain constraints. Domain integrity prevents impossible data from corrupting tables.',
        },
        success: 'Domain integrity protected! The invalid negative kill count was blocked at the gate.',
        clue: 'Kills must be greater than or equal to zero.',
        biggerClue: 'Block −4 kills.',
      },
    ],
    revealTitle: 'Domain Integrity & Constraints',
    reveal: 'Domain integrity enforces valid values (e.g. CHECK Kills >= 0) to prevent corrupt data entry.',
  },

  // ───────────────────────────────────────────────────────────────────────────
  // ZONE 10: WEAPON CACHE & REDUNDANCY
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 10,
    phase: 'CHAOS',
    rung: 'WEAPON CACHE',
    title: 'The M416 Patch',
    place: 'Weapon Data Service',
    time: '08:48',
    image: pubg11,
    xp: 130,
    steps: [
      {
        speaker: 'Game Developer',
        message: 'M416 base damage changed from 40 to 39. But damage 40 is duplicated beside 100 player inventory rows!',
        prompt: 'Where should weapon specifications like Damage and Ammo type be stored?',
        actionLabel: 'Select normalized design',
        kind: 'CHOICE',
        table: {
          name: 'REDUNDANT WEAPON DATA IN PLAYER INVENTORIES',
          columns: ['PlayerID', 'WeaponName', 'Damage', 'AmmoType'],
          rows: [
            { PlayerID: 'P01', WeaponName: 'M416', Damage: 40, AmmoType: '5.56mm' },
            { PlayerID: 'P02', WeaponName: 'M416', Damage: 40, AmmoType: '5.56mm' },
            { PlayerID: 'P03', WeaponName: 'M416', Damage: 40, AmmoType: '5.56mm' },
          ],
        },
        choices: [
          'Keep Damage and AmmoType duplicated beside every player',
          'Store M416 specifications once in a separate WEAPON table',
          'Delete M416 from all player inventories',
          'Hard-code different damage values for each player',
        ],
        correctChoice: 1,
        choiceConsequences: {
          1: {
            headline: 'WEAPON Table Stores Specs In Exactly One Place',
            consequenceTable: {
              name: 'WEAPON SPECIFICATION TABLE',
              columns: ['WeaponID', 'WeaponName', 'Damage', 'AmmoType'],
              primaryKeys: ['WeaponID'],
              rows: [{ WeaponID: 'W01', WeaponName: 'M416', Damage: 39, AmmoType: '5.56mm' }],
            },
            impactNote: 'Changing M416 damage from 40 to 39 requires updating exactly 1 row!',
            explanation: 'Player inventory only needs WeaponID foreign key. Specifications live in WEAPON.',
          },
        },
        beforeAfter: {
          beforeTitle: 'BEFORE (100 DUPLICATED ROWS)',
          beforeColumns: ['Player', 'Weapon', 'Damage (Duplicated)'],
          beforeRows: [
            { Player: 'RAVEN', Weapon: 'M416', 'Damage (Duplicated)': '40' },
            { Player: 'VENOM', Weapon: 'M416', 'Damage (Duplicated)': '40' },
            { Player: 'GHOST', Weapon: 'M416', 'Damage (Duplicated)': '40' },
          ],
          changeLabel: 'PATCH M416 DAMAGE: 40 → 39',
          changeBadge: '100 EDITS VS 1 EDIT',
          afterTitle: 'AFTER (WEAPON TABLE STORED ONCE)',
          afterColumns: ['WEAPON Row', 'PLAYER_INVENTORY Row'],
          afterRows: [{ 'WEAPON Row': 'M416 → Damage: 39 (1 row updated)', 'PLAYER_INVENTORY Row': 'RAVEN → WeaponID W01 (unchanged)' }],
          warning: 'Storing weapon stats in inventories turns a balance patch into 100 row modifications.',
        },
        success: 'Spot on! Storing weapon specifications in a dedicated WEAPON table turns 100 updates into 1.',
        clue: 'Damage and Ammo describe the weapon, not the player.',
        biggerClue: 'Store M416 facts once in WEAPON.',
      },
    ],
    revealTitle: 'Attribute Ownership & Normalization',
    reveal: 'Attributes must belong to the entity they describe. Weapon stats belong in WEAPON, not in PLAYER.',
  },

  // ───────────────────────────────────────────────────────────────────────────
  // ZONE 11: REFERENTIAL ACTIONS (RESTRICT / CASCADE / SET NULL)
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 11,
    phase: 'CHAOS',
    rung: 'DELETE SWITCH',
    title: 'Delete Match M07',
    place: 'Tournament Operations',
    time: '08:54',
    image: pubg3,
    xp: 140,
    steps: [
      {
        speaker: 'Tournament Admin',
        message: 'Admin wants to delete Match M07. But 64 player performance rows reference M07.',
        prompt: 'What happens if RESTRICT foreign key behavior is enforced?',
        actionLabel: 'Simulate delete behavior',
        kind: 'CHOICE',
        table: {
          name: 'PARENT AND CHILD RELATIONSHIP',
          columns: ['Parent Table', 'MatchID', 'Child Table References'],
          rows: [{ 'Parent Table': 'MATCH', MatchID: 'M07', 'Child Table References': '64 rows in PLAYER_MATCH' }],
        },
        choices: [
          'CASCADE: Deletes Match M07 and silently deletes all 64 player results',
          'RESTRICT: Blocks deletion of M07 because dependent child rows exist',
          'SET NULL: Sets MatchID to NULL across all 64 player records',
          'Randomly reassigns the 64 rows to Match M01',
        ],
        correctChoice: 1,
        choiceConsequences: {
          0: {
            headline: 'CASCADE Deletes Parent And All Linked Children',
            consequenceTable: {
              name: 'CASCADE RESULT',
              columns: ['Action', 'MATCH Table', 'PLAYER_MATCH Table'],
              rows: [{ Action: 'CASCADE', 'MATCH Table': 'M07 deleted', 'PLAYER_MATCH Table': '64 player results DELETED' }],
            },
            impactNote: '64 player tournament records permanently vanish!',
            explanation: 'CASCADE deletes all child records when the parent is deleted.',
          },
          1: {
            headline: 'RESTRICT Blocks Parent Deletion',
            consequenceTable: {
              name: 'RESTRICT RESULT',
              columns: ['Action', 'Result', 'Database Status'],
              rows: [{ Action: 'RESTRICT', Result: 'DELETE BLOCKED', DatabaseStatus: 'M07 and 64 child rows preserved' }],
            },
            impactNote: 'Foreign key constraint blocks deletion to prevent orphan records or lost history.',
            explanation: 'RESTRICT prevents deleting a parent row when child foreign key references exist.',
          },
          2: {
            headline: 'SET NULL Disconnects Foreign Keys',
            consequenceTable: {
              name: 'SET NULL RESULT',
              columns: ['PlayerID', 'MatchID (FK)', 'Kills'],
              rows: [{ PlayerID: 'P01', 'MatchID (FK)': 'NULL', Kills: 8 }],
            },
            impactNote: 'Child records remain, but their MatchID becomes NULL.',
            explanation: 'SET NULL removes the link without deleting the child row.',
          },
        },
        beforeAfter: {
          beforeTitle: 'PARENT-CHILD LINKED DATA',
          beforeColumns: ['Parent (MATCH)', 'Foreign Key Link', 'Child (PLAYER_MATCH)'],
          beforeRows: [
            { 'Parent (MATCH)': 'M07 (Erangel)', 'Foreign Key Link': '── MatchID ──▶', 'Child (PLAYER_MATCH)': 'P01 · 8 Kills' },
            { 'Parent (MATCH)': 'M07 (Erangel)', 'Foreign Key Link': '── MatchID ──▶', 'Child (PLAYER_MATCH)': 'P02 · 5 Kills' },
          ],
          changeLabel: 'ADMIN ATTEMPTS DELETE M07',
          changeBadge: 'ON DELETE RESTRICT',
          afterTitle: 'RESTRICT ENFORCED',
          afterColumns: ['Status', 'Reason'],
          afterRows: [{ Status: 'DELETE BLOCKED ⛔', Reason: 'Foreign key constraint: 64 child rows depend on M07' }],
          warning: 'Referential integrity protects against accidental data loss when deleting referenced parent rows.',
        },
        success: 'Correct. RESTRICT prevents deleting parent records that are still referenced by child rows.',
        clue: 'RESTRICT means the database refuses to delete the parent.',
        biggerClue: 'RESTRICT blocks the deletion.',
      },
    ],
    revealTitle: 'Referential Integrity & Delete Rules',
    reveal: 'Foreign key actions (RESTRICT, CASCADE, SET NULL) define what happens to child records when a parent row is deleted.',
  },

  // ───────────────────────────────────────────────────────────────────────────
  // ZONE 12: ADMIN PANIC - 100 ROWS UPDATE ANOMALY
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 12,
    phase: 'CHAOS',
    rung: 'ADMIN PANIC',
    title: 'The Admin Who Hates Typing',
    place: 'Squad Registry',
    time: '09:01',
    image: pubg5,
    xp: 120,
    steps: [
      {
        speaker: 'Admin',
        message: 'I saved time by typing SquadName TITAN directly into 100 player rows. Now TITAN is renamed PHANTOM.',
        prompt: 'Did duplicating the squad name across 100 player rows save work in the long run?',
        actionLabel: 'Evaluate design cost',
        kind: 'CHOICE',
        table: {
          name: 'UNNORMALIZED PLAYER TABLE (100 DUPLICATED SQUAD ROWS)',
          columns: ['PlayerID', 'PlayerName', 'SquadName'],
          rows: [
            { PlayerID: 'P01', PlayerName: 'RAVEN', SquadName: 'TITAN' },
            { PlayerID: 'P02', PlayerName: 'VENOM', SquadName: 'TITAN' },
            { PlayerID: 'P03', PlayerName: 'GHOST', SquadName: 'TITAN' },
            { PlayerID: 'P04', PlayerName: 'NOVA', SquadName: 'TITAN' },
          ],
        },
        choices: [
          'Yes, copying data avoids having to make a foreign key relationship',
          'No, updating the name now requires modifying 100 separate records',
          'Yes, because computers have fast SSDs',
          'Only if the squad wins the tournament',
        ],
        correctChoice: 1,
        choiceConsequences: {
          1: {
            headline: '100 Row Modifications Required',
            consequenceTable: {
              name: 'COMPARISON OF DESIGNS',
              columns: ['Schema Design', 'Rows To Modify When Renaming Squad', 'Risk of Inconsistency'],
              rows: [
                { 'Schema Design': 'Mixed PLAYER table', 'Rows To Modify When Renaming Squad': '100 row updates', 'Risk of Inconsistency': 'High' },
                { 'Schema Design': 'Separate SQUAD table', 'Rows To Modify When Renaming Squad': '1 row update', 'Risk of Inconsistency': 'Zero' },
              ],
            },
            impactNote: 'A normalized SQUAD table requires changing only 1 row.',
            explanation: 'Redundant attributes create high maintenance overhead and update anomalies.',
          },
        },
        beforeAfter: {
          beforeTitle: 'BEFORE RENAMING',
          beforeColumns: ['PlayerID', 'SquadName (Repeated 100x)'],
          beforeRows: [
            { PlayerID: 'P01', 'SquadName (Repeated 100x)': 'TITAN' },
            { PlayerID: 'P02', 'SquadName (Repeated 100x)': 'TITAN' },
            { PlayerID: '...', 'SquadName (Repeated 100x)': '... × 100' },
          ],
          changeLabel: 'TITAN → PHANTOM',
          changeBadge: '100 SEPARATE EDITS',
          afterTitle: 'AFTER RENAMING',
          afterColumns: ['PlayerID', 'SquadName'],
          afterRows: [
            { PlayerID: 'P01', SquadName: 'PHANTOM' },
            { PlayerID: 'P02', SquadName: 'PHANTOM' },
            { PlayerID: '...', SquadName: '... × 100' },
          ],
          warning: 'Saving the squad name once in a SQUAD table turns 100 edits into 1 edit.',
        },
        success: 'No shortcut! What saved 5 seconds yesterday creates 100 manual edits today.',
        clue: 'Count how many row updates are required.',
        biggerClue: '100 separate records must be edited.',
      },
    ],
    revealTitle: 'Redundancy Creates Maintenance Burdens',
    reveal: 'Storing shared facts once in their own entity table turns hundreds of updates into a single atomic change.',
  },

  // ───────────────────────────────────────────────────────────────────────────
  // ZONE 13: 3NF COMPARISON
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 13,
    phase: 'HARD',
    rung: 'FAKE NORMALIZATION',
    title: 'Two Clean-Looking Designs',
    place: 'Architecture Review',
    time: '09:08',
    image: pubg6,
    xp: 180,
    steps: [
      {
        speaker: 'Architect',
        message: 'PHANTOM changed its captain. We have two candidate database designs.',
        prompt: 'Which design properly satisfies 3NF and avoids duplicating captain details?',
        actionLabel: 'Select 3NF schema',
        kind: 'CHOICE',
        choices: [
          'Design A: Every PLAYER row stores SquadName and CaptainName',
          'Design B: PLAYER stores SquadID (FK); SQUAD stores SquadName and CaptainName',
          'Both designs have identical redundancy',
        ],
        correctChoice: 1,
        choiceConsequences: {
          0: {
            headline: 'Design A Violates 3NF (Transitive Dependency)',
            consequenceTable: {
              name: 'DESIGN A: DUPLICATED CAPTAIN (FLAWED)',
              columns: ['PlayerID', 'PlayerName', 'SquadName', 'Captain'],
              rows: [
                { PlayerID: 'P01', PlayerName: 'RAVEN', SquadName: 'PHANTOM', Captain: 'ZERO' },
                { PlayerID: 'P02', PlayerName: 'VENOM', SquadName: 'PHANTOM', Captain: 'ZERO' },
              ],
            },
            impactNote: 'Captain is duplicated in every player row.',
            explanation: 'PlayerID → SquadID → Captain is a transitive dependency.',
          },
          1: {
            headline: 'Design B Satisfies 3NF',
            consequenceTable: {
              name: 'DESIGN B: CLEAN 3NF TABLES',
              columns: ['Table', 'Columns', 'Redundancy'],
              rows: [
                { Table: 'PLAYER', Columns: 'PlayerID (PK), PlayerName, SquadID (FK)', Redundancy: 'None' },
                { Table: 'SQUAD', Columns: 'SquadID (PK), SquadName, Captain', Redundancy: 'None' },
              ],
            },
            impactNote: 'Captain is stored once in SQUAD and referenced by SquadID.',
            explanation: 'Design B eliminates transitive dependencies and satisfies 3NF.',
          },
        },
        beforeAfter: {
          beforeTitle: 'DESIGN A (TRANSITIVE DEPENDENCY)',
          beforeColumns: ['PlayerID', 'PlayerName', 'SquadName', 'Captain'],
          beforeRows: [
            { PlayerID: 'P01', PlayerName: 'RAVEN', SquadName: 'PHANTOM', Captain: 'ZERO' },
            { PlayerID: 'P02', PlayerName: 'VENOM', SquadName: 'PHANTOM', Captain: 'ZERO' },
          ],
          changeLabel: 'NORMALIZE TO 3NF',
          changeBadge: 'DESIGN B',
          afterTitle: 'DESIGN B (NORMALIZED 3NF)',
          afterColumns: ['PLAYER Table', 'SQUAD Table'],
          afterRows: [
            { 'PLAYER Table': 'P01, RAVEN, SquadID: S01', 'SQUAD Table': 'S01, PHANTOM, Captain: ZERO' },
            { 'PLAYER Table': 'P02, VENOM, SquadID: S01', 'SQUAD Table': '(Captain stored exactly once)' },
          ],
          warning: 'Design A creates multiple copies of the captain that can disagree if updated partially.',
        },
        success: 'Spot on! Design B isolates squad details into SQUAD and satisfies 3NF.',
        clue: 'Look for the design that stores the captain only once in SQUAD.',
        biggerClue: 'Design B saves the captain in SQUAD.',
      },
    ],
    revealTitle: '3NF Schema Architecture',
    reveal: 'In 3NF, non-key attributes must depend solely on the primary key, directly and non-transitively.',
  },

  // ───────────────────────────────────────────────────────────────────────────
  // ZONE 14: REBUILD THE TOURNAMENT CORE (4 Tables Live)
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 14,
    phase: 'HARD',
    rung: 'DATABASE CRASH',
    title: 'Rebuild the Tournament Core',
    place: 'Recovery Bunker',
    time: '09:15',
    image: pubg8,
    xp: 220,
    steps: [
      {
        speaker: 'Recovery AI',
        message: 'The original unnormalized tournament table is displayed above. Give each attribute its proper home in the normalized schema.',
        prompt: 'Build the 4 normalized tables (PLAYER, SQUAD, MATCH, PLAYER_MATCH) live.',
        actionLabel: 'Construct 4 live tables',
        kind: 'GROUP',
        sourceTable: BASE_TOURNAMENT_TABLE,
        cards: ['PlayerID', 'PlayerName', 'SquadID', 'SquadName', 'MatchID', 'Map', 'Kills', 'Rank'],
        bins: ['PLAYER', 'SQUAD', 'MATCH', 'PLAYER_MATCH'],
        answers: {
          PlayerID: 'PLAYER',
          PlayerName: 'PLAYER',
          SquadID: 'SQUAD',
          SquadName: 'SQUAD',
          MatchID: 'MATCH',
          Map: 'MATCH',
          Kills: 'PLAYER_MATCH',
          Rank: 'PLAYER_MATCH',
        },
        relations: [
          { from: 'SQUAD', to: 'PLAYER', label: 'SquadID' },
          { from: 'PLAYER', to: 'PLAYER_MATCH', label: 'PlayerID' },
          { from: 'MATCH', to: 'PLAYER_MATCH', label: 'MatchID' },
        ],
        beforeAfter: {
          beforeTitle: 'ORIGINAL MIXED TOURNAMENT TABLE (8 COLUMNS)',
          beforeColumns: ['PlayerID', 'PlayerName', 'SquadID', 'SquadName', 'MatchID', 'Map', 'Kills', 'Rank'],
          beforeRows: [
            { PlayerID: 'P01', PlayerName: 'RAVEN', SquadID: 'S01', SquadName: 'PHANTOM', MatchID: 'M01', Map: 'Erangel', Kills: 8, Rank: 2 },
            { PlayerID: 'P02', PlayerName: 'VENOM', SquadID: 'S01', SquadName: 'PHANTOM', MatchID: 'M01', Map: 'Erangel', Kills: 5, Rank: 4 },
            { PlayerID: 'P01', PlayerName: 'RAVEN', SquadID: 'S01', SquadName: 'PHANTOM', MatchID: 'M02', Map: 'Miramar', Kills: 3, Rank: 12 },
          ],
          changeLabel: 'DECOMPOSE INTO 4 ENTITY TABLES',
          changeBadge: '3NF NORMALIZED',
          afterTitle: '4 LIVE CONSTRUCTED TABLES',
          afterColumns: ['PLAYER', 'SQUAD', 'MATCH', 'PLAYER_MATCH'],
          afterRows: [
            { PLAYER: 'P01, RAVEN · P02, VENOM', SQUAD: 'S01, PHANTOM', MATCH: 'M01, Erangel · M02, Miramar', PLAYER_MATCH: 'P01 + M01 → 8 Kills' },
          ],
          warning: 'Duplicate rows in SQUAD and MATCH are deduplicated automatically during entity projection.',
        },
        success: 'Masterful! All 4 tables are constructed with distinct records and foreign key relationships.',
        clue: 'PlayerName goes to PLAYER; SquadName goes to SQUAD; Map goes to MATCH; Kills and Rank belong in PLAYER_MATCH.',
        biggerClue: 'Kills and Rank go into PLAYER_MATCH.',
      },
    ],
    revealTitle: 'Normalized Relational Architecture',
    reveal: 'PLAYER, SQUAD, MATCH, and PLAYER_MATCH are fully normalized, eliminating redundancy and anomalies.',
  },

  // ───────────────────────────────────────────────────────────────────────────
  // ZONE 15: FINAL EXTRACTION (Final Boss Challenge)
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 15,
    phase: 'FINAL',
    rung: 'FINAL EXTRACTION',
    title: 'The Last Zone',
    place: 'Result Publication Core',
    time: '09:25',
    image: pubg1,
    xp: 400,
    steps: [
      // Step 1: 1NF Atomic Weapon Fix
      {
        speaker: 'System Alert',
        message: 'The corrupted core contains multi-valued weapon strings (e.g. "M416, Kar98k"). What must be fixed first to reach 1NF?',
        prompt: 'How must the Weapons column be normalized?',
        actionLabel: 'Enforce 1NF Atomicity',
        kind: 'CHOICE',
        table: {
          name: 'CORRUPTED CORE (NON-ATOMIC CELLS)',
          columns: ['PlayerID', 'PlayerName', 'Weapons', 'CaptainPhone'],
          rows: [
            { PlayerID: 'P01', PlayerName: 'RAVEN', Weapons: 'M416, Kar98k', CaptainPhone: '9801' },
            { PlayerID: 'P02', PlayerName: 'VENOM', Weapons: 'M416', CaptainPhone: '9801' },
          ],
        },
        choices: [
          'Separate multi-valued weapons into atomic rows/tables',
          'Publish tournament results with the comma-separated strings',
          'Delete all player weapon records',
          'Rename the column to WeaponList',
        ],
        correctChoice: 0,
        choiceConsequences: {
          0: {
            headline: '1NF Atomicity Restored',
            consequenceTable: {
              name: 'ATOMIC WEAPON BREAKDOWN (1NF)',
              columns: ['PlayerID', 'WeaponName'],
              rows: [
                { PlayerID: 'P01', WeaponName: 'M416' },
                { PlayerID: 'P01', WeaponName: 'Kar98k' },
                { PlayerID: 'P02', WeaponName: 'M416' },
              ],
            },
            impactNote: 'Every record is atomic and indexable.',
            explanation: '1NF is established before proceeding to higher normal forms.',
          },
        },
        beforeAfter: {
          beforeTitle: 'NON-ATOMIC STRING',
          beforeColumns: ['PlayerID', 'Weapons'],
          beforeRows: [{ PlayerID: 'P01', Weapons: 'M416, Kar98k' }],
          changeLabel: 'EXTRACT ATOMIC RECORDS',
          changeBadge: '1NF COMPLIANT',
          afterTitle: 'ATOMIC WEAPONS',
          afterColumns: ['PlayerID', 'Weapon'],
          afterRows: [
            { PlayerID: 'P01', Weapon: 'M416' },
            { PlayerID: 'P01', Weapon: 'Kar98k' },
          ],
          warning: 'Non-atomic values block relational queries and updates.',
        },
        success: '1NF established! Multi-valued fields are converted to atomic rows.',
        clue: 'Each cell must hold exactly one value.',
        biggerClue: 'Separate multi-valued weapons into atomic rows.',
      },

      // Step 2: 5-Table Full Normalization
      {
        speaker: 'Recovery AI',
        message: 'Now construct the complete 5-table normalized schema from the corrupted tournament database.',
        prompt: 'Assign each attribute to its correct normalized entity table.',
        actionLabel: 'Construct 5 live tables',
        kind: 'GROUP',
        sourceTable: FINAL_BOSS_DATASET,
        cards: ['PlayerName', 'SquadName', 'MatchMap', 'Kills', 'WeaponName', 'CaptainPhone'],
        bins: ['PLAYER', 'SQUAD', 'MATCH', 'PLAYER_MATCH', 'WEAPON'],
        answers: {
          PlayerName: 'PLAYER',
          SquadName: 'SQUAD',
          MatchMap: 'MATCH',
          Kills: 'PLAYER_MATCH',
          WeaponName: 'WEAPON',
          CaptainPhone: 'SQUAD',
        },
        relations: [
          { from: 'SQUAD', to: 'PLAYER', label: 'SquadID' },
          { from: 'PLAYER', to: 'PLAYER_MATCH', label: 'PlayerID' },
          { from: 'MATCH', to: 'PLAYER_MATCH', label: 'MatchID' },
        ],
        beforeAfter: {
          beforeTitle: 'MESSY 10-COLUMN DATABASE',
          beforeColumns: ['PlayerID', 'PlayerName', 'SquadID', 'SquadName', 'MatchID', 'Map', 'Weapons', 'Captain', 'CaptainPhone', 'Kills'],
          beforeRows: [
            { PlayerID: 'P01', PlayerName: 'RAVEN', SquadID: 'S01', SquadName: 'PHANTOM', MatchID: 'M07', Map: 'Erangel', Weapons: 'M416, Kar98k', Captain: 'ZERO', CaptainPhone: '9801', Kills: 8 },
            { PlayerID: 'P02', PlayerName: 'VENOM', SquadID: 'S01', SquadName: 'PHANTOM', MatchID: 'M07', Map: 'Erangel', Weapons: 'M416', Captain: 'ZERO', CaptainPhone: '9801', Kills: 5 },
          ],
          changeLabel: 'SYNTHESIZE 5 NORMALIZED TABLES',
          changeBadge: 'COMPLETE 3NF SCHEMA',
          afterTitle: '5 CLEAN DATABASE TABLES',
          afterColumns: ['PLAYER', 'SQUAD', 'MATCH', 'PLAYER_MATCH', 'WEAPON'],
          afterRows: [
            { PLAYER: 'P01, RAVEN', SQUAD: 'S01, PHANTOM, 9801', MATCH: 'M07, Erangel', PLAYER_MATCH: 'P01 + M07 → 8 Kills', WEAPON: 'M416, Kar98k' },
          ],
          warning: 'CaptainPhone belongs in SQUAD; Kills belongs in PLAYER_MATCH.',
        },
        success: 'Outstanding! The 5-table relational schema is fully constructed and populated.',
        clue: 'CaptainPhone belongs with SQUAD; WeaponName belongs in WEAPON.',
        biggerClue: 'CaptainPhone goes in SQUAD. Kills goes in PLAYER_MATCH.',
      },

      // Step 3: Final Referential Integrity Audit
      {
        speaker: 'Publication Bot',
        message: 'An unknown Player ID P99 submits a 99-kill result for Match M07. Player P99 does not exist in PLAYER table.',
        prompt: 'What should the database do with this referential integrity violation?',
        actionLabel: 'Enforce referential integrity',
        kind: 'CHOICE',
        table: {
          name: 'INCOMING ORPHAN MATCH RECORD',
          columns: ['PlayerID (FK)', 'MatchID (FK)', 'Kills', 'Status'],
          rows: [{ 'PlayerID (FK)': 'P99 ❌', 'MatchID (FK)': 'M07', Kills: 99, Status: 'No matching PlayerID in PLAYER table' }],
        },
        choices: [
          'Accept the score anyway',
          'Reject and block until Player P99 exists in PLAYER (Referential Integrity)',
          'Create a fake player account automatically',
        ],
        correctChoice: 1,
        choiceConsequences: {
          1: {
            headline: 'Foreign Key Constraint Prevents Orphan Records',
            consequenceTable: {
              name: 'REFERENTIAL INTEGRITY AUDIT',
              columns: ['Incoming Record', 'Foreign Key Check', 'Action'],
              rows: [{ 'Incoming Record': 'P99 + M07 (99 Kills)', 'Foreign Key Check': 'P99 not found in PLAYER', Action: 'BLOCK / REJECT' }],
            },
            impactNote: 'Orphan performance record prevented from corrupting tournament tables.',
            explanation: 'Referential integrity requires every foreign key value to match a valid primary key in the parent table.',
          },
        },
        beforeAfter: {
          beforeTitle: 'ORPHAN RECORD DETECTED',
          beforeColumns: ['Child Row (PLAYER_MATCH)', 'Parent Check (PLAYER)'],
          beforeRows: [{ 'Child Row (PLAYER_MATCH)': 'P99 + M07 → 99 Kills', 'Parent Check (PLAYER)': 'P99 ❌ (Record not found)' }],
          changeLabel: 'FOREIGN KEY CONSTRAINT ENFORCED',
          changeBadge: 'BLOCKED AT GATE',
          afterTitle: 'CLEAN DATABASE PUBLISHED',
          afterColumns: ['Status', 'Verification'],
          afterRows: [{ Status: 'TOURNAMENT RESULTS PUBLISHED 🏆', Verification: 'All foreign keys match valid primary keys' }],
          warning: 'Orphan rows violate referential integrity and distort championship rankings.',
        },
        success: 'Championship saved! The orphan record was blocked, and the verified database is published.',
        clue: 'A foreign key must refer to a valid primary key in the parent table.',
        biggerClue: 'Block the unknown Player ID.',
      },
    ],
    revealTitle: 'DATABASE MASTER ACHIEVED',
    reveal: 'You normalized the database from 0NF to 3NF, resolved anomalies, and enforced entity, domain, and referential integrity!',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// TEACHER DEMO CASES
// ─────────────────────────────────────────────────────────────────────────────
export const demoCases: PuzzleCase[] = [
  // Demo 1: Visual Identity Check & Duplicate Player
  {
    id: 101,
    demo: true,
    phase: 'EASY',
    rung: 'TEACHER DEMO 1',
    title: 'Find the Duplicate Player',
    place: 'Classroom Broadcast',
    time: 'DEMO',
    image: pubg1,
    xp: 0,
    steps: [
      {
        speaker: 'Tournament Organizer',
        message: 'Two rows claim the exact same primary key identity. Demonstrate to the class which two rows collide.',
        prompt: 'Select the two rows that share the same Player ID primary key.',
        actionLabel: 'Select two duplicate records',
        kind: 'PAIR',
        table: {
          name: 'LIVE TOURNAMENT REGISTRATION FEED',
          columns: ['PlayerID', 'PlayerName', 'SquadID', 'SquadName'],
          primaryKeys: ['PlayerID'],
          rows: [
            { PlayerID: 'P01', PlayerName: '{player}', SquadID: 'S01', SquadName: 'PHANTOM' },
            { PlayerID: 'P02', PlayerName: 'VENOM', SquadID: 'S01', SquadName: 'PHANTOM' },
            { PlayerID: 'P01', PlayerName: '{player}', SquadID: 'S01', SquadName: 'PHANTOM' },
          ],
        },
        pair: [0, 2],
        beforeAfter: {
          beforeTitle: 'RAW REGISTRATION FEED',
          beforeColumns: ['PlayerID', 'PlayerName', 'SquadID'],
          beforeRows: [
            { PlayerID: 'P01', PlayerName: '{player}', SquadID: 'S01' },
            { PlayerID: 'P02', PlayerName: 'VENOM', SquadID: 'S01' },
            { PlayerID: 'P01', PlayerName: '{player}', SquadID: 'S01' },
          ],
          changeLabel: 'COMPARE PRIMARY KEY VALUES',
          changeBadge: 'P01 COLLISION',
          afterTitle: 'IDENTITY COLLISION FOUND',
          afterColumns: ['Row 1', 'Row 3', 'Verdict'],
          afterRows: [{ 'Row 1': 'P01 ({player})', 'Row 3': 'P01 ({player})', Verdict: 'Duplicate Identity' }],
          warning: 'Names may match by coincidence, but primary keys must uniquely identify exactly one row.',
        },
        success: 'Both selected rows share Player ID P01. Entity integrity violation confirmed.',
        clue: 'Look for the two rows with identical Player ID values.',
        biggerClue: 'Select row 1 and row 3.',
      },
    ],
    revealTitle: 'Entity Integrity Demo Complete',
    reveal: 'A primary key must be unique across all rows in a table to ensure entity integrity.',
  },

  // Demo 2: Build Four Tables Live (The Core Requirement)
  {
    id: 102,
    demo: true,
    phase: 'EASY',
    rung: 'TEACHER DEMO 2',
    title: 'Build Four Tables Live',
    place: 'Database Workshop',
    time: 'DEMO',
    image: pubg6,
    xp: 0,
    steps: [
      {
        speaker: 'Recovery AI',
        message: 'Watch the live tables construct automatically as attributes are assigned from the original tournament dataset.',
        prompt: 'Move each attribute card to its proper entity table.',
        actionLabel: 'Construct 4 live tables',
        kind: 'GROUP',
        sourceTable: BASE_TOURNAMENT_TABLE,
        cards: ['PlayerID', 'PlayerName', 'SquadID', 'SquadName', 'MatchID', 'Map', 'Kills', 'Rank'],
        bins: ['PLAYER', 'SQUAD', 'MATCH', 'PLAYER_MATCH'],
        answers: {
          PlayerID: 'PLAYER',
          PlayerName: 'PLAYER',
          SquadID: 'SQUAD',
          SquadName: 'SQUAD',
          MatchID: 'MATCH',
          Map: 'MATCH',
          Kills: 'PLAYER_MATCH',
          Rank: 'PLAYER_MATCH',
        },
        relations: [
          { from: 'SQUAD', to: 'PLAYER', label: 'SquadID' },
          { from: 'PLAYER', to: 'PLAYER_MATCH', label: 'PlayerID' },
          { from: 'MATCH', to: 'PLAYER_MATCH', label: 'MatchID' },
        ],
        beforeAfter: {
          beforeTitle: 'ORIGINAL MIXED TOURNAMENT TABLE',
          beforeColumns: ['PlayerID', 'PlayerName', 'SquadID', 'SquadName', 'MatchID', 'Map', 'Kills', 'Rank'],
          beforeRows: [
            { PlayerID: 'P01', PlayerName: '{player}', SquadID: 'S01', SquadName: 'PHANTOM', MatchID: 'M01', Map: 'Erangel', Kills: 8, Rank: 2 },
            { PlayerID: 'P02', PlayerName: 'VENOM', SquadID: 'S01', SquadName: 'PHANTOM', MatchID: 'M01', Map: 'Erangel', Kills: 5, Rank: 4 },
            { PlayerID: 'P01', PlayerName: '{player}', SquadID: 'S01', SquadName: 'PHANTOM', MatchID: 'M02', Map: 'Miramar', Kills: 3, Rank: 12 },
          ],
          changeLabel: 'PROJECT & DEDUPLICATE INTO 4 TABLES',
          changeBadge: '3NF NORMALIZED',
          afterTitle: '4 LIVE CONSTRUCTED TABLES',
          afterColumns: ['PLAYER', 'SQUAD', 'MATCH', 'PLAYER_MATCH'],
          afterRows: [
            { PLAYER: 'P01, {player} · P02, VENOM', SQUAD: 'S01, PHANTOM', MATCH: 'M01, Erangel · M02, Miramar', PLAYER_MATCH: 'P01 + M01 → 8 Kills' },
          ],
          warning: 'Notice how SQUAD and MATCH distinct rows are extracted cleanly from the mixed data.',
        },
        success: 'Demo complete! All 4 tables are constructed live with deduplicated entity records and foreign keys.',
        clue: 'Names belong with their respective IDs; Kills and Rank belong in PLAYER_MATCH.',
        biggerClue: 'Assign PlayerID and PlayerName to PLAYER, SquadID and SquadName to SQUAD.',
      },
    ],
    revealTitle: 'Live Table Construction Demo Complete',
    reveal: 'Each normalized table holds data about one entity, connected together by primary and foreign keys.',
  },
];

export const puzzleCaseMap = Object.fromEntries(
  [...demoCases, ...puzzleCases].map((item) => [item.id, item])
) as Record<number, PuzzleCase>;

export const PUZZLE_TOTAL = puzzleCases.length;
