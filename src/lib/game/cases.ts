import type { DBTable } from '../normalization/engine';

export type CaseKind =
  | 'CLICK_UPDATE'
  | 'SPLIT_ITEMS'
  | 'IDENTITY_SLOT'
  | 'COMBO_KEY'
  | 'DRAW_DEP'
  | 'CHAIN'
  | 'DRAG_GROUPS'
  | 'OWNER_DRAG'
  | 'ADD_ROW'
  | 'TRAP_2NF'
  | 'RULE_VS_DATA'
  | 'JUDGE'
  | 'GHOST'
  | 'DOMAIN_SORT'
  | 'FINAL';

export type Phase = 'INVESTIGATE' | 'REPAIR' | 'REBUILD' | 'PROTECT' | 'MASTER';

export interface CaseConfig {
  id: number;
  phase: Phase;
  title: string;
  place: string;
  quote: string;
  mission: string;
  image: string;
  kind: CaseKind;
  table: DBTable;
  task: Record<string, unknown>;
  reveal: string;
  revealTitle: string;
  xp: number;
  health: number;
  unlockTool?: string;
  hints: [string, string, string];
}

export const phases: { id: Phase; label: string; range: [number, number] }[] = [
  { id: 'INVESTIGATE', label: 'Investigate', range: [1, 5] },
  { id: 'REPAIR', label: 'Repair', range: [6, 10] },
  { id: 'REBUILD', label: 'Rebuild', range: [11, 14] },
  { id: 'PROTECT', label: 'Protect', range: [15, 17] },
  { id: 'MASTER', label: 'Master', range: [18, 18] },
];

