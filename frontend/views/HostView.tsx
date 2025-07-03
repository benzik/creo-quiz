import React from 'react';
import useSocket from '../hooks/useSocket';
import * as api from '../services/api';
import { Player, AnswerDistribution, Question, GameState } from '../types.ts';
import BarChart from '../components/BarChart';

interface HostViewProps {
  gameId: string;
  onExit: () => void;
}

const HostView: React.FC<HostViewProps> = ({ gameId, onExit }) => {
  const { gameState, isConnected } = useSocket(gameId);

  if (!isConnected) {
    return <div className="text-center text-2xl font-bold">Подключение к серверу...</div>;
  }
  
  if (!gameState) {
    return <div className="text-center text-2xl font-bold">Загрузка игры...</div>;
  }

  const { phase, players, questions, currentQuestionIndex, answers } = gameState;
  
  if (!questions || questions.length === 0) {
      return <div className="text-center text-2xl font-bold">Ошибка: В этой игре нет вопросов. Добавьте их в редакторе.</div>;
  }
  
  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;

  const renderContent = () => {
    switch (phase) {
      case 'lobby':
        return <Lobby gameId={gameId} players={players} onStart={() => api.startGame(gameId)} hasQuestions={questions.length > 0} />;
      case 'question':
        return <QuestionScreen questionText={currentQuestion.questionText} options={currentQuestion.options} answeredCount={answeredCount} totalPlayers={players.length} onShowResults={() => api.showResults(gameId)} />;
      case 'results':
        return <ResultsScreen question={currentQuestion} questions={questions} answerDistribution={gameState.answerDistribution} totalPlayers={players.length} onNext={() => api.nextQuestion(gameId)} />;
      case 'finished':
        return <FinishedScreen onRestart={() => api.restartGame(gameId)} onExit={onExit} />;
      default:
        return <div>Неизвестная фаза игры.</div>;
    }
  };

  return (
    <div className="bg-gray-800 p-6 md:p-8 rounded-2xl shadow-2xl animate-fade-in w-full">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Панель Ведущего</h1>
          <p className="text-indigo-400 font-bold">Код Игры: <span className="text-2xl tracking-widest bg-gray-900 px-2 py-1 rounded">{gameId}</span></p>
        </div>
        <button onClick={onExit} className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-500 transition-colors">Выйти</button>
      </div>
      {renderContent()}
    </div>
  );
};

const Lobby: React.FC<{gameId: string, players: Player[], onStart: () => void, hasQuestions: boolean}> = ({ gameId, players, onStart, hasQuestions}) => (
  <div>
    <h2 className="text-2xl font-bold text-center text-white mb-4">Ожидание игроков...</h2>
    <p className="text-center text-gray-300 mb-6">Попросите участников зайти на сайт и ввести код игры <span className="font-bold text-indigo-300">{gameId}</span>.</p>
    <div className="bg-gray-900/50 p-4 rounded-lg min-h-[100px]">
      {players.length > 0 ? (
        <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {players.map(p => <li key={p.id} className="bg-gray-700 text-center text-white font-semibold p-2 rounded animate-fade-in">{p.name}</li>)}
        </ul>
      ) : (
        <p className="text-gray-400 text-center py-6">Пока никто не присоединился</p>
      )}
    </div>
    <button onClick={onStart} disabled={players.length === 0 || !hasQuestions} className="w-full mt-6 bg-green-600 text-white font-bold py-3 px-6 rounded-lg text-xl shadow-lg hover:bg-green-500 focus:outline-none focus:ring-4 focus:ring-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:hover:scale-100 transform hover:scale-105 transition-all duration-300">
      {hasQuestions ? 'Начать Урок' : 'Нет вопросов для начала'}
    </button>
  </div>
);

const QuestionScreen: React.FC<{questionText: string, options: string[], answeredCount: number, totalPlayers: number, onShowResults: () => void}> = ({questionText, options, answeredCount, totalPlayers, onShowResults}) => (
    <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-6">{questionText}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xl">
            {options.map((opt, i) => <div key={i} className="bg-gray-700 p-4 rounded-lg border-2 border-gray-600">{opt}</div>)}
        </div>
        <div className="mt-8">
            <p className="text-2xl font-bold text-white">Ответили: {answeredCount} из {totalPlayers}</p>
            <div className="w-full bg-gray-700 rounded-full h-4 mt-2">
                <div className="bg-indigo-500 h-4 rounded-full transition-all duration-300" style={{width: `${totalPlayers > 0 ? (answeredCount / totalPlayers) * 100 : 0}%`}}></div>
            </div>
        </div>
        <button onClick={onShowResults} className="mt-8 bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg text-xl shadow-lg hover:bg-indigo-500 transform hover:scale-105 transition-all duration-300">
            Показать Результаты
        </button>
    </div>
);

const ResultsScreen: React.FC<{question: Question, questions: Question[], answerDistribution: AnswerDistribution, totalPlayers: number, onNext: () => void}> = ({question, questions, answerDistribution, totalPlayers, onNext}) => {
    const isLastQuestion = questions.findIndex(q => q.id === question.id) === questions.length - 1;
    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-4">{question.questionText}</h2>
            <BarChart distribution={answerDistribution} options={question.options} correctAnswerIndex={question.correctAnswerIndex} totalPlayers={totalPlayers} />
            <div className="mt-6 bg-gray-900/50 p-4 rounded-lg ring-1 ring-gray-700">
                <h3 className="text-lg font-bold text-indigo-300 mb-2">Пояснение:</h3>
                <p className="text-gray-200 leading-relaxed">{question.explanation}</p>
            </div>
            <button onClick={onNext} className="w-full mt-6 bg-green-600 text-white font-bold py-3 px-6 rounded-lg text-xl shadow-lg hover:bg-green-500 transform hover:scale-105 transition-all duration-300">
                {isLastQuestion ? 'Завершить Урок' : 'Следующий вопрос'}
            </button>
        </div>
    );
};

const FinishedScreen: React.FC<{onRestart: () => void, onExit: () => void}> = ({onRestart, onExit}) => (
    <div className="text-center">
        <h2 className="text-4xl font-black text-white mb-4">Урок Завершен!</h2>
        <p className="text-xl text-gray-300 mb-8">Спасибо за участие. Вы можете начать заново с теми же игроками или выйти на панель администратора.</p>
        <div className="flex gap-4 justify-center">
            <button onClick={onRestart} className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg text-xl shadow-lg hover:bg-indigo-500 transform hover:scale-105 transition-all duration-300">
                Начать Заново
            </button>
            <button onClick={onExit} className="bg-gray-600 text-white font-bold py-3 px-8 rounded-lg text-xl shadow-lg hover:bg-gray-500 transform hover:scale-105 transition-all duration-300">
                Выйти
            </button>
        </div>
    </div>
);


export default HostView;