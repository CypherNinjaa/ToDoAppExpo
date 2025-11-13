// Theme Store - Theme Management with Persistence

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeName, ThemeColors, getThemeColors } from '../constants/themes';
import { STORAGE_KEYS } from '../services/storageKeys';

interface ThemeStore {
  // State
  currentTheme: ThemeName;
  isDark: boolean;
  isLoading: boolean;

  // Actions
  setTheme: (themeName: ThemeName) => Promise<void>;
  toggleDarkMode: () => void;
  loadTheme: () => Promise<void>;

  // Getters
  getThemeColors: () => ThemeColors;
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  // Initial State
  currentTheme: 'vscode-dark',
  isDark: true,
  isLoading: true,

  // Set theme with persistence
  setTheme: async (themeName) => {
    try {
      set({ currentTheme: themeName, isDark: true });
      await AsyncStorage.setItem(STORAGE_KEYS.THEME, themeName);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  },

  // Toggle dark mode (for future light theme support)
  toggleDarkMode: () => {
    set((state) => ({ isDark: !state.isDark }));
  },

  // Load theme from storage
  loadTheme: async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(STORAGE_KEYS.THEME);
      if (savedTheme && ['vscode-dark', 'dracula', 'monokai', 'github-dark'].includes(savedTheme)) {
        set({ currentTheme: savedTheme as ThemeName, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
      set({ isLoading: false });
    }
  },

  // Get current theme colors
  getThemeColors: () => {
    const { currentTheme } = get();
    return getThemeColors(currentTheme);
  },
}));
