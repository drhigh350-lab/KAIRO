export interface Course {
  name: string;
  subjects: string[];
}

export interface OnboardingData {
  name: string;
  email: string;
  examYear: string | null;
  course: Course | null;
  subjects: string[];
}

export const allSubjects: string[] = [
  'English Language',
  'Mathematics',
  'Biology',
  'Chemistry',
  'Physics',
  'Economics',
  'Government',
  'Literature in English',
  'CRS/IRS',
  'Accounting',
  'Commerce',
  'Geography',
  'Agricultural Science',
  'History',
];

export const examYears: string[] = ['UTME 2027', 'UTME 2028', 'Other'];

export const courses: Course[] = [
  { name: 'Medicine & Surgery', subjects: ['English Language', 'Biology', 'Chemistry', 'Physics'] },
  { name: 'Nursing Science', subjects: ['English Language', 'Biology', 'Chemistry', 'Physics'] },
  { name: 'Pharmacy', subjects: ['English Language', 'Biology', 'Chemistry', 'Physics'] },
  { name: 'Engineering (All)', subjects: ['English Language', 'Mathematics', 'Physics', 'Chemistry'] },
  { name: 'Computer Science', subjects: ['English Language', 'Mathematics', 'Physics', 'Chemistry'] },
  { name: 'Law', subjects: ['English Language', 'Literature in English', 'Government', 'CRS/IRS'] },
  { name: 'Accounting', subjects: ['English Language', 'Mathematics', 'Economics', 'Accounting'] },
  { name: 'Economics', subjects: ['English Language', 'Mathematics', 'Economics', 'Government'] },
  { name: 'Mass Communication', subjects: ['English Language', 'Literature in English', 'Government', 'CRS/IRS'] },
  { name: 'Architecture', subjects: ['English Language', 'Mathematics', 'Physics', 'Chemistry'] },
];
