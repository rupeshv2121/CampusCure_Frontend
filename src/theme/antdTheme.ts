import { theme as antdAlgorithms, type ThemeConfig } from "antd";

/**
 * Ant Design theme.
 *
 * AntD derives a large palette from a handful of seed tokens, so it has to be
 * given literal colours — it cannot read the `hsl(var(--x))` custom properties
 * that drive the rest of the design system. The values below are the resolved
 * form of the tokens in `src/index.css`; the two must be changed together or
 * AntD surfaces drift away from everything around them.
 *
 * Anything AntD cannot express through tokens (the gradient primary button,
 * dark-mode remapping) lives in the "Ant Design bridge" block of index.css.
 */

/** Resolved from `--brand-*`. Keep in sync with the ramp in index.css. */
export const brand = {
  50: "#EDF9FC",
  100: "#D4F0F7",
  200: "#A7E0EE",
  300: "#6FCBE2",
  400: "#24AFD3",
  500: "#0C9EC0",
  600: "#07759D",
  700: "#0A4F7B",
  800: "#0B2F5C",
  900: "#0A1F42",
  950: "#06152C",
} as const;

/** Resolved from the light `:root` block in index.css. */
const light = {
  text: "#1B2432",
  textSecondary: "#607085",
  textTertiary: "#8494A6",
  textQuaternary: "#A9B5C4",
  border: "#DFE5EC",
  borderSubtle: "#EAEFF5",
  surface: "#F5F7FA",
  container: "#FFFFFF",
  elevated: "#FFFFFF",
  canvas: "#FCFDFE",
  primary: brand[600],
  optionSelectedBg: brand[50],
  optionSelectedColor: brand[700],
} as const;

/** Resolved from the `.dark` block in index.css. */
const dark = {
  text: "#EAEFF6",
  textSecondary: "#96A3B5",
  textTertiary: "#78869A",
  textQuaternary: "#5C6A7D",
  border: "#2B3442",
  borderSubtle: "#232B37",
  surface: "#111823",
  container: "#141C27",
  elevated: "#18212E",
  canvas: "#0B121B",
  primary: "#22BBD8",
  optionSelectedBg: "#12303D",
  optionSelectedColor: "#7FD6E8",
} as const;

const fontStack =
  '"Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

/**
 * AntD cannot read the `hsl(var(--x))` custom properties that drive the rest of
 * the design system, so it is handed the resolved values instead. Both palettes
 * are the literal form of the `:root` and `.dark` blocks in index.css — change
 * one and you must change the other or AntD surfaces drift from their
 * surroundings.
 */
export const buildAntdTheme = (isDark: boolean): ThemeConfig => {
  const c = isDark ? dark : light;

  return {
  algorithm: isDark ? antdAlgorithms.darkAlgorithm : antdAlgorithms.defaultAlgorithm,
  token: {
    colorPrimary: c.primary,
    colorInfo: c.primary,
    colorSuccess: "#1B8D63",
    colorWarning: "#E18009",
    colorError: "#D32222",
    colorLink: c.primary,

    colorText: c.text,
    colorTextSecondary: c.textSecondary,
    colorTextTertiary: c.textTertiary,
    colorTextQuaternary: c.textQuaternary,

    colorBorder: c.border,
    colorBorderSecondary: c.borderSubtle,

    colorBgContainer: c.container,
    colorBgElevated: c.elevated,
    colorBgLayout: c.canvas,

    fontFamily: fontStack,
    fontSize: 14,

    // Matches `--radius: 0.875rem` (14px) and its derived steps.
    borderRadius: 14,
    borderRadiusLG: 18,
    borderRadiusSM: 10,
    borderRadiusXS: 8,

    controlHeight: 40,
    controlHeightLG: 48,
    controlHeightSM: 32,

    lineWidth: 1,
    wireframe: false,

    // Tinted with the brand hue rather than pure black, so elevation reads as
    // depth over a cool background instead of grime.
    boxShadow: isDark
      ? "0 2px 4px rgba(0, 0, 0, 0.3), 0 8px 20px rgba(0, 0, 0, 0.35)"
      : "0 2px 4px rgba(27, 36, 50, 0.05), 0 8px 20px rgba(27, 36, 50, 0.07)",
    boxShadowSecondary: isDark
      ? "0 4px 8px rgba(0, 0, 0, 0.35), 0 16px 36px rgba(0, 0, 0, 0.45)"
      : "0 4px 8px rgba(27, 36, 50, 0.05), 0 16px 36px rgba(27, 36, 50, 0.09)",
  },

  components: {
    Button: {
      fontWeight: 600,
      primaryShadow: "none",
      defaultShadow: "none",
      dangerShadow: "none",
    },
    Card: {
      paddingLG: 24,
      headerFontSize: 16,
      boxShadowTertiary: isDark
        ? "0 1px 2px rgba(0, 0, 0, 0.4)"
        : "0 1px 2px rgba(27, 36, 50, 0.06)",
    },
    Input: {
      paddingBlock: 9,
      paddingInline: 14,
      activeShadow: `0 0 0 3px ${c.primary}2E`,
    },
    InputNumber: { activeShadow: `0 0 0 3px ${c.primary}2E` },
    Select: {
      optionSelectedBg: c.optionSelectedBg,
      optionSelectedColor: c.optionSelectedColor,
      optionActiveBg: c.surface,
    },
    Table: {
      headerBg: c.surface,
      headerColor: c.textSecondary,
      headerSplitColor: "transparent",
      rowHoverBg: c.optionSelectedBg,
      borderColor: c.borderSubtle,
      cellPaddingBlock: 14,
    },
    Menu: {
      itemBorderRadius: 10,
      itemHeight: 42,
      itemMarginInline: 10,
      itemSelectedBg: c.optionSelectedBg,
      itemSelectedColor: c.optionSelectedColor,
      itemActiveBg: c.optionSelectedBg,
      itemHoverBg: c.surface,
      iconMarginInlineEnd: 12,
      subMenuItemBg: "transparent",
    },
    Layout: {
      headerBg: c.container,
      siderBg: c.container,
      bodyBg: c.canvas,
      headerHeight: 68,
      headerPadding: "0 20px",
    },
    Tag: { borderRadiusSM: 8, defaultBg: c.surface },
    Modal: { borderRadiusLG: 20, titleFontSize: 18 },
    Drawer: { paddingLG: 20 },
    Tabs: { itemSelectedColor: c.optionSelectedColor, inkBarColor: c.primary },
    Tooltip: { borderRadius: 10, colorBgSpotlight: isDark ? "#28323F" : "#111C2E" },
    Progress: { defaultColor: c.primary },
    Steps: { colorPrimary: c.primary },
    Avatar: { colorTextPlaceholder: c.optionSelectedColor },
    Segmented: { itemSelectedBg: c.container, trackBg: c.surface },
    Badge: { colorError: "#D32222" },
    Divider: { colorSplit: c.border },
  },
  };
};

export const antdTheme = buildAntdTheme(false);

export default buildAntdTheme;
