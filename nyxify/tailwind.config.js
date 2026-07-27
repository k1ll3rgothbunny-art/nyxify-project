/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        nyx: {
          bg: "#12080e",
          panel: "#1c1016",
          panel2: "#241620",
          pink: "#ff2d95",
          pink2: "#ff6ec7",
          pink3: "#ff96d4",
          violet: "#7c3aed",
          line: "#3a2430",
          text: "#f1e9f7",
          muted: "#b799a8"
        }
      },
      fontFamily: {
        display: ["'Cabinet Grotesk'", "'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"]
      },
      boxShadow: {
        glow: "0 0 40px rgba(255,45,149,0.25)"
      }
    }
  },
  plugins: []
};
