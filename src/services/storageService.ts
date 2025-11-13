// Storage Service - Complete CRUD Operations with Error Handling

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, UserSettings, TaskStatus, TaskPriority } from '../types/task.types';
import { StorageKeys, CURRENT_VERSION } from './storageKeys';

// Error Types
export class StorageError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message);
    this.name = 'StorageError';
  }
}

// Default Settings
const DEFAULT_SETTINGS: UserSettings = {
  theme: 'vscode-dark',
  fontSize: 14,
  notifications: true,
  soundEnabled: false,
  defaultPriority: 'medium',
  autoArchive: true,
  weekStartsOn: 'monday',
};

/**
 * Storage Service Interface
 * Provides complete CRUD operations for tasks and settings
 */
export class StorageService {
  // ==================== INITIALIZATION ====================

  /**
   * Initialize storage service
   * Check version and run migrations if needed
   */
  static async initialize(): Promise<void> {
    try {
      const version = await this.getVersion();

      if (version === null) {
        // First launch
        await this.setVersion(CURRENT_VERSION);
        await this.setSettings(DEFAULT_SETTINGS);
        await AsyncStorage.setItem(StorageKeys.FIRST_LAUNCH, new Date().toISOString());
      } else if (version < CURRENT_VERSION) {
        // Migration needed
        await this.migrate(version, CURRENT_VERSION);
      }
    } catch (error) {
      throw new StorageError('Failed to initialize storage', 'INIT_ERROR');
    }
  }

  /**
   * Get current storage version
   */
  static async getVersion(): Promise<number | null> {
    try {
      const version = await AsyncStorage.getItem(StorageKeys.APP_VERSION);
      return version ? parseInt(version, 10) : null;
    } catch (error) {
      throw new StorageError('Failed to get storage version', 'VERSION_READ_ERROR');
    }
  }

  /**
   * Set storage version
   */
  static async setVersion(version: number): Promise<void> {
    try {
      await AsyncStorage.setItem(StorageKeys.APP_VERSION, version.toString());
    } catch (error) {
      throw new StorageError('Failed to set storage version', 'VERSION_WRITE_ERROR');
    }
  }

  // ==================== TASK CRUD OPERATIONS ====================

