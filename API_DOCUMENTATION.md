# MDMC Music Ads CRM - API Documentation

## Base URL
```
Production: https://api2.mdmcmusicads.com
Development: http://localhost:5000
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Admin Credentials
- **Email**: `admin@mdmcmusicads.com`
- **Password**: `MDMC_Admin_2025!`

## Table of Contents
1. [Authentication Endpoints](#authentication-endpoints)
2. [User Management](#user-management)
3. [Lead Management](#lead-management)
4. [Campaign Management](#campaign-management)
5. [Analytics](#analytics)
6. [Dashboard](#dashboard)
7. [Error Handling](#error-handling)
8. [Rate Limiting](#rate-limiting)

---

## Authentication Endpoints

### POST /api/auth/register
Register a new user.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "role": "agent"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "user_id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "role": "agent",
      "permissions": ["leads.read", "leads.write"]
    },
    "tokens": {
      "accessToken": "jwt_token",
      "refreshToken": "refresh_token",
      "expiresIn": "15m"
    }
  }
}
```

### POST /api/auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

### POST /api/auth/admin-login
Login with admin credentials.

**Request Body:**
```json
{
  "email": "admin@mdmcmusicads.com",
  "password": "MDMC_Admin_2025!"
}
```

### POST /api/auth/refresh-token
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "your_refresh_token"
}
```

### GET /api/auth/google
Initiate Google OAuth authentication.

### GET /api/auth/google/callback
Google OAuth callback URL.

### GET /api/auth/profile
Get current user profile (requires authentication).

### PUT /api/auth/profile
Update current user profile (requires authentication).

### POST /api/auth/change-password
Change user password (requires authentication).

**Request Body:**
```json
{
  "currentPassword": "oldPassword",
  "newPassword": "newSecurePass123!",
  "confirmPassword": "newSecurePass123!"
}
```

### POST /api/auth/logout
Logout current user (requires authentication).

---

## User Management

### GET /api/users
Get all users with pagination and filtering.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)
- `role` (string): Filter by role
- `isActive` (boolean): Filter by active status
- `search` (string): Search in name/email
- `sort` (string): Sort field (default: createdAt)
- `order` (string): Sort order (asc/desc, default: desc)

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalCount": 95,
      "hasNextPage": true,
      "hasPrevPage": false,
      "limit": 10
    }
  }
}
```

### GET /api/users/:id
Get single user by ID.

### POST /api/users
Create new user (admin only).

### PUT /api/users/:id
Update user.

### DELETE /api/users/:id
Deactivate user (admin only).

### PATCH /api/users/:id/activate
Activate user (admin only).

### PATCH /api/users/:id/role
Change user role (admin only).

**Request Body:**
```json
{
  "role": "manager"
}
```

### GET /api/users/stats
Get user statistics (manager+ only).

---

## Lead Management

### GET /api/leads
Get all leads with filtering and pagination.

**Query Parameters:**
- `page`, `limit`: Pagination
- `status`: Filter by lead status (new, contacted, qualified, etc.)
- `source`: Filter by lead source
- `assignedTo`: Filter by assigned user
- `priority`: Filter by priority level
- `search`: Text search in lead data
- `startDate`, `endDate`: Date range filter
- `genre`: Filter by music genre
- `score`: Score range (e.g., "80-100")
- `temperature`: Filter by temperature (cold, warm, hot)
- `tags`: Filter by tags (comma-separated)

**Response:**
```json
{
  "success": true,
  "data": {
    "leads": [
      {
        "_id": "lead_id",
        "firstName": "Jane",
        "lastName": "Artist",
        "email": "jane@example.com",
        "artistName": "Jane Music",
        "status": "new",
        "score": 75,
        "source": "website",
        "assignedTo": {
          "_id": "user_id",
          "firstName": "John",
          "lastName": "Agent"
        },
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {...}
  }
}
```

### GET /api/leads/:id
Get single lead by ID.

