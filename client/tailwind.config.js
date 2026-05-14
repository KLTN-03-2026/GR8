module.exports = {
  content: ["./public/index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Professional soft light green theme
        primary: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#A8E6CF', // Main soft light green
          400: '#86EFAC',
          500: '#4CAF7A', // Darker green for hover states
          600: '#2E8B5E', // Secondary darker green
          700: '#15803D',
          800: '#166534',
          900: '#14532D',
        },
        neutral: {
          50: '#FAFAFA',
          100: '#F8F9FA',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 1px 3px rgba(0, 0, 0, 0.05)',
        'card': '0 1px 3px rgba(0, 0, 0, 0.06)',
        'hover': '0 4px 12px rgba(0, 0, 0, 0.08)',
        'premium': '0 10px 40px rgba(0, 0, 0, 0.08)',
      },
      borderRadius: {
        'xl': '0.875rem',
        '2xl': '1rem',
      }
    },
  },
  plugins: [],
}