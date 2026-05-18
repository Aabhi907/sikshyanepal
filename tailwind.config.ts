import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
        sans:    ['var(--font-jakarta)',  'system-ui', 'sans-serif'],
        mono:    ['var(--font-jetbrains)','Menlo', 'monospace'],
      },
      colors: {
        navy: {
          DEFAULT: '#0a0f1e',
          800:     '#111827',
          700:     '#1f2937',
          600:     '#374151',
        },
        brand: {
          DEFAULT: '#2563eb',
          light:   '#3b82f6',
          glow:    '#1d4ed8',
          50:      '#eff6ff',
          100:     '#dbeafe',
        },
        gold:    '#f59e0b',
        surface: '#f8fafc',
        card:    '#ffffff',
        border:  {
          DEFAULT: '#e2e8f0',
          strong:  '#cbd5e1',
          subtle:  '#f1f5f9',
        },
        ink: {
          DEFAULT:   '#0f172a',
          secondary: '#475569',
          muted:     '#94a3b8',
        },
      },
      boxShadow: {
        'card':    '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'card-md': '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
        'card-lg': '0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.04)',
        'card-xl': '0 20px 25px -5px rgb(0 0 0 / 0.1),  0 8px 10px -6px rgb(0 0 0 / 0.04)',
      },
      animation: {
        'fade-in':   'fadeIn 0.2s ease-out',
        'slide-down':'slideDown 0.2s ease-out',
      },
      keyframes: {
        fadeIn:    { '0%': { opacity: '0' },        '100%': { opacity: '1' } },
        slideDown: { '0%': { opacity: '0', transform: 'translateY(-8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
export default config
