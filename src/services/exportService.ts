// Export Service - Export tasks in multiple formats

import { Task } from '../types';
import * as Clipboard from 'expo-clipboard';

export type ExportFormat = 'json' | 'markdown' | 'text' | 'github';

interface ExportOptions {
  format: ExportFormat;
  tasks: Task[];
  dateRange?: { start: Date; end: Date };
  categories?: string[];
  includeCompleted?: boolean;
  includeArchived?: boolean;
}

export class ExportService {
  /**
   * Export tasks in the specified format
   */
  static async export(options: ExportOptions): Promise<string> {
    const { format, tasks } = options;
    const filteredTasks = this.filterTasks(tasks, options);

    switch (format) {
      case 'json':
        return this.exportToJSON(filteredTasks);
      case 'markdown':
        return this.exportToMarkdown(filteredTasks);
      case 'text':
        return this.exportToText(filteredTasks);
      case 'github':
        return this.exportToGitHubIssues(filteredTasks);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Filter tasks based on export options
   */
  private static filterTasks(tasks: Task[], options: ExportOptions): Task[] {
    let filtered = [...tasks];

    // Filter by date range
    if (options.dateRange) {
      filtered = filtered.filter((task) => {
        if (!task.createdAt) return false;
        const taskDate = new Date(task.createdAt);
        return taskDate >= options.dateRange!.start && taskDate <= options.dateRange!.end;
      });
    }

    // Filter by categories
    if (options.categories && options.categories.length > 0) {
      filtered = filtered.filter((task) => options.categories!.includes(task.category));
    }

    // Filter by status
    if (!options.includeCompleted) {
      filtered = filtered.filter((task) => task.status !== 'completed');
    }

    if (!options.includeArchived) {
      filtered = filtered.filter((task) => task.status !== 'archived');
    }

    return filtered;
  }

  /**
   * Export to JSON format
   */
  private static exportToJSON(tasks: Task[]): string {
    const exportData = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      taskCount: tasks.length,
      tasks: tasks,
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Export to Markdown format
   */
  private static exportToMarkdown(tasks: Task[]): string {
    let markdown = `# Todo App Export\n\n`;
    markdown += `**Exported:** ${new Date().toLocaleDateString()}\n`;
    markdown += `**Total Tasks:** ${tasks.length}\n\n`;
    markdown += `---\n\n`;

    // Group by status
    const grouped = this.groupTasksByStatus(tasks);

    for (const [status, statusTasks] of Object.entries(grouped)) {
      if (statusTasks.length === 0) continue;

      markdown += `## ${this.capitalizeFirst(status)} (${statusTasks.length})\n\n`;

      for (const task of statusTasks) {
        const checkbox = task.status === 'completed' ? '[x]' : '[ ]';
        markdown += `### ${checkbox} ${task.title}\n\n`;

        if (task.description) {
          markdown += `${task.description}\n\n`;
        }

        // Metadata
        markdown += `**Details:**\n`;
        markdown += `- Priority: \`${task.priority}\`\n`;
        markdown += `- Category: \`${task.category}\`\n`;

        if (task.dueDate) {
          markdown += `- Due Date: ${new Date(task.dueDate).toLocaleDateString()}\n`;
        }

        if (task.estimatedTime) {
          markdown += `- Estimated Time: ${task.estimatedTime} minutes\n`;
        }

        if (task.pomodoroCount) {
          markdown += `- Pomodoros: 🍅 ${task.pomodoroCount}\n`;
        }

        if (task.tags && task.tags.length > 0) {
          markdown += `- Tags: ${task.tags.map((t) => `#${t}`).join(', ')}\n`;
        }

        // Subtasks
        if (task.subtasks && task.subtasks.length > 0) {
          markdown += `\n**Subtasks:**\n\n`;
          for (const subtask of task.subtasks) {
            const subCheckbox = subtask.completed ? '[x]' : '[ ]';
            markdown += `- ${subCheckbox} ${subtask.title}\n`;
          }
        }

        // Code snippet
        if (task.codeSnippet) {
          markdown += `\n**Code Snippet (${task.codeSnippet.language}):**\n\n`;
          markdown += `\`\`\`${task.codeSnippet.language}\n`;
          markdown += `${task.codeSnippet.code}\n`;
          markdown += `\`\`\`\n`;
        }

        markdown += `\n---\n\n`;
      }
    }

    return markdown;
  }

  /**
   * Export to plain text format
   */
  private static exportToText(tasks: Task[]): string {
    let text = `TODO APP EXPORT\n`;
    text += `${'='.repeat(50)}\n\n`;
    text += `Exported: ${new Date().toLocaleString()}\n`;
    text += `Total Tasks: ${tasks.length}\n\n`;

    const grouped = this.groupTasksByStatus(tasks);

    for (const [status, statusTasks] of Object.entries(grouped)) {
      if (statusTasks.length === 0) continue;

      text += `\n${status.toUpperCase()} TASKS (${statusTasks.length})\n`;
      text += `${'-'.repeat(50)}\n\n`;

      for (const task of statusTasks) {
        const checkbox = task.status === 'completed' ? '[✓]' : '[ ]';
        text += `${checkbox} ${task.title}\n`;

        if (task.description) {
          text += `    ${task.description}\n`;
        }

        text += `    Priority: ${task.priority.toUpperCase()} | Category: ${task.category}\n`;

        if (task.dueDate) {
          text += `    Due: ${new Date(task.dueDate).toLocaleDateString()}\n`;
        }

        if (task.tags && task.tags.length > 0) {
          text += `    Tags: ${task.tags.map((t) => `#${t}`).join(' ')}\n`;
        }

        if (task.pomodoroCount) {
          text += `    Pomodoros: ${task.pomodoroCount} 🍅\n`;
        }

        if (task.subtasks && task.subtasks.length > 0) {
          text += `    Subtasks: ${task.subtasks.filter((s) => s.completed).length}/${task.subtasks.length} complete\n`;
        }

        text += `\n`;
      }
    }

    return text;
  }

  /**
   * Export to GitHub Issues format
   */
  private static exportToGitHubIssues(tasks: Task[]): string {
    let output = `# GitHub Issues Export\n\n`;
    output += `Copy and paste each section below as a new GitHub issue.\n\n`;
    output += `---\n\n`;

    for (const task of tasks) {
      if (task.status === 'completed' || task.status === 'archived') continue;

      output += `## Issue: ${task.title}\n\n`;

      // Labels
      const labels: string[] = [];
      labels.push(task.priority);
      labels.push(task.category);
      if (task.status === 'in-progress') labels.push('in-progress');
      if (task.tags) labels.push(...task.tags);

      output += `**Labels:** ${labels.map((l) => `\`${l}\``).join(', ')}\n\n`;

      // Description
      if (task.description) {
        output += `### Description\n\n${task.description}\n\n`;
      }

      // Tasks checklist
      if (task.subtasks && task.subtasks.length > 0) {
        output += `### Tasks\n\n`;
        for (const subtask of task.subtasks) {
          const checkbox = subtask.completed ? '[x]' : '[ ]';
          output += `- ${checkbox} ${subtask.title}\n`;
        }
        output += `\n`;
      }

      // Code snippet
      if (task.codeSnippet) {
        output += `### Code Reference\n\n`;
        output += `\`\`\`${task.codeSnippet.language}\n`;
        output += `${task.codeSnippet.code}\n`;
        output += `\`\`\`\n\n`;
      }

      // Metadata
      output += `### Metadata\n\n`;
      if (task.estimatedTime) {
        output += `- Estimated Time: ${task.estimatedTime} minutes\n`;
      }
      if (task.dueDate) {
        output += `- Due Date: ${new Date(task.dueDate).toLocaleDateString()}\n`;
      }
      if (task.pomodoroCount) {
        output += `- Pomodoros Completed: ${task.pomodoroCount}\n`;
      }

      output += `\n---\n\n`;
    }

    return output;
  }

