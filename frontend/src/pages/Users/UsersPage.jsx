import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import {
  UserGroupIcon,
  UserPlusIcon,
  PencilIcon,
  TrashIcon,
  ShieldCheckIcon,
  CogIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  LockClosedIcon,
  UserCircleIcon,
  StarIcon,
  BoltIcon,
  KeyIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

import { useAuth } from '@/context/AuthContext'
import LoadingSpinner from '@/components/UI/LoadingSpinner'
import {
  SpotifyIcon,
  YouTubeIcon,
  TikTokIcon,
  MetaIcon,
  AnalyticsIcon,
  StreamingIcon,
  WaveformIcon,
  VinylIcon,
  MicrophoneIcon
} from '@/components/UI/MusicIcons'
import { usersAPI } from '@/utils/api'

const roleConfig = {
  admin: {
    label: 'Administrateur',
    color: 'red',
    icon: ShieldCheckIcon,
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
    description: 'Accès complet au système'
  },
  manager: {
    label: 'Manager',
    color: 'purple',
    icon: StarIcon,
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200',
    description: 'Gestion d\'équipe et campagnes'
  },
  artist_manager: {
    label: 'Artist Manager',
    color: 'blue',
    icon: MicrophoneIcon,
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    description: 'Gestion des artistes'
  },
  marketing: {
    label: 'Marketing',
    color: 'emerald',
    icon: BoltIcon,
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-200',
    description: 'Campagnes publicitaires'
  },
  analyst: {
    label: 'Analyste',
    color: 'cyan',
    icon: AnalyticsIcon,
    bgColor: 'bg-cyan-50',
    textColor: 'text-cyan-700',
    borderColor: 'border-cyan-200',
    description: 'Analytics et reporting'
  },
  user: {
    label: 'Utilisateur',
    color: 'slate',
    icon: UserCircleIcon,
    bgColor: 'bg-slate-50',
    textColor: 'text-slate-700',
    borderColor: 'border-slate-200',
    description: 'Accès basique'
  }
}

const statusConfig = {
  active: {
    label: 'Actif',
    color: 'green',
    icon: CheckCircleIcon,
    bgColor: 'bg-green-50',
    textColor: 'text-green-700'
  },
  inactive: {
    label: 'Inactif',
    color: 'gray',
    icon: XCircleIcon,
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-700'
  },
  pending: {
    label: 'En attente',
    color: 'amber',
    icon: ClockIcon,
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700'
  }
}

function UsersPage() {
  const { user, hasPermission } = useAuth()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [selectedUsers, setSelectedUsers] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)

  // Fetch users data with real data structure
  const { data: usersData, isLoading, error } = useQuery(
    ['users', { search: searchTerm, role: filterRole, status: filterStatus }],
    () => usersAPI.getAll({ search: searchTerm, role: filterRole, status: filterStatus }),
    {
      initialData: {
        users: [
          {
            id: 1,
            firstName: 'Denis',
            lastName: 'Adam',
            email: 'denis@mdmc-music-ads.com',
            role: 'admin',
            status: 'active',
            avatar: null,
            team: 'Direction',
            lastLogin: new Date().toISOString(),
            createdAt: '2024-01-15T10:00:00Z',
            stats: {
              leadsManaged: 0,
              campaignsCreated: 0,
              revenueGenerated: 0
            },
            permissions: {
              users: { create: true, read: true, update: true, delete: true },
              leads: { create: true, read: true, update: true, delete: true },
              campaigns: { create: true, read: true, update: true, delete: true },
              analytics: { create: true, read: true, update: true, delete: true }
            }
          },
          {
            id: 2,
            firstName: 'Sarah',
            lastName: 'Martinez',
            email: 'sarah@mdmc-music-ads.com',
            role: 'manager',
            status: 'active',
            avatar: null,
            team: 'Operations',
            lastLogin: '2025-01-30T14:30:00Z',
            createdAt: '2024-02-01T09:00:00Z',
            stats: {
              leadsManaged: 89,
              campaignsCreated: 15,
              revenueGenerated: 125000
            },
            permissions: {
              users: { create: false, read: true, update: false, delete: false },
              leads: { create: true, read: true, update: true, delete: false },
              campaigns: { create: true, read: true, update: true, delete: false },
              analytics: { create: false, read: true, update: false, delete: false }
            }
          },
          {
            id: 3,
            firstName: 'Thomas',
            lastName: 'Chen',
            email: 'thomas@mdmc-music-ads.com',
            role: 'artist_manager',
            status: 'active',
            avatar: null,
            team: 'Artist Relations',
            lastLogin: '2025-01-30T16:45:00Z',
            createdAt: '2024-03-10T11:00:00Z',
            stats: {
              leadsManaged: 67,
              campaignsCreated: 8,
              revenueGenerated: 85000
            },
            permissions: {
              users: { create: false, read: true, update: false, delete: false },
              leads: { create: true, read: true, update: true, delete: false },
              campaigns: { create: true, read: true, update: true, delete: false },
              analytics: { create: false, read: true, update: false, delete: false }
            }
          },
          {
            id: 4,
            firstName: 'Lisa',
            lastName: 'Johnson',
            email: 'lisa@mdmc-music-ads.com',
            role: 'marketing',
            status: 'active',
            avatar: null,
            team: 'Marketing',
            lastLogin: '2025-01-30T12:15:00Z',
            createdAt: '2024-03-20T14:00:00Z',
            stats: {
              leadsManaged: 45,
              campaignsCreated: 22,
              revenueGenerated: 95000
            },
            permissions: {
              users: { create: false, read: true, update: false, delete: false },
              leads: { create: true, read: true, update: true, delete: false },
              campaigns: { create: true, read: true, update: true, delete: false },
              analytics: { create: false, read: true, update: false, delete: false }
            }
          },
          {
            id: 5,
            firstName: 'Alex',
            lastName: 'Rodriguez',
            email: 'alex@mdmc-music-ads.com',
            role: 'analyst',
            status: 'active',
            avatar: null,
            team: 'Analytics',
            lastLogin: '2025-01-30T09:30:00Z',
            createdAt: '2024-04-05T08:00:00Z',
            stats: {
              leadsManaged: 0,
              campaignsCreated: 0,
              revenueGenerated: 0
            },
            permissions: {
              users: { create: false, read: true, update: false, delete: false },
              leads: { create: false, read: true, update: false, delete: false },
              campaigns: { create: false, read: true, update: false, delete: false },
              analytics: { create: true, read: true, update: true, delete: false }
            }
          },
          {
            id: 6,
            firstName: 'Emma',
            lastName: 'Wilson',
            email: 'emma@mdmc-music-ads.com',
            role: 'user',
            status: 'pending',
            avatar: null,
            team: 'Support',
            lastLogin: null,
            createdAt: '2025-01-28T16:00:00Z',
            stats: {
              leadsManaged: 0,
              campaignsCreated: 0,
              revenueGenerated: 0
            },
            permissions: {
              users: { create: false, read: false, update: false, delete: false },
              leads: { create: false, read: true, update: false, delete: false },
              campaigns: { create: false, read: true, update: false, delete: false },
              analytics: { create: false, read: false, update: false, delete: false }
            }
          }
        ],
        total: 6
      }
    }
  )

  // Filter users based on search and filters
  const filteredUsers = usersData?.users?.filter(user => {
    const matchesSearch = !searchTerm ||
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.team.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = !filterRole || user.role === filterRole
    const matchesStatus = !filterStatus || user.status === filterStatus

    return matchesSearch && matchesRole && matchesStatus
  }) || []

  // Delete user mutation
  const deleteMutation = useMutation(usersAPI.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries(['users'])
      toast.success('Utilisateur supprimé avec succès')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression')
    }
  })

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      deleteMutation.mutate(userId)
    }
  }

  const handleEditUser = (user) => {
    setEditingUser(user)
    setShowEditModal(true)
  }

  const getRoleIcon = (role) => {
    const config = roleConfig[role] || roleConfig.user
    const Icon = config.icon
    return <Icon className="w-4 h-4" />
  }

  const getStatusIcon = (status) => {
    const config = statusConfig[status] || statusConfig.inactive
    const Icon = config.icon
    return <Icon className="w-4 h-4" />
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>Gestion des Utilisateurs - MDMC Music Ads CRM</title>
      </Helmet>

      {/* Musical Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-16 left-8 opacity-5">
          <UserGroupIcon className="w-28 h-28 text-purple-400 animate-pulse" />
        </div>
        <div className="absolute top-32 right-16 opacity-5">
          <ShieldCheckIcon className="w-24 h-24 text-cyan-400 animate-bounce" style={{ animationDuration: '3s' }} />
        </div>
        <div className="absolute bottom-32 left-16 opacity-5">
          <CogIcon className="w-32 h-32 text-violet-400 animate-spin" style={{ animationDuration: '20s' }} />
        </div>
      </div>

      <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
        <div className="p-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div className="relative">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent mb-3">
                Gestion des Utilisateurs
              </h1>
              <p className="text-slate-600 text-lg">
                Administration des comptes et permissions équipe
              </p>
            </div>

            {hasPermission('users', 'create') && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="group px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2 mt-4 sm:mt-0"
              >
                <UserPlusIcon className="w-5 h-5 group-hover:animate-pulse" />
                Nouvel utilisateur
              </button>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Utilisateurs</p>
                  <p className="text-3xl font-bold text-slate-900">{usersData?.total || 0}</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-purple-400 to-blue-500 rounded-xl">
                  <UserGroupIcon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Actifs</p>
                  <p className="text-3xl font-bold text-green-600">
                    {usersData?.users?.filter(u => u.status === 'active').length || 0}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl">
                  <CheckCircleIcon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Administrateurs</p>
                  <p className="text-3xl font-bold text-red-600">
                    {usersData?.users?.filter(u => u.role === 'admin').length || 0}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-r from-red-400 to-rose-500 rounded-xl">
                  <ShieldCheckIcon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">En attente</p>
                  <p className="text-3xl font-bold text-amber-600">
                    {usersData?.users?.filter(u => u.status === 'pending').length || 0}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl">
                  <ClockIcon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-lg mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, email ou équipe..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/80 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                />
              </div>

              {/* Role Filter */}
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-4 py-3 bg-white/80 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
              >
                <option value="">Tous les rôles</option>
                {Object.entries(roleConfig).map(([value, config]) => (
                  <option key={value} value={value}>{config.label}</option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 bg-white/80 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
              >
                <option value="">Tous les statuts</option>
                {Object.entries(statusConfig).map(([value, config]) => (
                  <option key={value} value={value}>{config.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">Utilisateur</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">Rôle</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">Équipe</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">Statut</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">Performance</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">Dernière connexion</th>
                    <th className="text-right py-4 px-6 font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((userData, index) => {
                    const roleConf = roleConfig[userData.role] || roleConfig.user
                    const statusConf = statusConfig[userData.status] || statusConfig.inactive

                    return (
                      <tr key={userData.id} className="hover:bg-slate-50/50 transition-colors duration-200">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                              {userData.firstName[0]}{userData.lastName[0]}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900">
                                {userData.firstName} {userData.lastName}
                              </div>
                              <div className="text-sm text-slate-600">{userData.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${roleConf.bgColor} ${roleConf.textColor} ${roleConf.borderColor} border`}>
                            {getRoleIcon(userData.role)}
                            {roleConf.label}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-slate-700 font-medium">{userData.team}</span>
                        </td>
                        <td className="py-4 px-6">
                          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${statusConf.bgColor} ${statusConf.textColor}`}>
                            {getStatusIcon(userData.status)}
                            {statusConf.label}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm space-y-1">
                            <div className="flex justify-between">
                              <span className="text-slate-600">Leads:</span>
                              <span className="font-semibold text-blue-600">{userData.stats.leadsManaged}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">Campagnes:</span>
                              <span className="font-semibold text-purple-600">{userData.stats.campaignsCreated}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">Revenus:</span>
                              <span className="font-semibold text-green-600">
                                {(userData.stats.revenueGenerated / 1000).toFixed(0)}K€
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm text-slate-600">
                            {userData.lastLogin ? (
                              <>
                                <div>{new Date(userData.lastLogin).toLocaleDateString('fr-FR')}</div>
                                <div>{new Date(userData.lastLogin).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
                              </>
                            ) : (
                              <span className="text-amber-600">Jamais connecté</span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEditUser(userData)}
                              className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                              title="Modifier"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>

                            {hasPermission('users', 'delete') && userData.id !== user.id && (
                              <button
                                onClick={() => handleDeleteUser(userData.id)}
                                className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                                title="Supprimer"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <UserGroupIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-600 mb-2">Aucun utilisateur trouvé</h3>
                <p className="text-slate-500">Aucun utilisateur ne correspond à vos critères de recherche.</p>
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/60 backdrop-blur-sm border border-white/30 rounded-full shadow-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-slate-700">Système de gestion des utilisateurs</span>
              </div>
              <div className="w-px h-4 bg-slate-300"></div>
              <span className="text-sm text-slate-600">
                {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''} affiché{filteredUsers.length > 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default UsersPage