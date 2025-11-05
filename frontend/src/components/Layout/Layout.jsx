import React, { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  HomeIcon,
  UserGroupIcon,
  MegaphoneIcon,
  ChartBarIcon,
  CogIcon,
  Bars3Icon,
  XMarkIcon,
  UserIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../../context/AuthContext'
import { cn } from '@/utils'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Leads', href: '/leads', icon: UserGroupIcon },
  { name: 'Campagnes', href: '/campaigns', icon: MegaphoneIcon },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
  { name: 'Paramètres', href: '/settings', icon: CogIcon },
]

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
    }
  }

  return (
    <div className="min-h-screen" style={{backgroundColor: '#000000'}}>
      {/* Sidebar mobile overlay */}
      <div className={cn(
        'fixed inset-0 z-50 lg:hidden',
        sidebarOpen ? 'block' : 'hidden'
      )}>
        <div
          className="fixed inset-0 backdrop-blur-sm transition-opacity duration-300"
          style={{backgroundColor: 'rgba(0, 0, 0, 0.8)'}}
          onClick={() => setSidebarOpen(false)}
        />

        {/* Mobile sidebar */}
        <div className="fixed top-0 left-0 h-full w-80 shadow-2xl transform transition-transform duration-300 ease-out" style={{backgroundColor: '#000000', borderRight: '1px solid #ffffff'}}>
          {/* Mobile sidebar header avec proportions optimisées */}
          <div className="flex items-center justify-between p-8" style={{borderBottom: '1px solid #ffffff'}}>
            <div className="flex items-center space-x-4">
              <div className="relative group">
                <div className="w-12 h-12 rounded-2xl shadow-lg overflow-hidden flex items-center justify-center border transition-all duration-300 group-hover:scale-105" style={{backgroundColor: '#000000', borderColor: '#e50914'}}>
                  <img
                    src="/assets/images/logo-picto.png"
                    alt="MDMC Music Ads"
                    className="w-8 h-8 object-contain"
                  />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  MDMC
                </h2>
                <p className="text-sm font-medium" style={{color: '#e50914'}}>Music Ads CRM</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-3 rounded-xl transition-all duration-300 border border-transparent hover:scale-105"
              style={{color: '#ffffff'}}
              onMouseEnter={(e) => {
                e.target.style.color = '#ffffff'
                e.target.style.backgroundColor = '#e50914'
                e.target.style.borderColor = '#ffffff'
              }}
              onMouseLeave={(e) => {
                e.target.style.color = '#ffffff'
                e.target.style.backgroundColor = 'transparent'
                e.target.style.borderColor = 'transparent'
              }}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Mobile navigation avec espacement amélioré */}
          <nav className="mt-8 px-6 space-y-3">
            {navigation.map((item) => {
              const isActive = location.pathname.startsWith(item.href)
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'group flex items-center px-6 py-4 text-base font-medium rounded-2xl transition-all duration-300',
                    isActive
                      ? 'border shadow-xl scale-[1.02]'
                      : 'hover:scale-[1.02]'
                  )}
                  style={isActive
                    ? {backgroundColor: '#e50914', color: '#ffffff', borderColor: '#ffffff', boxShadow: '0 10px 25px -5px rgba(229, 9, 20, 0.6)'}
                    : {color: '#ffffff'}
                  }
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.target.style.color = '#e50914'
                      e.target.style.backgroundColor = 'rgba(229, 9, 20, 0.1)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.target.style.color = '#ffffff'
                      e.target.style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  <item.icon
                    className={cn(
                      'mr-4 h-6 w-6 transition-all duration-300',
                      isActive ? '' : 'text-white group-hover:scale-110'
                    )}
                    style={{color: isActive ? '#ffffff' : undefined}}
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-80 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col border-r" style={{backgroundColor: '#000000', borderColor: '#ffffff'}}>
          {/* Desktop sidebar header avec logo optimisé */}
          <div className="flex items-center px-8 h-24 border-b" style={{borderColor: '#ffffff'}}>
            <div className="flex items-center space-x-5">
              <div className="relative group">
                <div className="w-14 h-14 rounded-2xl shadow-xl overflow-hidden flex items-center justify-center border transition-all duration-500 group-hover:scale-110 group-hover:shadow-2xl" style={{backgroundColor: '#000000', borderColor: '#e50914'}}>
                  <img
                    src="/assets/images/logo-picto.png"
                    alt="MDMC Music Ads"
                    className="w-10 h-10 object-contain transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                {/* Effet de glow subtil */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-lg"
                  style={{backgroundColor: '#e50914'}}
                ></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white leading-tight">
                  MDMC
                </h1>
                <p className="text-sm font-medium" style={{color: '#e50914'}}>Music Ads CRM</p>
              </div>
            </div>
          </div>

          {/* Desktop navigation avec amélioration visuelle */}
          <div className="flex-1 flex flex-col pt-10 pb-8 overflow-y-auto">
            <nav className="flex-1 px-6 space-y-4">
              {navigation.map((item) => {
                const isActive = location.pathname.startsWith(item.href)
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      'group flex items-center px-6 py-4 text-sm font-medium rounded-2xl transition-all duration-300 hover:scale-[1.02]',
                      isActive
                        ? 'border shadow-xl scale-[1.02]'
                        : ''
                    )}
                    style={isActive
                      ? {backgroundColor: '#e50914', color: '#ffffff', borderColor: '#ffffff', boxShadow: '0 10px 25px -5px rgba(229, 9, 20, 0.6)'}
                      : {color: '#ffffff'}
                    }
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.target.style.color = '#e50914'
                        e.target.style.backgroundColor = 'rgba(229, 9, 20, 0.1)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.target.style.color = '#ffffff'
                        e.target.style.backgroundColor = 'transparent'
                      }
                    }}
                  >
                    <item.icon
                      className={cn(
                        'mr-4 h-5 w-5 transition-all duration-300',
                        isActive ? '' : 'text-white group-hover:scale-110'
                    )}
                    style={{color: isActive ? '#ffffff' : undefined}}
                    />
                    {item.name}
                  </Link>
                )
              })}
            </nav>

            {/* Footer info avec design amélioré */}
            <div className="px-6 pt-8 border-t" style={{borderColor: '#ffffff'}}>
              <div className="flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all duration-300 hover:scale-[1.02]" style={{backgroundColor: '#000000', border: '1px solid #ffffff'}}>
                <div className="w-3 h-3 rounded-full animate-pulse" style={{backgroundColor: '#22c55e'}}></div>
                <span className="text-sm font-medium" style={{color: '#ffffff'}}>Système opérationnel</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="lg:pl-80 flex flex-col min-h-screen">
        {/* Header with enhanced glass effect */}
        <header className="sticky top-0 z-40 flex h-24 backdrop-blur-xl border-b shadow-2xl" style={{backgroundColor: 'rgba(0, 0, 0, 0.95)', borderColor: '#ffffff'}}>
          <button
            onClick={() => setSidebarOpen(true)}
            className="px-8 border-r focus:outline-none focus:ring-2 focus:ring-inset lg:hidden transition-all duration-300 hover:scale-105"
            style={{borderColor: '#ffffff', color: '#ffffff'}}
            onMouseEnter={(e) => {
              e.target.style.color = '#ffffff'
              e.target.style.backgroundColor = '#e50914'
              e.target.style.borderColor = '#ffffff'
            }}
            onMouseLeave={(e) => {
              e.target.style.color = '#ffffff'
              e.target.style.backgroundColor = 'transparent'
              e.target.style.borderColor = '#ffffff'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#e50914'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#ffffff'
            }}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>

          <div className="flex-1 px-8 flex justify-between items-center">
            <div className="flex-1">
              {/* Page title area avec amélioration typographique */}
              <div className="flex items-center space-x-6">
                <div className="hidden md:block">
                  <h2 className="text-2xl font-bold text-white leading-tight">
                    {navigation.find(nav => location.pathname.startsWith(nav.href))?.name || 'Dashboard'}
                  </h2>
                  <p className="text-sm font-medium opacity-80" style={{color: '#ffffff'}}>Gestion des campagnes musicales</p>
                </div>
              </div>
            </div>

            {/* User menu avec design amélioré */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-2xl flex items-center justify-center shadow-xl border transition-all duration-300 hover:scale-105" style={{backgroundColor: '#e50914', borderColor: '#ffffff'}}>
                    <UserIcon className="h-6 w-6" style={{color: '#ffffff'}} />
                  </div>
                </div>
                <div className="hidden md:block">
                  <div className="text-sm font-semibold" style={{color: '#ffffff'}}>
                    {user?.name || 'Utilisateur'}
                  </div>
                  <div className="text-xs font-medium" style={{color: '#e50914'}}>
                    {user?.role || 'Membre'}
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-3 rounded-2xl border border-transparent transition-all duration-300 group hover:scale-105"
                style={{color: '#ffffff'}}
                onMouseEnter={(e) => {
                  e.target.style.color = '#ffffff'
                  e.target.style.backgroundColor = '#e50914'
                  e.target.style.borderColor = '#ffffff'
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = '#ffffff'
                  e.target.style.backgroundColor = 'transparent'
                  e.target.style.borderColor = 'transparent'
                }}
                title="Se déconnecter"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Page content avec espacement optimisé */}
        <main className="flex-1" style={{backgroundColor: '#000000'}}>
          <div className="py-[clamp(24px,4vw,48px)]">
            <div className="max-w-7xl mx-auto px-[clamp(24px,4vw,64px)]">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout