/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Core surfaces
        bg: {
          DEFAULT: 'var(--bg-0)',
          nav:     'var(--bg-1)',
          surface: 'var(--bg-2)',
        },
        // Accent system
        accent: {
          DEFAULT: 'var(--accent)',
          muted:   'var(--accent-muted)',
        },
        // Text system
        ink: {
          DEFAULT: 'var(--text-primary)',
          muted:   'var(--text-secondary)',
          accent:  'var(--text-accent)',
        },
        // Border
        line: {
          DEFAULT: 'var(--border)',
        },
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        body:    ['Inter', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        xs:   ['11px', { lineHeight: '1.5' }],
        sm:   ['13px', { lineHeight: '1.6' }],
        base: ['16px', { lineHeight: '1.75' }],
        lg:   ['20px', { lineHeight: '1.5' }],
        xl:   ['28px', { lineHeight: '1.2' }],
        '2xl':['40px', { lineHeight: '1.1' }],
        '3xl':['clamp(48px, 8vw, 80px)', { lineHeight: '1.05' }],
      },
      borderRadius: {
        sm:  '4px',
        DEFAULT: '6px',
        md:  '8px',
        lg:  '12px',
        xl:  '16px',
        full: '9999px',
      },
      transitionDuration: {
        fast: '120ms',
        DEFAULT: '200ms',
        slow: '350ms',
      },
    },
  },
  plugins: [],
};
