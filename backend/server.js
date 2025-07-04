import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { nanoid } from 'nanoid';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { createRequire } from 'module';

// --- SETUP ---
const __dirname = dirname(fileURLToPath(import.meta.url));
// Создаем функцию require для загрузки CommonJS модулей
const require = createRequire(import.meta.url);
// The database will be stored in a persistent volume mounted at /usr/src/app/data
const file = join('/usr/src/app/data', 'db.json');

const adapter = new JSONFile(file);
// Обновленная структура данных по умолчанию
const defaultData = { quizzes: [], games: {} };
const db = new Low(adapter, defaultData);
await db.read();


const app = express();
app.use(cors());
app.use(express.json());

// Health check endpoint for Docker
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});


// --- HELPERS ---
const ADMIN_PASSWORD = 'lidera998';
const generateGameId = () => nanoid(5).toUpperCase();

const emitGameState = (gameId) => {
  const game = db.data.games[gameId];
  if (game) {
    io.to(gameId).emit('gameStateUpdate', game);
  }
};


// --- API ROUTES ---

// Admin Login
app.post('/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Неверный пароль' });
  }
});

// --- QUIZ API ROUTES ---

// Получить все викторины
app.get('/quizzes', (req, res) => {
  res.json(db.data.quizzes || []);
});

// Создать новую викторину
app.post('/quizzes', async (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Название викторины обязательно' });
  }
  const newQuiz = {
    id: `quiz-${nanoid(10)}`,
    name,
    description: description || '',
    questions: [],
  };
  db.data.quizzes.push(newQuiz);
  await db.write();
  res.status(201).json(newQuiz);
});

// Обновить викторину (включая вопросы)
app.put('/quizzes/:quizId', async (req, res) => {
  const { quizId } = req.params;
  const { name, description, questions } = req.body;
  const quiz = db.data.quizzes.find(q => q.id === quizId);

  if (!quiz) {
    return res.status(404).json({ error: 'Викторина не найдена' });
  }

  if (name) quiz.name = name;
  if (description) quiz.description = description;
  if (questions) quiz.questions = questions; // Полная замена вопросов

  await db.write();
  res.json(quiz);
});

// Удалить викторину
app.delete('/quizzes/:quizId', async (req, res) => {
  const { quizId } = req.params;
  const initialLength = db.data.quizzes.length;
  db.data.quizzes = db.data.quizzes.filter(q => q.id !== quizId);

  if (db.data.quizzes.length === initialLength) {
    return res.status(404).json({ error: 'Викторина не найдена' });
  }

  await db.write();
  res.status(204).send();
});

// Дублировать викторину
app.post('/quizzes/:quizId/duplicate', async (req, res) => {
  const { quizId } = req.params;
  const originalQuiz = db.data.quizzes.find(q => q.id === quizId);

  if (!originalQuiz) {
    return res.status(404).json({ error: 'Викторина не найдена' });
  }

  const duplicatedQuiz = {
    ...originalQuiz,
    id: `quiz-${nanoid(10)}`,
    name: `${originalQuiz.name} (Копия)`,
  };

  db.data.quizzes.push(duplicatedQuiz);
  await db.write();
  res.status(201).json(duplicatedQuiz);
});

// Create a new game from a quiz
app.post('/games', async (req, res) => {
  const { quizId } = req.body;
  if (!quizId) {
    return res.status(400).json({ error: 'Необходимо указать ID викторины' });
  }

  const quiz = db.data.quizzes.find(q => q.id === quizId);
  if (!quiz) {
    return res.status(404).json({ error: 'Викторина не найдена' });
  }

  const newGame = {
    id: generateGameId(),
    quizId: quiz.id,
    quizName: quiz.name,
    quizDescription: quiz.description,
    phase: 'lobby',
    players: [],
    questions: quiz.questions, // Снимок вопросов на момент создания игры
    currentQuestionIndex: 0,
    answers: {},
    answerDistribution: {},
  };

  db.data.games[newGame.id] = newGame;
  await db.write();
  res.status(201).json(newGame);
});

// Join a game
app.post('/games/:gameId/join', async (req, res) => {
  const { gameId } = req.params;
  const { playerName } = req.body;
  const game = db.data.games[gameId];

  if (!game) return res.status(404).json({ error: 'Игра не найдена' });
  if (game.phase !== 'lobby') return res.status(403).json({ error: 'Игра уже началась' });
  if (!playerName) return res.status(400).json({ error: 'Имя игрока не указано' });

  const newPlayer = {
    id: nanoid(10),
    name: playerName.slice(0, 20),
  };
  game.players.push(newPlayer);
  await db.write();

  emitGameState(gameId);
  res.status(200).json({ player: newPlayer });
});

const handleGameAction = async (req, res, action) => {
  const { gameId } = req.params;
  const game = db.data.games[gameId];
  if (!game) return res.status(404).json({ error: 'Игра не найдена' });

  action(game, req.body);
  
  await db.write();
  emitGameState(gameId);
  res.json({ success: true });
}

app.post('/games/:gameId/start', (req, res) => {
  handleGameAction(req, res, (game) => {
    if (game.phase === 'lobby' && game.players.length > 0 && game.questions.length > 0) {
      game.phase = 'question';
    }
  });
});

app.post('/games/:gameId/answer', (req, res) => {
    handleGameAction(req, res, (game, body) => {
        if (game.phase === 'question') {
            game.answers[body.playerId] = body.answerIndex;
        }
    });
});

app.post('/games/:gameId/results', (req, res) => {
    handleGameAction(req, res, (game) => {
        if (game.phase === 'question') {
            game.phase = 'results';
            const distribution = {};
            Object.values(game.answers).forEach(answerIndex => {
                distribution[answerIndex] = (distribution[answerIndex] || 0) + 1;
            });
            game.answerDistribution = distribution;
        }
    });
});

app.post('/games/:gameId/next', (req, res) => {
    handleGameAction(req, res, (game) => {
        if (game.phase === 'results') {
            if (game.currentQuestionIndex < game.questions.length - 1) {
                game.currentQuestionIndex += 1;
                game.phase = 'question';
                game.answers = {};
                game.answerDistribution = {};
            } else {
                game.phase = 'finished';
            }
        }
    });
});

app.post('/games/:gameId/restart', (req, res) => {
    handleGameAction(req, res, (game) => {
        game.phase = 'lobby';
        game.currentQuestionIndex = 0;
        game.answers = {};
        game.answerDistribution = {};
    });
});

// --- SOCKET.IO LOGIC ---
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('joinGameRoom', (gameId) => {
    socket.join(gameId);
    console.log(`Socket ${socket.id} joined room ${gameId}`);
    // Send initial state to the client that just joined
    const game = db.data.games[gameId];
    if (game) {
        socket.emit('initialState', game);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});


// --- START SERVER ---
const PORT = process.env.PORT || 8080;
server.listen(PORT, async () => {
    // При первом запуске, если база данных пуста, заполняем ее викториной по умолчанию
    if (!db.data.quizzes || db.data.quizzes.length === 0) {
        try {
            const { DEFAULT_QUIZZES } = require('./constants.cjs');
            db.data.quizzes = DEFAULT_QUIZZES;
            await db.write();
            console.log('База данных инициализирована викториной по умолчанию.');
        } catch (e) {
            console.error('Не удалось инициализировать БД викториной по умолчанию.', e);
        }
    }
  console.log(`Server is running on http://localhost:${PORT}`);
});