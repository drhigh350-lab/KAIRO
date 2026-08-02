export interface Topic {
  key: string;
  label: string;
  subtopics: string[];
}

export interface Subject {
  key: string;
  label: string;
  topics: Topic[];
}

export interface Difficulty {
  key: string;
  label: string;
  desc: string;
}

export interface PracticeQuestion {
  id: string;
  subject: string;
  topic: string;
  subtopic: string;
  stem: string;
  options: string[];
  correct: number;
  why: string;
  wrongWhy: Record<number, string>;
  mistake: string;
  concept: string;
  tip: string;
  kai: string;
}

export const subjects: Subject[] = [
  { key: 'physics', label: 'Physics', topics: [
    { key: 'mechanics', label: 'Mechanics', subtopics: ["Newton's Laws", 'Kinematics', 'Work & Energy'] },
    { key: 'electricity', label: 'Electricity', subtopics: ['Current & Circuits', 'Electromagnetism'] },
    { key: 'waves', label: 'Waves & Optics', subtopics: ['Wave Properties', 'Reflection & Refraction'] },
  ]},
  { key: 'chemistry', label: 'Chemistry', topics: [
    { key: 'atomic', label: 'Atomic Structure', subtopics: ['Periodic Table', 'Bonding'] },
    { key: 'organic', label: 'Organic Chemistry', subtopics: ['Hydrocarbons', 'Functional Groups'] },
  ]},
  { key: 'biology', label: 'Biology', topics: [
    { key: 'cell', label: 'Cell Biology', subtopics: ['Cell Structure', 'Cell Division'] },
    { key: 'genetics', label: 'Genetics', subtopics: ['Inheritance', 'Mutation'] },
  ]},
  { key: 'english', label: 'English Language', topics: [
    { key: 'comprehension', label: 'Comprehension', subtopics: [] },
    { key: 'lexis', label: 'Lexis & Structure', subtopics: [] },
  ]},
  { key: 'mathematics', label: 'Mathematics', topics: [
    { key: 'algebra', label: 'Algebra', subtopics: ['Equations', 'Simultaneous Equations'] },
    { key: 'geometry', label: 'Geometry', subtopics: ['Circle Theorems', 'Trigonometry'] },
  ]},
];

export const difficulties: Difficulty[] = [
  { key: 'adaptive', label: 'Adaptive', desc: 'Kairo adjusts difficulty as you answer' },
  { key: 'easy', label: 'Easy', desc: 'Build confidence with fundamentals' },
  { key: 'medium', label: 'Medium', desc: 'Standard UTME difficulty' },
  { key: 'hard', label: 'Hard', desc: 'Challenge yourself with tougher questions' },
];

export const sessionLengths: number[] = [10, 15, 20, 30];