export const cases: CaseConfig[] = [
  {
    id: 1, phase: 'INVESTIGATE', title: 'Hospital Records', place: 'Reception desk',
    quote: 'Dr. Sharma changed his phone number, but I don’t know how many places I need to change.',
    mission: 'Find every copy of Dr. Sharma’s number. Change one of them. Watch what happens.',
    image: '/cases/hospital.jpg', kind: 'CLICK_UPDATE',
    table: {
      id: 'appt', name: 'Appointments', primaryKey: [],
      columns: [{ name: 'Appointment' }, { name: 'Patient' }, { name: 'Doctor' }, { name: 'Doctor_Phone' }, { name: 'Department' }],
      rows: [
        { Appointment: 'A101', Patient: 'Ram', Doctor: 'Dr. Sharma', Doctor_Phone: '98001', Department: 'Cardiology' },
        { Appointment: 'A102', Patient: 'Sita', Doctor: 'Dr. Sharma', Doctor_Phone: '98001', Department: 'Cardiology' },
        { Appointment: 'A103', Patient: 'Hari', Doctor: 'Dr. Thapa', Doctor_Phone: '98002', Department: 'Dental' },
      ],
    },
    task: { column: 'Doctor_Phone', oldValue: '98001', newValue: '98111' },
    revealTitle: 'Update anomaly',
    reveal: 'The same fact was stored in more than one place. Changing one copy left the database inconsistent.',
    xp: 100, health: 5, unlockTool: 'Investigate',
    hints: ['Click the phone number that repeats.', 'Change only one copy of 98001.', 'Two numbers for the same doctor means the fact was duplicated.'],
  },
  {
    id: 2, phase: 'INVESTIGATE', title: 'Restaurant Orders', place: 'Kitchen ticket',
    quote: 'I need to find every item Ram ordered.',
    mission: 'Ram’s items are jammed in one cell. Separate them so each item stands alone.',
    image: '/cases/restaurant.jpg', kind: 'SPLIT_ITEMS',
    table: {
      id: 'orders', name: 'Orders',
      columns: [{ name: 'Order' }, { name: 'Customer' }, { name: 'Items' }],
      rows: [
        { Order: '#501', Customer: 'Ram', Items: 'Burger, Coke, Fries' },
        { Order: '#502', Customer: 'Sita', Items: 'Pizza, Coke' },
      ],
    },
    task: { column: 'Items', rowIndex: 0, values: ['Burger', 'Coke', 'Fries'] },
    revealTitle: '1NF — one value per cell',
    reveal: 'A cell should not hold a list. You split the collection into rows. That is first normal form.',
    xp: 120, health: 5, unlockTool: 'Split cell',
    hints: ['Click the cell with commas.', 'Each food item needs its own row.', 'One value per cell.'],
  },
  {
    id: 3, phase: 'INVESTIGATE', title: 'University Registration', place: 'ID office',
    quote: 'A new student arrives. Which piece of information should identify them?',
    mission: 'Drop one token into the identity slot. Then see if the database can still tell people apart.',
    image: '/cases/university.jpg', kind: 'IDENTITY_SLOT',
    table: {
      id: 'stu', name: 'Students',
      columns: [{ name: 'Student_ID' }, { name: 'Name' }, { name: 'Email' }],
      rows: [
        { Student_ID: 101, Name: 'Ram', Email: 'ram@email.com' },
        { Student_ID: 102, Name: 'Sita', Email: 'sita@email.com' },
        { Student_ID: 103, Name: 'Hari', Email: 'hari@email.com' },
      ],
    },
    task: { options: ['Name', 'Email', 'Student ID'], correct: 'Student ID' },
    revealTitle: 'Primary key',
    reveal: 'Names collide. Email can change. A dedicated identity column uniquely names each person.',
    xp: 110, health: 4, unlockTool: 'Key marker',
    hints: ['Try putting Name in the slot first.', 'Two people can share a name.', 'Student ID is designed to be unique.'],
  },
  {
    id: 4, phase: 'INVESTIGATE', title: 'Classroom Attendance', place: 'Lecture hall',
    quote: 'What makes each attendance record different?',
    mission: 'Test Student, Course, then both together. See which combination identifies a row.',
    image: '/cases/school.jpg', kind: 'COMBO_KEY',
    table: {
      id: 'att', name: 'Attendance',
      columns: [{ name: 'Student' }, { name: 'Course' }, { name: 'Attendance' }],
      rows: [
        { Student: 'Ram', Course: 'Database', Attendance: '90%' },
        { Student: 'Ram', Course: 'Mathematics', Attendance: '80%' },
        { Student: 'Sita', Course: 'Database', Attendance: '95%' },
      ],
    },
    task: { correct: ['Student', 'Course'] },
    revealTitle: 'Composite key',
    reveal: 'Neither student nor course is unique alone. Together they identify one attendance record.',
    xp: 120, health: 5, unlockTool: 'Key marker',
    hints: ['Click Student. Ram appears twice.', 'Click Course. Database appears twice.', 'Select both Student and Course.'],
  },
  {
    id: 5, phase: 'INVESTIGATE', title: 'School Secretary', place: 'Front office',
    quote: 'If I give you Student ID 101, whose name should you get?',
    mission: 'Connect what 101 determines. Then try connecting it to Course.',
    image: '/cases/school.jpg', kind: 'DRAW_DEP',
    table: {
      id: 'mix', name: 'Records',
      columns: [{ name: 'Student_ID' }, { name: 'Student_Name' }, { name: 'Age' }, { name: 'Course' }],
      rows: [
        { Student_ID: 101, Student_Name: 'Ram', Age: 20, Course: 'Database' },
        { Student_ID: 101, Student_Name: 'Ram', Age: 20, Course: 'Maths' },
        { Student_ID: 102, Student_Name: 'Sita', Age: 21, Course: 'Database' },
      ],
    },
    task: { source: 'Student_ID', valid: ['Student_Name', 'Age'], invalid: ['Course'] },
    revealTitle: 'Functional dependency',
    reveal: 'Knowing Student ID always gives the name. It does not give a single course — a student can take many.',
    xp: 120, health: 5, unlockTool: 'Dependency tool',
    hints: ['Click Student_ID, then Student_Name.', 'Now try Course.', 'One ID, many courses — that arrow is invalid.'],
  },
  {
    id: 6, phase: 'REPAIR', title: 'Phone Number Mystery', place: 'Staff room',
    quote: 'Who really owns this phone number?',
    mission: 'Click the chain in order: who teaches the course, then whose phone it is.',
    image: '/cases/university.jpg', kind: 'CHAIN',
    table: {
      id: 'c', name: 'Courses',
      columns: [{ name: 'Course' }, { name: 'Instructor' }, { name: 'Phone' }],
      rows: [
        { Course: 'Database', Instructor: 'Mr. Shah', Phone: '98001' },
        { Course: 'Networks', Instructor: 'Mr. Shah', Phone: '98001' },
        { Course: 'Mathematics', Instructor: 'Ms. Karki', Phone: '98002' },
      ],
    },
    task: { chain: ['Course', 'Instructor', 'Phone'] },
    revealTitle: 'Transitive dependency',
    reveal: 'The phone belongs to the instructor, not the course. You followed a chain: Course → Instructor → Phone.',
    xp: 130, health: 6,
    hints: ['Start with Course.', 'Course tells you the instructor.', 'The instructor owns the phone.'],
  },
  {
    id: 7, phase: 'REPAIR', title: 'Online Shop', place: 'Warehouse desk',
    quote: 'Does product name belong to the order… or the product?',
    mission: 'Place each fact in ORDER, PRODUCT, or ORDER ITEM.',
    image: '/cases/shop.jpg', kind: 'DRAG_GROUPS',
    table: {
      id: 'oi', name: 'Shop dump',
      columns: [{ name: 'Order_ID' }, { name: 'Product_ID' }, { name: 'Product_Name' }, { name: 'Quantity' }],
      rows: [
        { Order_ID: 'O01', Product_ID: 'P01', Product_Name: 'Mouse', Quantity: 2 },
        { Order_ID: 'O01', Product_ID: 'P02', Product_Name: 'Keyboard', Quantity: 1 },
        { Order_ID: 'O02', Product_ID: 'P01', Product_Name: 'Mouse', Quantity: 3 },
      ],
    },
    task: {
      groups: ['ORDER', 'PRODUCT', 'ORDER ITEM'],
      mapping: { Order_ID: 'ORDER', Product_ID: 'PRODUCT', Product_Name: 'PRODUCT', Quantity: 'ORDER ITEM' },
      extras: { ORDER: ['Order_ID'], 'ORDER ITEM': ['Order_ID', 'Product_ID', 'Quantity'] },
    },
    revealTitle: 'Who owns the fact',
    reveal: 'Product name stays with the product. Quantity belongs to the line where an order meets a product.',
    xp: 140, health: 6, unlockTool: 'Split table',
    hints: ['Mouse appears in two orders.', 'Quantity changes per order.', 'Put Product_Name with PRODUCT.'],
  },
  {
    id: 8, phase: 'REPAIR', title: 'College Enrollment', place: 'Registrar',
    quote: 'Which facts actually need BOTH Student ID and Course ID?',
    mission: 'Drop each fact onto Student ID, Course ID, or the pair.',
    image: '/cases/university.jpg', kind: 'OWNER_DRAG',
    table: {
      id: 'enr', name: 'Enrollment dump',
      columns: [{ name: 'Student_ID' }, { name: 'Course_ID' }, { name: 'Student_Name' }, { name: 'Course_Name' }, { name: 'Semester' }],
      rows: [
        { Student_ID: 101, Course_ID: 'C01', Student_Name: 'Ram', Course_Name: 'CSIT', Semester: 1 },
        { Student_ID: 101, Course_ID: 'C02', Student_Name: 'Ram', Course_Name: 'BCA', Semester: 1 },
      ],
    },
    task: {
      facts: ['Student_Name', 'Course_Name', 'Semester'],
      slots: ['Student_ID', 'Course_ID', 'Student_ID + Course_ID'],
      mapping: { Student_Name: 'Student_ID', Course_Name: 'Course_ID', Semester: 'Student_ID + Course_ID' },
    },
    revealTitle: 'Partial dependency',
    reveal: 'Student Name only needs Student ID — part of the composite key. That leftover link is a partial dependency.',
    xp: 140, health: 6,
    hints: ['Does Ram’s name change when the course changes?', 'Course name follows Course ID.', 'Semester is about this student taking this course.'],
  },
  {
    id: 9, phase: 'REPAIR', title: 'Hospital Departments', place: 'Admin wing',
    quote: 'Cardiology’s phone number changed.',
    mission: 'Would you rather update one department, or every doctor in it? Separate the facts.',
    image: '/cases/hospital.jpg', kind: 'DRAG_GROUPS',
    table: {
      id: 'doc', name: 'Doctors',
      columns: [{ name: 'Doctor_ID' }, { name: 'Doctor' }, { name: 'Department' }, { name: 'Department_Phone' }],
      rows: [
        { Doctor_ID: 'D01', Doctor: 'Sharma', Department: 'Cardiology', Department_Phone: '1001' },
        { Doctor_ID: 'D02', Doctor: 'Thapa', Department: 'Dental', Department_Phone: '1002' },
      ],
    },
    task: {
      groups: ['DOCTOR', 'DEPARTMENT'],
      mapping: { Doctor_ID: 'DOCTOR', Doctor: 'DOCTOR', Department: 'DEPARTMENT', Department_Phone: 'DEPARTMENT' },
    },
    revealTitle: 'Transitive dependency',
    reveal: 'Department phone describes the department. Keeping it on every doctor forces a chain of updates.',
    xp: 140, health: 6, unlockTool: 'Relationship',
    hints: ['The phone is Cardiology’s, not Sharma’s.', 'Move Department_Phone off the doctor row.', 'One department record, many doctors.'],
  },
  {
    id: 10, phase: 'REPAIR', title: 'Library Card', place: 'Circulation desk',
    quote: 'The librarian wants to add one more book for Ram.',
    mission: 'Do not edit the comma list. Add a proper borrowing row instead.',
    image: '/cases/library.jpg', kind: 'ADD_ROW',
    table: {
      id: 'lib', name: 'Borrowing',
      columns: [{ name: 'Student' }, { name: 'Books_Borrowed' }],
      rows: [
        { Student: 'Ram', Books_Borrowed: 'DBMS, Maths, Networking' },
        { Student: 'Sita', Books_Borrowed: 'DBMS, Java' },
      ],
    },
    task: { splitFirst: true, addBook: 'OS' },
    revealTitle: 'Atomic rows',
    reveal: 'Adding a book should add a row, not grow a comma list. Each borrowing is its own fact.',
    xp: 120, health: 5,
    hints: ['Split Ram’s list into rows first.', 'Then add OS as another row.', 'One book per row.'],
  },
  {
    id: 11, phase: 'REBUILD', title: 'Repair Shop', place: 'Broken file',
    quote: 'This customer-order dump is a mess. Nobody labeled the problems.',
    mission: 'Group columns into CUSTOMER, PRODUCT, and ORDER. Keys can sit in more than one table.',
    image: '/cases/shop.jpg', kind: 'DRAG_GROUPS',
    table: {
      id: 'brk', name: 'Dump',
      columns: [{ name: 'Customer_ID' }, { name: 'Customer_Name' }, { name: 'Product_ID' }, { name: 'Product_Name' }, { name: 'Qty' }],
      rows: [
        { Customer_ID: 1, Customer_Name: 'Ram', Product_ID: 'P1', Product_Name: 'Pen', Qty: 2 },
        { Customer_ID: 1, Customer_Name: 'Ram', Product_ID: 'P2', Product_Name: 'Ink', Qty: 1 },
      ],
    },
    task: {
      groups: ['CUSTOMER', 'PRODUCT', 'ORDER'],
      mapping: { Customer_ID: 'CUSTOMER', Customer_Name: 'CUSTOMER', Product_ID: 'PRODUCT', Product_Name: 'PRODUCT', Qty: 'ORDER' },
    },
    revealTitle: 'Logical structure',
    reveal: 'You grouped facts by what they describe — not by copying a diagram from memory.',
    xp: 160, health: 7,
    hints: ['Customer name follows Customer_ID.', 'Product name follows Product_ID.', 'Qty is about this customer buying this product.'],
  },
  {
    id: 12, phase: 'REBUILD', title: 'The 2NF Trap', place: 'Exam office',
    quote: 'Repeating values are gone. Are we finished?',
    mission: 'The key is Student ID + Course ID. Move anything that does not need the whole key.',
    image: '/cases/university.jpg', kind: 'TRAP_2NF',
    table: {
      id: 't2', name: 'Results',
      columns: [{ name: 'Student_ID' }, { name: 'Course_ID' }, { name: 'Student_Name' }, { name: 'Course_Name' }, { name: 'Grade' }],
      rows: [
        { Student_ID: 101, Course_ID: 'C01', Student_Name: 'Ram', Course_Name: 'DBMS', Grade: 'A' },
        { Student_ID: 101, Course_ID: 'C02', Student_Name: 'Ram', Course_Name: 'Maths', Grade: 'B' },
      ],
    },
    task: {
      composite: ['Student_ID', 'Course_ID'],
      facts: ['Student_Name', 'Course_Name', 'Grade'],
      mapping: { Student_Name: 'Student_ID', Course_Name: 'Course_ID', Grade: 'Student_ID + Course_ID' },
    },
    revealTitle: '2NF',
    reveal: 'You already had atomic values. Removing facts that depend on only part of the key is second normal form.',
    xp: 160, health: 7,
    hints: ['Does Course ID help you know Ram’s name?', 'Grade needs both student and course.', 'Names belong beside their own IDs.'],
  },
  {
    id: 13, phase: 'REBUILD', title: 'Real Estate Office', place: 'Agency',
    quote: 'Agent Maya changed her phone.',
    mission: 'Split PROPERTY and AGENT so a phone change happens once.',
    image: '/cases/estate.jpg', kind: 'DRAG_GROUPS',
    table: {
      id: 're', name: 'Listings',
      columns: [{ name: 'Property_ID' }, { name: 'Property' }, { name: 'Agent_ID' }, { name: 'Agent_Name' }, { name: 'Agent_Phone' }],
      rows: [
        { Property_ID: 'P01', Property: 'Apartment', Agent_ID: 'A01', Agent_Name: 'Maya', Agent_Phone: '98111' },
        { Property_ID: 'P02', Property: 'House', Agent_ID: 'A01', Agent_Name: 'Maya', Agent_Phone: '98111' },
        { Property_ID: 'P03', Property: 'Office', Agent_ID: 'A02', Agent_Name: 'Ravi', Agent_Phone: '98112' },
      ],
    },
    task: {
      groups: ['PROPERTY', 'AGENT'],
      mapping: { Property_ID: 'PROPERTY', Property: 'PROPERTY', Agent_ID: 'AGENT', Agent_Name: 'AGENT', Agent_Phone: 'AGENT' },
    },
    revealTitle: '3NF',
    reveal: 'Agent phone depends on the agent, not the property. Breaking that chain is third normal form.',
    xp: 160, health: 7,
    hints: ['Maya appears twice with the same phone.', 'Phone belongs with Agent.', 'Keep Agent_ID on the property as a link.'],
  },
  {
    id: 14, phase: 'REBUILD', title: 'The Database That Lies', place: 'Sample extract',
    quote: 'Does student determine city? The sample looks like yes.',
    mission: 'Answer from the sample. Then Ram moves. Decide: was it a rule, or just these rows?',
    image: '/cases/university.jpg', kind: 'RULE_VS_DATA',
    table: {
      id: 'city', name: 'Students',
      columns: [{ name: 'Student' }, { name: 'City' }],
      rows: [
        { Student: 'Ram', City: 'Kathmandu' },
        { Student: 'Sita', City: 'Kathmandu' },
        { Student: 'Hari', City: 'Pokhara' },
      ],
    },
    task: {},
    revealTitle: 'Dependencies are rules',
    reveal: 'A few rows can look like a dependency. Ram can move. City is not a guaranteed rule from Student.',
    xp: 150, health: 6,
    hints: ['The sample has one city per student.', 'People move.', 'Rules come from the business, not three rows.'],
  },
  {
    id: 15, phase: 'PROTECT', title: 'Record Protector', place: 'Admissions',
    quote: 'The structure is clean. People are still entering bad data.',
    mission: 'Two patients share an ID. Accept or reject. Then a NULL identity arrives.',
    image: '/cases/hospital.jpg', kind: 'JUDGE',
    table: {
      id: 'p', name: 'Patients', primaryKey: ['Student_ID'],
      columns: [{ name: 'Student_ID', isPrimaryKey: true }, { name: 'Name' }],
      rows: [
        { Student_ID: 101, Name: 'Ram' },
        { Student_ID: 101, Name: 'Sita' },
      ],
    },
    task: {},
    revealTitle: 'Entity integrity',
    reveal: 'Every row needs a unique, non-empty identity. Duplicates and NULL keys are rejected.',
    xp: 140, health: 6, unlockTool: 'Shield',
    hints: ['Can two people share 101?', 'Reject the duplicate.', 'NULL is not an identity.'],
  },
  {
    id: 16, phase: 'PROTECT', title: 'Ghost Student', place: 'Enrollment desk',
    quote: 'Who is student 999?',
    mission: 'Find the enrollment that points at nobody.',
    image: '/cases/university.jpg', kind: 'GHOST',
    table: {
      id: 'en', name: 'Enrollment',
      columns: [{ name: 'Student_ID' }, { name: 'Course' }],
      rows: [
        { Student_ID: 101, Course: 'DBMS' },
        { Student_ID: 102, Course: 'Maths' },
        { Student_ID: 999, Course: 'Networking' },
      ],
    },
    task: {
      parent: [
        { Student_ID: 101, Name: 'Ram' },
        { Student_ID: 102, Name: 'Sita' },
      ],
      targetRow: 2,
    },
    revealTitle: 'Referential integrity',
    reveal: 'A reference must point at a real parent. 999 is a broken relationship.',
    xp: 140, health: 6,
    hints: ['Look at Student IDs in both tables.', '999 is not in Students.', 'Click that enrollment row.'],
  },
  {
    id: 17, phase: 'PROTECT', title: 'Wrong Age', place: 'Registration form',
    quote: 'These values were typed in this morning.',
    mission: 'Sort each value into VALID or INVALID. Think about allowed ranges.',
    image: '/cases/school.jpg', kind: 'DOMAIN_SORT',
    table: {
      id: 'form', name: 'Form',
      columns: [{ name: 'Field' }, { name: 'Value' }],
      rows: [
        { Field: 'Name', Value: 'Ram' },
        { Field: 'Age', Value: 245 },
        { Field: 'Semester', Value: 15 },
        { Field: 'Grade', Value: 'Z' },
      ],
    },
    task: {
      items: [
        { label: 'Name: Ram', valid: true },
        { label: 'Age: 245', valid: false },
        { label: 'Semester: 15', valid: false },
        { label: 'Grade: Z', valid: false },
      ],
    },
    revealTitle: 'Domain integrity',
    reveal: 'Each column has a legal set of values: age range, semester 1–8, grades A–F. That set is the domain.',
    xp: 140, health: 6,
    hints: ['Age 245 is not a human age.', 'Semesters here are 1–8.', 'Z is not a grade.'],
  },
  {
    id: 18, phase: 'MASTER', title: 'Event System Crisis', place: 'Campus events',
    quote: 'The university database is failing. Repair it. No labels.',
    mission: 'Split mixed lists, then group STUDENT, EVENT, ORGANIZER, and REGISTRATION. Then reject the bad records.',
    image: '/cases/university.jpg', kind: 'FINAL',
    table: {
      id: 'ev', name: 'Event dump',
      columns: [{ name: 'Student_ID' }, { name: 'Student_Name' }, { name: 'Event_ID' }, { name: 'Event_Name' }, { name: 'Organizer' }, { name: 'Organizer_Phone' }, { name: 'Events_Joined' }],
      rows: [
        { Student_ID: 101, Student_Name: 'Ram', Event_ID: 'E01', Event_Name: 'Hackathon', Organizer: 'Tech Club', Organizer_Phone: '98001', Events_Joined: 'E01, E03' },
        { Student_ID: 102, Student_Name: 'Sita', Event_ID: 'E02', Event_Name: 'Workshop', Organizer: 'Tech Club', Organizer_Phone: '98001', Events_Joined: 'E02' },
        { Student_ID: 103, Student_Name: 'Hari', Event_ID: 'E01', Event_Name: 'Hackathon', Organizer: 'Tech Club', Organizer_Phone: '98001', Events_Joined: 'E01' },
      ],
    },
    task: {
      groups: ['STUDENT', 'EVENT', 'ORGANIZER', 'REGISTRATION'],
      mapping: {
        Student_ID: 'STUDENT', Student_Name: 'STUDENT',
        Event_ID: 'EVENT', Event_Name: 'EVENT',
        Organizer: 'ORGANIZER', Organizer_Phone: 'ORGANIZER',
      },
    },
    revealTitle: 'Database engineer',
    reveal: 'You repaired a living system: atomic values, owned facts, then protected identities and references.',
    xp: 250, health: 15, unlockTool: 'Certificate',
    hints: ['Events_Joined is a list — split it in your head, then group entities.', 'Organizer phone belongs with the organizer.', 'Then reject duplicate IDs and unknown event IDs.'],
  },
];

export const caseMap: Record<number, CaseConfig> = Object.fromEntries(cases.map((c) => [c.id, c]));
export const TOTAL_CASES = cases.length;
