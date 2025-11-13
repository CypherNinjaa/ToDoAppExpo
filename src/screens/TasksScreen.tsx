import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Modal,
} from 'react-native';
import DraggableFlatList, {
  ScaleDecorator,
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import { Theme, CommonStyles } from '../constants';
import { useTaskStore } from '../stores';
import { TaskCard } from '../components/tasks';
import { TaskFormScreen } from './TaskFormScreen';
import { Task, TaskStatus, TaskCategory, TaskPriority } from '../types';
import {
  SearchBar,
  FilterPanel,
  SortSelector,
  SortOption,
  SortDirection,
  CommandPalette,
  Command,
} from '../components/inputs';
import { processTaskList, getAllTags } from '../utils/searchFilter';
import { useKeyboardShortcut } from '../hooks';

interface TasksScreenProps {
  username: string;
}

export const TasksScreen: React.FC<TasksScreenProps> = ({ username }) => {
  const [displayedText, setDisplayedText] = useState('');
  const fullText = '~$ ./list-tasks.sh --search --filter --sort';

  const tasks = useTaskStore((state) => state.tasks);
  const isLoading = useTaskStore((state) => state.isLoading);
  const loadTasks = useTaskStore((state) => state.loadTasks);
  const toggleTaskComplete = useTaskStore((state) => state.toggleTaskComplete);
  const toggleSubtask = useTaskStore((state) => state.toggleSubtask);
  const reorderTasks = useTaskStore((state) => state.reorderTasks);
  const deleteTask = useTaskStore((state) => state.deleteTask);

  const [refreshing, setRefreshing] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | undefined>(undefined);
  const [showFilters, setShowFilters] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [useRegex, setUseRegex] = useState(false);

  // Filter state
  const [selectedCategories, setSelectedCategories] = useState<TaskCategory[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<TaskPriority[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<TaskStatus[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Sort state
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Keyboard shortcuts
  useKeyboardShortcut([
    {
      key: 'k',
      ctrlKey: true,
      action: () => setShowCommandPalette(true),
    },
  ]);

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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  }, [loadTasks]);

  // Memoize available tags calculation
  const availableTags = useMemo(() => getAllTags(tasks), [tasks]);

  // Memoize expensive task processing (search, filter, sort)
  const filteredAndSortedTasks = useMemo(
    () =>
      processTaskList(
        tasks,
        searchQuery,
        useRegex,
        {
          categories: selectedCategories,
          priorities: selectedPriorities,
          statuses: selectedStatuses,
          tags: selectedTags,
        },
        sortBy,
        sortDirection
      ),
    [
      tasks,
      searchQuery,
      useRegex,
      selectedCategories,
      selectedPriorities,
      selectedStatuses,
      selectedTags,
      sortBy,
      sortDirection,
    ]
  );

  // Memoize filter handlers
  const handleCategoryToggle = useCallback((category: TaskCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  }, []);

  const handlePriorityToggle = useCallback((priority: TaskPriority) => {
    setSelectedPriorities((prev) =>
      prev.includes(priority) ? prev.filter((p) => p !== priority) : [...prev, priority]
    );
  }, []);

  const handleStatusToggle = useCallback((status: TaskStatus) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  }, []);

  const handleTagToggle = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  const handleClearAllFilters = useCallback(() => {
    setSelectedCategories([]);
    setSelectedPriorities([]);
    setSelectedStatuses([]);
    setSelectedTags([]);
  }, []);

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedPriorities.length > 0 ||
    selectedStatuses.length > 0 ||
    selectedTags.length > 0;

  // Command palette commands
  const commands: Command[] = [
    // Task actions
    {
      id: 'new-task',
      label: 'Create New Task',
      description: 'Open task form to create a new task',
      category: 'task',
      icon: '➕',
      action: () => setShowTaskForm(true),
    },
    {
      id: 'refresh-tasks',
      label: 'Refresh Tasks',
      description: 'Reload all tasks from storage',
      category: 'task',
      icon: '🔄',
      action: () => onRefresh(),
    },
    // View actions
    {
      id: 'toggle-filters',
      label: showFilters ? 'Hide Filters' : 'Show Filters',
      description: 'Toggle filter panel visibility',
      category: 'view',
      icon: '🔍',
      action: () => setShowFilters(!showFilters),
    },
    {
      id: 'clear-search',
      label: 'Clear Search',
      description: 'Clear search query',
      category: 'view',
      icon: '✕',
      action: () => setSearchQuery(''),
    },
    {
      id: 'toggle-regex',
      label: useRegex ? 'Disable Regex' : 'Enable Regex',
      description: 'Toggle regex search mode',
      category: 'view',
      icon: '.*',
      action: () => setUseRegex(!useRegex),
    },
    // Filter actions
    {
      id: 'clear-filters',
      label: 'Clear All Filters',
      description: 'Remove all active filters',
      category: 'filter',
      icon: '🗑',
      action: handleClearAllFilters,
    },
    {
      id: 'filter-high-priority',
      label: 'Filter High Priority',
      description: 'Show only high priority tasks',
      category: 'filter',
      icon: '⚡',
      action: () => setSelectedPriorities(['high']),
    },
    {
      id: 'filter-in-progress',
      label: 'Filter In Progress',
      description: 'Show only in-progress tasks',
      category: 'filter',
      icon: '🔄',
      action: () => setSelectedStatuses(['in-progress']),
    },
    {
      id: 'filter-pending',
      label: 'Filter Pending',
      description: 'Show only pending tasks',
      category: 'filter',
      icon: '⏳',
      action: () => setSelectedStatuses(['pending']),
    },
    // Sort actions
    {
      id: 'sort-priority',
      label: 'Sort by Priority',
      description: 'Sort tasks by priority level',
      category: 'view',
      icon: '⚡',
      action: () => setSortBy('priority'),
    },
    {
      id: 'sort-date',
      label: 'Sort by Date',
      description: 'Sort tasks by due date',
      category: 'view',
      icon: '📅',
      action: () => setSortBy('date'),
    },
    {
      id: 'sort-status',
      label: 'Sort by Status',
      description: 'Sort tasks by completion status',
      category: 'view',
      icon: '📊',
      action: () => setSortBy('status'),
    },
    {
      id: 'toggle-sort-direction',
      label: 'Toggle Sort Direction',
      description: sortDirection === 'asc' ? 'Sort descending' : 'Sort ascending',
      category: 'view',
      icon: sortDirection === 'asc' ? '↓' : '↑',
      action: () => setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc')),
    },
  ];

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

  const handleEditTask = useCallback((taskId: string) => {
    setEditingTaskId(taskId);
    setShowTaskForm(true);
  }, []);

  const handleCloseTaskForm = useCallback(() => {
    setShowTaskForm(false);
    setEditingTaskId(undefined);
  }, []);

  // Memoize empty state render
  const renderEmptyState = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📋</Text>
        <Text style={styles.emptyTitle}>$ ls -la /tasks/</Text>
        <Text style={styles.emptyText}>// No tasks found</Text>
        <Text style={styles.emptyHint}>
          {searchQuery || hasActiveFilters
            ? 'Try adjusting your search or filters'
            : 'Create your first task to get started'}
        </Text>
      </View>
    ),
    [searchQuery, hasActiveFilters]
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
          <Text style={styles.count}>
            $ wc -l /tasks → {filteredAndSortedTasks.length}/{tasks.length} tasks
          </Text>
        </View>

        {/* Search and Controls */}
        <View style={styles.controlsContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            onClear={() => setSearchQuery('')}
            regexEnabled={useRegex}
            onToggleRegex={() => setUseRegex(!useRegex)}
          />

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionButton, showFilters && styles.actionButtonActive]}
              onPress={() => setShowFilters(!showFilters)}
              activeOpacity={0.7}
            >
              <Text style={[styles.actionButtonText, showFilters && styles.actionButtonTextActive]}>
                🔍{' '}
                {hasActiveFilters
                  ? `Filters (${selectedCategories.length + selectedPriorities.length + selectedStatuses.length + selectedTags.length})`
                  : 'Filters'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowCommandPalette(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.actionButtonText}>⌘ Commands</Text>
            </TouchableOpacity>
          </View>

          {/* Sort Selector */}
          <SortSelector
            selectedSort={sortBy}
            sortDirection={sortDirection}
            onSortChange={setSortBy}
            onDirectionToggle={() => setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
          />

          {/* Filter Panel */}
          {showFilters && (
            <FilterPanel
              selectedCategories={selectedCategories}
              selectedPriorities={selectedPriorities}
              selectedStatuses={selectedStatuses}
              selectedTags={selectedTags}
              availableTags={availableTags}
              onCategoryToggle={handleCategoryToggle}
              onPriorityToggle={handlePriorityToggle}
              onStatusToggle={handleStatusToggle}
              onTagToggle={handleTagToggle}
              onClearAll={handleClearAllFilters}
            />
          )}
        </View>

        {/* Task list */}
        <DraggableFlatList
          data={filteredAndSortedTasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item, drag, isActive }: RenderItemParams<Task>) => (
            <ScaleDecorator>
              <TaskCard
                task={item}
                username={username}
                onPress={() => handleEditTask(item.id)}
                onToggleComplete={() => handleToggleComplete(item.id)}
                onToggleSubtask={(subtaskId) => toggleSubtask(item.id, subtaskId)}
                onDelete={() => handleDeleteTask(item.id)}
                onLongPress={drag}
                isActive={isActive}
              />
            </ScaleDecorator>
          )}
          onDragEnd={({ data }) => reorderTasks(data)}
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
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          initialNumToRender={10}
          windowSize={5}
        />
      </View>

      {/* FAB - Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowTaskForm(true)}
        onLongPress={() => setShowCommandPalette(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>$ touch new-task.json</Text>
      </TouchableOpacity>

      {/* Command Palette FAB - Mobile friendly */}
      <TouchableOpacity
        style={styles.commandFab}
        onPress={() => setShowCommandPalette(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.commandFabText}>⌘</Text>
      </TouchableOpacity>

      {/* Task Form Modal */}
      <Modal
        visible={showTaskForm}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={handleCloseTaskForm}
      >
        <TaskFormScreen taskId={editingTaskId} onClose={handleCloseTaskForm} />
      </Modal>

      {/* Command Palette */}
      <CommandPalette
        visible={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        commands={commands}
      />
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
  controlsContainer: {
    paddingHorizontal: Theme.layout.screenPadding,
    paddingVertical: Theme.spacing.md,
    backgroundColor: Theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.md,
  },
  actionButton: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.sm,
  },
  actionButtonActive: {
    backgroundColor: Theme.colors.primary + '20',
    borderColor: Theme.colors.primary,
  },
  actionButtonText: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.textSecondary,
  },
  actionButtonTextActive: {
    color: Theme.colors.primary,
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
  commandFab: {
    position: 'absolute',
    bottom: Theme.spacing.xl + 60,
    right: Theme.spacing.lg,
    backgroundColor: Theme.colors.keyword,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  commandFabText: {
    fontSize: 24,
    color: Theme.colors.background,
  },
});
