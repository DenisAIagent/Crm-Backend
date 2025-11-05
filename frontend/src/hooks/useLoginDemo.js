import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'

/**
 * Hook personnalisé pour la démonstration de la page de login
 * Fournit des utilitaires pour tester et valider les fonctionnalités
 */
export function useLoginDemo() {
  const [demoMode, setDemoMode] = useState(false)
  const [demoStats, setDemoStats] = useState({
    attempts: 0,
    successes: 0,
    errors: 0,
    lastAttempt: null
  })

  // Détecter si on est en mode demo - DISABLED FOR PRODUCTION
  useEffect(() => {
    const isDemoModeEnabled = import.meta.env.VITE_DEMO_MODE === 'true'
    setDemoMode(isDemoModeEnabled)
  }, [])

  // Fonction pour remplir automatiquement les credentials demo
  const fillDemoCredentials = (formManager) => {
    if (!formManager) {
      console.warn('FormManager not provided to fillDemoCredentials')
      return
    }

    // Animation de remplissage progressif
    formManager.setValue('email', '')
    formManager.setValue('password', '')
    formManager.clearErrors()

    // Simulation de frappe pour l'email
    const email = 'denis@mdmc.fr'
    let emailIndex = 0
    const emailInterval = setInterval(() => {
      formManager.setValue('email', email.substring(0, emailIndex + 1))
      emailIndex++
      if (emailIndex >= email.length) {
        clearInterval(emailInterval)

        // Ensuite le mot de passe après un délai
        setTimeout(() => {
          const password = 'password123'
          let passwordIndex = 0
          const passwordInterval = setInterval(() => {
            formManager.setValue('password', password.substring(0, passwordIndex + 1))
            passwordIndex++
            if (passwordIndex >= password.length) {
              clearInterval(passwordInterval)
              formManager.setValue('rememberMe', false)

              // Statistiques demo
              setDemoStats(prev => ({
                ...prev,
                attempts: prev.attempts + 1,
                lastAttempt: new Date().toISOString()
              }))
            }
          }, 50)
        }, 300)
      }
    }, 80)

    toast.success('Identifiants demo remplis automatiquement', {
      duration: 2000,
      icon: 'note'
    })
  }

  // Fonction pour tester la validation
  const testValidation = (formManager) => {
    if (!formManager) return

    const testCases = [
      { email: '', password: '', expected: 'errors' },
      { email: 'invalid', password: '', expected: 'errors' },
      { email: 'test@test.com', password: '123', expected: 'errors' },
      { email: 'denis@mdmc.fr', password: 'password123', expected: 'success' }
    ]

    let currentTest = 0

    const runNextTest = () => {
      if (currentTest >= testCases.length) {
        toast.success('Tests de validation terminés !', { icon: '✅' })
        return
      }

      const test = testCases[currentTest]
      formManager.setValue('email', test.email)
      formManager.setValue('password', test.password)

      setTimeout(() => {
        const isValid = formManager.validateForm()
        const result = isValid ? 'success' : 'errors'

        if (result === test.expected) {
          toast.success(`Test ${currentTest + 1}/4 ✅`, { duration: 1000 })
        } else {
          toast.error(`Test ${currentTest + 1}/4 ❌`, { duration: 1000 })
        }

        currentTest++
        setTimeout(runNextTest, 1200)
      }, 500)
    }

    runNextTest()
  }

  // Fonction pour tester les animations
  const testAnimations = () => {
    // Tester les égaliseurs
    const equalizers = document.querySelectorAll('.equalizer-bar')
    equalizers.forEach((bar, i) => {
      setTimeout(() => {
        bar.classList.add('equalizer-bar--active')
      }, i * 100)
    })

    // Tester les notes musicales
    setTimeout(() => {
      const event = new CustomEvent('triggerMusicNotes')
      window.dispatchEvent(event)
    }, 1000)

    toast.success('Animations musicales déclenchées !')
  }

  // Fonction pour simuler différents états de chargement
  const testLoadingStates = (setLoading) => {
    if (!setLoading) return

    const states = [
      { loading: true, message: 'Connexion en cours...', duration: 2000 },
      { loading: false, message: 'Connexion réussie !', duration: 1000 },
      { loading: true, message: 'Validation...', duration: 1500 },
      { loading: false, message: 'Terminé !', duration: 1000 }
    ]

    let currentState = 0

    const runNextState = () => {
      if (currentState >= states.length) return

      const state = states[currentState]
      setLoading(state.loading)

      if (state.message) {
        toast.loading(state.message, { duration: state.duration })
      }

      currentState++
      setTimeout(runNextState, state.duration + 200)
    }

    runNextState()
  }

  // Fonction pour obtenir des informations de debug
  const getDebugInfo = () => {
    return {
      demoMode,
      demoStats,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      touchScreen: 'ontouchstart' in window,
      onlineStatus: navigator.onLine,
      timestamp: new Date().toISOString()
    }
  }

  // Fonction pour logger les statistiques
  const logStats = (action, result) => {
    setDemoStats(prev => {
      const newStats = {
        ...prev,
        attempts: prev.attempts + 1,
        lastAttempt: new Date().toISOString()
      }

      if (result === 'success') {
        newStats.successes += 1
      } else if (result === 'error') {
        newStats.errors += 1
      }

      // Logger en console pour debug
      console.group('MDMC Login Demo Stats')
      console.log('Action:', action)
      console.log('Result:', result)
      console.log('Stats:', newStats)
      console.log('Debug Info:', getDebugInfo())
      console.groupEnd()

      return newStats
    })
  }

  // Fonction pour reset les stats
  const resetStats = () => {
    setDemoStats({
      attempts: 0,
      successes: 0,
      errors: 0,
      lastAttempt: null
    })
    toast.success('Statistiques remises à zéro')
  }

  // Fonction pour exporter les logs
  const exportLogs = () => {
    const logs = {
      demoStats,
      debugInfo: getDebugInfo(),
      exportedAt: new Date().toISOString()
    }

    const dataStr = JSON.stringify(logs, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })

    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `mdmc-login-demo-logs-${Date.now()}.json`
    link.click()

    URL.revokeObjectURL(url)
    toast.success('Logs exportés !')
  }

  return {
    // État
    demoMode,
    demoStats,

    // Actions de test
    fillDemoCredentials,
    testValidation,
    testAnimations,
    testLoadingStates,

    // Utilitaires
    getDebugInfo,
    logStats,
    resetStats,
    exportLogs,

    // Credentials demo
    demoCredentials: {
      email: 'denis@mdmc.fr',
      password: 'password123'
    }
  }
}

