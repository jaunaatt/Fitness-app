/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          deep:  '#0D0D0F',
          panel: '#141418',
          card:  '#1A1A20',
          elevated: '#212128',
        },
        accent: {
          blue:  '#3D6EFF',
          green: '#39FF14',
          ember: '#FF6B1A',
          gold:  '#FFD23D',
          silver:'#C7CBD1',
          bronze:'#CD8A4F',
        },
        text: {
          muted: '#9A9AA2',
          dim:   '#8A8A92',
          faint: '#6B6B73',
        },
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body:    ['Inter', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow-blue':   '0 0 24px rgba(61, 110, 255, 0.35)',
        'glow-green':  '0 0 28px rgba(57, 255, 20, 0.45)',
        'glow-ember':  '0 0 20px rgba(255, 107, 26, 0.35)',
        'glow-gold':   '0 0 20px rgba(255, 210, 61, 0.35)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
    },
  },
  plugins: [],
};
