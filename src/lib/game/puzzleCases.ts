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
  // ZONE 01: IDENTITY BEFORE DUPLICATION
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
        message: 'Two rows list Player ID P01. Are they the same player or two different people?',
        prompt: 'Which attribute proves whether both rows describe the same player?',
        actionLabel: 'Choose one attribute',
        kind: 'CHOICE',
        table: {
          name: 'Registration feed',
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
            headline: 'Player names can be the same',
            consequenceTable: {
              name: 'Name collision',
              columns: ['PlayerID', 'PlayerName', 'Status'],
              rows: [
                { PlayerID: 'P01', PlayerName: 'RAVEN', Status: 'Existing player' },
                { PlayerID: 'P88', PlayerName: 'RAVEN', Status: 'Different player, same nickname' },
              ],
            },
            impactNote: 'Different players can choose the same name.',
            explanation: 'Names are not unique in games. Player ID is the true identifier.',
          },
          1: {
            headline: 'Player ID identifies the record',
            consequenceTable: {
              name: 'Merged records',
              columns: ['PlayerID', 'PlayerName', 'SquadID'],
              primaryKeys: ['PlayerID'],
              rows: [
                { PlayerID: 'P01', PlayerName: 'RAVEN', SquadID: 'S01' },
                { PlayerID: 'P02', PlayerName: 'VENOM', SquadID: 'S01' },
              ],
            },
            impactNote: 'Both rows share Player ID P01.',
            explanation: 'The same ID means both rows belong to one person.',
          },
        },
        beforeAfter: {
          beforeTitle: 'BEFORE',
          beforeColumns: ['PlayerID', 'PlayerName', 'SquadID'],
          beforeRows: [
            { PlayerID: 'P01', PlayerName: 'RAVEN', SquadID: 'S01' },
            { PlayerID: 'P02', PlayerName: 'VENOM', SquadID: 'S01' },
            { PlayerID: 'P01', PlayerName: 'RAVEN', SquadID: 'S01' },
          ],
          changeLabel: 'DUPLICATE ID P01 FOUND',
          changeBadge: '2 identical IDs',
          afterTitle: 'AFTER MERGE',
          afterColumns: ['PlayerID', 'PlayerName', 'SquadID'],
          afterRows: [
            { PlayerID: 'P01', PlayerName: 'RAVEN', SquadID: 'S01' },
            { PlayerID: 'P02', PlayerName: 'VENOM', SquadID: 'S01' },
          ],
          warning: 'Two rows claim the same Player ID.',
        },
        success: 'Yes. Both rows share Player ID P01.',
        clue: 'Names and scores can change, but Player ID stays constant.',
        biggerClue: 'Check Player ID.',
      },
    ],
    revealTitle: 'Primary Key & Identity',
    reveal: 'A primary key like Player ID uniquely identifies each record.',
  },

  // ZONE 02: 1NF - ATOMIC WEAPON INVENTORY
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
        message: 'RAVEN dropped only the Kar98k. But all three weapons are stored in one text field.',
        prompt: 'What is the best way to store the weapons?',
        actionLabel: 'Choose one structure',
        kind: 'CHOICE',
        table: {
          name: 'Player inventory',
          columns: ['PlayerID', 'Weapons'],
          rows: [{ PlayerID: 'P01', Weapons: 'M416, Kar98k, UMP45' }],
        },
        choices: [
          'Edit the text string every time an item changes',
          'Add columns Weapon1, Weapon2, Weapon3, Weapon4',
          'Store each weapon in its own row',
          'Create a new Player ID for every weapon',
        ],
        correctChoice: 2,
        choiceConsequences: {
          2: {
            headline: 'Each weapon has its own row',
            consequenceTable: {
              name: 'Separate weapon rows',
              columns: ['PlayerID', 'Weapon'],
              primaryKeys: ['PlayerID', 'Weapon'],
              rows: [
                { PlayerID: 'P01', Weapon: 'M416' },
                { PlayerID: 'P01', Weapon: 'Kar98k' },
                { PlayerID: 'P01', Weapon: 'UMP45' },
              ],
            },
            impactNote: 'Dropping Kar98k deletes only that single row.',
            explanation: 'Single-value cells make searches and changes simple.',
          },
        },
        beforeAfter: {
          beforeTitle: 'BEFORE',
          beforeColumns: ['PlayerID', 'Weapons'],
          beforeRows: [{ PlayerID: 'P01', Weapons: 'M416, Kar98k, UMP45' }],
          changeLabel: 'DROP Kar98k',
          afterTitle: 'AFTER (SEPARATE ROWS)',
          afterColumns: ['PlayerID', 'Weapon'],
          afterRows: [
            { PlayerID: 'P01', Weapon: 'M416' },
            { PlayerID: 'P01', Weapon: 'UMP45' },
          ],
          warning: 'Three weapons were locked in one cell.',
        },
        success: 'Right. Saving each weapon in its own row solves the problem.',
        clue: 'Only one weapon changed.',
        biggerClue: 'Store each weapon in its own row.',
      },
    ],
    revealTitle: 'First Normal Form (1NF)',
    reveal: 'Each cell should contain only one atomic value.',
  },

  // ZONE 03: COMPOSITE KEYS
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
        message: 'I need RAVEN’s result in Match M01. I must find exactly one row.',
        prompt: 'If you only know Player ID = P01, can you find exactly one match performance?',
        actionLabel: 'Choose the identifier',
        kind: 'CHOICE',
        table: {
          name: 'Match history',
          columns: ['PlayerID', 'MatchID', 'Map', 'Kills', 'Rank'],
          primaryKeys: ['PlayerID', 'MatchID'],
          rows: [
            { PlayerID: 'P01', MatchID: 'M01', Map: 'Erangel', Kills: 8, Rank: 2 },
            { PlayerID: 'P02', MatchID: 'M01', Map: 'Erangel', Kills: 5, Rank: 4 },
            { PlayerID: 'P01', MatchID: 'M02', Map: 'Miramar', Kills: 3, Rank: 12 },
          ],
        },
        choices: [
          'Player ID alone is enough',
          'Match ID alone is enough',
          'Player ID + Match ID together are required',
          'Kills alone is enough',
        ],
        correctChoice: 2,
        choiceConsequences: {
          0: {
            headline: 'Player ID returns multiple matches',
            consequenceTable: {
              name: 'Search: PlayerID = P01',
              columns: ['PlayerID', 'MatchID', 'Kills'],
              rows: [
                { PlayerID: 'P01', MatchID: 'M01', Kills: 8 },
                { PlayerID: 'P01', MatchID: 'M02', Kills: 3 },
              ],
            },
            impactNote: '2 rows found.',
            explanation: 'RAVEN played in both M01 and M02, so Player ID alone matches two rows.',
          },
          2: {
            headline: 'Both IDs find exactly one row',
            consequenceTable: {
              name: 'Search: P01 + M01',
              columns: ['PlayerID', 'MatchID', 'Kills', 'Rank'],
              rows: [{ PlayerID: 'P01', MatchID: 'M01', Kills: 8, Rank: 2 }],
            },
            impactNote: '1 unique row found.',
            explanation: 'Player ID and Match ID together form a composite key.',
          },
        },
        beforeAfter: {
          beforeTitle: 'SEARCH BY PlayerID = P01',
          beforeColumns: ['PlayerID', 'MatchID', 'Kills'],
          beforeRows: [
            { PlayerID: 'P01', MatchID: 'M01', Kills: 8 },
            { PlayerID: 'P01', MatchID: 'M02', Kills: 3 },
          ],
          changeLabel: 'ADD MATCH ID TO SEARCH',
          afterTitle: 'EXACT RESULT FOUND',
          afterColumns: ['PlayerID', 'MatchID', 'Kills', 'Rank'],
          afterRows: [{ PlayerID: 'P01', MatchID: 'M01', Kills: 8, Rank: 2 }],
          warning: 'Player ID alone returned more than one row.',
        },
        success: 'Correct. Both IDs together find exactly one performance.',
        clue: 'RAVEN plays multiple matches. Match M01 has multiple players.',
        biggerClue: 'Use Player ID and Match ID together.',
      },
    ],
    revealTitle: 'Composite Key',
    reveal: 'Player ID and Match ID work together to find one match performance.',
  },

  // ZONE 04: 2NF - PARTIAL DEPENDENCY
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
        message: 'A match result needs Player ID and Match ID. But a player’s name stays the same in every match.',
        prompt: 'Which attribute determines Player Name?',
        actionLabel: 'Connect the arrow',
        kind: 'CONNECT',
        table: {
          name: 'Player match results',
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
          beforeTitle: 'MATCH RECORDS',
          beforeColumns: ['PlayerID', 'MatchID', 'PlayerName'],
          beforeRows: [
            { PlayerID: 'P01', MatchID: 'M01', PlayerName: 'RAVEN' },
            { PlayerID: 'P01', MatchID: 'M02', PlayerName: 'RAVEN' },
          ],
          changeLabel: 'MATCH CHANGES · NAME DOES NOT',
          afterTitle: 'DEPENDENCY',
          afterColumns: ['Determinant', 'Dependent'],
          afterRows: [{ Determinant: 'PlayerID: P01', Dependent: 'PlayerName: RAVEN' }],
          warning: 'Does Match ID help find the name? No.',
        },
        success: 'Right. Player ID determines Player Name without needing Match ID.',
        clue: 'The Match ID changes, but the name does not.',
        biggerClue: 'Connect Player ID to Player Name.',
      },
    ],
    revealTitle: 'Partial Dependency & 2NF',
    reveal: 'Player Name depends only on Player ID. It does not belong in the match results table.',
  },

  // ZONE 05: UPDATE ANOMALY
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
        prompt: 'What problem happened because SquadName was copied into every match row?',
        actionLabel: 'Choose the problem',
        kind: 'CHOICE',
        table: {
          name: 'Match feed',
          columns: ['MatchID', 'PlayerID', 'SquadID', 'SquadName'],
          rows: [
            { MatchID: 'M01', PlayerID: 'P01', SquadID: 'S01', SquadName: 'TITAN' },
            { MatchID: 'M02', PlayerID: 'P01', SquadID: 'S01', SquadName: 'TITAN' },
            { MatchID: 'M03', PlayerID: 'P01', SquadID: 'S01', SquadName: 'PHANTOM' },
            { MatchID: 'M04', PlayerID: 'P01', SquadID: 'S01', SquadName: 'TITAN' },
          ],
        },
        choices: [
          'Player P01 was deleted',
          'Squad S01 now has two conflicting names in the same database',
          'Match M05 cannot be added',
          'Kills became negative',
        ],
        correctChoice: 1,
        choiceConsequences: {
          1: {
            headline: 'Two conflicting names',
            consequenceTable: {
              name: 'Inconsistent squad names',
              columns: ['SquadID', 'Names in table'],
              rows: [{ SquadID: 'S01', 'Names in table': 'TITAN (3 rows), PHANTOM (1 row)' }],
            },
            impactNote: 'Queries for Squad S01 return conflicting names.',
            explanation: 'When data is duplicated, updating one copy leaves the others out of date.',
          },
        },
        beforeAfter: {
          beforeTitle: 'BEFORE',
          beforeColumns: ['Match', 'SquadID', 'SquadName'],
          beforeRows: [
            { Match: 'M01', SquadID: 'S01', SquadName: 'TITAN' },
            { Match: 'M02', SquadID: 'S01', SquadName: 'TITAN' },
            { Match: 'M03', SquadID: 'S01', SquadName: 'TITAN' },
            { Match: 'M04', SquadID: 'S01', SquadName: 'TITAN' },
          ],
          changeLabel: 'TITAN → PHANTOM',
          changeBadge: '4 rows to edit',
          afterTitle: 'AFTER ONE ROW CHANGED',
          afterColumns: ['Match', 'SquadID', 'SquadName'],
          afterRows: [
            { Match: 'M01', SquadID: 'S01', SquadName: 'TITAN' },
            { Match: 'M02', SquadID: 'S01', SquadName: 'TITAN' },
            { Match: 'M03', SquadID: 'S01', SquadName: 'PHANTOM' },
            { Match: 'M04', SquadID: 'S01', SquadName: 'TITAN' },
          ],
          warning: 'One squad now has two different names.',
        },
        success: 'Yes. Duplicated squad names created conflicting data.',
        clue: 'Look at how many copies exist.',
        biggerClue: 'One row says PHANTOM while three still say TITAN.',
      },
    ],
    revealTitle: 'Update Anomaly',
    reveal: 'Saving data in multiple places means one missed update leaves conflicting records.',
  },

  // ZONE 06: CARDINALITY & KEYS
  {
    id: 6,
    phase: 'TRICKY',
    rung: 'PLAYER LOCK',
    title: 'The Four-Player Squad',
    place: 'Results Desk',
    time: '08:24',
    image: pubg6,
    xp: 140,
    steps: [
      {
        speaker: 'Admin',
        message: 'Can Squad ID find one player’s score in a match?',
        prompt: 'Why can Squad ID + Match ID NOT identify one player’s kills?',
        actionLabel: 'Choose the reason',
        kind: 'CHOICE',
        table: {
          name: 'Squad results in M01',
          columns: ['SquadID', 'MatchID', 'PlayerName', 'Kills'],
          rows: [
            { SquadID: 'S01', MatchID: 'M01', PlayerName: 'RAVEN', Kills: 8 },
            { SquadID: 'S01', MatchID: 'M01', PlayerName: 'VENOM', Kills: 5 },
            { SquadID: 'S01', MatchID: 'M01', PlayerName: 'GHOST', Kills: 4 },
            { SquadID: 'S01', MatchID: 'M01', PlayerName: 'NOVA', Kills: 1 },
          ],
        },
        choices: [
          'Squad IDs cannot be stored with Match IDs',
          'One squad has four players in the same match',
          'Match IDs are text strings',
          'All kill counts are numbers',
        ],
        correctChoice: 1,
        choiceConsequences: {
          1: {
            headline: 'Four player rows returned',
            impactNote: 'Squad ID + Match ID returns 4 rows instead of 1.',
            explanation: 'A squad is a group of players, not a single person.',
          },
        },
        beforeAfter: {
          beforeTitle: 'QUERY BY SQUAD + MATCH',
          beforeColumns: ['Squad', 'Match', 'Players returned'],
          beforeRows: [{ Squad: 'S01', Match: 'M01', 'Players returned': 'RAVEN, VENOM, GHOST, NOVA' }],
          changeLabel: 'NEED ONE PLAYER RESULT',
          afterTitle: 'ADD PLAYER ID',
          afterColumns: ['Player', 'Match', 'Kills'],
          afterRows: [{ Player: 'RAVEN', Match: 'M01', Kills: 8 }],
          warning: 'One squad has multiple players.',
        },
        success: 'Correct. A squad contains multiple players.',
        clue: 'Think about how many players play on one squad.',
        biggerClue: 'A squad has four players.',
      },
    ],
    revealTitle: 'Keys Follow Real Rules',
    reveal: 'Keys must match real rules: squads have multiple players, so Squad ID cannot identify one person.',
  },

  // ZONE 07: 3NF - TRANSITIVE DEPENDENCY
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
        message: 'Captain ZERO changed phone numbers. Why is that phone copied into every player’s profile?',
        prompt: 'How do we reach the leader’s phone?',
        actionLabel: 'Connect the path',
        kind: 'CONNECT',
        table: {
          name: 'Player profiles',
          columns: ['PlayerID', 'PlayerName', 'ClanID', 'ClanName', 'CaptainPhone'],
          primaryKeys: ['PlayerID'],
          rows: [
            { PlayerID: 'P01', PlayerName: 'RAVEN', ClanID: 'S01', ClanName: 'PHANTOM', CaptainPhone: '9801' },
            { PlayerID: 'P02', PlayerName: 'VENOM', ClanID: 'S01', ClanName: 'PHANTOM', CaptainPhone: '9801' },
          ],
        },
        sources: ['PlayerID', 'ClanID'],
        targets: ['ClanID', 'CaptainPhone'],
        connections: { ClanID: 'PlayerID', CaptainPhone: 'ClanID' },
        beforeAfter: {
          beforeTitle: 'CHAIN OF DEPENDENCIES',
          beforeColumns: ['Start', 'Next', 'End'],
          beforeRows: [{ Start: 'Player ID', Next: 'Clan ID', End: 'Captain Phone' }],
          changeLabel: 'SEPARATE THE TABLES',
          afterTitle: '3NF SEPARATION',
          afterColumns: ['PLAYER table', 'CLAN table'],
          afterRows: [{ 'PLAYER table': 'Keeps Clan ID', 'CLAN table': 'Keeps Phone (once)' }],
          warning: 'The phone belongs to the clan, not to each player.',
        },
        success: 'Correct. Player ID leads to Clan ID, and Clan ID leads to the phone.',
        clue: 'First find the player’s clan.',
        biggerClue: 'Player ID → Clan ID → Captain Phone.',
      },
      {
        speaker: 'Clan Bot',
        message: 'Player details and clan details are mixed together.',
        prompt: 'Put each field in the correct table.',
        actionLabel: 'Place fields',
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
          changeLabel: 'SEPARATE ENTITIES',
          afterTitle: 'TWO CLEAN TABLES',
          afterColumns: ['PLAYER', 'CLAN'],
          afterRows: [{ PLAYER: 'P01, RAVEN, S01', CLAN: 'S01, PHANTOM, 9801' }],
          warning: 'Phone belongs to the clan.',
        },
        success: 'Good. The phone is now stored in one place in CLAN.',
        clue: 'Clan details belong together.',
        biggerClue: 'ClanID, ClanName, and LeaderPhone go in CLAN.',
      },
    ],
    revealTitle: 'Transitive Dependency & 3NF',
    reveal: 'Player points to Clan, and Clan owns the phone. Separating them satisfies 3NF.',
  },

  // ZONE 08: SEASONS & SEPARATE ENTITIES
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
        message: 'Season 22 updated its prize list. The old list appears in 10,000 player profiles.',
        prompt: 'Which table should hold each field?',
        actionLabel: 'Place fields',
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
          beforeTitle: 'BEFORE (10,000 COPIES)',
          beforeColumns: ['Player', 'Season', 'Prize List'],
          beforeRows: [
            { Player: 'RAVEN', Season: 'S22', 'Prize List': 'Elite Tier 1-100' },
            { Player: 'VENOM', Season: 'S22', 'Prize List': 'Elite Tier 1-100' },
          ],
          changeLabel: 'PRIZE LIST CHANGED',
          changeBadge: '10,000 edits needed',
          afterTitle: 'AFTER (STORED ONCE)',
          afterColumns: ['PLAYER INFO', 'SEASON INFO', 'PLAYER IN SEASON'],
          afterRows: [{ 'PLAYER INFO': 'RAVEN', 'SEASON INFO': 'S22 prizes (1 row)', 'PLAYER IN SEASON': 'Level 48' }],
          warning: 'One change caused 10,000 edits before separation.',
        },
        success: 'Good. The prize list now changes in only one place.',
        clue: 'The prize list belongs to the season.',
        biggerClue: 'SeasonPrizeList goes in SEASON INFO. YourPrizeLevel goes in PLAYER IN SEASON.',
      },
    ],
    revealTitle: 'Separate Tables',
    reveal: 'Player info, season info, and player season progress belong in separate tables.',
  },

  // ZONE 09: DOMAIN INTEGRITY
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
        speaker: 'System',
        message: 'A player claims 97 kills in two matches. What should we do first?',
        prompt: 'How should the database check this claim?',
        actionLabel: 'Choose action',
        kind: 'CHOICE',
        table: {
          name: 'Profile claim',
          columns: ['PlayerID', 'Matches', 'Kills', 'K/D'],
          rows: [{ PlayerID: 'P99', Matches: 2, Kills: 97, 'K/D': '48.50' }],
        },
        choices: [
          'Accept it immediately',
          'Check the match records and math',
          'Delete the account without checking',
          'Randomly change the numbers',
        ],
        correctChoice: 1,
        choiceConsequences: {
          1: {
            headline: 'Check match records',
            explanation: 'Auditing underlying match logs verifies whether the score was real.',
          },
        },
        beforeAfter: {
          beforeTitle: 'CLAIM',
          beforeColumns: ['Matches', 'Kills'],
          beforeRows: [{ Matches: 2, Kills: 97 }],
          changeLabel: 'CHECK MATCH LOGS',
          afterTitle: 'MATCH RECORDS',
          afterColumns: ['MatchID', 'Recorded kills'],
          afterRows: [
            { MatchID: 'M901', 'Recorded kills': 49 },
            { MatchID: 'M902', 'Recorded kills': 48 },
          ],
          warning: 'High values must be checked against transaction records.',
        },
        success: 'Correct. Check the match records before deciding.',
        clue: 'A very high number might still be valid.',
        biggerClue: 'Check the math and records.',
      },
      {
        speaker: 'Anti-Cheat Gate',
        message: 'VENOM has −4 kills. A kill count cannot be negative.',
        prompt: 'Which values can enter the database?',
        actionLabel: 'Accept or block each row',
        kind: 'GUARD',
        records: ['RAVEN · 8 kills', 'VENOM · −4 kills', 'GHOST · 12 kills'],
        verdicts: ['Accept', 'Block', 'Accept'],
        beforeAfter: {
          beforeTitle: 'INCOMING VALUES',
          beforeColumns: ['Player', 'Kills'],
          beforeRows: [
            { Player: 'RAVEN', Kills: 8 },
            { Player: 'VENOM', Kills: -4 },
            { Player: 'GHOST', Kills: 12 },
          ],
          changeLabel: 'RULE: Kills >= 0',
          afterTitle: 'RESULTS',
          afterColumns: ['Accepted', 'Blocked'],
          afterRows: [{ Accepted: 'RAVEN (8), GHOST (12)', Blocked: 'VENOM (-4)' }],
          warning: '-4 breaks the data rule.',
        },
        success: 'The impossible value was blocked.',
        clue: 'A kill count starts at zero.',
        biggerClue: 'Block −4.',
      },
    ],
    revealTitle: 'Domain Integrity',
    reveal: 'Domain rules prevent impossible or corrupt values from entering the database.',
  },

  // ZONE 10: WEAPON CACHE
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
        speaker: 'Developer',
        message: 'M416 damage changed from 40 to 39. But damage 40 is copied beside 100 players.',
        prompt: 'How can we change the damage only once?',
        actionLabel: 'Choose design',
        kind: 'CHOICE',
        table: {
          name: 'Player weapons',
          columns: ['PlayerID', 'WeaponName', 'Damage', 'AmmoType'],
          rows: [
            { PlayerID: 'P01', WeaponName: 'M416', Damage: 40, AmmoType: '5.56mm' },
            { PlayerID: 'P02', WeaponName: 'M416', Damage: 40, AmmoType: '5.56mm' },
            { PlayerID: 'P03', WeaponName: 'M416', Damage: 40, AmmoType: '5.56mm' },
          ],
        },
        choices: [
          'Keep damage copied beside every player',
          'Store M416 facts once in a WEAPON table',
          'Delete M416 from all inventories',
          'Give every player different damage',
        ],
        correctChoice: 1,
        choiceConsequences: {
          1: {
            headline: 'WEAPON table stores stats once',
            consequenceTable: {
              name: 'WEAPON table',
              columns: ['WeaponID', 'WeaponName', 'Damage', 'AmmoType'],
              primaryKeys: ['WeaponID'],
              rows: [{ WeaponID: 'W01', WeaponName: 'M416', Damage: 39, AmmoType: '5.56mm' }],
            },
            impactNote: 'Updating damage takes 1 edit.',
            explanation: 'Inventories reference Weapon ID, while weapon stats stay in WEAPON.',
          },
        },
        beforeAfter: {
          beforeTitle: 'BEFORE (100 COPIES)',
          beforeColumns: ['Player', 'Weapon', 'Damage'],
          beforeRows: [
            { Player: 'RAVEN', Weapon: 'M416', Damage: 40 },
            { Player: 'VENOM', Weapon: 'M416', Damage: 40 },
          ],
          changeLabel: 'DAMAGE: 40 → 39',
          changeBadge: '100 rows vs 1 row',
          afterTitle: 'AFTER (WEAPON TABLE)',
          afterColumns: ['Table', 'Row'],
          afterRows: [{ Table: 'WEAPON', Row: 'M416 → Damage: 39 (1 row)' }],
          warning: 'Copying stats across players caused 100 edits.',
        },
        success: 'Right. Storing weapon facts once in WEAPON turns 100 edits into one.',
        clue: 'Damage describes the weapon, not the player.',
        biggerClue: 'Save damage and ammo in WEAPON.',
      },
    ],
    revealTitle: 'Store Attributes Once',
    reveal: 'Attributes should be stored with the entity they describe.',
  },

  // ZONE 11: DELETE BEHAVIOR
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
        speaker: 'Admin',
        message: 'Match M07 is linked to 64 player results. What happens if RESTRICT is used?',
        prompt: 'What happens when deleting M07 with RESTRICT?',
        actionLabel: 'Choose delete result',
        kind: 'CHOICE',
        table: {
          name: 'Parent and child',
          columns: ['Parent', 'MatchID', 'Linked records'],
          rows: [{ Parent: 'MATCH', MatchID: 'M07', 'Linked records': '64 rows in PLAYER_MATCH' }],
        },
        choices: [
          'CASCADE: Deletes M07 and all 64 player results',
          'RESTRICT: Stops deletion because results still reference M07',
          'SET NULL: Sets Match ID to NULL across all 64 results',
          'Reassigns all results to M01',
        ],
        correctChoice: 1,
        choiceConsequences: {
          1: {
            headline: 'Deletion blocked',
            impactNote: 'M07 and all 64 player records stay safe.',
            explanation: 'RESTRICT prevents deleting a parent row when child rows still reference it.',
          },
        },
        beforeAfter: {
          beforeTitle: 'LINKED DATA',
          beforeColumns: ['Parent (MATCH)', 'Child (PLAYER_MATCH)'],
          beforeRows: [{ 'Parent (MATCH)': 'M07', 'Child (PLAYER_MATCH)': '64 linked results' }],
          changeLabel: 'DELETE M07 WITH RESTRICT',
          afterTitle: 'OUTCOME',
          afterColumns: ['Status', 'Reason'],
          afterRows: [{ Status: 'DELETE BLOCKED', Reason: '64 player results still point to M07' }],
          warning: 'Deleting M07 without a rule would create orphan records.',
        },
        success: 'Correct. RESTRICT blocks the deletion while linked records exist.',
        clue: 'RESTRICT stops the delete action.',
        biggerClue: 'RESTRICT blocks deletion.',
      },
    ],
    revealTitle: 'Referential Integrity & Delete Rules',
    reveal: 'RESTRICT, CASCADE, and SET NULL decide what happens to child rows when a parent row is deleted.',
  },

  // ZONE 12: ADMIN PANIC
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
        message: 'I wrote TITAN beside 100 players. Now the squad is called PHANTOM.',
        prompt: 'Did duplicating the squad name save work?',
        actionLabel: 'Choose answer',
        kind: 'CHOICE',
        table: {
          name: 'Player list',
          columns: ['PlayerID', 'PlayerName', 'SquadName'],
          rows: [
            { PlayerID: 'P01', PlayerName: 'RAVEN', SquadName: 'TITAN' },
            { PlayerID: 'P02', PlayerName: 'VENOM', SquadName: 'TITAN' },
            { PlayerID: '...', PlayerName: '...', SquadName: '... × 100' },
          ],
        },
        choices: [
          'Yes, duplicating data is always faster',
          'No, 100 rows must now be updated',
          'Yes, because computers are fast',
          'Only if PHANTOM wins',
        ],
        correctChoice: 1,
        choiceConsequences: {
          1: {
            headline: '100 rows must change',
            impactNote: 'A separate SQUAD table would need only 1 update.',
            explanation: 'Duplicating data saves seconds today and creates 100 manual edits tomorrow.',
          },
        },
        beforeAfter: {
          beforeTitle: 'BEFORE',
          beforeColumns: ['PlayerID', 'SquadName'],
          beforeRows: [
            { PlayerID: 'P01', SquadName: 'TITAN' },
            { PlayerID: '...', SquadName: '... × 100' },
          ],
          changeLabel: 'TITAN → PHANTOM',
          changeBadge: '100 rows to update',
          afterTitle: 'AFTER',
          afterColumns: ['PlayerID', 'SquadName'],
          afterRows: [
            { PlayerID: 'P01', SquadName: 'PHANTOM' },
            { PlayerID: '...', SquadName: '... × 100' },
          ],
          warning: '100 rows must be changed.',
        },
        success: 'No. Duplicating names created 100 edits.',
        clue: 'Count how many copies exist.',
        biggerClue: '100 rows must be updated.',
      },
    ],
    revealTitle: 'Repeated Data Creates Work',
    reveal: 'Saving the squad name once in SQUAD turns 100 edits into 1.',
  },

  // ZONE 13: 3NF COMPARISON
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
        message: 'PHANTOM changed its captain. Which design stores the captain in only one place?',
        prompt: 'Which design avoids duplicating the captain?',
        actionLabel: 'Compare designs',
        kind: 'CHOICE',
        choices: [
          'Design A: Every PLAYER row stores SquadName and CaptainName',
          'Design B: PLAYER stores SquadID; SQUAD stores Name and Captain',
          'Both designs repeat the captain equally',
        ],
        correctChoice: 1,
        choiceConsequences: {
          1: {
            headline: 'Design B stores captain once',
            consequenceTable: {
              name: 'Design B',
              columns: ['Table', 'Columns', 'Captain copies'],
              rows: [
                { Table: 'PLAYER', Columns: 'PlayerID, PlayerName, SquadID', 'Captain copies': '0' },
                { Table: 'SQUAD', Columns: 'SquadID, SquadName, Captain', 'Captain copies': '1 (in SQUAD)' },
              ],
            },
            impactNote: 'Captain changes in 1 row.',
            explanation: 'Design B isolates squad facts into SQUAD and satisfies 3NF.',
          },
        },
        beforeAfter: {
          beforeTitle: 'DESIGN A',
          beforeColumns: ['PlayerID', 'SquadName', 'Captain'],
          beforeRows: [
            { PlayerID: 'P01', SquadName: 'PHANTOM', Captain: 'ZERO' },
            { PlayerID: 'P02', SquadName: 'PHANTOM', Captain: 'ZERO' },
          ],
          changeLabel: 'NORMALIZE TO 3NF',
          afterTitle: 'DESIGN B',
          afterColumns: ['PLAYER table', 'SQUAD table'],
          afterRows: [{ 'PLAYER table': 'Keeps SquadID', 'SQUAD table': 'PHANTOM · ZERO (1 row)' }],
          warning: 'Design A has multiple copies of the captain.',
        },
        success: 'Correct. Design B stores the captain once in SQUAD.',
        clue: 'Count how many times the captain appears.',
        biggerClue: 'Design B saves the captain in SQUAD.',
      },
    ],
    revealTitle: 'Third Normal Form',
    reveal: 'Squad Name and Captain belong in SQUAD, not in every PLAYER row.',
  },

  // ZONE 14: REBUILD THE TOURNAMENT CORE
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
        message: 'The original unnormalized table is shown above. Put each field in its proper table.',
        prompt: 'Build the four normalized tables.',
        actionLabel: 'Build the tables',
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
          beforeTitle: 'ORIGINAL TABLE',
          beforeColumns: ['PlayerID', 'PlayerName', 'SquadID', 'SquadName', 'MatchID', 'Map', 'Kills', 'Rank'],
          beforeRows: [
            { PlayerID: 'P01', PlayerName: 'RAVEN', SquadID: 'S01', SquadName: 'PHANTOM', MatchID: 'M01', Map: 'Erangel', Kills: 8, Rank: 2 },
            { PlayerID: 'P02', PlayerName: 'VENOM', SquadID: 'S01', SquadName: 'PHANTOM', MatchID: 'M01', Map: 'Erangel', Kills: 5, Rank: 4 },
            { PlayerID: 'P01', PlayerName: 'RAVEN', SquadID: 'S01', SquadName: 'PHANTOM', MatchID: 'M02', Map: 'Miramar', Kills: 3, Rank: 12 },
          ],
          changeLabel: 'SEPARATE INTO 4 TABLES',
          afterTitle: '4 TABLES BUILT',
          afterColumns: ['PLAYER', 'SQUAD', 'MATCH', 'PLAYER_MATCH'],
          afterRows: [{ PLAYER: 'P01, P02', SQUAD: 'S01 (1 row)', MATCH: 'M01, M02', PLAYER_MATCH: '3 results' }],
          warning: 'Notice how SQUAD and MATCH rows deduplicate automatically.',
        },
        success: 'Great. Each table stores distinct records with proper relationships.',
        clue: 'Names go with their IDs. Kills and Rank go in PLAYER_MATCH.',
        biggerClue: 'Kills and Rank belong in PLAYER_MATCH.',
      },
    ],
    revealTitle: 'Clean Tournament Tables',
    reveal: 'PLAYER, SQUAD, MATCH, and PLAYER_MATCH now store distinct information without repetition.',
  },

  // ZONE 15: FINAL BOSS
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
      // Step 1: 1NF fix
      {
        speaker: 'System',
        message: 'RAVEN has M416 and Kar98k saved in one field. What must be fixed first?',
        prompt: 'How should the weapons field be fixed?',
        actionLabel: 'Fix weapon field',
        kind: 'CHOICE',
        table: {
          name: 'Weapons field',
          columns: ['PlayerID', 'PlayerName', 'Weapons', 'CaptainPhone'],
          rows: [
            { PlayerID: 'P01', PlayerName: 'RAVEN', Weapons: 'M416, Kar98k', CaptainPhone: '9801' },
            { PlayerID: 'P02', PlayerName: 'VENOM', Weapons: 'M416', CaptainPhone: '9801' },
          ],
        },
        choices: [
          'Separate weapons into atomic rows',
          'Publish results with the comma string',
          'Delete all weapon records',
          'Rename the column',
        ],
        correctChoice: 0,
        choiceConsequences: {
          0: {
            headline: 'Atomic weapon rows',
            consequenceTable: {
              name: 'Separate weapon rows',
              columns: ['PlayerID', 'WeaponName'],
              rows: [
                { PlayerID: 'P01', WeaponName: 'M416' },
                { PlayerID: 'P01', WeaponName: 'Kar98k' },
              ],
            },
            impactNote: 'Each cell holds one value.',
            explanation: 'Atomic rows satisfy 1NF.',
          },
        },
        beforeAfter: {
          beforeTitle: 'BEFORE',
          beforeColumns: ['PlayerID', 'Weapons'],
          beforeRows: [{ PlayerID: 'P01', Weapons: 'M416, Kar98k' }],
          changeLabel: 'SPLIT WEAPONS',
          afterTitle: 'AFTER (ATOMIC)',
          afterColumns: ['PlayerID', 'Weapon'],
          afterRows: [
            { PlayerID: 'P01', Weapon: 'M416' },
            { PlayerID: 'P01', Weapon: 'Kar98k' },
          ],
          warning: 'Two weapons were sharing one cell.',
        },
        success: 'Correct. Weapons now have separate records.',
        clue: 'Each cell must hold one value.',
        biggerClue: 'Separate M416 and Kar98k.',
      },

      // Step 2: 5 tables
      {
        speaker: 'Recovery AI',
        message: 'Build the complete normalized database from the messy source table.',
        prompt: 'Place each field in its table.',
        actionLabel: 'Build the tables',
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
          beforeTitle: 'ORIGINAL TABLE',
          beforeColumns: ['PlayerID', 'PlayerName', 'SquadID', 'SquadName', 'MatchID', 'Map', 'Weapons', 'Captain', 'CaptainPhone', 'Kills'],
          beforeRows: [
            { PlayerID: 'P01', PlayerName: 'RAVEN', SquadID: 'S01', SquadName: 'PHANTOM', MatchID: 'M07', Map: 'Erangel', Weapons: 'M416, Kar98k', Captain: 'ZERO', CaptainPhone: '9801', Kills: 8 },
          ],
          changeLabel: 'BUILD 5 CLEAN TABLES',
          afterTitle: '5 TABLES BUILT',
          afterColumns: ['PLAYER', 'SQUAD', 'MATCH', 'PLAYER_MATCH', 'WEAPON'],
          afterRows: [{ PLAYER: 'RAVEN', SQUAD: 'PHANTOM, 9801', MATCH: 'Erangel', PLAYER_MATCH: '8 kills', WEAPON: 'M416' }],
          warning: 'CaptainPhone belongs in SQUAD; Kills belongs in PLAYER_MATCH.',
        },
        success: 'Good. All 5 tables are populated with clean data.',
        clue: 'Ask what each field describes.',
        biggerClue: 'CaptainPhone goes in SQUAD. Kills goes in PLAYER_MATCH.',
      },

      // Step 3: Foreign Key Check
      {
        speaker: 'System',
        message: 'An unknown Player ID P99 submits 99 kills for Match M07. Player P99 is not in the PLAYER table.',
        prompt: 'What should the database do?',
        actionLabel: 'Choose action',
        kind: 'CHOICE',
        table: {
          name: 'Incoming result',
          columns: ['PlayerID', 'MatchID', 'Kills', 'Status'],
          rows: [{ PlayerID: 'P99', MatchID: 'M07', Kills: 99, Status: 'Player does not exist in PLAYER' }],
        },
        choices: [
          'Accept the score anyway',
          'Block it until the player exists in the PLAYER table',
          'Create a fake profile automatically',
        ],
        correctChoice: 1,
        choiceConsequences: {
          1: {
            headline: 'Result blocked',
            impactNote: 'Orphan record prevented from corrupting tournament tables.',
            explanation: 'A foreign key must point to an existing primary key in the parent table.',
          },
        },
        beforeAfter: {
          beforeTitle: 'UNKNOWN PLAYER RESULT',
          beforeColumns: ['Incoming row', 'Player check'],
          beforeRows: [{ 'Incoming row': 'P99 in M07 (99 kills)', 'Player check': 'P99 not found' }],
          changeLabel: 'CHECK FOREIGN KEY',
          afterTitle: 'RESULT',
          afterColumns: ['Status'],
          afterRows: [{ Status: 'Blocked: Player P99 does not exist' }],
          warning: 'A match result must belong to a real player.',
        },
        success: 'The bad result was blocked. Tournament results can now be published.',
        clue: 'A match result needs an existing player.',
        biggerClue: 'Block the unknown Player ID.',
      },
    ],
    revealTitle: 'DATABASE MASTER',
    reveal: 'You fixed player identities, match data, table design, and bad values.',
  },
];

