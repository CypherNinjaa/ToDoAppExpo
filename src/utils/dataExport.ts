import { StorageService } from '../services/storageService';

/**
 * Export data to JSON string
 */
export const exportDataToFile = async (): Promise<string> => {
  try {
    const jsonData = await StorageService.exportData();
    return jsonData;
  } catch (error) {
    throw error;
  }
};

/**
 * Import data from JSON string
 */
export const importDataFromJSON = async (jsonData: string): Promise<void> => {
  try {
    await StorageService.importData(jsonData);
  } catch (error) {
    throw error;
  }
};

/**
 * Clear completed tasks
 */
export const clearCompletedTasks = async (): Promise<number> => {
  try {
    const tasks = await StorageService.getTasks();
    const completedTasks = tasks.filter((t) => t.status === 'completed');
    const remainingTasks = tasks.filter((t) => t.status !== 'completed');

    // Save remaining tasks
    await StorageService.clearAll();
    await StorageService.initialize();

    // Re-save non-completed tasks
    for (const task of remainingTasks) {
      await StorageService.addTask(task);
    }

    return completedTasks.length;
  } catch (error) {
    throw error;
  }
};

/**
 * Create backup string for copy to clipboard
 */
export const createBackupString = async (): Promise<string> => {
  try {
    return await StorageService.exportData();
  } catch (error) {
    throw error;
  }
};
