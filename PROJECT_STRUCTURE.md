# Creo Quiz - Project Structure Map

## Overview
This is an interactive quiz application with a React frontend and Node.js backend. The application allows hosts to create quiz games, players to join and answer questions, and administrators to manage questions.

## Architecture
- **Frontend**: React with TypeScript
- **Backend**: Express.js with Socket.IO for real-time communication
- **Database**: LowDB (JSON file-based database)
- **Deployment**: Docker containers for both frontend and backend

## Directory Structure

```
/
├── backend/                      # Backend server code
│   ├── data/                     # Database storage directory (empty, mounted as volume)
│   ├── Dockerfile                # Production Docker configuration
│   ├── Dockerfile.dev           # Development Docker configuration
│   ├── constants.cjs            # Default quiz questions
│   ├── package.json             # Backend dependencies
│   └── server.js                # Main server implementation
│
├── frontend/                    # Frontend React application
│   ├── components/              # Reusable UI components
│   │   ├── BarChart.tsx         # Chart for displaying answer distributions
│   │   ├── Spinner.tsx          # Loading spinner component
│   │   └── icons/               # Icon components
│   │       └── CheckIcon.tsx    # Checkmark icon
│   │
│   ├── hooks/                   # Custom React hooks
│   │   └── useSocket.ts         # Socket.IO connection hook
│   │
│   ├── services/                # API services
│   │   └── api.ts               # Backend API client
│   │
│   ├── styles/                  # CSS styles (empty directory)
│   │
│   ├── views/                   # Main application views/pages
│   │   ├── AdminDashboardView.tsx  # Admin dashboard
│   │   ├── AdminLoginView.tsx      # Admin login screen
│   │   ├── HostView.tsx            # Game host view
│   │   ├── LandingView.tsx         # Initial landing page
│   │   ├── PlayerView.tsx          # Player game view
│   │   └── QuestionEditorView.tsx  # Question editor for admins
│   │
│   ├── App.tsx                  # Main application component
│   ├── constants.js             # Frontend constants
│   ├── constants.ts             # Frontend constants (TypeScript version)
│   ├── Dockerfile               # Production Docker configuration
│   ├── Dockerfile.dev          # Development Docker configuration
│   ├── index.html               # HTML entry point
│   ├── index.tsx                # JavaScript entry point
│   ├── metadata.json            # Application metadata
│   ├── nginx.conf               # Nginx configuration for production
│   └── types.ts                 # TypeScript type definitions
│
├── state/                       # Global state management
│   ├── gameStore.ts             # Game state store
│   └── questionStore.ts         # Question state store
│
├── docker-compose.yml           # Docker Compose configuration
├── package.json                 # Root package.json with dependencies
└── tsconfig.json                # TypeScript configuration
```

## Key Components

### Backend (server.js)
- Express.js server with Socket.IO integration
- RESTful API endpoints for game management
- Real-time game state updates via WebSockets
- LowDB for persistent storage

### Frontend

#### Main Views
- **LandingView**: Entry point for users to join games or access admin
- **HostView**: Game host interface for controlling game flow
- **PlayerView**: Player interface for answering questions
- **AdminLoginView**: Admin authentication
- **AdminDashboardView**: Admin control panel
- **QuestionEditorView**: Interface for editing quiz questions

#### Core Services
- **api.ts**: Handles all HTTP requests to the backend
- **useSocket.ts**: Custom hook for Socket.IO real-time communication

#### Data Types (types.ts)
- **Question**: Quiz question structure
- **Player**: Player information
- **GameState**: Complete game state including players, questions, and answers
- **GamePhase**: Game flow phases (lobby, question, results, finished)

## Communication Flow

1. **HTTP API**: Used for initial data loading, game creation, and non-real-time operations
2. **WebSockets**: Used for real-time game state updates

## Docker Configuration

- **Frontend Container**: Nginx serving static React files
- **Backend Container**: Node.js Express server
- **Network**: Custom bridge network (creo-quiz-network)
- **Volumes**: Persistent volume for database storage (creo-quiz-data)

## Ports
- **Frontend**: 9753
- **Backend**: 9754

## Authentication
- Simple password-based authentication for admin access
- No authentication required for players (just name entry)

## Game Flow
1. Admin creates a game
2. Players join with their names
3. Host starts the game
4. Questions are presented one by one
5. Players submit answers
6. Results are shown after each question
7. Game completes after all questions or can be restarted
