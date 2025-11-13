// SubtaskItem - Individual subtask with completion toggle

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Theme } from '../../constants';
import { SubTask } from '../../types';

interface SubtaskItemProps {
  subtask: SubTask;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  isEditing: boolean;
}

export const SubtaskItem: React.FC<SubtaskItemProps> = ({
  subtask,
  onToggle,
  onRemove,
  isEditing,
}) => {
  return (
    <View style={styles.container}>
      {/* Checkbox */}
      <TouchableOpacity
        style={[styles.checkbox, subtask.completed && styles.checkboxActive]}
        onPress={() => onToggle(subtask.id)}
        activeOpacity={0.7}
      >
        {subtask.completed && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>

      {/* Title */}
      <Text style={[styles.title, subtask.completed && styles.titleCompleted]} numberOfLines={2}>
        {subtask.title}
      </Text>

      {/* Remove button (only in edit mode) */}
      {isEditing && (
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => onRemove(subtask.id)}
          activeOpacity={0.7}
        >
          <Text style={styles.removeText}>×</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
    backgroundColor: Theme.colors.background,
    borderRadius: Theme.borderRadius.sm,
    marginBottom: Theme.spacing.xs,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Theme.colors.textSecondary,
    marginRight: Theme.spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: Theme.colors.success,
    borderColor: Theme.colors.success,
  },
  checkmark: {
    color: Theme.colors.background,
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    flex: 1,
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.textPrimary,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: Theme.colors.textSecondary,
  },
  removeButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Theme.spacing.sm,
  },
  removeText: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: 24,
    color: Theme.colors.error,
    lineHeight: 24,
  },
});