// PRACTICE DEMOS
export const demoCases: PuzzleCase[] = [
  // Demo 1: Find duplicate records
  {
    id: 101,
    demo: true,
    phase: 'EASY',
    rung: 'PRACTICE DEMO 1',
    title: 'Find the Duplicate Player',
    place: 'Registration Sandbox',
    time: 'DEMO',
    image: pubg1,
    xp: 0,
    steps: [
      {
        speaker: 'Organizer',
        message: 'Two rows claim the same Player ID.',
        prompt: 'Which two rows are the same?',
        actionLabel: 'Select two rows',
        kind: 'PAIR',
        table: {
          name: 'Registration list',
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
          beforeTitle: 'REGISTRATION LIST',
          beforeColumns: ['PlayerID', 'PlayerName', 'SquadID'],
          beforeRows: [
            { PlayerID: 'P01', PlayerName: '{player}', SquadID: 'S01' },
            { PlayerID: 'P02', PlayerName: 'VENOM', SquadID: 'S01' },
            { PlayerID: 'P01', PlayerName: '{player}', SquadID: 'S01' },
          ],
          changeLabel: 'COMPARE PLAYER IDs',
          afterTitle: 'DUPLICATE FOUND',
          afterColumns: ['Row 1', 'Row 3', 'Result'],
          afterRows: [{ 'Row 1': 'P01 ({player})', 'Row 3': 'P01 ({player})', Result: 'Duplicate ID' }],
          warning: 'Names can match by coincidence, but IDs prove identity.',
        },
        success: 'Both selected rows use Player ID P01.',
        clue: 'Look for the two rows with the same Player ID.',
        biggerClue: 'Select row 1 and row 3.',
      },
    ],
    revealTitle: 'Unique Identity',
    reveal: 'One Player ID should identify one player record.',
  },

  // Demo 2: Build Four Tables Live
  {
    id: 102,
    demo: true,
    phase: 'EASY',
    rung: 'PRACTICE DEMO 2',
    title: 'Build Four Tables Live',
    place: 'Database Workshop',
    time: 'DEMO',
    image: pubg6,
    xp: 0,
    steps: [
      {
        speaker: 'Recovery AI',
        message: 'The details are mixed together in one table.',
        prompt: 'Build the tables.',
        actionLabel: 'Build the database',
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
          beforeTitle: 'ORIGINAL MIXED TABLE',
          beforeColumns: ['PlayerID', 'PlayerName', 'SquadID', 'SquadName', 'MatchID', 'Map', 'Kills', 'Rank'],
          beforeRows: [
            { PlayerID: 'P01', PlayerName: '{player}', SquadID: 'S01', SquadName: 'PHANTOM', MatchID: 'M01', Map: 'Erangel', Kills: 8, Rank: 2 },
            { PlayerID: 'P02', PlayerName: 'VENOM', SquadID: 'S01', SquadName: 'PHANTOM', MatchID: 'M01', Map: 'Erangel', Kills: 5, Rank: 4 },
            { PlayerID: 'P01', PlayerName: '{player}', SquadID: 'S01', SquadName: 'PHANTOM', MatchID: 'M02', Map: 'Miramar', Kills: 3, Rank: 12 },
          ],
          changeLabel: 'EXTRACT INTO 4 TABLES',
          afterTitle: '4 TABLES BUILT',
          afterColumns: ['PLAYER', 'SQUAD', 'MATCH', 'PLAYER_MATCH'],
          afterRows: [
            { PLAYER: 'P01, {player} · P02, VENOM', SQUAD: 'S01, PHANTOM', MATCH: 'M01, Erangel · M02, Miramar', PLAYER_MATCH: 'P01 + M01 → 8 Kills' },
          ],
          warning: 'Watch the tables deduplicate records live.',
        },
        success: 'The four tables and their relationships are now built.',
        clue: 'Names belong with their own IDs. Kills and Rank belong in PLAYER_MATCH.',
        biggerClue: 'Assign PlayerID and PlayerName to PLAYER, SquadID and SquadName to SQUAD.',
      },
    ],
    revealTitle: 'Tables Have Jobs',
    reveal: 'Each table stores one kind of entity, connected by keys.',
  },
];

export const puzzleCaseMap = Object.fromEntries(
  [...demoCases, ...puzzleCases].map((item) => [item.id, item])
) as Record<number, PuzzleCase>;

export const PUZZLE_TOTAL = puzzleCases.length;
