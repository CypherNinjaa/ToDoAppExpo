import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Theme, CommonStyles } from '../constants';
import { useTaskStore } from '../stores';
import { TaskCard } from '../components/tasks';
import { TaskFormScreen } from './TaskFormScreen';
import { Task, TaskStatus, TaskCategory, TaskPriority } from '../types';

interface TasksScreenProps {
  username: string;
}

type FilterType = 'all' | TaskStatus;
type SortType = 'date' | 'priority' | 'category';

export const TasksScreen: React.FC<TasksScreenProps> = ({ username }) => {
  const [displayedText, setDisplayedText] = useState('');
  const fullText = '~$ ./list-tasks.sh --all';

  const tasks = useTaskStore((state) => state.tasks);
  const isLoading = useTaskStore((state) => state.isLoading);
  const loadTasks = useTaskStore((state) => state.loadTasks);
  const toggleTaskComplete = useTaskStore((state) => state.toggleTaskComplete);
  const deleteTask = useTaskStore((state) => state.deleteTask);

  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('date');
  const [refreshing, setRefreshing] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);

  useEffect(() => {
    let index = 0;
    setDisplayedText('');

    const interval = setInterval(() => {
      if (index < fullText.length) {
        setDisplayedText(fullText.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [fullText]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  };

  // Filter tasks
  const getFilteredTasks = (): Task[] => {
    if (filter === 'all') return tasks;
    return tasks.filter((task) => task.status === filter);
  };

  // Sort tasks
  const getSortedTasks = (tasksToSort: Task[]): Task[] => {
    const sorted = [...tasksToSort];

    switch (sortBy) {
      case 'priority':
        const priorityOrder: Record<TaskPriority, number> = {
          high: 0,
          medium: 1,
          low: 2,
        };
        return sorted.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

      case 'category':
        return sorted.sort((a, b) => a.category.localeCompare(b.category));

      case 'date':
      default:
        return sorted.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
  };

  const filteredAndSortedTasks = getSortedTasks(getFilteredTasks());

  // Handle task actions
  const handleToggleComplete = async (taskId: string) => {
    try {
      await toggleTaskComplete(taskId);
    } catch (error) {
      console.error('Failed to toggle task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  // Filter buttons
  const filters: { label: string; value: FilterType }[] = [
    { label: 'all', value: 'all' },
    { label: 'pending', value: 'pending' },
    { label: 'in-progress', value: 'in-progress' },
    { label: 'completed', value: 'completed' },
  ];

  // Sort buttons
  const sortOptions: { label: string; value: SortType }[] = [
    { label: 'date', value: 'date' },
    { label: 'priority', value: 'priority' },
    { label: 'category', value: 'category' },
  ];

  // Empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📋</Text>
      <Text style={styles.emptyTitle}>$ ls -la /tasks/{filter}</Text>
      <Text style={styles.emptyText}>// No tasks found</Text>
      <Text style={styles.emptyHint}>
        {filter === 'all'
          ? 'Create your first task to get started'
          : `No ${filter} tasks at the moment`}
      </Text>
    </View>
  );

  // Loading state
  if (isLoading && tasks.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {displayedText}
            <Text style={styles.cursor}>▊</Text>
          </Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
          <Text style={styles.loadingText}>// Loading tasks...</Text>
        </View>
      </View>
    );
  }

  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {displayedText}
            <Text style={styles.cursor}>▊</Text>
          </Text>

          {/* Task count */}
          <Text style={styles.count}>$ wc -l /tasks → {filteredAndSortedTasks.length} tasks</Text>
        </View>

        {/* Filter row */}
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>$ grep --status=</Text>
          <View style={styles.filterButtons}>
            {filters.map((item) => (
              <TouchableOpacity
                key={item.value}
                style={[styles.filterButton, filter === item.value && styles.filterButtonActive]}
                onPress={() => setFilter(item.value)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    filter === item.value && styles.filterButtonTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Sort row */}
        <View style={styles.sortRow}>
          <Text style={styles.sortLabel}>$ sort --by=</Text>
          <View style={styles.sortButtons}>
            {sortOptions.map((item) => (
              <TouchableOpacity
                key={item.value}
                style={[styles.sortButton, sortBy === item.value && styles.sortButtonActive]}
                onPress={() => setSortBy(item.value)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.sortButtonText,
                    sortBy === item.value && styles.sortButtonTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Task list */}
        <FlatList
          data={filteredAndSortedTasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TaskCard
              task={item}
              onToggleComplete={() => handleToggleComplete(item.id)}
              onDelete={() => handleDeleteTask(item.id)}
            />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Theme.colors.primary}
              colors={[Theme.colors.primary]}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* FAB - Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowTaskForm(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>$ touch new-task.json</Text>
      </TouchableOpacity>

      {/* Task Form Modal */}
      <Modal
        visible={showTaskForm}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowTaskForm(false)}
      >
        <TaskFormScreen onClose={() => setShowTaskForm(false)} />
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    ...CommonStyles.container,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: Theme.layout.screenPadding,
    paddingBottom: Theme.spacing.md,
    backgroundColor: Theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  title: {
    ...CommonStyles.h2,
    fontFamily: Theme.typography.fontFamily.mono,
    color: Theme.colors.keyword,
  },
  cursor: {
    color: Theme.colors.primary,
  },
  count: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.comment,
    marginTop: Theme.spacing.xs,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Theme.layout.screenPadding,
    paddingVertical: Theme.spacing.sm,
    backgroundColor: Theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  filterLabel: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.comment,
    marginRight: Theme.spacing.sm,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: Theme.spacing.xs,
    flex: 1,
    flexWrap: 'wrap',
  },
  filterButton: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.sm,
    backgroundColor: Theme.colors.background,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  filterButtonActive: {
    backgroundColor: Theme.colors.primary + '30',
    borderColor: Theme.colors.primary,
  },
  filterButtonText: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.textSecondary,
  },
  filterButtonTextActive: {
    color: Theme.colors.primary,
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Theme.layout.screenPadding,
    paddingVertical: Theme.spacing.sm,
    backgroundColor: Theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  sortLabel: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.comment,
    marginRight: Theme.spacing.sm,
  },
  sortButtons: {
    flexDirection: 'row',
    gap: Theme.spacing.xs,
  },
  sortButton: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.sm,
    backgroundColor: Theme.colors.background,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  sortButtonActive: {
    backgroundColor: Theme.colors.function + '30',
    borderColor: Theme.colors.function,
  },
  sortButtonText: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.textSecondary,
  },
  sortButtonTextActive: {
    color: Theme.colors.function,
  },
  listContent: {
    paddingTop: Theme.spacing.md,
    paddingBottom: Theme.spacing.xl,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Theme.layout.screenPadding,
    paddingVertical: Theme.spacing.xxl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Theme.spacing.lg,
  },
  emptyTitle: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.md,
    color: Theme.colors.keyword,
    marginBottom: Theme.spacing.sm,
  },
  emptyText: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.comment,
    marginBottom: Theme.spacing.md,
  },
  emptyHint: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.md,
    color: Theme.colors.comment,
    marginTop: Theme.spacing.md,
  },
  fab: {
    position: 'absolute',
    bottom: Theme.spacing.xl,
    right: Theme.spacing.lg,
    backgroundColor: Theme.colors.function,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.background,
    fontWeight: '600',
  },
});
