import React from 'react'

function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  type = 'button',
  onClick,
  ...props
}) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return `
          bg-accent-600 text-white border-accent-600
          hover:bg-accent-700 hover:border-accent-700
          focus:ring-accent-500
          disabled:bg-accent-300 disabled:border-accent-300
        `
      case 'secondary':
        return `
          bg-white text-accent-600 border-accent-600
          hover:bg-accent-50 hover:border-accent-700 hover:text-accent-700
          focus:ring-accent-500
          disabled:bg-gray-50 disabled:text-gray-400 disabled:border-gray-200
        `
      case 'outline':
        return `
          bg-white text-gray-700 border-gray-300
          hover:bg-gray-50 hover:border-gray-400
          focus:ring-gray-500
          disabled:bg-gray-50 disabled:text-gray-400 disabled:border-gray-200
        `
      case 'ghost':
        return `
          bg-transparent text-gray-700 border-transparent
          hover:bg-gray-50
          focus:ring-gray-500
          disabled:text-gray-400
        `
      case 'danger':
        return `
          bg-red-600 text-white border-red-600
          hover:bg-red-700 hover:border-red-700
          focus:ring-red-500
          disabled:bg-red-300 disabled:border-red-300
        `
      case 'success':
        return `
          bg-green-600 text-white border-green-600
          hover:bg-green-700 hover:border-green-700
          focus:ring-green-500
          disabled:bg-green-300 disabled:border-green-300
        `
      case 'warning':
        return `
          bg-yellow-600 text-white border-yellow-600
          hover:bg-yellow-700 hover:border-yellow-700
          focus:ring-yellow-500
          disabled:bg-yellow-300 disabled:border-yellow-300
        `
      default:
        return getVariantClasses('primary')
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'xs':
        return 'px-2 py-1 text-xs'
      case 'sm':
        return 'px-3 py-1.5 text-sm'
      case 'lg':
        return 'px-6 py-3 text-lg'
      case 'xl':
        return 'px-8 py-4 text-xl'
      default: // md
        return 'px-4 py-2 text-sm'
    }
  }

  const getIconSize = () => {
    switch (size) {
      case 'xs':
        return 'w-3 h-3'
      case 'sm':
        return 'w-4 h-4'
      case 'lg':
        return 'w-6 h-6'
      case 'xl':
        return 'w-7 h-7'
      default: // md
        return 'w-5 h-5'
    }
  }

  const baseClasses = `
    inline-flex items-center justify-center
    font-medium rounded-lg border
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:cursor-not-allowed disabled:opacity-50
    ${fullWidth ? 'w-full' : ''}
  `

  const variantClasses = getVariantClasses()
  const sizeClasses = getSizeClasses()
  const iconSizeClasses = getIconSize()

  const handleClick = (e) => {
    if (!disabled && !loading && onClick) {
      onClick(e)
    }
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={handleClick}
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
      {...props}
    >
      {loading && (
        <svg
          className={`animate-spin ${iconSizeClasses} ${iconPosition === 'right' && children ? 'ml-2' : iconPosition === 'left' && children ? 'mr-2' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}

      {!loading && Icon && iconPosition === 'left' && (
        <Icon className={`${iconSizeClasses} ${children ? 'mr-2' : ''}`} />
      )}

      {children}

      {!loading && Icon && iconPosition === 'right' && (
        <Icon className={`${iconSizeClasses} ${children ? 'ml-2' : ''}`} />
      )}
    </button>
  )
}

// Composants spécialisés pour des cas d'usage courants
export function PrimaryButton({ children, ...props }) {
  return (
    <Button variant="primary" {...props}>
      {children}
    </Button>
  )
}

export function SecondaryButton({ children, ...props }) {
  return (
    <Button variant="secondary" {...props}>
      {children}
    </Button>
  )
}

export function DangerButton({ children, ...props }) {
  return (
    <Button variant="danger" {...props}>
      {children}
    </Button>
  )
}

export function SuccessButton({ children, ...props }) {
  return (
    <Button variant="success" {...props}>
      {children}
    </Button>
  )
}

export function OutlineButton({ children, ...props }) {
  return (
    <Button variant="outline" {...props}>
      {children}
    </Button>
  )
}

export function GhostButton({ children, ...props }) {
  return (
    <Button variant="ghost" {...props}>
      {children}
    </Button>
  )
}

// Boutons avec icônes couramment utilisés
export function AddButton({ children = 'Ajouter', ...props }) {
  return (
    <Button
      variant="primary"
      icon={({ className }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      )}
      {...props}
    >
      {children}
    </Button>
  )
}

export function EditButton({ children = 'Modifier', ...props }) {
  return (
    <Button
      variant="outline"
      icon={({ className }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      )}
      {...props}
    >
      {children}
    </Button>
  )
}

export function DeleteButton({ children = 'Supprimer', ...props }) {
  return (
    <Button
      variant="danger"
      icon={({ className }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      )}
      {...props}
    >
      {children}
    </Button>
  )
}

export function SaveButton({ children = 'Enregistrer', loading, ...props }) {
  return (
    <Button
      variant="success"
      loading={loading}
      icon={!loading ? ({ className }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3-7-3m0 0l3-3m-3 3h12" />
        </svg>
      ) : undefined}
      {...props}
    >
      {children}
    </Button>
  )
}

export function CancelButton({ children = 'Annuler', ...props }) {
  return (
    <Button
      variant="ghost"
      icon={({ className }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
      {...props}
    >
      {children}
    </Button>
  )
}

export default Button