// Task Store - Complete Task Management with Zustand

import { create } from 'zustand';
import { Task, TaskStatus, TaskCategory } from '../types';
import { StorageService } from '../services/storageService';

interface TaskStore {
  // State
  tasks: Task[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadTasks: () => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskComplete: (id: string) => Promise<void>;

  // Selectors (computed values)
  getTaskById: (id: string) => Task | undefined;
  getTasksByStatus: (status: TaskStatus) => Task[];
  getTasksByCategory: (category: TaskCategory) => Task[];
  getTasksDueToday: () => Task[];
  getPendingTasks: () => Task[];
  getCompletedTasks: () => Task[];
  getInProgressTasks: () => Task[];

  // Utility
  clearError: () => void;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  // Initial State
  tasks: [],
  isLoading: false,
  error: null,

  // Load tasks from storage
  loadTasks: async () => {
    set({ isLoading: true, error: null });
    try {
      const tasks = await StorageService.getTasks();
      set({ tasks, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load tasks',
        isLoading: false,
      });
    }
  },

  // Add new task
  addTask: async (taskData) => {
    set({ isLoading: true, error: null });
    try {
      const newTask = await StorageService.addTask(taskData);
      set((state) => ({
        tasks: [...state.tasks, newTask],
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to add task',
        isLoading: false,
      });
      throw error;
    }
  },

  // Update existing task
  updateTask: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const updatedTask = await StorageService.updateTask(id, updates);
      set((state) => ({
        tasks: state.tasks.map((task) => (task.id === id ? updatedTask : task)),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update task',
        isLoading: false,
      });
      throw error;
    }
  },

  // Delete task
  deleteTask: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await StorageService.deleteTask(id);
      set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete task',
        isLoading: false,
      });
      throw error;
    }
  },

  // Toggle task completion
  toggleTaskComplete: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const updatedTask = await StorageService.toggleTaskComplete(id);
      set((state) => ({
        tasks: state.tasks.map((task) => (task.id === id ? updatedTask : task)),
        isLoading: false,
      }));

      // Increment completed count if task was completed
      if (updatedTask.status === 'completed') {
        await StorageService.incrementCompleted();
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to toggle task',
        isLoading: false,
      });
      throw error;
    }
  },

  // Selectors
  getTaskById: (id) => {
    return get().tasks.find((task) => task.id === id);
  },

  getTasksByStatus: (status) => {
    return get().tasks.filter((task) => task.status === status);
  },

  getTasksByCategory: (category) => {
    return get().tasks.filter((task) => task.category === category);
  },

  getTasksDueToday: () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return get().tasks.filter((task) => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      return dueDate >= today && dueDate < tomorrow;
    });
  },

  getPendingTasks: () => {
    return get().tasks.filter((task) => task.status === 'pending');
  },

  getCompletedTasks: () => {
    return get().tasks.filter((task) => task.status === 'completed');
  },

  getInProgressTasks: () => {
    return get().tasks.filter((task) => task.status === 'in-progress');
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
}));
