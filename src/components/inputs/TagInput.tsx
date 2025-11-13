// TagInput - Tag input with chips display

import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Theme } from '../../constants';

interface TagInputProps {
  label?: string;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
}

export const TagInput: React.FC<TagInputProps> = ({
  label,
  tags,
  onTagsChange,
  placeholder = 'Type tag and press Enter...',
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleAddTag = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !tags.includes(trimmedValue)) {
      onTagsChange([...tags, trimmedValue]);
      setInputValue('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onTagsChange(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyPress = (e: any) => {
    if (e.nativeEvent.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Tag color based on hash
  const getTagColor = (tag: string) => {
    const colors = [
      Theme.colors.keyword,
      Theme.colors.function,
      Theme.colors.variable,
      Theme.colors.string,
      Theme.colors.success,
    ];
    const hash = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  return (
    <View style={styles.container}>
      {/* Label */}
      {label && <Text style={styles.label}>{label}</Text>}

      {/* Tags display */}
      {tags.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tagsScroll}
          contentContainerStyle={styles.tagsContainer}
        >
          {tags.map((tag, index) => (
            <View
              key={index}
              style={[
                styles.tagChip,
                { backgroundColor: getTagColor(tag) + '20', borderColor: getTagColor(tag) },
              ]}
            >
              <Text style={[styles.tagText, { color: getTagColor(tag) }]}>#{tag}</Text>
              <TouchableOpacity
                onPress={() => handleRemoveTag(tag)}
                style={styles.tagRemove}
                activeOpacity={0.7}
              >
                <Text style={[styles.tagRemoveText, { color: getTagColor(tag) }]}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Input */}
      <View style={[styles.inputContainer, isFocused && styles.inputContainerFocused]}>
        <Text style={styles.inputPrefix}>tags: [</Text>
        <TextInput
          style={styles.input}
          value={inputValue}
          onChangeText={setInputValue}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onSubmitEditing={handleAddTag}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          placeholderTextColor={Theme.colors.comment}
          returnKeyType="done"
        />
        <Text style={styles.inputSuffix}>]</Text>
        {inputValue.length > 0 && (
          <TouchableOpacity onPress={handleAddTag} style={styles.addButton} activeOpacity={0.7}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Hint */}
      <Text style={styles.hint}>// Press Enter or + to add tag</Text>
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
  tagsScroll: {
    marginBottom: Theme.spacing.sm,
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: Theme.spacing.xs,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.sm,
    borderWidth: 1,
  },
  tagText: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: '600',
  },
  tagRemove: {
    marginLeft: Theme.spacing.xs,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagRemoveText: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: 18,
    lineHeight: 16,
    fontWeight: '700',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.inputBackground,
    borderRadius: Theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
  },
  inputContainerFocused: {
    borderColor: Theme.colors.primary,
  },
  inputPrefix: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.textSecondary,
    marginRight: Theme.spacing.xs,
  },
  input: {
    flex: 1,
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.string,
    padding: 0,
  },
  inputSuffix: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.textSecondary,
    marginLeft: Theme.spacing.xs,
  },
  addButton: {
    marginLeft: Theme.spacing.sm,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: 18,
    color: Theme.colors.background,
    fontWeight: '700',
    lineHeight: 20,
  },
  hint: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.comment,
    marginTop: Theme.spacing.xs,
  },
});
