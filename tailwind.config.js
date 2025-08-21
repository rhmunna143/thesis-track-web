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
        primary: '#3B82F6',
        secondary: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
        info: '#06B6D4',
        dark: '#1F2937',
        light: '#F9FAFB',
        PrimaryBlue: '#036',
        SecondaryBlue: '#005580',
        AccentYellow: '#F7C948',
        SuccessGreen: '#2ECC71',
        Gray: '#F4F6F9',
        WarningYellow: '#F1C40F',
        ErrorRed: '#E74C3C',
        DeepBlack: '#000',
        White: '#FFFFFF',
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
        mono: ['Courier New', 'monospace'],
        inspiration: ['"Inspiration"', 'cursive'],
        jura: ['"Jura"', 'sans-serif'],
        rouge: ['"Rouge Script"', 'cursive'],
        'rouge-script': ['"Rouge Script"', 'cursive'],
        'poppins': ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}