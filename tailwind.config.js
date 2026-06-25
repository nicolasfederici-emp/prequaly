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
        primary: '#D0FD3E',      // Amarillo pelota de tenis
        secondary: '#16322A',    // Verde cancha oscuro (Aún más claro)
        clay: '#C2563C',         // Polvo de ladrillo
        'gray-dark': '#111E1A',  // Fondo de tarjetas oscuro
      },
      fontFamily: {
        score: ['var(--font-oswald)', 'sans-serif'],
      }
    },
  },
  plugins: [],
}