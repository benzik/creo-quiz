# Interactive Quiz Application

An interactive quiz application with real-time functionality, built with React and Socket.IO. This application allows creating quiz sessions where participants can join and answer questions in real-time, with immediate feedback and results visualization.

## Features

- Real-time quiz sessions with Socket.IO
- Admin panel for quiz management
- Interactive question cards with multiple-choice answers
- Results visualization with charts
- Session management for multiple concurrent games
- Responsive design for various devices

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Backend**: Express.js, Socket.IO
- **Database**: LowDB (JSON file-based database)
- **Containerization**: Docker

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Docker and Docker Compose (optional, for containerized deployment)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/interactive-quiz.git
   cd interactive-quiz
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with the following content:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

## Running the Application

### Development Mode

Start the development server:
```bash
npm run dev
```

The application will be available at http://localhost:5173

### Production Build

Build the application:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

### Using Docker

You can also run the application using Docker:
```bash
docker-compose up
```

### Deployment with Portainer Stack

This project is configured for easy deployment using Portainer Stack with Git repository:

1. In your Portainer interface, go to Stacks and click "Add stack"
2. Choose "Git repository" as the build method
3. Enter your Git repository URL
4. Set the reference to your branch (e.g., main)
5. Set the compose path to `docker-compose.yml`
6. Click "Deploy the stack"

Portainer will automatically pull the repository and deploy the services defined in the docker-compose.yml file.

## Project Structure

- `/components` - React components
- `/views` - Page components
- `/hooks` - Custom React hooks
- `/services` - API services
- `/state` - State management
- `/backend` - Express server and Socket.IO implementation
- `/frontend` - Frontend-specific code


## License

MIT
