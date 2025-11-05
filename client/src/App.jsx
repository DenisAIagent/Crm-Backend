import React, { Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useAuth } from './context/AuthContext'

// Layout components
import Layout from './components/Layout/Layout'
import AuthLayout from './components/Layout/AuthLayout'
import LoadingSpinner from './components/UI/LoadingSpinner'

// Pages - Lazy loading pour optimiser les performances
const Dashboard = React.lazy(() => import('./pages/Dashboard/Dashboard'))
const LeadsPage = React.lazy(() => import('./pages/Leads/LeadsPage'))
const LeadDetail = React.lazy(() => import('./pages/Leads/LeadDetail'))
const CampaignsPage = React.lazy(() => import('./pages/Campaigns/CampaignsPage'))
const CampaignDetail = React.lazy(() => import('./pages/Campaigns/CampaignDetail'))
const AnalyticsPage = React.lazy(() => import('./pages/Analytics/AnalyticsPage'))
const UsersPage = React.lazy(() => import('./pages/Users/UsersPage'))
const AuditPage = React.lazy(() => import('./pages/Admin/AuditPage'))
const SettingsPage = React.lazy(() => import('./pages/Settings/SettingsPage'))
const ProfilePage = React.lazy(() => import('./pages/Settings/ProfilePage'))

// Auth pages
const LoginPage = React.lazy(() => import('./pages/Auth/LoginPage'))
const RegisterPage = React.lazy(() => import('./pages/Auth/RegisterPage'))
const ForgotPasswordPage = React.lazy(() => import('./pages/Auth/ForgotPasswordPage'))
const ResetPasswordPage = React.lazy(() => import('./pages/Auth/ResetPasswordPage'))

// Error pages
const NotFoundPage = React.lazy(() => import('./pages/Error/NotFoundPage'))
const UnauthorizedPage = React.lazy(() => import('./pages/Error/UnauthorizedPage'))

// Composant de protection des routes
function ProtectedRoute({ children, requiredRole, requiredPermission }) {
  const { isAuthenticated, user, hasRole, hasPermission } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Vérification du rôle
  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/unauthorized" replace />
  }

  // Vérification des permissions
  if (requiredPermission && !hasPermission(requiredPermission.resource, requiredPermission.action)) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}

// Composant de redirection des utilisateurs authentifiés
function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

// Composant de fallback pour le Suspense
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinner size="lg" />
    </div>
  )
}

function App() {
  const { isLoading } = useAuth()


  // Afficher le loader principal pendant la vérification de l'auth
  if (isLoading) {
    return <PageLoader />
  }

  return (
    <>
      <Helmet>
        <title>MDMC Music Ads CRM</title>
        <meta name="description" content="Système de gestion CRM pour MDMC Music Ads - Gestion des leads, campagnes et analytics" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#1f2937" />
      </Helmet>

      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Routes publiques (auth) */}
          <Route path="/login" element={
            <PublicRoute>
              <AuthLayout>
                <LoginPage />
              </AuthLayout>
            </PublicRoute>
          } />

          <Route path="/register" element={
            <PublicRoute>
              <AuthLayout>
                <RegisterPage />
              </AuthLayout>
            </PublicRoute>
          } />

          <Route path="/forgot-password" element={
            <PublicRoute>
              <AuthLayout>
                <ForgotPasswordPage />
              </AuthLayout>
            </PublicRoute>
          } />

          <Route path="/reset-password/:token" element={
            <PublicRoute>
              <AuthLayout>
                <ResetPasswordPage />
              </AuthLayout>
            </PublicRoute>
          } />

          {/* Routes protégées */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            {/* Dashboard */}
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />

            {/* Gestion des leads */}
            <Route path="leads" element={
              <ProtectedRoute requiredPermission={{ resource: 'leads', action: 'read' }}>
                <LeadsPage />
              </ProtectedRoute>
            } />

            <Route path="leads/:id" element={
              <ProtectedRoute requiredPermission={{ resource: 'leads', action: 'read' }}>
                <LeadDetail />
              </ProtectedRoute>
            } />


            {/* Gestion des campagnes */}
            <Route path="campaigns" element={
              <ProtectedRoute requiredPermission={{ resource: 'campaigns', action: 'read' }}>
                <CampaignsPage />
              </ProtectedRoute>
            } />

            <Route path="campaigns/:id" element={
              <ProtectedRoute requiredPermission={{ resource: 'campaigns', action: 'read' }}>
                <CampaignDetail />
              </ProtectedRoute>
            } />

            {/* Analytics */}
            <Route path="analytics" element={
              <ProtectedRoute requiredPermission={{ resource: 'analytics', action: 'read' }}>
                <AnalyticsPage />
              </ProtectedRoute>
            } />

            {/* Administration */}
            <Route path="admin" element={
              <ProtectedRoute requiredRole={['admin', 'manager']}>
                <Navigate to="/admin/users" replace />
              </ProtectedRoute>
            } />

            <Route path="admin/users" element={
              <ProtectedRoute requiredPermission={{ resource: 'admin', action: 'users' }}>
                <UsersPage />
              </ProtectedRoute>
            } />

            <Route path="admin/audit" element={
              <ProtectedRoute requiredPermission={{ resource: 'admin', action: 'audit' }}>
                <AuditPage />
              </ProtectedRoute>
            } />

            {/* Paramètres */}
            <Route path="settings" element={
              <ProtectedRoute requiredPermission={{ resource: 'admin', action: 'settings' }}>
                <SettingsPage />
              </ProtectedRoute>
            } />

            <Route path="profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
          </Route>

          {/* Pages d'erreur */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </>
  )
}

export default App