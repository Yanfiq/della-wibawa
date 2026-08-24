import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "dark-green": "#064D2C",
        "deep-green": "#0B5733",
        brand: {
          green: "#1F7A4C",
          lime: "#9ACD32",
          gold: "#F2B927",
          cream: "#E8E8D8",
          dark: "#064D2C",
          deep: "#0B5733",
        },
        "bg-app": "#F7F7F0",
        "brand-muted": "#6B7A72",
        "brand-line": "#E4E4D6",
        "brand-red": "#D9534F",
      },
      fontFamily: {
        sans: ["var(--font-poppins)", "system-ui", "-apple-system", "sans-serif"],
        serif: ["var(--font-playfair)", "Georgia", "serif"],
      },
      boxShadow: {
        smarta1: "0 1px 2px rgba(6,77,44,.06), 0 4px 14px rgba(6,77,44,.06)",
        smarta2: "0 10px 30px rgba(6,77,44,.12)",
      },
      borderRadius: {
        "smarta-sm": "8px",
        "smarta-md": "12px",
        "smarta-lg": "18px",
        "smarta-xl": "26px",
      },
      spacing: {
        "4.5": "1.125rem", // 18px
        "5.5": "1.375rem", // 22px
        "6.5": "1.625rem", // 26px
        "7.5": "1.875rem", // 30px
        "8.5": "2.125rem", // 34px
        "9.5": "2.375rem", // 38px
      },
    },
  },
  plugins: [],
};
export default config;
