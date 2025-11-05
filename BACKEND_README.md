# MDMC Music Ads CRM - Backend API

## 🎯 Vue d'ensemble

Backend Node.js/Express complet et production-ready pour le CRM MDMC Music Ads. Cette API fournit toutes les fonctionnalités nécessaires pour gérer les leads, campagnes, utilisateurs et analytics avec une authentification robuste et des métriques en temps réel.

## 🚀 Fonctionnalités

### ✅ Authentification & Autorisation
- **JWT Authentication** avec refresh tokens
- **Google OAuth 2.0** integration
- **Role-based permissions** (Admin, Manager, Agent, Viewer)
- **Admin credentials prédéfinis**: `admin@mdmcmusicads.com` / `MDMC_Admin_2025!`
- Sessions sécurisées et protection CORS

### ✅ Gestion des Utilisateurs
- CRUD complet des utilisateurs
- Système de rôles et permissions granulaires
- Gestion des profils et préférences
- Suivi d'activité et statistiques

### ✅ Gestion des Leads
- CRUD complet avec validation avancée
- Système de scoring automatique
- Suivi des interactions et historique
- Filtrage et recherche avancés
- Gestion des follow-ups et rappels
- Export CSV/JSON
- Conversion tracking

### ✅ Gestion des Campagnes
- Campagnes multi-plateformes (YouTube, Meta, TikTok, Spotify)
- Métriques en temps réel (impressions, clics, conversions, ROI)
- Gestion budgétaire avancée
- Optimisations et A/B testing
- Performance tracking quotidien
- Analytics et reporting

### ✅ Analytics & Tableaux de Bord
- Agrégations MongoDB complexes
- Métriques de performance en temps réel
- Analyses de conversion et ROI
- Comparaisons temporelles
- Widgets de dashboard personnalisables
- Rapports d'équipe

### ✅ Sécurité & Production
- Rate limiting intelligent
- Validation de données complète
- Middleware de sécurité (Helmet, CORS, Sanitization)
- Gestion d'erreurs centralisée
- Logs structurés
- Health checks

## 📁 Structure du Projet

```
CRM/
├── server.js                 # Serveur principal Express
├── package-backend.json      # Dépendances backend
├── healthcheck.js           # Health check pour Railway
├── Dockerfile.backend       # Configuration Docker
├── railway-backend.json     # Configuration Railway
├── .env.example            # Variables d'environnement exemple
│
├── config/
│   ├── database.js         # Configuration MongoDB
│   └── passport.js         # Stratégies Passport (JWT, Google OAuth)
│
├── middleware/
│   ├── auth.js            # Authentification et autorisation
│   ├── errorMiddleware.js # Gestion d'erreurs globale
│   └── validation.js     # Validation des requêtes
│
├── models/
│   ├── User.js           # Modèle utilisateur avec permissions
│   ├── Lead.js           # Modèle lead avec interactions
│   └── Campaign.js       # Modèle campagne avec métriques
│
├── controllers/
│   ├── authController.js     # Authentification et profils
│   ├── userController.js     # Gestion des utilisateurs
│   ├── leadController.js     # Gestion des leads
│   ├── campaignController.js # Gestion des campagnes
│   └── analyticsController.js # Analytics et reporting
│
├── routes/
│   ├── authRoutes.js        # Routes d'authentification
│   ├── userRoutes.js        # Routes utilisateurs
│   ├── leadRoutes.js        # Routes leads
│   ├── campaignRoutes.js    # Routes campagnes
│   ├── analyticsRoutes.js   # Routes analytics
│   └── dashboardRoutes.js   # Routes dashboard
│
├── scripts/
│   └── seed.js             # Script d'initialisation des données
│
└── docs/
    ├── API_DOCUMENTATION.md  # Documentation API complète
    └── DEPLOYMENT_GUIDE.md   # Guide de déploiement
```

## 🔧 Installation et Démarrage

### Prérequis
- Node.js 18+
- MongoDB (local ou Atlas)
- Compte Google Cloud (pour OAuth)

