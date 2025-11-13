import React, { useEffect, useState } from 'react';
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
import { useThemeStore } from '../stores/themeStore';
import { useThemeStore } from '../stores/themeStore';
import { useThemeStore } from '../stores/themeStore';
import {
  testNotificationDelivery,
  testNotificationChannels,
  cancelAllTestNotifications,
} from '../utils/notificationTest';

interface SettingsScreenProps {
  username: string;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ username }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [showExportImport, setShowExportImport] = useState(false);
  const fullText = '~$ ./configure.sh';
  const { getThemeColors } = useThemeStore();
  const colors = getThemeColors();

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

  const handleClearStorage = () => {
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
  };

  const handleTestNotification = async () => {
    Alert.alert('Testing Notifications', 'Check your notification tray in 1-2 seconds');
    await testNotificationDelivery();
  };

  const handleTestAllChannels = async () => {
    Alert.alert('Testing All Channels', 'You will receive 4 notifications over the next 8 seconds');
    await testNotificationChannels();
  };

  const handleCancelNotifications = async () => {
    await cancelAllTestNotifications();
    Alert.alert('Done', 'All scheduled notifications cancelled');
  };

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

          {/* Notification Testing Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.comment }]}>
              // Notification Testing
            </Text>

            <TouchableOpacity
              style={[
                styles.testButton,
                {
                  backgroundColor: colors.primary + '20',
                  borderColor: colors.primary,
                },
              ]}
              onPress={handleTestNotification}
            >
              <Text style={[styles.testButtonText, { color: colors.primary }]}>
                $ test-notification --basic
              </Text>
              <Text style={[styles.testButtonSubtext, { color: colors.comment }]}>
                // Send 2 test notifications
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.testButton,
                {
                  backgroundColor: colors.primary + '20',
                  borderColor: colors.primary,
                },
              ]}
              onPress={handleTestAllChannels}
            >
              <Text style={[styles.testButtonText, { color: colors.primary }]}>
                $ test-notification --all-channels
              </Text>
              <Text style={[styles.testButtonSubtext, { color: colors.comment }]}>
                // Test all 4 notification channels
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.testButton,
                {
                  backgroundColor: colors.primary + '20',
                  borderColor: colors.primary,
                },
              ]}
              onPress={handleCancelNotifications}
            >
              <Text style={[styles.testButtonText, { color: colors.primary }]}>
                $ cancel-notifications --all
              </Text>
              <Text style={[styles.testButtonSubtext, { color: colors.comment }]}>
                // Clear scheduled notifications
              </Text>
            </TouchableOpacity>
          </View>
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
});
