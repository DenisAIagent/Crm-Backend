# Correction du problème Google OAuth

## Problèmes identifiés et corrigés

### 1. Problème de `redirect_uri` incorrect
**Problème** : Le `redirect_uri` pointait vers le frontend (`${window.location.origin}/login`) au lieu du backend.

**Solution** : Le `redirect_uri` pointe maintenant vers le backend (`${backendUrl}/auth/google/callback`).

### 2. Incohérence entre frontend et backend
**Problème** : Le `redirect_uri` utilisé dans la requête initiale ne correspondait pas à celui utilisé lors de l'échange du code.

**Solution** : Les deux utilisent maintenant la même logique pour construire le `redirect_uri`.

### 3. Configuration des cookies en production
**Problème** : Les cookies avaient `sameSite: 'strict'` ce qui pouvait bloquer les redirections cross-origin en production.

**Solution** : En production, `sameSite` est maintenant défini à `'none'` (avec `secure: true`).

## Variables d'environnement requises

### Frontend (`.env` ou variables d'environnement du serveur)
```env
VITE_GOOGLE_CLIENT_ID=votre_client_id_google
VITE_API_URL=https://crm-backend-production-f0c8.up.railway.app/api
```

**Note** : Pour Railway, `VITE_API_URL` doit pointer vers votre backend Railway.

### Backend (`.env` ou variables d'environnement Railway)
```env
GOOGLE_CLIENT_ID=votre_client_id_google
GOOGLE_CLIENT_SECRET=votre_client_secret_google
CLIENT_URL=https://votre-domaine-frontend.com  # URL du frontend
BACKEND_URL=https://crm-backend-production-f0c8.up.railway.app  # Optionnel, sera déduit si non défini
GOOGLE_REDIRECT_URI=https://crm-backend-production-f0c8.up.railway.app/auth/google/callback  # Optionnel, sera construit automatiquement
```

**Pour Railway** : Configurez ces variables dans les variables d'environnement de votre projet Railway.

## Configuration Google Cloud Console

⚠️ **IMPORTANT** : Vous devez configurer le `redirect_uri` dans Google Cloud Console :

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Sélectionnez votre projet
3. Allez dans **APIs & Services** > **Credentials**
4. Cliquez sur votre OAuth 2.0 Client ID
5. Dans **Authorized redirect URIs**, ajoutez :
   
   **Pour Railway (production)** :
   ```
   https://crm-backend-production-f0c8.up.railway.app/auth/google/callback
   ```
   
   **Pour le développement local** :
   ```
   http://localhost:5000/auth/google/callback
   ```

**Le `redirect_uri` dans Google Cloud Console doit correspondre EXACTEMENT à celui utilisé dans le code.**

**Note** : Pour Railway, l'URL du backend est : `crm-backend-production-f0c8.up.railway.app`

## Vérification

### 1. Vérifier les variables d'environnement
- Frontend : `VITE_GOOGLE_CLIENT_ID` et `VITE_API_URL` doivent être définies
- Backend : `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, et `CLIENT_URL` doivent être définies

### 2. Vérifier la console du navigateur
En développement, vous devriez voir des logs de débogage :
```
🔍 Google Auth Debug:
  VITE_GOOGLE_CLIENT_ID: ✓ Configuré
  VITE_API_URL: https://...
  Enabled: true
```

### 3. Vérifier les logs serveur
En cas d'erreur, les logs serveur contiendront des détails sur :
- Le `redirect_uri` utilisé
- Les erreurs de Google OAuth
- Les problèmes de configuration

## Points d'attention pour la production

1. **HTTPS obligatoire** : En production, vous devez utiliser HTTPS. Google OAuth ne fonctionne pas avec HTTP en production.

2. **Domaine autorisé** : Assurez-vous que votre domaine est autorisé dans Google Cloud Console.

3. **CORS** : Vérifiez que votre configuration CORS autorise les requêtes depuis votre domaine frontend.

4. **Cookies** : Les cookies doivent avoir `secure: true` et `sameSite: 'none'` en production pour fonctionner avec les redirections cross-origin.

## Résolution des problèmes courants

### "redirect_uri_mismatch"
**Cause** : Le `redirect_uri` utilisé ne correspond pas à celui configuré dans Google Cloud Console.

**Solution** : 
- Vérifiez que le `redirect_uri` dans Google Cloud Console correspond exactement à celui utilisé dans le code
- Le `redirect_uri` doit être : `https://votre-domaine.com/auth/google/callback`

### "invalid_client"
**Cause** : Les credentials Google OAuth sont incorrects ou manquants.

**Solution** :
- Vérifiez que `GOOGLE_CLIENT_ID` et `GOOGLE_CLIENT_SECRET` sont correctement définis
- Vérifiez que ces valeurs correspondent à celles dans Google Cloud Console

### "access_denied"
**Cause** : L'utilisateur a refusé l'autorisation.

**Solution** : C'est normal, l'utilisateur peut choisir de ne pas autoriser l'application.

### Le bouton ne fonctionne pas
**Cause** : Variables d'environnement manquantes ou incorrectes.

**Solution** :
- Vérifiez la console du navigateur pour les erreurs
- Vérifiez que `VITE_GOOGLE_CLIENT_ID` et `VITE_API_URL` sont définies
- Vérifiez que le bouton n'est pas désactivé (la fonction `isGoogleAuthEnabled()` doit retourner `true`)

## Tests

1. **Test local** :
   - Démarrez le serveur backend sur `http://localhost:5000`
   - Démarrez le frontend sur `http://localhost:5173` (ou 3000)
   - Le `redirect_uri` sera automatiquement `http://localhost:5000/auth/google/callback`

2. **Test production** :
   - Vérifiez que toutes les variables d'environnement sont définies
   - Vérifiez que le `redirect_uri` dans Google Cloud Console correspond à votre domaine
   - Testez le bouton "Connecter avec Google"

## Notes importantes

- Le `redirect_uri` doit être **exactement** le même dans :
  1. La requête initiale vers Google
  2. L'échange du code contre le token
  3. La configuration Google Cloud Console

- En production, utilisez toujours HTTPS.

- Les cookies en production nécessitent `secure: true` ET `sameSite: 'none'` pour fonctionner avec les redirections cross-origin.

