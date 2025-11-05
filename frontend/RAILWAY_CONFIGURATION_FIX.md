# 🚨 Problème : Railway exécute le backend au lieu du frontend

## Diagnostic

L'erreur `TypeError: JwtStrategy requires a secret or key` dans `/app/config/passport.js` indique que Railway essaie d'exécuter du code backend au lieu du frontend.

## Cause probable

Railway est probablement connecté au **mauvais repository** ou au **mauvais dossier** :
- Repository backend : `DenisAIagent/Crm-Backend` 
- Repository frontend : `DenisAIagent/CRM-frontend2` ✅

## Solution dans Railway Dashboard

### 1. Vérifier le Repository Connecté

1. Allez dans **Railway Dashboard** → **CRM-frontend2** → **Settings**
2. Vérifiez la section **Source** :
   - **Repository** : Doit être `DenisAIagent/CRM-frontend2` ✅
   - **Branch** : `main`
   - **Root Directory** : Doit être **VIDE** (racine) ✅

**Note importante** : Le repository `CRM-frontend2` devrait contenir uniquement le frontend à la racine (Dockerfile, package.json, src/, etc.). 
Si Railway essaie d'exécuter du backend, c'est que soit :
- Il y a du code backend dans le repository GitHub (à vérifier)
- Railway détecte automatiquement Node.js et ignore le Dockerfile

### 2. Si le mauvais repository est connecté

1. Dans **Settings** → **Source**
2. Cliquez sur **Disconnect**
3. Cliquez sur **Connect GitHub**
4. Sélectionnez `DenisAIagent/CRM-frontend2`
5. Sélectionnez la branche `main`
6. Laissez **Root Directory** vide

### 3. Vérifier le contenu du repository GitHub

Si Railway essaie d'exécuter du backend, vérifiez que le repository GitHub `CRM-frontend2` contient **uniquement** du frontend à la racine :

- ✅ `Dockerfile`
- ✅ `package.json`
- ✅ `src/`
- ✅ `vite.config.js`
- ❌ **PAS** de `server.js`, `passport.js`, `config/passport.js`, etc.

Si le repository contient du backend, il faut soit :
1. Le supprimer du repository GitHub
2. Ou configurer Root Directory vers un sous-dossier qui contient uniquement le frontend

### 4. Forcer l'utilisation du Dockerfile

1. Dans **Settings** → **Build & Deploy**
2. Vérifiez :
   - **Build Command** : Vide (le Dockerfile gère ça)
   - **Start Command** : Vide (le Dockerfile gère ça avec CMD)
   - **Dockerfile Path** : `Dockerfile` (ou vide, Railway le trouvera dans `/frontend`)
   - **Build Method** : Sélectionnez **Dockerfile**

## 🔍 Vérification après correction

Après avoir corrigé la configuration, redéployez. Les logs devraient montrer :

```
🚀 Starting Nginx on port [PORT]
```

Et **PAS** :
```
TypeError: JwtStrategy requires a secret or key
```

## ⚠️ Important

- Le repository **frontend** ne doit **PAS** contenir de code backend
- Pas de `server.js`, `passport.js`, `config/passport.js`, etc.
- Seulement des fichiers React/Vite

## 📝 Checklist

- [ ] Repository : `DenisAIagent/CRM-frontend2`
- [ ] Branch : `main`
- [ ] **Root Directory : VIDE** (racine) ✅
- [ ] Build Method : Dockerfile
- [ ] Dockerfile présent à la racine
- [ ] Le repository GitHub contient uniquement du frontend (pas de backend)
- [ ] Pas de `server.js`, `passport.js`, `config/passport.js` dans le repository

## 🎯 Configuration exacte

**Settings → Source :**
```
Repository: DenisAIagent/CRM-frontend2
Branch: main
Root Directory: (vide)  ← Racine du repository
```

**Settings → Build & Deploy :**
```
Build Method: Dockerfile
Dockerfile Path: Dockerfile (ou vide)
```

