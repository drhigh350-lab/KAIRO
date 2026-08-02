export type ChallengeStatus = 'live' | 'upcoming' | 'ended';
export type ChallengeType = 'daily' | 'weekend_sprint' | 'subject' | 'speed' | 'accuracy' | 'mock_utme';
export type ChallengeAccent = 'navy' | 'blue' | 'gold';

export interface ChallengeQuestion {
  id: string;
  stem: string;
  options: string[];
  correct: number;
  why: string;
}

export interface Challenge {
  id: string;
  type: ChallengeType;
  title: string;
  theme: string;
  description: string;
  status: ChallengeStatus;
  timingLabel: string;
  questionCount: number;
  timeLimitSec: number | null;
  difficulty: 'Foundational' | 'Standard' | 'Advanced';
  participantCount: number;
  accent: ChallengeAccent;
  questions: ChallengeQuestion[];
}

const stoichiometryQuestions: ChallengeQuestion[] = [
  {
    id: 'wq1',
    stem: 'What is the molar mass of CaCO₃? (Ca=40, C=12, O=16)',
    options: ['100 g/mol', '116 g/mol', '84 g/mol', '56 g/mol'],
    correct: 0,
    why: '40 + 12 + (16 × 3) = 100 g/mol.',
  },
  {
    id: 'wq2',
    stem: 'How many moles of oxygen atoms are in 2 moles of CO₂?',
    options: ['1 mole', '2 moles', '4 moles', '6 moles'],
    correct: 2,
    why: 'Each CO₂ has 2 oxygen atoms, so 2 moles of CO₂ contains 4 moles of oxygen atoms.',
  },
  {
    id: 'wq3',
    stem: 'What volume does 1 mole of an ideal gas occupy at STP?',
    options: ['11.2 dm³', '22.4 dm³', '24.0 dm³', '44.8 dm³'],
    correct: 1,
    why: 'The molar volume of an ideal gas at STP is 22.4 dm³.',
  },
  {
    id: 'wq4',
    stem: 'In the reaction N₂ + 3H₂ → 2NH₃, how many moles of H₂ are needed to produce 4 moles of NH₃?',
    options: ['2 moles', '4 moles', '6 moles', '8 moles'],
    correct: 2,
    why: 'The ratio of H₂ to NH₃ is 3:2, so 4 moles of NH₃ needs 6 moles of H₂.',
  },
  {
    id: 'wq5',
    stem: 'What is the concentration of a solution containing 0.5 moles of solute in 250 cm³ of solution?',
    options: ['0.5 mol/dm³', '1.0 mol/dm³', '2.0 mol/dm³', '4.0 mol/dm³'],
    correct: 2,
    why: 'Concentration = moles / volume(dm³) = 0.5 / 0.25 = 2.0 mol/dm³.',
  },
];

const dailyQuestions: ChallengeQuestion[] = [
  {
    id: 'dq1',
    stem: 'Which literary device is used in "the wind whispered through the trees"?',
    options: ['Simile', 'Personification', 'Metaphor', 'Alliteration'],
    correct: 1,
    why: 'Giving the wind a human action (whispering) is personification.',
  },
  {
    id: 'dq2',
    stem: 'Simplify: (2x² × 3x³)',
    options: ['5x⁵', '6x⁵', '6x⁶', '5x⁶'],
    correct: 1,
    why: 'Multiply coefficients (2×3=6) and add exponents (2+3=5): 6x⁵.',
  },
  {
    id: 'dq3',
    stem: 'Which of these is a vector quantity?',
    options: ['Speed', 'Distance', 'Displacement', 'Energy'],
    correct: 2,
    why: 'Displacement has both magnitude and direction, making it a vector quantity.',
  },
  {
    id: 'dq4',
    stem: 'What is the powerhouse of the cell?',
    options: ['Nucleus', 'Ribosome', 'Mitochondrion', 'Golgi apparatus'],
    correct: 2,
    why: 'The mitochondrion generates most of the cell\'s ATP supply through respiration.',
  },
];

