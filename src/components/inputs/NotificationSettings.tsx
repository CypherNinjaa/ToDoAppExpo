import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { useThemeStore } from '../../stores/themeStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { Theme } from '../../constants';

export const NotificationSettings: React.FC = () => {
  const { getThemeColors } = useThemeStore();
  const colors = getThemeColors();
  const { settings, updateSettings } = useSettingsStore();

  const handleToggleNotifications = async (value: boolean) => {
    await updateSettings({ notifications: value });
  };

  const handleToggleSound = async (value: boolean) => {
    await updateSettings({ soundEnabled: value });
  };

  const handleToggleDailySummary = async (value: boolean) => {
    await updateSettings({ dailySummaryEnabled: value });
  };

  const handleToggleStreakNotifications = async (value: boolean) => {
    await updateSettings({ streakNotificationsEnabled: value });
  };

  const handleToggleOverdueAlerts = async (value: boolean) => {
    await updateSettings({ overdueAlertsEnabled: value });
  };

  const handleSetDailySummaryTime = (time: string) => {
    // Options: "08:00", "09:00", "20:00", "21:00"
    updateSettings({ dailySummaryTime: time });
  };

  const handleSetDeadlineHours = (hours: number) => {
    // Options: 1, 3, 6, 24
    updateSettings({ upcomingDeadlineHours: hours });
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.textPrimary }]}>{'const notifications = {'}</Text>

      {/* Master Toggle */}
      <View
        style={[styles.settingRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
      >
        <View style={styles.settingInfo}>
          <Text style={[styles.settingTitle, { color: colors.keyword }]}>
            enabled: {settings.notifications ? 'true' : 'false'}
          </Text>
          <Text style={[styles.settingDescription, { color: colors.comment }]}>
            // Master switch for all notifications
          </Text>
        </View>
        <Switch
          value={settings.notifications}
          onValueChange={handleToggleNotifications}
          trackColor={{ false: colors.border, true: colors.primary + '80' }}
          thumbColor={settings.notifications ? colors.primary : colors.textSecondary}
        />
      </View>

      {/* Sound Toggle */}
      <View
        style={[styles.settingRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
      >
        <View style={styles.settingInfo}>
          <Text style={[styles.settingTitle, { color: colors.keyword }]}>
            sound: {settings.soundEnabled ? 'true' : 'false'}
          </Text>
          <Text style={[styles.settingDescription, { color: colors.comment }]}>
            // Play sound with notifications
          </Text>
        </View>
        <Switch
          value={settings.soundEnabled}
          onValueChange={handleToggleSound}
          disabled={!settings.notifications}
          trackColor={{ false: colors.border, true: colors.primary + '80' }}
          thumbColor={settings.soundEnabled ? colors.primary : colors.textSecondary}
        />
      </View>

      {/* Notification Types Header */}
      <Text style={[styles.subLabel, { color: colors.textPrimary }]}>types: {'{'}</Text>

      {/* Daily Summary */}
      <View
        style={[
          styles.settingRow,
          styles.indented,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View style={styles.settingInfo}>
          <Text style={[styles.settingTitle, { color: colors.string }]}>
            dailySummary: {(settings.dailySummaryEnabled ?? true) ? 'true' : 'false'}
          </Text>
          <Text style={[styles.settingDescription, { color: colors.comment }]}>
            // Morning & evening task summaries
          </Text>
        </View>
        <Switch
          value={settings.dailySummaryEnabled ?? true}
          onValueChange={handleToggleDailySummary}
          disabled={!settings.notifications}
          trackColor={{ false: colors.border, true: colors.primary + '80' }}
          thumbColor={
            (settings.dailySummaryEnabled ?? true) ? colors.primary : colors.textSecondary
          }
        />
      </View>

      {/* Daily Summary Time Selection */}
      {(settings.dailySummaryEnabled ?? true) && settings.notifications && (
        <View style={[styles.timeSelector, styles.indented]}>
          <Text style={[styles.timeLabel, { color: colors.comment }]}>
            // Summary time (morning):
          </Text>
          <View style={styles.timeOptions}>
            {['08:00', '09:00', '10:00'].map((time) => (
              <TouchableOpacity
                key={time}
                style={[
                  styles.timeButton,
                  {
                    backgroundColor:
                      settings.dailySummaryTime === time ? colors.primary : colors.surface,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => handleSetDailySummaryTime(time)}
              >
                <Text
                  style={[
                    styles.timeButtonText,
                    {
                      color: settings.dailySummaryTime === time ? '#000' : colors.textPrimary,
                    },
                  ]}
                >
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Streak Notifications */}
      <View
        style={[
          styles.settingRow,
          styles.indented,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View style={styles.settingInfo}>
          <Text style={[styles.settingTitle, { color: colors.string }]}>
            streaks: {(settings.streakNotificationsEnabled ?? true) ? 'true' : 'false'}
          </Text>
          <Text style={[styles.settingDescription, { color: colors.comment }]}>
            // Celebrate milestones & streaks
          </Text>
        </View>
        <Switch
          value={settings.streakNotificationsEnabled ?? true}
          onValueChange={handleToggleStreakNotifications}
          disabled={!settings.notifications}
          trackColor={{ false: colors.border, true: colors.primary + '80' }}
          thumbColor={
            (settings.streakNotificationsEnabled ?? true) ? colors.primary : colors.textSecondary
          }
        />
      </View>

      {/* Overdue Alerts */}
      <View
        style={[
          styles.settingRow,
          styles.indented,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View style={styles.settingInfo}>
          <Text style={[styles.settingTitle, { color: colors.string }]}>
            overdueAlerts: {(settings.overdueAlertsEnabled ?? true) ? 'true' : 'false'}
          </Text>
          <Text style={[styles.settingDescription, { color: colors.comment }]}>
            // Alert for overdue tasks
          </Text>
        </View>
        <Switch
          value={settings.overdueAlertsEnabled ?? true}
          onValueChange={handleToggleOverdueAlerts}
          disabled={!settings.notifications}
          trackColor={{ false: colors.border, true: colors.primary + '80' }}
          thumbColor={
            (settings.overdueAlertsEnabled ?? true) ? colors.primary : colors.textSecondary
          }
        />
      </View>

      {/* Deadline Warning Hours */}
      {(settings.overdueAlertsEnabled ?? true) && settings.notifications && (
        <View style={[styles.timeSelector, styles.indented]}>
          <Text style={[styles.timeLabel, { color: colors.comment }]}>
            // Warn before deadline (hours):
          </Text>
          <View style={styles.timeOptions}>
            {[1, 3, 6, 24].map((hours) => (
              <TouchableOpacity
                key={hours}
                style={[
                  styles.timeButton,
                  {
                    backgroundColor:
                      (settings.upcomingDeadlineHours ?? 3) === hours
                        ? colors.primary
                        : colors.surface,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => handleSetDeadlineHours(hours)}
              >
                <Text
                  style={[
                    styles.timeButtonText,
                    {
                      color:
                        (settings.upcomingDeadlineHours ?? 3) === hours
                          ? '#000'
                          : colors.textPrimary,
                    },
                  ]}
                >
                  {hours}h
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <Text style={[styles.closingBrace, { color: colors.textPrimary }]}>{'  }'}</Text>
      <Text style={[styles.closingBrace, { color: colors.textPrimary }]}>{'};\n'}</Text>

      {/* Info */}
      <View style={[styles.infoContainer, { backgroundColor: colors.surface }]}>
        <Text style={[styles.infoText, { color: colors.comment }]}>
          // Notification preferences saved to AsyncStorage
        </Text>
        <Text style={[styles.infoText, { color: colors.comment }]}>
          // Changes apply immediately
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
  subLabel: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.md,
    marginTop: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
  },
  closingBrace: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.md,
    marginTop: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    marginHorizontal: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
    borderWidth: 1,
  },
  indented: {
    marginLeft: Theme.spacing.xxl,
    marginRight: Theme.spacing.md,
  },
  settingInfo: {
    flex: 1,
    marginRight: Theme.spacing.md,
  },
  settingTitle: {
    fontFamily: Theme.typography.fontFamily.monoSemiBold,
    fontSize: Theme.typography.fontSize.md,
    marginBottom: Theme.spacing.xs,
  },
  settingDescription: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.xs,
  },
  timeSelector: {
    marginHorizontal: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
  },
  timeLabel: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
    marginBottom: Theme.spacing.sm,
  },
  timeOptions: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
  },
  timeButton: {
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
    borderRadius: Theme.borderRadius.sm,
    borderWidth: 1,
  },
  timeButtonText: {
    fontFamily: Theme.typography.fontFamily.monoSemiBold,
    fontSize: Theme.typography.fontSize.sm,
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
