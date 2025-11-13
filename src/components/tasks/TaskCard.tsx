// TaskCard Component - Terminal-style Task Row with Git-style Indicators

import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Task, TaskPriority, TaskCategory } from '../../types';
import { Theme } from '../../constants';

interface TaskCardProps {
  task: Task;
  username?: string;
  onPress?: () => void;
  onToggleComplete?: () => void;
  onToggleSubtask?: (subtaskId: string) => void;
  onDelete?: () => void;
  onLongPress?: () => void;
  isActive?: boolean;
}

const SCREEN_WIDTH = Dimensions.get('window').width;

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  username = 'user',
  onPress,
  onToggleComplete,
  onToggleSubtask,
  onDelete,
  onLongPress,
  isActive = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const completionAnim = useRef(new Animated.Value(0)).current;
  const mountAnim = useRef(new Animated.Value(0)).current;
  const deleteAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Mount animation - fade in and slide up when task is created
  useEffect(() => {
    Animated.parallel([
      Animated.timing(mountAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

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
      // Celebration animation with bounce and scale
      Animated.sequence([
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1.1,
            tension: 100,
            friction: 3,
            useNativeDriver: true,
          }),
          Animated.timing(completionAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 5,
          useNativeDriver: true,
        }),
      ]).start();
    }

    onToggleComplete?.();
  };

  const handleDelete = () => {
    // Delete animation - fade out and slide right
    Animated.parallel([
      Animated.timing(deleteAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 50,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDelete?.();
    });
  };

  const statusInfo = getStatusIndicator();
  const priorityColor = getPriorityColor(task.priority);
  const categoryIcon = getCategoryIcon(task.category);

  // Swipe actions
  const renderLeftActions = (progress: Animated.AnimatedInterpolation<number>) => {
    const trans = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [-80, 0],
    });

    return (
      <Animated.View
        style={[styles.swipeAction, styles.completeAction, { transform: [{ translateX: trans }] }]}
      >
        <Text style={styles.swipeActionText}>✓</Text>
        <Text style={styles.swipeActionLabel}>Complete</Text>
      </Animated.View>
    );
  };

  const renderRightActions = (progress: Animated.AnimatedInterpolation<number>) => {
    const trans = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [80, 0],
    });

    return (
      <Animated.View
        style={[styles.swipeAction, styles.deleteAction, { transform: [{ translateX: trans }] }]}
      >
        <Text style={styles.swipeActionText}>🗑️</Text>
        <Text style={styles.swipeActionLabel}>Delete</Text>
      </Animated.View>
    );
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { scale: scaleAnim },
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
          opacity: Animated.multiply(mountAnim, deleteAnim),
        },
      ]}
    >
      <Swipeable
        renderLeftActions={renderLeftActions}
        renderRightActions={renderRightActions}
        onSwipeableLeftOpen={handleToggleComplete}
        onSwipeableRightOpen={handleDelete}
        overshootLeft={false}
        overshootRight={false}
        enabled={!isActive}
      >
        <TouchableOpacity
          style={[styles.taskRow, isActive && styles.taskRowActive]}
          onPress={handlePress}
          onLongPress={onLongPress}
          activeOpacity={0.7}
        >
          {/* Drag handle indicator */}
          <View style={styles.dragHandle}>
            <Text style={styles.dragIcon}>☰</Text>
          </View>

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
              <Text style={styles.user}>1 {username}</Text>
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

            {/* Description */}
            {task.description && (
              <Text style={styles.description} numberOfLines={3}>
                // {task.description}
              </Text>
            )}

            {/* Subtasks list */}
            {task.subtasks && task.subtasks.length > 0 && (
              <View style={styles.subtasksList}>
                {task.subtasks.map((subtask) => (
                  <TouchableOpacity
                    key={subtask.id}
                    style={styles.subtaskRow}
                    onPress={() => onToggleSubtask?.(subtask.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.subtaskCheckbox}>{subtask.completed ? '☑' : '☐'}</Text>
                    <Text
                      style={[styles.subtaskText, subtask.completed && styles.subtaskCompleted]}
                      numberOfLines={1}
                    >
                      {subtask.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Code snippet preview */}
            {task.codeSnippet && (
              <View style={styles.codeBlock}>
                <Text style={styles.codeLanguage}>// {task.codeSnippet.language}</Text>
                <Text style={styles.codePreview} numberOfLines={3}>
                  {task.codeSnippet.code}
                </Text>
              </View>
            )}

            {/* Links */}
            {task.links && task.links.length > 0 && (
              <View style={styles.linksContainer}>
                {task.links.map((link, index) => (
                  <Text key={index} style={styles.linkText} numberOfLines={1}>
                    🔗 {link}
                  </Text>
                ))}
              </View>
            )}

            {/* Task metadata */}
            <View style={styles.metadata}>
              <Text style={[styles.statusText, { color: statusInfo.color }]}>
                [{statusInfo.text}]
              </Text>

              {task.subtasks && task.subtasks.length > 0 && (
                <Text style={styles.subtaskProgress}>
                  ✓ {task.subtasks.filter((st) => st.completed).length}/{task.subtasks.length}
                </Text>
              )}

              {task.tags && task.tags.length > 0 && (
                <Text style={styles.tags} numberOfLines={1}>
                  {task.tags.map((tag) => `#${tag}`).join(' ')}
                </Text>
              )}

              {task.codeSnippet && (
                <Text style={styles.codeIndicator}>
                  {'<>'} {task.codeSnippet.language}
                </Text>
              )}

              {task.estimatedTime && (
                <Text style={styles.timeIndicator}>⏱ {task.estimatedTime}m</Text>
              )}

              {task.pomodoroCount && task.pomodoroCount > 0 && (
                <Text style={styles.pomodoroIndicator}>🍅 {task.pomodoroCount}</Text>
              )}

              {task.dependencies && task.dependencies.length > 0 && (
                <Text style={styles.dependencyIndicator}>🔗 {task.dependencies.length}</Text>
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
      </Swipeable>

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
    marginHorizontal: Theme.spacing.sm,
    marginBottom: Theme.spacing.md,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    overflow: 'hidden',
  },
  taskRow: {
    flexDirection: 'row',
    padding: Theme.spacing.sm,
    paddingLeft: Theme.spacing.xs,
    alignItems: 'flex-start',
  },
  taskRowActive: {
    backgroundColor: Theme.colors.surfaceLight,
    opacity: 0.8,
  },
  dragHandle: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingRight: Theme.spacing.xs,
    paddingLeft: 0,
    width: 20,
  },
  dragIcon: {
    fontSize: 16,
    color: Theme.colors.textSecondary,
    opacity: 0.5,
  },
  statusButton: {
    marginRight: Theme.spacing.sm,
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
  description: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.comment,
    marginBottom: Theme.spacing.sm,
    lineHeight: Theme.typography.fontSize.sm * 1.4,
  },
  subtasksList: {
    marginVertical: Theme.spacing.sm,
    paddingLeft: Theme.spacing.sm,
  },
  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.xs,
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
    backgroundColor: Theme.colors.background,
    borderRadius: Theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    minHeight: 44, // Minimum touch target size
  },
  subtaskCheckbox: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: 20, // Increased from sm for better visibility
    color: Theme.colors.success,
    marginRight: Theme.spacing.sm,
    minWidth: 24, // Ensure checkbox has minimum width
  },
  subtaskText: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.textPrimary,
    flex: 1,
  },
  subtaskCompleted: {
    textDecorationLine: 'line-through',
    color: Theme.colors.textDisabled,
  },
  codeBlock: {
    backgroundColor: Theme.colors.background,
    borderRadius: Theme.borderRadius.sm,
    padding: Theme.spacing.sm,
    marginBottom: Theme.spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: Theme.colors.keyword,
  },
  codeLanguage: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.comment,
    marginBottom: Theme.spacing.xs,
  },
  codePreview: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.string,
    lineHeight: Theme.typography.fontSize.xs * 1.5,
  },
  linksContainer: {
    marginBottom: Theme.spacing.sm,
  },
  linkText: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.function,
    marginBottom: Theme.spacing.xs,
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
  subtaskProgress: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.success,
  },
  tags: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.variable,
    flex: 1,
  },
  codeIndicator: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.keyword,
  },
  timeIndicator: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.function,
  },
  pomodoroIndicator: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.error,
  },
  dependencyIndicator: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.warning,
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
  swipeAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    paddingHorizontal: Theme.spacing.md,
  },
  completeAction: {
    backgroundColor: Theme.colors.success,
  },
  deleteAction: {
    backgroundColor: Theme.colors.error,
  },
  swipeActionText: {
    fontSize: 24,
    marginBottom: 4,
  },
  swipeActionLabel: {
    fontFamily: Theme.typography.fontFamily.monoSemiBold,
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.surface,
  },
});
