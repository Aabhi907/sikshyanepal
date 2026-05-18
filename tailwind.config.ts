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
        display: ['var(--font-sora)',    'system-ui', 'sans-serif'],
        sans:    ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        mono:    ['var(--font-dm-mono)', 'Menlo', 'monospace'],
      },
      colors: {
        // ── Primary — deep confident blue ─────────────
        primary: {
          DEFAULT: '#1847c4',
          50:  '#eff3fe',
          100: '#dde6fd',
          200: '#bccafb',
          300: '#91a8f8',
          600: '#1340b0',
          700: '#0f2f8a',
        },
        // ── Accent — warm orange (Nepal flag energy) ──
        accent: {
          DEFAULT: '#f97316',
          50:  '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          600: '#ea6c0b',
        },
        // ── Dark sections ─────────────────────────────
        navy: '#0d1b3e',
        // ── Surfaces & cards ─────────────────────────
        card:    '#ffffff',
        surface: '#ffffff',
        // ── Text ─────────────────────────────────────
        ink: {
          DEFAULT:   '#0f1629',
          secondary: '#374151',
          muted:     '#6b7280',
        },
        // ── Borders ──────────────────────────────────
        border: {
          DEFAULT: '#e5e7eb',
          strong:  '#d1d5db',
          subtle:  '#f3f4f6',
        },
        // ── Brand alias (backward compat) ────────────
        brand: {
          DEFAULT: '#1847c4',
          light:   '#3b82f6',
          glow:    '#1340b0',
          50:      '#eff3fe',
          100:     '#dde6fd',
        },
      },
      boxShadow: {
        'card':    '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'card-md': '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
        'card-lg': '0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.04)',
        'card-xl': '0 20px 25px -5px rgb(0 0 0 / 0.10), 0 8px 10px -6px rgb(0 0 0 / 0.04)',
      },
      animation: {
        'fade-in':    'fadeIn 0.2s ease-out',
        'slide-down': 'slideDown 0.2s ease-out',
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
