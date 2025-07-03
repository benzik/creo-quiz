import React, { useState } from 'react';

interface AdminDashboardViewProps {
  onCreateGame: () => Promise<void>;
  onEditQuestions: () => void;
  onLogout: () => void;
}

const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ onCreateGame, onEditQuestions, onLogout }) => {
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    setIsCreating(true);
    await onCreateGame();
    // No need to set isCreating to false as the view will change
  };

  return (
    <div className="w-full max-w-2xl mx-auto text-center bg-gray-800 p-8 rounded-2xl shadow-2xl animate-fade-in">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-700">
        <h1 className="text-3xl font-black text-white tracking-tight">Панель Администратора</h1>
        <button onClick={onLogout} className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-500 transition-colors">Выйти</button>
      </div>
      
      <p className="text-lg text-gray-300 mb-8">
        Вы вошли как администратор. Отсюда вы можете управлять курсом и запускать новые игровые сессии.
      </p>

      <div className="flex flex-col md:flex-row gap-4 justify-center">
        <button
          onClick={handleCreate}
          disabled={isCreating}
          className="w-full md:w-auto bg-green-600 text-white font-bold py-4 px-8 rounded-lg text-xl shadow-lg hover:bg-green-500 focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-opacity-50 transform hover:scale-105 transition-all duration-300 disabled:bg-gray-600 disabled:cursor-wait"
        >
          {isCreating ? 'Создаем...' : 'Создать Новую Игру'}
        </button>
        <button
          onClick={onEditQuestions}
          disabled={isCreating}
          className="w-full md:w-auto bg-indigo-600 text-white font-bold py-4 px-8 rounded-lg text-xl shadow-lg hover:bg-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 transform hover:scale-105 transition-all duration-300 disabled:opacity-50"
        >
          Редактор Вопросов
        </button>
      </div>
    </div>
  );
};

export default AdminDashboardView;