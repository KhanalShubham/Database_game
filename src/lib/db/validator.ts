import { dbSchema } from './schema';

export type ValidationStep = 'ENTITY' | 'REFERENTIAL' | 'DOMAIN' | 'UNIQUE';

export interface ValidationResult {
  valid: boolean;
  failedStep?: ValidationStep;
  reason?: string;
  rule?: string;
  details?: string;
}

export const validateRecord = (
  tableName: string, 
  record: any, 
  dbState: Record<string, any[]>
): ValidationResult => {
  const schema = dbSchema[tableName];
  if (!schema) return { valid: false, reason: 'Table not found' };

  // 1. ENTITY INTEGRITY
  const pkColumn = schema.columns.find(c => c.isPrimaryKey);
  if (pkColumn) {
    const pkValue = record[pkColumn.name];
    if (pkValue === undefined || pkValue === null || pkValue === '') {
      return {
        valid: false,
        failedStep: 'ENTITY',
        reason: `${pkColumn.name} cannot be NULL.`,
        rule: 'Primary Key cannot be NULL.',
        details: 'Entity Integrity violation'
      };
    }
    // Check for duplicate PK
    const isDuplicate = dbState[tableName].some(row => row[pkColumn.name] === pkValue && row !== record); // Assuming simple insert check
    if (isDuplicate) {
      return {
        valid: false,
        failedStep: 'ENTITY',
        reason: `${pkColumn.name} ${pkValue} already exists.`,
        rule: 'Primary Key cannot be duplicated.',
        details: 'Entity Integrity violation'
      };
    }
  }

  // 2. REFERENTIAL INTEGRITY
  for (const col of schema.columns) {
    if (col.references) {
      const val = record[col.name];
      if (val !== undefined && val !== null && val !== '') {
        const parentTable = dbState[col.references.table];
        if (parentTable) {
          const parentExists = parentTable.some(row => row[col.references!.column] === val);
          if (!parentExists) {
            return {
              valid: false,
              failedStep: 'REFERENTIAL',
              reason: `The ${col.references.table} table does not contain ${col.references.column} ${val}.`,
              rule: 'A foreign key must refer to an existing parent record.',
              details: 'Referential Integrity violation'
            };
          }
        }
      }
    }
  }

  // 3. DOMAIN INTEGRITY
  for (const col of schema.columns) {
    const val = record[col.name];
    if (val !== undefined && val !== null && val !== '') {
      // Basic type checking (simplified for demo)
      if (col.type === 'INT' && isNaN(Number(val))) {
        return {
          valid: false,
          failedStep: 'DOMAIN',
          reason: `${col.name} must be a number.`,
          rule: 'Data type mismatch.',
          details: 'Domain Integrity violation'
        };
      }
      if (col.check && !col.check(val)) {
        return {
          valid: false,
          failedStep: 'DOMAIN',
          reason: col.checkDescription || `${col.name} has invalid value.`,
          rule: 'Value must satisfy CHECK constraint.',
          details: 'Domain Integrity violation'
        };
      }
    }
  }

  // 4. UNIQUE INTEGRITY
  for (const col of schema.columns) {
    if (col.unique && !col.isPrimaryKey) {
      const val = record[col.name];
      if (val !== undefined && val !== null && val !== '') {
        const isDuplicate = dbState[tableName].some(row => row[col.name] === val && row !== record);
        if (isDuplicate) {
          return {
            valid: false,
            failedStep: 'UNIQUE',
            reason: `${val} already exists in ${col.name}.`,
            rule: 'UNIQUE prevents duplicate values in a column.',
            details: 'Uniqueness violation'
          };
        }
      }
    }
  }

  return { valid: true };
};
