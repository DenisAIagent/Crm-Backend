import React, { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Music2, Volume2, Waves, Headphones, Radio } from 'lucide-react'

// Composant pour les particules musicales flottantes
function FloatingMusicNotes() {
  const [notes, setNotes] = useState([])

  useEffect(() => {
    // Génération des notes musicales flottantes
    const musicNotes = ['♪', '♫', '♬', '♩', '♭', '♯']
    const generatedNotes = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      note: musicNotes[Math.floor(Math.random() * musicNotes.length)],
      left: Math.random() * 100,
      animationDelay: Math.random() * 10,
      duration: 8 + Math.random() * 4,
      size: 0.8 + Math.random() * 0.4
    }))
    setNotes(generatedNotes)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {notes.map((note) => (
        <div
          key={note.id}
          className="absolute text-primary-500/20 font-bold select-none"
          style={{
            left: `${note.left}%`,
            bottom: '-20px',
            fontSize: `${note.size}rem`,
            animation: `float ${note.duration}s infinite linear`,
            animationDelay: `${note.animationDelay}s`,
          }}
        >
          {note.note}
        </div>
      ))}

      <style jsx="true">{`
        @keyframes float {
          from {
            transform: translateY(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          to {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}

// Composant pour l'égaliseur audio animé
function AudioEqualizer() {
  return (
    <div className="flex items-end space-x-1 opacity-40">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="w-1 bg-gradient-to-t from-primary-600 to-primary-400 rounded-full"
          style={{
            height: `${20 + Math.random() * 30}px`,
            animationName: 'equalizer',
            animationDuration: `${0.8 + Math.random() * 0.4}s`,
            animationIterationCount: 'infinite',
            animationDirection: 'alternate',
            animationTimingFunction: 'ease-in-out',
            animationDelay: `${i * 0.1}s`
          }}
        />
      ))}

      <style jsx="true">{`
        @keyframes equalizer {
          0% {
            transform: scaleY(0.3);
          }
          100% {
            transform: scaleY(1);
          }
        }
      `}</style>
    </div>
  )
}

// Composant pour les ondulations sonores
function SoundWaves() {
  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-10">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="absolute border border-primary-500 rounded-full"
          style={{
            width: `${100 + i * 50}px`,
            height: `${100 + i * 50}px`,
            top: `${-50 - i * 25}px`,
            left: `${-50 - i * 25}px`,
            animation: `ripple ${2 + i * 0.5}s infinite`,
            animationDelay: `${i * 0.5}s`
          }}
        />
      ))}

      <style jsx="true">{`
        @keyframes ripple {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}

// Composant principal AuthLayout
function AuthLayout({ children }) {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Animation d'entrée
    const timer = setTimeout(() => setIsLoaded(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      <Helmet>
        <meta name="theme-color" content="#e50914" />
        <meta name="msapplication-TileColor" content="#e50914" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </Helmet>

      <div className="min-h-screen relative overflow-hidden">
        {/* Background gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-mdmc-bg via-secondary-900 to-black" />

        {/* Gradient overlays pour depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/10 via-transparent to-primary-900/10" />

        {/* Pattern de background musical */}
        <div className="absolute inset-0 opacity-5">
          <div className="h-full w-full bg-repeat" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23e50914' fill-opacity='0.4' fill-rule='evenodd'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm-20-18c9.941 0 18 8.059 18 18s-8.059 18-18 18S-8 39.941-8 30s8.059-18 18-18z'/%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>

        {/* Éléments musicaux animés */}
        <FloatingMusicNotes />
        <SoundWaves />

        {/* Header avec branding */}
        <header className="absolute top-0 left-0 right-0 z-10 p-6">
          <div className="flex items-center justify-between">
            {/* Logo MDMC */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center shadow-lg">
                  <Music2 className="w-6 h-6 text-white" />
                </div>
                {/* Pulse effect sur le logo */}
                <div className="absolute inset-0 w-10 h-10 bg-primary-500 rounded-lg animate-ping opacity-20" />
              </div>

              <div>
                <h1 className="text-xl font-bold text-white">
                  MDMC <span className="text-primary-400">Music Ads</span>
                </h1>
                <p className="text-xs text-secondary-400">CRM Professional</p>
              </div>
            </div>

            {/* Égaliseur audio décoratif */}
            <AudioEqualizer />
          </div>
        </header>

        {/* Footer avec éléments musicaux */}
        <footer className="absolute bottom-0 left-0 right-0 z-10 p-6">
          <div className="flex items-center justify-center space-x-6 text-secondary-500 text-sm">
            <div className="flex items-center space-x-2">
              <Volume2 className="w-4 h-4" />
              <span>Studio Ready</span>
            </div>

            <div className="w-1 h-1 bg-secondary-600 rounded-full" />

            <div className="flex items-center space-x-2">
              <Headphones className="w-4 h-4" />
              <span>Pro Audio CRM</span>
            </div>

            <div className="w-1 h-1 bg-secondary-600 rounded-full" />

            <div className="flex items-center space-x-2">
              <Radio className="w-4 h-4" />
              <span>Music Marketing</span>
            </div>
          </div>
        </footer>

        {/* Navigation dots décorative */}
        <div className="absolute left-6 top-1/2 transform -translate-y-1/2 space-y-3 hidden lg:block">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === 2 ? 'bg-primary-500 scale-125' : 'bg-secondary-600'
              }`}
              style={{
                animationDelay: `${i * 0.2}s`
              }}
            />
          ))}
        </div>

        {/* Contenu principal avec animation d'entrée */}
        <main className={`relative z-20 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {children}
        </main>

        {/* Glow effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />

        {/* Mobile optimizations */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/50 to-transparent lg:hidden" />
      </div>

      {/* Styles CSS globaux pour les animations */}
      <style jsx="true" global="true">{`
        @keyframes glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(229, 9, 20, 0.3);
          }
          50% {
            box-shadow: 0 0 30px rgba(229, 9, 20, 0.6);
          }
        }

        @keyframes pulse-subtle {
          0%, 100% {
            opacity: 0.6;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes slide-in-up {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        /* Optimisations pour les appareils tactiles */
        @media (hover: hover) {
          .hover-glow:hover {
            animation: glow 2s infinite;
          }
        }

        /* Préférences de mouvement réduit */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        /* Styles pour dark mode */
        @media (prefers-color-scheme: dark) {
          :root {
            --bg-primary: #0a0a0a;
            --bg-secondary: #1a1a1a;
          }
        }
      `}</style>
    </>
  )
}

export default AuthLayout