import React, { useState } from 'react';
import * as api from '../services/api';
import { Player } from '../types.ts';

interface LandingViewProps {
  onJoinGame: (gameId: string, player: Player) => void;
  onGoToAdmin: () => void;
}

const LandingView: React.FC<LandingViewProps> = ({ onJoinGame, onGoToAdmin }) => {
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [gameIdInput, setGameIdInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!gameIdInput.trim() || !nameInput.trim()) {
      setError('Код игры и имя не могут быть пустыми.');
      return;
    }
    
    setIsLoading(true);
    try {
      const { player } = await api.joinGame(gameIdInput.trim().toUpperCase(), nameInput.trim());
      onJoinGame(gameIdInput.trim().toUpperCase(), player);
    } catch (err: any) {
      setError(err.message || 'Не удалось присоединиться к игре.');
    } finally {
      setIsLoading(false);
    }
  };

  const openJoinForm = () => {
    setShowJoinForm(true);
    setError('');
    setGameIdInput('');
    setNameInput('');
  }

  if (showJoinForm) {
    return (
      <div className="w-full max-w-md mx-auto text-center bg-gray-800 p-8 rounded-2xl shadow-2xl animate-fade-in">
        <h2 className="text-3xl font-bold text-white mb-6">Присоединиться к Игре</h2>
        <form onSubmit={handleJoin} className="space-y-4">
          <input
            type="text"
            placeholder="КОД ИГРЫ"
            value={gameIdInput}
            onChange={(e) => setGameIdInput(e.target.value.toUpperCase())}
            className="w-full text-center text-2xl font-bold tracking-widest bg-gray-700 text-white p-4 rounded-lg border-2 border-gray-600 focus:border-indigo-500 focus:ring-0 outline-none transition"
            maxLength={5}
            autoCapitalize="characters"
            autoFocus
            disabled={isLoading}
          />
          <input
            type="text"
            placeholder="Ваше Имя"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            className="w-full text-center text-xl font-bold bg-gray-700 text-white p-4 rounded-lg border-2 border-gray-600 focus:border-indigo-500 focus:ring-0 outline-none transition"
            maxLength={20}
            disabled={isLoading}
          />
          {error && <p className="text-red-400 mt-2">{error}</p>}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => setShowJoinForm(false)}
              disabled={isLoading}
              className="w-full bg-gray-600 text-white font-bold py-3 px-6 rounded-lg text-lg shadow-lg hover:bg-gray-500 focus:outline-none focus:ring-4 focus:ring-gray-500 focus:ring-opacity-50 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Назад
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg text-lg shadow-lg hover:bg-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-wait"
            >
              {isLoading ? 'Входим...' : 'Войти'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto text-center bg-gray-800 p-8 rounded-2xl shadow-2xl animate-fade-in">
      <h1 className="text-4xl font-black text-white mb-2 tracking-tight">CreoQuiz</h1>
      <p className="text-2xl font-bold text-indigo-400 mb-6">Обучение, которое ощущается как игра.</p>
      <p className="text-lg text-gray-300 mb-8 max-w-xl mx-auto">
        CreoQuiz — это ваша площадка для творчества, где сложные темы становятся простыми, а обучение — захватывающим приключением. Создавайте уникальные квизы, бросайте вызов своей команде и открывайте новые горизонты знаний вместе!
      </p>
      <div className="flex justify-center">
        <button
          onClick={openJoinForm}
          className="w-full max-w-sm bg-indigo-600 text-white font-bold py-4 px-8 rounded-lg text-xl shadow-lg hover:bg-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 transform hover:scale-105 transition-all duration-300"
        >
          Присоединиться к Игре
        </button>
      </div>
       <div className="mt-8 pt-6 border-t border-gray-700">
         <button
          onClick={onGoToAdmin}
          className="text-sm text-gray-400 hover:text-indigo-400 cursor-pointer transition-colors"
        >
          Панель администратора
        </button>
       </div>
    </div>
  );
};

export default LandingView;