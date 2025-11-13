// Storage Keys Constants

export const StorageKeys = {
  // App Data
  APP_VERSION: '@devtodo:app_version',
  TASKS: '@devtodo:tasks',
  SETTINGS: '@devtodo:settings',
  USERNAME: '@devtodo:username',

  // Metadata
  LAST_SYNC: '@devtodo:last_sync',
  FIRST_LAUNCH: '@devtodo:first_launch',

  // Statistics
  STREAK: '@devtodo:streak',
  TOTAL_COMPLETED: '@devtodo:total_completed',
} as const;

export const CURRENT_VERSION = 1;
