/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg-primary)',
        'bg-2': 'var(--bg-secondary)',
        card: 'var(--bg-card)',
        'card-hover': 'var(--bg-card-hover)',
        purple: 'var(--neon-purple)',
        blue: 'var(--neon-blue)',
        pink: 'var(--neon-pink)',
        gold: 'var(--neon-gold)',
        green: 'var(--neon-green)',
        border: 'var(--border-dim)',
        'border-glow': 'var(--border-glow)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)'
      }
    },
  },
  plugins: [],
}
