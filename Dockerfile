# Force Node.js 20
FROM node:20-alpine

WORKDIR /app

# Copy all package files first
COPY package*.json ./
COPY client/ ./client/

# Install all dependencies (including dev for build)
RUN npm install --include=dev
RUN cd client && npm install --include=dev

# Build the application
RUN npm run build

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Start the application
CMD ["./start.sh"]