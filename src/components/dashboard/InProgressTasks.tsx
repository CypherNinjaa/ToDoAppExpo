// InProgressTasks - Display tasks currently in progress

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Theme } from '../../constants';
import { useTaskStore } from '../../stores';
import { Task } from '../../types';

interface InProgressTasksProps {
  onTaskPress?: (task: Task) => void;
}

export const InProgressTasks: React.FC<InProgressTasksProps> = ({ onTaskPress }) => {
  const tasks = useTaskStore((state) => state.tasks);
  const toggleTaskComplete = useTaskStore((state) => state.toggleTaskComplete);

  // Filter in-progress tasks
  const inProgressTasks = tasks.filter((t) => t.status === 'in-progress');

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

  if (inProgressTasks.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>$ git status --short</Text>
        <Text style={styles.count}>🔴 {inProgressTasks.length} modified</Text>
      </View>

      {/* Task list */}
      {inProgressTasks.map((task) => (
        <TouchableOpacity
          key={task.id}
          style={styles.taskCard}
          onPress={() => onTaskPress?.(task)}
          activeOpacity={0.7}
        >
          {/* Modified indicator */}
          <View style={styles.taskHeader}>
            <Text style={styles.modifiedIndicator}>M </Text>
            <Text style={styles.taskIcon}>{getCategoryIcon(task.category)}</Text>
            <Text style={styles.taskTitle} numberOfLines={1}>
              {task.title}
            </Text>
          </View>

          {/* Actions */}
          <View style={styles.taskFooter}>
            <Text style={styles.priority}>{task.priority.toUpperCase()}</Text>
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => onTaskPress?.(task)}
                activeOpacity={0.7}
              >
                <Text style={styles.actionText}>→ Continue</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.completeButton]}
                onPress={(e) => {
                  e.stopPropagation();
                  toggleTaskComplete(task.id);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.actionText}>✓ Complete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      ))}
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
    borderColor: Theme.colors.error + '40',
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  modifiedIndicator: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.md,
    color: Theme.colors.error,
    fontWeight: '700',
    marginRight: Theme.spacing.xs,
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
    color: Theme.colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
  },
  actionButton: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  completeButton: {
    backgroundColor: Theme.colors.success + '20',
    borderColor: Theme.colors.success,
  },
  actionText: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.textSecondary,
  },
});
