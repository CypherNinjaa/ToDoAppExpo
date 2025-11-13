// Import Service - Import tasks from various formats

import { Task, SubTask, TaskPriority, TaskCategory, TaskStatus } from '../types';

export type ImportFormat = 'json' | 'markdown';

interface ImportResult {
  success: boolean;
  tasks: Task[];
  duplicates: Task[];
  errors: string[];
  stats: {
    imported: number;
    duplicates: number;
    skipped: number;
  };
}

export class ImportService {
  /**
   * Import tasks from JSON or Markdown
   */
  static async import(
    content: string,
    format: ImportFormat,
    existingTasks: Task[]
  ): Promise<ImportResult> {
    try {
      let parsedTasks: Partial<Task>[] = [];

      switch (format) {
        case 'json':
          parsedTasks = this.parseJSON(content);
          break;
        case 'markdown':
          parsedTasks = this.parseMarkdown(content);
          break;
        default:
          throw new Error(`Unsupported import format: ${format}`);
      }

      return this.processImport(parsedTasks, existingTasks);
    } catch (error) {
      return {
        success: false,
        tasks: [],
        duplicates: [],
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        stats: { imported: 0, duplicates: 0, skipped: 0 },
      };
    }
  }

  /**
   * Parse JSON format
   */
  private static parseJSON(content: string): Partial<Task>[] {
    const data = JSON.parse(content);

    // Handle our export format
    if (data.version && data.tasks) {
      return data.tasks;
    }

    // Handle simple array format
    if (Array.isArray(data)) {
      return data;
    }

    throw new Error('Invalid JSON format');
  }

  /**
   * Parse Markdown format
   */
  private static parseMarkdown(content: string): Partial<Task>[] {
    const tasks: Partial<Task>[] = [];
    const lines = content.split('\n');
    let currentTask: Partial<Task> | null = null;
    let inCodeBlock = false;
    let codeContent = '';
    let codeLanguage = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Detect code blocks
      if (line.startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeLanguage = line.substring(3).trim() || 'plaintext';
          codeContent = '';
        } else {
          inCodeBlock = false;
          if (currentTask) {
            currentTask.codeSnippet = {
              code: codeContent.trim(),
              language: codeLanguage,
            };
          }
        }
        continue;
      }

      if (inCodeBlock) {
        codeContent += line + '\n';
        continue;
      }

      // Task title (### [x] or ### [ ])
      if (line.startsWith('###')) {
        if (currentTask) {
          tasks.push(currentTask);
        }

        const titleMatch = line.match(/###\s*\[([ x])\]\s*(.+)/);
        if (titleMatch) {
          currentTask = {
            title: titleMatch[2].trim(),
            status: titleMatch[1] === 'x' ? 'completed' : 'pending',
            priority: 'medium',
            category: 'personal',
            tags: [],
            subtasks: [],
          };
        }
        continue;
      }

      if (!currentTask) continue;

      // Description (regular text)
      if (line && !line.startsWith('-') && !line.startsWith('**') && !line.startsWith('#')) {
        currentTask.description = (currentTask.description || '') + line + ' ';
        continue;
      }

      // Metadata lines
      if (line.startsWith('- Priority:')) {
        const priority = line.match(/Priority:\s*`(\w+)`/)?.[1]?.toLowerCase();
        if (priority && ['high', 'medium', 'low'].includes(priority)) {
          currentTask.priority = priority as TaskPriority;
        }
      } else if (line.startsWith('- Category:')) {
        const category = line.match(/Category:\s*`(\w+)`/)?.[1]?.toLowerCase();
        if (
          category &&
          ['learning', 'coding', 'assignment', 'project', 'personal'].includes(category)
        ) {
          currentTask.category = category as TaskCategory;
        }
      } else if (line.startsWith('- Due Date:')) {
        const dateStr = line.split('Due Date:')[1]?.trim();
        if (dateStr) {
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) {
            currentTask.dueDate = date;
          }
        }
      } else if (line.startsWith('- Estimated Time:')) {
        const time = parseInt(line.match(/(\d+)\s*minutes?/)?.[1] || '0');
        if (time > 0) {
          currentTask.estimatedTime = time;
        }
      } else if (line.startsWith('- Tags:')) {
        const tagsStr = line.split('Tags:')[1]?.trim();
        if (tagsStr) {
          currentTask.tags = tagsStr
            .split(',')
            .map((t) => t.trim().replace(/^#/, ''))
            .filter((t) => t.length > 0);
        }
      } else if (line.startsWith('- Pomodoros:')) {
        const count = parseInt(line.match(/(\d+)/)?.[1] || '0');
        if (count > 0) {
          currentTask.pomodoroCount = count;
        }
      }

      // Subtasks
      if (line.match(/^-\s*\[([ x])\]\s*(.+)/) && currentTask.subtasks) {
        const subtaskMatch = line.match(/^-\s*\[([ x])\]\s*(.+)/);
        if (subtaskMatch) {
          currentTask.subtasks.push({
            id: Date.now().toString() + Math.random(),
            title: subtaskMatch[2].trim(),
            completed: subtaskMatch[1] === 'x',
          });
        }
      }
    }

    // Add last task
    if (currentTask) {
      tasks.push(currentTask);
    }

    return tasks;
  }

