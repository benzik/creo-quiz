import { useState, useEffect } from 'react';
import io, { Socket } from 'socket.io-client';
import { GameState } from '../types.ts';

// The URL is now relative. Nginx will handle proxying.
const SOCKET_URL = '/';

const useSocket = (gameId: string | null) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!gameId) return;

    // We specify the path to avoid conflicts if the main page is served from a subdirectory.
    const socket: Socket = io(SOCKET_URL, {
      path: '/socket.io'
    });

    socket.on('connect', () => {
      console.log('Connected to socket server');
      setIsConnected(true);
      socket.emit('joinGameRoom', gameId);
    });

    socket.on('gameStateUpdate', (newGameState: GameState) => {
      setGameState(newGameState);
    });
    
    socket.on('initialState', (initialState: GameState) => {
      setGameState(initialState);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
      setIsConnected(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [gameId]);

  return { gameState, isConnected };
};

export default useSocket;