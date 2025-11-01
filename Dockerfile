# ============================================
# Stage 1: Build du client React/Vite
# Force Railway cache invalidation - Build 2025-11-01
# ============================================
FROM node:20-alpine AS client-builder

WORKDIR /app

# Copier les fichiers de configuration du client
COPY client/package*.json ./client/

# Installer les dépendances du client
WORKDIR /app/client
RUN npm ci

# Copier le code source du client
COPY client/ ./

# Clean build pour éviter les incohérences de cache
RUN rm -rf dist .vite node_modules/.vite

# Build du client (génère /app/client/dist)
RUN npm run build

# Debug: Lister les fichiers buildés pour vérifier les hashs
RUN echo "=== DEBUG: Fichiers buildés ===" && \
    ls -la dist/assets/ && \
    echo "=== HTML content ===" && \
    cat dist/index.html

# ============================================
# Stage 2: Image de production finale
# ============================================
FROM node:20-alpine

WORKDIR /app

# Copier le package.json racine pour les dépendances du serveur
COPY package*.json ./

# Installer UNIQUEMENT les dépendances de production du serveur
RUN npm ci --only=production

# Copier le code du serveur
COPY server/ ./server/

# Copier le build du client depuis le stage précédent
COPY --from=client-builder /app/client/dist ./client/dist

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=3000

# Exposer le port
EXPOSE 3000

# Health check pour Railway
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Démarrer directement le serveur (plus de start.sh nécessaire)
CMD ["node", "server/server.js"]