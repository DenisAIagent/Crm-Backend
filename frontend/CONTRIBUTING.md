# Guide de Contribution - Frontend Only

## ⚠️ RÈGLE FONDAMENTALE

**CE REPOSITORY EST UNIQUEMENT FRONTEND**

Tout code backend doit être dans un repository séparé.

## 🚫 CHOSES À NE JAMAIS FAIRE

### ❌ Ne pas créer de fichiers backend
- Pas de `server.js`
- Pas de `routes/`, `controllers/`, `models/`
- Pas de `passport.js` ou autres fichiers d'authentification serveur
- Pas de configuration base de données

### ❌ Ne pas ajouter de dépendances backend
Avant d'ajouter un package dans `package.json`, vérifiez qu'il ne soit pas :
- Un framework backend (Express, Fastify, etc.)
- Un ORM/ODM (Mongoose, Sequelize, etc.)
- Un middleware backend (Passport, etc.)
- Un package serveur Node.js

### ❌ Ne pas créer de logique serveur
- Pas de routes API dans ce repository
- Pas de gestion de base de données
- Pas de logique d'authentification côté serveur
- Pas de traitement de données serveur

## ✅ CHOSES À FAIRE

### ✅ Code frontend uniquement
- Composants React
- Pages React
- Hooks React
- Context API
- Utilitaires frontend

### ✅ Appels API externes
- Utiliser `axios` pour appeler l'API backend externe
- L'API backend est à : `https://crm-backend-production-f0c8.up.railway.app`
- Tous les appels API via `src/utils/api.js`

### ✅ Configuration frontend
- Variables d'environnement avec préfixe `VITE_`
- Configuration Vite
- Configuration Tailwind
- Configuration Docker pour build frontend

## 📋 Checklist avant commit

- [ ] Pas de fichiers backend ajoutés
- [ ] Pas de dépendances backend dans `package.json`
- [ ] Toutes les variables d'environnement commencent par `VITE_`
- [ ] Pas de `server.js` ou fichiers similaires
- [ ] Pas de dossiers `routes/`, `controllers/`, `models/`
- [ ] Le code ajouté est uniquement frontend (React, Vite, etc.)

## 🔍 Commandes de vérification

```bash
# Vérifier les fichiers ajoutés
git status

# Vérifier package.json
grep -E "(express|mongoose|passport|bcrypt)" package.json

# Vérifier les nouveaux fichiers
git diff --name-only HEAD | grep -E "(server|backend|routes|controllers|models)"
```

## 📝 Si vous avez besoin de code backend

1. Créez un **repository séparé** pour le backend
2. N'ajoutez **JAMAIS** de code backend dans ce repository
3. Le backend doit être dans un repository dédié

## ⚠️ Conséquences de l'ajout de code backend

Si du code backend est ajouté :
- ❌ Railway essaiera d'exécuter le backend
- ❌ Le déploiement échouera
- ❌ Des erreurs de configuration apparaîtront
- ❌ Le service ne démarrera pas

## ✅ Solution

**Gardez ce repository 100% frontend uniquement !**

---

**🚫 NE JAMAIS AJOUTER DE CODE BACKEND ICI 🚫**

