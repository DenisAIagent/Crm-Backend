import React, { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext()

const THEME_KEY = 'mdmc-crm-theme'
const THEMES = {
  light: {
    name: 'light',
    label: 'Clair',
    class: ''
  },
  dark: {
    name: 'dark',
    label: 'Sombre',
    class: 'dark'
  },
  system: {
    name: 'system',
    label: 'Système',
    class: ''
  }
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // Récupérer le thème sauvegardé ou utiliser 'system' par défaut
    const saved = localStorage.getItem(THEME_KEY)
    return saved && THEMES[saved] ? saved : 'system'
  })

  const [actualTheme, setActualTheme] = useState('light')

  // Détecter le thème système
  const getSystemTheme = () => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  // Appliquer le thème
  const applyTheme = (themeName) => {
    const root = document.documentElement

    // Supprimer toutes les classes de thème
    Object.values(THEMES).forEach(t => {
      if (t.class) {
        root.classList.remove(t.class)
      }
    })

    let effectiveTheme = themeName

    // Si c'est le thème système, détecter le thème actuel
    if (themeName === 'system') {
      effectiveTheme = getSystemTheme()
    }

    // Appliquer la classe du thème
    if (THEMES[effectiveTheme]?.class) {
      root.classList.add(THEMES[effectiveTheme].class)
    }

    setActualTheme(effectiveTheme)

    // Mettre à jour la meta theme-color
    const themeColorMeta = document.querySelector('meta[name="theme-color"]')
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', effectiveTheme === 'dark' ? '#0f172a' : '#ffffff')
    }
  }

  // Écouter les changements du thème système
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system')
      }
    }

    mediaQuery.addListener(handleChange)
    return () => mediaQuery.removeListener(handleChange)
  }, [theme])

  // Appliquer le thème au montage et aux changements
  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  // Changer le thème
  const changeTheme = (newTheme) => {
    if (THEMES[newTheme]) {
      setTheme(newTheme)
      localStorage.setItem(THEME_KEY, newTheme)
    }
  }

  // Basculer entre clair et sombre
  const toggleTheme = () => {
    if (theme === 'light') {
      changeTheme('dark')
    } else if (theme === 'dark') {
      changeTheme('light')
    } else {
      // Si système, basculer vers l'inverse du thème actuel
      changeTheme(actualTheme === 'light' ? 'dark' : 'light')
    }
  }

  // Vérifier si le thème est sombre
  const isDark = actualTheme === 'dark'

  const value = {
    theme,
    actualTheme,
    isDark,
    themes: THEMES,
    changeTheme,
    toggleTheme
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

// Hook personnalisé
export function useTheme() {
  const context = useContext(ThemeContext)

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }

  return context
}

// Hook pour les styles adaptés au thème
export function useThemeStyles() {
  const { isDark } = useTheme()

  return {
    // Classes communes
    bg: isDark ? 'bg-secondary-900' : 'bg-white',
    bgSecondary: isDark ? 'bg-secondary-800' : 'bg-secondary-50',
    text: isDark ? 'text-secondary-100' : 'text-secondary-900',
    textSecondary: isDark ? 'text-secondary-300' : 'text-secondary-600',
    border: isDark ? 'border-secondary-700' : 'border-secondary-200',

    // Cartes
    card: isDark ? 'bg-secondary-800 border-secondary-700' : 'bg-white border-secondary-200',
    cardHover: isDark ? 'hover:bg-secondary-700' : 'hover:bg-secondary-50',

    // Inputs
    input: isDark
      ? 'bg-secondary-800 border-secondary-600 text-secondary-100 focus:border-primary-400'
      : 'bg-white border-secondary-300 text-secondary-900 focus:border-primary-500',

    // Boutons
    btnSecondary: isDark
      ? 'bg-secondary-700 text-secondary-200 hover:bg-secondary-600'
      : 'bg-secondary-100 text-secondary-900 hover:bg-secondary-200',

    // Navigation
    sidebar: isDark ? 'bg-secondary-900 border-secondary-700' : 'bg-white border-secondary-200',
    navItem: isDark
      ? 'text-secondary-300 hover:bg-secondary-800 hover:text-secondary-100'
      : 'text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900',
    navItemActive: isDark
      ? 'bg-primary-900 text-primary-100'
      : 'bg-primary-100 text-primary-800',

    // Tables
    tableHeader: isDark ? 'bg-secondary-800' : 'bg-secondary-50',
    tableRow: isDark ? 'hover:bg-secondary-800' : 'hover:bg-secondary-50',

    // Modals
    modalOverlay: 'bg-black bg-opacity-50',
    modalContent: isDark ? 'bg-secondary-800' : 'bg-white',

    // Shadows (adaptées au thème)
    shadow: isDark ? 'shadow-2xl' : 'shadow-soft',
    shadowMedium: isDark ? 'shadow-2xl' : 'shadow-medium',
    shadowStrong: isDark ? 'shadow-2xl' : 'shadow-strong'
  }
}

export default ThemeContext