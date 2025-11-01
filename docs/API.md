# Documentation API - MDMC CRM

## Vue d'ensemble

L'API MDMC CRM est une API REST construite avec Express.js, offrant des endpoints sécurisés pour la gestion complète du CRM. Elle utilise l'authentification JWT avec refresh tokens et implémente des mesures de sécurité enterprise.

## Base URL

```
Production:  https://mdmc-crm.up.railway.app/api
Development: http://localhost:5000/api
```

## Authentification

### JWT Token System

L'API utilise un système de double tokens pour la sécurité :

- **Access Token** : Durée de vie courte (15 minutes)
- **Refresh Token** : Durée de vie longue (7 jours)

```javascript
// Headers requis pour les endpoints protégés
{
  "Authorization": "Bearer YOUR_ACCESS_TOKEN",
  "Content-Type": "application/json"
}
```

### Refresh Token Flow

```javascript
// Quand l'access token expire (401), utiliser le refresh token
POST /api/auth/refresh
{
  "refreshToken": "YOUR_REFRESH_TOKEN"
}

// Réponse
{
  "success": true,
  "data": {
    "accessToken": "NEW_ACCESS_TOKEN",
    "refreshToken": "NEW_REFRESH_TOKEN",
    "expiresIn": 900
  }
}
```

## Endpoints

### 🔐 Authentication (`/api/auth`)

#### POST `/api/auth/login`

Connexion utilisateur avec protection contre les attaques par timing.

```javascript
// Request
{
  "email": "user@mdmcmusicads.com",
  "password": "SecurePassword123!"
}

// Response (200)
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "user": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "firstName": "John",
      "lastName": "Doe",
      "email": "user@mdmcmusicads.com",
      "role": "agent",
      "team": "denis",
      "assignedPlatforms": ["youtube", "spotify"],
      "permissions": {
        "leads": { "create": true, "read": true, "update": true, "delete": false },
        "campaigns": { "create": true, "read": true, "update": true, "delete": false }
      }
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900
  }
}

// Error Response (401)
{
  "success": false,
  "message": "Email ou mot de passe incorrect"
}
```

**Rate Limiting**: 5 tentatives par 15 minutes par IP

#### POST `/api/auth/register`

Inscription d'un nouvel utilisateur (admin uniquement en production).

```javascript
// Request
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@mdmcmusicads.com",
  "password": "SecurePassword123!",
  "team": "marine",
  "role": "agent"
}

// Response (201)
{
  "success": true,
  "message": "Utilisateur créé avec succès",
  "data": {
    "user": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane@mdmcmusicads.com",
      "role": "agent",
      "team": "marine"
    }
  }
}
```

#### POST `/api/auth/refresh`

Renouvellement des tokens d'authentification.

```javascript
// Request
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

// Response (200)
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900
  }
}
```

#### POST `/api/auth/logout`

Déconnexion et invalidation des tokens.

```javascript
// Request (avec Authorization header)
{}

// Response (200)
{
  "success": true,
  "message": "Déconnexion réussie"
}
```

### 👤 Users (`/api/users`)

#### GET `/api/users`

Liste des utilisateurs avec filtres et pagination.

```javascript
// Query Parameters
?page=1&limit=20&team=denis&role=agent&search=john&sort=firstName

// Response (200)
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@mdmcmusicads.com",
        "role": "agent",
        "team": "denis",
        "assignedPlatforms": ["youtube", "spotify"],
        "isActive": true,
        "lastLogin": "2024-01-15T10:30:00Z",
        "stats": {
          "leadsCreated": 45,
          "leadsConverted": 23,
          "conversionRate": "51.11"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15,
      "totalPages": 1
    }
  }
}
```

#### GET `/api/users/:id`

Détails d'un utilisateur spécifique.

```javascript
// Response (200)
{
  "success": true,
  "data": {
    "user": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@mdmcmusicads.com",
      "role": "agent",
      "team": "denis",
      "assignedPlatforms": ["youtube", "spotify"],
      "preferences": {
        "language": "fr",
        "timezone": "Europe/Paris",
        "notifications": {
          "email": true,
          "browser": true,
          "slack": false
        }
      },
      "stats": {
        "leadsCreated": 45,
        "leadsConverted": 23,
        "campaignsManaged": 8,
        "totalRevenue": 125000,
        "avgResponseTime": 45
      }
    }
  }
}
```