  /**
   * Get all tasks
   */
  static async getTasks(): Promise<Task[]> {
    try {
      const tasksJson = await AsyncStorage.getItem(StorageKeys.TASKS);
      if (!tasksJson) return [];

      const tasks = JSON.parse(tasksJson);

      // Parse dates
      return tasks.map((task: any) => ({
        ...task,
        createdAt: new Date(task.createdAt),
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        reminder: task.reminder ? new Date(task.reminder) : undefined,
        completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
      }));
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new StorageError('Corrupted task data', 'TASK_PARSE_ERROR');
      }
      throw new StorageError('Failed to get tasks', 'TASK_READ_ERROR');
    }
  }

  /**
   * Get task by ID
   */
  static async getTaskById(id: string): Promise<Task | null> {
    try {
      const tasks = await this.getTasks();
      return tasks.find((task) => task.id === id) || null;
    } catch (error) {
      throw new StorageError(`Failed to get task with id: ${id}`, 'TASK_READ_ERROR');
    }
  }

  /**
   * Get tasks by status
   */
  static async getTasksByStatus(status: TaskStatus): Promise<Task[]> {
    try {
      const tasks = await this.getTasks();
      return tasks.filter((task) => task.status === status);
    } catch (error) {
      throw new StorageError(`Failed to get tasks with status: ${status}`, 'TASK_FILTER_ERROR');
    }
  }

  /**
   * Get tasks by category
   */
  static async getTasksByCategory(category: string): Promise<Task[]> {
    try {
      const tasks = await this.getTasks();
      return tasks.filter((task) => task.category === category);
    } catch (error) {
      throw new StorageError(`Failed to get tasks with category: ${category}`, 'TASK_FILTER_ERROR');
    }
  }

  /**
   * Get tasks due today
   */
  static async getTasksDueToday(): Promise<Task[]> {
    try {
      const tasks = await this.getTasks();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      return tasks.filter((task) => {
        if (!task.dueDate) return false;
        const dueDate = new Date(task.dueDate);
        return dueDate >= today && dueDate < tomorrow;
      });
    } catch (error) {
      throw new StorageError("Failed to get today's tasks", 'TASK_FILTER_ERROR');
    }
  }

  /**
   * Add new task
   */
  static async addTask(task: Omit<Task, 'id' | 'createdAt'>): Promise<Task> {
    try {
      const tasks = await this.getTasks();

      const newTask: Task = {
        ...task,
        id: this.generateId(),
        createdAt: new Date(),
      };

      tasks.push(newTask);
      await this.saveTasks(tasks);

      return newTask;
    } catch (error) {
      throw new StorageError('Failed to add task', 'TASK_CREATE_ERROR');
    }
  }

  /**
   * Update existing task
   */
  static async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    try {
      const tasks = await this.getTasks();
      const index = tasks.findIndex((task) => task.id === id);

      if (index === -1) {
        throw new StorageError(`Task with id ${id} not found`, 'TASK_NOT_FOUND');
      }

      const updatedTask = {
        ...tasks[index],
        ...updates,
        id, // Ensure id cannot be changed
      };

      tasks[index] = updatedTask;
      await this.saveTasks(tasks);

      return updatedTask;
    } catch (error) {
      if (error instanceof StorageError) throw error;
      throw new StorageError(`Failed to update task with id: ${id}`, 'TASK_UPDATE_ERROR');
    }
  }

  /**
   * Delete task
   */
  static async deleteTask(id: string): Promise<void> {
    try {
      const tasks = await this.getTasks();
      const filteredTasks = tasks.filter((task) => task.id !== id);

      if (filteredTasks.length === tasks.length) {
        throw new StorageError(`Task with id ${id} not found`, 'TASK_NOT_FOUND');
      }

      await this.saveTasks(filteredTasks);
    } catch (error) {
      if (error instanceof StorageError) throw error;
      throw new StorageError(`Failed to delete task with id: ${id}`, 'TASK_DELETE_ERROR');
    }
  }

  /**
   * Toggle task completion
   */
  static async toggleTaskComplete(id: string): Promise<Task> {
    try {
      const task = await this.getTaskById(id);

      if (!task) {
        throw new StorageError(`Task with id ${id} not found`, 'TASK_NOT_FOUND');
      }

      const isCompleting = task.status !== 'completed';

      return await this.updateTask(id, {
        status: isCompleting ? 'completed' : 'pending',
        completedAt: isCompleting ? new Date() : undefined,
      });
    } catch (error) {
      if (error instanceof StorageError) throw error;
      throw new StorageError(`Failed to toggle task completion: ${id}`, 'TASK_UPDATE_ERROR');
    }
  }

  /**
   * Save tasks array to storage
   */
  static async saveTasks(tasks: Task[]): Promise<void> {
    try {
      const tasksJson = JSON.stringify(tasks);
      await AsyncStorage.setItem(StorageKeys.TASKS, tasksJson);
      await AsyncStorage.setItem(StorageKeys.LAST_SYNC, new Date().toISOString());
    } catch (error) {
      throw new StorageError('Failed to save tasks', 'TASK_WRITE_ERROR');
    }
  }

  // ==================== SETTINGS ====================

  /**
   * Get user settings
   */
  static async getSettings(): Promise<UserSettings> {
    try {
      const settingsJson = await AsyncStorage.getItem(StorageKeys.SETTINGS);

      if (!settingsJson) {
        return DEFAULT_SETTINGS;
      }

      return JSON.parse(settingsJson);
    } catch (error) {
      throw new StorageError('Failed to get settings', 'SETTINGS_READ_ERROR');
    }
  }

  /**
   * Update user settings
   */
  static async setSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
    try {
      const currentSettings = await this.getSettings();
      const updatedSettings = {
        ...currentSettings,
        ...settings,
      };

      await AsyncStorage.setItem(StorageKeys.SETTINGS, JSON.stringify(updatedSettings));

      return updatedSettings;
    } catch (error) {
      throw new StorageError('Failed to save settings', 'SETTINGS_WRITE_ERROR');
    }
  }

  // ==================== USERNAME ====================

  /**
   * Get username
   */
  static async getUsername(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(StorageKeys.USERNAME);
    } catch (error) {
      throw new StorageError('Failed to get username', 'USERNAME_READ_ERROR');
    }
  }

  /**
   * Set username
   */
  static async setUsername(username: string): Promise<void> {
    try {
      await AsyncStorage.setItem(StorageKeys.USERNAME, username);
    } catch (error) {
      throw new StorageError('Failed to set username', 'USERNAME_WRITE_ERROR');
    }
  }

  /**
   * Clear username
   */
  static async clearUsername(): Promise<void> {
    try {
      await AsyncStorage.removeItem(StorageKeys.USERNAME);
    } catch (error) {
      throw new StorageError('Failed to clear username', 'USERNAME_DELETE_ERROR');
    }
  }

  // ==================== STATISTICS ====================

  /**
   * Get current streak
   */
  static async getStreak(): Promise<number> {
    try {
      const streak = await AsyncStorage.getItem(StorageKeys.STREAK);
      return streak ? parseInt(streak, 10) : 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Update streak
   */
  static async updateStreak(days: number): Promise<void> {
    try {
      await AsyncStorage.setItem(StorageKeys.STREAK, days.toString());
    } catch (error) {
      throw new StorageError('Failed to update streak', 'STREAK_WRITE_ERROR');
    }
  }

  /**
   * Get total completed tasks count
   */
  static async getTotalCompleted(): Promise<number> {
    try {
      const total = await AsyncStorage.getItem(StorageKeys.TOTAL_COMPLETED);
      return total ? parseInt(total, 10) : 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Increment total completed count
   */
  static async incrementCompleted(): Promise<void> {
    try {
      const current = await this.getTotalCompleted();
      await AsyncStorage.setItem(StorageKeys.TOTAL_COMPLETED, (current + 1).toString());
    } catch (error) {
      throw new StorageError('Failed to increment completed count', 'STATS_WRITE_ERROR');
    }
  }

  // ==================== DATA MIGRATION ====================

  /**
   * Migrate data between versions
   */
  static async migrate(fromVersion: number, toVersion: number): Promise<void> {
    try {
      console.log(`Migrating from v${fromVersion} to v${toVersion}`);

      // Add migration logic here for future versions
      if (fromVersion < 2 && toVersion >= 2) {
        // Example: Migration from v1 to v2
        // await this.migrateV1toV2();
      }

      await this.setVersion(toVersion);
    } catch (error) {
      throw new StorageError(
        `Failed to migrate from v${fromVersion} to v${toVersion}`,
        'MIGRATION_ERROR'
      );
    }
  }

  // ==================== UTILITY FUNCTIONS ====================

  /**
   * Generate unique ID
   */
  private static generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clear all data (use with caution!)
   */
  static async clearAll(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      throw new StorageError('Failed to clear all data', 'CLEAR_ALL_ERROR');
    }
  }

  /**
   * Export all data
   */
  static async exportData(): Promise<string> {
    try {
      const tasks = await this.getTasks();
      const settings = await this.getSettings();
      const username = await this.getUsername();

      const exportData = {
        version: CURRENT_VERSION,
        exportDate: new Date().toISOString(),
        username,
        tasks,
        settings,
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      throw new StorageError('Failed to export data', 'EXPORT_ERROR');
    }
  }

  /**
   * Import data from JSON string
   */
  static async importData(jsonData: string): Promise<void> {
    try {
      const data = JSON.parse(jsonData);

      if (!data.version || !data.tasks) {
        throw new StorageError('Invalid import data format', 'IMPORT_INVALID_FORMAT');
      }

      // Import tasks
      if (data.tasks) {
        await this.saveTasks(data.tasks);
      }

      // Import settings
      if (data.settings) {
        await this.setSettings(data.settings);
      }

      // Import username
      if (data.username) {
        await this.setUsername(data.username);
      }
    } catch (error) {
      if (error instanceof StorageError) throw error;
      throw new StorageError('Failed to import data', 'IMPORT_ERROR');
    }
  }

  /**
   * Get storage info
   */
  static async getStorageInfo(): Promise<{
    taskCount: number;
    completedCount: number;
    streak: number;
    lastSync: string | null;
  }> {
    try {
      const tasks = await this.getTasks();
      const completedTasks = tasks.filter((t) => t.status === 'completed');
      const streak = await this.getStreak();
      const lastSync = await AsyncStorage.getItem(StorageKeys.LAST_SYNC);

      return {
        taskCount: tasks.length,
        completedCount: completedTasks.length,
        streak,
        lastSync,
      };
    } catch (error) {
      throw new StorageError('Failed to get storage info', 'INFO_ERROR');
    }
  }
}
