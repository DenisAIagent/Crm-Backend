# 🎨 MDMC Music Ads CRM - Frontend Only

> **⚠️ ATTENTION CRITIQUE : CE REPOSITORY EST UNIQUEMENT FRONTEND ⚠️**
> 
> **🚫 NE JAMAIS AJOUTER DE CODE BACKEND ICI 🚫**
> 
> Ce repository contient **uniquement** le code frontend React/Vite. Tout code backend doit être dans un repository séparé.

## 🎯 **Architecture**

Ce repository est dédié **exclusivement** au frontend de l'application MDMC CRM :

- ✅ **Frontend React 18** avec Vite
- ✅ **API Client** (appels vers API externe)
- ✅ **Dockerfile** pour déploiement Nginx
- ❌ **PAS de code backend** (Express, Node.js serveur, etc.)
- ❌ **PAS de base de données** (MongoDB, etc.)
- ❌ **PAS de logique serveur** (auth JWT côté serveur, etc.)

## 🚫 **CE QUI EST INTERDIT DANS CE REPOSITORY**

### ❌ **Fichiers/Dossiers à NE JAMAIS créer :**

```
❌ /backend/
❌ /server.js
❌ /routes/
❌ /controllers/
❌ /models/
❌ /middleware/
❌ /config/passport.js
❌ /config/database.js
❌ package.json avec Express, Mongoose, Passport, etc.
```

### ❌ **Dépendances à NE JAMAIS ajouter :**

```json
❌ "express"
❌ "mongoose"
❌ "passport"
❌ "passport-jwt"
❌ "bcrypt"
❌ "jsonwebtoken" (côté serveur)
❌ "nodemailer"
❌ Tout package backend Node.js
```

### ✅ **Ce qui est autorisé :**

```
✅ /src/ (code React)
✅ /public/ (assets statiques)
✅ /docker/ (config Nginx)
✅ package.json (dépendances frontend uniquement)
✅ Dockerfile (pour build frontend)
✅ vite.config.js
✅ Configuration Vite/React
```

## 📋 **Structure du Projet**

```
frontend/
├── src/                    # Code source React
│   ├── components/        # Composants React
│   ├── pages/            # Pages React
│   ├── context/          # Context API
│   ├── hooks/            # Hooks React
│   └── utils/            # Utilitaires (API client)
├── public/               # Assets statiques
├── docker/               # Configuration Docker/Nginx
├── Dockerfile            # Build Docker pour production
├── package.json          # Dépendances frontend uniquement
├── vite.config.js        # Configuration Vite
└── README.md            # Ce fichier
```

## 🔧 **Configuration**

### Variables d'environnement

Toutes les variables doivent commencer par `VITE_` :

```env
# API Backend (externe)
VITE_API_URL=https://crm-backend-production-f0c8.up.railway.app

# Google OAuth
VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com

# Feature Flags
VITE_ENABLE_MOCK_API=false
VITE_FRONTEND_ONLY=false
```

### Backend API

Le frontend communique avec le backend via l'API externe :
- **URL Backend** : `https://crm-backend-production-f0c8.up.railway.app`
- **Endpoints** : `/api/*`
- **Authentification** : JWT via cookies/headers

## 🚀 **Déploiement**

### Railway

Ce frontend est déployé sur Railway avec :
- **Dockerfile** : Build multi-stage (Node.js build + Nginx serve)
- **Nginx** : Serve les fichiers statiques
- **Port** : Dynamique (Railway)

### Configuration Railway

Dans Railway Dashboard :
- **Root Directory** : Vide (racine)
- **Build Method** : Dockerfile
- **Repository** : `DenisAIagent/CRM-frontend2`

## 📚 **Documentation**

- `FRONTEND_ONLY_README.md` - Guide mode frontend-only
- `CORS_CONFIGURATION.md` - Configuration CORS
- `DEBUG_CORS.md` - Guide débogage CORS
- `RAILWAY_DEPLOYMENT.md` - Guide déploiement Railway
- `RAILWAY_CONFIGURATION_FIX.md` - Résolution problèmes Railway

## ⚠️ **RÈGLES STRICTES**

1. **NE JAMAIS** créer de fichiers backend dans ce repository
2. **NE JAMAIS** ajouter de dépendances backend dans `package.json`
3. **TOUJOURS** utiliser l'API externe pour les données
4. **TOUJOURS** vérifier avant de commit que vous n'ajoutez pas de code backend

## 🛠️ **Développement**

### Installation

```bash
npm install
```

### Développement local

```bash
npm run dev
```

### Build production

```bash
npm run build
```

### Preview build

```bash
npm run preview
```

## 📞 **Support**

Si vous avez des questions sur l'architecture :
- **Frontend** : Ce repository ✅
- **Backend** : Repository séparé (ne pas créer ici) ❌

---

**⚠️ RAPPEL : CE REPOSITORY EST UNIQUEMENT FRONTEND - NE JAMAIS AJOUTER DE CODE BACKEND ⚠️**

*Dernière mise à jour : 5 novembre 2025*

