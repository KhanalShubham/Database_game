import type { DBTable, FunctionalDep, NormalizationStatus, IntegrityViolation } from '../../normalization/engine';
import {
  calculateNormalizationStatus,
  checkAtomicity,
  checkRepeatingGroups,
  checkDomainIntegrity,
  checkEntityIntegrity,
  checkReferentialIntegrity,
  checkUniqueness,
  findPartialDependencies,
  findTransitiveDependencies,
} from '../../normalization/engine';

export function snapshotSchema(tables: DBTable[], dependencies: FunctionalDep[] = []) {
  return {
    tables,
    dependencies,
    normalization: calculateNormalizationStatus(tables, dependencies),
  };
}

export type EngineCheck = {
  status: 'ok' | 'problem';
  problem?: string;
  affectedAttributes?: string[];
  explanation?: string;
  suggestedHint?: string;
  normalization?: NormalizationStatus;
  integrity?: IntegrityViolation[];
};

export function inspectDatabase(tables: DBTable[], deps: FunctionalDep[] = []): EngineCheck {
  const atomic = tables.flatMap((t) => checkAtomicity(t));
  const repeating = tables.flatMap((t) => checkRepeatingGroups(t));
  const partial = tables.flatMap((t) => findPartialDependencies(t, deps));
  const transitive = tables.flatMap((t) => findTransitiveDependencies(t, deps));
  const integrity = tables.flatMap((t) => [
    ...checkEntityIntegrity(t),
    ...checkUniqueness(t, t.columns.find((c) => c.name.toLowerCase().includes('email'))?.name || ''),
  ].filter((v) => v.column));

  const normalization = calculateNormalizationStatus(tables, deps);
  if (atomic.length) {
    return {
      status: 'problem',
      problem: 'Non-atomic values',
      affectedAttributes: atomic.map((a) => a.column),
      explanation: 'A cell holds more than one value.',
      suggestedHint: 'Split lists into separate rows.',
      normalization,
      integrity,
    };
  }
  if (repeating.length) {
    return {
      status: 'problem',
      problem: 'Repeating groups',
      affectedAttributes: repeating,
      explanation: 'The same kind of fact is stored as numbered columns.',
      suggestedHint: 'Turn repeating columns into rows.',
      normalization,
      integrity,
    };
  }
  if (partial.length) {
    return {
      status: 'problem',
      problem: 'Partial dependency',
      affectedAttributes: partial.map((d) => d.to),
      explanation: 'A non-key attribute depends on only part of a composite key.',
      suggestedHint: 'Does this attribute need the whole key?',
      normalization,
      integrity,
    };
  }
  if (transitive.length) {
    return {
      status: 'problem',
      problem: 'Transitive dependency',
      affectedAttributes: transitive.map((d) => d.to),
      explanation: 'A non-key attribute depends on another non-key attribute.',
      suggestedHint: 'Think: Key → A → B',
      normalization,
      integrity,
    };
  }
  return { status: 'ok', normalization, integrity };
}

export {
  checkAtomicity,
  checkRepeatingGroups,
  checkDomainIntegrity,
  checkEntityIntegrity,
  checkReferentialIntegrity,
  checkUniqueness,
  calculateNormalizationStatus,
};
