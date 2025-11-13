// TaskCard Component - Terminal-style Task Row with Git-style Indicators

import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Task, TaskPriority, TaskCategory } from '../../types';
import { Theme } from '../../constants';

interface TaskCardProps {
  task: Task;
  onPress?: () => void;
  onToggleComplete?: () => void;
  onDelete?: () => void;
}

const SCREEN_WIDTH = Dimensions.get('window').width;

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onPress,
  onToggleComplete,
  onDelete,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const completionAnim = useRef(new Animated.Value(0)).current;

  // Priority colors (syntax highlighting style)
  const getPriorityColor = (priority: TaskPriority): string => {
    switch (priority) {
      case 'high':
        return Theme.colors.keyword; // Blue
      case 'medium':
        return Theme.colors.string; // Orange
      case 'low':
        return Theme.colors.comment; // Gray
      default:
        return Theme.colors.textSecondary;
    }
  };

  // Category icons (terminal-style)
  const getCategoryIcon = (category: TaskCategory): string => {
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
        return '📋';
    }
  };

  // Git-style status indicator
  const getStatusIndicator = () => {
    switch (task.status) {
      case 'pending':
        return { symbol: '⚪', color: Theme.colors.textSecondary, text: 'untracked' };
      case 'in-progress':
        return { symbol: '🔴', color: Theme.colors.warning, text: 'modified' };
      case 'completed':
        return { symbol: '🟢', color: Theme.colors.success, text: 'committed' };
      case 'archived':
        return { symbol: '⚫', color: Theme.colors.textDisabled, text: 'archived' };
      default:
        return { symbol: '⚪', color: Theme.colors.textSecondary, text: 'unknown' };
    }
  };

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onPress?.();
  };

  const handleToggleComplete = () => {
    if (task.status !== 'completed') {
      Animated.timing(completionAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }

    onToggleComplete?.();
  };

  const statusInfo = getStatusIndicator();
  const priorityColor = getPriorityColor(task.priority);
  const categoryIcon = getCategoryIcon(task.category);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: scaleAnim }],
          opacity: task.status === 'completed' ? 0.6 : 1,
        },
      ]}
    >
      <TouchableOpacity style={styles.taskRow} onPress={handlePress} activeOpacity={0.7}>
        {/* Git-style status indicator */}
        <TouchableOpacity
          style={styles.statusButton}
          onPress={handleToggleComplete}
          activeOpacity={0.6}
        >
          <Text style={styles.statusSymbol}>{statusInfo.symbol}</Text>
        </TouchableOpacity>

        {/* Task content */}
        <View style={styles.content}>
          {/* Terminal-style header */}
          <View style={styles.header}>
            <Text style={[styles.permissions, { color: priorityColor }]}>-rw-r--r--</Text>
            <Text style={styles.user}>1 user</Text>
            <Text style={[styles.priority, { color: priorityColor }]}>
              {task.priority.toUpperCase()}
            </Text>
            <Text style={styles.categoryIcon}>{categoryIcon}</Text>
          </View>

          {/* Task title */}
          <Text
            style={[styles.title, task.status === 'completed' && styles.titleCompleted]}
            numberOfLines={2}
          >
            "{task.title}"
          </Text>

          {/* Task metadata */}
          <View style={styles.metadata}>
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              [{statusInfo.text}]
            </Text>

            {task.tags && task.tags.length > 0 && (
              <Text style={styles.tags} numberOfLines={1}>
                {task.tags.map((tag) => `#${tag}`).join(' ')}
              </Text>
            )}

            {task.dueDate && (
              <Text style={styles.dueDate}>
                📅{' '}
                {new Date(task.dueDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>

      {/* Completion animation overlay */}
      {task.status === 'completed' && (
        <Animated.View
          style={[
            styles.completionOverlay,
            {
              opacity: completionAnim,
            },
          ]}
        >
          <Text style={styles.completionText}>✓ Committed</Text>
        </Animated.View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Theme.layout.screenPadding,
    marginBottom: Theme.spacing.md,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    overflow: 'hidden',
  },
  taskRow: {
    flexDirection: 'row',
    padding: Theme.spacing.md,
    alignItems: 'flex-start',
  },
  statusButton: {
    marginRight: Theme.spacing.md,
    marginTop: 2,
  },
  statusSymbol: {
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.xs,
    flexWrap: 'wrap',
  },
  permissions: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.xs,
    marginRight: Theme.spacing.sm,
  },
  user: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.textSecondary,
    marginRight: Theme.spacing.sm,
  },
  priority: {
    fontFamily: Theme.typography.fontFamily.monoSemiBold,
    fontSize: Theme.typography.fontSize.xs,
    marginRight: Theme.spacing.sm,
  },
  categoryIcon: {
    fontSize: 14,
  },
  title: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.md,
    color: Theme.colors.string,
    marginBottom: Theme.spacing.sm,
    lineHeight: Theme.typography.fontSize.md * 1.4,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: Theme.colors.textDisabled,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Theme.spacing.sm,
  },
  statusText: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.xs,
  },
  tags: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.variable,
    flex: 1,
  },
  dueDate: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.function,
  },
  completionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Theme.colors.success + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completionText: {
    fontFamily: Theme.typography.fontFamily.monoBold,
    fontSize: Theme.typography.fontSize.lg,
    color: Theme.colors.success,
  },
});
