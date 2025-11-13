// Statistics Store - Track User Progress & Achievements

import { create } from 'zustand';
import { StorageService } from '../services/storageService';

interface StatsStore {
  // State
  streak: number;
  totalCompleted: number;
  isLoading: boolean;

  // Actions
  loadStats: () => Promise<void>;
  updateStreak: (days: number) => Promise<void>;
  incrementCompleted: () => Promise<void>;
  calculateStreak: () => Promise<void>;
}

export const useStatsStore = create<StatsStore>((set, get) => ({
  // Initial State
  streak: 0,
  totalCompleted: 0,
  isLoading: false,

  // Load statistics from storage
  loadStats: async () => {
    set({ isLoading: true });
    try {
      const [streak, totalCompleted] = await Promise.all([
        StorageService.getStreak(),
        StorageService.getTotalCompleted(),
      ]);
      set({ streak, totalCompleted, isLoading: false });
    } catch (error) {
      console.error('Failed to load stats:', error);
      set({ isLoading: false });
    }
  },

  // Update streak
  updateStreak: async (days) => {
    try {
      await StorageService.updateStreak(days);
      set({ streak: days });
    } catch (error) {
      console.error('Failed to update streak:', error);
    }
  },

  // Increment completed count
  incrementCompleted: async () => {
    try {
      await StorageService.incrementCompleted();
      set((state) => ({ totalCompleted: state.totalCompleted + 1 }));
    } catch (error) {
      console.error('Failed to increment completed count:', error);
    }
  },

  // Calculate current streak based on task completion history
  calculateStreak: async () => {
    try {
      const tasks = await StorageService.getTasks();
      const completedTasks = tasks
        .filter((task) => task.status === 'completed' && task.completedAt)
        .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime());

      if (completedTasks.length === 0) {
        set({ streak: 0 });
        await StorageService.updateStreak(0);
        return;
      }

      let currentStreak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Check if there's a task completed today or yesterday
      const lastCompleted = new Date(completedTasks[0].completedAt!);
      lastCompleted.setHours(0, 0, 0, 0);

      const daysDiff = Math.floor(
        (today.getTime() - lastCompleted.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff > 1) {
        // Streak broken
        set({ streak: 0 });
        await StorageService.updateStreak(0);
        return;
      }

      // Calculate streak
      const uniqueDays = new Set<string>();
      for (const task of completedTasks) {
        const date = new Date(task.completedAt!);
        date.setHours(0, 0, 0, 0);
        const dateStr = date.toISOString().split('T')[0];
        uniqueDays.add(dateStr);
      }

      currentStreak = uniqueDays.size;
      set({ streak: currentStreak });
      await StorageService.updateStreak(currentStreak);
    } catch (error) {
      console.error('Failed to calculate streak:', error);
    }
  },
}));
