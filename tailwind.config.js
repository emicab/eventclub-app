// tailwind.config.js

const Colors = require('./src/constants/Colors');

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: Colors.background,
        primary: Colors.text.primary,
        secondary: Colors.text.secondary,
        dark: Colors.text.dark,
        accent: Colors.accent,
        'glass-border': Colors.glass.border,
        card: '#e1e1e1',
        newBenef: Colors.newBenef,
      },
    },
  },
  safelist: [
    'bg-newBenef',
    'text-newBenef',
  ],
  plugins: [],
};
