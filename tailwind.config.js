/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // Garanta que esta linha esteja apontando para a pasta 'app'
    "./app/**/*.{js,ts,jsx,tsx,mdx}", 
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}