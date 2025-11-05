import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { Helmet } from 'react-helmet-async'
import {
  UserPlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ShieldCheckIcon,
  UserIcon,
  EnvelopeIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'

import { useAuth } from '@/context/AuthContext'
import LoadingSpinner from '@/components/UI/LoadingSpinner'

function UsersPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Placeholder data - would be fetched from API
  const usersData = [
    {
      id: 1,
      firstName: 'Denis',
      lastName: 'Adam',
      email: 'denis@mdmc.fr',
      role: 'admin',
      status: 'active',
      lastLogin: '2024-01-15T10:30:00',
      createdAt: '2023-06-01T09:00:00',
      permissions: ['read', 'write', 'delete', 'admin']
    },
    {
      id: 2,
      firstName: 'Marine',
      lastName: 'Dubois',
      email: 'marine@mdmc.fr',
      role: 'manager',
      status: 'active',
      lastLogin: '2024-01-14T16:45:00',
      createdAt: '2023-06-15T14:20:00',
      permissions: ['read', 'write', 'manage_team']
    },
    {
      id: 3,
      firstName: 'Antoine',
      lastName: 'Martin',
      email: 'antoine@mdmc.fr',
      role: 'agent',
      status: 'active',
      lastLogin: '2024-01-13T08:15:00',
      createdAt: '2023-07-01T11:30:00',
      permissions: ['read', 'write']
    },
    {
      id: 4,
      firstName: 'Sophie',
      lastName: 'Bernard',
      email: 'sophie@mdmc.fr',
      role: 'agent',
      status: 'inactive',
      lastLogin: '2023-12-20T14:00:00',
      createdAt: '2023-08-10T10:45:00',
      permissions: ['read']
    }
  ]

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'manager': return 'bg-blue-100 text-blue-800'
      case 'agent': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredUsers = usersData.filter(u => {
    const matchesSearch = searchTerm === '' ||
      u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = roleFilter === '' || u.role === roleFilter
    const matchesStatus = statusFilter === '' || u.status === statusFilter

    return matchesSearch && matchesRole && matchesStatus
  })

  return (
    <>
      <Helmet>
        <title>Gestion des Utilisateurs - MDMC Music Ads CRM</title>
      </Helmet>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Gestion des Utilisateurs
            </h1>
            <p className="text-gray-600">
              Administration des comptes utilisateurs et des permissions
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors mt-4 sm:mt-0"
          >
            <UserPlusIcon className="w-5 h-5 mr-2" />
            Nouvel Utilisateur
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Utilisateurs</p>
                <p className="text-2xl font-bold text-gray-900">{usersData.length}</p>
              </div>
              <UserIcon className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Actifs</p>
                <p className="text-2xl font-bold text-green-600">
                  {usersData.filter(u => u.status === 'active').length}
                </p>
              </div>
              <ShieldCheckIcon className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Administrateurs</p>
                <p className="text-2xl font-bold text-red-600">
                  {usersData.filter(u => u.role === 'admin').length}
                </p>
              </div>
              <ShieldCheckIcon className="w-8 h-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Dernière Connexion</p>
                <p className="text-sm font-medium text-gray-900">Aujourd'hui</p>
              </div>
              <CalendarIcon className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un utilisateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Tous les rôles</option>
              <option value="admin">Administrateur</option>
              <option value="manager">Manager</option>
              <option value="agent">Agent</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
              <option value="pending">En attente</option>
            </select>

            <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <FunnelIcon className="w-5 h-5 mr-2" />
              Filtres avancés
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-6 font-medium text-gray-900">Utilisateur</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-900">Rôle</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-900">Statut</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-900">Dernière Connexion</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-900">Date de Création</th>
                  <th className="text-center py-3 px-6 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-sm font-medium text-primary-700">
                            {user.firstName[0]}{user.lastName[0]}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <EnvelopeIcon className="w-4 h-4 mr-1" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {user.role === 'admin' ? 'Administrateur' :
                         user.role === 'manager' ? 'Manager' : 'Agent'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                        {user.status === 'active' ? 'Actif' :
                         user.status === 'inactive' ? 'Inactif' : 'En attente'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {new Date(user.lastLogin).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center space-x-2">
                        <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg">
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Aucun utilisateur trouvé</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Affichage de {filteredUsers.length} utilisateur(s) sur {usersData.length}
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
              Précédent
            </button>
            <span className="px-3 py-2 bg-primary-600 text-white rounded-lg">1</span>
            <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
              Suivant
            </button>
          </div>
        </div>

        {/* Create User Modal Placeholder */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Nouvel Utilisateur</h3>
              <p className="text-gray-600 mb-4">
                Fonctionnalité en cours de développement. Le formulaire de création sera implémenté prochainement.
              </p>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default UsersPage