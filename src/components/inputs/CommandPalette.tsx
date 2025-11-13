// CommandPalette Component - VS Code-style command palette

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  FlatList,
  Keyboard,
  Platform,
} from 'react-native';
import { Theme } from '../../constants';

export interface Command {
  id: string;
  label: string;
  description?: string;
  category: 'task' | 'navigation' | 'view' | 'filter' | 'system';
  icon?: string;
  shortcut?: string;
  action: () => void;
}

interface CommandPaletteProps {
  visible: boolean;
  onClose: () => void;
  commands: Command[];
}

const CATEGORY_COLORS: Record<Command['category'], string> = {
  task: Theme.colors.success,
  navigation: Theme.colors.keyword,
  view: Theme.colors.function,
  filter: Theme.colors.string,
  system: Theme.colors.comment,
};

const CATEGORY_LABELS: Record<Command['category'], string> = {
  task: 'Task Actions',
  navigation: 'Navigation',
  view: 'View Options',
  filter: 'Filters',
  system: 'System',
};

export const CommandPalette: React.FC<CommandPaletteProps> = ({ visible, onClose, commands }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      setSearchQuery('');
      // Focus input after a short delay to ensure modal is rendered
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [visible]);

  // Filter commands based on search query
  const filteredCommands = commands.filter((cmd) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      cmd.label.toLowerCase().includes(query) ||
      cmd.description?.toLowerCase().includes(query) ||
      cmd.category.toLowerCase().includes(query)
    );
  });

  // Group commands by category
  const groupedCommands: Array<{ category: string; commands: Command[] }> = [];
  const categoryMap = new Map<string, Command[]>();

  filteredCommands.forEach((cmd) => {
    if (!categoryMap.has(cmd.category)) {
      categoryMap.set(cmd.category, []);
    }
    categoryMap.get(cmd.category)!.push(cmd);
  });

  categoryMap.forEach((cmds, category) => {
    groupedCommands.push({
      category: CATEGORY_LABELS[category as Command['category']],
      commands: cmds,
    });
  });

  // Handle command execution
  const executeCommand = (command: Command) => {
    command.action();
    onClose();
    setSearchQuery('');
  };

  // Render command item
  const renderCommand = (command: Command) => {
    const color = CATEGORY_COLORS[command.category];

    return (
      <TouchableOpacity
        key={command.id}
        style={styles.commandItem}
        onPress={() => executeCommand(command)}
        activeOpacity={0.7}
      >
        <View style={styles.commandLeft}>
          {command.icon && <Text style={styles.commandIcon}>{command.icon}</Text>}
          <View style={styles.commandTextContainer}>
            <Text style={styles.commandLabel}>{command.label}</Text>
            {command.description && (
              <Text style={styles.commandDescription}>{command.description}</Text>
            )}
          </View>
        </View>
        <View style={[styles.categoryBadge, { backgroundColor: color + '20', borderColor: color }]}>
          <Text style={[styles.categoryBadgeText, { color }]}>{command.category}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>⌘ Command Palette</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton} activeOpacity={0.7}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Text style={styles.prefix}>&gt;</Text>
            <TextInput
              ref={inputRef}
              style={styles.input}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search commands..."
              placeholderTextColor={Theme.colors.comment}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              blurOnSubmit={true}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={styles.clearSearchButton}
                activeOpacity={0.7}
              >
                <Text style={styles.clearSearchButtonText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Command list */}
          <View style={styles.commandsContainer}>
            {filteredCommands.length > 0 ? (
              <FlatList
                data={groupedCommands}
                keyExtractor={(item) => item.category}
                renderItem={({ item }) => (
                  <View style={styles.categoryGroup}>
                    <View style={styles.categoryHeader}>
                      <Text style={styles.categoryLabel}>{item.category}</Text>
                      <Text style={styles.categoryCount}>({item.commands.length})</Text>
                    </View>
                    {item.commands.map((cmd) => renderCommand(cmd))}
                  </View>
                )}
                showsVerticalScrollIndicator={true}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
              />
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>🔍</Text>
                <Text style={styles.emptyText}>No commands found</Text>
                <Text style={styles.emptyHint}>Try different keywords or clear your search</Text>
              </View>
            )}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {searchQuery
                ? `Found ${filteredCommands.length} command${filteredCommands.length !== 1 ? 's' : ''} - Tap to execute`
                : `${commands.length} commands available - Scroll to browse all`}
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  container: {
    width: '100%',
    height: '85%',
    backgroundColor: Theme.colors.surface,
    borderTopLeftRadius: Theme.borderRadius.lg,
    borderTopRightRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
    backgroundColor: Theme.colors.background,
  },
  title: {
    fontFamily: Theme.typography.fontFamily.monoSemiBold,
    fontSize: Theme.typography.fontSize.lg,
    color: Theme.colors.keyword,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
    backgroundColor: Theme.colors.background,
  },
  prefix: {
    fontFamily: Theme.typography.fontFamily.monoSemiBold,
    fontSize: Theme.typography.fontSize.lg,
    color: Theme.colors.success,
    marginRight: Theme.spacing.sm,
  },
  input: {
    flex: 1,
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.md,
    color: Theme.colors.textPrimary,
    paddingVertical: Theme.spacing.sm,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.sm,
  },
  closeButtonText: {
    fontFamily: Theme.typography.fontFamily.monoSemiBold,
    fontSize: 18,
    color: Theme.colors.textSecondary,
  },
  clearSearchButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Theme.spacing.xs,
  },
  clearSearchButtonText: {
    fontFamily: Theme.typography.fontFamily.monoSemiBold,
    fontSize: 16,
    color: Theme.colors.textSecondary,
  },
  commandsContainer: {
    flex: 1,
  },
  categoryGroup: {
    paddingVertical: Theme.spacing.xs,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs,
  },
  categoryLabel: {
    fontFamily: Theme.typography.fontFamily.monoSemiBold,
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.comment,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  categoryCount: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.comment,
    marginLeft: Theme.spacing.xs,
  },
  commandItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border + '40',
  },
  commandLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  commandIcon: {
    fontSize: 20,
    marginRight: Theme.spacing.md,
  },
  commandTextContainer: {
    flex: 1,
  },
  commandLabel: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.textPrimary,
    marginBottom: 4,
  },
  commandDescription: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.comment,
  },
  categoryBadge: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: Theme.borderRadius.sm,
    borderWidth: 1,
    marginLeft: Theme.spacing.sm,
  },
  categoryBadgeText: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.xs,
    textTransform: 'capitalize',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Theme.spacing.xxl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Theme.spacing.md,
  },
  emptyText: {
    fontFamily: Theme.typography.fontFamily.monoSemiBold,
    fontSize: Theme.typography.fontSize.md,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.xs,
  },
  emptyHint: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.comment,
  },
  footer: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    backgroundColor: Theme.colors.background,
  },
  footerText: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.comment,
  },
  footerHighlight: {
    color: Theme.colors.keyword,
    fontFamily: Theme.typography.fontFamily.monoSemiBold,
  },
});
