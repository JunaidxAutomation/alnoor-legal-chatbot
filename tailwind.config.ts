import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      animation: {
        "gradient-x": "gradient-x 5s linear infinite",
        "fade-up": "fade-up 0.6s ease both",
        "slide-up": "slide-up 0.3s cubic-bezier(0.34,1.56,0.64,1)",
        "pulse-ring": "pulse-ring 2.5s infinite",
        "float": "float 4s ease-in-out infinite",
        "bounce-dot": "bounce-dot 1.2s infinite",
        "pulse-wa": "pulse-wa 2s infinite",
        "ticker": "ticker 0.4s ease",
      },
      keyframes: {
        "gradient-x": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(20px) scale(0.95)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "pulse-ring": {
          "0%": { boxShadow: "0 0 0 0 rgba(5,150,105,0.6)" },
          "70%": { boxShadow: "0 0 0 12px rgba(5,150,105,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(5,150,105,0)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "bounce-dot": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        "pulse-wa": {
          "0%": { boxShadow: "0 0 0 0 rgba(37,211,102,0.5)" },
          "70%": { boxShadow: "0 0 0 14px rgba(37,211,102,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(37,211,102,0)" },
        },
        "ticker": {
          from: { opacity: "0", transform: "translateX(10px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
      },
      backgroundSize: {
        "300%": "300% 100%",
      },
    },
  },
  plugins: [],
}

export default config
