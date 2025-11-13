// Statistics Store - Track User Progress & Achievements

import { create } from 'zustand';
import { StorageService } from '../services/storageService';
import { Task } from '../types';

interface FocusTimeStats {
  totalFocusTime: number; // in minutes
  totalPomodoros: number;
  dailyFocusTime: number;
  weeklyFocusTime: number;
  todayPomodoros: number;
  averageDailyFocus: number;
}

interface DailyFocusData {
  date: string; // YYYY-MM-DD
  focusTime: number; // minutes
  pomodoros: number;
}

interface StatsStore {
  // State
  streak: number;
  totalCompleted: number;
  isLoading: boolean;
  focusTimeStats: FocusTimeStats;
  dailyFocusHistory: DailyFocusData[];

  // Actions
  loadStats: () => Promise<void>;
  updateStreak: (days: number) => Promise<void>;
  incrementCompleted: () => Promise<void>;
  calculateStreak: () => Promise<void>;
  calculateFocusTimeStats: (tasks: Task[]) => void;
  getDailyFocusHistory: (tasks: Task[], days: number) => DailyFocusData[];
  getTodayFocusTime: (tasks: Task[]) => number;
  getWeeklyFocusTime: (tasks: Task[]) => number;
}

export const useStatsStore = create<StatsStore>((set, get) => ({
  // Initial State
  streak: 0,
  totalCompleted: 0,
  isLoading: false,
  focusTimeStats: {
    totalFocusTime: 0,
    totalPomodoros: 0,
    dailyFocusTime: 0,
    weeklyFocusTime: 0,
    todayPomodoros: 0,
    averageDailyFocus: 0,
  },
  dailyFocusHistory: [],

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

  // Calculate focus time statistics from tasks
  calculateFocusTimeStats: (tasks: Task[]) => {
    const totalFocusTime = tasks.reduce((sum, task) => sum + (task.totalFocusTime || 0), 0);
    const totalPomodoros = tasks.reduce((sum, task) => sum + (task.pomodoroCount || 0), 0);

    const dailyFocusTime = get().getTodayFocusTime(tasks);
    const weeklyFocusTime = get().getWeeklyFocusTime(tasks);

    const todayPomodoros = tasks.reduce((sum, task) => {
      if (!task.pomodoroCount) return sum;
      // Use updatedAt or createdAt if completedAt is not set (in-progress tasks)
      const taskDate = task.completedAt ? new Date(task.completedAt) : new Date(task.createdAt);
      const today = new Date();
      if (taskDate.toDateString() === today.toDateString()) {
        return sum + (task.pomodoroCount || 0);
      }
      return sum;
    }, 0);

    // Calculate average daily focus for last 7 days
    const history = get().getDailyFocusHistory(tasks, 7);
    const averageDailyFocus =
      history.length > 0
        ? Math.round(history.reduce((sum, day) => sum + day.focusTime, 0) / history.length)
        : 0;

    set({
      focusTimeStats: {
        totalFocusTime,
        totalPomodoros,
        dailyFocusTime,
        weeklyFocusTime,
        todayPomodoros,
        averageDailyFocus,
      },
    });
  },

  // Get daily focus history for the last N days
  getDailyFocusHistory: (tasks: Task[], days: number): DailyFocusData[] => {
    const history: Map<string, DailyFocusData> = new Map();
    const today = new Date();

    // Initialize last N days
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      history.set(dateStr, { date: dateStr, focusTime: 0, pomodoros: 0 });
    }

    // Populate with actual data
    tasks.forEach((task) => {
      if (!task.totalFocusTime && !task.pomodoroCount) return;

      // Use createdAt as reference for when task was worked on
      // This ensures in-progress tasks with focus time are counted
      const taskDate = new Date(task.createdAt);
      const dateStr = taskDate.toISOString().split('T')[0];

      if (history.has(dateStr)) {
        const existing = history.get(dateStr)!;
        existing.focusTime += task.totalFocusTime || 0;
        existing.pomodoros += task.pomodoroCount || 0;
      }
    });

    return Array.from(history.values()).sort((a, b) => a.date.localeCompare(b.date));
  },

  // Get today's focus time
  getTodayFocusTime: (tasks: Task[]): number => {
    const today = new Date().toDateString();
    return tasks.reduce((sum, task) => {
      if (!task.totalFocusTime) return sum;
      // Check when task was last modified/created for in-progress tasks without completedAt
      const taskDate = task.completedAt ? new Date(task.completedAt) : new Date(task.createdAt);
      if (taskDate.toDateString() === today) {
        return sum + task.totalFocusTime;
      }
      return sum;
    }, 0);
  },

  // Get weekly focus time (last 7 days)
  getWeeklyFocusTime: (tasks: Task[]): number => {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    return tasks.reduce((sum, task) => {
      if (!task.totalFocusTime) return sum;
      const taskDate = task.completedAt ? new Date(task.completedAt) : new Date(task.createdAt);
      if (taskDate >= weekAgo && taskDate <= today) {
        return sum + task.totalFocusTime;
      }
      return sum;
    }, 0);
  },
}));
