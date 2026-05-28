import "@/global.css";

import { Platform } from "react-native";

const PRIMARY = "#22C55E";
const ERROR = "#EF4444";

export const Colors = {
  light: {
    text: "#000000",
    background: "#ffffff",

    // Generic
    card: "#F4F4F5",
    border: "#E4E4E7",

    backgroundElement: "#F0F0F3",
    backgroundSelected: "#E0E1E6",
    textSecondary: "#60646C",

    primary: PRIMARY,
    error: ERROR,

    // Shell / Header
    shellBackground: "#ffffff",
    headerGradientStart: "#ffffff",
    headerGradientEnd: "#F7F7F8",
    headerBorder: "#E4E4E7",

    statusBarStyle:
      "dark-content" as const,

    // Summary card
    summaryGradientStart: "#ECFDF5",
    summaryGradientMid: "#D1FAE5",
    summaryGradientEnd: "#F0FDF4",

    summaryValue: "#14532d",
    summaryLabel: "#16a34a",

    summaryDecorCircle:
      "#22C55E20",

    summaryItemBadgeBg: "#dcfce7",

    summaryItemBadgeBorder:
      "#86efac60",

    summaryItemBadgeText:
      "#16a34a",

    // Alert
    alertTextDanger: "#dc2626",
    alertTextSuccess: "#16a34a",

    // Section
    sectionTitleColor: "#18181b",

    // Product card
    cardBackground: "#ffffff",

    cardBorderDefault:
      "#E4E4E7",

    cardName: "#18181b",
    cardPrice: "#52525b",

    cardDeleteBg: "#F4F4F5",

    cardDeleteIcon: "#71717a",

    cardChevron: "#A1A1AA",

    // Empty state
    emptyBg: "#FAFAFA",

    emptyBorder: "#E4E4E7",

    emptyIconBg: "#F4F4F5",

    emptyIcon: "#A1A1AA",

    emptyTitle: "#18181b",

    emptyDescription: "#71717a",

    emptyButtonBg: "#16a34a",

    // FAB
    fabGradientStart: "#22C55E",
    fabGradientEnd: "#16a34a",

    // Filter Chip
    filterChipBg: "#F4F4F5",

    filterChipBorder:
      "#E4E4E7",

    filterChipText: "#18181b",

    filterChipActiveText:
      "#ffffff",

    // Status
    success: "#22c55e",
    warning: "#f59e0b",
    danger: "#ef4444",
    info: "#3b82f6",

    userBadgeBg: "#F4F4F5",
    userBadgeText: "#18181b",
    userBadgeIcon: "#52525b",
  },

  dark: {
    text: "#ffffff",
    background: "#000000",

    // Generic
    card: "#18181b",
    border: "#27272a",

    backgroundElement: "#212225",
    backgroundSelected: "#2E3135",

    textSecondary: "#B0B4BA",

    primary: PRIMARY,
    error: ERROR,

    // Shell / Header
    shellBackground: "#09090b",

    headerGradientStart:
      "#09090b",

    headerGradientEnd:
      "#0f0f12",

    headerBorder: "#18181b",

    statusBarStyle:
      "light-content" as const,

    // Summary card
    summaryGradientStart:
      "#052e16",

    summaryGradientMid:
      "#0a2a1b",

    summaryGradientEnd:
      "#0f1117",

    summaryValue: "#ffffff",

    summaryLabel: "#4ade80",

    summaryDecorCircle:
      "#22C55E20",

    summaryItemBadgeBg:
      "#14532d60",

    summaryItemBadgeBorder:
      "#22C55E40",

    summaryItemBadgeText:
      "#86efac",

    // Alert
    alertTextDanger: "#f87171",

    alertTextSuccess: "#4ade80",

    // Section
    sectionTitleColor:
      "#f4f4f5",

    // Product card
    cardBackground: "#111113",

    cardBorderDefault:
      "#27272a",

    cardName: "#f4f4f5",

    cardPrice: "#71717a",

    cardDeleteBg: "#1c1c1f",

    cardDeleteIcon: "#71717a",

    cardChevron: "#3f3f46",

    // Empty state
    emptyBg: "#0f0f12",

    emptyBorder: "#27272a",

    emptyIconBg: "#18181b",

    emptyIcon: "#3f3f46",

    emptyTitle: "#f4f4f5",

    emptyDescription: "#52525b",

    emptyButtonBg: "#16a34a",

    // FAB
    fabGradientStart: "#22C55E",
    fabGradientEnd: "#16a34a",

    // Filter Chip
    filterChipBg: "#18181b",

    filterChipBorder:
      "#27272a",

    filterChipText: "#f4f4f5",

    filterChipActiveText:
      "#ffffff",

    // Status
    success: "#22c55e",
    warning: "#f59e0b",
    danger: "#ef4444",
    info: "#60a5fa",

    userBadgeBg: "#18181b",
    userBadgeText: "#fafafa",
    userBadgeIcon: "#a1a1aa",
  },
} as const;

export type ThemeColor =
  keyof typeof Colors.light &
  keyof typeof Colors.dark;

export const Fonts =
  Platform.select({
    ios: {
      sans: "system-ui",
      serif: "ui-serif",
      rounded: "ui-rounded",
      mono: "ui-monospace",
    },

    default: {
      sans: "normal",
      serif: "serif",
      rounded: "normal",
      mono: "monospace",
    },

    web: {
      sans: "var(--font-display)",
      serif: "var(--font-serif)",
      rounded:
        "var(--font-rounded)",
      mono: "var(--font-mono)",
    },
  });

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;