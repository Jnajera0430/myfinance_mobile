/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.tsx',
    './index.ts',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: '#f8fafc',
        card: '#ffffff',
        foreground: '#0f172a',
        primary: '#6366f1',
        'primary-foreground': '#ffffff',
        accent: '#a855f7',
        muted: '#f1f5f9',
        'muted-foreground': '#64748b',
        secondary: '#eef2ff',
        'secondary-foreground': '#312e81',
        border: '#e2e8f0',
        destructive: '#ef4444',
        income: '#22c55e',
        'expense-fixed': '#ef4444',
        'expense-variable': '#f59e0b',
      },
    },
  },
  plugins: [],
};
