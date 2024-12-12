const {nextui} = require("@nextui-org/react");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
    },
  },
  darkMode: "class",
  plugins: [nextui({
    layout: {
      radius: {
        small: "6px",
        medium: "8px",
        large: "10px",
      },
    },
    themes: {
      light: {
        colors: {
          default: {
            DEFAULT: "#f5f5f5",
          },
          primary:{
            DEFAULT: "#04BBF1",
            foreground: "#ffffff",
          },
          foreground: {
            '500': "#BFBFBF",
          },
          muted: {
            DEFAULT: "#BFBFBF",
          },
        },
      },
    },
  }), require("tailwindcss-animate")],
}
