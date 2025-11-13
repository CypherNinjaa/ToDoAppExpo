// ReminderSelector Component - Select reminder time for tasks

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Theme } from '../../constants';

interface ReminderSelectorProps {
  dueDate?: Date;
  reminderDate?: Date;
  reminderEnabled?: boolean;
  onReminderChange: (reminderDate: Date | undefined, enabled: boolean) => void;
}

export const ReminderSelector: React.FC<ReminderSelectorProps> = ({
  dueDate,
  reminderDate,
  reminderEnabled = false,
  onReminderChange,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState(reminderDate || new Date());

  const handleToggle = (value: boolean) => {
    if (!value) {
      onReminderChange(undefined, false);
    } else {
      // Set default reminder: 1 hour before due date or 1 hour from now
      const defaultReminder = dueDate
        ? new Date(dueDate.getTime() - 60 * 60 * 1000)
        : new Date(Date.now() + 60 * 60 * 1000);
      setTempDate(defaultReminder);
      onReminderChange(defaultReminder, true);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) {
      setTempDate(selectedDate);
      onReminderChange(selectedDate, true);
    }
  };

  const handlePresetSelect = (minutesBefore: number) => {
    if (!dueDate) return;

    const reminderTime = new Date(dueDate.getTime() - minutesBefore * 60 * 1000);
    setTempDate(reminderTime);
    onReminderChange(reminderTime, true);
  };

  const formatReminderTime = (date: Date): string => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const PRESETS = [
    { label: '15 min before', value: 15 },
    { label: '30 min before', value: 30 },
    { label: '1 hour before', value: 60 },
    { label: '1 day before', value: 1440 },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>setReminder(task)</Text>
        <Switch
          value={reminderEnabled}
          onValueChange={handleToggle}
          trackColor={{ false: Theme.colors.border, true: Theme.colors.primary + '80' }}
          thumbColor={reminderEnabled ? Theme.colors.primary : Theme.colors.textSecondary}
        />
      </View>

      {reminderEnabled && (
        <>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowPicker(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.dateButtonLabel}>Remind me:</Text>
            <Text style={styles.dateButtonValue}>{formatReminderTime(tempDate)}</Text>
          </TouchableOpacity>

          {dueDate && (
            <View style={styles.presetContainer}>
              {PRESETS.map((preset) => (
                <TouchableOpacity
                  key={preset.value}
                  style={styles.presetButton}
                  onPress={() => handlePresetSelect(preset.value)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.presetText}>{preset.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {showPicker && (
            <DateTimePicker
              value={tempDate}
              mode="datetime"
              display="default"
              onChange={handleDateChange}
              minimumDate={new Date()}
              maximumDate={dueDate}
            />
          )}

          <Text style={styles.hint}>// Notification will be sent at this time</Text>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  label: {
    fontFamily: Theme.typography.fontFamily.monoSemiBold,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.keyword,
  },
  dateButton: {
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
  },
  dateButtonLabel: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.comment,
    marginBottom: Theme.spacing.xs,
  },
  dateButtonValue: {
    fontFamily: Theme.typography.fontFamily.monoSemiBold,
    fontSize: Theme.typography.fontSize.md,
    color: Theme.colors.primary,
  },
  presetContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.sm,
  },
  presetButton: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.sm,
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  presetText: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.textSecondary,
  },
  hint: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.comment,
  },
});
