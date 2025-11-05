# MDMC Music Ads CRM - Mode Frontend-Only

> **⚠️ ATTENTION : CE REPOSITORY EST UNIQUEMENT FRONTEND ⚠️**
> 
> **🚫 NE JAMAIS AJOUTER DE CODE BACKEND ICI 🚫**

## 🎯 **Projet nettoyé et optimisé pour être 100% frontend**

Ce projet a été complètement nettoyé pour éliminer toutes les dépendances backend inappropriées et fonctionne désormais en mode **frontend-only** avec des données simulées.

**⚠️ RÈGLE STRICTE : Tout code backend doit être dans un repository séparé !**

## ✅ **Nettoyage effectué**

### 1. **Configuration mise à jour**
- ✅ Variables d'environnement pointent vers des APIs externes (`https://api.mdmcmusicads.com`)
- ✅ Ajout du flag `VITE_FRONTEND_ONLY=true`
- ✅ Ajout du flag `VITE_ENABLE_MOCK_API=true`
- ✅ Suppression des références `localhost:5001`

### 2. **Système d'API Mock créé**
- ✅ API mock complet dans `src/utils/api.js`
- ✅ Données de test intégrées (utilisateurs, leads, campagnes)
- ✅ Simulation de tous les appels API (authentification, CRUD, analytics)
- ✅ Gestion automatique mock/production selon les variables d'environnement

### 3. **Authentification simplifiée**
- ✅ AuthContext nettoyé pour utiliser le système mock
- ✅ Auto-connexion en mode démo avec utilisateur Denis
- ✅ Google OAuth simulé en mode frontend-only
- ✅ Gestion des tokens mockés

### 4. **Socket.IO adapté**
- ✅ SocketContext modifié pour supporter le mode mock
- ✅ Notifications simulées pour la démo
- ✅ Fallback automatique vers mock si serveur indisponible
- ✅ Pas de dépendance serveur en mode frontend-only

### 5. **Fichiers backend supprimés**
- ✅ `test-env.js` (script de test backend)
- ✅ `MDMC_LOGIN_IMPLEMENTATION.md` (documentation backend)
- ✅ Toutes les références localhost inappropriées

## 🚀 **Utilisation**

### Mode Frontend-Only (Recommandé pour démo)
```bash
# Dans .env
VITE_FRONTEND_ONLY=true
VITE_ENABLE_MOCK_API=true

npm run dev
# ou
npm run build
```

### Mode Production (avec vraie API)
```bash
# Dans .env.production
VITE_FRONTEND_ONLY=false
VITE_ENABLE_MOCK_API=false
VITE_API_URL=https://api.mdmcmusicads.com

npm run build
```

## 🧪 **Fonctionnalités testées**

- ✅ Build sans erreurs
- ✅ Authentification automatique en mode démo
- ✅ Navigation complète dans l'application
- ✅ Données mock affichées (leads, campagnes, analytics)
- ✅ Notifications simulées
- ✅ Formulaires fonctionnels
- ✅ Export de données mock
- ✅ Google OAuth simulé

## 🔧 **Variables d'environnement importantes**

```env
# Mode frontend-only activé
VITE_FRONTEND_ONLY=true
VITE_ENABLE_MOCK_API=true

# API externe (pas localhost)
VITE_API_URL=https://api.mdmcmusicads.com

# Démo
VITE_DEMO_MODE=true
VITE_DEMO_EMAIL=denis@mdmc.fr
VITE_DEMO_PASSWORD=password123
```

## 🎨 **Utilisateur démo automatique**

En mode frontend-only, l'application se connecte automatiquement avec :
- **Nom** : Denis Adam
- **Email** : denis@mdmc.fr
- **Rôle** : Admin
- **Équipe** : Management
- **Permissions** : Toutes

## 📁 **Structure API Mock**

Le fichier `src/utils/api.js` contient :
- Données mock pour users, leads, campagnes
- Fonctions de simulation des API calls
- Gestion automatique mock/production
- Tous les endpoints CRM simulés

## 🔄 **Déploiement**

Le projet peut être déployé comme une application statique sur :
- Vercel
- Netlify
- Railway (mode frontend)
- GitHub Pages
- AWS S3 + CloudFront

**Aucun serveur backend requis en mode frontend-only !**

---

*Nettoyage effectué le 5 novembre 2025 par Claude Senior Engineer*