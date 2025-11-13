// Settings Store - User Preferences Management

import { create } from 'zustand';
import { UserSettings } from '../types';
import { StorageService } from '../services/storageService';

interface SettingsStore {
  // State
  settings: UserSettings;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadSettings: () => Promise<void>;
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;

  // Utility
  clearError: () => void;
}

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'vscode-dark',
  fontSize: 14,
  notifications: true,
  soundEnabled: false,
  defaultPriority: 'medium',
  autoArchive: true,
  weekStartsOn: 'monday',
};

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  // Initial State
  settings: DEFAULT_SETTINGS,
  isLoading: false,
  error: null,

  // Load settings from storage
  loadSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const settings = await StorageService.getSettings();
      set({ settings, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load settings',
        isLoading: false,
        settings: DEFAULT_SETTINGS,
      });
    }
  },

  // Update settings
  updateSettings: async (updates) => {
    set({ isLoading: true, error: null });
    try {
      const updatedSettings = await StorageService.setSettings(updates);
      set({ settings: updatedSettings, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update settings',
        isLoading: false,
      });
      throw error;
    }
  },

  // Reset to default settings
  resetSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const resetSettings = await StorageService.setSettings(DEFAULT_SETTINGS);
      set({ settings: resetSettings, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to reset settings',
        isLoading: false,
      });
      throw error;
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
}));
