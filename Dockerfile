# Utiliser Node.js 20 explicitement
FROM node:20-alpine

# Définir le répertoire de travail
WORKDIR /app

# Variables d'environnement
ENV NODE_ENV=production
ENV PORT=3000
ENV CACHE_BUST=v4

# Copier les fichiers package.json et package-lock.json
COPY package*.json ./
COPY client/package*.json client/package-lock.json ./client/

# Installer les dépendances sans cache
RUN npm ci --prefer-offline --no-audit --no-cache
RUN cd client && npm install --include=dev --prefer-offline --no-audit

# Copier tout le code source
COPY . .

# Construire l'application frontend
RUN npm run build

# Exposer le port
EXPOSE 3000

# Commande de démarrage
CMD ["./start.sh"]