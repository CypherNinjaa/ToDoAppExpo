import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useThemeStore } from '../../stores/themeStore';
import { useTaskStore } from '../../stores/taskStore';
import { Theme } from '../../constants';
import { exportDataToFile, importDataFromJSON, clearCompletedTasks } from '../../utils/dataExport';
import { StorageService } from '../../services/storageService';

export const DataManagement: React.FC = () => {
  const { getThemeColors } = useThemeStore();
  const colors = getThemeColors();
  const { loadTasks } = useTaskStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleExportData = async () => {
    try {
      setIsProcessing(true);
      const jsonData = await exportDataToFile();
      await Clipboard.setStringAsync(jsonData);
      Alert.alert('Success', 'Backup data copied to clipboard. You can paste it somewhere safe.');
    } catch (error) {
      Alert.alert('Export Failed', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePasteImport = async () => {
    try {
      const clipboardData = await Clipboard.getStringAsync();

      if (!clipboardData) {
        Alert.alert('No Data', 'Clipboard is empty');
        return;
      }

      Alert.alert('Import from Clipboard', 'This will replace all current data. Continue?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Import',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsProcessing(true);
              await importDataFromJSON(clipboardData);
              await loadTasks();
              Alert.alert('Success', 'Data imported successfully');
            } catch (error) {
              Alert.alert('Import Failed', 'Invalid backup data in clipboard');
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ]);
    } catch (error) {
      Alert.alert('Import Failed', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const handleClearCompleted = async () => {
    Alert.alert('Clear Completed Tasks', 'Delete all completed tasks? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          try {
            setIsProcessing(true);
            const count = await clearCompletedTasks();
            await loadTasks();
            Alert.alert('Success', `${count} completed task(s) cleared`);
          } catch (error) {
            Alert.alert('Clear Failed', error instanceof Error ? error.message : 'Unknown error');
          } finally {
            setIsProcessing(false);
          }
        },
      },
    ]);
  };

  const handleClearAll = async () => {
    Alert.alert('Clear All Data', 'Delete ALL tasks and reset settings? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear All',
        style: 'destructive',
        onPress: () => {
          Alert.alert('Are You Sure?', 'This will permanently delete everything.', [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Yes, Delete All',
              style: 'destructive',
              onPress: async () => {
                try {
                  setIsProcessing(true);
                  await StorageService.clearAll();
                  await StorageService.initialize();
                  await loadTasks();
                  Alert.alert('Success', 'All data cleared');
                } catch (error) {
                  Alert.alert(
                    'Clear Failed',
                    error instanceof Error ? error.message : 'Unknown error'
                  );
                } finally {
                  setIsProcessing(false);
                }
              },
            },
          ]);
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.textPrimary }]}>
        {'const dataManagement = {'}
      </Text>

      {isProcessing && (
        <View style={[styles.loadingOverlay, { backgroundColor: colors.surface }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textPrimary }]}>Processing...</Text>
        </View>
      )}

      {/* Export Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.comment }]}>// Export & Backup</Text>

        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: colors.primary + '20', borderColor: colors.primary },
          ]}
          onPress={handleExportData}
          disabled={isProcessing}
        >
          <Text style={[styles.buttonText, { color: colors.primary }]}>
            $ export-data --clipboard
          </Text>
          <Text style={[styles.buttonSubtext, { color: colors.comment }]}>
            // Export all tasks to clipboard (JSON)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Import Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.comment }]}>// Import & Restore</Text>

        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: colors.keyword + '20', borderColor: colors.keyword },
          ]}
          onPress={handlePasteImport}
          disabled={isProcessing}
        >
          <Text style={[styles.buttonText, { color: colors.keyword }]}>
            $ import-data --from-clipboard
          </Text>
          <Text style={[styles.buttonSubtext, { color: colors.comment }]}>
            // Paste & import backup from clipboard
          </Text>
        </TouchableOpacity>
      </View>

      {/* Clear Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.comment }]}>// Clear Operations</Text>

        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: colors.warning + '20', borderColor: colors.warning },
          ]}
          onPress={handleClearCompleted}
          disabled={isProcessing}
        >
          <Text style={[styles.buttonText, { color: colors.warning }]}>$ rm --completed-tasks</Text>
          <Text style={[styles.buttonSubtext, { color: colors.comment }]}>
            // Delete all completed tasks
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.dangerButton,
            { backgroundColor: colors.error + '20', borderColor: colors.error },
          ]}
          onPress={handleClearAll}
          disabled={isProcessing}
        >
          <Text style={[styles.buttonText, { color: colors.error }]}>$ rm -rf ~/.devtodo/*</Text>
          <Text style={[styles.buttonSubtext, { color: colors.comment }]}>
            // Clear ALL data (cannot be undone)
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.closingBrace, { color: colors.textPrimary }]}>{'};\n'}</Text>

      {/* Info */}
      <View style={[styles.infoContainer, { backgroundColor: colors.surface }]}>
        <Text style={[styles.infoText, { color: colors.comment }]}>
          // Export creates JSON backup file
        </Text>
        <Text style={[styles.infoText, { color: colors.comment }]}>
          // Import replaces all current data
        </Text>
        <Text style={[styles.infoText, { color: colors.comment }]}>
          // Clear operations cannot be undone
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Theme.spacing.md,
  },
  label: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.md,
    marginBottom: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.md,
  },
  closingBrace: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.md,
    marginTop: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
  },
  section: {
    marginBottom: Theme.spacing.xl,
  },
  sectionTitle: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.md,
    marginBottom: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.md,
  },
  actionButton: {
    borderWidth: 2,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    marginHorizontal: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
  },
  dangerButton: {
    marginTop: Theme.spacing.md,
  },
  buttonText: {
    fontFamily: Theme.typography.fontFamily.monoSemiBold,
    fontSize: Theme.typography.fontSize.md,
    marginBottom: Theme.spacing.xs,
  },
  buttonSubtext: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.xs,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    opacity: 0.95,
  },
  loadingText: {
    fontFamily: Theme.typography.fontFamily.monoSemiBold,
    fontSize: Theme.typography.fontSize.md,
    marginTop: Theme.spacing.md,
  },
  infoContainer: {
    marginTop: Theme.spacing.md,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    marginHorizontal: Theme.spacing.md,
  },
  infoText: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
    lineHeight: 20,
  },
});
