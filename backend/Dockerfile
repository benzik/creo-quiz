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

# Copy backend files and constants
COPY backend/ .

# Make sure constants.cjs is included and has correct permissions
RUN chmod +r constants.cjs

# Expose port
EXPOSE 8080

# Start the server
CMD ["npm", "start"]