#### PUT `/api/users/:id`

Mise à jour d'un utilisateur.

```javascript
// Request
{
  "firstName": "John",
  "lastName": "Smith",
  "assignedPlatforms": ["youtube", "spotify", "meta"],
  "preferences": {
    "notifications": {
      "email": true,
      "browser": false,
      "slack": true
    }
  }
}

// Response (200)
{
  "success": true,
  "message": "Utilisateur mis à jour avec succès",
  "data": {
    "user": { /* updated user object */ }
  }
}
```

### 📋 Leads (`/api/leads`)

#### GET `/api/leads`

Liste des leads avec filtres avancés et pagination.

```javascript
// Query Parameters
?page=1
&limit=20
&stage=new,contacted,qualified
&priority=high,urgent
&assignedTo=64f8a1b2c3d4e5f6a7b8c9d0
&team=denis
&platform=youtube,spotify
&budget_min=500
&budget_max=5000
&source=website,social
&date_from=2024-01-01
&date_to=2024-01-31
&search=artist name
&sort=createdAt,-priority,score

// Response (200)
{
  "success": true,
  "data": {
    "leads": [
      {
        "id": "64f8a1b2c3d4e5f6a7b8c9d2",
        "personalInfo": {
          "firstName": "Marie",
          "lastName": "Martin",
          "email": "marie@example.com" // Déchiffré si autorisé
        },
        "artistInfo": {
          "name": "Marie M",
          "genre": ["Pop", "R&B"],
          "spotifyUrl": "https://open.spotify.com/artist/xyz"
        },
        "businessInfo": {
          "budget": {
            "amount": 2000,
            "currency": "EUR",
            "frequency": "monthly"
          },
          "platforms": ["youtube", "spotify", "meta"],
          "goals": ["Augmenter streams", "Gagner followers"]
        },
        "pipeline": {
          "stage": "qualified",
          "priority": "high",
          "score": 85,
          "probability": 75
        },
        "source": {
          "channel": "website",
          "campaign": "landing-page-q1",
          "formType": "contact"
        },
        "assignment": {
          "assignedTo": {
            "id": "64f8a1b2c3d4e5f6a7b8c9d0",
            "firstName": "John",
            "lastName": "Doe"
          },
          "assignedAt": "2024-01-15T10:30:00Z"
        },
        "communication": {
          "lastContact": "2024-01-16T14:20:00Z",
          "nextFollowUp": "2024-01-18T09:00:00Z",
          "responseRate": 80
        },
        "conversion": {
          "isConverted": false,
          "timeToConversion": null
        },
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-16T14:20:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 156,
      "totalPages": 8
    },
    "aggregations": {
      "byStage": {
        "new": 45,
        "contacted": 32,
        "qualified": 28,
        "proposal": 15,
        "negotiation": 8,
        "closed": 20,
        "lost": 8
      },
      "byPriority": {
        "low": 15,
        "medium": 67,
        "high": 52,
        "urgent": 22
      },
      "totalValue": 875000,
      "avgScore": 68.5
    }
  }
}
```

#### POST `/api/leads`

Création d'un nouveau lead.

```javascript
// Request
{
  "personalInfo": {
    "firstName": "Sophie",
    "lastName": "Dubois",
    "email": "sophie@example.com",
    "phone": "+33123456789"
  },
  "artistInfo": {
    "name": "Sophie D",
    "genre": ["Electronic", "House"],
    "spotifyUrl": "https://open.spotify.com/artist/abc123"
  },
  "businessInfo": {
    "budget": {
      "amount": 3000,
      "currency": "EUR",
      "frequency": "campaign"
    },
    "platforms": ["youtube", "spotify", "tiktok"],
    "goals": ["Promotion nouveau single", "Augmenter notoriété"]
  },
  "source": {
    "channel": "website",
    "formType": "contact",
    "campaign": "homepage-form"
  }
}

// Response (201)
{
  "success": true,
  "message": "Lead créé avec succès",
  "data": {
    "lead": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d3",
      /* ... lead object ... */
    }
  }
}
```

#### GET `/api/leads/:id`

Détails complets d'un lead avec historique.

