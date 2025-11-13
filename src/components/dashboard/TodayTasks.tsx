// TodayTasks - Display tasks due today

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Theme } from '../../constants';
import { useTaskStore } from '../../stores';
import { Task } from '../../types';

interface TodayTasksProps {
  onTaskPress?: (task: Task) => void;
  onAddTask?: () => void;
}

export const TodayTasks: React.FC<TodayTasksProps> = ({ onTaskPress, onAddTask }) => {
  const tasks = useTaskStore((state) => state.tasks);
  const toggleTaskComplete = useTaskStore((state) => state.toggleTaskComplete);

  // Filter tasks due today
  const todayTasks = tasks
    .filter((t) => {
      if (!t.dueDate) return false;
      const today = new Date();
      const dueDate = new Date(t.dueDate);
      return (
        dueDate.getDate() === today.getDate() &&
        dueDate.getMonth() === today.getMonth() &&
        dueDate.getFullYear() === today.getFullYear()
      );
    })
    .sort((a, b) => {
      // Sort by priority: high > medium > low
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return Theme.colors.keyword;
      case 'medium':
        return Theme.colors.string;
      case 'low':
        return Theme.colors.comment;
      default:
        return Theme.colors.textSecondary;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'learning':
        return '📚';
      case 'coding':
        return '💻';
      case 'assignment':
        return '📝';
      case 'project':
        return '🚀';
      case 'personal':
        return '👤';
      default:
        return '📌';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>$ cat ./today/tasks.json</Text>
        <Text style={styles.count}>{todayTasks.length} tasks</Text>
      </View>

      {/* Task list */}
      {todayTasks.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>// No tasks due today</Text>
          <TouchableOpacity style={styles.addButton} onPress={onAddTask} activeOpacity={0.7}>
            <Text style={styles.addButtonText}>+ Add task</Text>
          </TouchableOpacity>
        </View>
      ) : (
        todayTasks.map((task) => (
          <TouchableOpacity
            key={task.id}
            style={styles.taskCard}
            onPress={() => onTaskPress?.(task)}
            activeOpacity={0.7}
          >
            {/* Task info */}
            <View style={styles.taskHeader}>
              <Text style={styles.taskIcon}>{getCategoryIcon(task.category)}</Text>
              <Text style={styles.taskTitle} numberOfLines={1}>
                {task.title}
              </Text>
            </View>

            {/* Priority and complete button */}
            <View style={styles.taskFooter}>
              <Text style={[styles.priority, { color: getPriorityColor(task.priority) }]}>
                {task.priority.toUpperCase()}
              </Text>
              <TouchableOpacity
                style={[
                  styles.completeButton,
                  task.status === 'completed' && styles.completeButtonActive,
                ]}
                onPress={(e) => {
                  e.stopPropagation();
                  toggleTaskComplete(task.id);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.completeButtonText}>
                  {task.status === 'completed' ? '✓ Done' : '○ Complete'}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: Theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.sm,
  },
  title: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.md,
    color: Theme.colors.keyword,
    fontWeight: '600',
  },
  count: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.comment,
  },
  taskCard: {
    backgroundColor: Theme.colors.surface,
    marginHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.sm,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  taskIcon: {
    fontSize: 20,
    marginRight: Theme.spacing.sm,
  },
  taskTitle: {
    flex: 1,
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.md,
    color: Theme.colors.textPrimary,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priority: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.xs,
    fontWeight: '600',
  },
  completeButton: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  completeButtonActive: {
    backgroundColor: Theme.colors.success + '20',
    borderColor: Theme.colors.success,
  },
  completeButtonText: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Theme.spacing.xl,
  },
  emptyText: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.comment,
    marginBottom: Theme.spacing.md,
  },
  addButton: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: Theme.colors.primary,
  },
  addButtonText: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.primary,
  },
});
