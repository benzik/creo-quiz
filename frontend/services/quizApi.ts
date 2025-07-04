import { Quiz } from '../types';

const API_BASE_URL = '/api';

// Получить все викторины
export const getQuizzes = async (): Promise<Quiz[]> => {
  const response = await fetch(`${API_BASE_URL}/quizzes`);
  if (!response.ok) {
    throw new Error('Не удалось загрузить викторины');
  }
  return response.json();
};

// Создать новую викторину
export const createQuiz = async (quiz: Omit<Quiz, 'id'>): Promise<Quiz> => {
  const response = await fetch(`${API_BASE_URL}/quizzes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(quiz),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Не удалось создать викторину');
  }
  return response.json();
};

// Обновить викторину
export const updateQuiz = async (quiz: Quiz): Promise<Quiz> => {
  const response = await fetch(`${API_BASE_URL}/quizzes/${quiz.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(quiz),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Не удалось обновить викторину');
  }
  return response.json();
};

// Удалить викторину
export const deleteQuiz = async (quizId: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/quizzes/${quizId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Не удалось удалить викторину');
  }
};

// Дублировать викторину
export const duplicateQuiz = async (quizId: string): Promise<Quiz> => {
  const response = await fetch(`${API_BASE_URL}/quizzes/${quizId}/duplicate`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Не удалось дублировать викторину');
  }
  return response.json();
};
