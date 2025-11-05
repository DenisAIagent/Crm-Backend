#!/bin/sh

# Script de démarrage pour Railway
# Railway définit automatiquement la variable PORT

PORT=${PORT:-8080}

# Afficher le port utilisé
echo "🚀 Starting Nginx on port $PORT"

# Créer une configuration Nginx temporaire avec le bon port
cat > /etc/nginx/conf.d/default.conf <<EOF
server {
    listen $PORT;
    server_name _;
    
    root /usr/share/nginx/html;
    index index.html;

    # Compression Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    # Logs
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    # Configuration pour SPA React
    location / {
        try_files \$uri \$uri/ /index.html;
        
        # Headers de sécurité
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        
        # Cache pour les fichiers statiques
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # Bloquer l'accès aux fichiers cachés
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
EOF

# Démarrer Nginx en avant-plan
exec nginx -g "daemon off;"

