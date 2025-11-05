# 🚫 CODE BACKEND INTERDIT DANS CE REPOSITORY

## ⚠️ ATTENTION CRITIQUE

**CE REPOSITORY EST UNIQUEMENT POUR LE FRONTEND**

Tout code backend doit être dans un repository séparé.

## 🚫 LISTE DES FICHIERS/DOSSIERS INTERDITS

### Dossiers interdits
- ❌ `/backend/`
- ❌ `/routes/`
- ❌ `/controllers/`
- ❌ `/models/`
- ❌ `/middleware/`
- ❌ `/config/` (sauf config frontend)

### Fichiers interdits
- ❌ `server.js`
- ❌ `app.js`
- ❌ `index.js` (serveur)
- ❌ `passport.js`
- ❌ `database.js`
- ❌ `db.js`
- ❌ `*.backend.js`
- ❌ `*.server.js`

### Packages interdits dans package.json
- ❌ `express`
- ❌ `mongoose`
- ❌ `passport`
- ❌ `passport-jwt`
- ❌ `passport-google-oauth20`
- ❌ `bcrypt`
- ❌ `jsonwebtoken` (côté serveur)
- ❌ `nodemailer`
- ❌ `socket.io` (serveur)
- ❌ Tout package backend Node.js

## ✅ CE QUI EST AUTORISÉ

### Technologies frontend uniquement
- ✅ React
- ✅ Vite
- ✅ Axios (pour appels API)
- ✅ React Router
- ✅ Tailwind CSS
- ✅ Composants UI
- ✅ Hooks React
- ✅ Context API

### Fichiers autorisés
- ✅ `src/` (code React)
- ✅ `public/` (assets)
- ✅ `vite.config.js`
- ✅ `tailwind.config.js`
- ✅ `Dockerfile` (pour build frontend)
- ✅ `docker/nginx.conf` (configuration Nginx)

## 🔍 VÉRIFICATION AVANT COMMIT

Avant chaque commit, vérifiez que vous n'ajoutez pas :

```bash
# Vérifier les fichiers ajoutés
git status

# Vérifier le contenu de package.json
cat package.json | grep -E "(express|mongoose|passport|bcrypt)"

# Vérifier les nouveaux fichiers
git diff --name-only HEAD
```

## 📝 SI VOUS AVEZ BESOIN DE CODE BACKEND

1. **Créez un repository séparé** pour le backend
2. **N'ajoutez JAMAIS** de code backend dans ce repository frontend
3. **Le backend doit être** dans un repository dédié (ex: `Crm-Backend`)

## ⚠️ CONSEQUENCES

Si du code backend est ajouté dans ce repository :
- ❌ Railway essaiera d'exécuter le backend au lieu du frontend
- ❌ Le déploiement échouera
- ❌ Des erreurs de configuration apparaîtront
- ❌ Le service ne démarrera pas correctement

## ✅ SOLUTION

**Gardez ce repository 100% frontend uniquement !**

---

**🚫 NE JAMAIS AJOUTER DE CODE BACKEND ICI 🚫**

*Fichier de protection créé le 5 novembre 2025*

