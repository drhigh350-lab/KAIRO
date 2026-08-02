export interface CbtQuestion {
  stem: string;
  options: string[];
  correct: number;
}

export const cbtSubjects: string[] = ['English Language', 'Mathematics', 'Physics', 'Chemistry'];

export const cbtQuestions: Record<string, CbtQuestion[]> = {
  'English Language': [
    { stem: 'Choose the option that best completes the sentence: "Neither the teacher nor the students ___ ready for the test."', options: ['was', 'were', 'is', 'has been'], correct: 1 },
    { stem: 'Select the correctly spelt word.', options: ['Recieve', 'Receive', 'Receeve', 'Receve'], correct: 1 },
    { stem: 'Choose the word nearest in meaning to "meticulous."', options: ['Careless', 'Thorough', 'Hasty', 'Vague'], correct: 1 },
    { stem: 'Choose the option opposite in meaning to "abundant."', options: ['Plentiful', 'Scarce', 'Ample', 'Copious'], correct: 1 },
  ],
  'Mathematics': [
    { stem: 'Simplify: 2/3 + 1/6', options: ['1/2', '5/6', '3/9', '1'], correct: 1 },
    { stem: 'If y = 3x + 2 and x = 4, find y.', options: ['10', '12', '14', '16'], correct: 2 },
    { stem: 'Find the value of x if 2x + 5 = 15.', options: ['4', '5', '6', '7'], correct: 1 },
    { stem: 'What is the next number in the sequence 2, 4, 8, 16, ___?', options: ['20', '24', '32', '18'], correct: 2 },
  ],
  'Physics': [
    { stem: 'The SI unit of electric current is the:', options: ['Volt', 'Ohm', 'Ampere', 'Watt'], correct: 2 },
    { stem: 'What is the acceleration due to gravity approximately equal to?', options: ['8.9 m/s²', '9.8 m/s²', '10.8 m/s²', '11.2 m/s²'], correct: 1 },
    { stem: 'Which quantity is a vector?', options: ['Speed', 'Distance', 'Velocity', 'Energy'], correct: 2 },
    { stem: 'The energy possessed by a moving object is called:', options: ['Potential energy', 'Kinetic energy', 'Chemical energy', 'Thermal energy'], correct: 1 },
  ],
  'Chemistry': [
    { stem: 'The atomic number of an element represents the number of:', options: ['Neutrons', 'Protons', 'Electrons and neutrons', 'Isotopes'], correct: 1 },
    { stem: 'Which gas turns lime water milky?', options: ['Oxygen', 'Hydrogen', 'Carbon dioxide', 'Nitrogen'], correct: 2 },
    { stem: 'What is the pH of a neutral solution?', options: ['0', '7', '14', '10'], correct: 1 },
    { stem: 'Which of these is a noble gas?', options: ['Chlorine', 'Argon', 'Oxygen', 'Nitrogen'], correct: 1 },
  ],
};
