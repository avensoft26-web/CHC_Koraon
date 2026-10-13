/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#0B132B',
          900: '#172554', // Primary Navy
          800: '#1E3166',
          700: '#263B73', // Secondary Navy
          600: '#3B4F82',
          500: '#526596',
          400: '#7E8CAE',
          300: '#AAB5CC',
          200: '#D5DCEB',
          100: '#EEF2F8',
          50: '#F7F8FA',  // Page Background
        },
        gold: {
          DEFAULT: '#C99732',
          dark: '#B38324',
          light: '#DEAB49',
          cream: '#FFF6E7',
          50: '#FDFBF7',
        },
        medical: {
          green: '#10B981',
          'soft-green': '#ECFDF5',
          blue: '#2563EB',
          'soft-blue': '#EFF6FF',
          amber: '#F59E0B',
          'soft-amber': '#FFFBEB',
          rose: '#F43F5E',
          'soft-rose': '#FFF1F2',
          purple: '#8B5CF6',
          'soft-purple': '#F5F3FF',
        },
        border: {
          subtle: '#E8ECF3',
          DEFAULT: '#E8ECF3',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        outfit: ['Inter', 'sans-serif'],
        space: ['"Space Grotesk"', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(23, 37, 84, 0.04), 0 1px 2px -1px rgba(23, 37, 84, 0.02)',
        'card-hover': '0 6px 16px -2px rgba(23, 37, 84, 0.07), 0 2px 6px -2px rgba(23, 37, 84, 0.04)',
      },
      borderRadius: {
        'card': '18px',
      },
      spacing: {
        '4.5': '1.125rem',
        '5.5': '1.375rem',
        '13': '3.25rem',
        '15': '3.75rem',
      }
    },
  },
  plugins: [],
}
