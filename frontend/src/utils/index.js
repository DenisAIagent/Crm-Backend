import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const formatDate = (dateString, options = {}) => {
  const date = new Date(dateString)
  const defaultOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...options
  }
  return date.toLocaleDateString('fr-FR', defaultOptions)
}

export const formatCurrency = (amount, currency = 'EUR') => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0
  }).format(amount)
}

export const formatNumber = (number) => {
  return new Intl.NumberFormat('fr-FR').format(number)
}

export const getInitials = (name) => {
  if (!name) return ''
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export const truncateText = (text, length = 100) => {
  if (!text || text.length <= length) return text
  return text.slice(0, length) + '...'
}