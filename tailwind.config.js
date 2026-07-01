/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        // Identidade visual Oriente Móveis
        oriente: {
          red: "#C1121F",      // Vermelho Escarlate - cor primária
          "red-dark": "#9E0E19",
          gray: "#3F3F3F",     // Cinza Escuro - cor secundária
          "gray-light": "#525252",
          white: "#FFFFFF"     // Branco - cor de destaque
        }
      },
      fontFamily: {
        // Tipografia oficial da marca
        principal: ["var(--font-afacad)", "sans-serif"],
        secundaria: ["var(--font-josefin)", "sans-serif"]
      },
      borderRadius: {
        xl2: "1.25rem"
      },
      boxShadow: {
        card: "0 2px 12px rgba(63, 63, 63, 0.08)",
        "card-hover": "0 6px 24px rgba(63, 63, 63, 0.14)"
      }
    }
  },
  plugins: []
};
