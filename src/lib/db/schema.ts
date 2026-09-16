export type DataType = 'INT' | 'VARCHAR' | 'CHAR';

export interface ColumnSchema {
  name: string;
  type: DataType;
  isPrimaryKey?: boolean;
  notNull?: boolean;
  unique?: boolean;
  check?: (value: any) => boolean;
  checkDescription?: string;
  references?: {
    table: string;
    column: string;
  };
}

export interface TableSchema {
  name: string;
  columns: ColumnSchema[];
}

export const dbSchema: Record<string, TableSchema> = {
  Student: {
    name: 'Student',
    columns: [
      { name: 'Student_ID', type: 'INT', isPrimaryKey: true, notNull: true, unique: true },
      { name: 'Student_Name', type: 'VARCHAR', notNull: true },
      { name: 'Email', type: 'VARCHAR', unique: true }
    ]
  },
  Instructor: {
    name: 'Instructor',
    columns: [
      { name: 'Instructor_ID', type: 'VARCHAR', isPrimaryKey: true, notNull: true, unique: true },
      { name: 'Instructor_Name', type: 'VARCHAR', notNull: true },
      { name: 'Instructor_Phone', type: 'VARCHAR' }
    ]
  },
  Course: {
    name: 'Course',
    columns: [
      { name: 'Course_ID', type: 'VARCHAR', isPrimaryKey: true, notNull: true, unique: true },
      { name: 'Course_Name', type: 'VARCHAR', notNull: true },
      { 
        name: 'Instructor_ID', 
        type: 'VARCHAR',
        references: { table: 'Instructor', column: 'Instructor_ID' }
      }
    ]
  },
  Enrollment: {
    name: 'Enrollment',
    columns: [
      { 
        name: 'Student_ID', 
        type: 'INT', 
        notNull: true,
        references: { table: 'Student', column: 'Student_ID' }
      },
      { 
        name: 'Course_ID', 
        type: 'VARCHAR', 
        notNull: true,
        references: { table: 'Course', column: 'Course_ID' }
      },
      { 
        name: 'Semester', 
        type: 'INT',
        check: (val: any) => val >= 1 && val <= 8,
        checkDescription: 'Semester must be between 1 and 8'
      }
    ]
  }
};
