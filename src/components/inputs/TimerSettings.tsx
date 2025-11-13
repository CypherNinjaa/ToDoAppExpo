import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSettingsStore } from '../../stores/settingsStore';
import { useTimerStore } from '../../stores/timerStore';
import { useThemeStore } from '../../stores/themeStore';

const DURATION_OPTIONS = [
  { label: '15 min', value: 15 * 60 },
  { label: '20 min', value: 20 * 60 },
  { label: '25 min', value: 25 * 60 },
  { label: '30 min', value: 30 * 60 },
  { label: '45 min', value: 45 * 60 },
  { label: '60 min', value: 60 * 60 },
];

const BREAK_OPTIONS = [
  { label: '3 min', value: 3 * 60 },
  { label: '5 min', value: 5 * 60 },
  { label: '10 min', value: 10 * 60 },
  { label: '15 min', value: 15 * 60 },
];

const LONG_BREAK_INTERVALS = [
  { label: 'After 2', value: 2 },
  { label: 'After 3', value: 3 },
  { label: 'After 4', value: 4 },
  { label: 'After 5', value: 5 },
];

export const TimerSettings: React.FC = () => {
  const getThemeColors = useThemeStore((state) => state.getThemeColors);
  const theme = getThemeColors();

  const settings = useSettingsStore((state) => state.settings);
  const updateSettings = useSettingsStore((state) => state.updateSettings);

  const setFocusDuration = useTimerStore((state) => state.setFocusDuration);
  const setBreakDuration = useTimerStore((state) => state.setBreakDuration);

  const handleFocusDurationChange = async (duration: number) => {
    await updateSettings({ focusDuration: duration });
    setFocusDuration(duration);
  };

  const handleBreakDurationChange = async (duration: number) => {
    await updateSettings({ breakDuration: duration });
    setBreakDuration(duration);
  };

  const handleLongBreakIntervalChange = async (interval: number) => {
    await updateSettings({ longBreakInterval: interval });
  };

  const focusDuration = settings.focusDuration || 25 * 60;
  const breakDuration = settings.breakDuration || 5 * 60;
  const longBreakInterval = settings.longBreakInterval || 4;

  return (
    <View style={styles.container}>
      {/* Focus Duration */}
      <View style={styles.section}>
        <Text style={[styles.label, { color: theme.textPrimary }]}>
          {'const focusDuration = '}
          <Text style={{ color: theme.number }}>{focusDuration / 60}</Text>
          <Text style={{ color: theme.comment }}>{' // minutes'}</Text>
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScroll}>
          {DURATION_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionButton,
                {
                  backgroundColor: theme.surface,
                  borderColor: focusDuration === option.value ? theme.primary : theme.border,
                  borderWidth: focusDuration === option.value ? 2 : 1,
                },
              ]}
              onPress={() => handleFocusDurationChange(option.value)}
            >
              <Text
                style={[
                  styles.optionText,
                  { color: focusDuration === option.value ? theme.primary : theme.textSecondary },
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Break Duration */}
      <View style={styles.section}>
        <Text style={[styles.label, { color: theme.textPrimary }]}>
          {'const breakDuration = '}
          <Text style={{ color: theme.number }}>{breakDuration / 60}</Text>
          <Text style={{ color: theme.comment }}>{' // minutes'}</Text>
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScroll}>
          {BREAK_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionButton,
                {
                  backgroundColor: theme.surface,
                  borderColor: breakDuration === option.value ? theme.success : theme.border,
                  borderWidth: breakDuration === option.value ? 2 : 1,
                },
              ]}
              onPress={() => handleBreakDurationChange(option.value)}
            >
              <Text
                style={[
                  styles.optionText,
                  { color: breakDuration === option.value ? theme.success : theme.textSecondary },
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Long Break Interval */}
      <View style={styles.section}>
        <Text style={[styles.label, { color: theme.textPrimary }]}>
          {'let longBreakAfter = '}
          <Text style={{ color: theme.number }}>{longBreakInterval}</Text>
          <Text style={{ color: theme.comment }}>{' // pomodoros'}</Text>
        </Text>
        <View style={styles.optionsRow}>
          {LONG_BREAK_INTERVALS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.intervalButton,
                {
                  backgroundColor: theme.surface,
                  borderColor: longBreakInterval === option.value ? theme.warning : theme.border,
                  borderWidth: longBreakInterval === option.value ? 2 : 1,
                },
              ]}
              onPress={() => handleLongBreakIntervalChange(option.value)}
            >
              <Text
                style={[
                  styles.optionText,
                  {
                    color: longBreakInterval === option.value ? theme.warning : theme.textSecondary,
                  },
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Info Footer */}
      <View style={[styles.footer, { borderTopColor: theme.border }]}>
        <Text style={[styles.footerText, { color: theme.comment }]}>
          {'// Timer will automatically switch to long breaks after '}
          <Text style={{ color: theme.number }}>{longBreakInterval}</Text>
          {' consecutive focus sessions'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontFamily: 'FiraCode-Regular',
    fontSize: 14,
    marginBottom: 12,
  },
  optionsScroll: {
    marginHorizontal: -4,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    marginHorizontal: 4,
  },
  intervalButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    marginHorizontal: 4,
    marginBottom: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  optionText: {
    fontFamily: 'FiraCode-Bold',
    fontSize: 13,
  },
  footer: {
    borderTopWidth: 1,
    paddingTop: 12,
    marginTop: 8,
  },
  footerText: {
    fontFamily: 'FiraCode-Regular',
    fontSize: 12,
    lineHeight: 18,
  },
});
