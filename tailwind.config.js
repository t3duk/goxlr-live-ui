/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx,html}"],
  theme: {
    extend: {
      colors: {
        red: {
          500: "#f00",
        },
      },
    },
  },
  plugins: [],
};
