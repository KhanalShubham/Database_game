import type { DBTable, FunctionalDep } from '../normalization/engine';

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL CONFIG TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type ChallengeType =
  | 'OBSERVE_REDUNDANCY'    // click cells to highlight repetition
  | 'UPDATE_ANOMALY'        // edit a value; see inconsistency
  | 'DELETE_ANOMALY'        // delete a row; see what information is lost
  | 'INSERT_ANOMALY'        // try to add a row; see what's forced
  | 'IDENTIFY_ANOMALY'      // classify given scenario
  | 'DRAG_GROUP'            // drag columns into logical groups
  | 'SELECT_KEY'            // click the correct primary key
  | 'SELECT_COMPOSITE_KEY'  // select two columns that form the composite key
  | 'CONNECT_DEPENDENCY'    // draw arrow from determinant to dependent
  | 'IDENTIFY_DEPENDENCY'   // true/false on given deps
  | 'FIX_ATOMICITY'         // split multi-value cells
  | 'REMOVE_REPEATING'      // restructure repeating column groups
  | 'SPLIT_TABLE'           // drag columns into separate tables
  | 'MARK_NORMAL_FORM'      // choose which NF applies
  | 'IDENTIFY_PARTIAL_DEP'  // find partial dependencies
  | 'IDENTIFY_TRANSITIVE'   // find transitive dependencies
  | 'FULL_NORMALIZE'        // end-to-end normalization (boss)
  | 'INTEGRITY_JUDGE'       // accept or reject a record
  | 'FIND_VIOLATION'        // click the violating row
  | 'CHOOSE_DELETE_RULE'    // RESTRICT / CASCADE / SET NULL
  | 'INTEGRITY_REPAIR'      // fix all integrity problems (boss)
  | 'FINAL_CHALLENGE';      // level 50

export interface HintConfig {
  level1: string;
  level2: string;
  level3: string;
}