### POST /api/leads
Create new lead.

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Artist",
  "email": "jane@example.com",
  "phone": "+1234567890",
  "artistName": "Jane Music",
  "genre": "Pop",
  "source": "website",
  "servicesInterested": ["youtube_promotion", "spotify_promotion"],
  "budget": {
    "min": 1000,
    "max": 5000,
    "currency": "USD"
  },
  "projectDescription": "Looking to promote my new single"
}
```

### PUT /api/leads/:id
Update lead.

### DELETE /api/leads/:id
Delete lead (soft delete, manager+ only).

### PATCH /api/leads/:id/assign
Assign lead to user (manager+ only).

**Request Body:**
```json
{
  "assignedTo": "user_id"
}
```

### POST /api/leads/:id/interactions
Add interaction to lead.

**Request Body:**
```json
{
  "type": "call",
  "description": "Discussed project requirements",
  "outcome": "positive",
  "nextAction": "Send proposal",
  "nextActionDate": "2024-01-15T10:00:00.000Z"
}
```

### PATCH /api/leads/:id/follow-up
Set next follow-up.

**Request Body:**
```json
{
  "date": "2024-01-15T10:00:00.000Z",
  "reason": "Follow up on proposal"
}
```

### PATCH /api/leads/:id/convert
Convert lead to customer.

**Request Body:**
```json
{
  "conversionValue": 3000
}
```

### PATCH /api/leads/:id/lost
Mark lead as lost.

**Request Body:**
```json
{
  "reason": "Budget constraints"
}
```

### GET /api/leads/overdue
Get overdue leads.

### GET /api/leads/stats
Get lead statistics.

### PATCH /api/leads/bulk
Bulk update leads.

**Request Body:**
```json
{
  "leadIds": ["id1", "id2", "id3"],
  "updates": {
    "status": "contacted",
    "priority": "high"
  }
}
```

### GET /api/leads/export
Export leads (supports CSV and JSON formats).

**Query Parameters:**
- `format`: Export format (json, csv)
- All filtering parameters from GET /api/leads

---

## Campaign Management

### GET /api/campaigns
Get all campaigns with filtering and pagination.

**Query Parameters:**
- Standard pagination and filtering options
- `status`: Campaign status
- `type`: Campaign type
- `manager`: Filter by campaign manager
- `startDate`, `endDate`: Date range
- `minBudget`, `maxBudget`: Budget range
- `tags`: Filter by tags
- `category`: Campaign category

### GET /api/campaigns/:id
Get single campaign by ID.

### POST /api/campaigns
Create new campaign.

**Request Body:**
```json
{
  "name": "Summer Music Promotion",
  "description": "Promote summer singles",
  "type": "youtube_promotion",
  "category": "acquisition",
  "startDate": "2024-06-01T00:00:00.000Z",
  "endDate": "2024-08-31T23:59:59.000Z",
  "budget": {
    "total": 10000,
    "currency": "USD",
    "dailyBudget": 333
  },
  "manager": "user_id",
  "client": "lead_id",
  "targetAudience": {
    "demographics": {
      "ageRange": { "min": 18, "max": 35 },
      "gender": "all",
      "locations": [
        {
          "country": "US",
          "state": "CA"
        }
      ]
    },
    "interests": ["music", "pop music", "new artists"]
  },
  "objectives": ["brand_awareness", "engagement"],
  "platforms": [
    {
      "name": "youtube",
      "accountId": "youtube_account_id",
      "isActive": true
    }
  ]
}
```

### PUT /api/campaigns/:id
Update campaign.

### DELETE /api/campaigns/:id
Archive campaign (manager+ only).

### PATCH /api/campaigns/:id/metrics
Update campaign metrics.

**Request Body:**
```json
{
  "metrics": {
    "impressions": 100000,
    "clicks": 5000,
    "conversions": 250,
    "revenue": 7500
  }
}
```

### POST /api/campaigns/:id/daily-metrics
Add daily metrics.

**Request Body:**
```json
{
  "date": "2024-01-15",
  "metrics": {
    "impressions": 10000,
    "clicks": 500,
    "spend": 300,
    "conversions": 25
  }
}
```

### PATCH /api/campaigns/:id/pause
Pause campaign.

### PATCH /api/campaigns/:id/resume
Resume campaign.

### PATCH /api/campaigns/:id/complete
Complete campaign.

### POST /api/campaigns/:id/optimizations
Add optimization note.

**Request Body:**
```json
{
  "type": "targeting",
  "description": "Refined audience targeting",
  "previousValue": "18-65",
  "newValue": "18-35",
  "reason": "Better performance in younger demographic",
  "impact": "15% improvement in CTR"
}
```

### GET /api/campaigns/stats
Get campaign statistics.

### GET /api/campaigns/:id/performance
Get campaign performance over time.

### POST /api/campaigns/:id/duplicate
Duplicate campaign.

**Request Body:**
```json
{
  "name": "Summer Music Promotion (Copy)"
}
```

### PATCH /api/campaigns/bulk
Bulk update campaigns.

---

## Analytics

### GET /api/analytics/dashboard
Get dashboard analytics overview.

**Query Parameters:**
- `startDate`, `endDate`: Date range
- `groupBy`: Grouping (day, week, month)

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "leads": {
        "total": 1250,
        "new": 45,
        "converted": 78,
        "conversionRate": 6.24,
        "averageScore": 65.5
      },
      "campaigns": {
        "total": 25,
        "active": 8,
        "totalSpend": 45000,
        "totalRevenue": 89000,
        "roi": 97.78
      }
    },
    "distributions": {
      "leadsByStatus": [...],
      "leadsBySource": [...],
      "campaignsByStatus": [...],
      "campaignsByType": [...]
    },
    "trends": {
      "leadConversion": [...],
      "campaignPerformance": {...}
    }
  }
}
```

