#!/bin/bash

# Script de démarrage pour Railway
echo "🚀 Démarrage MDMC CRM..."

# Vérifier si nous sommes en production
if [ "$NODE_ENV" = "production" ]; then
    echo "📦 Mode production détecté"

    # Build du frontend si nécessaire
    if [ ! -d "client/dist" ]; then
        echo "🔨 Building frontend..."
        npm run build
    fi

    # Démarrer le serveur
    echo "🎵 Démarrage serveur MDMC CRM..."
    node server/server.js
else
    echo "🔧 Mode développement"
    npm run dev:all
fi