export interface LevelConfig {
  id: number;
  worldId: number;
  worldName: string;
  title: string;
  missionText: string;        // what the player must do
  storyBriefing: string[];    // short lines shown before interaction
  challengeType: ChallengeType;
  initialTables: DBTable[];
  initialDeps?: FunctionalDep[];
  task: any;                  // challenge-specific data
  successCondition: string;   // human-readable description of success
  hints: HintConfig;
  successFeedback: string;
  xpReward: number;
  healthChange: number;       // positive = heal, negative = damage
  unlocksConcept?: string;
  conceptDefinition?: string;
  isBoss?: boolean;
  quickNote?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// THE MESSY TABLE (shared across World 1 levels)
// ─────────────────────────────────────────────────────────────────────────────
export const MESSY_ROWS = [
  { Student_ID: 101, Student_Name: 'Ram',  Course_ID: 'C01', Course_Name: 'BSc CSIT', Instructor: 'Mr. Shah',  Instructor_Phone: '9800001', Semester: 1 },
  { Student_ID: 101, Student_Name: 'Ram',  Course_ID: 'C02', Course_Name: 'BCA',      Instructor: 'Ms. Karki', Instructor_Phone: '9800002', Semester: 1 },
  { Student_ID: 102, Student_Name: 'Sita', Course_ID: 'C01', Course_Name: 'BSc CSIT', Instructor: 'Mr. Shah',  Instructor_Phone: '9800001', Semester: 2 },
  { Student_ID: 103, Student_Name: 'Hari', Course_ID: 'C01', Course_Name: 'BSc CSIT', Instructor: 'Mr. Shah',  Instructor_Phone: '9800001', Semester: 1 },
];

export const MESSY_TABLE: DBTable = {
  id: 'messy',
  name: 'UNIVERSITY',
  primaryKey: [],
  columns: [
    { name: 'Student_ID' }, { name: 'Student_Name' },
    { name: 'Course_ID' }, { name: 'Course_Name' },
    { name: 'Instructor' }, { name: 'Instructor_Phone' },
    { name: 'Semester' },
  ],
  rows: JSON.parse(JSON.stringify(MESSY_ROWS)),
};

// ─────────────────────────────────────────────────────────────────────────────
// WORLDS META
// ─────────────────────────────────────────────────────────────────────────────
export const worlds = [
  { id: 1, name: 'THE MESS',          subtitle: 'Redundancy & Anomalies',  levelRange: [1, 8]  },
  { id: 2, name: 'DISCOVER THE RULES',subtitle: 'Keys & Dependencies',     levelRange: [9, 17] },
  { id: 3, name: '1NF',               subtitle: 'First Normal Form',       levelRange: [18, 24]},
  { id: 4, name: '2NF',               subtitle: 'Second Normal Form',      levelRange: [25, 32]},
  { id: 5, name: '3NF',               subtitle: 'Third Normal Form',       levelRange: [33, 39]},
  { id: 6, name: 'DATA INTEGRITY',    subtitle: 'Protect the Database',    levelRange: [40, 46]},
  { id: 7, name: 'DATABASE MASTER',   subtitle: 'Final Challenge',         levelRange: [47, 50]},
];

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL DEFINITIONS — ALL 50 LEVELS
// ─────────────────────────────────────────────────────────────────────────────
const levels: LevelConfig[] = [

// ══════════════════════════ WORLD 1 — THE MESS ═══════════════════════════════
{
  id: 1, worldId: 1, worldName: 'THE MESS',
  title: 'Enter the Database',
  missionText: 'Explore the database. Click any cell that appears more than once.',
  storyBriefing: [
    'DATABASE: ZERO',
    'SYSTEM STATUS: CRITICAL',
    '',
    'The previous administrator left this behind.',
    'It looks like one giant table with everything in it.',
    '',
    'Start by exploring. Click any value that repeats.',
  ],
  challengeType: 'OBSERVE_REDUNDANCY',
  initialTables: [MESSY_TABLE],
  task: {
    repeatingColumns: ['Course_Name', 'Instructor', 'Instructor_Phone'],
    minSelectionsRequired: 1,
  },
  successCondition: 'Click at least one repeated value',
  hints: {
    level1: 'Look at the Course_Name column.',
    level2: 'BSc CSIT appears three times. Is this necessary?',
    level3: 'The same instructor information is stored for every row. That is the problem.',
  },
  successFeedback: 'You found it. The same information is stored many times. This is called REDUNDANCY.',
  xpReward: 20, healthChange: 3,
  unlocksConcept: 'REDUNDANCY',
  conceptDefinition: 'Storing the same information multiple times in a database creates redundancy. It wastes space and causes problems.',
  quickNote: 'Click any value that appears in multiple rows.',
},

{
  id: 2, worldId: 1, worldName: 'THE MESS',
  title: 'Find the Repetition',
  missionText: 'Find all information stored unnecessarily many times. Click each repeated column header.',
  storyBriefing: [
    'Now look more carefully.',
    '',
    'Which columns contain the same value repeated across rows?',
    '',
    'Click the column headers that have unnecessary repetition.',
  ],
  challengeType: 'OBSERVE_REDUNDANCY',
  initialTables: [MESSY_TABLE],
  task: {
    repeatingColumns: ['Course_Name', 'Instructor', 'Instructor_Phone'],
    targetColumnHeaders: ['Course_Name', 'Instructor', 'Instructor_Phone'],
    minSelectionsRequired: 3,
    selectHeaders: true,
  },
  successCondition: 'Select Course_Name, Instructor, and Instructor_Phone as redundant columns',
  hints: {
    level1: 'Mr. Shah appears three times. Is his information unique to each row?',
    level2: 'Course_Name and Instructor belong to the course, not the enrollment.',
    level3: 'Course_Name, Instructor, and Instructor_Phone are all repeated unnecessarily.',
  },
  successFeedback: 'Correct. Course_Name, Instructor, and Instructor_Phone repeat because they belong to the course, not to each individual enrollment.',
  xpReward: 25, healthChange: 3,
  quickNote: 'Which facts are stored more than once?',
},

{
  id: 3, worldId: 1, worldName: 'THE MESS',
  title: 'The Update Problem',
  missionText: 'Mr. Shah changed his phone number to 9811111. Update it in the database.',
  storyBriefing: [
    '⚠ INCOMING UPDATE',
    '',
    'Mr. Shah changed his phone number.',
    'New number: 9811111',
    '',
    'Update his phone number in the database.',
  ],
  challengeType: 'UPDATE_ANOMALY',
  initialTables: [MESSY_TABLE],
  task: {
    column: 'Instructor_Phone',
    targetValue: '9800001',
    newValue: '9811111',
    occurrences: 3,
    anomalyRevealAfterPartial: true,
  },
  successCondition: 'Attempt to update the phone number (partial or full)',
  hints: {
    level1: 'Find the rows where Instructor_Phone is 9800001.',
    level2: 'Mr. Shah appears in 3 rows. You need to update all 3.',
    level3: 'If you miss even one row, the database will show two different phone numbers for Mr. Shah.',
  },
  successFeedback: 'Because the same fact (phone number) was stored in 3 places, you had to update 3 rows. Miss one, and the database becomes inconsistent. This is an UPDATE ANOMALY.',
  xpReward: 30, healthChange: 5,
  unlocksConcept: 'UPDATE ANOMALY',
  conceptDefinition: 'An update anomaly occurs when changing one fact requires updating multiple rows. Missing even one creates inconsistency.',
  quickNote: 'One fact, many rows — a dangerous design.',
},

{
  id: 4, worldId: 1, worldName: 'THE MESS',
  title: 'The Deletion Problem',
  missionText: 'Sita (Student 102) is leaving the university. Delete her record.',
  storyBriefing: [
    '⚠ STUDENT DEPARTURE',
    '',
    'Sita (Student 102) has left the university.',
    '',
    'Delete her record from the database.',
    '',
    'But watch what happens...',
  ],
  challengeType: 'DELETE_ANOMALY',
  initialTables: [MESSY_TABLE],
  task: {
    deleteRowWhere: { Student_ID: 102 },
    lostInformation: ['Course_ID', 'Course_Name', 'Instructor', 'Instructor_Phone'],
    revealLoss: true,
  },
  successCondition: 'Delete Sita\'s row and observe what information is lost',
  hints: {
    level1: 'Delete the row where Student_ID = 102.',
    level2: 'After deleting Sita, does the BCA course (C02) still exist anywhere?',
    level3: 'Sita was the only student in BCA. Deleting her erases the course from the database entirely.',
  },
  successFeedback: 'By deleting Sita, you also deleted the only record of the BCA course. The course information was lost. This is a DELETION ANOMALY.',
  xpReward: 30, healthChange: 5,
  unlocksConcept: 'DELETION ANOMALY',
  conceptDefinition: 'A deletion anomaly occurs when deleting a row accidentally removes unrelated information that should be kept.',
  quickNote: 'Deleting a student should not delete a course.',
},

{
  id: 5, worldId: 1, worldName: 'THE MESS',
  title: 'The Insertion Problem',
  missionText: 'Try to add a new course: C04 | BIT | Mr. Rai | 9800003 — without any enrolled students.',
  storyBriefing: [
    '⚠ NEW COURSE ADDED',
    '',
    'The university has a new course: BIT (C04).',
    'Instructor: Mr. Rai | Phone: 9800003',
    '',
    'Try to add this course to the database.',
    'But there are no enrolled students yet...',
  ],
  challengeType: 'INSERT_ANOMALY',
  initialTables: [MESSY_TABLE],
  task: {
    attemptInsert: { Student_ID: null, Student_Name: null, Course_ID: 'C04', Course_Name: 'BIT', Instructor: 'Mr. Rai', Instructor_Phone: '9800003', Semester: null },
    blockedColumns: ['Student_ID', 'Student_Name'],
    reason: 'There is no student enrolled yet, so Student_ID cannot be filled.',
  },
  successCondition: 'Attempt the insert and observe the problem',
  hints: {
    level1: 'The table requires a Student_ID for every row.',
    level2: 'What do you put in Student_ID if no student has enrolled yet?',
    level3: 'You cannot add a course without a student because the table mixes two different facts.',
  },
  successFeedback: 'You cannot add a course without a student because Student_ID is missing. This is an INSERTION ANOMALY — mixing different types of data in one table prevents clean inserts.',
  xpReward: 30, healthChange: 5,
  unlocksConcept: 'INSERTION ANOMALY',
  conceptDefinition: 'An insertion anomaly occurs when you cannot add one piece of information without also providing unrelated information.',
  quickNote: 'A course should exist independently of student enrollments.',
},

{
  id: 6, worldId: 1, worldName: 'THE MESS',
  title: 'Anomaly Detective',
  missionText: 'Classify each scenario: which type of anomaly does it describe?',
  storyBriefing: [
    'You have seen all three anomaly types.',
    '',
    'Now identify them in new scenarios.',
    '',
    'Match each case to its anomaly type.',
  ],
  challengeType: 'IDENTIFY_ANOMALY',
  initialTables: [],
  task: {
    scenarios: [
      { text: 'A teacher changed departments, but only some rows were updated. Now the database shows two departments for the same teacher.', answer: 'UPDATE ANOMALY' },
      { text: 'The last student dropped a course. The course no longer appears in the database.', answer: 'DELETION ANOMALY' },
      { text: 'A new product was added to inventory, but without a sale record it cannot be inserted.', answer: 'INSERTION ANOMALY' },
    ],
    options: ['UPDATE ANOMALY', 'DELETION ANOMALY', 'INSERTION ANOMALY'],
  },
  successCondition: 'Correctly classify all 3 scenarios',
  hints: {
    level1: 'Update anomaly = changing one fact in many places.',
    level2: 'Deletion anomaly = losing unrelated data when deleting.',
    level3: 'Insertion anomaly = cannot add data without unrelated data.',
  },
  successFeedback: 'All anomalies identified correctly. These three problems all come from storing different facts in one table.',
  xpReward: 40, healthChange: 5,
  quickNote: 'Three anomalies. Three different problems. One root cause: mixed data.',
},

{
  id: 7, worldId: 1, worldName: 'THE MESS',
  title: 'Organize the Facts',
  missionText: 'Drag each column into the correct group: STUDENT, COURSE, or ENROLLMENT.',
  storyBriefing: [
    'The solution is to separate the facts.',
    '',
    'Student facts belong in a STUDENT group.',
    'Course facts belong in a COURSE group.',
    'Enrollment facts belong in an ENROLLMENT group.',
    '',
    'Drag each column to the right group.',
  ],
  challengeType: 'DRAG_GROUP',
  initialTables: [MESSY_TABLE],
  task: {
    groups: ['STUDENT', 'COURSE', 'ENROLLMENT'],
    columns: ['Student_ID', 'Student_Name', 'Course_ID', 'Course_Name', 'Instructor', 'Instructor_Phone', 'Semester'],
    correctMapping: {
      Student_ID: 'STUDENT',
      Student_Name: 'STUDENT',
      Course_ID: 'COURSE',
      Course_Name: 'COURSE',
      Instructor: 'COURSE',
      Instructor_Phone: 'COURSE',
      Semester: 'ENROLLMENT',
    },
  },
  successCondition: 'Correctly group all 7 columns',
  hints: {
    level1: 'Think: what describes a student? What describes a course?',
    level2: 'Semester describes the enrollment event, not the student or course alone.',
    level3: 'Student_ID and Student_Name → STUDENT. Course_ID, Course_Name, Instructor, Instructor_Phone → COURSE. Semester → ENROLLMENT.',
  },
  successFeedback: 'You have logically separated the facts. This is the beginning of normalization.',
  xpReward: 40, healthChange: 5,
  quickNote: 'Each table should describe one thing.',
},

{
  id: 8, worldId: 1, worldName: 'THE MESS',
  isBoss: true,
  title: '⚔ NORMALIZATION UNLOCKED',
  missionText: 'Answer: what is the purpose of normalization?',
  storyBriefing: [
    '⚔ WORLD 1 COMPLETE',
    '',
    'You discovered:',
    '• Redundancy',
    '• Update anomaly',
    '• Deletion anomaly',
    '• Insertion anomaly',
    '',
    'All of these problems come from mixing different facts.',
    '',
    'The solution has a name.',
  ],
  challengeType: 'IDENTIFY_ANOMALY',
  initialTables: [],
  task: {
    scenarios: [
      { text: 'What is the main goal of normalization?', answer: 'Organize data into related tables to reduce redundancy and eliminate anomalies', isSingleChoice: true, options: [
        'Organize data into related tables to reduce redundancy and eliminate anomalies',
        'Make the database faster by combining all data into one table',
        'Add more columns to store more information',
      ]},
    ],
    options: [],
  },
  successCondition: 'Select the correct definition',
  hints: {
    level1: 'Think about all the problems you solved in World 1.',
    level2: 'Normalization is about organization, not speed.',
    level3: 'The goal is to reduce redundancy and prevent anomalies.',
  },
  successFeedback: 'NORMALIZATION: Organizing data into related tables to reduce redundancy and eliminate anomalies.',
  xpReward: 100, healthChange: 10,
  unlocksConcept: 'NORMALIZATION',
  conceptDefinition: 'Normalization is the process of organizing a database into multiple related tables to eliminate redundancy and prevent anomalies.',
},

// ═════════════════════════ WORLD 2 — DISCOVER THE RULES ══════════════════════
{
  id: 9, worldId: 2, worldName: 'DISCOVER THE RULES',
  title: 'Attributes',
  missionText: 'Click a column in the Student table to learn what it describes.',
  storyBriefing: [
    'Now we build the clean structure.',
    '',
    'Start with the STUDENT table.',
    '',
    'Every column describes a property of the student.',
    'These properties have a name.',
    '',
    'Click any column to inspect it.',
  ],
  challengeType: 'SELECT_KEY',
  initialTables: [{
    id: 'student', name: 'STUDENT', primaryKey: [],
    columns: [{ name: 'Student_ID' }, { name: 'Student_Name' }, { name: 'Email' }],
    rows: [
      { Student_ID: 101, Student_Name: 'Ram', Email: 'ram@example.com' },
      { Student_ID: 102, Student_Name: 'Sita', Email: 'sita@example.com' },
    ],
  }],
  task: { mode: 'inspect', minClicks: 1 },
  successCondition: 'Click any column header',
  hints: {
    level1: 'Click the Student_ID column header.',
    level2: 'Each column is called an ATTRIBUTE.',
    level3: 'Student_ID, Student_Name, and Email are all attributes of a Student.',
  },
  successFeedback: 'An ATTRIBUTE is a property that describes an entity. Student_ID, Student_Name, and Email are all attributes of a Student.',
  xpReward: 20, healthChange: 2,
  unlocksConcept: 'ATTRIBUTE',
  conceptDefinition: 'An attribute is a property that describes an entity (like a table). Columns are attributes.',
  quickNote: 'Attribute = a column that describes one property.',
},

{
  id: 10, worldId: 2, worldName: 'DISCOVER THE RULES',
  title: 'Find the Key',
  missionText: 'Which attribute uniquely identifies each student? Click it.',
  storyBriefing: [
    'Every table needs one attribute that identifies each row uniquely.',
    '',
    'In the Student table:',
    '',
    '101 → always refers to Ram',
    '102 → always refers to Sita',
    '',
    'Which attribute does this job?',
  ],
  challengeType: 'SELECT_KEY',
  initialTables: [{
    id: 'student', name: 'STUDENT', primaryKey: [],
    columns: [{ name: 'Student_ID' }, { name: 'Student_Name' }, { name: 'Email' }],
    rows: [
      { Student_ID: 101, Student_Name: 'Ram', Email: 'ram@example.com' },
      { Student_ID: 102, Student_Name: 'Sita', Email: 'sita@example.com' },
      { Student_ID: 103, Student_Name: 'Ram', Email: 'ram2@example.com' }, // two Rams
    ],
  }],
  task: {
    mode: 'select_pk',
    correctPK: 'Student_ID',
    wrongOptions: { Student_Name: 'Two students can share the same name. Student_Name is not always unique.', Email: 'Email could work, but Student_ID is the designed identity column.' },
  },
  successCondition: 'Select Student_ID as the primary key',
  hints: {
    level1: 'Look for a column where every value is different.',
    level2: 'Notice that two students are named Ram. Names are not unique.',
    level3: 'Student_ID is always unique. It is the identity of the student.',
  },
  successFeedback: 'Student_ID is the PRIMARY KEY. It uniquely identifies each student. No two students can have the same Student_ID.',
  xpReward: 30, healthChange: 3,
  unlocksConcept: 'PRIMARY KEY',
  conceptDefinition: 'A Primary Key is an attribute (or set of attributes) that uniquely identifies each row in a table. It cannot be NULL or duplicated.',
  quickNote: 'Primary Key = the identity of a row.',
},

{
  id: 11, worldId: 2, worldName: 'DISCOVER THE RULES',
  title: 'Composite Key',
  missionText: 'Find which combination of columns uniquely identifies each enrollment row.',
  storyBriefing: [
    'The ENROLLMENT table is different.',
    '',
    'Ram (101) can enroll in multiple courses.',
    'C01 can have multiple students.',
    '',
    'No single column uniquely identifies a row.',
    '',
    'Select the TWO columns that together form a unique identity.',
  ],
  challengeType: 'SELECT_COMPOSITE_KEY',
  initialTables: [{
    id: 'enrollment', name: 'ENROLLMENT', primaryKey: [],
    columns: [{ name: 'Student_ID' }, { name: 'Course_ID' }, { name: 'Semester' }],
    rows: [
      { Student_ID: 101, Course_ID: 'C01', Semester: 1 },
      { Student_ID: 101, Course_ID: 'C02', Semester: 1 },
      { Student_ID: 102, Course_ID: 'C01', Semester: 2 },
    ],
  }],
  task: {
    correctComposite: ['Student_ID', 'Course_ID'],
    wrongSingle: {
      Student_ID: 'Ram (101) appears twice — once for C01 and once for C02. Not unique alone.',
      Course_ID: 'C01 appears twice — for Ram and Sita. Not unique alone.',
      Semester: 'Multiple rows can share the same semester.',
    },
  },
  successCondition: 'Select both Student_ID and Course_ID',
  hints: {
    level1: 'Try selecting just Student_ID. Ram appears twice — so it cannot be the key alone.',
    level2: 'Try selecting just Course_ID. C01 appears twice — not unique alone.',
    level3: 'The COMBINATION of Student_ID + Course_ID is always unique. Together they identify one enrollment.',
  },
  successFeedback: 'Student_ID + Course_ID is the COMPOSITE KEY. Neither column alone is unique, but together they uniquely identify each enrollment.',
  xpReward: 40, healthChange: 5,
  unlocksConcept: 'COMPOSITE KEY',
  conceptDefinition: 'A Composite Key is a primary key made of two or more columns. When no single column is unique, we combine columns.',
  quickNote: 'When one column is not enough to identify a row.',
},

{
  id: 12, worldId: 2, worldName: 'DISCOVER THE RULES',
  title: 'Functional Dependency',
  missionText: 'Draw an arrow: which attribute does Student_ID determine?',
  storyBriefing: [
    'If you know a Student_ID...',
    '',
    '101 → always Ram',
    '102 → always Sita',
    '',
    'Knowing Student_ID lets you determine Student_Name.',
    '',
    'Draw an arrow from Student_ID to what it determines.',
  ],
  challengeType: 'CONNECT_DEPENDENCY',
  initialTables: [{
    id: 'student', name: 'STUDENT', primaryKey: ['Student_ID'],
    columns: [{ name: 'Student_ID', isPrimaryKey: true }, { name: 'Student_Name' }, { name: 'Email' }],
    rows: [
      { Student_ID: 101, Student_Name: 'Ram', Email: 'ram@example.com' },
      { Student_ID: 102, Student_Name: 'Sita', Email: 'sita@example.com' },
    ],
  }],
  task: {
    source: 'Student_ID',
    validTargets: ['Student_Name', 'Email'],
    correctDeps: [
      { from: ['Student_ID'], to: 'Student_Name' },
      { from: ['Student_ID'], to: 'Email' },
    ],
    requiredDeps: 1,
  },
  successCondition: 'Draw at least one correct dependency arrow from Student_ID',
  hints: {
    level1: 'Click Student_ID, then click Student_Name.',
    level2: 'If you know 101, you always know it is Ram. That is a functional dependency.',
    level3: 'Student_ID → Student_Name means "Student_ID determines Student_Name".',
  },
  successFeedback: 'Student_ID → Student_Name is a FUNCTIONAL DEPENDENCY. Knowing Student_ID, you can always determine Student_Name.',
  xpReward: 40, healthChange: 5,
  unlocksConcept: 'FUNCTIONAL DEPENDENCY',
  conceptDefinition: 'A Functional Dependency means one attribute determines another. If A → B, then knowing A always tells you B.',
  quickNote: 'A → B: knowing A lets you find B.',
},

{
  id: 13, worldId: 2, worldName: 'DISCOVER THE RULES',
  title: 'Dependency Detective',
  missionText: 'Confirm or deny each functional dependency statement.',
  storyBriefing: [
    'Given what you know about this database,',
    'which of these dependencies are valid?',
    '',
    'Mark each one: VALID or INVALID.',
  ],
  challengeType: 'IDENTIFY_DEPENDENCY',
  initialTables: [MESSY_TABLE],
  task: {
    dependencies: [
      { from: 'Student_ID', to: 'Student_Name', valid: true, explanation: 'One Student_ID always maps to one Student_Name.' },
      { from: 'Course_ID', to: 'Course_Name', valid: true, explanation: 'One Course_ID always maps to one Course_Name.' },
      { from: 'Course_ID', to: 'Instructor', valid: true, explanation: 'Each course has one instructor.' },
      { from: 'Instructor', to: 'Instructor_Phone', valid: true, explanation: 'Each instructor has one phone number.' },
      { from: 'Student_ID', to: 'Course_Name', valid: false, explanation: 'A student can take multiple courses. Student_ID does not determine Course_Name.' },
      { from: 'Semester', to: 'Student_Name', valid: false, explanation: 'Multiple students can share the same semester.' },
    ],
  },
  successCondition: 'Correctly classify all 6 dependencies',
  hints: {
    level1: 'Ask: "If I know X, can I always find exactly one Y?"',
    level2: 'A student can have multiple courses. So Student_ID → Course_Name is invalid.',
    level3: 'Only one-to-one relationships produce valid functional dependencies.',
  },
  successFeedback: 'Well done. Functional dependencies are about business rules, not just sample data.',
  xpReward: 40, healthChange: 5,
  quickNote: 'A → B is valid only when A always determines exactly one B.',
},

{
  id: 14, worldId: 2, worldName: 'DISCOVER THE RULES',
  title: 'Follow the Chain',
  missionText: 'Trace the dependency chain: Course_ID → Instructor → Instructor_Phone.',
  storyBriefing: [
    'Look at these three attributes:',
    '',
    'Course_ID → Instructor → Instructor_Phone',
    '',
    'Course_ID determines the Instructor.',
    'The Instructor determines their Phone.',
    '',
    'Click each attribute in the chain, in order.',
  ],
  challengeType: 'CONNECT_DEPENDENCY',
  initialTables: [{
    id: 'course', name: 'COURSE', primaryKey: ['Course_ID'],
    columns: [{ name: 'Course_ID', isPrimaryKey: true }, { name: 'Course_Name' }, { name: 'Instructor' }, { name: 'Instructor_Phone' }],
    rows: [
      { Course_ID: 'C01', Course_Name: 'BSc CSIT', Instructor: 'Mr. Shah', Instructor_Phone: '9800001' },
      { Course_ID: 'C02', Course_Name: 'BCA', Instructor: 'Ms. Karki', Instructor_Phone: '9800002' },
    ],
  }],
  task: {
    chainMode: true,
    correctChain: ['Course_ID', 'Instructor', 'Instructor_Phone'],
  },
  successCondition: 'Click the chain in order: Course_ID → Instructor → Instructor_Phone',
  hints: {
    level1: 'Start by clicking Course_ID.',
    level2: 'Course_ID determines the Instructor. Click Instructor next.',
    level3: 'Instructor determines Instructor_Phone. Complete the chain.',
  },
  successFeedback: 'You traced the full chain. Notice that Instructor_Phone is not directly determined by Course_ID — it goes through Instructor first.',
  xpReward: 30, healthChange: 3,
  quickNote: 'A → B → C means B is in the middle of the chain.',
},

{
  id: 15, worldId: 2, worldName: 'DISCOVER THE RULES',
  title: 'Transitive Discovery',
  missionText: 'Instructor_Phone is in the COURSE table. Should it be?',
  storyBriefing: [
    'You traced: Course_ID → Instructor → Instructor_Phone',
    '',
    'But does Instructor_Phone really belong in the COURSE table?',
    '',
    'Instructor_Phone describes the Instructor.',
    'Not the Course.',
    '',
    'This hidden chain is a problem.',
  ],
  challengeType: 'IDENTIFY_DEPENDENCY',
  initialTables: [],
  task: {
    dependencies: [
      { from: 'Course_ID → Instructor → Instructor_Phone', to: 'Transitive Dependency', isTransitive: true, valid: true, explanation: 'Instructor_Phone depends on Instructor, not directly on Course_ID. This is a transitive dependency.' },
      { from: 'Course_ID → Course_Name', to: 'Direct Dependency', isTransitive: false, valid: true, explanation: 'Course_Name directly describes the Course. This is fine.' },
    ],
    mode: 'identify_transitive',
  },
  successCondition: 'Correctly identify which dependency is transitive',
  hints: {
    level1: 'Which attribute is "in the middle" of the chain?',
    level2: 'If removing Instructor breaks the link, that is where the transitive dependency lives.',
    level3: 'Course_ID → Instructor → Instructor_Phone: Instructor_Phone depends on Instructor, not Course_ID.',
  },
  successFeedback: 'Correct. Course_ID → Instructor → Instructor_Phone is a TRANSITIVE DEPENDENCY. Instructor_Phone does not directly describe the course — it describes the instructor.',
  xpReward: 40, healthChange: 5,
  unlocksConcept: 'TRANSITIVE DEPENDENCY',
  conceptDefinition: 'A transitive dependency exists when a non-key attribute (A) depends on another non-key attribute (B), which depends on the key. Key → A → B.',
  quickNote: 'Key → A → B: B is transitively dependent on the key.',
},

{
  id: 16, worldId: 2, worldName: 'DISCOVER THE RULES',
  title: 'Dependency Test',
  missionText: 'Classify each dependency: Direct, Partial, or Transitive.',
  storyBriefing: [
    'You have learned three types of dependencies.',
    '',
    'Classify each one correctly.',
  ],
  challengeType: 'IDENTIFY_DEPENDENCY',
  initialTables: [],
  task: {
    dependencies: [
      { from: '(Student_ID + Course_ID) → Semester', type: 'DIRECT', explanation: 'Semester depends on the full composite key. This is a direct dependency.' },
      { from: 'Student_ID → Student_Name', type: 'PARTIAL', explanation: 'Student_Name depends on only PART of the composite key (Student_ID alone). This is a partial dependency.' },
      { from: 'Course_ID → Instructor → Instructor_Phone', type: 'TRANSITIVE', explanation: 'Instructor_Phone depends on Instructor (a non-key attribute), not directly on Course_ID.' },
    ],
    options: ['DIRECT', 'PARTIAL', 'TRANSITIVE'],
    mode: 'classify',
  },
  successCondition: 'Correctly classify all 3 dependencies',
  hints: {
    level1: 'Direct = depends on the full key. Partial = depends on part of a composite key.',
    level2: 'Transitive = A non-key attribute determines another non-key attribute.',
    level3: 'Student_ID → Student_Name is partial because Student_ID is only PART of the composite key.',
  },
  successFeedback: 'All classified correctly. These three dependency types drive 1NF, 2NF, and 3NF.',
  xpReward: 40, healthChange: 5,
  quickNote: 'Direct → stays. Partial → causes 2NF issue. Transitive → causes 3NF issue.',
},

{
  id: 17, worldId: 2, worldName: 'DISCOVER THE RULES',
  isBoss: true,
  title: '⚔ RULES UNLOCKED',
  missionText: 'Connect each rule to its correct description.',
  storyBriefing: [
    '⚔ WORLD 2 COMPLETE',
    '',
    'You discovered:',
    '• Attributes',
    '• Primary Key',
    '• Composite Key',
    '• Functional Dependency',
    '• Transitive Dependency',
    '',
    'Connect each concept to its definition.',
  ],
  challengeType: 'IDENTIFY_ANOMALY',
  initialTables: [],
  task: {
    scenarios: [
      { text: 'An attribute that uniquely identifies each row in a table.', answer: 'PRIMARY KEY' },
      { text: 'When one attribute determines another attribute.', answer: 'FUNCTIONAL DEPENDENCY' },
      { text: 'A non-key attribute depends on another non-key attribute.', answer: 'TRANSITIVE DEPENDENCY' },
    ],
    options: ['PRIMARY KEY', 'FUNCTIONAL DEPENDENCY', 'TRANSITIVE DEPENDENCY', 'COMPOSITE KEY'],
  },
  successCondition: 'Correctly match all 3 definitions',
  hints: {
    level1: 'PRIMARY KEY = identity of a row.',
    level2: 'FUNCTIONAL DEPENDENCY = A → B.',
    level3: 'TRANSITIVE DEPENDENCY = Key → A → B (A is a non-key attribute).',
  },
  successFeedback: 'All rules understood. You are ready to apply normalization.',
  xpReward: 100, healthChange: 10,
},

// ═══════════════════════════ WORLD 3 — 1NF ═══════════════════════════════════
{
  id: 18, worldId: 3, worldName: '1NF',
  title: 'Multiple Values',
  missionText: 'Ram has three courses in one cell. Fix it — split into separate rows.',
  storyBriefing: [
    '⚠ ATOMICITY VIOLATION DETECTED',
    '',
    'This table stores multiple courses in a single cell.',
    '',
    'Student_ID | Courses',
    '101        | C01, C02, C03',
    '',
    'A cell should hold ONE value, not a list.',
    '',
    'Split the row into separate rows.',
  ],
  challengeType: 'FIX_ATOMICITY',
  initialTables: [{
    id: 'student_courses', name: 'STUDENT_COURSES', primaryKey: [],
    columns: [{ name: 'Student_ID' }, { name: 'Student_Name' }, { name: 'Courses' }],
    rows: [
      { Student_ID: 101, Student_Name: 'Ram', Courses: 'C01, C02, C03' },
      { Student_ID: 102, Student_Name: 'Sita', Courses: 'C01' },
    ],
  }],
  task: {
    targetCell: { rowIndex: 0, column: 'Courses' },
    splitValues: ['C01', 'C02', 'C03'],
    expectedRows: [
      { Student_ID: 101, Student_Name: 'Ram', Courses: 'C01' },
      { Student_ID: 101, Student_Name: 'Ram', Courses: 'C02' },
      { Student_ID: 101, Student_Name: 'Ram', Courses: 'C03' },
      { Student_ID: 102, Student_Name: 'Sita', Courses: 'C01' },
    ],
  },
  successCondition: 'Each cell contains exactly one value',
  hints: {
    level1: 'Click the cell that contains "C01, C02, C03".',
    level2: 'The values need to be in separate rows, not one cell.',
    level3: 'Split the row into 3 rows: one for C01, one for C02, one for C03.',
  },
  successFeedback: 'Each cell now holds one value. This is the core rule of 1NF: every cell must be ATOMIC — one value only.',
  xpReward: 40, healthChange: 5,
  unlocksConcept: '1NF',
  conceptDefinition: 'First Normal Form (1NF): Every cell must contain a single, atomic value. No repeating groups, no lists in cells.',
  quickNote: '1NF: one value per cell, no lists.',
},

{
  id: 19, worldId: 3, worldName: '1NF',
  title: 'Atomic Values',
  missionText: 'Mark each value: ATOMIC or NOT ATOMIC.',
  storyBriefing: [
    'An ATOMIC value is a single, indivisible value.',
    '',
    'A list is NOT atomic.',
    'Multiple phone numbers in one cell is NOT atomic.',
    '',
    'Classify each value below.',
  ],
  challengeType: 'FIX_ATOMICITY',
  initialTables: [],
  task: {
    mode: 'classify',
    values: [
      { value: 'Ram', atomic: true },
      { value: '9800001, 9800002', atomic: false, reason: 'Two phone numbers in one cell.' },
      { value: 'BSc CSIT, BCA', atomic: false, reason: 'Multiple course names in one cell.' },
      { value: '101', atomic: true },
      { value: '1st', atomic: true },
      { value: 'C01\nC02\nC03', atomic: false, reason: 'Multiple values separated by newlines.' },
    ],
  },
  successCondition: 'Correctly classify all 6 values',
  hints: {
    level1: 'An atomic value cannot be split further.',
    level2: 'Any value with commas, slashes, or multiple items is NOT atomic.',
    level3: '"Ram" is atomic. "Ram, Sita" is not — it contains two names.',
  },
  successFeedback: 'Correct. Atomic values cannot be divided further. 1NF requires all cells to be atomic.',
  xpReward: 30, healthChange: 3,
  quickNote: 'Atomic = cannot be split further.',
},

{
  id: 20, worldId: 3, worldName: '1NF',
  title: 'Repeating Groups',
  missionText: 'This table has Course1, Course2, Course3 columns. Convert it to use rows instead.',
  storyBriefing: [
    '⚠ REPEATING COLUMN GROUP DETECTED',
    '',
    'This table has:',
    'Course1 | Course2 | Course3',
    '',
    'This is a repeating group.',
    'Instead of 3 columns, we need separate rows.',
    '',
    'Restructure the table.',
  ],
  challengeType: 'REMOVE_REPEATING',
  initialTables: [{
    id: 'repeated', name: 'STUDENT_COURSES', primaryKey: [],
    columns: [{ name: 'Student_ID' }, { name: 'Student_Name' }, { name: 'Course1' }, { name: 'Course2' }, { name: 'Course3' }],
    rows: [
      { Student_ID: 101, Student_Name: 'Ram', Course1: 'C01', Course2: 'C02', Course3: 'C03' },
      { Student_ID: 102, Student_Name: 'Sita', Course1: 'C01', Course2: null, Course3: null },
    ],
  }],
  task: {
    repeatingGroup: ['Course1', 'Course2', 'Course3'],
    expectedSchema: ['Student_ID', 'Student_Name', 'Course_ID'],
    expectedRows: [
      { Student_ID: 101, Student_Name: 'Ram', Course_ID: 'C01' },
      { Student_ID: 101, Student_Name: 'Ram', Course_ID: 'C02' },
      { Student_ID: 101, Student_Name: 'Ram', Course_ID: 'C03' },
      { Student_ID: 102, Student_Name: 'Sita', Course_ID: 'C01' },
    ],
  },
  successCondition: 'Convert repeating columns into separate rows',
  hints: {
    level1: 'Course1, Course2, Course3 should all be one column named Course_ID.',
    level2: 'Each course becomes its own row.',
    level3: 'Ram has 3 courses → 3 rows. Sita has 1 course → 1 row.',
  },
  successFeedback: 'Repeating column groups removed. 1NF requires no repeating groups — each course is now its own row.',
  xpReward: 40, healthChange: 5,
  quickNote: 'Repeating columns → separate rows.',
},

{
  id: 21, worldId: 3, worldName: '1NF',
  title: '1NF Repair',
  missionText: 'Fix all 1NF violations in this table.',
  storyBriefing: [
    'This table has multiple 1NF problems.',
    '',
    'Find and fix all of them.',
    '',
    '1NF Checklist:',
    '✗ No lists in cells',
    '✗ No repeating columns',
    '✗ One value per cell',
  ],
  challengeType: 'FIX_ATOMICITY',
  initialTables: [{
    id: 'broken1nf', name: 'LIBRARY', primaryKey: [],
    columns: [{ name: 'Student_ID' }, { name: 'Student_Name' }, { name: 'Books_Borrowed' }],
    rows: [
      { Student_ID: 201, Student_Name: 'Anita', Books_Borrowed: 'Book1, Book2, Book3' },
      { Student_ID: 202, Student_Name: 'Binod', Books_Borrowed: 'Book1' },
    ],
  }],
  task: {
    targetCell: { rowIndex: 0, column: 'Books_Borrowed' },
    splitValues: ['Book1', 'Book2', 'Book3'],
    expectedRows: [
      { Student_ID: 201, Student_Name: 'Anita', Books_Borrowed: 'Book1' },
      { Student_ID: 201, Student_Name: 'Anita', Books_Borrowed: 'Book2' },
      { Student_ID: 201, Student_Name: 'Anita', Books_Borrowed: 'Book3' },
      { Student_ID: 202, Student_Name: 'Binod', Books_Borrowed: 'Book1' },
    ],
  },
  successCondition: 'Split the multi-value cell into separate rows',
  hints: {
    level1: 'Click the cell with multiple books.',
    level2: 'Anita borrowed 3 books — that should be 3 rows.',
    level3: 'One row per book borrowing.',
  },
  successFeedback: 'Library table is now in 1NF. Each cell holds one value.',
  xpReward: 40, healthChange: 5,
  quickNote: 'Each book borrowing = one row.',
},

{
  id: 22, worldId: 3, worldName: '1NF',
  title: '1NF Live Check',
  missionText: 'Modify the table until the 1NF status panel shows all green.',
  storyBriefing: [
    'The 1NF Status panel on the right updates live.',
    '',
    'Fix each issue until all indicators show ✓.',
  ],
  challengeType: 'FIX_ATOMICITY',
  initialTables: [{
    id: 'live1nf', name: 'ORDERS', primaryKey: [],
    columns: [{ name: 'Order_ID' }, { name: 'Customer' }, { name: 'Products' }],
    rows: [
      { Order_ID: 1, Customer: 'Ram', Products: 'Pen, Notebook' },
      { Order_ID: 2, Customer: 'Sita', Products: 'Ruler' },
    ],
  }],
  task: {
    liveChecks: true,
    targetCell: { rowIndex: 0, column: 'Products' },
    splitValues: ['Pen', 'Notebook'],
  },
  successCondition: 'All 1NF checks pass',
  hints: {
    level1: 'Click the Products cell with multiple items.',
    level2: '"Pen, Notebook" is not atomic — split into two rows.',
    level3: 'Each order row should have one product.',
  },
  successFeedback: '1NF STATUS: ALL GREEN. The table is now in First Normal Form.',
  xpReward: 40, healthChange: 5,
  quickNote: 'Watch the status panel as you fix the table.',
},

{
  id: 23, worldId: 3, worldName: '1NF',
  title: '1NF Practice: Hospital',
  missionText: 'Convert this hospital table to 1NF.',
  storyBriefing: [
    'A hospital database has this table:',
    '',
    'Patient_ID | Patient_Name | Diagnoses',
    '',
    'Diagnoses contains multiple values.',
    '',
    'Convert to 1NF.',
  ],
  challengeType: 'FIX_ATOMICITY',
  initialTables: [{
    id: 'hospital', name: 'PATIENTS', primaryKey: [],
    columns: [{ name: 'Patient_ID' }, { name: 'Patient_Name' }, { name: 'Diagnoses' }],
    rows: [
      { Patient_ID: 301, Patient_Name: 'Arjun', Diagnoses: 'Flu, Fever' },
      { Patient_ID: 302, Patient_Name: 'Kavya', Diagnoses: 'Cold' },
    ],
  }],
  task: {
    targetCell: { rowIndex: 0, column: 'Diagnoses' },
    splitValues: ['Flu', 'Fever'],
  },
  successCondition: 'Split the multi-diagnosis row into separate rows',
  hints: {
    level1: 'Click the Diagnoses cell with multiple values.',
    level2: '"Flu, Fever" should become two separate rows.',
    level3: 'Arjun has two diagnoses → two rows.',
  },
  successFeedback: 'Hospital table is in 1NF. Each diagnosis is now its own row.',
  xpReward: 30, healthChange: 3,
  quickNote: 'One diagnosis per row.',
},

{
  id: 24, worldId: 3, worldName: '1NF',
  isBoss: true,
  title: '⚔ 1NF BOSS',
  missionText: 'Independently convert this entire table to 1NF. No step-by-step guide.',
  storyBriefing: [
    '⚔ 1NF BOSS LEVEL',
    '',
    'This e-commerce table has multiple 1NF violations.',
    '',
    'Find and fix all of them independently.',
    '',
    'Hint button is available if needed.',
  ],
  challengeType: 'FIX_ATOMICITY',
  initialTables: [{
    id: 'ecommerce', name: 'ORDERS', primaryKey: [],
    columns: [{ name: 'Order_ID' }, { name: 'Customer' }, { name: 'Items' }, { name: 'Item1' }, { name: 'Item2' }],
    rows: [
      { Order_ID: 1001, Customer: 'Ram', Items: 'Pen, Book', Item1: 'Pen', Item2: 'Book' },
      { Order_ID: 1002, Customer: 'Sita', Items: 'Ruler', Item1: 'Ruler', Item2: null },
    ],
  }],
  task: {
    bossMode: true,
    violations: [
      { type: 'atomicity', column: 'Items', rowIndex: 0 },
      { type: 'repeating_group', columns: ['Item1', 'Item2'] },
    ],
    successCriteria: 'No multi-value cells, no repeating column groups',
  },
  successCondition: 'Table is in 1NF (atomic values, no repeating groups)',
  hints: {
    level1: 'There are two different 1NF violations here.',
    level2: 'One is a comma-separated list. The other is repeating columns (Item1, Item2).',
    level3: 'Fix Items (split into rows), then merge Item1 and Item2 into one column.',
  },
  successFeedback: '1NF BOSS DEFEATED. Table is fully in First Normal Form.',
  xpReward: 150, healthChange: 10,
},

// ════════════════════════════ WORLD 4 — 2NF ═══════════════════════════════════
{
  id: 25, worldId: 4, worldName: '2NF',
  title: 'Composite Key Returns',
  missionText: 'Confirm the composite key of the ENROLLMENT table.',
  storyBriefing: [
    'The ENROLLMENT table is in 1NF.',
    '',
    'Now identify its key.',
    '',
    'Which columns together uniquely identify each row?',
  ],
  challengeType: 'SELECT_COMPOSITE_KEY',
  initialTables: [{
    id: 'enrollment', name: 'ENROLLMENT', primaryKey: [],
    columns: [{ name: 'Student_ID' }, { name: 'Course_ID' }, { name: 'Student_Name' }, { name: 'Course_Name' }, { name: 'Semester' }],
    rows: [
      { Student_ID: 101, Course_ID: 'C01', Student_Name: 'Ram', Course_Name: 'BSc CSIT', Semester: 1 },
      { Student_ID: 101, Course_ID: 'C02', Student_Name: 'Ram', Course_Name: 'BCA', Semester: 1 },
      { Student_ID: 102, Course_ID: 'C01', Student_Name: 'Sita', Course_Name: 'BSc CSIT', Semester: 2 },
    ],
  }],
  task: { correctComposite: ['Student_ID', 'Course_ID'] },
  successCondition: 'Select Student_ID + Course_ID as the composite key',
  hints: {
    level1: 'Ram appears twice. So Student_ID alone is not unique.',
    level2: 'C01 appears twice. So Course_ID alone is not unique.',
    level3: 'Student_ID + Course_ID together are always unique.',
  },
  successFeedback: 'Composite key confirmed: Student_ID + Course_ID. Now let\'s check if all attributes depend on the FULL key.',
  xpReward: 30, healthChange: 3,
  quickNote: 'Composite Key = Student_ID + Course_ID',
},

{
  id: 26, worldId: 4, worldName: '2NF',
  title: 'Who Owns This Fact?',
  missionText: 'Does Student_Name need Course_ID to be identified?',
  storyBriefing: [
    'The composite key is Student_ID + Course_ID.',
    '',
    'But does Student_Name need BOTH parts of the key?',
    '',
    'If I know only Student_ID = 101,',
    'can I always find Student_Name = "Ram"?',
    '',
    'Answer: YES or NO.',
  ],
  challengeType: 'IDENTIFY_DEPENDENCY',
  initialTables: [{
    id: 'enrollment', name: 'ENROLLMENT', primaryKey: ['Student_ID', 'Course_ID'],
    columns: [{ name: 'Student_ID', isCompositeKey: true }, { name: 'Course_ID', isCompositeKey: true }, { name: 'Student_Name' }, { name: 'Course_Name' }, { name: 'Semester' }],
    rows: [
      { Student_ID: 101, Course_ID: 'C01', Student_Name: 'Ram', Course_Name: 'BSc CSIT', Semester: 1 },
      { Student_ID: 101, Course_ID: 'C02', Student_Name: 'Ram', Course_Name: 'BCA', Semester: 1 },
    ],
  }],
  task: {
    mode: 'yes_no',
    question: 'Does knowing Student_ID = 101 (without Course_ID) always tell you Student_Name?',
    answer: true,
    explanation: 'Yes — Student_ID alone determines Student_Name. This means Student_Name has a PARTIAL DEPENDENCY on the composite key.',
  },
  successCondition: 'Answer YES correctly',
  hints: {
    level1: 'Look at the table. Ram (101) appears in every row for Student_ID 101.',
    level2: 'Ram is always Ram, regardless of which course he takes.',
    level3: 'Student_ID alone determines Student_Name. Course_ID is irrelevant for this.',
  },
  successFeedback: 'Correct. Student_ID alone determines Student_Name. Student_Name does NOT need Course_ID. This is a PARTIAL DEPENDENCY.',
  xpReward: 40, healthChange: 5,
  unlocksConcept: 'PARTIAL DEPENDENCY',
  conceptDefinition: 'A Partial Dependency exists when a non-key attribute depends on only PART of a composite key, not the full key.',
  quickNote: 'If Student_ID alone determines it → partial dependency.',
},

{
  id: 27, worldId: 4, worldName: '2NF',
  title: 'Find All Partial Dependencies',
  missionText: 'Identify all attributes that partially depend on the composite key.',
  storyBriefing: [
    'Composite key: Student_ID + Course_ID',
    '',
    'Check each non-key attribute:',
    'Does it need the FULL key, or just part of it?',
  ],
  challengeType: 'IDENTIFY_DEPENDENCY',
  initialTables: [],
  task: {
    compositeKey: ['Student_ID', 'Course_ID'],
    attributes: [
      { name: 'Student_Name', partialDep: true, determinant: 'Student_ID', explanation: 'Student_Name depends only on Student_ID.' },
      { name: 'Course_Name', partialDep: true, determinant: 'Course_ID', explanation: 'Course_Name depends only on Course_ID.' },
      { name: 'Semester', partialDep: false, explanation: 'Semester depends on the full combination of Student_ID + Course_ID — when a student takes a course.' },
    ],
    mode: 'classify_partial',
  },
  successCondition: 'Correctly identify Student_Name and Course_Name as partial dependencies',
  hints: {
    level1: 'Does Student_Name change when Course_ID changes? No — so it only depends on Student_ID.',
    level2: 'Does Semester exist without both a student and a course? No — so it depends on the full key.',
    level3: 'Partial: Student_Name (→ Student_ID only), Course_Name (→ Course_ID only). Full: Semester.',
  },
  successFeedback: 'Partial dependencies found: Student_Name → Student_ID only. Course_Name → Course_ID only. Both must be moved to their own tables.',
  xpReward: 40, healthChange: 5,
  quickNote: 'Partial dep = attribute that only needs part of the key.',
},

{
  id: 28, worldId: 4, worldName: '2NF',
  title: 'Course Dependencies',
  missionText: 'Which attributes depend only on Course_ID?',
  storyBriefing: [
    'Now check the Course side.',
    '',
    'Composite key: Student_ID + Course_ID',
    '',
    'Does Course_Name need Student_ID?',
    'Does Instructor need Student_ID?',
    '',
    'Click all attributes that depend ONLY on Course_ID.',
  ],
  challengeType: 'IDENTIFY_DEPENDENCY',
  initialTables: [{
    id: 'enrollment', name: 'ENROLLMENT', primaryKey: ['Student_ID', 'Course_ID'],
    columns: [{ name: 'Student_ID', isCompositeKey: true }, { name: 'Course_ID', isCompositeKey: true }, { name: 'Student_Name' }, { name: 'Course_Name' }, { name: 'Instructor' }, { name: 'Semester' }],
    rows: [
      { Student_ID: 101, Course_ID: 'C01', Student_Name: 'Ram', Course_Name: 'BSc CSIT', Instructor: 'Mr. Shah', Semester: 1 },
      { Student_ID: 102, Course_ID: 'C01', Student_Name: 'Sita', Course_Name: 'BSc CSIT', Instructor: 'Mr. Shah', Semester: 2 },
    ],
  }],
  task: {
    mode: 'select_columns',
    question: 'Select all columns that depend ONLY on Course_ID (not on Student_ID):',
    correctColumns: ['Course_Name', 'Instructor'],
    wrongColumns: { Student_Name: 'Student_Name depends on Student_ID, not Course_ID.', Semester: 'Semester depends on both — when a student takes the course.' },
  },
  successCondition: 'Select Course_Name and Instructor',
  hints: {
    level1: 'Does Course_Name change when the student changes? No — it belongs to the course.',
    level2: 'Does Instructor change when the student changes? No — the instructor teaches the course regardless.',
    level3: 'Course_Name and Instructor both depend only on Course_ID.',
  },
  successFeedback: 'Correct. Course_Name and Instructor depend only on Course_ID, not on the student. They have partial dependencies.',
  xpReward: 30, healthChange: 3,
  quickNote: 'Course attributes belong to the course, not the enrollment.',
},

{
  id: 29, worldId: 4, worldName: '2NF',
  title: 'Split the Table',
  missionText: 'Drag each column into its correct table: STUDENT, COURSE, or ENROLLMENT.',
  storyBriefing: [
    'To achieve 2NF, we must remove all partial dependencies.',
    '',
    'Each attribute should go to the table it actually belongs to.',
    '',
    'Drag each column into the correct table.',
  ],
  challengeType: 'SPLIT_TABLE',
  initialTables: [{
    id: 'enrollment_full', name: 'ENROLLMENT (Unnormalized)', primaryKey: ['Student_ID', 'Course_ID'],
    columns: [
      { name: 'Student_ID', isCompositeKey: true }, { name: 'Course_ID', isCompositeKey: true },
      { name: 'Student_Name' }, { name: 'Course_Name' }, { name: 'Instructor' }, { name: 'Semester' },
    ],
    rows: [],
  }],
  task: {
    targetTables: [
      { name: 'STUDENT', expectedColumns: ['Student_ID', 'Student_Name'], key: 'Student_ID' },
      { name: 'COURSE', expectedColumns: ['Course_ID', 'Course_Name', 'Instructor'], key: 'Course_ID' },
      { name: 'ENROLLMENT', expectedColumns: ['Student_ID', 'Course_ID', 'Semester'], key: 'Student_ID+Course_ID' },
    ],
  },
  successCondition: 'All columns placed in their correct tables',
  hints: {
    level1: 'Student_ID and Student_Name describe the student — put them in STUDENT.',
    level2: 'Course_ID, Course_Name, and Instructor describe the course — put them in COURSE.',
    level3: 'Semester only makes sense when a student takes a course — it belongs in ENROLLMENT.',
  },
  successFeedback: 'Tables split correctly. Partial dependencies eliminated. This is 2NF.',
  xpReward: 60, healthChange: 8,
  unlocksConcept: '2NF',
  conceptDefinition: 'Second Normal Form (2NF): Already in 1NF. Remove all partial dependencies — every non-key attribute must depend on the FULL primary key.',
  quickNote: '2NF = 1NF + no partial dependencies.',
},

{
  id: 30, worldId: 4, worldName: '2NF',
  title: '2NF Live Check',
  missionText: 'Move the partial dependencies to fix the 2NF status.',
  storyBriefing: [
    'The 2NF checker is live.',
    '',
    'The problem column is shown.',
    '',
    'Move it to the correct table to fix the issue.',
  ],
  challengeType: 'SPLIT_TABLE',
  initialTables: [{
    id: 'enrollment2nf', name: 'ENROLLMENT', primaryKey: ['Student_ID', 'Course_ID'],
    columns: [
      { name: 'Student_ID', isCompositeKey: true }, { name: 'Course_ID', isCompositeKey: true },
      { name: 'Student_Name' }, { name: 'Semester' },
    ],
    rows: [
      { Student_ID: 101, Course_ID: 'C01', Student_Name: 'Ram', Semester: 1 },
    ],
  }],
  task: {
    liveChecks: true,
    partialDep: { column: 'Student_Name', onlyDependsOn: 'Student_ID' },
    targetTables: [
      { name: 'STUDENT', expectedColumns: ['Student_ID', 'Student_Name'] },
      { name: 'ENROLLMENT', expectedColumns: ['Student_ID', 'Course_ID', 'Semester'] },
    ],
  },
  successCondition: 'Move Student_Name to STUDENT table — 2NF status turns green',
  hints: {
    level1: 'The live checker shows Student_Name as a partial dependency problem.',
    level2: 'Student_Name belongs to the STUDENT table, not ENROLLMENT.',
    level3: 'Drag Student_Name to the STUDENT table.',
  },
  successFeedback: '2NF ACHIEVED. Partial dependency removed. Status: GREEN.',
  xpReward: 40, healthChange: 5,
  quickNote: 'Watch the status update as you move columns.',
},

{
  id: 31, worldId: 4, worldName: '2NF',
  title: 'Wrong Repair',
  missionText: 'This decomposition claims to be 2NF. Find the remaining problem.',
  storyBriefing: [
    'Someone tried to convert to 2NF.',
    '',
    'They moved some columns, but left a problem behind.',
    '',
    'Inspect the COURSE table and find the remaining partial dependency.',
  ],
  challengeType: 'IDENTIFY_DEPENDENCY',
  initialTables: [
    {
      id: 'student2', name: 'STUDENT', primaryKey: ['Student_ID'],
      columns: [{ name: 'Student_ID', isPrimaryKey: true }, { name: 'Student_Name' }],
      rows: [{ Student_ID: 101, Student_Name: 'Ram' }],
    },
    {
      id: 'course_wrong', name: 'COURSE', primaryKey: ['Course_ID'],
      columns: [{ name: 'Course_ID', isPrimaryKey: true }, { name: 'Course_Name' }, { name: 'Instructor' }, { name: 'Instructor_Phone' }],
      rows: [{ Course_ID: 'C01', Course_Name: 'BSc CSIT', Instructor: 'Mr. Shah', Instructor_Phone: '9800001' }],
    },
    {
      id: 'enrollment2', name: 'ENROLLMENT', primaryKey: ['Student_ID', 'Course_ID'],
      columns: [{ name: 'Student_ID', isCompositeKey: true }, { name: 'Course_ID', isCompositeKey: true }, { name: 'Semester' }],
      rows: [{ Student_ID: 101, Course_ID: 'C01', Semester: 1 }],
    },
  ],
  task: {
    mode: 'find_remaining',
    problem: 'Instructor_Phone in the COURSE table depends on Instructor, not on Course_ID.',
    targetColumn: 'Instructor_Phone',
    targetTable: 'COURSE',
    issueType: 'TRANSITIVE DEPENDENCY',
  },
  successCondition: 'Identify Instructor_Phone as the remaining problem',
  hints: {
    level1: 'Look at the COURSE table. Does everything there directly describe the course?',
    level2: 'Instructor_Phone — does it describe the course, or the instructor?',
    level3: 'Instructor_Phone depends on Instructor (not Course_ID). This is still a dependency problem.',
  },
  successFeedback: 'Found it. Instructor_Phone depends on Instructor, not Course_ID. This is a TRANSITIVE DEPENDENCY — not a 2NF issue, but it will need to be fixed in 3NF.',
  xpReward: 40, healthChange: 5,
  quickNote: 'Not all dependency problems are partial dependencies.',
},

{
  id: 32, worldId: 4, worldName: '2NF',
  isBoss: true,
  title: '⚔ 2NF BOSS',
  missionText: 'Convert this ORDER table to 2NF independently.',
  storyBriefing: [
    '⚔ 2NF BOSS LEVEL',
    '',
    'A new database. A new scenario.',
    '',
    'ORDER table:',
    'Order_ID + Product_ID → composite key',
    'Product_Name, Customer_Name, Quantity also present.',
    '',
    'Find partial dependencies and split the table.',
  ],
  challengeType: 'SPLIT_TABLE',
  initialTables: [{
    id: 'orders_boss', name: 'ORDER_ITEMS', primaryKey: ['Order_ID', 'Product_ID'],
    columns: [
      { name: 'Order_ID', isCompositeKey: true }, { name: 'Product_ID', isCompositeKey: true },
      { name: 'Customer_Name' }, { name: 'Product_Name' }, { name: 'Quantity' },
    ],
    rows: [
      { Order_ID: 1, Product_ID: 'P01', Customer_Name: 'Ram', Product_Name: 'Pen', Quantity: 2 },
      { Order_ID: 1, Product_ID: 'P02', Customer_Name: 'Ram', Product_Name: 'Notebook', Quantity: 1 },
      { Order_ID: 2, Product_ID: 'P01', Customer_Name: 'Sita', Product_Name: 'Pen', Quantity: 3 },
    ],
  }],
  task: {
    bossMode: true,
    targetTables: [
      { name: 'ORDER', expectedColumns: ['Order_ID', 'Customer_Name'], key: 'Order_ID' },
      { name: 'PRODUCT', expectedColumns: ['Product_ID', 'Product_Name'], key: 'Product_ID' },
      { name: 'ORDER_ITEMS', expectedColumns: ['Order_ID', 'Product_ID', 'Quantity'], key: 'Order_ID+Product_ID' },
    ],
  },
  successCondition: 'Split into ORDER, PRODUCT, and ORDER_ITEMS tables',
  hints: {
    level1: 'Find the composite key first: Order_ID + Product_ID.',
    level2: 'Customer_Name belongs to the Order (depends only on Order_ID).',
    level3: 'Product_Name belongs to the Product (depends only on Product_ID). Quantity depends on both.',
  },
  successFeedback: '2NF BOSS DEFEATED. All partial dependencies eliminated.',
  xpReward: 150, healthChange: 10,
},

// ════════════════════════════ WORLD 5 — 3NF ═══════════════════════════════════
{
  id: 33, worldId: 5, worldName: '3NF',
  title: 'The Hidden Chain',
  missionText: 'Trace the dependency chain in the COURSE table.',
  storyBriefing: [
    'The COURSE table is in 2NF.',
    'But a hidden problem remains.',
    '',
    'Look at these attributes:',
    'Course_ID | Course_Name | Instructor | Instructor_Phone',
    '',
    'Trace the dependency chain.',
  ],
  challengeType: 'CONNECT_DEPENDENCY',
  initialTables: [{
    id: 'course3nf', name: 'COURSE', primaryKey: ['Course_ID'],
    columns: [{ name: 'Course_ID', isPrimaryKey: true }, { name: 'Course_Name' }, { name: 'Instructor' }, { name: 'Instructor_Phone' }],
    rows: [
      { Course_ID: 'C01', Course_Name: 'BSc CSIT', Instructor: 'Mr. Shah', Instructor_Phone: '9800001' },
      { Course_ID: 'C02', Course_Name: 'BCA', Instructor: 'Ms. Karki', Instructor_Phone: '9800002' },
    ],
  }],
  task: {
    chainMode: true,
    correctChain: ['Course_ID', 'Instructor', 'Instructor_Phone'],
  },
  successCondition: 'Trace: Course_ID → Instructor → Instructor_Phone',
  hints: {
    level1: 'Start with Course_ID.',
    level2: 'Course_ID determines who the Instructor is.',
    level3: 'The Instructor determines their phone number.',
  },
  successFeedback: 'Chain traced: Course_ID → Instructor → Instructor_Phone. Instructor_Phone is not directly described by Course_ID.',
  xpReward: 30, healthChange: 3,
  quickNote: 'A → B → C: B is in the middle.',
},

{
  id: 34, worldId: 5, worldName: '3NF',
  title: 'Find the Middle',
  missionText: 'Which attribute sits between Course_ID and Instructor_Phone in the dependency chain?',
  storyBriefing: [
    'Course_ID → ? → Instructor_Phone',
    '',
    'Which attribute is in the middle?',
    '',
    'Click it.',
  ],
  challengeType: 'SELECT_KEY',
  initialTables: [{
    id: 'course3nf2', name: 'COURSE', primaryKey: ['Course_ID'],
    columns: [{ name: 'Course_ID', isPrimaryKey: true }, { name: 'Course_Name' }, { name: 'Instructor' }, { name: 'Instructor_Phone' }],
    rows: [{ Course_ID: 'C01', Course_Name: 'BSc CSIT', Instructor: 'Mr. Shah', Instructor_Phone: '9800001' }],
  }],
  task: {
    mode: 'select_middle',
    question: 'Which attribute is the "middle" in: Course_ID → ? → Instructor_Phone?',
    correctAnswer: 'Instructor',
  },
  successCondition: 'Click Instructor',
  hints: {
    level1: 'Course_ID tells you who teaches the course.',
    level2: 'The teacher has a phone number.',
    level3: 'The teacher (Instructor) is the middle step.',
  },
  successFeedback: 'Instructor is the middle link. Instructor_Phone depends on Instructor, not directly on Course_ID.',
  xpReward: 30, healthChange: 3,
  quickNote: 'The middle attribute is where the transitive dependency lives.',
},

{
  id: 35, worldId: 5, worldName: '3NF',
  title: 'Transitive Dependency',
  missionText: 'Confirm: is this a transitive dependency?',
  storyBriefing: [
    'Course_ID → Instructor → Instructor_Phone',
    '',
    'Instructor_Phone describes the Instructor.',
    'Not the Course.',
    '',
    'This is a non-key attribute determining another non-key attribute.',
    '',
    'What is this called?',
  ],
  challengeType: 'IDENTIFY_DEPENDENCY',
  initialTables: [],
  task: {
    mode: 'single_choice',
    question: 'Course_ID → Instructor → Instructor_Phone. What type of dependency is this?',
    options: [
      { label: 'TRANSITIVE DEPENDENCY — a non-key attribute (Instructor) determines another non-key attribute (Instructor_Phone)', correct: true },
      { label: 'PARTIAL DEPENDENCY — Instructor_Phone only depends on part of the composite key', correct: false, hint: 'There is no composite key here. COURSE has Course_ID as its single primary key.' },
      { label: 'DIRECT DEPENDENCY — Instructor_Phone directly describes the course', correct: false, hint: 'Instructor_Phone describes the Instructor, not the Course itself.' },
    ],
  },
  successCondition: 'Select TRANSITIVE DEPENDENCY',
  hints: {
    level1: 'Is Instructor a key attribute or a non-key attribute?',
    level2: 'Instructor is non-key. Instructor_Phone is non-key. One non-key determines another.',
    level3: 'Key → non-key A → non-key B = TRANSITIVE DEPENDENCY.',
  },
  successFeedback: 'Correct. Instructor is a non-key attribute that determines Instructor_Phone. This is a TRANSITIVE DEPENDENCY.',
  xpReward: 40, healthChange: 5,
  quickNote: 'Transitive = non-key determines another non-key.',
},

{
  id: 36, worldId: 5, worldName: '3NF',
  title: 'Break the Chain',
  missionText: 'Split the COURSE table to remove the transitive dependency.',
  storyBriefing: [
    'To fix the transitive dependency:',
    '',
    'Instructor and Instructor_Phone should go',
    'into their own INSTRUCTOR table.',
    '',
    'Drag the columns to the correct tables.',
  ],
  challengeType: 'SPLIT_TABLE',
  initialTables: [{
    id: 'course_trans', name: 'COURSE', primaryKey: ['Course_ID'],
    columns: [{ name: 'Course_ID', isPrimaryKey: true }, { name: 'Course_Name' }, { name: 'Instructor' }, { name: 'Instructor_Phone' }],
    rows: [{ Course_ID: 'C01', Course_Name: 'BSc CSIT', Instructor: 'Mr. Shah', Instructor_Phone: '9800001' }],
  }],
  task: {
    targetTables: [
      { name: 'COURSE', expectedColumns: ['Course_ID', 'Course_Name', 'Instructor_ID'], key: 'Course_ID' },
      { name: 'INSTRUCTOR', expectedColumns: ['Instructor_ID', 'Instructor_Name', 'Instructor_Phone'], key: 'Instructor_ID' },
    ],
    foreignKey: { from: 'COURSE.Instructor_ID', to: 'INSTRUCTOR.Instructor_ID' },
  },
  successCondition: 'Separate Instructor data into its own table with a foreign key',
  hints: {
    level1: 'Instructor_Phone belongs to the Instructor, not the Course.',
    level2: 'Create a new INSTRUCTOR table with Instructor_ID, Instructor_Name, and Instructor_Phone.',
    level3: 'Keep Instructor_ID as a reference (foreign key) in COURSE.',
  },
  successFeedback: 'Transitive dependency eliminated. COURSE now references INSTRUCTOR via Instructor_ID.',
  xpReward: 60, healthChange: 8,
  unlocksConcept: '3NF',
  conceptDefinition: 'Third Normal Form (3NF): Already in 2NF. Remove all transitive dependencies — every non-key attribute must depend ONLY on the primary key.',
  quickNote: '3NF = 2NF + no transitive dependencies.',
},

{
  id: 37, worldId: 5, worldName: '3NF',
  title: '3NF Live Check',
  missionText: 'Move Instructor data to its own table to achieve 3NF.',
  storyBriefing: [
    'The 3NF status is live.',
    '',
    '1NF ✓',
    '2NF ✓',
    'Transitive Dependency ✗',
    '3NF LOCKED',
    '',
    'Fix the transitive dependency.',
  ],
  challengeType: 'SPLIT_TABLE',
  initialTables: [{
    id: 'course_live3nf', name: 'COURSE', primaryKey: ['Course_ID'],
    columns: [{ name: 'Course_ID', isPrimaryKey: true }, { name: 'Course_Name' }, { name: 'Instructor' }, { name: 'Instructor_Phone' }],
    rows: [{ Course_ID: 'C01', Course_Name: 'BSc CSIT', Instructor: 'Mr. Shah', Instructor_Phone: '9800001' }],
  }],
  task: {
    liveChecks: true,
    liveNormStatus: true,
    targetTables: [
      { name: 'COURSE', expectedColumns: ['Course_ID', 'Course_Name', 'Instructor_ID'] },
      { name: 'INSTRUCTOR', expectedColumns: ['Instructor_ID', 'Instructor_Name', 'Instructor_Phone'] },
    ],
  },
  successCondition: '3NF status turns green',
  hints: {
    level1: 'The problem is Instructor_Phone — it depends on Instructor, not Course_ID.',
    level2: 'Move Instructor and Instructor_Phone to a new INSTRUCTOR table.',
    level3: 'Add Instructor_ID as a foreign key in COURSE.',
  },
  successFeedback: '3NF ACHIEVED. 1NF ✓ 2NF ✓ 3NF ✓',
  xpReward: 50, healthChange: 5,
  quickNote: 'Watch the normalization status update live.',
},

{
  id: 38, worldId: 5, worldName: '3NF',
  title: 'New 3NF Puzzle',
  missionText: 'Find the transitive dependency in this EMPLOYEE table.',
  storyBriefing: [
    'A new scenario. A company database.',
    '',
    'EMPLOYEE table:',
    'Employee_ID | Employee_Name | Department_ID | Department_Name | Manager',
    '',
    'Find the transitive dependency.',
  ],
  challengeType: 'IDENTIFY_DEPENDENCY',
  initialTables: [{
    id: 'employee', name: 'EMPLOYEE', primaryKey: ['Employee_ID'],
    columns: [{ name: 'Employee_ID', isPrimaryKey: true }, { name: 'Employee_Name' }, { name: 'Department_ID' }, { name: 'Department_Name' }, { name: 'Manager' }],
    rows: [
      { Employee_ID: 1, Employee_Name: 'Ram', Department_ID: 'D01', Department_Name: 'IT', Manager: 'Mr. Shah' },
      { Employee_ID: 2, Employee_Name: 'Sita', Department_ID: 'D01', Department_Name: 'IT', Manager: 'Mr. Shah' },
    ],
  }],
  task: {
    mode: 'select_columns',
    question: 'Which attributes depend on Department_ID (a non-key attribute), creating a transitive dependency?',
    correctColumns: ['Department_Name', 'Manager'],
    wrongColumns: { Employee_Name: 'Employee_Name directly describes the employee.' },
  },
  successCondition: 'Select Department_Name and Manager',
  hints: {
    level1: 'Does Department_Name change with Employee_ID? No — it belongs to the department.',
    level2: 'Manager of IT is always Mr. Shah, regardless of which employee.',
    level3: 'Department_Name and Manager depend on Department_ID (non-key), not Employee_ID (key).',
  },
  successFeedback: 'Correct. Department_Name and Manager depend on Department_ID, not Employee_ID. They should be moved to a DEPARTMENT table.',
  xpReward: 40, healthChange: 5,
  quickNote: 'Ask: "Does this attribute describe the entity or something else?"',
},

{
  id: 39, worldId: 5, worldName: '3NF',
  isBoss: true,
  title: '⚔ NORMALIZATION BOSS',
  missionText: 'Fully normalize the original university table from UNF to 3NF.',
  storyBriefing: [
    '⚔ NORMALIZATION BOSS LEVEL',
    '',
    'The original messy table is back.',
    '',
    'Normalize it completely:',
    'UNF → 1NF → 2NF → 3NF',
    '',
    'No step-by-step. Hints available.',
  ],
  challengeType: 'FULL_NORMALIZE',
  initialTables: [MESSY_TABLE],
  task: {
    stages: ['1NF', '2NF', '3NF'],
    expectedFinalTables: [
      { name: 'STUDENT', requiredColumns: ['Student_ID', 'Student_Name'] },
      { name: 'COURSE', requiredColumns: ['Course_ID', 'Course_Name', 'Instructor_ID'] },
      { name: 'INSTRUCTOR', requiredColumns: ['Instructor_ID', 'Instructor_Name', 'Instructor_Phone'] },
      { name: 'ENROLLMENT', requiredColumns: ['Student_ID', 'Course_ID', 'Semester'] },
    ],
  },
  successCondition: 'Produce 4 tables in 3NF',
  hints: {
    level1: 'Start: identify what repeats and what is mixed together.',
    level2: 'Split into groups: Student data, Course data, Instructor data, Enrollment data.',
    level3: 'Check: is Instructor_Phone in its own table? Is Semester in ENROLLMENT?',
  },
  successFeedback: 'NORMALIZATION BOSS DEFEATED. The university database is fully in 3NF. Four clean, well-structured tables.',
  xpReward: 250, healthChange: 15,
  unlocksConcept: 'FULL NORMALIZATION',
  conceptDefinition: 'A database in 3NF has: atomic values, no partial dependencies, and no transitive dependencies.',
},

// ════════════════════════ WORLD 6 — DATA INTEGRITY ═══════════════════════════
{
  id: 40, worldId: 6, worldName: 'DATA INTEGRITY',
  title: 'Entity Integrity',
  missionText: 'The structure is clean. But bad data can still enter. Reject the invalid record.',
  storyBriefing: [
    'STRUCTURE IS CLEAN.',
    '',
    'But a clean structure can still hold bad data.',
    '',
    '⚠ A new student record arrived:',
    '',
    'Student_ID: NULL | Student_Name: Hari',
    '',
    'Should the database accept this?',
  ],
  challengeType: 'INTEGRITY_JUDGE',
  initialTables: [{
    id: 'student_clean', name: 'STUDENT', primaryKey: ['Student_ID'],
    columns: [{ name: 'Student_ID', isPrimaryKey: true }, { name: 'Student_Name' }],
    rows: [{ Student_ID: 101, Student_Name: 'Ram' }, { Student_ID: 102, Student_Name: 'Sita' }],
  }],
  task: {
    incomingRecord: { Student_ID: null, Student_Name: 'Hari' },
    correctDecision: 'REJECT',
    reason: 'Primary Key cannot be NULL. Every row needs a unique identity.',
  },
  successCondition: 'Select REJECT',
  hints: {
    level1: 'How will the database identify Hari if there is no Student_ID?',
    level2: 'Two students could be named Hari — Student_ID is the identity.',
    level3: 'Primary Key cannot be NULL. This is Entity Integrity.',
  },
  successFeedback: 'REJECTED. A Primary Key cannot be NULL. This is ENTITY INTEGRITY — every row needs a valid unique identity.',
  xpReward: 30, healthChange: 5,
  unlocksConcept: 'ENTITY INTEGRITY',
  conceptDefinition: 'Entity Integrity: Every table must have a Primary Key. The Primary Key cannot be NULL or duplicated.',
  quickNote: 'Clean structure ≠ safe data.',
},

{
  id: 41, worldId: 6, worldName: 'DATA INTEGRITY',
  title: 'Referential Integrity',
  missionText: 'Enrollment refers to Student 999. Does Student 999 exist? Find the problem.',
  storyBriefing: [
    '⚠ ANOMALY IN ENROLLMENT',
    '',
    'An enrollment record references Student_ID: 999.',
    '',
    'Check the STUDENT table.',
    '',
    'Does Student 999 exist?',
  ],
  challengeType: 'FIND_VIOLATION',
  initialTables: [
    {
      id: 'student_ref', name: 'STUDENT', primaryKey: ['Student_ID'],
      columns: [{ name: 'Student_ID', isPrimaryKey: true }, { name: 'Student_Name' }],
      rows: [{ Student_ID: 101, Student_Name: 'Ram' }, { Student_ID: 102, Student_Name: 'Sita' }],
    },
    {
      id: 'enrollment_ref', name: 'ENROLLMENT', primaryKey: ['Student_ID', 'Course_ID'],
      columns: [{ name: 'Student_ID' }, { name: 'Course_ID' }, { name: 'Semester' }],
      rows: [
        { Student_ID: 101, Course_ID: 'C01', Semester: 1 },
        { Student_ID: 999, Course_ID: 'C02', Semester: 1 },
      ],
    },
  ],
  task: {
    targetTable: 'ENROLLMENT',
    targetRow: 1,
    targetColumn: 'Student_ID',
    violationType: 'REFERENTIAL',
    reason: 'Student_ID 999 does not exist in the STUDENT table.',
  },
  successCondition: 'Click the row with Student_ID = 999',
  hints: {
    level1: 'Look at the ENROLLMENT table. Which Student_ID does not appear in STUDENT?',
    level2: 'Student 999 is in ENROLLMENT but not in STUDENT.',
    level3: 'Click the row where Student_ID = 999.',
  },
  successFeedback: 'VIOLATION FOUND. Enrollment references Student 999, who does not exist. This is REFERENTIAL INTEGRITY — foreign keys must reference existing parent records.',
  xpReward: 40, healthChange: 5,
  unlocksConcept: 'REFERENTIAL INTEGRITY',
  conceptDefinition: 'Referential Integrity: A Foreign Key must always reference an existing record in the parent table.',
  quickNote: 'A reference to nothing is invalid.',
},

{
  id: 42, worldId: 6, worldName: 'DATA INTEGRITY',
  title: 'Domain Integrity',
  missionText: 'Semester = 15. The university only has semesters 1–8. Find and fix it.',
  storyBriefing: [
    '⚠ DOMAIN VIOLATION DETECTED',
    '',
    'An enrollment record has:',
    'Semester = 15',
    '',
    'The university only has semesters 1 through 8.',
    '',
    'Find the row and fix the value.',
  ],
  challengeType: 'FIND_VIOLATION',
  initialTables: [{
    id: 'enrollment_domain', name: 'ENROLLMENT', primaryKey: ['Student_ID', 'Course_ID'],
    columns: [{ name: 'Student_ID' }, { name: 'Course_ID' }, { name: 'Semester' }],
    rows: [
      { Student_ID: 101, Course_ID: 'C01', Semester: 1 },
      { Student_ID: 102, Course_ID: 'C02', Semester: 15 },
      { Student_ID: 103, Course_ID: 'C01', Semester: 3 },
    ],
  }],
  task: {
    targetTable: 'ENROLLMENT',
    targetRow: 1,
    targetColumn: 'Semester',
    violationType: 'DOMAIN',
    reason: 'Semester must be between 1 and 8.',
    allowEdit: true,
  },
  successCondition: 'Click the row with Semester = 15',
  hints: {
    level1: 'Which semester value is impossible?',
    level2: 'Valid semesters are 1 through 8. 15 is outside this range.',
    level3: 'Click the row where Semester = 15.',
  },
  successFeedback: 'VIOLATION FOUND. Semester 15 is outside the allowed domain (1–8). This is DOMAIN INTEGRITY — values must be within the allowed range.',
  xpReward: 30, healthChange: 5,
  unlocksConcept: 'DOMAIN INTEGRITY',
  conceptDefinition: 'Domain Integrity: Every value in a column must be valid — the right data type and within the allowed range.',
  quickNote: 'Domain = set of valid values for a column.',
},

{
  id: 43, worldId: 6, worldName: 'DATA INTEGRITY',
  title: 'Uniqueness',
  missionText: 'Two students share the same email. Find the duplicate.',
  storyBriefing: [
    '⚠ DUPLICATE VALUE DETECTED',
    '',
    'The system detected a duplicate email address.',
    '',
    'Two students should not share an email.',
    '',
    'Find the duplicate row.',
  ],
  challengeType: 'FIND_VIOLATION',
  initialTables: [{
    id: 'student_unique', name: 'STUDENT', primaryKey: ['Student_ID'],
    columns: [{ name: 'Student_ID', isPrimaryKey: true }, { name: 'Student_Name' }, { name: 'Email' }],
    rows: [
      { Student_ID: 101, Student_Name: 'Ram', Email: 'ram@example.com' },
      { Student_ID: 102, Student_Name: 'Sita', Email: 'sita@example.com' },
      { Student_ID: 103, Student_Name: 'Hari', Email: 'ram@example.com' },
    ],
  }],
  task: {
    targetTable: 'STUDENT',
    targetRow: 2,
    targetColumn: 'Email',
    violationType: 'UNIQUE',
    reason: 'ram@example.com is already used by Student 101.',
  },
  successCondition: 'Click the row with the duplicate email (Student 103)',
  hints: {
    level1: 'Look at the Email column. Which value appears twice?',
    level2: 'ram@example.com appears for both Student 101 and Student 103.',
    level3: 'Click Student 103\'s row — it introduced the duplicate.',
  },
  successFeedback: 'DUPLICATE FOUND. Two students cannot share the same email. This is UNIQUENESS — some columns must have distinct values.',
  xpReward: 30, healthChange: 5,
  unlocksConcept: 'UNIQUENESS',
  conceptDefinition: 'Uniqueness: Certain columns must not contain duplicate values. The UNIQUE constraint enforces this.',
  quickNote: 'Each email should belong to only one person.',
},

{
  id: 44, worldId: 6, worldName: 'DATA INTEGRITY',
  title: 'Parent Deletion',
  missionText: 'Delete Student 101 who has 2 enrollments. Choose the deletion rule.',
  storyBriefing: [
    'Student 101 (Ram) is being removed.',
    '',
    'But he has 2 active enrollments.',
    '',
    'What should happen to his enrollment records?',
    '',
    'Choose: RESTRICT, CASCADE, or SET NULL.',
  ],
  challengeType: 'CHOOSE_DELETE_RULE',
  initialTables: [
    {
      id: 'student_del', name: 'STUDENT', primaryKey: ['Student_ID'],
      columns: [{ name: 'Student_ID', isPrimaryKey: true }, { name: 'Student_Name' }],
      rows: [{ Student_ID: 101, Student_Name: 'Ram' }, { Student_ID: 102, Student_Name: 'Sita' }],
    },
    {
      id: 'enrollment_del', name: 'ENROLLMENT', primaryKey: ['Student_ID', 'Course_ID'],
      columns: [{ name: 'Student_ID' }, { name: 'Course_ID' }, { name: 'Semester' }],
      rows: [
        { Student_ID: 101, Course_ID: 'C01', Semester: 1 },
        { Student_ID: 101, Course_ID: 'C02', Semester: 1 },
        { Student_ID: 102, Course_ID: 'C01', Semester: 2 },
      ],
    },
  ],
  task: {
    parentTable: 'STUDENT', parentKey: 'Student_ID', parentValue: 101,
    childTable: 'ENROLLMENT', childKey: 'Student_ID',
    rules: {
      RESTRICT: 'Delete is blocked. Ram still has 2 active enrollments.',
      CASCADE: 'Ram is deleted. His 2 enrollment records are also automatically deleted.',
      'SET NULL': 'Ram is deleted. His enrollment records are kept, but Student_ID is set to NULL.',
    },
  },
  successCondition: 'Choose any deletion rule and observe the consequence',
  hints: {
    level1: 'RESTRICT prevents deletion when child records exist.',
    level2: 'CASCADE deletes the parent and all related children.',
    level3: 'SET NULL removes the parent but keeps children with a NULL reference.',
  },
  successFeedback: 'The deletion rule controls what happens to child records. This is part of Referential Integrity.',
  xpReward: 50, healthChange: 5,
  quickNote: 'RESTRICT = block. CASCADE = delete all. SET NULL = keep but disconnect.',
},

{
  id: 45, worldId: 6, worldName: 'DATA INTEGRITY',
  title: 'Integrity Detective',
  missionText: 'Find all integrity violations and identify which rule each one breaks.',
  storyBriefing: [
    '⚠ MULTIPLE INTEGRITY VIOLATIONS DETECTED',
    '',
    'Inspect both tables.',
    '',
    'For each violation, identify the rule:',
    'ENTITY / REFERENTIAL / DOMAIN / UNIQUE',
  ],
  challengeType: 'INTEGRITY_REPAIR',
  initialTables: [
    {
      id: 'student_detective', name: 'STUDENT', primaryKey: ['Student_ID'],
      columns: [{ name: 'Student_ID', isPrimaryKey: true }, { name: 'Student_Name' }, { name: 'Email' }],
      rows: [
        { Student_ID: 101, Student_Name: 'Ram', Email: 'ram@example.com' },
        { Student_ID: null, Student_Name: 'Hari', Email: 'hari@example.com' },
        { Student_ID: 103, Student_Name: 'Maya', Email: 'ram@example.com' },
      ],
    },
    {
      id: 'enrollment_detective', name: 'ENROLLMENT', primaryKey: ['Student_ID', 'Course_ID'],
      columns: [{ name: 'Student_ID' }, { name: 'Course_ID' }, { name: 'Semester' }],
      rows: [
        { Student_ID: 101, Course_ID: 'C01', Semester: 1 },
        { Student_ID: 999, Course_ID: 'C02', Semester: 2 },
        { Student_ID: 103, Course_ID: 'C01', Semester: 20 },
      ],
    },
  ],
  task: {
    violations: [
      { table: 'STUDENT', rowIndex: 1, column: 'Student_ID', type: 'ENTITY', reason: 'Student_ID is NULL' },
      { table: 'STUDENT', rowIndex: 2, column: 'Email', type: 'UNIQUE', reason: 'Duplicate email: ram@example.com' },
      { table: 'ENROLLMENT', rowIndex: 1, column: 'Student_ID', type: 'REFERENTIAL', reason: 'Student 999 does not exist' },
      { table: 'ENROLLMENT', rowIndex: 2, column: 'Semester', type: 'DOMAIN', reason: 'Semester 20 is outside range 1–8' },
    ],
    totalViolations: 4,
  },
  successCondition: 'Find and label all 4 violations',
  hints: {
    level1: 'Check for NULL values, duplicate values, missing references, and out-of-range values.',
    level2: 'ENTITY = NULL/duplicate key. REFERENTIAL = missing parent. DOMAIN = invalid value. UNIQUE = duplicate non-key.',
    level3: 'There are 4 violations across both tables.',
  },
  successFeedback: 'All 4 violations identified. All four integrity rules are working to protect the database.',
  xpReward: 80, healthChange: 10,
  quickNote: 'Four integrity rules: ENTITY, REFERENTIAL, DOMAIN, UNIQUE.',
},

{
  id: 46, worldId: 6, worldName: 'DATA INTEGRITY',
  isBoss: true,
  title: '⚔ INTEGRITY BOSS',
  missionText: 'Completely repair the broken database — no labels to guide you.',
  storyBriefing: [
    '⚔ INTEGRITY BOSS LEVEL',
    '',
    'A new database. Multiple violations.',
    '',
    'No categories shown.',
    '',
    'Find and fix everything.',
  ],
  challengeType: 'INTEGRITY_REPAIR',
  initialTables: [
    {
      id: 'patient_boss', name: 'PATIENT', primaryKey: ['Patient_ID'],
      columns: [{ name: 'Patient_ID', isPrimaryKey: true }, { name: 'Patient_Name' }, { name: 'Age' }, { name: 'Email' }],
      rows: [
        { Patient_ID: 1, Patient_Name: 'Ram', Age: 25, Email: 'ram@h.com' },
        { Patient_ID: null, Patient_Name: 'Sita', Age: 22, Email: 'sita@h.com' },
        { Patient_ID: 3, Patient_Name: 'Hari', Age: -5, Email: 'ram@h.com' },
      ],
    },
    {
      id: 'appointment_boss', name: 'APPOINTMENT', primaryKey: ['Appointment_ID'],
      columns: [{ name: 'Appointment_ID', isPrimaryKey: true }, { name: 'Patient_ID' }, { name: 'Doctor' }],
      rows: [
        { Appointment_ID: 1, Patient_ID: 1, Doctor: 'Dr. Shah' },
        { Appointment_ID: 2, Patient_ID: 999, Doctor: 'Dr. Karki' },
      ],
    },
  ],
  task: {
    bossMode: true,
    violations: [
      { table: 'PATIENT', rowIndex: 1, column: 'Patient_ID', type: 'ENTITY', reason: 'NULL primary key' },
      { table: 'PATIENT', rowIndex: 2, column: 'Age', type: 'DOMAIN', reason: 'Age cannot be negative' },
      { table: 'PATIENT', rowIndex: 2, column: 'Email', type: 'UNIQUE', reason: 'Duplicate email' },
      { table: 'APPOINTMENT', rowIndex: 1, column: 'Patient_ID', type: 'REFERENTIAL', reason: 'Patient 999 does not exist' },
    ],
    totalViolations: 4,
  },
  successCondition: 'Find all 4 violations',
  hints: {
    level1: 'Check every column: NULL keys, out-of-range values, duplicate emails, missing references.',
    level2: 'There are violations in both tables.',
    level3: 'Four total violations: one of each type.',
  },
  successFeedback: 'DATABASE INTEGRITY RESTORED. All four rules enforced. Well done.',
  xpReward: 250, healthChange: 15,
},

// ═══════════════════════ FINAL WORLD — DATABASE MASTER ════════════════════════
{
  id: 47, worldId: 7, worldName: 'DATABASE MASTER',
  title: 'Broken Database',
  missionText: 'Inspect the raw data. Identify ALL problems — structural, dependency, and integrity.',
  storyBriefing: [
    '🏁 FINAL WORLD',
    '',
    'A completely new database.',
    'Structural problems. Dependency problems. Integrity problems.',
    '',
    'Categorize each issue you find.',
  ],
  challengeType: 'IDENTIFY_ANOMALY',
  initialTables: [{
    id: 'final_raw', name: 'HOSPITAL_RAW', primaryKey: [],
    columns: [
      { name: 'Patient_ID' }, { name: 'Patient_Name' }, { name: 'Doctor_ID' },
      { name: 'Doctor_Name' }, { name: 'Doctor_Phone' }, { name: 'Diagnoses' }, { name: 'Visit_Date' },
    ],
    rows: [
      { Patient_ID: 1, Patient_Name: 'Ram', Doctor_ID: 'D01', Doctor_Name: 'Dr. Shah', Doctor_Phone: '9811111', Diagnoses: 'Flu, Fever', Visit_Date: '2024-01-01' },
      { Patient_ID: 1, Patient_Name: 'Ram', Doctor_ID: 'D02', Doctor_Name: 'Dr. Karki', Doctor_Phone: '9822222', Diagnoses: 'Cold', Visit_Date: '2024-01-15' },
      { Patient_ID: null, Patient_Name: 'Sita', Doctor_ID: 'D01', Doctor_Name: 'Dr. Shah', Doctor_Phone: '9811111', Diagnoses: 'Fever', Visit_Date: '2024-01-02' },
    ],
  }],
  task: {
    scenarios: [
      { text: 'Dr. Shah\'s phone appears multiple times. If it changes, every row must be updated.', answer: 'UPDATE ANOMALY' },
      { text: 'Patient_ID is NULL for Sita. This is an identity problem.', answer: 'ENTITY INTEGRITY' },
      { text: 'Diagnoses contains multiple values in one cell (Flu, Fever).', answer: '1NF VIOLATION' },
    ],
    options: ['UPDATE ANOMALY', 'ENTITY INTEGRITY', '1NF VIOLATION', 'REFERENTIAL INTEGRITY'],
  },
  successCondition: 'Correctly classify all 3 problems',
  hints: {
    level1: 'Look at each row carefully. What type of problem is each one?',
    level2: 'Repeated data = redundancy/anomaly. NULL key = entity problem. List in cell = 1NF.',
    level3: 'Three different types of problems are present.',
  },
  successFeedback: 'All problems identified. A broken database can have structure, dependency, AND integrity problems simultaneously.',
  xpReward: 80, healthChange: 8,
  quickNote: 'Real-world databases often have multiple types of problems.',
},

{
  id: 48, worldId: 7, worldName: 'DATABASE MASTER',
  title: 'Rebuild',
  missionText: 'Normalize the hospital database from UNF to 3NF.',
  storyBriefing: [
    'Now normalize the hospital database.',
    '',
    'UNF → 1NF → 2NF → 3NF',
    '',
    'Expected result:',
    'PATIENT | DOCTOR | VISIT',
  ],
  challengeType: 'FULL_NORMALIZE',
  initialTables: [{
    id: 'hospital_normalize', name: 'HOSPITAL_RAW', primaryKey: [],
    columns: [
      { name: 'Patient_ID' }, { name: 'Patient_Name' }, { name: 'Doctor_ID' },
      { name: 'Doctor_Name' }, { name: 'Doctor_Phone' }, { name: 'Diagnosis' }, { name: 'Visit_Date' },
    ],
    rows: [
      { Patient_ID: 1, Patient_Name: 'Ram', Doctor_ID: 'D01', Doctor_Name: 'Dr. Shah', Doctor_Phone: '9811111', Diagnosis: 'Flu', Visit_Date: '2024-01-01' },
      { Patient_ID: 1, Patient_Name: 'Ram', Doctor_ID: 'D02', Doctor_Name: 'Dr. Karki', Doctor_Phone: '9822222', Diagnosis: 'Cold', Visit_Date: '2024-01-15' },
    ],
  }],
  task: {
    expectedFinalTables: [
      { name: 'PATIENT', requiredColumns: ['Patient_ID', 'Patient_Name'] },
      { name: 'DOCTOR', requiredColumns: ['Doctor_ID', 'Doctor_Name', 'Doctor_Phone'] },
      { name: 'VISIT', requiredColumns: ['Patient_ID', 'Doctor_ID', 'Diagnosis', 'Visit_Date'] },
    ],
  },
  successCondition: 'Produce PATIENT, DOCTOR, and VISIT tables in 3NF',
  hints: {
    level1: 'Patient information belongs in PATIENT. Doctor information belongs in DOCTOR.',
    level2: 'Doctor_Phone depends on Doctor_ID — keep it in DOCTOR table.',
    level3: 'The visit event (diagnosis + date) belongs in a VISIT table linking patient and doctor.',
  },
  successFeedback: 'Hospital database normalized to 3NF. Three clean tables.',
  xpReward: 120, healthChange: 10,
},

{
  id: 49, worldId: 7, worldName: 'DATABASE MASTER',
  title: 'Protect the Database',
  missionText: 'Apply integrity rules to the normalized hospital database.',
  storyBriefing: [
    'The hospital database is normalized.',
    '',
    'Now protect it.',
    '',
    'Identify:',
    '• Primary keys',
    '• Relationships (foreign keys)',
    '• Domain rules',
    '• Unique columns',
  ],
  challengeType: 'IDENTIFY_DEPENDENCY',
  initialTables: [
    {
      id: 'patient_final', name: 'PATIENT', primaryKey: ['Patient_ID'],
      columns: [{ name: 'Patient_ID', isPrimaryKey: true }, { name: 'Patient_Name' }, { name: 'Email' }],
      rows: [{ Patient_ID: 1, Patient_Name: 'Ram', Email: 'ram@h.com' }],
    },
    {
      id: 'doctor_final', name: 'DOCTOR', primaryKey: ['Doctor_ID'],
      columns: [{ name: 'Doctor_ID', isPrimaryKey: true }, { name: 'Doctor_Name' }, { name: 'Doctor_Phone' }],
      rows: [{ Doctor_ID: 'D01', Doctor_Name: 'Dr. Shah', Doctor_Phone: '9811111' }],
    },
    {
      id: 'visit_final', name: 'VISIT', primaryKey: ['Patient_ID', 'Doctor_ID'],
      columns: [{ name: 'Patient_ID' }, { name: 'Doctor_ID' }, { name: 'Diagnosis' }, { name: 'Visit_Date' }],
      rows: [{ Patient_ID: 1, Doctor_ID: 'D01', Diagnosis: 'Flu', Visit_Date: '2024-01-01' }],
    },
  ],
  task: {
    mode: 'classify_integrity',
    items: [
      { question: 'Patient_ID in VISIT must reference a real patient.', answer: 'REFERENTIAL INTEGRITY' },
      { question: 'Patient_ID in PATIENT cannot be NULL or duplicated.', answer: 'ENTITY INTEGRITY' },
      { question: 'Email in PATIENT should be different for each patient.', answer: 'UNIQUENESS' },
      { question: 'Visit_Date must be a valid date format.', answer: 'DOMAIN INTEGRITY' },
    ],
    options: ['ENTITY INTEGRITY', 'REFERENTIAL INTEGRITY', 'DOMAIN INTEGRITY', 'UNIQUENESS'],
  },
  successCondition: 'Correctly classify all 4 integrity rules',
  hints: {
    level1: 'ENTITY = primary key rules. REFERENTIAL = foreign key rules.',
    level2: 'DOMAIN = valid value rules. UNIQUENESS = no duplicate values.',
    level3: 'Each rule protects a different aspect of data quality.',
  },
  successFeedback: 'All four integrity rules applied correctly. The database is protected.',
  xpReward: 100, healthChange: 10,
  quickNote: 'Structure + Integrity = a reliable database.',
},

{
  id: 50, worldId: 7, worldName: 'DATABASE MASTER',
  isBoss: true,
  title: '⚔ DATABASE MASTER',
  missionText: 'Receive raw data. Build the complete normalized and protected database.',
  storyBriefing: [
    '🏆 FINAL CHALLENGE',
    '',
    'UNIVERSITY MANAGEMENT SYSTEM',
    '',
    'You receive raw data.',
    'Normalize it fully.',
    'Then protect it.',
    '',
    'This is everything you have learned.',
  ],
  challengeType: 'FINAL_CHALLENGE',
  initialTables: [MESSY_TABLE],
  task: {
    stages: [
      { name: 'IDENTIFY', instruction: 'Find all redundancy and anomalies.' },
      { name: '1NF', instruction: 'Ensure all cells are atomic.' },
      { name: '2NF', instruction: 'Remove all partial dependencies.' },
      { name: '3NF', instruction: 'Remove all transitive dependencies.' },
      { name: 'INTEGRITY', instruction: 'Protect keys, references, domains, and unique values.' },
    ],
    expectedFinalTables: [
      { name: 'STUDENT', requiredColumns: ['Student_ID', 'Student_Name'] },
      { name: 'COURSE', requiredColumns: ['Course_ID', 'Course_Name', 'Instructor_ID'] },
      { name: 'INSTRUCTOR', requiredColumns: ['Instructor_ID', 'Instructor_Name', 'Instructor_Phone'] },
      { name: 'ENROLLMENT', requiredColumns: ['Student_ID', 'Course_ID', 'Semester'] },
    ],
    expectedFinalState: {
      tables: ['STUDENT', 'COURSE', 'INSTRUCTOR', 'ENROLLMENT'],
      integrityRules: ['ENTITY', 'REFERENTIAL', 'DOMAIN', 'UNIQUE'],
    },
  },
  successCondition: 'Complete all 5 stages successfully',
  hints: {
    level1: 'Start by identifying what repeats and what can be grouped.',
    level2: 'Split into 4 tables: STUDENT, COURSE, INSTRUCTOR, ENROLLMENT.',
    level3: 'After normalization, apply all four integrity rules.',
  },
  successFeedback: 'DATABASE RESTORED. NORMALIZATION ✓ INTEGRITY ✓ DATABASE HEALTH: 100%',
  xpReward: 500, healthChange: 30,
  unlocksConcept: 'DATABASE ENGINEER',
  conceptDefinition: 'You did not study databases. You repaired one.',
},

];

// Build map
export const levelMap: Record<number, LevelConfig> = {};
levels.forEach(l => { levelMap[l.id] = l; });

export { levels };
export default levelMap;
