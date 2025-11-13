// Task Store - Complete Task Management with Zustand

import { create } from 'zustand';
import { Task, TaskStatus, TaskCategory } from '../types';
import { StorageService } from '../services/storageService';
import { notificationService } from '../services/notificationService';

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
  toggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;

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

      // Schedule notification if reminder is enabled
      if (newTask.reminderEnabled && newTask.reminder) {
        const notificationId = await notificationService.scheduleTaskReminder(newTask);
        if (notificationId) {
          // Update task with notification ID
          await StorageService.updateTask(newTask.id, { notificationId });
          newTask.notificationId = notificationId;
        }
      }

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
      const oldTask = get().tasks.find((t) => t.id === id);
      const updatedTask = await StorageService.updateTask(id, updates);

      // Handle reminder notification updates
      if (oldTask) {
        // Cancel old notification if it exists
        if (oldTask.notificationId && oldTask.reminderEnabled) {
          await notificationService.cancelTaskReminder(oldTask.notificationId);
        }

        // Schedule new notification if reminder is enabled
        if (updatedTask.reminderEnabled && updatedTask.reminder) {
          const notificationId = await notificationService.scheduleTaskReminder(updatedTask);
          if (notificationId) {
            await StorageService.updateTask(id, { notificationId });
            updatedTask.notificationId = notificationId;
          }
        }
      }

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
      const task = get().tasks.find((t) => t.id === id);

      // Cancel notification if exists
      if (task?.notificationId && task.reminderEnabled) {
        await notificationService.cancelTaskReminder(task.notificationId);
      }

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

  // Toggle subtask completion
  toggleSubtask: async (taskId: string, subtaskId: string) => {
    try {
      const task = get().tasks.find((t) => t.id === taskId);
      if (!task || !task.subtasks) return;

      const updatedSubtasks = task.subtasks.map((subtask) =>
        subtask.id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask
      );

      await get().updateTask(taskId, { subtasks: updatedSubtasks });
    } catch (error) {
      console.error('Failed to toggle subtask:', error);
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