### Installation
```bash
# Cloner le repository
git clone <repository-url>
cd CRM

# Installer les dépendances backend
npm install

# Copier et configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos valeurs

# Initialiser la base de données avec des données de test
npm run seed

# Démarrer en développement
npm run dev

# Démarrer en production
npm start
```

### Variables d'Environnement Essentielles
```bash
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mdmc-crm
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FRONTEND_URL=https://adminpanel.mdmcmusicads.com
SESSION_SECRET=your-session-secret
```

## 🌐 Déploiement Production

### Railway Deployment
```bash
# Configuration Railway
railway login
railway init
railway variables set NODE_ENV=production
railway variables set MONGODB_URI="your-mongo-uri"
railway up

# Configuration domaine
# Pointer api2.mdmcmusicads.com vers Railway
```

### Vérification Déploiement
```bash
# Health check
curl https://api2.mdmcmusicads.com/health

# Test admin login
curl -X POST https://api2.mdmcmusicads.com/api/auth/admin-login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mdmcmusicads.com","password":"MDMC_Admin_2025!"}'
```

## 📚 Documentation API

### Endpoints Principaux

#### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/admin-login` - Connexion admin
- `GET /api/auth/google` - OAuth Google
- `POST /api/auth/refresh-token` - Renouvellement token

#### Utilisateurs
- `GET /api/users` - Liste des utilisateurs
- `POST /api/users` - Créer utilisateur (admin)
- `PUT /api/users/:id` - Modifier utilisateur
- `DELETE /api/users/:id` - Désactiver utilisateur

#### Leads
- `GET /api/leads` - Liste des leads avec filtres
- `POST /api/leads` - Créer lead
- `PUT /api/leads/:id` - Modifier lead
- `POST /api/leads/:id/interactions` - Ajouter interaction
- `PATCH /api/leads/:id/convert` - Convertir lead

#### Campagnes
- `GET /api/campaigns` - Liste des campagnes
- `POST /api/campaigns` - Créer campagne
- `PATCH /api/campaigns/:id/metrics` - Mettre à jour métriques
- `GET /api/campaigns/:id/performance` - Performance détaillée

#### Analytics
- `GET /api/analytics/dashboard` - Vue d'ensemble
- `GET /api/analytics/leads` - Analytics leads
- `GET /api/analytics/campaigns` - Analytics campagnes
- `GET /api/analytics/revenue` - Analytics revenus

### Authentification
Toutes les routes protégées nécessitent un header Authorization:
```
Authorization: Bearer <jwt_token>
```

### Permissions
- **admin**: Accès complet
- **manager**: Gestion équipe et reporting
- **agent**: Leads et campagnes assignés
- **viewer**: Lecture seule

## 🔒 Sécurité

### Mesures Implémentées
- **Rate Limiting**: 100 req/15min par IP/utilisateur
- **Validation**: Sanitisation et validation complète
- **CORS**: Configuration stricte pour domaines autorisés
- **Helmet**: Protection headers HTTP
- **JWT**: Tokens sécurisés avec expiration
- **bcrypt**: Hash passwords avec salt
- **MongoDB Sanitization**: Protection injection NoSQL

### CORS Configuration
```javascript
// Domaines autorisés
const allowedOrigins = [
  'https://adminpanel.mdmcmusicads.com',
  'https://mdmcmusicads.com',
  'http://localhost:3000',
  'http://localhost:5173'
];
```

## 📊 Base de Données

### Modèles MongoDB

#### User
- Informations personnelles et authentification
- Système de rôles et permissions
- Tracking d'activité
- Google OAuth integration

#### Lead
- Informations complètes du prospect
- Historique d'interactions
- Système de scoring automatique
- Gestion des follow-ups

#### Campaign
- Configuration multi-plateformes
- Métriques temps réel
- Budget et performance tracking
- Optimisations et A/B tests

### Indexes Optimisés
```javascript
// Exemples d'indexes pour performance
db.leads.createIndex({ email: 1 })
db.leads.createIndex({ status: 1, assignedTo: 1 })
db.campaigns.createIndex({ status: 1, manager: 1 })
```

