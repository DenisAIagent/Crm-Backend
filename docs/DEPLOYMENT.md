# Guide de Déploiement - MDMC CRM

## Vue d'ensemble

Ce guide détaille les différentes options de déploiement du CRM MDMC Music Ads, des configurations de développement à la production en passant par les environnements de staging.

## Prérequis techniques

### Environnement local

```bash
# Versions minimales requises
Node.js >= 18.0.0
npm >= 8.0.0
Git >= 2.20.0

# Vérification des versions
node --version
npm --version
git --version
```

### Services externes

- **MongoDB** : Version 7.0+ (Railway recommandé)
- **Service email** : Mailgun (principal) + Brevo (fallback)
- **Domaine** : SSL/TLS configuré
- **DNS** : Accès pour configuration sous-domaines

## Configuration des environnements

### Variables d'environnement

#### Base (.env)

```bash
# Environnement
NODE_ENV=production
PORT=5000
BASE_URL=https://your-domain.com

# Base de données MongoDB
MONGODB_URI=mongodb://username:password@host:port/database
DB_NAME=mdmc_crm

# Sécurité JWT
JWT_SECRET=your-super-secure-jwt-secret-64-characters-minimum-length
JWT_REFRESH_SECRET=your-refresh-secret-different-from-jwt-secret-64-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Chiffrement des données
ENCRYPTION_KEY=your-aes-256-encryption-key-32-characters

# Email Mailgun (Principal)
MAILGUN_API_KEY=key-your-mailgun-api-key
MAILGUN_DOMAIN=mg.your-domain.com
MAILGUN_FROM=MDMC CRM <noreply@your-domain.com>
MAILGUN_EU=true

# Email Brevo (Fallback)
BREVO_API_KEY=your-brevo-api-key
BREVO_FROM_EMAIL=noreply@your-domain.com
BREVO_FROM_NAME=MDMC CRM

# Cors et sécurité
CORS_ORIGIN=https://your-frontend-domain.com,https://your-domain.com
CORS_CREDENTIALS=true

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Webhook sécurité
WEBHOOK_SECRET=your-webhook-secret-for-external-integrations

# Monitoring (optionnel)
SENTRY_DSN=your-sentry-dsn
LOGROCKET_APP_ID=your-logrocket-app-id

# Backup (optionnel)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET=your-backup-bucket
AWS_REGION=eu-west-1
BACKUP_RETENTION_DAYS=30
```

#### Production (.env.production)

```bash
NODE_ENV=production
PORT=3000
BASE_URL=https://crm.mdmcmusicads.com

# MongoDB Production (Railway)
MONGODB_URI=mongodb://mongo:password@containers-us-west-1.railway.app:7891/railway
DB_NAME=mdmc_crm_prod

# JWT Secrets (générer avec openssl rand -hex 32)
JWT_SECRET=production-jwt-secret-64-characters-replace-with-secure-generated
JWT_REFRESH_SECRET=production-refresh-secret-64-characters-different-secure

# Chiffrement (générer avec openssl rand -hex 16)
ENCRYPTION_KEY=prod-encryption-key-32-chars-secure

# Email Production
MAILGUN_API_KEY=key-prod-mailgun-key
MAILGUN_DOMAIN=mg.mdmcmusicads.com
MAILGUN_FROM=MDMC CRM <noreply@mdmcmusicads.com>

# CORS Production
CORS_ORIGIN=https://mdmcmusicads.com,https://crm.mdmcmusicads.com
```

#### Développement (.env.development)

```bash
NODE_ENV=development
PORT=5000
BASE_URL=http://localhost:5000

# MongoDB Local ou Railway Dev
MONGODB_URI=mongodb://localhost:27017/mdmc_crm_dev
DB_NAME=mdmc_crm_dev

# JWT Secrets (moins critiques en dev)
JWT_SECRET=dev-jwt-secret-minimum-32-characters-for-development
JWT_REFRESH_SECRET=dev-refresh-secret-different-32-characters-dev

# Chiffrement dev
ENCRYPTION_KEY=dev-encryption-key-32-chars-dev

# Email Dev (utiliser Mailgun sandbox)
MAILGUN_API_KEY=key-sandbox-mailgun-key
MAILGUN_DOMAIN=sandbox123.mailgun.org
MAILGUN_FROM=MDMC CRM Dev <noreply@sandbox123.mailgun.org>

# CORS Dev
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
```

## Déploiement Local

### Installation complète

