/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],

  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],

  theme: {
    extend: {
      borderRadius: {
        lg: "0.5625rem",
        md: "0.375rem",
        sm: "0.1875rem",
      },

      colors: {
        // ✅ CORE COLORS (IMPORTANT FIX)
        border: "hsl(var(--border, 214.3 31.8% 91.4%) / <alpha-value>)",
        input: "hsl(var(--input, 214.3 31.8% 91.4%) / <alpha-value>)",
        ring: "hsl(var(--ring, 221.2 83.2% 53.3%) / <alpha-value>)",
        background: "hsl(var(--background, 0 0% 100%) / <alpha-value>)",
        foreground: "hsl(var(--foreground, 222.2 84% 4.9%) / <alpha-value>)",

        // UI SYSTEM
        primary: {
          DEFAULT: "hsl(var(--primary, 221.2 83.2% 53.3%) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground, 210 40% 98%) / <alpha-value>)",
        },

        secondary: {
          DEFAULT: "hsl(var(--secondary, 210 40% 96.1%) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground, 222.2 47.4% 11.2%) / <alpha-value>)",
        },

        destructive: {
          DEFAULT: "hsl(var(--destructive, 0 84.2% 60.2%) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground, 210 40% 98%) / <alpha-value>)",
        },

        muted: {
          DEFAULT: "hsl(var(--muted, 210 40% 96.1%) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground, 215.4 16.3% 46.9%) / <alpha-value>)",
        },

        accent: {
          DEFAULT: "hsl(var(--accent, 210 40% 96.1%) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground, 222.2 47.4% 11.2%) / <alpha-value>)",
        },

        popover: {
          DEFAULT: "hsl(var(--popover, 0 0% 100%) / <alpha-value>)",
          foreground: "hsl(var(--popover-foreground, 222.2 84% 4.9%) / <alpha-value>)",
        },

        card: {
          DEFAULT: "hsl(var(--card, 0 0% 100%) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground, 222.2 84% 4.9%) / <alpha-value>)",
        },

        // EXTRA SYSTEMS
        chart: {
          "1": "hsl(var(--chart-1, 12 76% 61%) / <alpha-value>)",
          "2": "hsl(var(--chart-2, 173 58% 39%) / <alpha-value>)",
          "3": "hsl(var(--chart-3, 197 37% 24%) / <alpha-value>)",
          "4": "hsl(var(--chart-4, 43 74% 66%) / <alpha-value>)",
          "5": "hsl(var(--chart-5, 27 87% 67%) / <alpha-value>)",
        },

        sidebar: {
          DEFAULT: "hsl(var(--sidebar, 0 0% 100%) / <alpha-value>)",
          foreground: "hsl(var(--sidebar-foreground, 222.2 84% 4.9%) / <alpha-value>)",
          border: "hsl(var(--sidebar-border, 214.3 31.8% 91.4%) / <alpha-value>)",
          ring: "hsl(var(--sidebar-ring, 221.2 83.2% 53.3%) / <alpha-value>)",
        },

        status: {
          online: "rgb(34 197 94)",
          away: "rgb(245 158 11)",
          busy: "rgb(239 68 68)",
          offline: "rgb(156 163 175)",
        },
      },

      fontFamily: {
        sans: ["var(--font-sans)", "system-ui"],
        serif: ["var(--font-serif)", "serif"],
        mono: ["var(--font-mono)", "monospace"],
      },

      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },

      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },

  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
  ],
};