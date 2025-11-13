// App Initialization Hook - Load all stores on app start

import { useEffect, useState } from 'react';
import { useTaskStore, useSettingsStore, useStatsStore } from '../stores';
import { StorageService } from '../services/storageService';

export const useInitializeApp = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = useTaskStore((state) => state.loadTasks);
  const loadSettings = useSettingsStore((state) => state.loadSettings);
  const loadStats = useStatsStore((state) => state.loadStats);

  useEffect(() => {
    const initialize = async () => {
      try {
        // Initialize storage service (version check & migration)
        await StorageService.initialize();

        // Load all stores in parallel
        await Promise.all([loadTasks(), loadSettings(), loadStats()]);

        setIsInitialized(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize app');
        console.error('App initialization error:', err);
      }
    };

    initialize();
  }, [loadTasks, loadSettings, loadStats]);

  return { isInitialized, error };
};