```bash
# 1. Cloner le repository
git clone https://github.com/DenisAIagent/mdmc-crm.git
cd mdmc-crm

# 2. Installer les dépendances backend
npm install

# 3. Installer les dépendances frontend
cd client
npm install
cd ..

# 4. Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos valeurs

# 5. Configurer MongoDB local (optionnel)
# Option A: MongoDB local
brew install mongodb/brew/mongodb-community
brew services start mongodb/brew/mongodb-community

# Option B: MongoDB Atlas/Railway (recommandé)
# Utiliser l'URI fourni dans .env

# 6. Créer un utilisateur admin
npm run create:admin

# 7. Démarrer en développement
npm run dev:all
```

### Commandes de développement

```bash
# Démarrer tout (frontend + backend)
npm run dev:all

# Backend seulement
npm run dev:server

# Frontend seulement
npm run dev:client

# Build de production
npm run build

# Tests
npm test

# Linting
npm run lint
npm run lint:fix
```

## Déploiement Railway

Railway est la plateforme recommandée pour sa simplicité et son intégration MongoDB.

### Configuration initiale

```bash
# 1. Installer Railway CLI
npm install -g @railway/cli

# 2. Login Railway
railway login

# 3. Créer un nouveau projet
railway init

# 4. Ajouter la base de données MongoDB
railway add mongodb
```

### Variables d'environnement Railway

```bash
# Configurer les variables via CLI
railway variables set NODE_ENV=production
railway variables set PORT=3000
railway variables set JWT_SECRET="your-production-jwt-secret"
railway variables set JWT_REFRESH_SECRET="your-production-refresh-secret"
railway variables set ENCRYPTION_KEY="your-production-encryption-key"

# Ou via le dashboard Railway
# https://railway.app/project/your-project/variables
```

### Déploiement

```bash
# 1. Déployer
railway up

# 2. Obtenir l'URL de déploiement
railway status

# 3. Configurer le domaine personnalisé (optionnel)
railway domain add crm.mdmcmusicads.com

# 4. Configurer MongoDB
# Copier l'URI MongoDB depuis le dashboard Railway
railway variables set MONGODB_URI="mongodb://mongo:password@..."

# 5. Créer l'utilisateur admin en production
railway run npm run create:admin
```

### Configuration MongoDB Railway

```bash
# 1. Dans le dashboard Railway, aller à MongoDB service
# 2. Copier les détails de connexion :

# Variables à configurer
MONGODB_URI=mongodb://mongo:password@containers-us-west-1.railway.app:7891/railway
DB_NAME=railway

# 3. Tester la connexion
railway run node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected!'))
  .catch(err => console.error('MongoDB error:', err));
"
```

## Déploiement Vercel

Vercel est optimal pour le frontend avec déploiement automatique.

### Configuration Vercel

```bash
# 1. Installer Vercel CLI
npm install -g vercel

# 2. Login Vercel
vercel login

# 3. Configuration du projet
vercel

# 4. Configurer les variables d'environnement
vercel env add NODE_ENV production
vercel env add MONGODB_URI
vercel env add JWT_SECRET
# ... autres variables
```

### vercel.json

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/server.js",
      "use": "@vercel/node"
    },
    {
      "src": "client/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "client/dist/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### Build configuration

```json
// package.json - ajout scripts Vercel
{
  "scripts": {
    "vercel-build": "npm run build && cd client && npm run build",
    "vercel-postbuild": "npm run migrate:prod"
  }
}
```

## Déploiement Docker

### Dockerfile

```dockerfile
# Backend Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copier package.json
COPY package*.json ./
RUN npm ci --only=production

# Copier source code
COPY server/ ./server/
COPY client/dist/ ./client/dist/

EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "server/server.js"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  # Backend
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/mdmc_crm
      - JWT_SECRET=${JWT_SECRET}
      - JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
    depends_on:
      - mongo
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped

  # MongoDB
  mongo:
    image: mongo:7
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=${MONGO_PASSWORD}
      - MONGO_INITDB_DATABASE=mdmc_crm
    volumes:
      - mongo_data:/data/db
      - ./docker/mongo-init.js:/docker-entrypoint-initdb.d/init.js:ro
    restart: unless-stopped

  # Frontend (Nginx)
  frontend:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./client/dist:/usr/share/nginx/html
      - ./docker/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - api
    restart: unless-stopped

volumes:
  mongo_data:
```

### Déploiement Docker

```bash
# 1. Build et démarrage
docker-compose up -d

# 2. Vérifier les logs
docker-compose logs -f api

# 3. Créer l'admin
docker-compose exec api npm run create:admin

# 4. Backup
docker-compose exec mongo mongodump --uri="mongodb://admin:password@localhost:27017/mdmc_crm" --out=/backup

# 5. Monitoring
docker-compose ps
docker stats
```

## Configuration SSL/TLS

### Let's Encrypt (Certbot)

```bash
# 1. Installer Certbot
sudo apt-get install certbot python3-certbot-nginx

# 2. Obtenir certificat
sudo certbot --nginx -d crm.mdmcmusicads.com

# 3. Renouvellement automatique
sudo crontab -e
# Ajouter : 0 12 * * * /usr/bin/certbot renew --quiet
```

### Configuration Nginx

```nginx
# /etc/nginx/sites-available/mdmc-crm
server {
    listen 80;
    server_name crm.mdmcmusicads.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name crm.mdmcmusicads.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/crm.mdmcmusicads.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/crm.mdmcmusicads.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;

    # Security Headers
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";

    # API Proxy
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static Files
    location / {
        root /var/www/mdmc-crm/client/dist;
        try_files $uri $uri/ /index.html;

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

## Monitoring et Observabilité

### Health Checks

```javascript
// server/routes/health.js
export const healthCheck = {
  endpoint: '/health',
  checks: [
    'database_connection',
    'external_services',
    'memory_usage',
    'disk_space'
  ]
}

// Réponse health check
{
  "status": "healthy",
  "timestamp": "2024-01-17T12:30:00Z",
  "uptime": 86400,
  "version": "1.0.0",
  "environment": "production",
  "checks": {
    "database": { "status": "healthy", "latency": "12ms" },
    "mailgun": { "status": "healthy", "latency": "45ms" },
    "memory": { "usage": "67%", "status": "healthy" },
    "disk": { "usage": "23%", "status": "healthy" }
  }
}
```

### Logging

```javascript
// Configuration Winston
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
})
```

### Métriques Prometheus

```javascript
// server/middleware/metrics.js
import promClient from 'prom-client'

