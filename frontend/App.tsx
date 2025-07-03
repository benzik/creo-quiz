import React, { useState, useCallback } from 'react';
import LandingView from './views/LandingView';
import HostView from './views/HostView';
import PlayerView from './views/PlayerView';
import AdminLoginView from './views/AdminLoginView';
import AdminDashboardView from './views/AdminDashboardView';
import QuestionEditorView from './views/QuestionEditorView';
import * as api from './services/api';
import { Player } from './types.ts';


type View = 'landing' | 'host' | 'player' | 'admin-login' | 'admin-dashboard' | 'question-editor';

const App: React.FC = () => {
  const [view, setView] = useState<View>('landing');
  const [isAdmin, setIsAdmin] = useState(false);
  const [gameId, setGameId] = useState<string | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [error, setError] = useState<string>('');


  const handleAdminLoginSuccess = useCallback(() => {
    setIsAdmin(true);
    setView('admin-dashboard');
  }, []);

  const handleCreateGame = useCallback(async () => {
    if (!isAdmin) return;
    try {
        const newGame = await api.createGame();
        setGameId(newGame.id);
        setView('host');
    } catch (err: any) {
        setError(err.message || "Не удалось создать игру");
        console.error(err);
    }
  }, [isAdmin]);

  const handleJoinGame = useCallback((newGameId: string, newPlayer: Player) => {
    setGameId(newGameId);
    setPlayer(newPlayer);
    setView('player');
  }, []);

  const handleNavigateToEditor = useCallback(() => {
    if(isAdmin) setView('question-editor');
  }, [isAdmin]);
  
  const handleExitToDashboard = useCallback(() => {
      if(isAdmin) setView('admin-dashboard');
      setGameId(null);
  }, [isAdmin]);

  const handleExitToLanding = useCallback(() => {
    setView('landing');
    setGameId(null);
    setPlayer(null);
  }, []);

  const handleLogout = useCallback(() => {
    setIsAdmin(false);
    setView('landing');
  }, []);

  const renderView = () => {
    if (error) {
        return <div className="text-center text-red-400">
            <h2 className="text-2xl font-bold">Произошла ошибка</h2>
            <p>{error}</p>
            <button onClick={() => { setError(''); setView('landing'); }} className="mt-4 bg-indigo-600 text-white font-bold py-2 px-4 rounded">На главный экран</button>
        </div>
    }
      
    switch (view) {
      case 'host':
        return <HostView gameId={gameId!} onExit={handleExitToDashboard} />;
      case 'player':
        return <PlayerView gameId={gameId!} player={player!} onExit={handleExitToLanding} />;
      case 'admin-login':
        return <AdminLoginView onLoginSuccess={handleAdminLoginSuccess} onExit={handleExitToLanding} />;
      case 'admin-dashboard':
        return <AdminDashboardView onCreateGame={handleCreateGame} onEditQuestions={handleNavigateToEditor} onLogout={handleLogout} />;
      case 'question-editor':
        return <QuestionEditorView onExit={handleExitToDashboard} />;
      case 'landing':
      default:
        return <LandingView onJoinGame={handleJoinGame} onGoToAdmin={() => setView('admin-login')} />;
    }
  };

  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-gray-900 text-white selection:bg-indigo-500 selection:text-white">
      <div className="w-full max-w-4xl mx-auto">
        {renderView()}
      </div>
    </main>
  );
};

export default App;