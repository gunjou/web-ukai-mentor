/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",

  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],

  theme: {
    extend: {
      colors: {
        primary: {
          50: "var(--color-primary-50)",
          100: "var(--color-primary-100)",
          200: "var(--color-primary-200)",
          300: "var(--color-primary-300)",
          400: "var(--color-primary-400)",
          500: "var(--color-primary-500)",
          600: "var(--color-primary-600)",
          700: "var(--color-primary-700)",
          800: "var(--color-primary-800)",
          900: "var(--color-primary-900)",
        },

        background: "var(--background)",
        "background-secondary": "var(--background-secondary)",
        "background-tertiary": "var(--background-tertiary)",

        foreground: "var(--foreground)",
        "foreground-secondary": "var(--foreground-secondary)",
        "foreground-muted": "var(--foreground-muted)",

        border: "var(--border)",
        "border-light": "var(--border-light)",

        card: "var(--card)",
        "card-foreground": "var(--card-foreground)",

        input: "var(--input)",
        "input-border": "var(--input-border)",
        "input-placeholder": "var(--input-placeholder)",

        success: "var(--success)",
        "success-light": "var(--success-light)",

        warning: "var(--warning)",
        "warning-light": "var(--warning-light)",

        danger: "var(--danger)",
        "danger-light": "var(--danger-light)",

        info: "var(--info)",
        "info-light": "var(--info-light)",

        sidebar: "var(--sidebar)",
        "sidebar-foreground": "var(--sidebar-foreground)",
        "sidebar-foreground-active": "var(--sidebar-foreground-active)",
        "sidebar-hover": "var(--sidebar-hover)",
        "sidebar-border": "var(--sidebar-border)",
      },

      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
      },

      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
      },
    },
  },

  plugins: [],
};
