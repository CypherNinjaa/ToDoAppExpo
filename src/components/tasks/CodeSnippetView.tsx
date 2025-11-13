// CodeSnippetView Component - Display code snippet with copy functionality

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Theme } from '../../constants';
import { CodeSnippet } from '../../types';

interface CodeSnippetViewProps {
  snippet: CodeSnippet;
  onPress?: () => void;
}

export const CodeSnippetView: React.FC<CodeSnippetViewProps> = ({ snippet, onPress }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(snippet.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      Alert.alert('Error', 'Failed to copy code to clipboard');
    }
  };

  const lines = snippet.code.split('\n');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.languageBadge}>
          <Text style={styles.languageText}>{snippet.language}</Text>
        </View>
        <TouchableOpacity style={styles.copyButton} onPress={handleCopy} activeOpacity={0.7}>
          <Text style={styles.copyButtonText}>{copied ? '✓ Copied' : '📋 Copy'}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.codeContainer}
        onPress={onPress}
        activeOpacity={onPress ? 0.7 : 1}
        disabled={!onPress}
      >
        <View style={styles.lineNumbers}>
          {lines.map((_, index) => (
            <Text key={index} style={styles.lineNumber}>
              {index + 1}
            </Text>
          ))}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.codeContent}>
            {lines.map((line, index) => (
              <Text key={index} style={styles.codeLine}>
                {line || ' '}
              </Text>
            ))}
          </View>
        </ScrollView>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    overflow: 'hidden',
    marginBottom: Theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    backgroundColor: Theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  languageBadge: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.sm,
    backgroundColor: Theme.colors.keyword + '20',
    borderWidth: 1,
    borderColor: Theme.colors.keyword,
  },
  languageText: {
    fontFamily: Theme.typography.fontFamily.monoSemiBold,
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.keyword,
  },
  copyButton: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.sm,
    backgroundColor: Theme.colors.success + '20',
    borderWidth: 1,
    borderColor: Theme.colors.success,
  },
  copyButtonText: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.success,
  },
  codeContainer: {
    flexDirection: 'row',
    maxHeight: 200,
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
  codeContent: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.md,
  },
  codeLine: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.string,
    lineHeight: Theme.typography.fontSize.sm * 1.5,
  },
});
