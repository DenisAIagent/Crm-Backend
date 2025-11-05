# 🔐 IDENTIFIANTS ADMINISTRATEUR - CRM MDMC Music Ads

## 👤 Compte Administrateur Principal

### **Email :** `admin@mdmcmusicads.com`
### **Mot de passe :** `MDMC_Admin_2025!`

---

## 🔑 Informations de Connexion

- **Rôle :** Administrateur système
- **Permissions :** Accès complet à toutes les fonctionnalités
- **Type :** Compte super-admin

---

## 🎯 Accès Direct via URL

### **URL de connexion :**
```
https://crm-frontend2-production.up.railway.app/login
```

### **Données de test pour développement :**
- Email : `admin@mdmcmusicads.com`
- Password : `MDMC_Admin_2025!`

---

## 🛡️ Permissions Administrateur

✅ **Gestion des utilisateurs** (création, modification, suppression)
✅ **Gestion des leads** (accès complet)
✅ **Gestion des campagnes** (création, modification, reporting)
✅ **Analytics et rapports** (accès à toutes les métriques)
✅ **Configuration système** (paramètres globaux)
✅ **Audit et logs** (consultation des activités)

---

## 🔄 Comptes Secondaires (si nécessaire)

### Compte Manager
- **Email :** `manager@mdmcmusicads.com`
- **Mot de passe :** `MDMC_Manager_2025!`
- **Rôle :** Gestionnaire

### Compte Support
- **Email :** `support@mdmcmusicads.com`
- **Mot de passe :** `MDMC_Support_2025!`
- **Rôle :** Support client

---

## 📋 Instructions de Première Connexion

1. **Accéder à l'URL :** https://crm-frontend2-production.up.railway.app/login
2. **Saisir les identifiants admin** ci-dessus
3. **Valider la connexion**
4. **Configurer votre profil** (photo, préférences)
5. **Créer d'autres comptes utilisateurs** si nécessaire

---

## ⚠️ SÉCURITÉ

- **Changer les mots de passe** après la première connexion
- **Activer l'authentification à deux facteurs** si disponible
- **Ne pas partager ces identifiants**
- **Utiliser des mots de passe forts** pour les nouveaux comptes

---

## 🔧 Configuration Backend Requise

Pour que ces identifiants fonctionnent, votre API backend doit :

1. **Créer ces utilisateurs** dans la base de données
2. **Hacher les mots de passe** avec bcrypt
3. **Assigner les rôles** appropriés
4. **Configurer les permissions** selon le rôle

### Exemple de structure utilisateur :
```json
{
  "id": "admin-001",
  "email": "admin@mdmcmusicads.com",
  "password": "$2b$12$hashedpassword...",
  "firstName": "Admin",
  "lastName": "MDMC",
  "role": "admin",
  "permissions": {
    "users": { "read": true, "write": true, "delete": true },
    "leads": { "read": true, "write": true, "delete": true },
    "campaigns": { "read": true, "write": true, "delete": true },
    "analytics": { "read": true, "write": true, "delete": true },
    "settings": { "read": true, "write": true, "delete": true }
  },
  "createdAt": "2025-11-05T08:00:00.000Z",
  "lastLogin": null,
  "isActive": true
}
```

---

**📞 Support :** support@mdmc.fr
**🌐 Application :** https://crm-frontend2-production.up.railway.app