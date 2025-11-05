# Guide de Débogage CORS

## 🔍 Problème CORS en Production

Le backend Railway est correctement configuré pour CORS (testé avec curl ✅), mais vous rencontrez encore des erreurs dans le navigateur.

## ✅ Ce qui fonctionne

1. **Backend CORS configuré** : Les headers CORS sont correctement retournés
2. **Requêtes curl fonctionnent** : Les tests avec curl montrent que CORS fonctionne
3. **Headers retournés** :
   - `access-control-allow-origin: https://adminpanel.mdmcmusicads.com`
   - `access-control-allow-credentials: true`
   - `access-control-allow-methods: GET,POST,PUT,DELETE,PATCH,OPTIONS`

## 🐛 Activer le débogage en production

Pour voir exactement ce qui se passe dans le navigateur, ajoutez cette variable d'environnement :

### Option 1 : Variable d'environnement Vite

Dans votre fichier `.env.production` ou dans votre configuration de déploiement :

```env
VITE_ENABLE_DEBUG=true
```

### Option 2 : Activer directement dans le code (temporaire)

Les logs sont maintenant activés automatiquement en production pour les erreurs. Vous verrez dans la console du navigateur :

- 🚀 Les requêtes envoyées (avec tous les détails)
- ✅ Les réponses réussies
- ❌ Les erreurs détaillées

## 🔍 Étapes de débogage

### 1. Ouvrir la console du navigateur

1. Ouvrez `https://adminpanel.mdmcmusicads.com`
2. Appuyez sur `F12` ou `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)
3. Allez dans l'onglet **Console**
4. Essayez de vous connecter

### 2. Vérifier les requêtes réseau

1. Dans la console, allez dans l'onglet **Network**
2. Filtrez par "XHR" ou "Fetch"
3. Cherchez la requête vers `/api/auth/login`
4. Cliquez dessus et vérifiez :
   - **Headers Request** : Vérifiez l'`Origin` et les autres headers
   - **Headers Response** : Vérifiez les headers CORS retournés
   - **Status** : Quel code HTTP est retourné ?

### 3. Vérifier les erreurs dans la console

Les logs détaillés devraient maintenant apparaître automatiquement. Vous verrez :
- L'URL complète de la requête
- Les headers envoyés
- L'origine du navigateur
- Les détails de l'erreur

## 🎯 Causes possibles

### 1. Extension de navigateur

Les erreurs "A listener indicated an asynchronous response" sont souvent causées par :
- Extensions de gestion de mots de passe
- Bloqueurs de publicité
- Extensions de sécurité

**Solution** : Essayez en mode incognito ou désactivez les extensions

### 2. Cookies et credentials

Le backend autorise `withCredentials: true`, mais vérifiez :
- Que les cookies ne sont pas bloqués
- Que le navigateur accepte les cookies tiers (si nécessaire)

### 3. Cache du navigateur

**Solution** : Videz le cache ou faites un hard refresh :
- `Cmd+Shift+R` (Mac)
- `Ctrl+Shift+R` (Windows)

### 4. Problème de timing

Parfois, la requête OPTIONS (preflight) passe mais la requête POST échoue.

**Solution** : Vérifiez dans l'onglet Network si les deux requêtes (OPTIONS et POST) apparaissent.

## 📊 Exemple de logs attendus

Dans la console, vous devriez voir :

```
🚀 REQUEST POST https://crm-backend-production-f0c8.up.railway.app/api/auth/login
{
  data: { email: "...", password: "..." },
  headers: { ... },
  origin: "https://adminpanel.mdmcmusicads.com"
}

✅ SUCCESS POST /api/auth/login
{
  status: 200,
  data: { ... }
}
```

Ou en cas d'erreur :

```
❌ ERROR POST /api/auth/login
{
  status: 500,
  message: "...",
  code: "...",
  ...
}
```

## 🔧 Solution rapide

Si le problème persiste après avoir vérifié tout ça :

1. **Vérifiez que le backend retourne bien les headers CORS** (déjà fait ✅)
2. **Activez les logs** en ajoutant `VITE_ENABLE_DEBUG=true`
3. **Ouvrez la console** et regardez les logs détaillés
4. **Partagez les logs** pour un diagnostic plus approfondi

## 📝 Note sur le backend

Le backend retourne un status **500** au lieu de **401** pour les erreurs d'authentification. Le code frontend est maintenant configuré pour gérer ce cas.

