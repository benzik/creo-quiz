FROM node:18-alpine

# Install curl for health checks
RUN apk --no-cache add curl

# Create app directory
WORKDIR /usr/src/app

# Create data directory for persistent storage
RUN mkdir -p /usr/src/app/data

# Copy package files and install dependencies
COPY backend/package*.json ./
RUN npm install

# Copy backend files
COPY backend/ .

# Create frontend directory and copy constants
RUN mkdir -p /usr/src/frontend
COPY frontend/constants.js /usr/src/frontend/constants.js

# Expose port
EXPOSE 3001

# Start the server
CMD ["node", "server.js"]