/**
 * Hook pour les animations musicales interactives
 */
export function useMusicAnimations() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.7)

  // Démarrer/arrêter les animations
  const toggleAnimations = () => {
    setIsPlaying(prev => !prev)

    const equalizers = document.querySelectorAll('.equalizer-bar')
    const musicNotes = document.querySelectorAll('.musical-note')

    if (!isPlaying) {
      // Démarrer les animations
      equalizers.forEach(bar => bar.classList.add('equalizer-bar--active'))
      musicNotes.forEach(note => note.style.animationPlayState = 'running')
      toast.success('Animations musicales activées')
    } else {
      // Arrêter les animations
      equalizers.forEach(bar => bar.classList.remove('equalizer-bar--active'))
      musicNotes.forEach(note => note.style.animationPlayState = 'paused')
      toast.success('Animations musicales pausées')
    }
  }

  // Ajuster le volume des animations
  const adjustVolume = (newVolume) => {
    setVolume(Math.max(0, Math.min(1, newVolume)))

    const animatedElements = document.querySelectorAll('[class*="musical"]')
    animatedElements.forEach(el => {
      el.style.opacity = newVolume
    })
  }

  // Déclencher un effet musical ponctuel
  const triggerEffect = (effectType = 'pulse') => {
    const logo = document.querySelector('[class*="logo"]')
    if (logo) {
      logo.classList.add(`musical-${effectType}`)
      setTimeout(() => {
        logo.classList.remove(`musical-${effectType}`)
      }, 2000)
    }
  }

  return {
    isPlaying,
    volume,
    toggleAnimations,
    adjustVolume,
    triggerEffect
  }
}

export default useLoginDemo