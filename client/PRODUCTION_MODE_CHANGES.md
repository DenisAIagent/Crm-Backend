# MDMC Music Ads CRM - Configuration Mode Production

## Résumé des modifications

Ce document décrit les changements apportés pour passer le projet du mode démonstration au mode production réel avec authentification Google OAuth obligatoire.

## Modifications effectuées

### 1. Variables d'environnement (.env)

**Avant (Mode Demo) :**
```env
VITE_NODE_ENV=development
VITE_ENABLE_MOCK_API=true
VITE_DEMO_MODE=true
VITE_FRONTEND_ONLY=true
VITE_DEMO_EMAIL=denis@mdmc.fr
VITE_DEMO_PASSWORD=password123
```

**Après (Mode Production) :**
```env
VITE_NODE_ENV=production
VITE_ENABLE_MOCK_API=false
VITE_DEMO_MODE=false
VITE_FRONTEND_ONLY=false
# Suppression des credentials de démonstration
```

### 2. Authentification (AuthContext.jsx)

**Supprimé :**
- Auto-connexion en mode démo/frontend-only
- Connexion automatique avec les credentials de test
- Messages de démonstration

**Résultat :**
- Authentification réelle obligatoire
- Appel aux vraies APIs d'authentification
- Pas de bypass possible

### 3. APIs (api.js)

**Modification :**
- `IS_MOCK_MODE` ne dépend plus de `VITE_FRONTEND_ONLY`
- Toutes les APIs utilisent maintenant les vraies endpoints par défaut
- Mode mock disponible uniquement si `VITE_ENABLE_MOCK_API=true`

### 4. Page de connexion (LoginPage.jsx)

**Supprimé :**
- Auto-remplissage des credentials de démonstration
- Section "Compte de démonstration" dans l'interface
- Bouton "Remplir" pour les credentials de test
- Logique d'authentification simulée

**Résultat :**
- Interface propre sans éléments de démonstration
- Authentification réelle avec la vraie API
- Gestion d'erreurs appropriée

### 5. Google OAuth (useGoogleAuth.js)

**Supprimé :**
- Simulation de connexion Google en mode frontend-only
- Mock user data pour Google OAuth
- Messages de "connexion simulée"

**Résultat :**
- Authentification Google OAuth réelle
- Échange de code OAuth standard
- Intégration avec l'API backend

### 6. Composants de démonstration

**Désactivés :**
- `LoginTester.jsx` : Ne s'affiche plus en production
- `useLoginDemo.js` : Mode demo désactivé en production
- Tous les outils de test et debug

## Configuration par environnement

### Development (.env.local)
```env
VITE_NODE_ENV=development
VITE_ENABLE_MOCK_API=false  # Vraies APIs même en dev
VITE_DEMO_MODE=false        # Pas de démo
VITE_ENABLE_DEBUG=true      # Debug activé
```

### Production (.env.production)
```env
VITE_NODE_ENV=production
VITE_ENABLE_MOCK_API=false
VITE_DEMO_MODE=false
VITE_ENABLE_DEBUG=false
VITE_ENABLE_ANALYTICS=true
```

## URLs et endpoints

### API Backend
- **Production :** `https://api.mdmcmusicads.com`
- **Tous les appels utilisent maintenant cette URL**

### Google OAuth Redirect
- **Production :** `https://adminpanel.mdmcmusicads.com/auth/callback`
- **Development :** `http://localhost:5173/auth/callback`

## Comportement attendu

### Avant (Mode Demo)
1. Connexion automatique au chargement
2. Données mockées affichées
3. Pas d'authentification réelle
4. Interface avec éléments de démonstration

### Après (Mode Production)
1. **Connexion obligatoire** via Google OAuth ou email/password
2. **Données réelles** depuis l'API backend
3. **Authentification complète** avec tokens JWT
4. **Interface propre** sans éléments de test

## Sécurité

### Améliorations apportées
- Suppression des credentials hardcodés
- Pas de bypass d'authentification
- Validation côté serveur obligatoire
- Tokens JWT sécurisés

### Vérifications nécessaires
- [ ] Google OAuth configuré dans Google Cloud Console
- [ ] API backend `https://api.mdmcmusicads.com` opérationnelle
- [ ] Endpoints d'authentification fonctionnels
- [ ] CORS configuré pour `adminpanel.mdmcmusicads.com`

## Tests recommandés

1. **Connexion Google OAuth :**
   - Redirection vers Google
   - Callback et échange de code
   - Stockage des tokens
   - Redirection vers dashboard

2. **Connexion email/password :**
   - Validation des champs
   - Appel API d'authentification
   - Gestion des erreurs
   - Remember me

3. **Sécurité :**
   - Accès refusé sans authentification
   - Token refresh automatique
   - Déconnexion propre

## Rollback si nécessaire

Pour revenir au mode démo (URGENCE UNIQUEMENT) :
```env
VITE_DEMO_MODE=true
VITE_ENABLE_MOCK_API=true
```

⚠️ **Ne pas utiliser en production !**

---

**Date de modification :** $(date)
**Effectué par :** Claude Code AI Assistant
**Version :** 1.0.0 Production Ready