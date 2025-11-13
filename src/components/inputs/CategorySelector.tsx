// CategorySelector - Import Syntax Style

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Theme } from '../../constants';
import { TaskCategory } from '../../types';

interface CategorySelectorProps {
  value: TaskCategory;
  onChange: (category: TaskCategory) => void;
  label?: string;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({ value, onChange, label }) => {
  const categories: {
    value: TaskCategory;
    label: string;
    icon: string;
    color: string;
  }[] = [
    {
      value: 'learning',
      label: 'LEARNING',
      icon: '📚',
      color: Theme.colors.keyword,
    },
    {
      value: 'coding',
      label: 'CODING',
      icon: '💻',
      color: Theme.colors.function,
    },
    {
      value: 'assignment',
      label: 'ASSIGNMENT',
      icon: '📝',
      color: Theme.colors.string,
    },
    {
      value: 'project',
      label: 'PROJECT',
      icon: '🚀',
      color: Theme.colors.variable,
    },
    {
      value: 'personal',
      label: 'PERSONAL',
      icon: '👤',
      color: Theme.colors.comment,
    },
  ];

  const selectedCategory = categories.find((cat) => cat.value === value);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={styles.codeContainer}>
        {/* Import syntax line 1 */}
        <Text style={styles.keyword}>import</Text>
        <Text style={styles.bracket}> {'{'} </Text>
        <Text style={styles.import}>{selectedCategory?.label}</Text>
        <Text style={styles.bracket}> {'}'} </Text>
        <Text style={styles.keyword}> from </Text>
        <Text style={styles.string}>'@categories'</Text>
        <Text style={styles.semicolon}>;</Text>

        {/* Category grid */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
          contentContainerStyle={styles.categoriesContainer}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.value}
              style={[
                styles.categoryCard,
                value === category.value && styles.categoryCardActive,
                { borderColor: category.color },
              ]}
              onPress={() => onChange(category.value)}
              activeOpacity={0.7}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text
                style={[
                  styles.categoryLabel,
                  { color: category.color },
                  value === category.value && styles.categoryLabelActive,
                ]}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
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
  },
  keyword: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.md,
    color: Theme.colors.keyword,
  },
  bracket: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.md,
    color: Theme.colors.function,
  },
  import: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.md,
    color: Theme.colors.variable,
  },
  string: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.md,
    color: Theme.colors.string,
  },
  semicolon: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.md,
    color: Theme.colors.textPrimary,
  },
  categoriesScroll: {
    marginTop: Theme.spacing.md,
  },
  categoriesContainer: {
    gap: Theme.spacing.sm,
  },
  categoryCard: {
    alignItems: 'center',
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Theme.colors.surface,
    borderWidth: 2,
    minWidth: 100,
  },
  categoryCardActive: {
    backgroundColor: Theme.colors.primary + '15',
    borderWidth: 2,
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: Theme.spacing.xs,
  },
  categoryLabel: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.xs,
  },
  categoryLabelActive: {
    fontFamily: Theme.typography.fontFamily.monoSemiBold,
  },
});