### GET /api/analytics/leads
Get detailed lead analytics.

### GET /api/analytics/campaigns
Get detailed campaign analytics.

### GET /api/analytics/revenue
Get revenue analytics.

### GET /api/analytics/comparison
Compare performance between two periods.

**Query Parameters:**
- `metric`: Metric to compare (revenue, leads, campaigns, conversions)
- `period1Start`, `period1End`: First period
- `period2Start`, `period2End`: Second period

---

## Dashboard

### GET /api/dashboard/overview
Get dashboard overview with key metrics.

### GET /api/dashboard/widgets
Get specific dashboard widgets.

**Query Parameters:**
- `widgets`: Comma-separated widget names (leads, campaigns, tasks, performance)

### GET /api/dashboard/team-performance
Get team performance (manager+ only).

### GET /api/dashboard/quick-actions
Get quick actions for dashboard.

---

## Error Handling

The API uses standard HTTP status codes and returns errors in this format:

```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE",
  "errors": [
    {
      "field": "email",
      "message": "Email is required",
      "value": ""
    }
  ]
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

### Error Codes
- `VALIDATION_ERROR` - Request validation failed
- `NOT_FOUND` - Resource not found
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions
- `CONFLICT` - Resource conflict
- `TOO_MANY_REQUESTS` - Rate limit exceeded
- `TOKEN_EXPIRED` - JWT token expired
- `INVALID_TOKEN` - Invalid JWT token

---

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Global limit**: 100 requests per 15-minute window per IP
- **User limit**: 100 requests per 15-minute window per authenticated user
- **Production limit**: 100 requests per 15-minute window
- **Development limit**: 1000 requests per 15-minute window

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Request limit
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Reset time

---

## Permissions System

The API uses a role-based permission system:

### Roles
- `admin`: Full access to all resources
- `manager`: Access to team management and reporting
- `agent`: Access to assigned leads and campaigns
- `viewer`: Read-only access

### Permissions
- `users.read`, `users.write`, `users.delete`
- `leads.read`, `leads.write`, `leads.delete`
- `campaigns.read`, `campaigns.write`, `campaigns.delete`
- `analytics.read`, `analytics.write`
- `dashboard.read`, `dashboard.write`
- `settings.read`, `settings.write`

---

## Example API Calls

### Create a Lead
```bash
curl -X POST https://api2.mdmcmusicads.com/api/leads \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Artist",
    "email": "jane@example.com",
    "artistName": "Jane Music",
    "source": "website",
    "genre": "Pop"
  }'
```

### Get Analytics Dashboard
```bash
curl -X GET "https://api2.mdmcmusicads.com/api/analytics/dashboard?startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update Campaign Metrics
```bash
curl -X PATCH https://api2.mdmcmusicads.com/api/campaigns/CAMPAIGN_ID/metrics \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "metrics": {
      "impressions": 50000,
      "clicks": 2500,
      "conversions": 125
    }
  }'
```

---

## Environment Variables

Required environment variables for deployment:

```bash
# Server
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb://your-mongo-connection-string

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-secret-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://api2.mdmcmusicads.com/api/auth/google/callback

# Frontend
FRONTEND_URL=https://adminpanel.mdmcmusicads.com

# Session
SESSION_SECRET=your-session-secret
```

---

## Support

For API support, contact: dev@mdmcmusicads.com

**API Version**: 1.0.0
**Last Updated**: November 2024