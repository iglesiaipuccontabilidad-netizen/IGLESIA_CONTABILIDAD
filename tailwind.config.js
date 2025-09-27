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
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        'azul-oscuro': 'var(--azul-oscuro)',
        'azul-medio': 'var(--azul-medio)',
        'celeste-claro': 'var(--celeste-claro)',
        'amarillo': 'var(--amarillo)',
        'verde-success': 'var(--verde-success)',
        'rojo-warning': 'var(--rojo-warning)',
        'blanco': 'var(--blanco)',
        'gris-claro': 'var(--gris-claro)'
      },
      width: {
        'sidebar': '280px',
        'sidebar-collapsed': '80px',
      },
      fontFamily: {
        sans: ['var(--font-sans)']
      }
    },
  },
  plugins: [],
}