import React from 'react';
import { Quiz } from '../types';
import QuizDashboardView from './QuizDashboardView';

interface AdminDashboardViewProps {
  onSelectQuiz: (quizId: string) => void;
  onEditQuiz: (quiz: Quiz) => void;
  onLogout: () => void;
  onCreateQuiz: () => void;
}

const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ onSelectQuiz, onEditQuiz, onLogout, onCreateQuiz }) => {
  return (
    <div className="w-full min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-700">
        <h1 className="text-3xl font-black text-white tracking-tight">Панель Администратора</h1>
        <button onClick={onLogout} className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-500 transition-colors">Выйти</button>
      </div>
      <QuizDashboardView 
        onSelectQuiz={onSelectQuiz} 
        onEditQuiz={onEditQuiz} 
        onCreateQuiz={onCreateQuiz}
      />
    </div>
  );
};

export default AdminDashboardView;