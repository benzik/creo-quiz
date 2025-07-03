import React, { useState } from 'react';
import useSocket from '../hooks/useSocket';
import * as api from '../services/api';
import { GameState, Question, Player } from '../types.ts';
import Spinner from '../components/Spinner';

interface PlayerViewProps {
  gameId: string;
  player: Player;
  onExit: () => void;
}

const PlayerView: React.FC<PlayerViewProps> = ({ gameId, player, onExit }) => {
  const { gameState, isConnected } = useSocket(gameId);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isConnected) {
    return <div className="text-center text-2xl font-bold">Подключение к серверу...</div>;
  }

  if (!gameState) {
    return <div className="text-center text-2xl font-bold">Подключение к игре...</div>;
  }

  const { phase, questions, currentQuestionIndex, answers } = gameState;
  
  if (!questions || questions.length === 0) {
    return <WaitingScreen message="Ожидание вопросов от ведущего..." />;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const hasAnswered = answers.hasOwnProperty(player.id);

  const handleSubmitAnswer = async (answerIndex: number) => {
      if (isSubmitting) return;
      setIsSubmitting(true);
      try {
          await api.submitAnswer(gameId, player.id, answerIndex);
      } catch (error) {
          console.error("Failed to submit answer:", error);
          // Optionally show an error to the user
      } finally {
          setIsSubmitting(false);
      }
  }

  const renderContent = () => {
    switch (phase) {
      case 'lobby':
        return <WaitingScreen message="Вы в игре! Ожидаем начала от ведущего..." />;
      case 'question':
         if (!currentQuestion) return <WaitingScreen message="Ожидание вопроса..." />;
        if (hasAnswered) {
          return <WaitingScreen message="Ваш ответ принят! Ждем остальных..." />;
        }
        return <QuestionScreen question={currentQuestion} questions={questions} onAnswer={handleSubmitAnswer} isSubmitting={isSubmitting}/>;
      case 'results':
        return <WaitingScreen message="Смотрите на главный экран для разбора ответа." />;
      case 'finished':
        return <FinishedScreen onExit={onExit} />;
      default:
        return <div>Неизвестная фаза игры.</div>;
    }
  };

  return (
    <div className="bg-gray-800 p-6 md:p-8 rounded-2xl shadow-2xl animate-fade-in w-full max-w-2xl">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-white">Игрок: <span className="text-indigo-400">{player.name}</span></h1>
        <button onClick={onExit} className="text-sm bg-red-600 text-white font-bold py-1 px-3 rounded-lg hover:bg-red-500 transition-colors">Выйти</button>
      </div>
      {renderContent()}
    </div>
  );
};

const WaitingScreen: React.FC<{message: string}> = ({message}) => (
    <div className="text-center py-16">
        <Spinner />
        <h2 className="text-2xl font-bold text-white mt-6">{message}</h2>
    </div>
);

const QuestionScreen: React.FC<{question: Question, questions: Question[], onAnswer: (index: number) => void, isSubmitting: boolean}> = ({question, questions, onAnswer, isSubmitting}) => {
    const [selected, setSelected] = useState<number|null>(null);
    const questionIndex = questions.findIndex(q => q.id === question.id);

    const handleSelect = (index: number) => {
        setSelected(index);
        onAnswer(index);
    }
    
    return (
        <div>
            <p className="text-indigo-400 font-semibold mb-2">Вопрос {questionIndex + 1} из {questions.length}</p>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">{question.questionText}</h2>
            <div className="space-y-3">
                {question.options.map((opt, i) => (
                    <button 
                        key={i}
                        disabled={selected !== null || isSubmitting}
                        onClick={() => handleSelect(i)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer text-lg font-semibold
                            ${selected === i ? 'bg-indigo-500 border-indigo-400 text-white scale-105' : 'bg-gray-700 border-gray-600 hover:bg-gray-600 hover:border-indigo-500'}
                            ${(selected !== null && selected !== i) || isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                    >
                        {opt}
                    </button>
                ))}
            </div>
        </div>
    );
}

const FinishedScreen: React.FC<{onExit: () => void}> = ({ onExit }) => (
    <div className="text-center py-12">
        <h2 className="text-4xl font-black text-white mb-4">Урок Завершен!</h2>
        <p className="text-xl text-gray-300 mb-8">Спасибо за участие! Вы можете выйти в главное меню.</p>
        <button onClick={onExit} className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg text-xl shadow-lg hover:bg-indigo-500 transform hover:scale-105 transition-all duration-300">
            Главное меню
        </button>
    </div>
);

export default PlayerView;