  /**
   * Process and validate imported tasks
   */
  private static processImport(parsedTasks: Partial<Task>[], existingTasks: Task[]): ImportResult {
    const result: ImportResult = {
      success: true,
      tasks: [],
      duplicates: [],
      errors: [],
      stats: { imported: 0, duplicates: 0, skipped: 0 },
    };

    for (const parsedTask of parsedTasks) {
      try {
        // Validate required fields
        const validationError = this.validateTask(parsedTask);
        if (validationError) {
          result.errors.push(`Task "${parsedTask.title || 'Unknown'}": ${validationError}`);
          result.stats.skipped++;
          continue;
        }

        // Check for duplicates
        const isDuplicate = this.isDuplicate(parsedTask, existingTasks);
        if (isDuplicate) {
          result.duplicates.push(this.normalizeTask(parsedTask));
          result.stats.duplicates++;
          continue;
        }

        // Normalize and add task
        const normalizedTask = this.normalizeTask(parsedTask);
        result.tasks.push(normalizedTask);
        result.stats.imported++;
      } catch (error) {
        result.errors.push(
          `Error processing task "${parsedTask.title || 'Unknown'}": ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
        result.stats.skipped++;
      }
    }

    result.success = result.stats.imported > 0;
    return result;
  }

  /**
   * Validate task data
   */
  private static validateTask(task: Partial<Task>): string | null {
    if (!task.title || task.title.trim().length === 0) {
      return 'Title is required';
    }

    if (task.title.length > 200) {
      return 'Title is too long (max 200 characters)';
    }

    if (task.priority && !['high', 'medium', 'low'].includes(task.priority)) {
      return `Invalid priority: ${task.priority}`;
    }

    if (
      task.category &&
      !['learning', 'coding', 'assignment', 'project', 'personal'].includes(task.category)
    ) {
      return `Invalid category: ${task.category}`;
    }

    if (task.status && !['pending', 'in-progress', 'completed', 'archived'].includes(task.status)) {
      return `Invalid status: ${task.status}`;
    }

    return null;
  }

  /**
   * Check if task is duplicate
   */
  private static isDuplicate(task: Partial<Task>, existingTasks: Task[]): boolean {
    return existingTasks.some(
      (existing) =>
        existing.title.toLowerCase() === task.title?.toLowerCase() &&
        existing.description?.toLowerCase() === task.description?.toLowerCase()
    );
  }

  /**
   * Normalize task data to match Task interface
   */
  private static normalizeTask(task: Partial<Task>): Task {
    const now = new Date();

    return {
      id: task.id || `imported-${Date.now()}-${Math.random()}`,
      title: task.title!.trim(),
      description: task.description?.trim(),
      priority: task.priority || 'medium',
      category: task.category || 'personal',
      status: task.status || 'pending',
      createdAt: task.createdAt || now,
      dueDate: task.dueDate,
      completedAt: task.completedAt,
      tags: task.tags || [],
      subtasks: task.subtasks || [],
      codeSnippet: task.codeSnippet,
      estimatedTime: task.estimatedTime,
      actualTime: task.actualTime,
      dependencies: task.dependencies || [],
      reminder: task.reminder,
      reminderEnabled: task.reminderEnabled || false,
      pomodoroCount: task.pomodoroCount,
      totalFocusTime: task.totalFocusTime,
    };
  }

  /**
   * Detect import format from content
   */
  static detectFormat(content: string): ImportFormat | null {
    const trimmed = content.trim();

    // Check for JSON
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        JSON.parse(content);
        return 'json';
      } catch {
        return null;
      }
    }

    // Check for Markdown
    if (trimmed.includes('###') || trimmed.includes('# Todo')) {
      return 'markdown';
    }

    return null;
  }

  /**
   * Validate import content
   */
  static validateContent(content: string): { valid: boolean; error?: string } {
    if (!content || content.trim().length === 0) {
      return { valid: false, error: 'Content is empty' };
    }

    const format = this.detectFormat(content);
    if (!format) {
      return {
        valid: false,
        error: 'Unable to detect format. Supported formats: JSON, Markdown',
      };
    }

    return { valid: true };
  }
}
