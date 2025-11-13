// Task Type Definitions

export type TaskCategory = 'learning' | 'coding' | 'assignment' | 'project' | 'personal';
export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'archived';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface CodeSnippet {
  code: string;
  language: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  tags: string[];
  dueDate?: Date;
  reminder?: Date;
  reminderEnabled?: boolean; // whether reminder notifications are enabled
  notificationId?: string; // ID of scheduled notification for cancellation
  createdAt: Date;
  completedAt?: Date;
  estimatedTime?: number; // in minutes
  actualTime?: number; // in minutes
  timerStartedAt?: Date; // when timer was started
  subtasks?: SubTask[];
  codeSnippet?: CodeSnippet;
  dependencies?: string[]; // task IDs this task depends on
  links?: string[];
}

export interface UserSettings {
  theme: string;
  fontSize: number;
  notifications: boolean;
  soundEnabled: boolean;
  defaultPriority: TaskPriority;
  autoArchive: boolean;
  weekStartsOn: 'monday' | 'sunday';
  // Notification preferences
  dailySummaryEnabled?: boolean;
  dailySummaryTime?: string; // "HH:MM" format
  streakNotificationsEnabled?: boolean;
  overdueAlertsEnabled?: boolean;
  upcomingDeadlineHours?: number; // hours before deadline to notify
  // Display preferences
  dateFormat?: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  use24HourTime?: boolean;
  // Timer preferences
  focusDuration?: number; // in seconds
  breakDuration?: number; // in seconds
  longBreakInterval?: number; // number of pomodoros before long break
}

export interface AppData {
  version: number;
  tasks: Task[];
  settings: UserSettings;
  lastSync: Date;
}
