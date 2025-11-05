import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from './AuthContext'
import { useQueryClient } from 'react-query'

const SocketContext = createContext()

// Mode frontend-only : simuler les sockets avec des événements locaux
const IS_FRONTEND_ONLY = import.meta.env.VITE_FRONTEND_ONLY === 'true' || import.meta.env.VITE_ENABLE_MOCK_API === 'true'

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [notifications, setNotifications] = useState([])

  const { user, isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  const socketRef = useRef(null)
  const mockSocketRef = useRef(null)

  // Connexion/déconnexion du socket
  useEffect(() => {
    if (isAuthenticated && user && !socketRef.current) {
      if (IS_FRONTEND_ONLY) {
        connectMockSocket()
      } else {
        connectSocket()
      }
    } else if (!isAuthenticated && socketRef.current) {
      disconnectSocket()
    }

    return () => {
      if (socketRef.current) {
        disconnectSocket()
      }
    }
  }, [isAuthenticated, user])

  // Mock socket pour le mode frontend-only
  const connectMockSocket = () => {
    console.log('Mode frontend-only: Connexion socket simulée')
    setIsConnected(true)

    // Créer un objet mock socket
    const mockSocket = {
      id: 'mock-socket-' + Date.now(),
      emit: (event, data) => {
        console.log('Mock socket emit:', event, data)
      },
      on: (event, handler) => {
        console.log('Mock socket listening to:', event)
      },
      off: (event, handler) => {
        console.log('Mock socket stop listening to:', event)
      },
      disconnect: () => {
        console.log('Mock socket disconnected')
        setIsConnected(false)
      }
    }

    socketRef.current = mockSocket
    setSocket(mockSocket)

    // Simuler quelques notifications de démo
    setTimeout(() => {
      simulateMockNotifications()
    }, 2000)
  }

  const connectSocket = () => {
    // Seulement si socket.io est disponible et pas en mode frontend-only
    if (typeof io === 'undefined') {
      console.warn('Socket.IO non disponible, utilisation du mode mock')
      connectMockSocket()
      return
    }

    const serverPath = import.meta.env.VITE_API_URL || 'https://api.mdmcmusicads.com'

    try {
      const { io } = require('socket.io-client')
      socketRef.current = io(serverPath, {
        autoConnect: true,
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true
      })

      const socket = socketRef.current

      socket.on('connect', () => {
        console.log('Socket connecté:', socket.id)
        setIsConnected(true)
        setSocket(socket)

        // Rejoindre les rooms utilisateur
        if (user) {
          socket.emit('join-user-room', user.id)
          socket.emit('join-team-room', user.team)
        }
      })

      socket.on('disconnect', (reason) => {
        console.log('Socket déconnecté:', reason)
        setIsConnected(false)
      })

      socket.on('connect_error', (error) => {
        console.error('Erreur de connexion socket:', error)
        setIsConnected(false)
        // Fallback vers mock socket
        connectMockSocket()
      })

      // Événements métier
      setupBusinessEvents(socket)
    } catch (error) {
      console.error('Erreur lors de la connexion socket:', error)
      connectMockSocket()
    }
  }

  const disconnectSocket = () => {
    if (socketRef.current) {
      if (typeof socketRef.current.disconnect === 'function') {
        socketRef.current.disconnect()
      }
      socketRef.current = null
      setSocket(null)
      setIsConnected(false)
    }
  }

  // Simuler des notifications pour le mode demo
  const simulateMockNotifications = () => {
    if (!IS_FRONTEND_ONLY) return

    const mockNotifications = [
      {
        id: 'demo-1',
        type: 'new_lead',
        title: 'Nouveau lead',
        message: 'Artist Demo - Meta Ads',
        timestamp: new Date(),
        data: { platform: 'Meta Ads' }
      },
      {
        id: 'demo-2',
        type: 'campaign_updated',
        title: 'Campagne mise à jour',
        message: 'Summer Festival - Performances améliorées',
        timestamp: new Date(),
        data: { performance: '+15%' }
      }
    ]

    mockNotifications.forEach((notif, index) => {
      setTimeout(() => {
        addNotification(notif)
        toast.success(notif.message, { duration: 3000 })
      }, index * 3000)
    })
  }

  const setupBusinessEvents = (socket) => {
    // Nouveau lead assigné
    socket.on('new_lead', (lead) => {
      console.log('Nouveau lead reçu:', lead)

      // Invalider le cache des leads
      queryClient.invalidateQueries(['leads'])
      queryClient.invalidateQueries(['dashboard'])

      // Notification
      addNotification({
        id: `lead-${lead._id}`,
        type: 'new_lead',
        title: 'Nouveau lead assigné',
        message: `${lead.artistName} - ${lead.platform}`,
        timestamp: new Date(),
        data: lead
      })

      toast.success(`Nouveau lead: ${lead.artistName}`, {
        duration: 5000,
        icon: 'note'
      })
    })

    // Lead mis à jour
    socket.on('lead_updated', (lead) => {
      console.log('Lead mis à jour:', lead)

      queryClient.invalidateQueries(['leads'])
      queryClient.invalidateQueries(['lead', lead._id])
      queryClient.invalidateQueries(['dashboard'])

      addNotification({
        id: `lead-update-${lead._id}`,
        type: 'lead_updated',
        title: 'Lead mis à jour',
        message: `${lead.artistName} - Statut: ${lead.status}`,
        timestamp: new Date(),
        data: lead
      })
    })

    // Changement de statut lead
    socket.on('lead_status_changed', ({ lead, oldStatus, newStatus }) => {
      console.log('Statut lead changé:', { lead, oldStatus, newStatus })

      queryClient.invalidateQueries(['leads'])
      queryClient.invalidateQueries(['dashboard'])

      let icon = 'chart'
      if (newStatus === 'won') icon = 'celebration'
      else if (newStatus === 'lost') icon = 'lost'
      else if (newStatus === 'contacted') icon = 'phone'

      toast.success(`${lead.artistName}: ${oldStatus} → ${newStatus}`, {
        icon,
        duration: 4000
      })
    })

    // Nouvelle campagne
    socket.on('new_campaign', (campaign) => {
      console.log('Nouvelle campagne:', campaign)

      queryClient.invalidateQueries(['campaigns'])
      queryClient.invalidateQueries(['dashboard'])

      addNotification({
        id: `campaign-${campaign._id}`,
        type: 'new_campaign',
        title: 'Nouvelle campagne créée',
        message: `${campaign.name} - ${campaign.platform}`,
        timestamp: new Date(),
        data: campaign
      })

      toast.success(`Nouvelle campagne: ${campaign.name}`, {
        icon: 'rocket',
        duration: 5000
      })
    })

    // Campagne mise à jour
    socket.on('campaign_updated', (campaign) => {
      console.log('Campagne mise à jour:', campaign)

      queryClient.invalidateQueries(['campaigns'])
      queryClient.invalidateQueries(['campaign', campaign._id])
      queryClient.invalidateQueries(['dashboard'])
    })

    // KPIs mis à jour
    socket.on('campaign_kpis_updated', ({ campaign, kpis }) => {
      console.log('KPIs mis à jour:', { campaign, kpis })

      queryClient.invalidateQueries(['campaigns'])
      queryClient.invalidateQueries(['campaign', campaign._id])
      queryClient.invalidateQueries(['analytics'])

      addNotification({
        id: `kpis-${campaign._id}`,
        type: 'kpis_updated',
        title: 'Performances mises à jour',
        message: `${campaign.name} - ${kpis.views || 0} vues`,
        timestamp: new Date(),
        data: { campaign, kpis }
      })
    })

    // Objectif atteint
    socket.on('goal_achieved', ({ campaign, goal, value }) => {
      console.log('Objectif atteint:', { campaign, goal, value })

      queryClient.invalidateQueries(['campaigns'])
      queryClient.invalidateQueries(['analytics'])

      addNotification({
        id: `goal-${campaign._id}-${goal}`,
        type: 'goal_achieved',
        title: 'Objectif atteint !',
        message: `${campaign.name} - ${goal}: ${value}`,
        timestamp: new Date(),
        data: { campaign, goal, value }
      })

      toast.success(`Objectif atteint: ${goal} pour ${campaign.name}`, {
        duration: 8000
      })
    })

    // Budget épuisé
    socket.on('budget_exhausted', ({ campaign, spent, total }) => {
      console.log('Budget épuisé:', { campaign, spent, total })

      queryClient.invalidateQueries(['campaigns'])

      addNotification({
        id: `budget-${campaign._id}`,
        type: 'budget_alert',
        title: 'Budget épuisé',
        message: `${campaign.name} - ${spent}€/${total}€`,
        timestamp: new Date(),
        data: { campaign, spent, total }
      })

      toast.error(`Budget épuisé: ${campaign.name}`, {
        duration: 10000
      })
    })

    // Suivi en retard
    socket.on('follow_up_overdue', (lead) => {
      console.log('Suivi en retard:', lead)

      queryClient.invalidateQueries(['leads'])

      addNotification({
        id: `followup-${lead._id}`,
        type: 'follow_up_overdue',
        title: 'Suivi en retard',
        message: `${lead.artistName} - Suivi prévu`,
        timestamp: new Date(),
        data: lead
      })

      toast.error(`Suivi en retard: ${lead.artistName}`)
    })

    // Activité suspecte
    socket.on('security_alert', ({ type, details }) => {
      console.log('Alerte sécurité:', { type, details })

      addNotification({
        id: `security-${Date.now()}`,
        type: 'security_alert',
        title: 'Alerte sécurité',
        message: `Activité suspecte détectée: ${type}`,
        timestamp: new Date(),
        data: { type, details }
      })

      if (user?.role === 'admin') {
        toast.error(`Alerte sécurité: ${type}`, {
          duration: 10000
        })
      }
    })

    // Message du système
    socket.on('system_message', ({ title, message, type = 'info' }) => {
      console.log('Message système:', { title, message, type })

      addNotification({
        id: `system-${Date.now()}`,
        type: 'system_message',
        title: title || 'Message système',
        message,
        timestamp: new Date(),
        data: { type }
      })

      const toastFn = type === 'error' ? toast.error :
                     type === 'success' ? toast.success :
                     toast

      toastFn(message, {
        duration: type === 'error' ? 8000 : 5000
      })
    })

    // Utilisateur en ligne/hors ligne
    socket.on('user_online', (userData) => {
      console.log('Utilisateur en ligne:', userData)
      // Mettre à jour l'état des utilisateurs en ligne si nécessaire
    })

    socket.on('user_offline', (userData) => {
      console.log('Utilisateur hors ligne:', userData)
      // Mettre à jour l'état des utilisateurs en ligne si nécessaire
    })
  }

  // Ajouter une notification
  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 49)]) // Garder max 50 notifications
  }

  // Marquer notification comme lue
  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId
          ? { ...notif, read: true }
          : notif
      )
    )
  }

  // Marquer toutes comme lues
  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    )
  }

  // Supprimer notification
  const removeNotification = (notificationId) => {
    setNotifications(prev =>
      prev.filter(notif => notif.id !== notificationId)
    )
  }

  // Vider toutes les notifications
  const clearAllNotifications = () => {
    setNotifications([])
  }

  // Émettre un événement
  const emit = (event, data) => {
    if (socket && isConnected) {
      socket.emit(event, data)
    }
  }

  // S'abonner à un événement
  const on = (event, handler) => {
    if (socket) {
      socket.on(event, handler)
    }
  }

  // Se désabonner d'un événement
  const off = (event, handler) => {
    if (socket) {
      socket.off(event, handler)
    }
  }

  const value = {
    socket,
    isConnected,
    notifications,
    unreadCount: notifications.filter(n => !n.read).length,

    // Actions notifications
    addNotification,
    markNotificationAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,

    // Actions socket
    emit,
    on,
    off,

    // Connection
    connectSocket,
    disconnectSocket
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}

// Hook personnalisé
export function useSocket() {
  const context = useContext(SocketContext)

  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider')
  }

  return context
}

// Hook pour écouter un événement spécifique
export function useSocketEvent(event, handler, deps = []) {
  const { socket } = useSocket()

  useEffect(() => {
    if (socket && handler) {
      socket.on(event, handler)

      return () => {
        socket.off(event, handler)
      }
    }
  }, [socket, event, handler, ...deps])
}

export default SocketContext