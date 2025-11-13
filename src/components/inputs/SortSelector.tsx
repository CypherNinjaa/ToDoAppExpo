// SortSelector Component - Sort options with direction toggle

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Theme } from '../../constants';

export type SortOption = 'priority' | 'date' | 'status' | 'category' | 'title';
export type SortDirection = 'asc' | 'desc';

interface SortSelectorProps {
  selectedSort: SortOption;
  sortDirection: SortDirection;
  onSortChange: (sort: SortOption) => void;
  onDirectionToggle: () => void;
}

const SORT_OPTIONS: Array<{ value: SortOption; label: string; icon: string }> = [
  { value: 'priority', label: 'Priority', icon: '⚡' },
  { value: 'date', label: 'Date', icon: '📅' },
  { value: 'status', label: 'Status', icon: '📊' },
  { value: 'category', label: 'Category', icon: '📂' },
  { value: 'title', label: 'Title', icon: '📝' },
];

export const SortSelector: React.FC<SortSelectorProps> = ({
  selectedSort,
  sortDirection,
  onSortChange,
  onDirectionToggle,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>// Sort By:</Text>

      <View style={styles.optionsContainer}>
        {SORT_OPTIONS.map((option) => {
          const isSelected = selectedSort === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              style={[styles.option, isSelected && styles.optionSelected]}
              onPress={() => onSortChange(option.value)}
              activeOpacity={0.7}
            >
              <Text style={styles.optionIcon}>{option.icon}</Text>
              <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Direction Toggle */}
        <TouchableOpacity
          style={styles.directionButton}
          onPress={onDirectionToggle}
          activeOpacity={0.7}
        >
          <Text style={styles.directionIcon}>{sortDirection === 'asc' ? '↑' : '↓'}</Text>
          <Text style={styles.directionText}>{sortDirection === 'asc' ? 'ASC' : 'DESC'}</Text>
        </TouchableOpacity>
      </View>
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
    marginBottom: Theme.spacing.md,
  },
  title: {
    fontFamily: Theme.typography.fontFamily.monoSemiBold,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.keyword,
    marginBottom: Theme.spacing.sm,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.sm,
  },
  option: {
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
  optionSelected: {
    backgroundColor: Theme.colors.keyword + '20',
    borderColor: Theme.colors.keyword,
  },
  optionIcon: {
    fontSize: 14,
  },
  optionText: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.textSecondary,
  },
  optionTextSelected: {
    color: Theme.colors.keyword,
  },
  directionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs,
    backgroundColor: Theme.colors.function + '20',
    borderWidth: 1,
    borderColor: Theme.colors.function,
    borderRadius: Theme.borderRadius.sm,
    gap: Theme.spacing.xs,
  },
  directionIcon: {
    fontFamily: Theme.typography.fontFamily.monoSemiBold,
    fontSize: 16,
    color: Theme.colors.function,
  },
  directionText: {
    fontFamily: Theme.typography.fontFamily.monoSemiBold,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.function,
  },
});
