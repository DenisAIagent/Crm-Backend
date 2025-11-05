# Checklist Configuration Railway - Google OAuth

## ✅ Variables d'environnement Backend (Railway)

Exemple de configuration des variables d'environnement backend :

```env
NODE_ENV="production"
MONGODB_URI="mongodb://user:password@host:port/database"
DB_NAME="mdmc_crm"
JWT_SECRET="votre_jwt_secret_64_characters_minimum"
MAILGUN_API_KEY="votre_mailgun_api_key"
MAILGUN_DOMAIN="postmaster@votre-domaine.com"
GOOGLE_CLIENT_ID="votre_google_client_id.apps.googleusercontent.com"
FRONTEND_URL="https://www.votre-domaine.com"
GOOGLE_CALLBACK_URL="https://votre-backend.up.railway.app/auth/google/callback"
GOOGLE_CLIENT_SECRET="votre_google_client_secret"
```

## ✅ Variables d'environnement Frontend

**IMPORTANT** : Assurez-vous que votre frontend (où qu'il soit déployé) a ces variables :

```env
VITE_GOOGLE_CLIENT_ID="votre_google_client_id.apps.googleusercontent.com"
VITE_API_URL="https://votre-backend.up.railway.app/api"
```

## ✅ Configuration Google Cloud Console

**CRITIQUE** : Vérifiez que cette URL est bien dans les "Authorized redirect URIs" :

```
https://crm-backend-production-f0c8.up.railway.app/auth/google/callback
```

### Comment vérifier :

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Sélectionnez votre projet
3. **APIs & Services** > **Credentials**
4. Cliquez sur votre OAuth 2.0 Client ID
5. Dans **Authorized redirect URIs**, vérifiez que cette URL est présente :
   ```
   https://votre-backend.up.railway.app/auth/google/callback
   ```
   Remplacez `votre-backend` par l'URL réelle de votre backend Railway.

## ✅ Modifications apportées au code

Le code a été mis à jour pour :

1. ✅ Utiliser `FRONTEND_URL` au lieu de `CLIENT_URL` (compatibilité Railway)
2. ✅ Utiliser `GOOGLE_CALLBACK_URL` au lieu de `GOOGLE_REDIRECT_URI` (compatibilité Railway)
3. ✅ Support des deux noms de variables pour la compatibilité
4. ✅ Ajout de `https://www.adminpanel.mdmcmusicads.com` dans CORS
5. ✅ Configuration automatique de CORS avec `FRONTEND_URL`

## 🔍 Tests à effectuer

### 1. Test du bouton Google OAuth

1. Ouvrez votre frontend : `https://www.adminpanel.mdmcmusicads.com`
2. Ouvrez la console du navigateur (F12)
3. Cliquez sur "Connecter avec Google"
4. Vérifiez dans la console que vous voyez :
   ```
   🔍 Initiating Google OAuth:
     clientId: ✓
     redirectUri: https://votre-backend.up.railway.app/auth/google/callback
   ```

### 2. Test de la redirection

1. Après avoir cliqué sur "Connecter avec Google"
2. Vous devriez être redirigé vers Google
3. Après autorisation, vous devriez être redirigé vers :
   ```
   https://www.adminpanel.mdmcmusicads.com/login?success=true&token=...
   ```

### 3. Vérification des logs Railway

Dans les logs Railway, vous devriez voir :
```
Google OAuth redirect_uri: https://votre-backend.up.railway.app/auth/google/callback
```

## ❌ Problèmes courants et solutions

### "redirect_uri_mismatch"

**Cause** : L'URL dans Google Cloud Console ne correspond pas exactement.

**Solution** :
- Vérifiez que l'URL dans Google Cloud Console est exactement :
  ```
  https://votre-backend.up.railway.app/auth/google/callback
  ```
- Pas de slash final, pas de paramètres, exactement comme ci-dessus

### Le bouton est grisé

**Cause** : Variables d'environnement frontend manquantes.

**Solution** :
- Vérifiez que `VITE_GOOGLE_CLIENT_ID` est défini
- Vérifiez que `VITE_API_URL` est défini et pointe vers votre backend :
  ```
  https://votre-backend.up.railway.app/api
  ```

### "CORS error"

**Cause** : Le domaine frontend n'est pas autorisé.

**Solution** :
- Le code ajoute automatiquement `FRONTEND_URL` dans CORS
- Vérifiez que `FRONTEND_URL="https://www.adminpanel.mdmcmusicads.com"` est défini dans Railway

### Les cookies ne sont pas définis

**Cause** : Configuration `sameSite` ou `secure` incorrecte.

**Solution** :
- Le code configure automatiquement `sameSite: 'none'` et `secure: true` en production
- Vérifiez que votre frontend est en HTTPS

## 📝 Notes importantes

1. **HTTPS obligatoire** : Google OAuth nécessite HTTPS en production. Votre frontend (`https://www.adminpanel.mdmcmusicads.com`) et backend (`https://crm-backend-production-f0c8.up.railway.app`) sont tous deux en HTTPS ✅

2. **Variables d'environnement frontend** : Si votre frontend est déployé séparément (Vercel, Netlify, etc.), vous devez configurer les variables d'environnement là-bas aussi.

3. **Redéploiement** : Après avoir modifié les variables d'environnement Railway, vous devrez peut-être redéployer l'application.

4. **Cache** : Après les modifications, videz le cache du navigateur ou utilisez une fenêtre de navigation privée pour tester.

