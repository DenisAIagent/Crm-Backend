# MDMC Music Ads CRM - Monorepo

🎵 **CRM complet pour agences de marketing musical** - Gestion des leads, campagnes et analytics en temps réel.

## 📁 Structure du Projet

```
📦 MDMC_CRM_Monorepo/
├── 🖥️  frontend/          # Application React/Vite
│   ├── src/               # Code source React
│   ├── public/            # Assets statiques
│   ├── package.json       # Dépendances frontend
│   └── Dockerfile         # Build frontend pour Railway
│
├── 🔧  backend/           # API Node.js/Express
│   ├── controllers/       # Logique métier
│   ├── models/           # Modèles MongoDB
│   ├── routes/           # Endpoints API
│   ├── middleware/       # Auth & validation
│   ├── config/           # Configuration DB
│   ├── scripts/          # Scripts de seeding
│   ├── server.js         # Serveur Express
│   ├── package.json      # Dépendances backend
│   └── Dockerfile        # Build backend pour Railway
│
├── 🐳  docker/            # Configuration Docker commune
│   ├── nginx.conf        # Configuration Nginx
│   └── start.sh          # Script de démarrage
│
└── 📚  docs/              # Documentation globale
```

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7+-green.svg)](https://mongodb.com/)
[![Express](https://img.shields.io/badge/Express-4+-black.svg)](https://expressjs.com/)

## 🚀 Fonctionnalités principales

### 📊 **Gestion des Leads**
- Capture automatique via webhooks (formulaires website)
- Système de priorités automatique basé sur le budget et la plateforme
- Suivi du pipeline de conversion en temps réel
- Architecture lead-to-company pour la facturation

### 🎯 **Gestion des Campagnes**
- Création et suivi des campagnes multi-plateformes
- Intégration TikTok, Meta, YouTube, Spotify, Google Ads
- KPIs et métriques de performance en temps réel
- Budgeting et ROI tracking

### 📈 **Analytics Avancés**
- Dashboard temps réel avec métriques calculées
- IA Insights basées sur les données réelles
- Objectifs mensuels et tracking de progression
- Exports et rapports automatisés

### 🔐 **Sécurité Enterprise**
- Authentification JWT avec refresh tokens
- Chiffrement AES-256 pour les données sensibles
- Rate limiting et protection CSRF
- Gestion des rôles et permissions

## 🛠️ Stack Technique

### Frontend
- **React 18** avec Hooks et Context API
- **React Query** pour la gestion d'état serveur
- **React Router** pour la navigation
- **Socket.io Client** pour les updates temps réel
- **CSS-in-JS** avec design system MDMC

### Backend
- **Node.js 18+** avec ES Modules
- **Express.js** avec architecture RESTful
- **MongoDB** avec Mongoose ODM
- **Socket.io** pour temps réel
- **JWT** pour l'authentification
- **Bcrypt** pour les mots de passe

### Services Externes
- **Mailgun** pour l'envoi d'emails
- **Railway** pour MongoDB hosting
- **Brevo** comme fallback SMTP

## 🚀 Installation et Déploiement

### Prérequis
```bash
node >= 18.0.0
npm >= 8.0.0
MongoDB >= 7.0
```

### Installation locale
```bash
# Cloner le repository
git clone https://github.com/votre-username/mdmc-crm.git
cd mdmc-crm

# Installer les dépendances
npm install
cd client && npm install && cd ..

# Configuration environnement
cp .env.example .env
# Éditer .env avec vos valeurs

# Démarrer en développement
npm run dev:all
```

### Variables d'environnement essentielles

```env
# Base
NODE_ENV=production
PORT=5001
BASE_URL=https://votre-domaine.com

# MongoDB (Railway recommandé)
MONGODB_URI=mongodb://user:pass@host:port/db
DB_NAME=mdmc_crm

# JWT Security (générer avec OpenSSL)
JWT_SECRET=votre_jwt_secret_64_chars
JWT_REFRESH_SECRET=votre_refresh_secret_64_chars

# Email (Mailgun recommandé)
MAILGUN_API_KEY=votre_mailgun_api_key
MAILGUN_DOMAIN=mg.votre-domaine.com
MAILGUN_FROM=MDMC CRM <noreply@votre-domaine.com>
```

### Déploiement Railway

1. **Créer le projet Railway**
```bash
# Installer Railway CLI
npm install -g @railway/cli

# Login et deploy
railway login
railway init
railway up
```

2. **Configuration MongoDB Railway**
- Créer service MongoDB
- Copier la connection string dans `MONGODB_URI`

3. **Variables d'environnement**
```bash
railway variables set NODE_ENV=production
railway variables set PORT=3000
railway variables set MONGODB_URI="mongodb://..."
railway variables set JWT_SECRET="..."
# Ajouter toutes les variables nécessaires
```

### Déploiement Vercel

```bash
# Installation Vercel CLI
npm install -g vercel

# Configuration
vercel --prod

# Variables d'environnement via dashboard
# ou vercel env add VARIABLE_NAME
```

## 🔧 Scripts disponibles

```bash
# Développement
npm run dev:all          # Frontend + Backend
npm run dev:client       # Frontend seulement
npm run dev:server       # Backend seulement

# Production
npm run build            # Build frontend
npm run start            # Démarrer production
npm run start:server     # Backend production

# Maintenance
npm run create:admin     # Créer utilisateur admin
npm run test             # Tests (à implémenter)
npm run lint             # Linting (à implémenter)
```

## 👤 Première connexion

### Créer un administrateur
```bash
# Exécuter le script de création admin
node create-secure-admin.js

# Ou utiliser le script npm
npm run create:admin
```

Identifiants par défaut:
- **Email**: denis@mdmcmusicads.com
- **Mot de passe**: généré automatiquement et envoyé par email

**⚠️ Changez immédiatement le mot de passe après la première connexion**

## 🌐 Intégration Website

Le CRM s'intègre automatiquement avec votre site web via webhooks:

### Endpoint webhook
```
POST /api/webhooks/form-submission
```

### Intégration formulaire
```javascript
// Exemple d'intégration dans votre form
const submitToCRM = async (formData) => {
  const response = await fetch('/api/webhooks/form-submission', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      artistName: formData.artistName,
      platform: formData.platform,
      budget: formData.budget,
      message: formData.message,
      source: 'website',
      formType: 'contact'
    })
  });
};
```

## 📱 API Reference

### Authentication
```bash
POST /api/auth/login
POST /api/auth/register
POST /api/auth/refresh
```

### Leads
```bash
GET    /api/leads                 # Liste des leads
POST   /api/leads                 # Créer lead
PUT    /api/leads/:id             # Modifier lead
DELETE /api/leads/:id             # Supprimer lead
```

### Campaigns
```bash
GET    /api/campaigns             # Liste campagnes
POST   /api/campaigns             # Créer campagne
PUT    /api/campaigns/:id         # Modifier campagne
```

### Analytics
```bash
GET    /api/analytics/overview    # Métriques générales
GET    /api/analytics/conversion  # Taux de conversion
GET    /api/analytics/revenue     # Revenus
```

## 🎨 Design System

Le CRM utilise le design system MDMC:

```css
/* Couleurs principales */
--mdmc-black: #000000
--mdmc-white: #ffffff
--mdmc-red: #e50914
--mdmc-gray: #f8f9fa

/* Typographie */
--font-primary: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif
```

## 🔧 Maintenance et Monitoring

### Logs
Les logs sont automatiquement créés dans `logs/`:
- `access.log` - Accès API
- `error.log` - Erreurs système
- `crm.log` - Logs métier

### Monitoring recommandé
- **Sentry** pour le tracking d'erreurs
- **LogRocket** pour les sessions utilisateur
- **Uptime Robot** pour la surveillance

### Backup automatique
```bash
# Configuration backup dans .env
BACKUP_RETENTION_DAYS=30
BACKUP_S3_BUCKET=mdmc-backups
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit vos changements (`git commit -m 'Ajout nouvelle fonctionnalité'`)
4. Push vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrir une Pull Request

## 📄 License

Ce projet est sous licence propriétaire MDMC Music Ads.

## 📞 Support

- **Email**: support@mdmcmusicads.com
- **Documentation**: [docs.mdmcmusicads.com](https://docs.mdmcmusicads.com)
- **Issues**: [GitHub Issues](https://github.com/votre-username/mdmc-crm/issues)

---

**🎵 Développé avec ❤️ par l'équipe MDMC Music Ads**