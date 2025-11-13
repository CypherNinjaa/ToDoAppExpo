// QuickActions - Command shortcut buttons

import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Theme } from '../../constants';

interface QuickActionsProps {
  onNewTask?: () => void;
  onViewAll?: () => void;
  onFilter?: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onNewTask, onViewAll, onFilter }) => {
  // Memoize handlers
  const handleNewTask = useCallback(() => {
    onNewTask?.();
  }, [onNewTask]);

  const handleViewAll = useCallback(() => {
    onViewAll?.();
  }, [onViewAll]);

  const handleFilter = useCallback(() => {
    onFilter?.();
  }, [onFilter]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.title}>// Quick Actions</Text>

      {/* Action buttons */}
      <View style={styles.buttonsRow}>
        {/* New Task */}
        <TouchableOpacity
          style={[styles.actionButton, styles.primaryButton]}
          onPress={handleNewTask}
          activeOpacity={0.7}
        >
          <Text style={styles.commandText}>$ touch</Text>
          <Text style={styles.buttonLabel}>New Task</Text>
        </TouchableOpacity>

        {/* View All */}
        <TouchableOpacity style={styles.actionButton} onPress={handleViewAll} activeOpacity={0.7}>
          <Text style={styles.commandText}>$ ls -la</Text>
          <Text style={styles.buttonLabel}>View All</Text>
        </TouchableOpacity>

        {/* Filter */}
        <TouchableOpacity style={styles.actionButton} onPress={handleFilter} activeOpacity={0.7}>
          <Text style={styles.commandText}>$ grep</Text>
          <Text style={styles.buttonLabel}>Filter</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: Theme.spacing.md,
    marginBottom: Theme.spacing.xl,
    paddingHorizontal: Theme.spacing.lg,
  },
  title: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.comment,
    marginBottom: Theme.spacing.sm,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
  },
  actionButton: {
    flex: 1,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.md,
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: Theme.colors.primary + '20',
    borderColor: Theme.colors.primary,
  },
  commandText: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.keyword,
    marginBottom: Theme.spacing.xs,
  },
  buttonLabel: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.textPrimary,
  },
});