```javascript
// Response (200)
{
  "success": true,
  "data": {
    "lead": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d2",
      /* ... complete lead object ... */
      "notes": [
        {
          "id": "64f8a1b2c3d4e5f6a7b8c9d4",
          "author": {
            "firstName": "John",
            "lastName": "Doe"
          },
          "content": "Premier contact téléphonique très positif",
          "type": "call",
          "isPrivate": false,
          "createdAt": "2024-01-16T14:20:00Z"
        }
      ],
      "followUps": [
        {
          "id": "64f8a1b2c3d4e5f6a7b8c9d5",
          "assignedTo": {
            "firstName": "John",
            "lastName": "Doe"
          },
          "type": "email",
          "subject": "Proposition commerciale",
          "scheduledFor": "2024-01-18T09:00:00Z",
          "completed": false
        }
      ]
    }
  }
}
```

#### PUT `/api/leads/:id`

Mise à jour d'un lead.

```javascript
// Request
{
  "pipeline": {
    "stage": "proposal",
    "priority": "high",
    "probability": 85
  },
  "businessInfo": {
    "budget": {
      "amount": 3500
    }
  }
}

// Response (200)
{
  "success": true,
  "message": "Lead mis à jour avec succès",
  "data": {
    "lead": { /* updated lead object */ }
  }
}
```

#### POST `/api/leads/:id/notes`

Ajout d'une note à un lead.

```javascript
// Request
{
  "content": "Envoi de la proposition commerciale par email",
  "type": "email",
  "isPrivate": false
}

// Response (201)
{
  "success": true,
  "message": "Note ajoutée avec succès",
  "data": {
    "note": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d6",
      "content": "Envoi de la proposition commerciale par email",
      "type": "email",
      "author": {
        "firstName": "John",
        "lastName": "Doe"
      },
      "createdAt": "2024-01-17T11:30:00Z"
    }
  }
}
```

#### POST `/api/leads/:id/convert`

Conversion d'un lead en campagne.

```javascript
// Request
{
  "contractValue": 5000,
  "monthlyValue": 1000,
  "campaignData": {
    "name": "Sophie D - Nouveau Single",
    "description": "Promotion du nouveau single sur YouTube et Spotify",
    "platforms": ["youtube", "spotify"],
    "budget": {
      "allocated": 3000,
      "currency": "EUR"
    }
  }
}

// Response (200)
{
  "success": true,
  "message": "Lead converti avec succès",
  "data": {
    "lead": { /* updated lead with conversion data */ },
    "campaign": { /* created campaign object */ }
  }
}
```

### 🎯 Campaigns (`/api/campaigns`)

#### GET `/api/campaigns`

Liste des campagnes avec filtres et métriques.

```javascript
// Query Parameters
?page=1&limit=20&status=active,paused&platform=youtube,spotify&manager=64f8a1b2c3d4e5f6a7b8c9d0

// Response (200)
{
  "success": true,
  "data": {
    "campaigns": [
      {
        "id": "64f8a1b2c3d4e5f6a7b8c9d7",
        "name": "Marie M - Summer Hit",
        "status": "active",
        "type": "acquisition",
        "clientInfo": {
          "artistName": "Marie M",
          "songTitle": "Summer Vibes",
          "genre": ["Pop", "Dance"]
        },
        "platforms": [
          {
            "name": "youtube",
            "isActive": true,
            "budget": { "daily": 50, "total": 1500 }
          },
          {
            "name": "spotify",
            "isActive": true,
            "budget": { "daily": 30, "total": 900 }
          }
        ],
        "budget": {
          "allocated": 2400,
          "spent": 1250,
          "remaining": 1150,
          "currency": "EUR"
        },
        "timeline": {
          "startDate": "2024-01-15T00:00:00Z",
          "endDate": "2024-02-15T00:00:00Z"
        },
        "team": {
          "manager": {
            "firstName": "John",
            "lastName": "Doe"
          }
        },
        "performance": {
          "totalImpressions": 125000,
          "totalClicks": 3250,
          "totalSpend": 1250,
          "overallCtr": 2.6,
          "overallCpc": 0.38,
          "roi": 185
        },
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 32,
      "totalPages": 2
    }
  }
}
```

#### POST `/api/campaigns`

Création d'une nouvelle campagne.

