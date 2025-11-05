# Guide de Déploiement Railway - Frontend

## 🚨 Problème : Railway exécute du code backend au lieu du Dockerfile

Si vous voyez des erreurs comme `JwtStrategy requires a secret or key`, cela signifie que Railway essaie d'exécuter du code Node.js backend au lieu d'utiliser le Dockerfile avec Nginx.

## ✅ Solution : Configurer Railway pour utiliser Dockerfile

### 1. Dans le Dashboard Railway

1. Allez dans votre service **CRM-frontend2**
2. Cliquez sur **Settings**
3. Dans la section **Build & Deploy**, vérifiez :
   - **Build Command** : Doit être vide ou `docker build`
   - **Start Command** : Doit être vide (le Dockerfile gère ça avec CMD)
   - **Dockerfile Path** : Doit être `Dockerfile` (ou laisser vide si à la racine)

### 2. Vérifier la Source du Code

Assurez-vous que le service Railway est connecté au bon repository :
- Repository : `DenisAIagent/CRM-frontend2`
- Branch : `main`
- Root Directory : Doit être à la racine (pas de sous-dossier)

### 3. Forcer l'utilisation du Dockerfile

Si Railway détecte toujours Node.js automatiquement :

1. Dans **Settings** → **Build & Deploy**
2. Sélectionnez **Dockerfile** comme méthode de build
3. Ou ajoutez une variable d'environnement :
   - Key: `RAILWAY_DOCKERFILE_PATH`
   - Value: `Dockerfile`

### 4. Redéployer

Après avoir modifié les settings :
1. Cliquez sur **Deployments**
2. Cliquez sur **Redeploy** ou faites un nouveau commit

## 📋 Checklist de Déploiement

- [ ] Service Railway connecté au repository `CRM-frontend2`
- [ ] Root Directory est à la racine (vide)
- [ ] Build Method = Dockerfile
- [ ] Dockerfile présent à la racine
- [ ] `railway.json` présent à la racine
- [ ] Fichiers `docker/nginx.conf` et `docker/start.sh` présents
- [ ] Variables d'environnement configurées (si nécessaire)

## 🔍 Vérification

Une fois déployé, les logs devraient montrer :
```
🚀 Starting Nginx on port [PORT]
```

Et non pas :
```
TypeError: JwtStrategy requires a secret or key
```

## ⚠️ Si le problème persiste

1. **Supprimer et recréer le service** Railway
2. Vérifier que le repository ne contient pas de code backend
3. S'assurer que le Dockerfile est bien à la racine du repository

