export interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  name: string;
  description: string;
  questions: Question[];
}

export interface Player {
  id: string;
  name: string;
}

export type GamePhase = 'lobby' | 'question' | 'results' | 'finished';

export interface AnswerDistribution {
  [optionIndex: number]: number;
}

export interface GameState {
  id: string;
  quizId: string;
  quizName: string;
  quizDescription: string;
  phase: GamePhase;
  players: Player[];
  questions: Question[];
  currentQuestionIndex: number;
  answers: { [playerId: string]: number };
  answerDistribution: AnswerDistribution;
}