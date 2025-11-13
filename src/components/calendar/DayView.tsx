// DayView - Detailed view of tasks for a specific day

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Theme } from '../../constants';
import { useTaskStore } from '../../stores';
import { Task } from '../../types';

interface DayViewProps {
  selectedDate: string;
  onTaskPress?: (task: Task) => void;
  onAddTask?: (date: string) => void;
}

export const DayView: React.FC<DayViewProps> = ({ selectedDate, onTaskPress, onAddTask }) => {
  const tasks = useTaskStore((state) => state.tasks);
  const toggleTaskComplete = useTaskStore((state) => state.toggleTaskComplete);

  // Filter tasks for selected date
  const dayTasks = tasks.filter((task) => {
    if (!task.dueDate) return false;
    const taskDate = new Date(task.dueDate).toISOString().split('T')[0];
    return taskDate === selectedDate;
  });

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
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

  const getStatusIndicator = (status: string) => {
    switch (status) {
      case 'completed':
        return '🟢';
      case 'in-progress':
        return '🔴';
      case 'pending':
        return '⚪';
      default:
        return '⚫';
    }
  };

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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>$ ls -la ./{selectedDate}/</Text>
          <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => onAddTask?.(selectedDate)}
          activeOpacity={0.7}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Task count */}
      <Text style={styles.count}>
        // {dayTasks.length} task{dayTasks.length !== 1 ? 's' : ''} scheduled
      </Text>

      {/* Tasks list */}
      {dayTasks.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>// No tasks scheduled for this day</Text>
          <TouchableOpacity
            style={styles.emptyAddButton}
            onPress={() => onAddTask?.(selectedDate)}
            activeOpacity={0.7}
          >
            <Text style={styles.emptyAddText}>$ touch new-task.json</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.tasksList} showsVerticalScrollIndicator={false}>
          {dayTasks.map((task) => (
            <TouchableOpacity
              key={task.id}
              style={styles.taskCard}
              onPress={() => onTaskPress?.(task)}
              activeOpacity={0.7}
            >
              {/* Task header */}
              <View style={styles.taskHeader}>
                <Text style={styles.statusIndicator}>{getStatusIndicator(task.status)}</Text>
                <Text style={styles.categoryIcon}>{getCategoryIcon(task.category)}</Text>
                <Text style={styles.taskTitle} numberOfLines={1}>
                  {task.title}
                </Text>
              </View>

              {/* Task description */}
              {task.description ? (
                <Text style={styles.taskDescription} numberOfLines={2}>
                  {task.description}
                </Text>
              ) : null}

              {/* Task footer */}
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
                    {task.status === 'completed' ? '✓ Completed' : '○ Mark Done'}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.md,
    marginHorizontal: Theme.spacing.lg,
    marginTop: Theme.spacing.md,
    padding: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.sm,
  },
  title: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.md,
    color: Theme.colors.keyword,
    fontWeight: '600',
  },
  dateText: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.textSecondary,
    marginTop: Theme.spacing.xs,
  },
  addButton: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: Theme.colors.primary,
    backgroundColor: Theme.colors.primary + '20',
  },
  addButtonText: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.primary,
  },
  count: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.comment,
    marginBottom: Theme.spacing.md,
  },
  tasksList: {
    flex: 1,
  },
  taskCard: {
    backgroundColor: Theme.colors.background,
    borderRadius: Theme.borderRadius.sm,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.xs,
  },
  statusIndicator: {
    fontSize: 10,
    marginRight: Theme.spacing.xs,
  },
  categoryIcon: {
    fontSize: 18,
    marginRight: Theme.spacing.sm,
  },
  taskTitle: {
    flex: 1,
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.md,
    color: Theme.colors.textPrimary,
  },
  taskDescription: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.sm,
    lineHeight: 18,
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Theme.spacing.xxl,
  },
  emptyText: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.comment,
    marginBottom: Theme.spacing.lg,
  },
  emptyAddButton: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: Theme.colors.primary,
  },
  emptyAddText: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.primary,
  },
});
