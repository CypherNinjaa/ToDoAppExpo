// CodeInput Component - Code Editor Style Input

import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps } from 'react-native';
import { Theme } from '../../constants';

interface CodeInputProps extends TextInputProps {
  label?: string;
  syntaxType?: 'string' | 'variable' | 'function' | 'keyword' | 'comment';
  showLineNumber?: boolean;
  error?: string;
}

export const CodeInput: React.FC<CodeInputProps> = ({
  label,
  syntaxType = 'string',
  showLineNumber = true,
  error,
  multiline = false,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  // Syntax colors based on VS Code
  const getSyntaxColor = () => {
    switch (syntaxType) {
      case 'string':
        return Theme.colors.string;
      case 'variable':
        return Theme.colors.variable;
      case 'function':
        return Theme.colors.function;
      case 'keyword':
        return Theme.colors.keyword;
      case 'comment':
        return Theme.colors.comment;
      default:
        return Theme.colors.textPrimary;
    }
  };

  const syntaxColor = getSyntaxColor();
  const borderColor = error
    ? Theme.colors.error
    : isFocused
      ? Theme.colors.primary
      : Theme.colors.border;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={[styles.editorContainer, { borderColor }]}>
        {/* Line numbers */}
        {showLineNumber && (
          <View style={styles.lineNumberContainer}>
            <Text style={styles.lineNumber}>1</Text>
            {multiline && <Text style={styles.lineNumber}>2</Text>}
          </View>
        )}

        {/* Input field */}
        <TextInput
          {...props}
          style={[
            styles.input,
            multiline && styles.inputMultiline,
            { color: syntaxColor },
            props.style,
          ]}
          multiline={multiline}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor={Theme.colors.comment}
          selectionColor={Theme.colors.primary}
        />
      </View>

      {/* Error message */}
      {error && <Text style={styles.errorText}>// Error: {error}</Text>}
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
  editorContainer: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.inputBackground,
    borderWidth: 2,
    borderRadius: Theme.borderRadius.md,
    overflow: 'hidden',
  },
  lineNumberContainer: {
    backgroundColor: Theme.colors.surface,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.md,
    borderRightWidth: 1,
    borderRightColor: Theme.colors.border,
    alignItems: 'center',
    minWidth: 40,
  },
  lineNumber: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.comment,
    lineHeight: Theme.typography.fontSize.md * 1.5,
  },
  input: {
    flex: 1,
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.md,
    padding: Theme.spacing.md,
    minHeight: 48,
  },
  inputMultiline: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  errorText: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.error,
    marginTop: Theme.spacing.xs,
  },
});
