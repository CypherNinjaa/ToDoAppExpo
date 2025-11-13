// CodeSnippetInput Component - Code snippet input with language selector

import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Theme } from '../../constants';
import { CodeSnippet } from '../../types';

interface CodeSnippetInputProps {
  label: string;
  value: CodeSnippet | undefined;
  onChange: (snippet: CodeSnippet | undefined) => void;
  placeholder?: string;
}

const LANGUAGES = [
  'javascript',
  'typescript',
  'python',
  'java',
  'cpp',
  'csharp',
  'html',
  'css',
  'sql',
  'bash',
];

export const CodeSnippetInput: React.FC<CodeSnippetInputProps> = ({
  label,
  value,
  onChange,
  placeholder = '// Enter code snippet...',
}) => {
  const [isExpanded, setIsExpanded] = React.useState(!!value?.code);

  const handleLanguageSelect = (language: string) => {
    onChange({
      code: value?.code || '',
      language,
    });
  };

  const handleCodeChange = (code: string) => {
    if (!code.trim()) {
      onChange(undefined);
      setIsExpanded(false);
    } else {
      onChange({
        code,
        language: value?.language || 'javascript',
      });
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</Text>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.content}>
          {/* Language selector */}
          <View style={styles.languageSelectorContainer}>
            <Text style={styles.languageLabel}>language:</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.languageScroll}
            >
              {LANGUAGES.map((lang) => (
                <TouchableOpacity
                  key={lang}
                  style={[
                    styles.languageButton,
                    value?.language === lang && styles.languageButtonActive,
                  ]}
                  onPress={() => handleLanguageSelect(lang)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.languageText,
                      value?.language === lang && styles.languageTextActive,
                    ]}
                  >
                    {lang}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Code input */}
          <View style={styles.codeInputContainer}>
            <View style={styles.lineNumbers}>
              {(value?.code || placeholder).split('\n').map((_, index) => (
                <Text key={index} style={styles.lineNumber}>
                  {index + 1}
                </Text>
              ))}
            </View>
            <TextInput
              style={styles.codeInput}
              value={value?.code || ''}
              onChangeText={handleCodeChange}
              placeholder={placeholder}
              placeholderTextColor={Theme.colors.comment}
              multiline
              numberOfLines={10}
              textAlignVertical="top"
            />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Theme.spacing.lg,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    backgroundColor: Theme.colors.surface,
  },
  label: {
    fontFamily: Theme.typography.fontFamily.monoSemiBold,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.keyword,
  },
  expandIcon: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.comment,
  },
  content: {
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
  },
  languageSelectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    backgroundColor: Theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  languageLabel: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.function,
    marginRight: Theme.spacing.sm,
  },
  languageScroll: {
    flex: 1,
  },
  languageButton: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    marginRight: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.sm,
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  languageButtonActive: {
    backgroundColor: Theme.colors.keyword + '20',
    borderColor: Theme.colors.keyword,
  },
  languageText: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.textSecondary,
  },
  languageTextActive: {
    color: Theme.colors.keyword,
  },
  codeInputContainer: {
    flexDirection: 'row',
    minHeight: 120,
  },
  lineNumbers: {
    backgroundColor: Theme.colors.background,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.md,
    borderRightWidth: 1,
    borderRightColor: Theme.colors.border,
  },
  lineNumber: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.comment,
    lineHeight: Theme.typography.fontSize.sm * 1.5,
    textAlign: 'right',
    minWidth: 20,
  },
  codeInput: {
    flex: 1,
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.string,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.md,
    lineHeight: Theme.typography.fontSize.sm * 1.5,
  },
});
