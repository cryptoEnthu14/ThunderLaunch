/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        thunder: {
          blue: '#0066FF',
          purple: '#8B5CF6',
        },
        lightning: {
          yellow: '#FFD700',
        },
        safety: {
          green: '#10B981',
        },
        warning: {
          orange: '#F59E0B',
        },
        danger: {
          red: '#EF4444',
        },
      },
    },
  },
  plugins: [],
}
