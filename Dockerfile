# Dockerfile explicite pour forcer Node.js 20
FROM node:20-alpine

WORKDIR /app

# Copier les fichiers de configuration
COPY package*.json ./
COPY client/package*.json ./client/

# Installer les dépendances
RUN npm ci --prefer-offline --no-audit
RUN cd client && npm ci --prefer-offline --no-audit

# Copier le code source
COPY . .

# Build du frontend
RUN npm run build

# Variables d'environnement
ENV NODE_ENV=production
ENV PORT=3000

# Exposer le port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:$PORT/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Démarrer l'application
CMD ["npm", "start"]