```javascript
// Request
{
  "name": "Thomas R - Clip Launch",
  "description": "Lancement du nouveau clip vidéo",
  "leadId": "64f8a1b2c3d4e5f6a7b8c9d2",
  "clientInfo": {
    "artistName": "Thomas R",
    "songTitle": "Neon Lights",
    "genre": ["Electronic", "Synthwave"],
    "releaseDate": "2024-02-01T00:00:00Z"
  },
  "platforms": [
    {
      "name": "youtube",
      "isActive": true,
      "config": {
        "campaignObjective": "video_views",
        "targeting": {
          "demographics": {
            "ageMin": 18,
            "ageMax": 35,
            "genders": ["male", "female"]
          },
          "interests": ["Electronic Music", "Synthwave", "Retrowave"],
          "geographic": {
            "countries": ["FR", "BE", "CH", "CA"]
          }
        },
        "budget": {
          "daily": 75,
          "total": 2250,
          "bidStrategy": "target_cpm"
        }
      }
    }
  ],
  "budget": {
    "allocated": 3000,
    "currency": "EUR",
    "billingModel": "percentage",
    "commission": 15
  },
  "timeline": {
    "startDate": "2024-02-01T00:00:00Z",
    "endDate": "2024-03-01T00:00:00Z"
  },
  "objectives": {
    "primary": "Augmenter vues clip",
    "secondary": ["Gagner abonnés YouTube", "Augmenter streams Spotify"],
    "kpiTargets": {
      "views": 100000,
      "subscribers": 1000,
      "streams": 50000
    }
  }
}

// Response (201)
{
  "success": true,
  "message": "Campagne créée avec succès",
  "data": {
    "campaign": { /* created campaign object */ }
  }
}
```

#### GET `/api/campaigns/:id/kpis`

KPIs détaillés d'une campagne avec données temporelles.

```javascript
// Query Parameters
?period=7d&platform=youtube&metrics=impressions,clicks,spend

// Response (200)
{
  "success": true,
  "data": {
    "campaign": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d7",
      "name": "Marie M - Summer Hit"
    },
    "period": {
      "start": "2024-01-10T00:00:00Z",
      "end": "2024-01-17T00:00:00Z",
      "days": 7
    },
    "dailyKpis": [
      {
        "date": "2024-01-10",
        "impressions": 15250,
        "views": 8420,
        "clicks": 345,
        "spend": 125.50,
        "cpm": 8.23,
        "cpc": 0.36,
        "ctr": 2.26,
        "platformSpecific": {
          "youtube": {
            "watchTime": 12450,
            "avgViewDuration": 45,
            "subscribers": 23
          },
          "spotify": {
            "streams": 1250,
            "saves": 89,
            "followers": 12
          }
        }
      }
    ],
    "aggregated": {
      "totalImpressions": 125000,
      "totalViews": 68500,
      "totalClicks": 3250,
      "totalSpend": 1250.50,
      "avgCpm": 8.45,
      "avgCpc": 0.38,
      "avgCtr": 2.35,
      "totalStreams": 12450,
      "totalFollowers": 156
    },
    "comparison": {
      "previousPeriod": {
        "impressions": 98000,
        "clicks": 2800,
        "spend": 1050.25
      },
      "growth": {
        "impressions": 27.55,
        "clicks": 16.07,
        "spend": 19.05
      }
    }
  }
}
```

### 📊 Analytics (`/api/analytics`)

#### GET `/api/analytics/overview`

Vue d'ensemble des métriques du CRM.

