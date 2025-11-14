import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Modal } from 'react-native';
import { Theme, CommonStyles } from '../constants';
import { StorageService } from '../services/storage';
import {
  ThemeSelector,
  NotificationSettings,
  DisplaySettings,
  DataManagement,
  TimerSettings,
} from '../components/inputs';
import { ExportImportScreen } from './ExportImportScreen';
import { DeveloperProfileScreen } from './DeveloperProfileScreen';
import { useThemeStore } from '../stores/themeStore';

interface SettingsScreenProps {
  username: string;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ username }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [showExportImport, setShowExportImport] = useState(false);
  const [showDeveloperProfile, setShowDeveloperProfile] = useState(false);
  const fullText = '~$ ./configure.sh';
  const { getThemeColors } = useThemeStore();

  // Memoize theme colors to prevent recalculation
  const colors = useMemo(() => getThemeColors(), [getThemeColors]);

  useEffect(() => {
    let index = 0;
    setDisplayedText('');

    const interval = setInterval(() => {
      if (index < fullText.length) {
        setDisplayedText(fullText.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [fullText]);

  // Memoize callbacks
  const handleClearStorage = useCallback(() => {
    Alert.alert(
      'Clear Storage',
      'This will reset the app and show the welcome screen again. Continue?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await StorageService.clearUsername();
            // Note: User will need to manually reload the app (R, R)
            Alert.alert(
              'Storage Cleared',
              'Please reload the app (press R, R) to see the welcome screen.'
            );
          },
        },
      ]
    );
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { backgroundColor: colors.surface, borderBottomColor: colors.border },
        ]}
      >
        <Text style={[styles.title, { color: colors.keyword }]}>
          {displayedText}
          <Text style={[styles.cursor, { color: colors.primary }]}>▊</Text>
        </Text>
      </View>
      <ScrollView style={styles.scrollContent}>
        <View style={styles.content}>
          {/* Theme Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.comment }]}>
              // Theme Configuration
            </Text>
            <ThemeSelector />
          </View>

          {/* Notification Settings Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.comment }]}>
              // Notification Preferences
            </Text>
            <NotificationSettings />
          </View>

          {/* Display Settings Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.comment }]}>
              // Display Preferences
            </Text>
            <DisplaySettings />
          </View>

          {/* Timer Settings Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.comment }]}>
              // Pomodoro Timer Settings
            </Text>
            <TimerSettings />
          </View>

          {/* Data Management Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.comment }]}>// Data Management</Text>
            <DataManagement />

            <TouchableOpacity
              style={[
                styles.testButton,
                {
                  backgroundColor: colors.success + '20',
                  borderColor: colors.success,
                  marginTop: Theme.spacing.md,
                },
              ]}
              onPress={() => setShowExportImport(true)}
            >
              <Text style={[styles.testButtonText, { color: colors.success }]}>
                $ export-import
              </Text>
              <Text style={[styles.testButtonSubtext, { color: colors.comment }]}>
                // Export & Import Tasks
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.variable }]}>{'// About'}</Text>

          <TouchableOpacity
            style={[
              styles.testButton,
              {
                backgroundColor: colors.primary + '20',
                borderColor: colors.primary,
              },
            ]}
            onPress={() => setShowDeveloperProfile(true)}
          >
            <Text style={[styles.testButtonText, { color: colors.primary }]}>
              $ whoami --developer
            </Text>
            <Text style={[styles.testButtonSubtext, { color: colors.comment }]}>
              // View developer profile
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Export/Import Modal */}
      <Modal
        visible={showExportImport}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowExportImport(false)}
      >
        <ExportImportScreen onClose={() => setShowExportImport(false)} />
      </Modal>

      {/* Developer Profile Modal */}
      <Modal
        visible={showDeveloperProfile}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowDeveloperProfile(false)}
      >
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.primary }]}>
              {'// Developer Profile'}
            </Text>
            <TouchableOpacity
              style={[styles.closeButton, { borderColor: colors.border }]}
              onPress={() => setShowDeveloperProfile(false)}
            >
              <Text style={[styles.closeButtonText, { color: colors.textPrimary }]}>✕</Text>
            </TouchableOpacity>
          </View>
          <DeveloperProfileScreen />
        </View>
      </Modal>
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
  scrollContent: {
    flex: 1,
  },
  content: {
    padding: Theme.layout.screenPadding,
  },
  title: {
    fontSize: Theme.typography.fontSize.xxl,
    fontFamily: Theme.typography.fontFamily.mono,
  },
  cursor: {
    opacity: 0.7,
  },
  section: {
    marginBottom: Theme.spacing.xl,
  },
  sectionTitle: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.md,
    marginBottom: Theme.spacing.md,
  },
  testButton: {
    borderWidth: 2,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
  },
  testButtonText: {
    fontFamily: Theme.typography.fontFamily.monoSemiBold,
    fontSize: Theme.typography.fontSize.md,
    marginBottom: Theme.spacing.xs,
  },
  testButtonSubtext: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.xs,
  },
  dangerButton: {
    borderWidth: 2,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    marginTop: Theme.spacing.xxl,
    marginBottom: Theme.spacing.xxl,
  },
  dangerButtonText: {
    fontFamily: Theme.typography.fontFamily.monoSemiBold,
    fontSize: Theme.typography.fontSize.md,
    marginBottom: Theme.spacing.xs,
  },
  dangerButtonSubtext: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.xs,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontFamily: Theme.typography.fontFamily.monoSemiBold,
    fontSize: 18,
  },
  closeButton: {
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
});
