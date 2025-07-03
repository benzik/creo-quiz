import React, { useState } from 'react';
import * as api from '../services/api';

interface AdminLoginViewProps {
  onLoginSuccess: () => void;
  onExit: () => void;
}

const AdminLoginView: React.FC<AdminLoginViewProps> = ({ onLoginSuccess, onExit }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await api.login(password);
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || 'Неверный пароль');
      setPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto text-center bg-gray-800 p-8 rounded-2xl shadow-2xl animate-fade-in">
      <h2 className="text-3xl font-bold text-white mb-6">Вход для Администратора</h2>
      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError('');
          }}
          className="w-full text-center text-xl font-bold bg-gray-700 text-white p-4 rounded-lg border-2 border-gray-600 focus:border-indigo-500 focus:ring-0 outline-none transition"
          autoFocus
          disabled={isLoading}
        />
        {error && <p className="text-red-400">{error}</p>}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onExit}
            disabled={isLoading}
            className="w-full bg-gray-600 text-white font-bold py-3 px-6 rounded-lg text-lg shadow-lg hover:bg-gray-500 focus:outline-none focus:ring-4 focus:ring-gray-500 focus:ring-opacity-50 transform hover:scale-105 transition-all duration-300 disabled:opacity-50"
          >
            Назад
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-lg text-lg shadow-lg hover:bg-green-500 focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-opacity-50 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-wait"
          >
            {isLoading ? 'Проверка...' : 'Войти'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminLoginView;