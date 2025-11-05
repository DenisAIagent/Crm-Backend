import React from 'react'
import {
  UserIcon,
  CurrencyEuroIcon,
  CalendarIcon,
  PhoneIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  FireIcon,
  ClockIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import { cn } from '@/utils'

const platformColors = {
  youtube: 'bg-red-100 text-red-800',
  spotify: 'bg-green-100 text-green-800',
  meta: 'bg-blue-100 text-blue-800',
  tiktok: 'bg-pink-100 text-pink-800',
  google: 'bg-yellow-100 text-yellow-800'
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800'
}

const qualityIcons = {
  cold: ClockIcon,
  warm: StarIcon,
  hot: FireIcon
}

const qualityColors = {
  cold: 'text-gray-500',
  warm: 'text-yellow-500',
  hot: 'text-red-500'
}

function LeadCard({
  lead,
  isDragging = false,
  showPlatform = false,
  showAssignee = false,
  compact = false,
  onClick
}) {
  const QualityIcon = qualityIcons[lead.quality] || ClockIcon

  // Calculer l'âge du lead
  const leadAge = Math.floor(
    (Date.now() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  )

  // Vérifier si le follow-up est en retard
  const isOverdue = lead.nextFollowUp && new Date(lead.nextFollowUp) < new Date()

  // Formatage de la date de dernier contact
  const formatLastContact = (date) => {
    if (!date) return 'Jamais contacté'
    const days = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Aujourd\'hui'
    if (days === 1) return 'Hier'
    return `Il y a ${days} jours`
  }

  return (
    <div
      className={cn(
        'bg-white rounded-lg border border-gray-200 p-4 cursor-pointer transition-all duration-200',
        'hover:shadow-md hover:border-gray-300',
        isDragging && 'shadow-xl border-blue-300 bg-blue-50',
        compact && 'p-3'
      )}
      onClick={onClick}
    >
      {/* En-tête avec nom d'artiste et qualité */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h4 className={cn(
            'font-semibold text-gray-900 truncate',
            compact ? 'text-sm' : 'text-base'
          )}>
            {lead.artistName}
          </h4>
          {lead.genre && (
            <p className="text-xs text-gray-500 truncate">
              {lead.genre}
            </p>
          )}
        </div>

        <div className="flex items-center space-x-1 ml-2">
          {/* Indicateur de qualité */}
          <QualityIcon className={cn(
            'h-4 w-4',
            qualityColors[lead.quality]
          )} />

          {/* Score du lead */}
          {lead.leadScore > 0 && (
            <span className={cn(
              'px-2 py-1 text-xs font-medium rounded-full',
              lead.leadScore >= 80 ? 'bg-green-100 text-green-800' :
              lead.leadScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            )}>
              {lead.leadScore}
            </span>
          )}
        </div>
      </div>

      {/* Plateforme et priorité */}
      <div className="flex items-center justify-between mb-3">
        {showPlatform && (
          <span className={cn(
            'px-2 py-1 text-xs font-medium rounded-full capitalize',
            platformColors[lead.platform] || 'bg-gray-100 text-gray-800'
          )}>
            {lead.platform}
          </span>
        )}

        {lead.priority && lead.priority !== 'medium' && (
          <span className={cn(
            'px-2 py-1 text-xs font-medium rounded-full capitalize',
            priorityColors[lead.priority]
          )}>
            {lead.priority === 'urgent' ? 'Urgent' :
             lead.priority === 'high' ? 'Élevée' :
             lead.priority === 'low' ? 'Faible' : lead.priority}
          </span>
        )}
      </div>

      {/* Budget et valeur */}
      {(lead.budget || lead.dealValue) && (
        <div className="flex items-center mb-2">
          <CurrencyEuroIcon className="h-4 w-4 text-gray-400 mr-1" />
          <span className="text-sm text-gray-700">
            {lead.dealValue
              ? `${lead.dealValue.toLocaleString('fr-FR')} €`
              : `${(lead.budget || 0).toLocaleString('fr-FR')} € budget`
            }
          </span>
        </div>
      )}

      {/* Informations de contact */}
      {!compact && (
        <div className="space-y-1 mb-3">
          {lead.email && (
            <div className="flex items-center text-xs text-gray-600">
              <EnvelopeIcon className="h-3 w-3 mr-1" />
              <span className="truncate">{lead.email}</span>
            </div>
          )}
          {lead.phone && (
            <div className="flex items-center text-xs text-gray-600">
              <PhoneIcon className="h-3 w-3 mr-1" />
              <span className="truncate">{lead.phone}</span>
            </div>
          )}
        </div>
      )}

      {/* Métriques musicales */}
      {(lead.monthlyListeners || lead.totalStreams) && (
        <div className="flex items-center justify-between mb-3 text-xs text-gray-600">
          {lead.monthlyListeners && (
            <div>
              <span className="font-medium">
                {lead.monthlyListeners.toLocaleString('fr-FR')}
              </span>
              <span className="ml-1">auditeurs/mois</span>
            </div>
          )}
          {lead.totalStreams && (
            <div>
              <span className="font-medium">
                {(lead.totalStreams / 1000000).toFixed(1)}M
              </span>
              <span className="ml-1">streams</span>
            </div>
          )}
        </div>
      )}

      {/* Assigné et dernière activité */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        {showAssignee && lead.assignedTo && (
          <div className="flex items-center">
            <UserIcon className="h-3 w-3 mr-1" />
            <span className="truncate">
              {lead.assignedTo.firstName} {lead.assignedTo.lastName}
            </span>
          </div>
        )}

        <div className="flex items-center">
          <CalendarIcon className="h-3 w-3 mr-1" />
          <span>{formatLastContact(lead.lastContactDate)}</span>
        </div>
      </div>

      {/* Alertes et indicateurs */}
      <div className="flex items-center justify-between mt-3">
        <div className="flex space-x-2">
          {/* Follow-up en retard */}
          {isOverdue && (
            <div className="flex items-center text-red-600">
              <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
              <span className="text-xs font-medium">En retard</span>
            </div>
          )}

          {/* Lead ancien */}
          {leadAge > 30 && !isOverdue && (
            <div className="flex items-center text-orange-600">
              <ClockIcon className="h-4 w-4 mr-1" />
              <span className="text-xs">{leadAge}j</span>
            </div>
          )}
        </div>

        {/* Nombre de notes/follow-ups */}
        {(lead.notes?.length > 0 || lead.followUps?.length > 0) && (
          <div className="flex space-x-2 text-xs text-gray-500">
            {lead.notes?.length > 0 && (
              <span>{lead.notes.length} note{lead.notes.length > 1 ? 's' : ''}</span>
            )}
            {lead.followUps?.length > 0 && (
              <span>{lead.followUps.length} suivi{lead.followUps.length > 1 ? 's' : ''}</span>
            )}
          </div>
        )}
      </div>

      {/* Prochaine action */}
      {lead.nextFollowUp && !isOverdue && (
        <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
          <div className="flex items-center text-blue-700">
            <CalendarIcon className="h-3 w-3 mr-1" />
            <span>
              Prochaine action: {new Date(lead.nextFollowUp).toLocaleDateString('fr-FR')}
            </span>
          </div>
          {lead.nextFollowUpType && (
            <span className="text-blue-600 font-medium capitalize">
              {lead.nextFollowUpType}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export default LeadCard