const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status']
})

const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status']
})

export const metricsMiddleware = (req, res, next) => {
  const start = Date.now()

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000
    const route = req.route?.path || req.path

    httpRequestDuration
      .labels(req.method, route, res.statusCode)
      .observe(duration)

    httpRequestsTotal
      .labels(req.method, route, res.statusCode)
      .inc()
  })

  next()
}
```

## Backup et Récupération

### Backup automatique

```bash
#!/bin/bash
# scripts/backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/mdmc-crm"
RETENTION_DAYS=30

# MongoDB Backup
mongodump --uri="$MONGODB_URI" --out="$BACKUP_DIR/$DATE"

# Compress backup
tar -czf "$BACKUP_DIR/$DATE.tar.gz" "$BACKUP_DIR/$DATE"
rm -rf "$BACKUP_DIR/$DATE"

# Upload to S3 (optionnel)
if [ ! -z "$AWS_S3_BUCKET" ]; then
    aws s3 cp "$BACKUP_DIR/$DATE.tar.gz" "s3://$AWS_S3_BUCKET/backups/"
fi

# Cleanup old backups
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: $DATE.tar.gz"
```

### Cron job backup

```bash
# Ajouter au crontab
0 2 * * * /app/scripts/backup.sh >> /var/log/backup.log 2>&1
```

### Restauration

```bash
#!/bin/bash
# scripts/restore.sh

BACKUP_FILE=$1
TEMP_DIR="/tmp/restore_$(date +%s)"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: ./restore.sh backup_file.tar.gz"
    exit 1
fi

# Extract backup
mkdir -p "$TEMP_DIR"
tar -xzf "$BACKUP_FILE" -C "$TEMP_DIR"

# Restore to MongoDB
mongorestore --uri="$MONGODB_URI" --drop "$TEMP_DIR"/*

# Cleanup
rm -rf "$TEMP_DIR"

echo "Restore completed from $BACKUP_FILE"
```

## CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: |
          npm ci
          cd client && npm ci

      - name: Run tests
        run: npm test

      - name: Lint code
        run: npm run lint

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Railway
        uses: railway/actions@v1
        with:
          service: mdmc-crm
          token: ${{ secrets.RAILWAY_TOKEN }}

      - name: Run post-deploy scripts
        run: |
          # Health check
          sleep 30
          curl -f https://mdmc-crm.up.railway.app/health
```

## Dépannage

### Problèmes courants

#### Erreur de connexion MongoDB

```bash
# Vérifier la connexion
node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ MongoDB error:', err.message);
    process.exit(1);
  });
"
```

#### Problèmes de variables d'environnement

```bash
# Vérifier les variables
node -e "
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅ Set' : '❌ Missing');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Missing');
"
```

#### Erreurs de build frontend

```bash
# Clear cache et rebuild
cd client
rm -rf node_modules package-lock.json dist
npm install
npm run build
```

### Logs utiles

```bash
# Railway logs
railway logs

# Docker logs
docker-compose logs -f api

# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Application logs
tail -f logs/error.log
tail -f logs/combined.log
```

Ce guide couvre toutes les options de déploiement du CRM MDMC, de l'environnement local à la production en passant par les configurations intermédiaires.