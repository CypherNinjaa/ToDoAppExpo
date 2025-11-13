// SearchBar Component - Terminal-style search with regex support

import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Theme } from '../../constants';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
  regexEnabled?: boolean;
  onToggleRegex?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'grep -r "search..." .',
  onClear,
  regexEnabled = false,
  onToggleRegex,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Text style={styles.prefix}>$</Text>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Theme.colors.comment}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={onClear} style={styles.clearButton} activeOpacity={0.7}>
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {onToggleRegex && (
        <TouchableOpacity
          style={[styles.regexButton, regexEnabled && styles.regexButtonActive]}
          onPress={onToggleRegex}
          activeOpacity={0.7}
        >
          <Text style={[styles.regexButtonText, regexEnabled && styles.regexButtonTextActive]}>
            .*
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.md,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
  },
  prefix: {
    fontFamily: Theme.typography.fontFamily.monoSemiBold,
    fontSize: Theme.typography.fontSize.md,
    color: Theme.colors.success,
    marginRight: Theme.spacing.xs,
  },
  input: {
    flex: 1,
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.md,
    color: Theme.colors.textPrimary,
    paddingVertical: 0,
  },
  clearButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Theme.spacing.xs,
  },
  clearButtonText: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: 18,
    color: Theme.colors.textSecondary,
  },
  regexButton: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.md,
  },
  regexButtonActive: {
    backgroundColor: Theme.colors.keyword + '20',
    borderColor: Theme.colors.keyword,
  },
  regexButtonText: {
    fontFamily: Theme.typography.fontFamily.monoSemiBold,
    fontSize: Theme.typography.fontSize.md,
    color: Theme.colors.textSecondary,
  },
  regexButtonTextActive: {
    color: Theme.colors.keyword,
  },
});