export const challenges: Challenge[] = [
  {
    id: 'ch_weekend_sprint',
    type: 'weekend_sprint',
    title: 'Weekend Sprint: Stoichiometry',
    theme: 'Chemistry',
    description: 'A fast-paced sprint through mole concept and stoichiometry — the topic that quietly decides most Chemistry scores.',
    status: 'live',
    timingLabel: 'Ends in 3h 12m',
    questionCount: 5,
    timeLimitSec: 150,
    difficulty: 'Standard',
    participantCount: 2413,
    accent: 'blue',
    questions: stoichiometryQuestions,
  },
  {
    id: 'ch_daily',
    type: 'daily',
    title: "Today's Daily Challenge",
    theme: 'Mixed Subjects',
    description: 'A light, four-question touchpoint across your subject combination — quick enough to do between classes.',
    status: 'live',
    timingLabel: 'Ends in 14h 40m',
    questionCount: 4,
    timeLimitSec: null,
    difficulty: 'Standard',
    participantCount: 5820,
    accent: 'navy',
    questions: dailyQuestions,
  },
  {
    id: 'ch_mock_utme',
    type: 'mock_utme',
    title: 'Mock UTME Event',
    theme: 'Full Subject Combination',
    description: 'A scheduled, full-length simulation of real UTME CBT conditions — timed, non-adaptive, exam-authentic.',
    status: 'upcoming',
    timingLabel: 'Starts Saturday, 9:00 AM',
    questionCount: 60,
    timeLimitSec: 3600,
    difficulty: 'Advanced',
    participantCount: 1120,
    accent: 'navy',
    questions: [],
  },
  {
    id: 'ch_accuracy',
    type: 'accuracy',
    title: 'Accuracy Challenge: Organic Chemistry',
    theme: 'Chemistry',
    description: 'No pressure timer — precision is what\'s scored here. Careless slips cost more than being slow.',
    status: 'upcoming',
    timingLabel: 'Starts tomorrow, 6:00 PM',
    questionCount: 5,
    timeLimitSec: null,
    difficulty: 'Standard',
    participantCount: 640,
    accent: 'gold',
    questions: stoichiometryQuestions,
  },
  {
    id: 'ch_speed_ended',
    type: 'speed',
    title: 'Speed Challenge: Algebra Basics',
    theme: 'Mathematics',
    description: 'A quick-recall sprint on algebraic manipulation.',
    status: 'ended',
    timingLabel: 'Ended yesterday',
    questionCount: 4,
    timeLimitSec: 90,
    difficulty: 'Foundational',
    participantCount: 3106,
    accent: 'blue',
    questions: dailyQuestions,
  },
];

export const liveChallenge = challenges.find((c) => c.status === 'live') ?? null;

export interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  isYou?: boolean;
}

const mockParticipantNames = [
  'Chiamaka O.', 'Ibrahim S.', 'Blessing A.', 'David E.', 'Fatima Y.',
  'Tunde K.', 'Ngozi C.', 'Segun A.', 'Amara N.', 'Yusuf B.',
];

export function buildLeaderboard(yourScore: number, totalQuestions: number): { entries: LeaderboardEntry[]; yourRank: number; totalParticipants: number } {
  const maxScore = totalQuestions * 10;
  const others: LeaderboardEntry[] = mockParticipantNames.map((name, i) => ({
    rank: 0,
    name,
    score: Math.max(0, Math.round(maxScore * (0.9 - i * 0.06) + (i % 2 === 0 ? 3 : -2))),
  }));
  const all = [...others, { rank: 0, name: 'You', score: yourScore, isYou: true }]
    .sort((a, b) => b.score - a.score)
    .map((e, i) => ({ ...e, rank: i + 1 }));

  const yourIndex = all.findIndex((e) => e.isYou);
  const windowStart = Math.max(0, yourIndex - 2);
  const windowEnd = Math.min(all.length, yourIndex + 3);

  return {
    entries: all.slice(windowStart, windowEnd),
    yourRank: yourIndex + 1,
    totalParticipants: all.length,
  };
}
