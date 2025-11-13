// Theme Store - Theme Management

import { create } from 'zustand';
import { Theme } from '../constants';

type ThemeName = 'vscode-dark' | 'dracula' | 'monokai' | 'github-dark' | 'nord';

interface ThemeStore {
  // State
  currentTheme: ThemeName;
  isDark: boolean;

  // Actions
  setTheme: (themeName: ThemeName) => void;
  toggleDarkMode: () => void;

  // Getters
  getThemeColors: () => typeof Theme.colors;
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  // Initial State
  currentTheme: 'vscode-dark',
  isDark: true,

  // Set theme
  setTheme: (themeName) => {
    set({ currentTheme: themeName, isDark: true });
    // TODO: Apply theme colors dynamically
  },

  // Toggle dark mode (for future light theme support)
  toggleDarkMode: () => {
    set((state) => ({ isDark: !state.isDark }));
  },

  // Get current theme colors
  getThemeColors: () => {
    // For now, return VS Code Dark+ theme
    // TODO: Add other theme configurations
    return Theme.colors;
  },
}));
