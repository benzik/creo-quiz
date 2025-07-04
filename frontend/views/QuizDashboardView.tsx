import React, { useState, useEffect } from 'react';
import { Quiz } from '../types';
import { getQuizzes, deleteQuiz, duplicateQuiz } from '../services/quizApi';
import Spinner from '../components/Spinner';

// --- SVG Icons for buttons ---
const PlayIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>;
const DuplicateIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" /><path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h6a2 2 0 00-2-2H5z" /></svg>;
const DeleteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>;

interface QuizDashboardViewProps {
  onSelectQuiz: (quizId: string) => void;
  onEditQuiz: (quiz: Quiz) => void;
  onCreateQuiz: () => void;
}

const QuizDashboardView: React.FC<QuizDashboardViewProps> = ({ onSelectQuiz, onEditQuiz, onCreateQuiz }) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setIsLoading(true);
      const data = await getQuizzes();
      setQuizzes(data);
      setError(null);
    } catch (err) {
      setError('Не удалось загрузить викторины. Попробуйте снова.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (quizId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить эту викторину?')) {
      try {
        await deleteQuiz(quizId);
        setQuizzes(quizzes.filter(q => q.id !== quizId));
      } catch (err) {
        setError('Не удалось удалить викторину.');
      }
    }
  };

  const handleDuplicate = async (quizId: string) => {
    try {
      const duplicated = await duplicateQuiz(quizId);
      setQuizzes([...quizzes, duplicated]);
    } catch (err) {
      setError('Не удалось дублировать викторину.');
    }
  };

  const getQuestionWord = (count: number) => {
    const cases = [2, 0, 1, 1, 1, 2];
    const titles = ['вопрос', 'вопроса', 'вопросов'];
    return titles[(count % 100 > 4 && count % 100 < 20) ? 2 : cases[(count % 10 < 5) ? count % 10 : 5]];
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <div className="text-center">
          <Spinner />
          <p className="text-white text-2xl mt-4">Загрузка викторин...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <div className="bg-red-900/50 border border-red-700 text-red-300 px-6 py-4 rounded-lg text-center" role="alert">
          <strong className="font-bold text-lg">Ошибка!</strong>
          <p className="block mt-2">{error}</p>
          <button onClick={fetchQuizzes} className="mt-4 bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">
            Повторить
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gray-900 min-h-screen text-white animate-fade-in">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">Панель викторин</h1>
          <button
            onClick={onCreateQuiz}
            className="flex items-center bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 shadow-lg transform hover:scale-105"
          >
            <PlusIcon />
            <span className="ml-2 hidden md:inline">Создать викторину</span>
          </button>
        </div>

        {quizzes.length === 0 ? (
          <div className="text-center py-20 bg-gray-800 rounded-lg border-2 border-dashed border-gray-700">
            <h2 className="text-2xl font-bold mb-2">Пока нет ни одной викторины</h2>
            <p className="text-gray-400 mb-6">Нажмите "Создать викторину", чтобы начать.</p>
            <button
              onClick={onCreateQuiz}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 shadow-lg transform hover:scale-105"
            >
              Создать первую викторину
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map(quiz => (
              <div key={quiz.id} className="bg-gray-800 rounded-xl shadow-lg flex flex-col justify-between overflow-hidden border border-gray-700 hover:border-indigo-500 transition-all duration-300 transform hover:-translate-y-1">
                <div className="p-5">
                  <h3 className="text-xl font-bold text-indigo-300 mb-2 truncate">{quiz.name}</h3>
                  <p className="text-gray-400 h-20 overflow-y-auto mb-4 text-sm scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">{quiz.description || 'Нет описания.'}</p>
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="bg-gray-700 text-indigo-300 text-xs font-semibold px-2.5 py-1 rounded-full">
                      {quiz.questions.length} {getQuestionWord(quiz.questions.length)}
                    </span>
                    <span className="bg-gray-700 text-gray-400 text-xs font-mono px-2.5 py-1 rounded-full" title="ID Викторины">ID: {quiz.id}</span>
                  </div>
                </div>
                <div className="bg-gray-900/70 p-2 grid grid-cols-2 gap-2">
                                                      <button onClick={() => quiz.id && onSelectQuiz(quiz.id)} className="flex items-center justify-center text-sm py-2 px-2 rounded-md bg-green-600/20 text-green-300 hover:bg-green-600/40 transition-colors"><PlayIcon/> <span className='ml-1.5'>Начать</span></button>
                  <button onClick={() => onEditQuiz(quiz)} className="flex items-center justify-center text-sm py-2 px-2 rounded-md bg-blue-600/20 text-blue-300 hover:bg-blue-600/40 transition-colors"><EditIcon/> <span className='ml-1.5'>Изменить</span></button>
                  <button onClick={() => quiz.id && handleDuplicate(quiz.id)} className="flex items-center justify-center text-sm py-2 px-2 rounded-md bg-purple-600/20 text-purple-300 hover:bg-purple-600/40 transition-colors"><DuplicateIcon/> <span className='ml-1.5'>Копия</span></button>
                  <button onClick={() => quiz.id && handleDelete(quiz.id)} className="flex items-center justify-center text-sm py-2 px-2 rounded-md bg-red-600/20 text-red-300 hover:bg-red-600/40 transition-colors"><DeleteIcon/> <span className='ml-1.5'>Удалить</span></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizDashboardView;
