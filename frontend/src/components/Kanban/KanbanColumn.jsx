import React from 'react'
import { Droppable, Draggable } from 'react-beautiful-dnd'
import { cn } from '@/utils'
import LeadCard from '@/components/Leads/LeadCard'

function KanbanColumn({ column, leads, onLeadClick, loading }) {
  const totalValue = leads.reduce((sum, lead) =>
    sum + (lead.budget || lead.dealValue || 0), 0
  )

  return (
    <div className="flex-shrink-0 w-80">
      {/* En-tête de colonne moderne */}
      <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-5 mb-4 shadow-xl hover:shadow-2xl transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className={cn('w-4 h-4 rounded-full mr-3 shadow-lg', column.color)}></div>
            <h3 className="font-bold text-slate-800 text-lg">
              {column.title}
            </h3>
          </div>
          <span className="px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 shadow-md">
            {leads.length}
          </span>
        </div>

        {totalValue > 0 && (
          <div className="text-sm text-slate-600 bg-slate-50 rounded-lg p-2">
            <span className="font-bold text-green-600">
{totalValue.toLocaleString('fr-FR')} €
            </span>
            <span className="ml-1">total</span>
          </div>
        )}
      </div>

      {/* Zone de drop */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              'min-h-[200px] p-4 rounded-2xl transition-all duration-300 backdrop-blur-xl',
              snapshot.isDraggingOver
                ? 'bg-blue-50/80 border-2 border-dashed border-blue-300 shadow-2xl scale-105'
                : 'bg-white/50 border border-white/30',
              loading && 'opacity-50 pointer-events-none'
            )}
          >
            {/* Message si aucun lead */}
            {leads.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex flex-col items-center justify-center h-32 text-slate-400">
                <div className="text-sm font-medium text-slate-500 mb-2">Vide</div>
                <div className="text-sm font-medium">Aucun artiste dans cette étape</div>
              </div>
            )}

            {/* Liste des leads */}
            {leads.map((lead, index) => (
              <Draggable
                key={lead._id}
                draggableId={lead._id}
                index={index}
                isDragDisabled={loading}
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={cn(
                      'mb-3 transition-all duration-200',
                      snapshot.isDragging && 'rotate-3 scale-105 shadow-lg'
                    )}
                    onClick={() => onLeadClick(lead)}
                  >
                    <LeadCard
                      lead={lead}
                      isDragging={snapshot.isDragging}
                      showPlatform
                      showAssignee
                      compact
                    />
                  </div>
                )}
              </Draggable>
            ))}

            {provided.placeholder}

            {/* Indicateur de zone de drop moderne */}
            {snapshot.isDraggingOver && leads.length === 0 && (
              <div className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-blue-400 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 shadow-lg">
                <div className="text-sm font-medium text-blue-600 mb-1">Zone de dépôt</div>
                <span className="text-blue-600 text-sm font-bold">
                  Déposer l'artiste ici
                </span>
              </div>
            )}
          </div>
        )}
      </Droppable>

      {/* Statistiques de la colonne modernes */}
      <div className="mt-4 p-4 bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-slate-50 rounded-lg p-2">
            <span className="text-slate-500 text-xs">Artistes:</span>
            <div className="font-bold text-slate-800">{leads.length}</div>
          </div>
          {totalValue > 0 && (
            <div className="bg-green-50 rounded-lg p-2">
              <span className="text-green-600 text-xs">Valeur:</span>
              <div className="font-bold text-green-700">
                {(totalValue / 1000).toFixed(0)}k€
              </div>
            </div>
          )}
          {leads.length > 0 && (
            <>
              <div className="bg-blue-50 rounded-lg p-2">
                <span className="text-blue-600 text-xs">Score:</span>
                <div className="font-bold text-blue-700">
                  {Math.round(
                    leads.reduce((sum, lead) => sum + (lead.leadScore || 0), 0) / leads.length
                  )}
                </div>
              </div>
              <div className="bg-red-50 rounded-lg p-2">
                <span className="text-red-600 text-xs">Urgent:</span>
                <div className="font-bold text-red-700">
                  {leads.filter(lead => lead.priority === 'urgent').length}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default KanbanColumn