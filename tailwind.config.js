/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        devanagari: ["Tiro Devanagari Hindi", "serif"],
        display: ["Cormorant Garamond", "serif"],
        body: ["DM Sans", "sans-serif"],
      },
      colors: {
        saffron: {
          300: "#FFD580",
          400: "#FFBB33",
          500: "#FF9500",
          600: "#E07B00",
        },
        crimson: {
          400: "#E05555",
          500: "#C0392B",
          600: "#A93226",
        },
        gold: {
          300: "#F5D67A",
          400: "#E8C547",
          500: "#D4A017",
          600: "#B8860B",
        },
      },
      animation: {
        "pulse-ring": "pulseRing 0.4s ease-out",
        "counter-pop": "counterPop 0.15s ease-out",
        "float": "float 6s ease-in-out infinite",
        "glow": "glow 3s ease-in-out infinite",
        "shimmer": "shimmer 2.5s linear infinite",
      },
      keyframes: {
        pulseRing: {
          "0%": { transform: "scale(1)", opacity: "0.8" },
          "100%": { transform: "scale(1.3)", opacity: "0" },
        },
        counterPop: {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.08)" },
          "100%": { transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(255,149,0,0.3)" },
          "50%": { boxShadow: "0 0 50px rgba(255,149,0,0.6), 0 0 80px rgba(255,149,0,0.2)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
      },
    },
  },
  plugins: [],
};
