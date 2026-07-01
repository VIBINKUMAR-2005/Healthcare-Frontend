/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        secondary: {
          50:  '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
        surface: {
          DEFAULT: '#f8fafc',
          card:    '#ffffff',
          border:  '#e2e8f0',
          muted:   '#f1f5f9',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        // Cards float cleanly over the gradient bg
        card:        '0 1px 3px rgba(15,118,110,0.05), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover':'0 8px 24px rgba(13,148,136,0.13), 0 2px 8px rgba(0,0,0,0.06)',
        'card-stat': '0 2px 8px rgba(13,148,136,0.08), 0 1px 3px rgba(0,0,0,0.05)',
        sidebar:     '2px 0 16px rgba(13,148,136,0.10)',
        header:      '0 1px 0 #e2e8f0, 0 2px 8px rgba(0,0,0,0.03)',
      },
      backgroundImage: {
        // The main dashboard canvas
        'dashboard': 'radial-gradient(ellipse at 70% 0%, rgba(6,182,212,0.07) 0%, transparent 60%), linear-gradient(135deg, #f1f5f9 0%, #f8fafc 40%, #ecfeff 100%)',
        // Subtle inner glow for stat cards
        'card-teal':  'linear-gradient(135deg, #f0fdfa 0%, #ffffff 100%)',
        'card-cyan':  'linear-gradient(135deg, #ecfeff 0%, #ffffff 100%)',
        'card-green': 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)',
        'card-amber': 'linear-gradient(135deg, #fffbeb 0%, #ffffff 100%)',
        'card-purple':'linear-gradient(135deg, #faf5ff 0%, #ffffff 100%)',
        'card-rose':  'linear-gradient(135deg, #fff1f2 0%, #ffffff 100%)',
      },
      borderRadius: {
        xl:   '0.875rem',
        '2xl':'1.25rem',
        '3xl':'1.5rem',
      },
    },
  },
  plugins: [],
};