  /**
   * Copy export to clipboard
   */
  static async copyToClipboard(content: string): Promise<void> {
    await Clipboard.setStringAsync(content);
  }

  /**
   * Get export filename
   */
  static getExportFilename(format: ExportFormat): string {
    const timestamp = new Date().toISOString().split('T')[0];
    const extensions: Record<ExportFormat, string> = {
      json: 'json',
      markdown: 'md',
      text: 'txt',
      github: 'md',
    };

    return `todo-export-${timestamp}.${extensions[format]}`;
  }

  /**
   * Helper: Group tasks by status
   */
  private static groupTasksByStatus(tasks: Task[]): Record<string, Task[]> {
    return tasks.reduce(
      (groups, task) => {
        const status = task.status;
        if (!groups[status]) {
          groups[status] = [];
        }
        groups[status].push(task);
        return groups;
      },
      {} as Record<string, Task[]>
    );
  }

  /**
   * Helper: Capitalize first letter
   */
  private static capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Get export statistics
   */
  static getExportStats(tasks: Task[]): {
    total: number;
    byStatus: Record<string, number>;
    byCategory: Record<string, number>;
    byPriority: Record<string, number>;
  } {
    const stats = {
      total: tasks.length,
      byStatus: {} as Record<string, number>,
      byCategory: {} as Record<string, number>,
      byPriority: {} as Record<string, number>,
    };

    tasks.forEach((task) => {
      // Count by status
      stats.byStatus[task.status] = (stats.byStatus[task.status] || 0) + 1;

      // Count by category
      stats.byCategory[task.category] = (stats.byCategory[task.category] || 0) + 1;

      // Count by priority
      stats.byPriority[task.priority] = (stats.byPriority[task.priority] || 0) + 1;
    });

    return stats;
  }
}
