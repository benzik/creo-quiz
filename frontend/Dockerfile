# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Install TypeScript types for development
RUN npm install --save-dev @types/react @types/react-dom @types/node @vitejs/plugin-react

# Copy project files (excluding node_modules)
COPY . .

# Debug: List files in frontend directory
RUN ls -la frontend

# Create a special vite config for frontend build
RUN echo 'import { defineConfig } from "vite";' > frontend-vite.config.js && \
    echo 'import react from "@vitejs/plugin-react";' >> frontend-vite.config.js && \
    echo 'export default defineConfig({' >> frontend-vite.config.js && \
    echo '  plugins: [react()],' >> frontend-vite.config.js && \
    echo '  root: "./frontend",' >> frontend-vite.config.js && \
    echo '  build: {' >> frontend-vite.config.js && \
    echo '    outDir: "../dist",' >> frontend-vite.config.js && \
    echo '    emptyOutDir: true' >> frontend-vite.config.js && \
    echo '  }' >> frontend-vite.config.js && \
    echo '});' >> frontend-vite.config.js

# Cache busting
ARG CACHE_BUSTER
RUN echo "Cache buster: $CACHE_BUSTER"

# Build the app from frontend directory
RUN npx vite build --config frontend-vite.config.js

# Debug: List dist directory after build
RUN ls -la dist

# Production stage
FROM nginx:alpine

# Install curl for health checks
RUN apk --no-cache add curl

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Verify files were copied correctly
RUN ls -la /usr/share/nginx/html && echo "Files in HTML directory"

# Copy nginx configuration
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
