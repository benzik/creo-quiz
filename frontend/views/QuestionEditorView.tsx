import React, { useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';
import { Question } from '../types.ts';
import Spinner from '../components/Spinner';

interface QuestionEditorViewProps {
  onExit: () => void;
}

const QuestionEditorView: React.FC<QuestionEditorViewProps> = ({ onExit }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchQuestions = useCallback(async () => {
    try {
      setIsLoading(true);
      const fetchedQuestions = await api.getQuestions();
      
      // Отладочный код - проверяем данные вопросов
      console.log('Полученные вопросы:', fetchedQuestions);
      console.log('Первый вопрос имеет correctAnswerIndex?', fetchedQuestions[0]?.correctAnswerIndex !== undefined);
      // Используем any для доступа к полю, которого нет в типе Question
      console.log('Первый вопрос имеет correctAnswer?', (fetchedQuestions[0] as any)?.correctAnswer !== undefined);
      console.log('Значение correctAnswerIndex первого вопроса:', fetchedQuestions[0]?.correctAnswerIndex);
      
      // Проверяем тип данных correctAnswerIndex
      console.log('Тип данных correctAnswerIndex:', typeof fetchedQuestions[0]?.correctAnswerIndex);
      
      // Дополнительная проверка первых 5 вопросов
      for (let i = 0; i < Math.min(5, fetchedQuestions.length); i++) {
        console.log(`Вопрос ${i+1}: id=${fetchedQuestions[i].id}, correctAnswerIndex=${fetchedQuestions[i].correctAnswerIndex}`);
      }
      
      setQuestions(fetchedQuestions);
    } catch (err: any) {
      setError(err.message || 'Не удалось загрузить вопросы');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleQuestionChange = (id: string, field: 'questionText' | 'explanation', value: string) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const handleOptionChange = (qId: string, optIndex: number, value: string) => {
    setQuestions(prev => prev.map(q => q.id === qId ? { ...q, options: q.options.map((opt, i) => i === optIndex ? value : opt) } : q));
  };

  const handleCorrectAnswerChange = (qId: string, optIndex: number) => {
    setQuestions(prev => prev.map(q => q.id === qId ? { ...q, correctAnswerIndex: optIndex } : q));
  };

  const handleDeleteQuestion = (id: string) => {
    if (confirm('Вы уверены, что хотите удалить этот вопрос?')) {
      setQuestions(prev => prev.filter(q => q.id !== id));
    }
  };

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      questionText: 'Новый вопрос',
      options: ['Вариант 1', 'Вариант 2', 'Вариант 3', 'Вариант 4'],
      correctAnswerIndex: 0,
      explanation: 'Объяснение для нового вопроса.'
    };
    setQuestions(prev => [...prev, newQuestion]);
  };
  
  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      await api.saveAllQuestions(questions);
      alert('Все изменения сохранены!');
    } catch(err: any) {
      setError(err.message || "Ошибка при сохранении");
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
        <div className="text-center py-20">
            <Spinner />
            <p className="mt-4 text-xl">Загрузка вопросов...</p>
        </div>
    )
  }

  if (error) {
    return <div className="text-center text-red-400">Ошибка: {error}</div>
  }

  return (
    <div className="bg-gray-800 p-6 md:p-8 rounded-2xl shadow-2xl animate-fade-in w-full">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-700">
        <h1 className="text-3xl font-black text-white tracking-tight">Редактор Вопросов</h1>
        <button onClick={onExit} disabled={isSaving} className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-500 transition-colors disabled:opacity-50">Назад</button>
      </div>

      <div className="space-y-6">
        {questions.map((q, qIndex) => (
          <div key={q.id} className="bg-gray-900/70 p-4 rounded-lg border border-gray-700">
            <div className="flex justify-between items-center mb-3">
              <label className="text-xl font-bold text-indigo-300">Вопрос {qIndex + 1}</label>
              <button onClick={() => handleDeleteQuestion(q.id)} className="text-sm bg-red-800 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded">
                Удалить
              </button>
            </div>
            <textarea
              value={q.questionText}
              onChange={(e) => handleQuestionChange(q.id, 'questionText', e.target.value)}
              className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-indigo-500 outline-none"
              rows={2}
            />
            
            <h4 className="text-lg font-semibold mt-4 mb-2 text-gray-200">Варианты ответов:</h4>
            <div className="space-y-2">
              {q.options.map((opt, optIndex) => (
                <div key={optIndex} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`correct-answer-${q.id}`}
                    checked={Number(q.correctAnswerIndex) === optIndex}
                    onChange={() => handleCorrectAnswerChange(q.id, optIndex)}
                    className="form-radio h-5 w-5 text-green-500 bg-gray-700 border-gray-600 focus:ring-green-500"
                  />
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleOptionChange(q.id, optIndex, e.target.value)}
                    className={`w-full p-2 rounded border text-white ${Number(q.correctAnswerIndex) === optIndex ? 'bg-green-900/50 border-green-500' : 'bg-gray-700 border-gray-600'} focus:border-indigo-500 outline-none`}
                  />
                </div>
              ))}
            </div>

            <h4 className="text-lg font-semibold mt-4 mb-2 text-gray-200">Пояснение:</h4>
            <textarea
              value={q.explanation}
              onChange={(e) => handleQuestionChange(q.id, 'explanation', e.target.value)}
              className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-indigo-500 outline-none"
              rows={3}
            />
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-6 border-t border-gray-700 flex flex-wrap gap-4 justify-between items-center">
        <button onClick={handleAddQuestion} disabled={isSaving} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50">
          + Добавить вопрос
        </button>
        <button 
            onClick={handleSaveChanges} 
            disabled={isSaving}
            className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors disabled:bg-gray-600 disabled:cursor-wait"
        >
          {isSaving ? 'Сохранение...' : 'Сохранить все изменения'}
        </button>
      </div>
    </div>
  );
};

export default QuestionEditorView;