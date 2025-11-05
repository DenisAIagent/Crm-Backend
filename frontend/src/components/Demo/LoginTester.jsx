import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import {
  Play,
  Pause,
  RotateCcw,
  Download,
  TestTube,
  Music,
  Zap,
  Eye,
  Settings
} from 'lucide-react'
import { useLoginDemo, useMusicAnimations } from '@/hooks/useLoginDemo'

/**
 * Composant de test et démonstration pour la page de login MDMC
 * Visible uniquement en mode développement
 */
function LoginTester({ formManager, isVisible = true }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeTest, setActiveTest] = useState(null)

  const {
    demoMode,
    demoStats,
    fillDemoCredentials,
    testValidation,
    testAnimations,
    testLoadingStates,
    getDebugInfo,
    logStats,
    resetStats,
    exportLogs,
    demoCredentials
  } = useLoginDemo()

  const {
    isPlaying,
    volume,
    toggleAnimations,
    adjustVolume,
    triggerEffect
  } = useMusicAnimations()

  // DISABLED FOR PRODUCTION - Never show in production
  if (!demoMode || !isVisible || import.meta.env.VITE_NODE_ENV === 'production') {
    return null
  }

  // Fonctions de test
  const handleFillDemo = () => {
    setActiveTest('fill')
    fillDemoCredentials(formManager)
    logStats('fill_demo_credentials', 'success')
    setTimeout(() => setActiveTest(null), 2000)
  }

  const handleTestValidation = () => {
    setActiveTest('validation')
    testValidation(formManager)
    logStats('test_validation', 'success')
    setTimeout(() => setActiveTest(null), 5000)
  }

  const handleTestAnimations = () => {
    setActiveTest('animations')
    testAnimations()
    logStats('test_animations', 'success')
    setTimeout(() => setActiveTest(null), 3000)
  }

  const handleTestLoading = () => {
    setActiveTest('loading')
    testLoadingStates((loading) => {
      // Simulation du changement d'état de chargement
      console.log('Loading state:', loading)
    })
    logStats('test_loading', 'success')
    setTimeout(() => setActiveTest(null), 8000)
  }

  const handleTriggerEffect = (effect) => {
    triggerEffect(effect)
    logStats(`trigger_${effect}`, 'success')
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${
      isExpanded ? 'w-80' : 'w-auto'
    }`}>
      {/* Bouton principal */}
      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-200 flex items-center gap-2"
        >
          <TestTube className="w-4 h-4" />
          <span className="text-sm font-medium">
            {isExpanded ? 'Fermer' : 'Outils Demo'}
          </span>
        </button>

        {/* Indicateur d'activité */}
        {activeTest && (
          <div className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium animate-pulse">
            Test en cours...
          </div>
        )}
      </div>

      {/* Panel étendu */}
      {isExpanded && (
        <div className="bg-mdmc-card border border-secondary-700 rounded-xl shadow-2xl p-4 space-y-4 backdrop-blur-sm">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Music className="w-4 h-4 text-primary-400" />
              MDMC Login Tester
            </h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-secondary-400 hover:text-white transition-colors"
            >
              ×
            </button>
          </div>

          {/* Stats rapides */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-secondary-800 rounded p-2 text-center">
              <div className="text-primary-400 font-bold">{demoStats.attempts}</div>
              <div className="text-secondary-400">Tentatives</div>
            </div>
            <div className="bg-secondary-800 rounded p-2 text-center">
              <div className="text-green-400 font-bold">{demoStats.successes}</div>
              <div className="text-secondary-400">Succès</div>
            </div>
            <div className="bg-secondary-800 rounded p-2 text-center">
              <div className="text-red-400 font-bold">{demoStats.errors}</div>
              <div className="text-secondary-400">Erreurs</div>
            </div>
          </div>

          {/* Credentials demo */}
          <div className="bg-secondary-800/50 rounded-lg p-3 border border-secondary-700">
            <h4 className="text-sm font-medium text-white mb-2">
              Identifiants Demo
            </h4>
            <div className="text-xs text-secondary-300 space-y-1">
              <div>Email: <code className="text-primary-400">{demoCredentials.email}</code></div>
              <div>Mot de passe: <code className="text-primary-400">{demoCredentials.password}</code></div>
            </div>
          </div>

          {/* Actions de test */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-white">Tests Automatiques</h4>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleFillDemo}
                disabled={activeTest === 'fill'}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-3 py-2 rounded text-xs font-medium transition-colors flex items-center gap-1"
              >
                <Zap className="w-3 h-3" />
                Remplir Auto
              </button>

              <button
                onClick={handleTestValidation}
                disabled={activeTest === 'validation'}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white px-3 py-2 rounded text-xs font-medium transition-colors flex items-center gap-1"
              >
                <Eye className="w-3 h-3" />
                Test Validation
              </button>

              <button
                onClick={handleTestAnimations}
                disabled={activeTest === 'animations'}
                className="bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white px-3 py-2 rounded text-xs font-medium transition-colors flex items-center gap-1"
              >
                <Music className="w-3 h-3" />
                Test Animations
              </button>

              <button
                onClick={handleTestLoading}
                disabled={activeTest === 'loading'}
                className="bg-orange-600 hover:bg-orange-700 disabled:bg-orange-800 text-white px-3 py-2 rounded text-xs font-medium transition-colors flex items-center gap-1"
              >
                <Settings className="w-3 h-3" />
                Test Loading
              </button>
            </div>
          </div>

          {/* Contrôles d'animation */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-white">Contrôles Musicaux</h4>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleAnimations}
                className={`px-3 py-2 rounded text-xs font-medium transition-colors flex items-center gap-1 ${
                  isPlaying
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                {isPlaying ? 'Pause' : 'Play'}
              </button>

              <div className="flex-1">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => adjustVolume(parseFloat(e.target.value))}
                  className="w-full h-2 bg-secondary-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              <span className="text-xs text-secondary-400 w-8">
                {Math.round(volume * 100)}%
              </span>
            </div>

            {/* Effets ponctuels */}
            <div className="flex gap-1">
              {['pulse', 'glow', 'bounce'].map(effect => (
                <button
                  key={effect}
                  onClick={() => handleTriggerEffect(effect)}
                  className="bg-secondary-700 hover:bg-secondary-600 text-white px-2 py-1 rounded text-xs transition-colors"
                >
                  {effect}
                </button>
              ))}
            </div>
          </div>

          {/* Actions utilitaires */}
          <div className="flex gap-2 pt-2 border-t border-secondary-700">
            <button
              onClick={resetStats}
              className="bg-secondary-700 hover:bg-secondary-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>

            <button
              onClick={exportLogs}
              className="bg-secondary-700 hover:bg-secondary-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1"
            >
              <Download className="w-3 h-3" />
              Export
            </button>

            <button
              onClick={() => console.log('Debug Info:', getDebugInfo())}
              className="bg-secondary-700 hover:bg-secondary-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
            >
              Debug
            </button>
          </div>

          {/* Statut en temps réel */}
          <div className="text-xs text-secondary-500 pt-2 border-t border-secondary-700">
            Dernier test: {demoStats.lastAttempt
              ? new Date(demoStats.lastAttempt).toLocaleTimeString()
              : 'Aucun'
            }
          </div>
        </div>
      )}

      {/* Styles pour le slider */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #e50914;
          cursor: pointer;
          box-shadow: 0 0 4px rgba(229, 9, 20, 0.5);
        }

        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #e50914;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 4px rgba(229, 9, 20, 0.5);
        }
      `}</style>
    </div>
  )
}

export default LoginTester