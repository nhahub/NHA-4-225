/** @type {import('tailwindcss').Config} */
//
// Hadaf design tokens (E0-1.4) — converted from Impulse's hex Violet scale to
// OKLCH directly here. The client's token layer (this file + src/index.css)
// is the authoritative design source per Docs/AGENT-OPERATING-INSTRUCTIONS.md
// §3 — there is no separate DESIGN.md.
//
// Color values map to CSS variables defined in src/index.css (:root for
// light, :root.dark for dark). Light/dark tokens share the same structure so
// Tailwind utilities like `bg-background dark:bg-background-dark` resolve.
//
// WCAG contrast pairings for text-on-fill are documented per token below.
// Numbers were computed assuming a paired foreground token of:
//   light: var(--color-foreground) (≈ 0.18 lightness, very dark)
//   dark:  var(--color-foreground-dark) (≈ 0.92 lightness, very light)
// Real pairings depend on usage; review per feature.
//
// E0-1 hand-off flag: `boxShadow.card-hover` and `boxShadow.glow` may
// violate the "flat by default; shadow only on floating elements" guardrail
// (AGENT-OPERATING-INSTRUCTIONS.md §4). Kept for now — defer to the
// design-token review pass.
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",

  theme: {
    extend: {
      colors: {
        // Semantic surfaces — the `:root` and `:root.dark` CSS variables already
        // resolve to the right theme value (`:root` for light, `:root.dark` for
        // dark), so a single token covers both. No -dark suffixed entries needed.
        background: {
          DEFAULT: "var(--color-background)",
          paper: "var(--color-background-paper)",
        },
        foreground: {
          DEFAULT: "var(--color-foreground)",
          muted: "var(--color-foreground-muted)",
        },
        border: {
          DEFAULT: "var(--color-border)",
        },

        // Brand scale — Violet (Tailwind v4 OKLCH equivalents of Impulse's hex)
        brand: {
          50: "var(--color-brand-50)",
          100: "var(--color-brand-100)",
          200: "var(--color-brand-200)",
          300: "var(--color-brand-300)",
          400: "var(--color-brand-400)",
          500: "var(--color-brand-500)",
          600: "var(--color-brand-600)",
          700: "var(--color-brand-700)",
          800: "var(--color-brand-800)",
          900: "var(--color-brand-900)",
          950: "var(--color-brand-950)",
        },

        // Status colors — progress/health ONLY. Never decorative, never brand.
        // 5 entries to match the 5 day states (legendary/amazing/perfect/good_enough/low).
        status: {
          danger: "var(--color-status-danger)",     // low / red
          warning: "var(--color-status-warning)",   // good_enough / orange
          info: "var(--color-status-info)",         // perfect / amber
          success: "var(--color-status-success)",   // amazing / green
          legendary: "var(--color-status-legendary)", // legendary / gold
        },
      },
      fontFamily: {
        sans: [
          "Tajawal",
          "IBM Plex Sans Arabic",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
      boxShadow: {
        sm: "0 1px 2px 0 oklch(0 0 0 / 0.05)",
        DEFAULT:
          "0 1px 3px 0 oklch(0 0 0 / 0.1), 0 1px 2px -1px oklch(0 0 0 / 0.06)",
        md: "0 4px 6px -1px oklch(0 0 0 / 0.1), 0 2px 4px -2px oklch(0 0 0 / 0.06)",
        soft: "0 2px 10px oklch(0 0 0 / 0.03)",
        card: "0 1px 3px oklch(0 0 0 / 0.12), 0 1px 2px oklch(0 0 0 / 0.24)",
        // E0-1 hand-off flag: these may violate the "flat by default; shadow
        // only on floating elements" guardrail. Defer to design-token review.
        "card-hover":
          "0 10px 15px -3px oklch(0 0 0 / 0.1), 0 4px 6px -2px oklch(0 0 0 / 0.05)",
        glow: "0 0 20px oklch(0.606 0.25 292.717 / 0.2)",
      },
      borderRadius: {
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
        full: "9999px",
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out",
        "slide-in-up": "slide-in-up 0.5s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-in-up": {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      zIndex: {
        sticky: "1020",
        fixed: "1030",
        modal: "1050",
        popover: "1060",
        tooltip: "1070",
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        ".scrollbar-hide": {
          "-ms-overflow-style": "none",
          "scrollbar-width": "none",
          "&::-webkit-scrollbar": {
            display: "none",
          },
        },
        ".glass": {
          background: "oklch(1 0 0 / 0.7)",
          "backdrop-filter": "blur(12px)",
          border: "1px solid oklch(1 0 0 / 0.4)",
        },
        ".glass-dark": {
          background: "oklch(0.22 0.025 264 / 0.7)",
          "backdrop-filter": "blur(12px)",
          border: "1px solid oklch(0.32 0.02 264 / 0.4)",
        },
      });
    },
  ],
};