/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        nyx: {
          bg: "#0a0710",
          panel: "#140f1e",
          panel2: "#1c1526",
          pink: "#ff2d95",
          pink2: "#ff6ec7",
          pink3: "#ff96d4",
          violet: "#7c3aed",
          line: "#2a2135",
          text: "#f1e9f7",
          muted: "#a996b8"
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
