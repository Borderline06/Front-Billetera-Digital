/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],   // <-- This is necessary
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  corePlugins: {
    // IMPORTANT: disable Tailwind v4 "smart colors"
    // so it stops generating prefers-color-scheme styles
    preflight: true,
  },
};