```javascript
// Query Parameters
?period=30d&team=denis&platform=youtube,spotify

// Response (200)
{
  "success": true,
  "data": {
    "period": {
      "start": "2023-12-18T00:00:00Z",
      "end": "2024-01-17T00:00:00Z",
      "days": 30
    },
    "leads": {
      "total": 156,
      "new": 45,
      "qualified": 28,
      "converted": 12,
      "conversionRate": 7.69,
      "avgTimeToConversion": 14.5,
      "totalValue": 875000,
      "avgValue": 5608,
      "bySource": {
        "website": 89,
        "social": 34,
        "referral": 23,
        "direct": 10
      },
      "byTeam": {
        "denis": 89,
        "marine": 67
      }
    },
    "campaigns": {
      "total": 32,
      "active": 18,
      "completed": 8,
      "paused": 6,
      "totalSpend": 125000,
      "totalImpressions": 2450000,
      "totalClicks": 68500,
      "avgCtr": 2.79,
      "avgCpc": 1.82,
      "roi": 245,
      "byPlatform": {
        "youtube": {
          "campaigns": 28,
          "spend": 78000,
          "impressions": 1560000,
          "views": 245000
        },
        "spotify": {
          "campaigns": 24,
          "spend": 34000,
          "streams": 156000,
          "followers": 2340
        }
      }
    },
    "team": {
      "totalUsers": 8,
      "activeUsers": 7,
      "topPerformers": [
        {
          "user": {
            "firstName": "John",
            "lastName": "Doe"
          },
          "leadsConverted": 23,
          "conversionRate": 51.11,
          "totalRevenue": 245000
        }
      ]
    },
    "trends": {
      "leadsGrowth": 15.2,
      "conversionGrowth": 8.7,
      "revenueGrowth": 23.4,
      "roiGrowth": 12.1
    }
  }
}
```

#### GET `/api/analytics/conversion-funnel`

Analyse du funnel de conversion.

```javascript
// Response (200)
{
  "success": true,
  "data": {
    "funnel": [
      {
        "stage": "new",
        "count": 156,
        "percentage": 100,
        "conversionRate": null
      },
      {
        "stage": "contacted",
        "count": 124,
        "percentage": 79.49,
        "conversionRate": 79.49
      },
      {
        "stage": "qualified",
        "count": 89,
        "percentage": 57.05,
        "conversionRate": 71.77
      },
      {
        "stage": "proposal",
        "count": 45,
        "percentage": 28.85,
        "conversionRate": 50.56
      },
      {
        "stage": "negotiation",
        "count": 23,
        "percentage": 14.74,
        "conversionRate": 51.11
      },
      {
        "stage": "closed",
        "count": 12,
        "percentage": 7.69,
        "conversionRate": 52.17
      }
    ],
    "insights": [
      "Améliorer le taux de qualification (71.77%)",
      "Optimiser la phase de négociation",
      "Taux de conversion global satisfaisant (7.69%)"
    ]
  }
}
```

### 🪝 Webhooks (`/api/webhooks`)

#### POST `/api/webhooks/form-submission`

Réception des leads depuis le site web.

```javascript
// Request (depuis le site web)
{
  "firstName": "Alex",
  "lastName": "Bernard",
  "email": "alex@example.com",
  "phone": "+33987654321",
  "artistName": "Alex B",
  "platform": "youtube,spotify",
  "budget": "2000-5000",
  "message": "Je voudrais promouvoir mon nouveau single",
  "source": "website",
  "formType": "contact",
  "utm_campaign": "homepage-form",
  "utm_source": "google",
  "utm_medium": "organic"
}

// Response (200)
{
  "success": true,
  "message": "Lead reçu et traité avec succès",
  "data": {
    "leadId": "64f8a1b2c3d4e5f6a7b8c9d8",
    "assignedTo": {
      "firstName": "Marine",
      "lastName": "Dupont"
    },
    "priority": "medium",
    "stage": "new"
  }
}
```

## Codes de statut HTTP

| Code | Signification | Description |
|------|---------------|-------------|
| 200  | OK            | Requête réussie |
| 201  | Created       | Ressource créée avec succès |
| 400  | Bad Request   | Données invalides ou manquantes |
| 401  | Unauthorized  | Token manquant ou invalide |
| 403  | Forbidden     | Permissions insuffisantes |
| 404  | Not Found     | Ressource non trouvée |
| 409  | Conflict      | Conflit (ex: email déjà utilisé) |
| 422  | Unprocessable | Erreur de validation |
| 429  | Too Many Requests | Rate limit dépassé |
| 500  | Internal Error | Erreur serveur |

## Format des erreurs

```javascript
// Format standard des erreurs
{
  "success": false,
  "message": "Message d'erreur principal",
  "errors": [
    {
      "field": "email",
      "message": "Format email invalide",
      "code": "INVALID_EMAIL"
    }
  ],
  "code": "VALIDATION_ERROR",
  "timestamp": "2024-01-17T12:30:00Z",
  "path": "/api/leads",
  "requestId": "req-123456789"
}
```

## Rate Limiting

