// TimeInput Component - Estimated time input with preset options

import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Theme } from '../../constants';

interface TimeInputProps {
  label: string;
  value: number | undefined; // in minutes
  onChange: (minutes: number | undefined) => void;
  placeholder?: string;
}

const PRESET_TIMES = [
  { label: '15m', value: 15 },
  { label: '30m', value: 30 },
  { label: '1h', value: 60 },
  { label: '2h', value: 120 },
  { label: '4h', value: 240 },
];

export const TimeInput: React.FC<TimeInputProps> = ({
  label,
  value,
  onChange,
  placeholder = '0',
}) => {
  const [inputValue, setInputValue] = React.useState(value ? value.toString() : '');

  const handleInputChange = (text: string) => {
    setInputValue(text);
    const minutes = parseInt(text, 10);
    if (text === '' || isNaN(minutes)) {
      onChange(undefined);
    } else {
      onChange(minutes);
    }
  };

  const handlePresetSelect = (minutes: number) => {
    setInputValue(minutes.toString());
    onChange(minutes);
  };

  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputValue}
          onChangeText={handleInputChange}
          placeholder={placeholder}
          placeholderTextColor={Theme.colors.comment}
          keyboardType="number-pad"
        />
        <Text style={styles.unit}>minutes</Text>
        {value !== undefined && value > 0 && (
          <Text style={styles.formatted}>({formatTime(value)})</Text>
        )}
      </View>

      <View style={styles.presetContainer}>
        {PRESET_TIMES.map((preset) => (
          <TouchableOpacity
            key={preset.value}
            style={[styles.presetButton, value === preset.value && styles.presetButtonActive]}
            onPress={() => handlePresetSelect(preset.value)}
            activeOpacity={0.7}
          >
            <Text style={[styles.presetText, value === preset.value && styles.presetTextActive]}>
              {preset.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Theme.spacing.lg,
  },
  label: {
    fontFamily: Theme.typography.fontFamily.monoSemiBold,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.keyword,
    marginBottom: Theme.spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    marginBottom: Theme.spacing.sm,
  },
  input: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.md,
    color: Theme.colors.textPrimary,
    flex: 1,
    paddingVertical: 0,
  },
  unit: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.comment,
    marginLeft: Theme.spacing.sm,
  },
  formatted: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.success,
    marginLeft: Theme.spacing.sm,
  },
  presetContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.sm,
  },
  presetButton: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.sm,
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  presetButtonActive: {
    backgroundColor: Theme.colors.success + '20',
    borderColor: Theme.colors.success,
  },
  presetText: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.textSecondary,
  },
  presetTextActive: {
    color: Theme.colors.success,
  },
});
