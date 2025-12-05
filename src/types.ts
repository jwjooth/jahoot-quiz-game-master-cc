export interface Player {
  id: string;
  name: string;
  gamePin: string;
  score: number;
  answers: Array<{
    questionIndex: number;
    answerIndex: number;
    timeLeft: number;
    isCorrect: boolean;
    pointsEarned: number;
    answeredAt: Date;
  }>;
  joinedAt: Date;
  lastAnswer?: number;
  lastAnswerTime?: number;
}

export interface Question {
  questionText: string;
  options: string[];
  correctAnswer: number; // 0-3
  time: number; // seconds
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  category: string;
  questions: Question[];
}

export interface GameData {
  id: string;
  pin: string;     
  hostId: string;
  status: 'waiting' | 'playing' | 'intermesso' | 'finished';
  quiz: Quiz;
  currentQuestionIndex: number;
  players?: Player[];
  questionStartTime?: number | null;
  questionDuration?: number; // Duration soal dalam detik
  intermessoStartTime?: number | null; // Timestamp saat intermesso dimulai
  intermessoDuration?: number; // Duration intermesso dalam detik (default 15)
  expiresAt?: number; 
  createdAt: Date;
  updatedAt: Date;
}