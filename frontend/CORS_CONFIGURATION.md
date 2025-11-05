# Configuration CORS - MDMC Music Ads CRM

## 🚨 Problème CORS en Production

Vous rencontrez une erreur CORS car le backend `https://crm-backend-production-f0c8.up.railway.app` n'autorise pas les requêtes depuis `https://adminpanel.mdmcmusicads.com`.

## Solutions

### ✅ Solution 1 : Configurer CORS sur le Backend (RECOMMANDÉ)

Le backend doit autoriser les requêtes depuis le frontend. Voici la configuration nécessaire :

#### Configuration CORS à ajouter au backend :

```javascript
// Exemple pour Express.js
const cors = require('cors');

app.use(cors({
  origin: [
    'https://adminpanel.mdmcmusicads.com',
    'http://localhost:3000', // Pour le développement local
    'http://localhost:5173'  // Alternative pour Vite
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Authorization']
}));
```

#### Configuration pour autres frameworks :

**NestJS :**
```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: [
      'https://adminpanel.mdmcmusicads.com',
      'http://localhost:3000',
      'http://localhost:5173'
    ],
    credentials: true,
  });
  
  await app.listen(3000);
}
bootstrap();
```

**Django (Python) :**
```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "https://adminpanel.mdmcmusicads.com",
    "http://localhost:3000",
    "http://localhost:5173",
]

CORS_ALLOW_CREDENTIALS = True
```

### ✅ Solution 2 : Proxy en Production (Nginx)

Si vous ne pouvez pas modifier le backend immédiatement, configurez un proxy Nginx :

```nginx
server {
    listen 443 ssl;
    server_name adminpanel.mdmcmusicads.com;

    # ... configuration SSL ...

    location /api {
        proxy_pass https://crm-backend-production-f0c8.up.railway.app;
        proxy_set_header Host crm-backend-production-f0c8.up.railway.app;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS headers (si nécessaire)
        add_header 'Access-Control-Allow-Origin' 'https://adminpanel.mdmcmusicads.com' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, PATCH, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        
        if ($request_method = 'OPTIONS') {
            return 204;
        }
    }

    location / {
        root /var/www/adminpanel;
        try_files $uri $uri/ /index.html;
    }
}
```

### ✅ Solution 3 : Proxy Cloudflare (Si vous utilisez Cloudflare)

1. Allez dans **Cloudflare Dashboard** → **Workers**
2. Créez un Worker qui fait proxy vers `https://crm-backend-production-f0c8.up.railway.app`
3. Configurez les routes pour `adminpanel.mdmcmusicads.com/api/*`

## 🔍 Vérification

### Tester la configuration CORS :

```bash
# Vérifier si CORS est configuré
curl -H "Origin: https://adminpanel.mdmcmusicads.com" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type,Authorization" \
     -X OPTIONS \
     https://crm-backend-production-f0c8.up.railway.app/api/auth/login \
     -v
```

Vous devriez voir dans les headers de réponse :
```
Access-Control-Allow-Origin: https://adminpanel.mdmcmusicads.com
Access-Control-Allow-Methods: POST, GET, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
```

## 📝 Notes Importantes

1. **En développement local** : Le proxy Vite est configuré dans `vite.config.js` pour contourner CORS automatiquement
2. **En production** : Vous DEVEZ configurer CORS sur le backend ou utiliser un proxy serveur
3. **Sécurité** : Ne pas autoriser `*` (toutes les origines) en production. Utilisez toujours des origines spécifiques.

## 🚀 Actions Requises

- [ ] Configurer CORS sur le backend Railway (`https://crm-backend-production-f0c8.up.railway.app`) pour autoriser `https://adminpanel.mdmcmusicads.com`
- [ ] Tester la connexion depuis le frontend
- [ ] Vérifier que les headers CORS sont correctement retournés
- [ ] Documenter la configuration CORS dans le backend

## 📞 Support

Si vous avez besoin d'aide pour configurer CORS, contactez l'administrateur système ou le développeur backend.

