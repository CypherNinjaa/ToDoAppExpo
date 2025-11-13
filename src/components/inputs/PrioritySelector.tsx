// PrioritySelector - Code Syntax Style

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Theme } from '../../constants';
import { TaskPriority } from '../../types';

interface PrioritySelectorProps {
  value: TaskPriority;
  onChange: (priority: TaskPriority) => void;
  label?: string;
}

export const PrioritySelector: React.FC<PrioritySelectorProps> = ({ value, onChange, label }) => {
  const priorities: { value: TaskPriority; label: string; color: string }[] = [
    { value: 'high', label: 'HIGH', color: Theme.colors.keyword },
    { value: 'medium', label: 'MEDIUM', color: Theme.colors.string },
    { value: 'low', label: 'LOW', color: Theme.colors.comment },
  ];

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={styles.codeContainer}>
        {/* Code syntax: let priority = */}
        <Text style={styles.keyword}>let</Text>
        <Text style={styles.variable}> priority </Text>
        <Text style={styles.operator}>=</Text>

        {/* Priority options */}
        <View style={styles.optionsContainer}>
          {priorities.map((priority, index) => (
            <View key={priority.value} style={styles.optionWrapper}>
              <TouchableOpacity
                style={[styles.option, value === priority.value && styles.optionActive]}
                onPress={() => onChange(priority.value)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.optionText,
                    { color: priority.color },
                    value === priority.value && styles.optionTextActive,
                  ]}
                >
                  "{priority.label}"
                </Text>
              </TouchableOpacity>

              {/* Type union separator */}
              {index < priorities.length - 1 && <Text style={styles.separator}> | </Text>}
            </View>
          ))}
        </View>

        <Text style={styles.semicolon}>;</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Theme.spacing.md,
  },
  label: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.comment,
    marginBottom: Theme.spacing.xs,
  },
  codeContainer: {
    backgroundColor: Theme.colors.inputBackground,
    borderWidth: 2,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  keyword: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.md,
    color: Theme.colors.keyword,
  },
  variable: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.md,
    color: Theme.colors.variable,
  },
  operator: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.md,
    color: Theme.colors.textPrimary,
    marginHorizontal: Theme.spacing.xs,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  optionWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  option: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.sm,
    backgroundColor: Theme.colors.surface,
  },
  optionActive: {
    backgroundColor: Theme.colors.primary + '20',
    borderWidth: 1,
    borderColor: Theme.colors.primary,
  },
  optionText: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.md,
  },
  optionTextActive: {
    fontFamily: Theme.typography.fontFamily.monoSemiBold,
  },
  separator: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.md,
    color: Theme.colors.textSecondary,
  },
  semicolon: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.md,
    color: Theme.colors.textPrimary,
    marginLeft: Theme.spacing.xs,
  },
});
