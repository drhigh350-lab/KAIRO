import type { Config } from "tailwindcss";

/**
 * Colour values are copied from `design-system/tokens/colors.css`
 * (the single source of truth for brand colour). Keep these two files
 * in sync by hand until the design system is published as a shared
 * package the apps can depend on directly.
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        kairo: {
          navy: {
            900: "#012748",
            800: "#043156",
          },
          blue: {
            700: "#09476E",
            500: "#2E6E95",
            300: "#98B0C4",
            200: "#C3D2DE",
          },
        },
      },
      fontFamily: {
        heading: ["var(--font-poppins)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
