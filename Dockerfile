# Dockerfile à la racine pour Railway
# Ce fichier pointe vers le backend pour construire l'application backend
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files from backend directory
COPY backend/package*.json ./
COPY backend/package-lock.json* ./

# If package-backend.json exists, use it as package.json
RUN if [ -f package-backend.json ]; then \
      cp package-backend.json package.json; \
    fi

# Install dependencies
# Use npm ci if lockfile exists, otherwise use npm install
RUN if [ -f package-lock.json ]; then \
      npm ci --omit=dev && npm cache clean --force; \
    else \
      echo "Lockfile not found, using npm install..." && \
      npm install --omit=dev && npm cache clean --force; \
    fi

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Copy application code from backend directory
COPY --chown=nodejs:nodejs backend/ .

# Create uploads directory
RUN mkdir -p uploads && chown nodejs:nodejs uploads

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start the application
CMD ["node", "server.js"]

