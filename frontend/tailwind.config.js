/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // MDMC Music Brand Colors - Palette moderne pour l'industrie musicale
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9', // Bleu principal - évoque les ondes sonores
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49'
        },

        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b', // Gris moderne
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617'
        },

        accent: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308', // Jaune doré - évoque les disques d'or
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
          950: '#422006'
        },


        // Status Colors optimisés CRM
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e', // Campagnes réussies
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d'
        },

        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b', // Alertes performance
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f'
        },

        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444', // Erreurs/échecs campagne
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d'
        },

        // Platform Colors (codes universels)
        platforms: {
          youtube: '#FF0000',
          meta: '#1877F2',
          facebook: '#1877F2',
          instagram: '#E4405F',
          tiktok: '#000000',
          spotify: '#1DB954',
          apple: '#000000',
          soundcloud: '#FF5500',
          bandcamp: '#629AA0',
          deezer: '#FEAA2D',
          twitter: '#1DA1F2',
          linkedin: '#0077B5'
        },

        // Couleurs spécifiques MDMC Music
        mdmc: {
          bg: '#0a0a0f',        // Background principal MDMC - légèrement bleuté
          card: '#0f0f1a',      // Cards sections MDMC - ton musical
          cardAlt: '#141420',   // Cards alternatives MDMC
          cardHover: '#1a1a2e', // Cards hover MDMC
          border: '#2d2d3a',    // Bordures MDMC - plus subtiles
          text: '#ffffff',      // Texte principal MDMC
          textSecondary: '#a0a0b8', // Texte secondaire MDMC - légèrement violet
          purple: '#8b5cf6',    // Violet signature MDMC Music
          purpleHover: '#a78bfa',  // Violet hover MDMC
          purpleDark: '#7c3aed',   // Violet foncé MDMC
          overlay: 'rgba(10, 10, 15, 0.85)' // Overlay MDMC
        },

        // Couleurs spécifiques à l'industrie musicale
        music: {
          vinyl: '#1a1a1a',     // Noir vinyle
          gold: '#ffd700',      // Or pour les certifications
          platinum: '#e5e4e2',  // Platine pour les certifications
          diamond: '#b9f2ff',   // Diamant pour les certifications
          studio: '#2d2d3a',    // Couleur studio d'enregistrement
          neon: '#00ffff',      // Néon clubbing
          bass: '#4c1d95',      // Violet profond pour les basses
          treble: '#fbbf24',    // Jaune pour les aigus
          rhythm: '#ef4444'     // Rouge pour le rythme
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'display': ['Outfit', 'Inter', 'sans-serif'], // Titres/headers
        'mono': ['JetBrains Mono', 'Fira Code', 'monospace'] // Code/données techniques
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'bounce-subtle': 'bounceSubtle 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'wave': 'wave 2s ease-in-out infinite',
        'vinyl-spin': 'vinylSpin 3s linear infinite',
        'beat': 'beat 1s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' }
        },
        wave: {
          '0%, 100%': { transform: 'scaleY(1)' },
          '50%': { transform: 'scaleY(1.5)' }
        },
        vinylSpin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        },
        beat: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        }
      },
      boxShadow: {
        'soft': '0 2px 15px 0 rgba(0, 0, 0, 0.1)',
        'medium': '0 4px 25px 0 rgba(0, 0, 0, 0.15)',
        'strong': '0 8px 40px 0 rgba(0, 0, 0, 0.2)',
        'glow': '0 0 20px rgba(139, 92, 246, 0.3)',
        'glow-blue': '0 0 20px rgba(14, 165, 233, 0.3)',
        'glow-purple': '0 0 20px rgba(168, 85, 247, 0.4)',
        'glow-gold': '0 0 20px rgba(234, 179, 8, 0.3)',
        'neon': '0 0 5px theme(colors.music.neon), 0 0 10px theme(colors.music.neon), 0 0 15px theme(colors.music.neon)'
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '100': '25rem',
        '128': '32rem'
      }
    },
  },
  plugins: [],
}