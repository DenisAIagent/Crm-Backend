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
   - **Root Directory** : Doit être **vide** (à la racine) ✅

### 2. Si le mauvais repository est connecté

1. Dans **Settings** → **Source**
2. Cliquez sur **Disconnect**
3. Cliquez sur **Connect GitHub**
4. Sélectionnez `DenisAIagent/CRM-frontend2`
5. Sélectionnez la branche `main`
6. Laissez **Root Directory** vide

### 3. Forcer l'utilisation du Dockerfile

1. Dans **Settings** → **Build & Deploy**
2. Vérifiez :
   - **Build Command** : Vide ou `docker build -t frontend .`
   - **Start Command** : Vide (le Dockerfile gère ça)
   - **Dockerfile Path** : `Dockerfile` (ou vide si à la racine)
   - **Build Method** : Sélectionnez **Dockerfile**

### 4. Vérifier que le bon dossier est utilisé

Si le repository `CRM-frontend2` contient plusieurs dossiers (client/, frontend/, etc.) :
- **Root Directory** doit pointer vers le dossier qui contient :
  - `Dockerfile`
  - `package.json`
  - `src/`
  - `vite.config.js`

Si tout est à la racine, laissez **Root Directory** vide.

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
- [ ] Root Directory : Vide (racine)
- [ ] Build Method : Dockerfile
- [ ] Dockerfile présent à la racine
- [ ] Aucun code backend dans le repository frontend

