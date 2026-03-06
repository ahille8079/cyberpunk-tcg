/**
 * Centralized design tokens for the Cyberpunk TCG project.
 * All color and typography constants live here as the single source of truth.
 */

export const colors = {
  // Backgrounds
  black: "#0a0a0f",
  dark: "#12121a",
  grey: "#1a1a2e",

  // Text
  light: "#d1d5db",

  // Neon accents
  yellow: "#fcee09",
  cyan: "#00f0ff",
  magenta: "#ff2a6d",
  blue: "#05d9e8",

  // Card faction colors (pulled from the official game)
  faction: {
    red: "#ee1e25",
    blue: "#2dc2e8",
    green: "#00ae4f",
    yellow: "#f4eb1b",
    neutral: "#d1d5db",
  } as Record<string, string>,

  // Rarity colors
  rarity: {
    common: "#9ca3af",
    uncommon: "#22c55e",
    rare: "#3b82f6",
    epic: "#a855f7",
    secret: "#ec4899",
    iconic: "#f59e0b",
    nova: "#ef4444",
  } as Record<string, string>,
} as const;

export const fonts = {
  display: "var(--font-display)", // Rajdhani — headings, hero text
  sans: "var(--font-sans)", // Inter — body text, descriptions
  mono: "var(--font-mono)", // JetBrains Mono — stats, data, labels
} as const;

export const fontSizes = {
  xs: "0.75rem", // 12px — fine print, badges
  sm: "0.875rem", // 14px — secondary text, labels
  base: "1rem", // 16px — body text
  lg: "1.125rem", // 18px — emphasized body
  xl: "1.25rem", // 20px — section headings
  "2xl": "1.5rem", // 24px — page subheadings
  "3xl": "1.875rem", // 30px — page titles
  "4xl": "2.25rem", // 36px — hero headings
} as const;
