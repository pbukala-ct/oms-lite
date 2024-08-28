module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"

  ],
  theme: {
    extend: {
      animation: {
        'fade-in-down': 'fadeInDown 0.5s ease-out',
      },
      zIndex: {
        '100': '100',
        'max': '9999',
      },
      keyframes: {
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
        fontSize: {
          '2xs': '0.525rem',  // 10px
        },
      colors: {
        'ct-blue': '#6359ff',
        'ct-blue-dark': '#6359ff',
        'ct-blue-light': '#e8f9f7',
        'ct-green': '#20AD92', 
      },
    },
  },
  variants: {
    extend: {
      backgroundColor: ['active'],
      textColor: ['active'],
    },
  },
  // corePlugins: {
  //   preflight: false, // This prevents Tailwind from resetting PrimeReact styles
  // },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.scrollbar-hide': {
          /* IE and Edge */
          '-ms-overflow-style': 'none',
          /* Firefox */
          'scrollbar-width': 'none',
          /* Safari and Chrome */
          '&::-webkit-scrollbar': {
            display: 'none'
          }
        }
      }
      addUtilities(newUtilities);
    }
  ],
}