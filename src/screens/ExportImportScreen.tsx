// ExportImportScreen - Export and Import data UI

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Theme } from '../constants';
import { useThemeStore } from '../stores/themeStore';
import { useTaskStore } from '../stores/taskStore';
import { ExportService, ExportFormat } from '../services/exportService';
import { ImportService, ImportFormat } from '../services/importService';
import * as Clipboard from 'expo-clipboard';
import * as DocumentPicker from 'expo-document-picker';

interface ExportImportScreenProps {
  onClose: () => void;
}

export const ExportImportScreen: React.FC<ExportImportScreenProps> = ({ onClose }) => {
  const getThemeColors = useThemeStore((state) => state.getThemeColors);
  const theme = getThemeColors();
  const tasks = useTaskStore((state) => state.tasks);
  const addTask = useTaskStore((state) => state.addTask);

  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('json');
  const [includeCompleted, setIncludeCompleted] = useState(true);
  const [includeArchived, setIncludeArchived] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importContent, setImportContent] = useState('');

  const categories = ['learning', 'coding', 'assignment', 'project', 'personal'];

  const handleExport = useCallback(async () => {
    try {
      setIsProcessing(true);

      const exportOptions = {
        format: exportFormat,
        tasks,
        includeCompleted,
        includeArchived,
        categories: selectedCategories.length > 0 ? selectedCategories : undefined,
      };

      const content = await ExportService.export(exportOptions);
      await ExportService.copyToClipboard(content);

      const stats = ExportService.getExportStats(
        ExportService['filterTasks'](tasks, exportOptions)
      );

      Alert.alert(
        'Export Successful',
        `Exported ${stats.total} tasks to clipboard!\n\nFormat: ${exportFormat.toUpperCase()}\nFilename: ${ExportService.getExportFilename(exportFormat)}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        'Export Failed',
        error instanceof Error ? error.message : 'Unknown error occurred'
      );
    } finally {
      setIsProcessing(false);
    }
  }, [exportFormat, tasks, includeCompleted, includeArchived, selectedCategories]);

  const handleImport = useCallback(async () => {
    if (!importContent.trim()) {
      Alert.alert('Error', 'Please paste content to import');
      return;
    }

    try {
      setIsProcessing(true);

      // Validate content
      const validation = ImportService.validateContent(importContent);
      if (!validation.valid) {
        Alert.alert('Invalid Content', validation.error);
        setIsProcessing(false);
        return;
      }

      // Detect format
      const format = ImportService.detectFormat(importContent);
      if (!format) {
        Alert.alert('Error', 'Unable to detect format');
        setIsProcessing(false);
        return;
      }

      // Import tasks
      const result = await ImportService.import(importContent, format, tasks);

      if (!result.success) {
        Alert.alert(
          'Import Failed',
          result.errors.length > 0 ? result.errors.join('\n') : 'No tasks imported'
        );
        setIsProcessing(false);
        return;
      }

      // Show results
      let message = `Successfully imported ${result.stats.imported} tasks!`;
      if (result.stats.duplicates > 0) {
        message += `\n\nDuplicates skipped: ${result.stats.duplicates}`;
      }
      if (result.stats.skipped > 0) {
        message += `\n\nErrors: ${result.stats.skipped}`;
      }
      if (result.errors.length > 0) {
        message += `\n\nWarnings:\n${result.errors.slice(0, 3).join('\n')}`;
      }

      Alert.alert('Import Complete', message, [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Import',
          onPress: async () => {
            // Add imported tasks
            for (const task of result.tasks) {
              await addTask(task);
            }
            setImportContent('');
            Alert.alert('Success', `${result.tasks.length} tasks added!`);
          },
        },
      ]);
    } catch (error) {
      Alert.alert(
        'Import Failed',
        error instanceof Error ? error.message : 'Unknown error occurred'
      );
    } finally {
      setIsProcessing(false);
    }
  }, [importContent, tasks, addTask]);

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.assets && result.assets.length > 0) {
        setImportContent(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to pick document');
    }
  };

  const handlePasteFromClipboard = useCallback(async () => {
    try {
      const text = await Clipboard.getStringAsync();
      if (text) {
        setImportContent(text);
      } else {
        Alert.alert('Clipboard Empty', 'No content found in clipboard');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to read clipboard');
    }
  }, []);

  const toggleCategory = useCallback(
    (category: string) => {
      if (selectedCategories.includes(category)) {
        setSelectedCategories(selectedCategories.filter((c) => c !== category));
      } else {
        setSelectedCategories([...selectedCategories, category]);
      }
    },
    [selectedCategories]
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.keyword }]}>{'$ ./data-manager.sh'}</Text>
        <Text style={[styles.headerSubtitle, { color: theme.comment }]}>
          {'// Export & Import Tasks'}
        </Text>
        <TouchableOpacity
          style={[styles.closeButton, { borderColor: theme.border }]}
          onPress={onClose}
        >
          <Text style={[styles.closeButtonText, { color: theme.textPrimary }]}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[
            styles.tab,
            {
              backgroundColor: activeTab === 'export' ? theme.surface : 'transparent',
              borderColor: theme.border,
            },
          ]}
          onPress={() => setActiveTab('export')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'export' ? theme.primary : theme.textSecondary },
            ]}
          >
            {'$ export'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            {
              backgroundColor: activeTab === 'import' ? theme.surface : 'transparent',
              borderColor: theme.border,
            },
          ]}
          onPress={() => setActiveTab('import')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'import' ? theme.primary : theme.textSecondary },
            ]}
          >
            {'$ import'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'export' ? (
          <View>
            {/* Format Selection */}
            <Text style={[styles.sectionLabel, { color: theme.keyword }]}>
              {'// Select export format:'}
            </Text>
            <View style={styles.formatGrid}>
              {(['json', 'markdown', 'text', 'github'] as ExportFormat[]).map((format) => (
                <TouchableOpacity
                  key={format}
                  style={[
                    styles.formatButton,
                    {
                      backgroundColor:
                        exportFormat === format ? theme.primary + '20' : theme.surface,
                      borderColor: exportFormat === format ? theme.primary : theme.border,
                    },
                  ]}
                  onPress={() => setExportFormat(format)}
                >
                  <Text
                    style={[
                      styles.formatButtonText,
                      { color: exportFormat === format ? theme.primary : theme.textPrimary },
                    ]}
                  >
                    {format.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Options */}
            <Text style={[styles.sectionLabel, { color: theme.keyword }]}>
              {'// Export options:'}
            </Text>

            <TouchableOpacity
              style={[styles.checkbox, { borderColor: theme.border }]}
              onPress={() => setIncludeCompleted(!includeCompleted)}
            >
              <View
                style={[
                  styles.checkboxBox,
                  {
                    backgroundColor: includeCompleted ? theme.success : 'transparent',
                    borderColor: theme.border,
                  },
                ]}
              >
                {includeCompleted && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={[styles.checkboxLabel, { color: theme.textPrimary }]}>
                Include completed tasks
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.checkbox, { borderColor: theme.border }]}
              onPress={() => setIncludeArchived(!includeArchived)}
            >
              <View
                style={[
                  styles.checkboxBox,
                  {
                    backgroundColor: includeArchived ? theme.success : 'transparent',
                    borderColor: theme.border,
                  },
                ]}
              >
                {includeArchived && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={[styles.checkboxLabel, { color: theme.textPrimary }]}>
                Include archived tasks
              </Text>
            </TouchableOpacity>

            {/* Category Filter */}
            <Text style={[styles.sectionLabel, { color: theme.keyword }]}>
              {'// Filter by categories (optional):'}
            </Text>
            <View style={styles.categoryGrid}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: selectedCategories.includes(category)
                        ? theme.primary + '20'
                        : theme.surface,
                      borderColor: selectedCategories.includes(category)
                        ? theme.primary
                        : theme.border,
                    },
                  ]}
                  onPress={() => toggleCategory(category)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      {
                        color: selectedCategories.includes(category)
                          ? theme.primary
                          : theme.textSecondary,
                      },
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Export Button */}
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: theme.success + '20', borderColor: theme.success },
              ]}
              onPress={handleExport}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator color={theme.success} />
              ) : (
                <>
                  <Text style={[styles.actionButtonText, { color: theme.success }]}>
                    {'$ export --to-clipboard'}
                  </Text>
                  <Text style={[styles.actionButtonSubtext, { color: theme.comment }]}>
                    // Copy to clipboard
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            {/* Import Instructions */}
            <Text style={[styles.sectionLabel, { color: theme.keyword }]}>
              {'// Paste exported data:'}
            </Text>
            <Text style={[styles.infoText, { color: theme.comment }]}>
              Supported formats: JSON, Markdown
            </Text>

            {/* Import Text Area */}
            <TextInput
              style={[
                styles.importTextArea,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  color: theme.textPrimary,
                },
              ]}
              value={importContent}
              onChangeText={setImportContent}
              placeholder="Paste your exported data here..."
              placeholderTextColor={theme.comment}
              multiline
              numberOfLines={10}
              textAlignVertical="top"
            />

            {/* Paste from Clipboard Button */}
            <TouchableOpacity
              style={[
                styles.secondaryButton,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
              onPress={handlePasteFromClipboard}
            >
              <Text style={[styles.secondaryButtonText, { color: theme.textPrimary }]}>
                {'$ paste --from-clipboard'}
              </Text>
            </TouchableOpacity>

            {/* Import Button */}
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: theme.primary + '20', borderColor: theme.primary },
              ]}
              onPress={handleImport}
              disabled={isProcessing || !importContent.trim()}
            >
              {isProcessing ? (
                <ActivityIndicator color={theme.primary} />
              ) : (
                <>
                  <Text style={[styles.actionButtonText, { color: theme.primary }]}>
                    {'$ import --validate'}
                  </Text>
                  <Text style={[styles.actionButtonSubtext, { color: theme.comment }]}>
                    // Preview before importing
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: Theme.layout.screenPadding,
    paddingBottom: Theme.spacing.lg,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontFamily: Theme.typography.fontFamily.monoSemiBold,
    fontSize: Theme.typography.fontSize.xl,
    marginBottom: Theme.spacing.xs,
  },
  headerSubtitle: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: Theme.layout.screenPadding,
    width: 32,
    height: 32,
    borderRadius: 4,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  tabs: {
    flexDirection: 'row',
    padding: Theme.spacing.md,
    gap: Theme.spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  tabText: {
    fontFamily: Theme.typography.fontFamily.monoSemiBold,
    fontSize: Theme.typography.fontSize.md,
  },
  content: {
    flex: 1,
    padding: Theme.layout.screenPadding,
  },
  sectionLabel: {
    fontFamily: Theme.typography.fontFamily.monoSemiBold,
    fontSize: Theme.typography.fontSize.sm,
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
  },
  formatGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
  },
  formatButton: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 2,
    alignItems: 'center',
  },
  formatButtonText: {
    fontFamily: Theme.typography.fontFamily.monoBold,
    fontSize: Theme.typography.fontSize.md,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 1,
    marginRight: Theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: Theme.colors.background,
    fontWeight: 'bold',
    fontSize: 16,
  },
  checkboxLabel: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.lg,
  },
  categoryChip: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
  },
  categoryChipText: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.xs,
    textTransform: 'uppercase',
  },
  actionButton: {
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 2,
    alignItems: 'center',
    marginTop: Theme.spacing.xl,
  },
  actionButtonText: {
    fontFamily: Theme.typography.fontFamily.monoBold,
    fontSize: Theme.typography.fontSize.md,
    marginBottom: Theme.spacing.xs,
  },
  actionButtonSubtext: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.xs,
  },
  infoText: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.xs,
    marginBottom: Theme.spacing.md,
  },
  importTextArea: {
    borderWidth: 1,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
    minHeight: 200,
    marginBottom: Theme.spacing.md,
  },
  secondaryButton: {
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  secondaryButtonText: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
  },
});
