# MDMC Music Ads CRM - Backend Deployment Guide

## 🚀 Déploiement sur Railway

### Prérequis
- Compte Railway (https://railway.app)
- Compte MongoDB Atlas (https://cloud.mongodb.com)
- Compte Google Cloud Console (pour OAuth)
- Railway CLI installé

### 1. Configuration MongoDB Atlas

1. Créez un cluster MongoDB Atlas
2. Configurez l'accès réseau (0.0.0.0/0 pour Railway)
3. Créez un utilisateur de base de données
4. Récupérez la chaîne de connexion MongoDB

### 2. Configuration Google OAuth

1. Allez sur [Google Cloud Console](https://console.cloud.google.com)
2. Créez un nouveau projet ou sélectionnez un existant
3. Activez l'API Google+
4. Créez des identifiants OAuth 2.0:
   - Type d'application: Application Web
   - URIs de redirection autorisés:
     - `https://api2.mdmcmusicads.com/api/auth/google/callback`
     - `http://localhost:5000/api/auth/google/callback` (développement)
5. Notez le Client ID et Client Secret

### 3. Déploiement Railway

#### Option A: Interface Web Railway

1. Connectez-vous à Railway
2. Créez un nouveau projet
3. Connectez votre repository GitHub
4. Configurez les variables d'environnement:

```bash
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mdmc-crm
JWT_SECRET=your-super-secret-jwt-key-32-chars-min
JWT_REFRESH_SECRET=your-refresh-secret-key-32-chars-min
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://api2.mdmcmusicads.com/api/auth/google/callback
FRONTEND_URL=https://adminpanel.mdmcmusicads.com
CLIENT_URL=https://adminpanel.mdmcmusicads.com
SESSION_SECRET=your-session-secret-key-32-chars-min
```

5. Configurez le domaine personnalisé: `api2.mdmcmusicads.com`

#### Option B: Railway CLI

```bash
# Installer Railway CLI
npm install -g @railway/cli

# Se connecter
railway login

# Créer un nouveau projet
railway init

# Configurer les variables d'environnement
railway variables set NODE_ENV=production
railway variables set PORT=5000
railway variables set MONGODB_URI="votre-uri-mongodb"
# ... autres variables

# Déployer
railway up
```

### 4. Configuration DNS

Configurez votre DNS pour pointer `api2.mdmcmusicads.com` vers Railway:

1. Ajoutez un enregistrement CNAME:
   - Nom: `api2`
   - Valeur: `votre-app.railway.app`

### 5. Variables d'Environnement Complètes

```bash
# Server
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mdmc-crm

# JWT
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_REFRESH_SECRET=your-refresh-secret-key-minimum-32-characters
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://api2.mdmcmusicads.com/api/auth/google/callback

# Frontend
FRONTEND_URL=https://adminpanel.mdmcmusicads.com
CLIENT_URL=https://adminpanel.mdmcmusicads.com

# Session
SESSION_SECRET=your-session-secret-minimum-32-characters

# Optional: Email (pour reset password)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@mdmcmusicads.com

# Optional: Monitoring
SENTRY_DSN=your-sentry-dsn

# Optional: API Keys
VALID_API_KEYS=api-key-1,api-key-2
```

### 6. Vérification du Déploiement

1. Vérifiez la santé de l'API:
   ```bash
   curl https://api2.mdmcmusicads.com/health
   ```

2. Testez l'authentification admin:
   ```bash
   curl -X POST https://api2.mdmcmusicads.com/api/auth/admin-login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@mdmcmusicads.com",
       "password": "MDMC_Admin_2025!"
     }'
   ```

3. Vérifiez Google OAuth:
   ```
   https://api2.mdmcmusicads.com/api/auth/google
   ```

### 7. Initialisation des Données

Pour ajouter des données de test:

```bash
# Se connecter au projet Railway
railway shell

# Exécuter le script de seed
npm run seed
```

### 8. Monitoring et Logs

- Logs Railway: `railway logs`
- Health check: `https://api2.mdmcmusicads.com/health`
- Monitoring personnalisé avec Sentry (optionnel)

## 🔧 Configuration Frontend

Mise à jour des variables d'environnement frontend pour pointer vers l'API:

```bash
# Frontend .env
VITE_API_URL=https://api2.mdmcmusicads.com
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

## 🛡️ Sécurité

### CORS
L'API est configurée pour accepter les requêtes de:
- `https://adminpanel.mdmcmusicads.com`
- `https://mdmcmusicads.com`
- `http://localhost:3000` (développement)
- `http://localhost:5173` (développement Vite)

### Rate Limiting
- 100 requêtes par 15 minutes par IP en production
- 1000 requêtes par 15 minutes en développement

### Authentification
- JWT avec expiration automatique
- Refresh tokens pour renouvellement
- Google OAuth 2.0
- Sessions sécurisées pour OAuth

## 📊 Tests de Performance

### Test de Charge
```bash
# Installation d'Artillery
npm install -g artillery

# Test de charge basique
artillery quick --count 10 --num 100 https://api2.mdmcmusicads.com/health
```

### Test des Endpoints
```bash
# Test login admin
curl -X POST https://api2.mdmcmusicads.com/api/auth/admin-login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mdmcmusicads.com","password":"MDMC_Admin_2025!"}'

# Test avec token
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://api2.mdmcmusicads.com/api/leads
```

## 🔍 Dépannage

### Problèmes Courants

1. **Erreur de connexion MongoDB**
   - Vérifiez l'URI MongoDB
   - Contrôlez les paramètres réseau Atlas
   - Vérifiez les identifiants

2. **Google OAuth ne fonctionne pas**
   - Vérifiez les URIs de redirection
   - Contrôlez les identifiants Google
   - Vérifiez les domaines autorisés

3. **CORS Errors**
   - Vérifiez la configuration CORS
   - Ajoutez le domaine frontend aux origines autorisées

4. **Variables d'environnement**
   - Utilisez `railway variables` pour lister
   - Vérifiez la syntaxe des valeurs

### Logs et Debug

```bash
# Voir les logs en temps réel
railway logs --tail

# Variables d'environnement
railway variables

# Status du déploiement
railway status
```

## 📈 Monitoring Production

### Métriques à Surveiller
- Temps de réponse API
- Taux d'erreur
- Utilisation mémoire/CPU
- Connexions base de données
- Authentifications réussies/échouées

### Alertes Recommandées
- Temps de réponse > 2s
- Taux d'erreur > 5%
- Utilisation CPU > 80%
- Erreurs de base de données

## 🔄 Mise à Jour

Pour mettre à jour l'API:

1. Push vers GitHub (déclenchement automatique)
2. Ou redéploiement manuel: `railway up`
3. Vérifiez la santé après déploiement
4. Rollback si nécessaire: `railway rollback`

## 📞 Support

- **Documentation API**: https://api2.mdmcmusicads.com/
- **Health Check**: https://api2.mdmcmusicads.com/health
- **Support**: dev@mdmcmusicads.com

---

**Backend Version**: 1.0.0
**Dernière Mise à Jour**: Novembre 2024