## 🧪 Testing et Debugging

### Health Checks
```bash
# Vérifier l'API
curl https://api2.mdmcmusicads.com/health

# Response attendue
{
  "status": "OK",
  "timestamp": "2024-11-05T...",
  "uptime": 3600,
  "environment": "production",
  "version": "1.0.0"
}
```

### Logs et Monitoring
```bash
# Railway logs
railway logs --tail

# Variables d'environnement
railway variables
```

## 🔄 Scripts Utiles

```bash
# Développement
npm run dev          # Démarrage avec nodemon
npm run start        # Démarrage production

# Base de données
npm run seed         # Initialiser données de test
npm run migrate      # Migrations futures

# Tests
npm test            # Tests unitaires
npm run test:watch  # Tests en mode watch
```

## 🎯 Données de Test

Le script `npm run seed` crée:
- **1 Admin**: admin@mdmcmusicads.com / MDMC_Admin_2025!
- **1 Manager**: sarah.manager@mdmcmusicads.com / Manager123!
- **2 Agents**: mike.agent@mdmcmusicads.com / Agent123!
- **5 Leads** avec différents statuts et scores
- **3 Campagnes** actives avec métriques réalistes

## 🔗 Intégrations

### Frontend
```javascript
// Configuration frontend pour pointer vers l'API
const API_BASE_URL = 'https://api2.mdmcmusicads.com';

// Headers requis
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};
```

### Google OAuth
Configuration OAuth pour domaines:
- Production: `https://api2.mdmcmusicads.com/api/auth/google/callback`
- Frontend: `https://adminpanel.mdmcmusicads.com`

## 📈 Performance

### Optimisations Implémentées
- **MongoDB Aggregations** pour analytics complexes
- **Indexes** optimisés pour requêtes fréquentes
- **Pagination** pour grandes listes
- **Caching** avec Redis (optionnel)
- **Compression** gzip des réponses
- **Connection pooling** MongoDB

### Métriques Cibles
- Temps de réponse: < 200ms (API simple)
- Temps de réponse: < 1s (Analytics complexes)
- Uptime: > 99.9%
- Concurrence: 100+ utilisateurs simultanés

## 🐛 Dépannage

### Problèmes Courants

1. **MongoDB Connection Failed**
   ```bash
   # Vérifier URI et credentials
   echo $MONGODB_URI
   ```

2. **JWT Token Invalid**
   ```bash
   # Vérifier secret et expiration
   echo $JWT_SECRET
   ```

3. **Google OAuth Redirect Error**
   ```bash
   # Vérifier callback URL
   echo $GOOGLE_CALLBACK_URL
   ```

4. **CORS Error**
   ```bash
   # Vérifier configuration frontend
   echo $FRONTEND_URL
   ```

## 📞 Support

- **API Health**: https://api2.mdmcmusicads.com/health
- **Documentation**: Voir API_DOCUMENTATION.md
- **Déploiement**: Voir DEPLOYMENT_GUIDE.md
- **Support**: dev@mdmcmusicads.com

---

## 🏆 Résumé des Accomplissements

✅ **Architecture Complète**: Serveur Express avec structure modulaire
✅ **Authentification Robuste**: JWT + Google OAuth + permissions granulaires
✅ **Base de Données**: Modèles MongoDB optimisés avec indexes
✅ **API REST Complète**: 50+ endpoints avec validation et filtrage
✅ **Analytics Avancées**: Agrégations complexes et métriques temps réel
✅ **Sécurité Production**: Rate limiting, CORS, validation, sanitisation
✅ **Déploiement Ready**: Configuration Railway avec health checks
✅ **Documentation Complète**: API docs et guides de déploiement
✅ **Données de Test**: Script de seed avec utilisateurs et données réalistes
✅ **Monitoring**: Logs structurés et health checks

**Prêt pour la production sur api2.mdmcmusicads.com** 🚀

---

**Version**: 1.0.0
**Dernière Mise à Jour**: Novembre 2024
**Statut**: Production Ready ✅