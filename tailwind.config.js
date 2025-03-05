/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'rgb(var(--color-primary))',
          light: 'rgb(var(--color-primary-light))',
        },
        secondary: {
          DEFAULT: 'rgb(var(--color-secondary))',
          light: 'rgb(var(--color-secondary-light))',
        },
        accent: {
          DEFAULT: 'rgb(var(--color-accent))',
          light: 'rgb(var(--color-accent-light))',
        },
      },
      backgroundImage: {
        'primary-gradient': 'var(--primary-gradient)',
        'secondary-gradient': 'var(--secondary-gradient)',
        'accent-gradient': 'var(--accent-gradient)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-out forwards',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
