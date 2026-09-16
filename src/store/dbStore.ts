import { create } from 'zustand';
import { validateRecord, type ValidationResult } from '../lib/db/validator';

export interface DbState {
  tables: Record<string, any[]>;
  lastValidationResult: ValidationResult | null;
  insertRecord: (tableName: string, record: any) => ValidationResult;
  deleteRecord: (tableName: string, pkColumn: string, pkValue: any, onCascade?: 'RESTRICT' | 'CASCADE' | 'SET NULL') => ValidationResult;
  resetDatabase: () => void;
}

const initialTables = {
  Student: [
    { Student_ID: 101, Student_Name: "Ram", Email: "ram@example.com" },
    { Student_ID: 102, Student_Name: "Sita", Email: "sita@example.com" },
    { Student_ID: 103, Student_Name: "Hari", Email: "hari@example.com" }
  ],
  Instructor: [
    { Instructor_ID: "I01", Instructor_Name: "Mr. Shah", Instructor_Phone: "9800001" },
    { Instructor_ID: "I02", Instructor_Name: "Ms. Karki", Instructor_Phone: "9800002" },
    { Instructor_ID: "I03", Instructor_Name: "Mr. Rai", Instructor_Phone: "9800003" }
  ],
  Course: [
    { Course_ID: "C01", Course_Name: "BSc CSIT", Instructor_ID: "I01" },
    { Course_ID: "C02", Course_Name: "BCA", Instructor_ID: "I02" },
    { Course_ID: "C03", Course_Name: "BIT", Instructor_ID: "I03" }
  ],
  Enrollment: [
    { Student_ID: 101, Course_ID: "C01", Semester: 1 },
    { Student_ID: 101, Course_ID: "C02", Semester: 1 },
    { Student_ID: 102, Course_ID: "C01", Semester: 2 },
    { Student_ID: 103, Course_ID: "C01", Semester: 1 }
  ]
};

export const useDbStore = create<DbState>((set, get) => ({
  tables: JSON.parse(JSON.stringify(initialTables)),
  lastValidationResult: null,

  insertRecord: (tableName, record) => {
    const state = get();
    const result = validateRecord(tableName, record, state.tables);
    
    if (result.valid) {
      set((state) => ({
        tables: {
          ...state.tables,
          [tableName]: [...state.tables[tableName], record]
        },
        lastValidationResult: result
      }));
    } else {
      set({ lastValidationResult: result });
    }
    
    return result;
  },

  deleteRecord: (tableName, pkColumn, pkValue, onCascade = 'RESTRICT') => {
    const state = get();
    // Simplified deletion logic for demo purposes
    // Here you would check foreign key references (e.g., if deleting a student, check enrollments)
    
    if (tableName === 'Student') {
      const relatedEnrollments = state.tables['Enrollment'].filter(e => e.Student_ID === pkValue);
      if (relatedEnrollments.length > 0) {
        if (onCascade === 'RESTRICT') {
          const result = {
            valid: false,
            reason: `Student ${pkValue} still has related enrollment records.`,
            details: 'DELETE BLOCKED',
            rule: 'RESTRICT prevents deleting parent rows with existing child rows.'
          };
          set({ lastValidationResult: result });
          return result;
        } else if (onCascade === 'CASCADE') {
          set((state) => ({
            tables: {
              ...state.tables,
              Enrollment: state.tables['Enrollment'].filter(e => e.Student_ID !== pkValue),
              Student: state.tables['Student'].filter(s => s[pkColumn] !== pkValue)
            }
          }));
          return { valid: true };
        } else if (onCascade === 'SET NULL') {
          set((state) => ({
            tables: {
              ...state.tables,
              Enrollment: state.tables['Enrollment'].map(e => e.Student_ID === pkValue ? { ...e, Student_ID: null } : e),
              Student: state.tables['Student'].filter(s => s[pkColumn] !== pkValue)
            }
          }));
          return { valid: true };
        }
      }
    }

    set((state) => ({
      tables: {
        ...state.tables,
        [tableName]: state.tables[tableName].filter(row => row[pkColumn] !== pkValue)
      }
    }));
    return { valid: true };
  },

  resetDatabase: () => {
    set({
      tables: JSON.parse(JSON.stringify(initialTables)),
      lastValidationResult: null
    });
  }
}));
