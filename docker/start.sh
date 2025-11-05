#!/bin/sh

# Script d'entrée pour Railway
# Configure le port dynamiquement selon la variable PORT de Railway

# Railway définit la variable PORT, on utilise 80 par défaut
PORT=${PORT:-80}

echo "Démarrage de Nginx sur le port $PORT"

# Remplacer le port dans la configuration nginx
sed -i "s/listen 80;/listen $PORT;/g" /etc/nginx/conf.d/default.conf

# Démarrer nginx
exec nginx -g "daemon off;"