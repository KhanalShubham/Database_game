// ─────────────────────────────────────────────────────────────────────────────
// NORMALIZATION ENGINE
// All validation is logic-based, not sample-row-based.
// ─────────────────────────────────────────────────────────────────────────────

export interface DBColumn {
  name: string;
  isPrimaryKey?: boolean;
  isCompositeKey?: boolean; // part of composite key
}

export interface DBTable {
  id: string;
  name: string;
  columns: DBColumn[];
  rows: Record<string, any>[];
  primaryKey?: string[];   // array of column names
}

export interface FunctionalDep {
  from: string[];  // determinant attribute(s)
  to: string;      // dependent attribute
}

export interface SchemaState {
  tables: DBTable[];
  dependencies: FunctionalDep[];
}

// ── Atomicity check ───────────────────────────────────────────────────────────
export function checkAtomicity(table: DBTable): { column: string; rowIndex: number }[] {
  const violations: { column: string; rowIndex: number }[] = [];
  table.rows.forEach((row, ri) => {
    Object.entries(row).forEach(([col, val]) => {
      if (typeof val === 'string' && (val.includes(',') || val.includes('\n'))) {
        violations.push({ column: col, rowIndex: ri });
      }
      if (Array.isArray(val)) violations.push({ column: col, rowIndex: ri });
    });
  });
  return violations;
}

// ── Repeating group check (column names like Course1, Course2...) ─────────────
export function checkRepeatingGroups(table: DBTable): string[] {
  const patterns: Record<string, string[]> = {};
  table.columns.forEach(c => {
    const base = c.name.replace(/\d+$/, '');
    if (base !== c.name) {
      patterns[base] = patterns[base] || [];
      patterns[base].push(c.name);
    }
  });
  return Object.values(patterns).filter(arr => arr.length > 1).flat();
}

// ── Partial dependency check ──────────────────────────────────────────────────
// A partial dep exists when a non-key attribute depends on PART of a composite key
export function findCandidateKeys(table: DBTable): string[][] {
  const cols = table.columns.map((c) => c.name);
  if (table.primaryKey?.length) return [table.primaryKey];
  const singles = cols.filter((c) => {
    const vals = table.rows.map((r) => String(r[c]));
    return vals.length === new Set(vals).size;
  });
  if (singles.length) return singles.map((c) => [c]);
  return [];
}

export function findFunctionalDependencies(_table: DBTable, declared: FunctionalDep[]): FunctionalDep[] {
  return declared;
}

export function findPartialDependencies(
  table: DBTable,
  deps: FunctionalDep[]
): FunctionalDep[] {
  const pk = table.primaryKey || [];
  if (pk.length < 2) return []; // only composite keys can have partial deps
  const nonKeyColumns = table.columns.filter(c => !pk.includes(c.name)).map(c => c.name);
  return deps.filter(dep =>
    dep.from.length === 1 &&
    pk.includes(dep.from[0]) &&
    nonKeyColumns.includes(dep.to)
  );
}

// ── Transitive dependency check ───────────────────────────────────────────────
// A transitive dep: key → A → B (B depends on non-key A, not directly on key)
export function findTransitiveDependencies(
  table: DBTable,
  deps: FunctionalDep[]
): FunctionalDep[] {
  const pk = table.primaryKey || [];
  const nonKeyColumns = table.columns.filter(c => !pk.includes(c.name)).map(c => c.name);
  return deps.filter(dep =>
    dep.from.length === 1 &&
    nonKeyColumns.includes(dep.from[0]) &&
    nonKeyColumns.includes(dep.to)
  );
}

// ── Calculate current normal form ─────────────────────────────────────────────
export interface NormalizationStatus {
  is1NF: boolean;
  is2NF: boolean;
  is3NF: boolean;
  atomicViolations: { column: string; rowIndex: number }[];
  repeatingGroups: string[];
  partialDeps: FunctionalDep[];
  transitiveDeps: FunctionalDep[];
}

export function calculateNormalizationStatus(
  tables: DBTable[],
  deps: FunctionalDep[]
): NormalizationStatus {
  const atomicViolations = tables.flatMap(t => checkAtomicity(t));
  const repeatingGroups = tables.flatMap(t => checkRepeatingGroups(t));
  const partialDeps = tables.flatMap(t => findPartialDependencies(t, deps));
  const transitiveDeps = tables.flatMap(t => findTransitiveDependencies(t, deps));

  const is1NF = atomicViolations.length === 0 && repeatingGroups.length === 0;
  const is2NF = is1NF && partialDeps.length === 0;
  const is3NF = is2NF && transitiveDeps.length === 0;

  return { is1NF, is2NF, is3NF, atomicViolations, repeatingGroups, partialDeps, transitiveDeps };
}

// ── Integrity checks ───────────────────────────────────────────────────────────
export interface IntegrityViolation {
  type: 'ENTITY' | 'REFERENTIAL' | 'DOMAIN' | 'UNIQUE';
  table: string;
  column: string;
  rowIndex: number;
  value: any;
  reason: string;
}

export function checkEntityIntegrity(table: DBTable): IntegrityViolation[] {
  const pk = table.primaryKey || [];
  const violations: IntegrityViolation[] = [];
  const seen = new Set<string>();
  table.rows.forEach((row, ri) => {
    const keyVal = pk.map(k => row[k]).join('|');
    if (pk.some(k => row[k] === null || row[k] === undefined || row[k] === '')) {
      violations.push({ type: 'ENTITY', table: table.name, column: pk.join('+'), rowIndex: ri, value: null, reason: 'Primary Key cannot be NULL' });
    } else if (seen.has(keyVal)) {
      violations.push({ type: 'ENTITY', table: table.name, column: pk.join('+'), rowIndex: ri, value: keyVal, reason: 'Duplicate Primary Key' });
    }
    seen.add(keyVal);
  });
  return violations;
}

export function checkReferentialIntegrity(
  childTable: DBTable,
  childCol: string,
  parentTable: DBTable,
  parentCol: string
): IntegrityViolation[] {
  const parentVals = new Set(parentTable.rows.map(r => r[parentCol]));
  return childTable.rows
    .map((row, ri) => ({ row, ri }))
    .filter(({ row }) => row[childCol] !== null && !parentVals.has(row[childCol]))
    .map(({ row, ri }) => ({
      type: 'REFERENTIAL' as const,
      table: childTable.name,
      column: childCol,
      rowIndex: ri,
      value: row[childCol],
      reason: `${row[childCol]} not found in ${parentTable.name}.${parentCol}`
    }));
}

export function checkDomainIntegrity(
  table: DBTable,
  column: string,
  rule: (v: any) => boolean,
  ruleDescription: string
): IntegrityViolation[] {
  return table.rows
    .map((row, ri) => ({ row, ri }))
    .filter(({ row }) => row[column] !== null && !rule(row[column]))
    .map(({ row, ri }) => ({
      type: 'DOMAIN' as const,
      table: table.name,
      column,
      rowIndex: ri,
      value: row[column],
      reason: ruleDescription
    }));
}

export function checkUniqueness(table: DBTable, column: string): IntegrityViolation[] {
  const seen = new Map<any, number>();
  const violations: IntegrityViolation[] = [];
  table.rows.forEach((row, ri) => {
    const v = row[column];
    if (v === null || v === undefined) return;
    if (seen.has(v)) violations.push({ type: 'UNIQUE', table: table.name, column, rowIndex: ri, value: v, reason: `Duplicate value: ${v}` });
    else seen.set(v, ri);
  });
  return violations;
}
