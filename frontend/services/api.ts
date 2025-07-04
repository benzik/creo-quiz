import { GameState, Player } from '../types.ts';

// The base URL is now relative, as Nginx will proxy the requests.
const API_URL = '/api';

async function handleResponse(response: Response) {
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Произошла ошибка на сервере');
    }
    return data;
}

export async function login(password: string): Promise<{ success: boolean }> {
    const response = await fetch(`/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
    });
    return handleResponse(response);
}



export async function createGame(quizId: string): Promise<GameState> {
    const response = await fetch(`${API_URL}/games`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId }),
    });
    return handleResponse(response);
}

export async function joinGame(gameId: string, playerName: string): Promise<{ player: Player }> {
    const response = await fetch(`${API_URL}/games/${gameId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName }),
    });
    return handleResponse(response);
}

export async function startGame(gameId: string): Promise<{ success: boolean }> {
    const response = await fetch(`${API_URL}/games/${gameId}/start`, { method: 'POST' });
    return handleResponse(response);
}

export async function submitAnswer(gameId: string, playerId: string, answerIndex: number): Promise<{ success: boolean }> {
    const response = await fetch(`${API_URL}/games/${gameId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, answerIndex }),
    });
    return handleResponse(response);
}

export async function showResults(gameId: string): Promise<{ success: boolean }> {
    const response = await fetch(`${API_URL}/games/${gameId}/results`, { method: 'POST' });
    return handleResponse(response);
}

export async function nextQuestion(gameId: string): Promise<{ success: boolean }> {
    const response = await fetch(`${API_URL}/games/${gameId}/next`, { method: 'POST' });
    return handleResponse(response);
}

export async function restartGame(gameId: string): Promise<{ success: boolean }> {
    const response = await fetch(`${API_URL}/games/${gameId}/restart`, { method: 'POST' });
    return handleResponse(response);
}