| Endpoint | Limite | Fenêtre |
|----------|--------|---------|
| `/api/auth/login` | 5 requêtes | 15 minutes |
| `/api/auth/register` | 3 requêtes | 1 heure |
| `/api/*` (général) | 100 requêtes | 15 minutes |
| `/api/webhooks/*` | 1000 requêtes | 1 heure |

## Pagination

```javascript
// Query parameters
?page=1&limit=20&sort=createdAt&order=desc

// Response format
{
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 156,
      "totalPages": 8,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

## Filtres et recherche

### Opérateurs de filtre

- `field=value` : Égalité exacte
- `field_gt=value` : Supérieur à
- `field_gte=value` : Supérieur ou égal
- `field_lt=value` : Inférieur à
- `field_lte=value` : Inférieur ou égal
- `field_in=value1,value2` : Dans la liste
- `field_regex=pattern` : Expression régulière

### Recherche textuelle

```javascript
// Recherche dans les leads
?search=marie martin
// Recherche dans : firstName, lastName, artistName, email

// Recherche avancée
?search_field=artistName&search_value=marie&search_type=contains
```

## WebSocket Events

Le CRM utilise Socket.io pour les notifications temps réel.

### Connexion

```javascript
const socket = io('wss://mdmc-crm.up.railway.app', {
  auth: {
    token: 'YOUR_ACCESS_TOKEN'
  }
})

// Rejoindre les rooms
socket.emit('join-user-room', userId)
socket.emit('join-team-room', teamName)
```

### Événements reçus

```javascript
// Nouveau lead assigné
socket.on('lead:assigned', (data) => {
  console.log('Nouveau lead assigné:', data.lead)
})

// Lead converti
socket.on('lead:converted', (data) => {
  console.log('Lead converti:', data.lead, data.campaign)
})

// KPIs mis à jour
socket.on('campaign:kpis-updated', (data) => {
  console.log('KPIs mis à jour:', data.campaignId, data.kpis)
})

// Notification système
socket.on('notification', (data) => {
  console.log('Notification:', data.message, data.type)
})
```

## Exemples d'intégration

### JavaScript/React

```javascript
import axios from 'axios'

// Configuration Axios
const api = axios.create({
  baseURL: 'https://mdmc-crm.up.railway.app/api',
  timeout: 10000
})

// Intercepteur pour les tokens
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Intercepteur pour le refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) {
        try {
          const { data } = await api.post('/auth/refresh', { refreshToken })
          localStorage.setItem('accessToken', data.data.accessToken)
          localStorage.setItem('refreshToken', data.data.refreshToken)

          // Retry original request
          error.config.headers.Authorization = `Bearer ${data.data.accessToken}`
          return api.request(error.config)
        } catch (refreshError) {
          // Redirect to login
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

// Utilisation
const getLeads = async (filters = {}) => {
  try {
    const { data } = await api.get('/leads', { params: filters })
    return data.data
  } catch (error) {
    console.error('Erreur récupération leads:', error)
    throw error
  }
}
```

### Python

```python
import requests
from datetime import datetime, timedelta

class MDMCClient:
    def __init__(self, base_url, email, password):
        self.base_url = base_url
        self.session = requests.Session()
        self.access_token = None
        self.refresh_token = None
        self.login(email, password)

    def login(self, email, password):
        response = self.session.post(f"{self.base_url}/auth/login", json={
            "email": email,
            "password": password
        })

        if response.status_code == 200:
            data = response.json()['data']
            self.access_token = data['accessToken']
            self.refresh_token = data['refreshToken']
            self.session.headers.update({
                'Authorization': f"Bearer {self.access_token}"
            })
        else:
            raise Exception(f"Login failed: {response.text}")

    def get_leads(self, **filters):
        response = self.session.get(f"{self.base_url}/leads", params=filters)
        return response.json()

    def create_lead(self, lead_data):
        response = self.session.post(f"{self.base_url}/leads", json=lead_data)
        return response.json()

# Utilisation
client = MDMCClient("https://mdmc-crm.up.railway.app/api", "user@example.com", "password")
leads = client.get_leads(stage="new", team="denis")
```

Cette documentation API couvre tous les endpoints principaux avec des exemples pratiques d'utilisation. Pour des cas d'usage spécifiques ou des questions techniques, référez-vous aux autres documents de la documentation technique.