// Task Type Definitions

export type TaskCategory = 'learning' | 'coding' | 'assignment' | 'project' | 'personal';
export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'archived';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
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
  createdAt: Date;
  completedAt?: Date;
  estimatedTime?: number; // in minutes
  actualTime?: number; // in minutes
  subtasks?: SubTask[];
  codeSnippet?: string;
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
}

export interface AppData {
  version: number;
  tasks: Task[];
  settings: UserSettings;
  lastSync: Date;
}
