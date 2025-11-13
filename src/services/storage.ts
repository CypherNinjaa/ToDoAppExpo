import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  USERNAME: '@devtodo:username',
  TASKS: '@devtodo:tasks',
  SETTINGS: '@devtodo:settings',
};

export const StorageService = {
  // Username
  async getUsername(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.USERNAME);
    } catch (error) {
      console.error('Error getting username:', error);
      return null;
    }
  },

  async setUsername(username: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USERNAME, username);
    } catch (error) {
      console.error('Error setting username:', error);
    }
  },

  async clearUsername(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USERNAME);
    } catch (error) {
      console.error('Error clearing username:', error);
    }
  },

  // Tasks (for future use)
  async getTasks(): Promise<any[]> {
    try {
      const tasks = await AsyncStorage.getItem(STORAGE_KEYS.TASKS);
      return tasks ? JSON.parse(tasks) : [];
    } catch (error) {
      console.error('Error getting tasks:', error);
      return [];
    }
  },

  async setTasks(tasks: any[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error setting tasks:', error);
    }
  },

  // Clear all data
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },
};
