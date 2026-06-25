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
        primary: 'var(--theme-primary, #D0FD3E)',      // Amarillo pelota de tenis
        secondary: 'var(--theme-secondary, #081411)',  // Verde cancha oscuro
        clay: 'var(--theme-clay, #C2563C)',            // Polvo de ladrillo
        'gray-dark': 'var(--theme-gray-dark, #111E1A)',// Fondo de tarjetas oscuro
        'theme-text': 'var(--theme-text, #ffffff)',    // Color de texto general
      },
      fontFamily: {
        score: ['var(--font-oswald)', 'sans-serif'],
      }
    },
  },
  plugins: [],
}