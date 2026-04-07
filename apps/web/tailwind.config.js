/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          400: "#8FA4E8",
          500: "#6C7FD8",
          600: "#5A6BC4",
        },
        bg: {
          base: "#09090b",
          surface: "#0E0E11",
          elevated: "#161B27",
        },
        text: {
          primary: "#F0EED8",
          secondary: "#8B9BB4",
        },
      },
      fontFamily: {
        syne: ["Syne", "sans-serif"],
        dmsans: ["DM Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
}