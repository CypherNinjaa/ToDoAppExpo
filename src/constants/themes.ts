/**
 * Multi-Theme Configuration
 * Complete design system for the developer todo app with multiple IDE themes
 */

export type ThemeName = 'vscode-dark' | 'dracula' | 'monokai' | 'github-dark';

export interface ThemeColors {
  // Base colors
  background: string;
  surface: string;
  surfaceLight: string;
  primary: string;
  secondary: string;
  border: string;

  // Text colors
  textPrimary: string;
  textSecondary: string;
  textDisabled: string;

  // Syntax highlighting colors
  keyword: string;
  string: string;
  comment: string;
  function: string;
  variable: string;
  number: string;

  // Status colors
  success: string;
  warning: string;
  error: string;
  info: string;

  // Category colors
  learning: string;
  coding: string;
  assignment: string;
  project: string;
  personal: string;

  // UI element colors
  cardBackground: string;
  inputBackground: string;
  buttonPrimary: string;
  buttonSecondary: string;

  // Overlay colors
  overlay: string;
  blur: string;
}

// VS Code Dark+ Theme
const VSCodeDarkColors: ThemeColors = {
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

  // Syntax highlighting colors
  keyword: '#569cd6',
  string: '#ce9178',
  comment: '#6a9955',
  function: '#dcdcaa',
  variable: '#9cdcfe',
  number: '#b5cea8',

  // Status colors
  success: '#4ec9b0',
  warning: '#ce9178',
  error: '#f48771',
  info: '#569cd6',

  // Category colors
  learning: '#9cdcfe',
  coding: '#dcdcaa',
  assignment: '#ce9178',
  project: '#c586c0',
  personal: '#4ec9b0',

  // UI element colors
  cardBackground: '#252526',
  inputBackground: '#2d2d30',
  buttonPrimary: '#007acc',
  buttonSecondary: '#3e3e42',

  // Overlay colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  blur: 'rgba(30, 30, 30, 0.9)',
};

// Dracula Theme
const DraculaColors: ThemeColors = {
  // Base colors
  background: '#282a36',
  surface: '#44475a',
  surfaceLight: '#6272a4',
  primary: '#bd93f9',
  secondary: '#44475a',
  border: '#6272a4',

  // Text colors
  textPrimary: '#f8f8f2',
  textSecondary: '#6272a4',
  textDisabled: '#44475a',

  // Syntax highlighting colors
  keyword: '#ff79c6',
  string: '#f1fa8c',
  comment: '#6272a4',
  function: '#50fa7b',
  variable: '#8be9fd',
  number: '#bd93f9',

  // Status colors
  success: '#50fa7b',
  warning: '#ffb86c',
  error: '#ff5555',
  info: '#8be9fd',

  // Category colors
  learning: '#8be9fd',
  coding: '#50fa7b',
  assignment: '#f1fa8c',
  project: '#bd93f9',
  personal: '#ff79c6',

  // UI element colors
  cardBackground: '#44475a',
  inputBackground: '#282a36',
  buttonPrimary: '#bd93f9',
  buttonSecondary: '#44475a',

  // Overlay colors
  overlay: 'rgba(40, 42, 54, 0.8)',
  blur: 'rgba(40, 42, 54, 0.95)',
};

// Monokai Theme
const MonokaiColors: ThemeColors = {
  // Base colors
  background: '#272822',
  surface: '#3e3d32',
  surfaceLight: '#49483e',
  primary: '#66d9ef',
  secondary: '#49483e',
  border: '#75715e',

  // Text colors
  textPrimary: '#f8f8f2',
  textSecondary: '#75715e',
  textDisabled: '#49483e',

  // Syntax highlighting colors
  keyword: '#f92672',
  string: '#e6db74',
  comment: '#75715e',
  function: '#a6e22e',
  variable: '#66d9ef',
  number: '#ae81ff',

  // Status colors
  success: '#a6e22e',
  warning: '#fd971f',
  error: '#f92672',
  info: '#66d9ef',

  // Category colors
  learning: '#66d9ef',
  coding: '#a6e22e',
  assignment: '#e6db74',
  project: '#ae81ff',
  personal: '#f92672',

  // UI element colors
  cardBackground: '#3e3d32',
  inputBackground: '#272822',
  buttonPrimary: '#66d9ef',
  buttonSecondary: '#49483e',

  // Overlay colors
  overlay: 'rgba(39, 40, 34, 0.8)',
  blur: 'rgba(39, 40, 34, 0.95)',
};

// GitHub Dark Theme
const GitHubDarkColors: ThemeColors = {
  // Base colors
  background: '#0d1117',
  surface: '#161b22',
  surfaceLight: '#21262d',
  primary: '#58a6ff',
  secondary: '#30363d',
  border: '#30363d',

  // Text colors
  textPrimary: '#c9d1d9',
  textSecondary: '#8b949e',
  textDisabled: '#484f58',

  // Syntax highlighting colors
  keyword: '#ff7b72',
  string: '#a5d6ff',
  comment: '#8b949e',
  function: '#d2a8ff',
  variable: '#79c0ff',
  number: '#79c0ff',

  // Status colors
  success: '#3fb950',
  warning: '#d29922',
  error: '#f85149',
  info: '#58a6ff',

  // Category colors
  learning: '#79c0ff',
  coding: '#a5d6ff',
  assignment: '#ffa657',
  project: '#d2a8ff',
  personal: '#ff7b72',

  // UI element colors
  cardBackground: '#161b22',
  inputBackground: '#0d1117',
  buttonPrimary: '#58a6ff',
  buttonSecondary: '#21262d',

  // Overlay colors
  overlay: 'rgba(13, 17, 23, 0.8)',
  blur: 'rgba(13, 17, 23, 0.95)',
};

// Theme configurations map
export const ThemeConfigs: Record<ThemeName, ThemeColors> = {
  'vscode-dark': VSCodeDarkColors,
  dracula: DraculaColors,
  monokai: MonokaiColors,
  'github-dark': GitHubDarkColors,
};

// Theme metadata for UI display
export interface ThemeInfo {
  name: ThemeName;
  displayName: string;
  description: string;
  previewColors: string[];
}

export const ThemeInfoList: ThemeInfo[] = [
  {
    name: 'vscode-dark',
    displayName: 'VS Code Dark+',
    description: 'Classic Visual Studio Code dark theme',
    previewColors: ['#007acc', '#569cd6', '#dcdcaa', '#4ec9b0'],
  },
  {
    name: 'dracula',
    displayName: 'Dracula',
    description: 'Popular dark theme with vibrant colors',
    previewColors: ['#bd93f9', '#ff79c6', '#50fa7b', '#8be9fd'],
  },
  {
    name: 'monokai',
    displayName: 'Monokai',
    description: 'Iconic theme inspired by Monokai Pro',
    previewColors: ['#66d9ef', '#f92672', '#a6e22e', '#e6db74'],
  },
  {
    name: 'github-dark',
    displayName: 'GitHub Dark',
    description: "GitHub's official dark theme",
    previewColors: ['#58a6ff', '#ff7b72', '#3fb950', '#d2a8ff'],
  },
];

// Default theme colors (for backwards compatibility)
export const Colors = VSCodeDarkColors;

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
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  } as const,

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

// Helper function to get theme colors
export const getThemeColors = (themeName: ThemeName): ThemeColors => {
  return ThemeConfigs[themeName];
};

export default Theme;
