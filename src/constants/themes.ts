/**
 * VS Code Dark+ Theme Configuration
 * Complete design system for the developer todo app
 */

export const Colors = {
  // Base colors
  background: '#1e1e1e',
  surface: '#252526',
  surfaceLight: '#2d2d30',
  primary: '#007acc',
  secondary: '#3e3e42',
  border: '#3e3e42',

  // Text colors
  textPrimary: '#d4d4d4',
  textSecondary: '#9d9d9d',
  textDisabled: '#6a6a6a',

  // Syntax highlighting colors (for code-themed UI)
  keyword: '#569cd6', // Blue - HIGH priority
  string: '#ce9178', // Orange - MEDIUM priority
  comment: '#6a9955', // Green - LOW priority
  function: '#dcdcaa', // Yellow - Category highlight
  variable: '#9cdcfe', // Light blue - Task title
  number: '#b5cea8', // Light green - Numbers

  // Status colors
  success: '#4ec9b0', // Completed tasks
  warning: '#ce9178', // Due soon
  error: '#f48771', // Overdue
  info: '#569cd6', // Information

  // Category colors
  learning: '#9cdcfe', // Light blue
  coding: '#dcdcaa', // Yellow
  assignment: '#ce9178', // Orange
  project: '#c586c0', // Purple
  personal: '#4ec9b0', // Teal

  // UI element colors
  cardBackground: '#252526',
  inputBackground: '#2d2d30',
  buttonPrimary: '#007acc',
  buttonSecondary: '#3e3e42',

  // Overlay colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  blur: 'rgba(30, 30, 30, 0.9)',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Typography = {
  // Font families
  fontFamily: {
    regular: 'System',
    mono: 'FiraCode-Regular',
    monoMedium: 'FiraCode-Medium',
    monoSemiBold: 'FiraCode-SemiBold',
    monoBold: 'FiraCode-Bold',
    jetbrains: 'JetBrainsMono-Regular',
    jetbrainsMedium: 'JetBrainsMono-Medium',
    jetbrainsSemiBold: 'JetBrainsMono-SemiBold',
    jetbrainsBold: 'JetBrainsMono-Bold',
  },

  // Font sizes
  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },

  // Font weights
  fontWeight: {
    regular: '400' as '400',
    medium: '500' as '500',
    semibold: '600' as '600',
    bold: '700' as '700',
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.8,
  },
};

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const Shadows = {
  none: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
};

export const Layout = {
  screenPadding: Spacing.lg,
  cardPadding: Spacing.md,
  sectionSpacing: Spacing.xl,
  itemSpacing: Spacing.md,
};

export const Theme = {
  colors: Colors,
  spacing: Spacing,
  typography: Typography,
  borderRadius: BorderRadius,
  shadows: Shadows,
  layout: Layout,
};

export type ThemeType = typeof Theme;

export default Theme;
