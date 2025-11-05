# ============================================
# Dockerfile Frontend-Only pour Railway
# Dépôt: Crm-Frontend
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Variables d'environnement pour le build
ENV NODE_ENV=production
ENV GENERATE_SOURCEMAP=false

# Copier les fichiers de dépendances
COPY client/package*.json ./client/

# Installer les dépendances du client (y compris devDependencies pour le build)
WORKDIR /app/client
RUN npm ci --include=dev

# Copier le code source du client
COPY client/ ./

# Clean build pour éviter les incohérences de cache
RUN rm -rf dist .vite node_modules/.vite

# Build de l'application React
RUN npm run build

# ============================================
# Stage 2: Image de production avec Nginx
# ============================================
FROM nginx:1.25-alpine AS production

# Installer curl pour le diagnostic si nécessaire
RUN apk add --no-cache curl

# Métadonnées
LABEL maintainer="MDMC Music Ads"
LABEL description="CRM Frontend - Production Ready"
LABEL version="1.0.0"

# Copier les fichiers buildés depuis le stage builder
COPY --from=builder /app/client/dist /usr/share/nginx/html

# Copier la configuration Nginx personnalisée
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copier le script d'entrée pour Railway
COPY docker/start.sh /start.sh
RUN chmod +x /start.sh

# Ajuster les permissions (utiliser l'utilisateur nginx existant)
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d

# Note: Nginx doit démarrer en tant que root pour écouter sur le port 80
# Les processus workers seront automatiquement exécutés en tant que nginx
# Pas besoin de USER nginx ici

# Exposer le port (dynamique pour Railway)
EXPOSE $PORT

# Pas de healthcheck pour un frontend statique
# Railway détectera automatiquement que le service est up quand Nginx démarre

# Commande de démarrage avec script personnalisé pour Railway
CMD ["/start.sh"]
