# Documentation Technique - MDMC CRM

Bienvenue dans la documentation complète du CRM MDMC Music Ads, un système de gestion complet pour agences de marketing musical.

## 📚 Table des matières

### 🏗️ [Architecture Système](./ARCHITECTURE.md)
- Vue d'ensemble de l'architecture
- Stack technologique complet
- Structure frontend et backend
- Flux de données et communication
- Performance et scalabilité

### 🗄️ [Base de Données](./DATABASE.md)
- Modèles de données détaillés
- Relations entre entités
- Schémas MongoDB avec Mongoose
- Index et optimisations
- Stratégies de backup et récupération

### 🔌 [API Documentation](./API.md)
- Documentation complète des endpoints
- Exemples d'utilisation avec code
- Authentification et autorisation
- Format des erreurs et codes de statut
- Intégrations WebSocket temps réel

### 🚀 [Guide de Déploiement](./DEPLOYMENT.md)
- Configuration des environnements
- Déploiement Railway, Vercel, Docker
- Variables d'environnement
- SSL/TLS et sécurité réseau
- Monitoring et observabilité

### 🔒 [Sécurité](./SECURITY.md)
- Architecture de sécurité multi-niveaux
- Authentification JWT et refresh tokens
- Chiffrement des données sensibles
- Protection contre les attaques
- Conformité RGPD et audit

### 💻 [Guide de Développement](./DEVELOPMENT.md)
- Configuration environnement de dev
- Standards de code et conventions
- Workflow Git et Pull Requests
- Tests unitaires et d'intégration
- Débogage et optimisation

## 🚀 Démarrage rapide

### Installation locale

```bash
# 1. Clone du repository
git clone https://github.com/DenisAIagent/mdmc-crm.git
cd mdmc-crm

# 2. Installation des dépendances
npm install
cd client && npm install && cd ..

# 3. Configuration environnement
cp .env.example .env
# Éditer .env avec vos valeurs

# 4. Démarrage développement
npm run dev:all
```

### Accès rapide

- **Frontend**: http://localhost:3000
- **API**: http://localhost:5000/api
- **Documentation API**: http://localhost:5000/api-docs
- **Health Check**: http://localhost:5000/health

### Première connexion

```bash
# Créer un utilisateur admin
npm run create:admin

# Identifiants par défaut :
# Email: denis@mdmcmusicads.com
# Mot de passe: généré automatiquement et envoyé par email
```

## 🎯 Fonctionnalités principales

### 📊 Gestion des Leads
- Capture automatique via webhooks
- Pipeline de conversion optimisé
- Scoring et prioritisation automatique
- Suivi des interactions et communications

### 🎯 Gestion des Campagnes
- Campagnes multi-plateformes (YouTube, Spotify, Meta, TikTok)
- KPIs et métriques temps réel
- Gestion budgétaire avancée
- ROI et performance tracking

### 📈 Analytics Avancés
- Dashboard temps réel
- Insights IA basés sur les données
- Exports et rapports automatisés
- Objectifs et tracking de progression

### 🔐 Sécurité Enterprise
- JWT + Refresh tokens
- Chiffrement AES-256
- Rate limiting et protection DDoS
- Audit logging complet

## 🛠️ Stack technique

### Frontend
- **React 18** avec Hooks et Context API
- **React Query** pour la gestion d'état serveur
- **Tailwind CSS** pour le styling
- **Socket.io Client** pour les updates temps réel

### Backend
- **Node.js 18+** avec ES Modules
- **Express.js** avec architecture RESTful
- **MongoDB** avec Mongoose ODM
- **Socket.io** pour la communication temps réel

### Infrastructure
- **Railway** pour MongoDB et déploiement
- **Vercel** pour le frontend (optionnel)
- **Mailgun** pour l'envoi d'emails
- **GitHub Actions** pour CI/CD

## 📋 Status du projet

| Composant | Status | Version | Tests | Documentation |
|-----------|--------|---------|-------|---------------|
| Backend API | ✅ Stable | 1.0.0 | ✅ 85% | ✅ Complète |
| Frontend React | ✅ Stable | 1.0.0 | 🟡 60% | ✅ Complète |
| Base de données | ✅ Stable | 1.0.0 | ✅ 90% | ✅ Complète |
| Déploiement | ✅ Prod | 1.0.0 | ✅ 100% | ✅ Complète |
| Sécurité | ✅ Audité | 1.0.0 | ✅ 95% | ✅ Complète |

## 🤝 Contribution

### Workflow de contribution

1. **Fork** le repository
2. **Clone** votre fork localement
3. **Créer** une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
4. **Développer** en suivant les standards du projet
5. **Tester** votre code (`npm test`)
6. **Commit** avec des messages conventionnels
7. **Push** vers votre fork
8. **Créer** une Pull Request

### Standards de qualité

- ✅ Tests unitaires pour les nouvelles fonctionnalités
- ✅ Documentation à jour
- ✅ Code review obligatoire
- ✅ Linting et formatage automatique
- ✅ Pas de régression de performance

## 📞 Support et contact

### Équipe de développement

- **Denis Adam** - Lead Developer - denis@mdmcmusicads.com
- **Équipe MDMC** - support@mdmcmusicads.com

### Ressources

- **Repository**: https://github.com/DenisAIagent/mdmc-crm
- **Issues**: https://github.com/DenisAIagent/mdmc-crm/issues
- **Wiki**: https://github.com/DenisAIagent/mdmc-crm/wiki
- **Discussions**: https://github.com/DenisAIagent/mdmc-crm/discussions

### Support technique

Pour obtenir de l'aide :

1. **Documentation** : Consultez d'abord cette documentation
2. **Search Issues** : Vérifiez si le problème existe déjà
3. **Create Issue** : Créez une issue détaillée avec logs
4. **Contact** : Contactez l'équipe pour les urgences

## 📄 Licence

Ce projet est sous licence propriétaire MDMC Music Ads. Tous droits réservés.

---

**🎵 Développé avec ❤️ par l'équipe MDMC Music Ads**

*Cette documentation est mise à jour en continu. Dernière mise à jour : Novembre 2024*