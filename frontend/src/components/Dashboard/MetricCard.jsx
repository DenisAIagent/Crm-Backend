import React from 'react'
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline'
import { cn } from '@/utils'

// MDMC Theme - All cards use the same black/white/red color scheme
const mdmcTheme = {
  background: 'rgba(255, 255, 255, 0.02)',
  border: 'rgba(255, 255, 255, 0.15)',
  accent: '#e50914',
  accentBg: 'rgba(229, 9, 20, 0.1)',
  text: '#ffffff',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textMuted: 'rgba(255, 255, 255, 0.5)'
}

function MetricCard({
  title,
  value,
  subtitle,
  change,
  changeType,
  icon: Icon,
  color = 'blue', // Keep for compatibility but will use MDMC theme
  realtime = false,
  onClick,
  description
}) {

  const formatChange = (change) => {
    if (typeof change === 'number') {
      return `${change > 0 ? '+' : ''}${change.toFixed(1)}%`
    }
    return change
  }

  return (
    <div
      className={cn(
        'group relative overflow-hidden',
        'rounded-2xl p-6 transition-all duration-500 ease-out border',
        'hover:scale-[1.02]',
        onClick && 'cursor-pointer',
        realtime && 'animate-pulse'
      )}
      style={{
        backgroundColor: mdmcTheme.background,
        borderColor: mdmcTheme.border
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = mdmcTheme.accent
        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = mdmcTheme.border
        e.currentTarget.style.backgroundColor = mdmcTheme.background
      }}
    >
      {/* Accent Border */}
      <div
        className="absolute top-0 left-0 right-0 h-1 transition-all duration-500 group-hover:h-2"
        style={{ backgroundColor: mdmcTheme.accent }}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3
                className="text-sm font-semibold tracking-wide uppercase"
                style={{ color: mdmcTheme.textSecondary }}
              >
                {title}
              </h3>
              {realtime && (
                <div
                  className="flex items-center gap-1 px-2 py-1 rounded-full border"
                  style={{
                    backgroundColor: mdmcTheme.accent,
                    borderColor: '#ffffff'
                  }}
                >
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  <span className="text-xs font-medium text-white">LIVE</span>
                </div>
              )}
            </div>
          </div>

          {Icon && (
            <div
              className="relative p-3 rounded-xl transition-all duration-500 border group-hover:scale-110"
              style={{
                backgroundColor: mdmcTheme.accentBg,
                borderColor: mdmcTheme.accent
              }}
            >
              <Icon
                className="h-6 w-6 transition-colors duration-300"
                style={{ color: mdmcTheme.accent }}
              />
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span
              className="text-3xl font-bold tracking-tight"
              style={{ color: mdmcTheme.text }}
            >
              {value}
            </span>
            {subtitle && (
              <span
                className="text-sm font-medium"
                style={{ color: mdmcTheme.textMuted }}
              >
                {subtitle}
              </span>
            )}
          </div>

          {change !== undefined && (
            <div className="flex items-center gap-2">
              <div
                className="flex items-center gap-1 px-2 py-1 rounded-lg border"
                style={{
                  backgroundColor: changeType === 'increase' ? mdmcTheme.accentBg : 'rgba(255, 255, 255, 0.05)',
                  borderColor: changeType === 'increase' ? mdmcTheme.accent : 'rgba(255, 255, 255, 0.2)'
                }}
              >
                {changeType === 'increase' ? (
                  <ArrowTrendingUpIcon
                    className="h-3 w-3"
                    style={{ color: mdmcTheme.accent }}
                  />
                ) : changeType === 'decrease' ? (
                  <ArrowTrendingDownIcon
                    className="h-3 w-3"
                    style={{ color: mdmcTheme.accent }}
                  />
                ) : null}

                <span
                  className="text-sm font-semibold"
                  style={{
                    color: changeType === 'increase' || changeType === 'decrease' ? mdmcTheme.accent : mdmcTheme.textSecondary
                  }}
                >
                  {formatChange(change)}
                </span>
              </div>

              <span
                className="text-xs font-medium"
                style={{ color: mdmcTheme.textMuted }}
              >
                vs période précédente
              </span>
            </div>
          )}

          {description && (
            <p
              className="text-sm"
              style={{ color: mdmcTheme.textSecondary }}
            >
              {description}
            </p>
          )}
        </div>

        {/* Bottom Accent Line */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px opacity-20"
          style={{ backgroundColor: mdmcTheme.accent }}
        />
      </div>
    </div>
  )
}

export default MetricCard