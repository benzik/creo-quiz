import React, { useState, useEffect } from 'react';
import { Quiz, Question } from '../types';
import { updateQuiz, createQuiz } from '../services/quizApi';

interface QuestionEditorViewProps {
  quiz: Quiz;
  onExit: () => void;
}

const QuestionEditorView: React.FC<QuestionEditorViewProps> = ({ quiz, onExit }) => {
  const [editedQuiz, setEditedQuiz] = useState<Quiz | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Deep copy and sanitize the quiz data
    const quizCopy = JSON.parse(JSON.stringify(quiz));
    quizCopy.questions = quizCopy.questions.map((q: Question) => ({
      ...q,
      correctAnswer: Number(q.correctAnswer),
    }));
    setEditedQuiz(quizCopy);
  }, [quiz]);

  const handleQuizDetailsChange = (field: 'name' | 'description', value: string) => {
    setEditedQuiz(prev => ({ ...prev!, [field]: value }));
  };

  const handleQuestionChange = (id: string, field: 'questionText' | 'explanation', value: string) => {
    setEditedQuiz(prev => ({
      ...prev!,
      questions: prev!.questions.map(q => (q.id === id ? { ...q, [field]: value } : q)),
    }));
  };

  const handleOptionChange = (qId: string, optIndex: number, value: string) => {
    setEditedQuiz(prev => ({
      ...prev!,
      questions: prev!.questions.map(q =>
        q.id === qId
          ? { ...q, options: q.options.map((opt, i) => (i === optIndex ? value : opt)) }
          : q
      ),
    }));
  };

  const handleCorrectAnswerChange = (qId: string, optIndex: number) => {
    setEditedQuiz(prev => ({
      ...prev!,
      questions: prev!.questions.map(q => (q.id === qId ? { ...q, correctAnswer: optIndex } : q)),
    }));
  };

  const handleDeleteQuestion = (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот вопрос?')) {
      setEditedQuiz(prev => ({
        ...prev!,
        questions: prev!.questions.filter(q => q.id !== id),
      }));
    }
  };

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      questionText: 'Новый вопрос',
      options: ['Вариант 1', 'Вариант 2', 'Вариант 3', 'Вариант 4'],
      correctAnswer: 0,
      explanation: 'Объяснение для нового вопроса.',
    };
    setEditedQuiz(prev => ({ ...prev!, questions: [...prev!.questions, newQuestion] }));
  };

  const handleSaveChanges = async () => {
    if (!editedQuiz || !editedQuiz.name) {
      setError('Название викторины не может быть пустым.');
      return;
    }
    setIsSaving(true);
    setError('');
    try {
      if (editedQuiz.id.startsWith('temp-')) {
        // This is a new quiz, create it.
        const { id, ...quizToCreate } = editedQuiz;
        await createQuiz(quizToCreate);
      } else {
        // This is an existing quiz, update it.
        await updateQuiz(editedQuiz);
      }
      onExit(); // Go back to the dashboard
    } catch (err: any) {
      setError(err.message || 'Ошибка при сохранении');
    } finally {
      setIsSaving(false);
    }
  };

  if (!editedQuiz) {
    return <div>Викторина не выбрана.</div>;
  }

  return (
    <div className="bg-gray-800 p-6 md:p-8 rounded-2xl shadow-2xl animate-fade-in w-full max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-700">
        <h1 className="text-3xl font-black text-white tracking-tight">Редактор Викторины</h1>
        <button onClick={onExit} disabled={isSaving} className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-500 transition-colors disabled:opacity-50">Назад к панели</button>
      </div>

      {error && <div className="text-red-400 bg-red-900/30 p-3 rounded-lg mb-4">Ошибка: {error}</div>}

      <div className="space-y-6 mb-8">
        <div>
          <label className="text-xl font-bold text-indigo-300 mb-2 block">Название викторины</label>
          <input
            type="text"
            value={editedQuiz.name}
            onChange={(e) => handleQuizDetailsChange('name', e.target.value)}
            className="w-full bg-gray-700 text-white p-3 rounded border border-gray-600 focus:border-indigo-500 outline-none"
          />
        </div>
        <div>
          <label className="text-xl font-bold text-indigo-300 mb-2 block">Описание викторины</label>
          <textarea
            value={editedQuiz.description}
            onChange={(e) => handleQuizDetailsChange('description', e.target.value)}
            className="w-full bg-gray-700 text-white p-3 rounded border border-gray-600 focus:border-indigo-500 outline-none"
            rows={3}
          />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-white mb-4">Вопросы ({editedQuiz.questions.length})</h2>
      <div className="space-y-6">
        {editedQuiz.questions.map((q, qIndex) => (
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
                <label key={optIndex} className={`flex items-center gap-3 p-2 rounded-lg transition-colors cursor-pointer ${Number(q.correctAnswer) === optIndex ? 'bg-green-800/50 border border-green-600' : 'bg-transparent border border-transparent hover:bg-gray-800'}`}>
                  <input
                    type="radio"
                    name={`correct-answer-${q.id}`}
                    checked={Number(q.correctAnswer) === optIndex}
                    onChange={() => handleCorrectAnswerChange(q.id, optIndex)}
                    className="form-radio h-5 w-5 text-green-500 bg-gray-700 border-gray-600 focus:ring-green-500 shrink-0"
                  />
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleOptionChange(q.id, optIndex, e.target.value)}
                    className="w-full bg-transparent text-white outline-none p-0"
                  />
                </label>
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
            disabled={isSaving || !editedQuiz?.name}
            className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? 'Сохранение...' : 'Сохранить все изменения'}
        </button>
      </div>
    </div>
  );
};

export default QuestionEditorView;