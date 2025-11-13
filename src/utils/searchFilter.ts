// Search & Filter Utilities

import { Task, TaskCategory, TaskPriority, TaskStatus } from '../types';
import { SortOption, SortDirection } from '../components/inputs/SortSelector';

/**
 * Search tasks by query string
 * Supports text search and regex patterns
 */
export const searchTasks = (tasks: Task[], query: string, useRegex: boolean = false): Task[] => {
  if (!query.trim()) return tasks;

  try {
    if (useRegex) {
      // Regex search
      const regex = new RegExp(query, 'i');
      return tasks.filter(
        (task) =>
          regex.test(task.title) ||
          (task.description && regex.test(task.description)) ||
          task.tags?.some((tag) => regex.test(tag)) ||
          (task.codeSnippet && regex.test(task.codeSnippet.code))
      );
    } else {
      // Text search (case-insensitive)
      const lowerQuery = query.toLowerCase();
      return tasks.filter(
        (task) =>
          task.title.toLowerCase().includes(lowerQuery) ||
          (task.description && task.description.toLowerCase().includes(lowerQuery)) ||
          task.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
          (task.codeSnippet && task.codeSnippet.code.toLowerCase().includes(lowerQuery))
      );
    }
  } catch (error) {
    // If regex is invalid, fall back to text search
    const lowerQuery = query.toLowerCase();
    return tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(lowerQuery) ||
        (task.description && task.description.toLowerCase().includes(lowerQuery))
    );
  }
};

/**
 * Filter tasks by multiple criteria
 */
export const filterTasks = (
  tasks: Task[],
  filters: {
    categories?: TaskCategory[];
    priorities?: TaskPriority[];
    statuses?: TaskStatus[];
    tags?: string[];
    dateRange?: { start: Date; end: Date };
  }
): Task[] => {
  let filtered = tasks;

  // Filter by categories
  if (filters.categories && filters.categories.length > 0) {
    filtered = filtered.filter((task) => filters.categories!.includes(task.category));
  }

  // Filter by priorities
  if (filters.priorities && filters.priorities.length > 0) {
    filtered = filtered.filter((task) => filters.priorities!.includes(task.priority));
  }

  // Filter by statuses
  if (filters.statuses && filters.statuses.length > 0) {
    filtered = filtered.filter((task) => filters.statuses!.includes(task.status));
  }

  // Filter by tags
  if (filters.tags && filters.tags.length > 0) {
    filtered = filtered.filter((task) => filters.tags!.some((tag) => task.tags?.includes(tag)));
  }

  // Filter by date range
  if (filters.dateRange) {
    const { start, end } = filters.dateRange;
    filtered = filtered.filter((task) => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      return dueDate >= start && dueDate <= end;
    });
  }

  return filtered;
};

/**
 * Sort tasks by various criteria
 */
export const sortTasks = (tasks: Task[], sortBy: SortOption, direction: SortDirection): Task[] => {
  const sorted = [...tasks];

  const priorityOrder = { high: 0, medium: 1, low: 2 };
  const statusOrder = { pending: 0, 'in-progress': 1, completed: 2, archived: 3 };

  sorted.sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'priority':
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
        break;

      case 'date':
        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        comparison = dateA - dateB;
        break;

      case 'status':
        comparison = statusOrder[a.status] - statusOrder[b.status];
        break;

      case 'category':
        comparison = a.category.localeCompare(b.category);
        break;

      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
    }

    return direction === 'asc' ? comparison : -comparison;
  });

  return sorted;
};

/**
 * Get all unique tags from tasks
 */
export const getAllTags = (tasks: Task[]): string[] => {
  const tagSet = new Set<string>();
  tasks.forEach((task) => {
    task.tags?.forEach((tag) => tagSet.add(tag));
  });
  return Array.from(tagSet).sort();
};

/**
 * Combined search, filter, and sort
 */
export const processTaskList = (
  tasks: Task[],
  searchQuery: string,
  useRegex: boolean,
  filters: Parameters<typeof filterTasks>[1],
  sortBy: SortOption,
  sortDirection: SortDirection
): Task[] => {
  let processed = tasks;

  // 1. Search
  if (searchQuery) {
    processed = searchTasks(processed, searchQuery, useRegex);
  }

  // 2. Filter
  processed = filterTasks(processed, filters);

  // 3. Sort
  processed = sortTasks(processed, sortBy, sortDirection);

  return processed;
};
