// WeekView - Display tasks grouped by week

import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Theme } from '../../constants';
import { useTaskStore } from '../../stores';
import { Task } from '../../types';

interface WeekViewProps {
  onTaskPress?: (task: Task) => void;
}

export const WeekView: React.FC<WeekViewProps> = ({ onTaskPress }) => {
  const tasks = useTaskStore((state) => state.tasks);
  const toggleTaskComplete = useTaskStore((state) => state.toggleTaskComplete);
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week, -1 = previous, +1 = next

  // Get start of week (Monday)
  const getWeekStart = useCallback((offset: number) => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
    const weekStart = new Date(today.setDate(diff));
    weekStart.setDate(weekStart.getDate() + offset * 7);
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
  }, []);

  // Memoize week days generation
  const weekDays = useMemo(() => {
    const weekStart = getWeekStart(weekOffset);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      days.push(day);
    }
    return days;
  }, [weekOffset, getWeekStart]);

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Get tasks for a specific day
  const getTasksForDay = useCallback(
    (date: Date) => {
      const dateStr = date.toISOString().split('T')[0];
      return tasks.filter((task) => {
        if (!task.dueDate) return false;
        const taskDate = new Date(task.dueDate).toISOString().split('T')[0];
        return taskDate === dateStr;
      });
    },
    [tasks]
  );

  // Format week range
  const formatWeekRange = useCallback(() => {
    const start = weekDays[0];
    const end = weekDays[6];
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
    return `${months[start.getMonth()]} ${start.getDate()} - ${months[end.getMonth()]} ${end.getDate()}, ${end.getFullYear()}`;
  }, [weekDays]);

  const getCategoryIcon = useCallback((category: string) => {
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
  }, []);

  const getStatusIndicator = useCallback((status: string) => {
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
  }, []);

  return (
    <View style={styles.container}>
      {/* Header with navigation */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => setWeekOffset(weekOffset - 1)}
          activeOpacity={0.7}
        >
          <Text style={styles.navButtonText}>◀ Prev</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>$ ls -R ./week/</Text>
          <Text style={styles.weekRange}>{formatWeekRange()}</Text>
        </View>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => setWeekOffset(weekOffset + 1)}
          activeOpacity={0.7}
        >
          <Text style={styles.navButtonText}>Next ▶</Text>
        </TouchableOpacity>
      </View>

      {/* Week grid */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {weekDays.map((day, index) => {
          const dayTasks = getTasksForDay(day);
          const isToday = day.toDateString() === new Date().toDateString();

          return (
            <View key={index} style={styles.daySection}>
              {/* Day header */}
              <View style={styles.dayHeader}>
                <View style={styles.dayInfo}>
                  <Text style={[styles.dayName, isToday && styles.todayText]}>
                    {dayNames[index]}
                  </Text>
                  <Text style={[styles.dayDate, isToday && styles.todayText]}>{day.getDate()}</Text>
                </View>
                <Text style={styles.dayCount}>
                  {dayTasks.length} task{dayTasks.length !== 1 ? 's' : ''}
                </Text>
              </View>

              {/* Tasks for this day */}
              {dayTasks.length > 0 ? (
                <View style={styles.tasksContainer}>
                  {dayTasks.map((task) => (
                    <TouchableOpacity
                      key={task.id}
                      style={styles.taskItem}
                      onPress={() => onTaskPress?.(task)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.taskInfo}>
                        <Text style={styles.statusIndicator}>
                          {getStatusIndicator(task.status)}
                        </Text>
                        <Text style={styles.categoryIcon}>{getCategoryIcon(task.category)}</Text>
                        <Text style={styles.taskTitle} numberOfLines={1}>
                          {task.title}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation();
                          toggleTaskComplete(task.id);
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.checkIcon}>
                          {task.status === 'completed' ? '✓' : '○'}
                        </Text>
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <Text style={styles.emptyDay}>// No tasks</Text>
              )}
            </View>
          );
        })}
      </ScrollView>
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
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.md,
    color: Theme.colors.keyword,
    fontWeight: '600',
  },
  weekRange: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.comment,
    marginTop: Theme.spacing.xs,
  },
  navButton: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
  },
  navButtonText: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  daySection: {
    padding: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  dayInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
  },
  dayName: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.md,
    color: Theme.colors.variable,
    fontWeight: '600',
  },
  dayDate: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.textSecondary,
  },
  todayText: {
    color: Theme.colors.function,
  },
  dayCount: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.comment,
  },
  tasksContainer: {
    gap: Theme.spacing.xs,
  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Theme.colors.background,
    padding: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  taskInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    fontSize: 8,
    marginRight: Theme.spacing.xs,
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: Theme.spacing.sm,
  },
  taskTitle: {
    flex: 1,
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.textPrimary,
  },
  checkIcon: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.md,
    color: Theme.colors.success,
    marginLeft: Theme.spacing.sm,
  },
  emptyDay: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.comment,
    fontStyle: 'italic',
  },
});
