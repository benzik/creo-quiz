import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { nanoid } from 'nanoid';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// --- SETUP ---
const __dirname = dirname(fileURLToPath(import.meta.url));
// The database will be stored in a persistent volume mounted at /usr/src/app/data
const file = join('/usr/src/app/data', 'db.json');

const adapter = new JSONFile(file);
const defaultData = { questions: [], games: {} };
const db = new Low(adapter, defaultData);
await db.read();


const app = express();
app.use(cors());
app.use(express.json());

// Health check endpoint for Docker
app.get('/api/health', (req, res) => {
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

// Get all questions
app.get('/questions', (req, res) => {
  res.json(db.data.questions);
});

// Save all questions
app.post('/questions', async (req, res) => {
  const { questions } = req.body;
  if (!Array.isArray(questions)) {
    return res.status(400).json({ error: 'Invalid data format' });
  }
  db.data.questions = questions;
  await db.write();
  res.json({ success: true });
});

// Create a new game
app.post('/games', async (req, res) => {
    // If there are no questions in the db, try to initialize them from the request
    // This is a fallback for the first run
    if (db.data.questions.length === 0 && req.body.initialQuestions) {
        db.data.questions = req.body.initialQuestions;
    }

  const newGame = {
    id: generateGameId(),
    phase: 'lobby',
    players: [],
    questions: db.data.questions, // Snapshot questions at game creation
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
const PORT = 3001;
server.listen(PORT, async () => {
    // On first start, if db is empty, populate it with default questions
    if (!db.data.questions || db.data.questions.length === 0) {
        try {
            const { QUIZ_QUESTIONS } = require('../frontend/constants.js');
            db.data.questions = QUIZ_QUESTIONS;
            await db.write();
            console.log('Database initialized with default questions.');
        } catch (e) {
            console.error('Could not auto-initialize DB with default questions.', e);
        }
    }
  console.log(`Server is running on http://localhost:${PORT}`);
});