export const practiceQuestions: PracticeQuestion[] = [
  {
    id: 'p1', subject: 'Physics', topic: 'Mechanics', subtopic: "Newton's Laws",
    stem: 'A body of mass 2 kg is acted on by a constant force of 10 N. What is its acceleration?',
    options: ['2 m/s²', '5 m/s²', '8 m/s²', '10 m/s²'], correct: 1,
    why: 'Newton’s Second Law states F = ma, so a = F / m = 10 / 2 = 5 m/s².',
    wrongWhy: { 0: 'This divides mass by force instead of force by mass.', 2: 'This subtracts rather than divides the given values.', 3: 'This uses the force value alone, ignoring mass.' },
    mistake: 'Students often invert the formula, dividing mass by force instead of force by mass.',
    concept: 'Force, mass and acceleration are related by F = ma — the foundation of classical mechanics.',
    tip: 'Always isolate the variable you need before substituting numbers: a = F / m.',
    kai: 'Think of it as: force is the push, mass is the resistance to that push. More push or less resistance means more acceleration.',
  },
  {
    id: 'p2', subject: 'Physics', topic: 'Mechanics', subtopic: "Newton's Laws",
    stem: 'Which of Newton’s laws explains why a passenger jerks forward when a moving bus stops suddenly?',
    options: ['First Law', 'Second Law', 'Third Law', 'Law of Gravitation'], correct: 0,
    why: 'The First Law (inertia) states a body continues in its state of motion unless acted upon by a force — the passenger’s body keeps moving forward.',
    wrongWhy: { 1: 'The Second Law relates force to acceleration, not this inertial effect.', 2: 'The Third Law concerns action-reaction pairs, not a single body’s inertia.', 3: 'Gravitation is unrelated to this scenario.' },
    mistake: 'Confusing inertia (First Law) with the action-reaction pairing of the Third Law.',
    concept: 'Inertia is the tendency of an object to resist changes in its state of motion.',
    tip: 'Whenever a question describes something "continuing to move" or "resisting a change," think First Law.',
    kai: 'Your body wants to keep moving at the bus’s original speed — the seatbelt is what eventually applies the stopping force to you.',
  },
  {
    id: 'p3', subject: 'Chemistry', topic: 'Atomic Structure', subtopic: 'Periodic Table',
    stem: 'An element X has electronic configuration 2,8,7. Which group of the periodic table does it belong to?',
    options: ['Group I', 'Group IV', 'Group VII', 'Group VIII'], correct: 2,
    why: 'The number of electrons in the outermost shell (7) determines the group number — Group VII (the halogens).',
    wrongWhy: { 0: 'Group I elements have 1 outer electron, not 7.', 1: 'Group IV elements have 4 outer electrons.', 3: 'Group VIII (noble gases) have a full outer shell of 8.' },
    mistake: 'Mixing up the number of shells (periods) with the number of outer electrons (groups).',
    concept: 'For main-group elements, the outermost electron count equals the group number.',
    tip: 'Read electron configuration right to left — the last number is your group number.',
    kai: '2,8,7 reads as: 2 in the first shell, 8 in the second, 7 in the outer shell — and that last 7 is the group.',
  },
  {
    id: 'p4', subject: 'Biology', topic: 'Cell Biology', subtopic: 'Cell Division',
    stem: 'During which phase of mitosis do chromosomes align at the cell’s equator?',
    options: ['Prophase', 'Metaphase', 'Anaphase', 'Telophase'], correct: 1,
    why: 'Metaphase is defined by chromosomes lining up along the metaphase plate (the cell’s equator).',
    wrongWhy: { 0: 'Prophase is when chromatin condenses into visible chromosomes.', 2: 'Anaphase is when sister chromatids separate and move to opposite poles.', 3: 'Telophase is when nuclear membranes reform around each set of chromosomes.' },
    mistake: 'Mixing up the order of mitotic phases — remembering "PMAT" helps.',
    concept: 'Mitosis proceeds through Prophase → Metaphase → Anaphase → Telophase, each with a distinct chromosome arrangement.',
    tip: 'Remember PMAT: Prophase, Metaphase, Anaphase, Telophase — in that order.',
    kai: 'Picture the chromosomes lining up like students at the middle of a room before splitting into two groups — that’s metaphase.',
  },
  {
    id: 'p5', subject: 'Mathematics', topic: 'Algebra', subtopic: 'Equations',
    stem: 'Solve for x: 3x − 7 = 11',
    options: ['x = 4', 'x = 6', 'x = 8', 'x = 18'], correct: 1,
    why: 'Add 7 to both sides: 3x = 18, then divide by 3: x = 6.',
    wrongWhy: { 0: 'This comes from dividing 11 by an incorrect coefficient.', 2: 'This adds 7 incorrectly before isolating x.', 3: 'This is 3x itself, before dividing by 3.' },
    mistake: 'Forgetting to divide both sides by the coefficient after isolating the x term.',
    concept: 'Solving linear equations means isolating the variable through inverse operations, applied to both sides equally.',
    tip: 'Undo operations in reverse order: addition/subtraction first, then multiplication/division.',
    kai: 'Whatever you do to one side of the equation, you must do to the other — that keeps it balanced.',
  },
];
