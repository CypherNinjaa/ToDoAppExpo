// FilterPanel Component - Multi-filter selection panel

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Theme } from '../../constants';
import { TaskCategory, TaskPriority, TaskStatus } from '../../types';

interface FilterPanelProps {
  selectedCategories: TaskCategory[];
  selectedPriorities: TaskPriority[];
  selectedStatuses: TaskStatus[];
  selectedTags: string[];
  availableTags: string[];
  onCategoryToggle: (category: TaskCategory) => void;
  onPriorityToggle: (priority: TaskPriority) => void;
  onStatusToggle: (status: TaskStatus) => void;
  onTagToggle: (tag: string) => void;
  onClearAll: () => void;
}

const CATEGORIES: TaskCategory[] = ['learning', 'coding', 'assignment', 'project', 'personal'];
const PRIORITIES: TaskPriority[] = ['high', 'medium', 'low'];
const STATUSES: TaskStatus[] = ['pending', 'in-progress', 'completed', 'archived'];

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
  }
};

export const FilterPanel: React.FC<FilterPanelProps> = ({
  selectedCategories,
  selectedPriorities,
  selectedStatuses,
  selectedTags,
  availableTags,
  onCategoryToggle,
  onPriorityToggle,
  onStatusToggle,
  onTagToggle,
  onClearAll,
}) => {
  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedPriorities.length > 0 ||
    selectedStatuses.length > 0 ||
    selectedTags.length > 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>// Filter Options</Text>
        {hasActiveFilters && (
          <TouchableOpacity onPress={onClearAll} activeOpacity={0.7}>
            <Text style={styles.clearButton}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📂 Categories</Text>
          <View style={styles.chipContainer}>
            {CATEGORIES.map((category) => {
              const isSelected = selectedCategories.includes(category);
              return (
                <TouchableOpacity
                  key={category}
                  style={[styles.chip, isSelected && styles.chipSelected]}
                  onPress={() => onCategoryToggle(category)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.chipIcon}>{getCategoryIcon(category)}</Text>
                  <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Priorities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Priority</Text>
          <View style={styles.chipContainer}>
            {PRIORITIES.map((priority) => {
              const isSelected = selectedPriorities.includes(priority);
              return (
                <TouchableOpacity
                  key={priority}
                  style={[styles.chip, isSelected && styles.chipSelected]}
                  onPress={() => onPriorityToggle(priority)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                    {priority.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Status</Text>
          <View style={styles.chipContainer}>
            {STATUSES.map((status) => {
              const isSelected = selectedStatuses.includes(status);
              return (
                <TouchableOpacity
                  key={status}
                  style={[styles.chip, isSelected && styles.chipSelected]}
                  onPress={() => onStatusToggle(status)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                    {status}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Tags */}
        {availableTags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏷 Tags</Text>
            <View style={styles.chipContainer}>
              {availableTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <TouchableOpacity
                    key={tag}
                    style={[styles.chip, isSelected && styles.chipSelected]}
                    onPress={() => onTagToggle(tag)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                      #{tag}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    padding: Theme.spacing.md,
    maxHeight: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  title: {
    fontFamily: Theme.typography.fontFamily.monoSemiBold,
    fontSize: Theme.typography.fontSize.md,
    color: Theme.colors.keyword,
  },
  clearButton: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.error,
  },
  section: {
    marginBottom: Theme.spacing.lg,
  },
  sectionTitle: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.comment,
    marginBottom: Theme.spacing.sm,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs,
    backgroundColor: Theme.colors.background,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.sm,
    gap: Theme.spacing.xs,
  },
  chipSelected: {
    backgroundColor: Theme.colors.success + '20',
    borderColor: Theme.colors.success,
  },
  chipIcon: {
    fontSize: 14,
  },
  chipText: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.textSecondary,
  },
  chipTextSelected: {
    color: Theme.colors.success,
  },
});
