export interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
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
  phase: GamePhase;
  players: Player[];
  questions: Question[];
  currentQuestionIndex: number;
  answers: { [playerId: string]: number };
  answerDistribution: AnswerDistribution;
}