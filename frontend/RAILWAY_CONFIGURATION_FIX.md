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
   - **Root Directory** : Doit être **`frontend`** ⚠️ **IMPORTANT** ✅

**Note importante** : Le repository `CRM-frontend2` contient à la fois `/backend` et `/frontend`. 
Vous devez configurer **Root Directory = `frontend`** pour que Railway utilise le bon dossier !

### 2. Si le mauvais repository est connecté

1. Dans **Settings** → **Source**
2. Cliquez sur **Disconnect**
3. Cliquez sur **Connect GitHub**
4. Sélectionnez `DenisAIagent/CRM-frontend2`
5. Sélectionnez la branche `main`
6. Laissez **Root Directory** vide

### 3. Configurer Root Directory

**⚠️ ÉTAPE CRITIQUE** : Le repository contient `/backend` et `/frontend`

1. Dans **Settings** → **Source**
2. Modifiez **Root Directory** :
   - **Root Directory** : `frontend` ✅ (pas vide !)
3. Cliquez sur **Save**

Cela indique à Railway d'utiliser le dossier `/frontend` qui contient :
- `Dockerfile`
- `package.json`
- `src/`
- `vite.config.js`

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
- [ ] **Root Directory : `frontend`** ⚠️ **CRITIQUE - PAS vide !**
- [ ] Build Method : Dockerfile
- [ ] Dockerfile présent dans `/frontend`
- [ ] Le dossier `/frontend` contient bien `package.json`, `src/`, `vite.config.js`

## 🎯 Configuration exacte

**Settings → Source :**
```
Repository: DenisAIagent/CRM-frontend2
Branch: main
Root Directory: frontend  ← IMPORTANT !
```

**Settings → Build & Deploy :**
```
Build Method: Dockerfile
Dockerfile Path: Dockerfile (ou vide)
```

