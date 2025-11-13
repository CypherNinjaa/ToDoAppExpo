import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { useThemeStore } from '../../stores/themeStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { Theme } from '../../constants';

export const DisplaySettings: React.FC = () => {
  const { getThemeColors } = useThemeStore();
  const colors = getThemeColors();
  const { settings, updateSettings } = useSettingsStore();

  const handleSetFontSize = async (size: number) => {
    await updateSettings({ fontSize: size });
  };

  const handleSetDateFormat = async (format: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD') => {
    await updateSettings({ dateFormat: format });
  };

  const handleSetWeekStart = async (day: 'monday' | 'sunday') => {
    await updateSettings({ weekStartsOn: day });
  };

  const handleToggle24Hour = async (value: boolean) => {
    await updateSettings({ use24HourTime: value });
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.textPrimary }]}>{'const display = {'}</Text>

      {/* Font Size */}
      <View style={styles.settingContainer}>
        <Text style={[styles.settingLabel, { color: colors.comment }]}>// Font size (pt):</Text>
        <View style={styles.optionsRow}>
          {[12, 14, 16, 18].map((size) => (
            <TouchableOpacity
              key={size}
              style={[
                styles.optionButton,
                {
                  backgroundColor:
                    (settings.fontSize ?? 14) === size ? colors.primary : colors.surface,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => handleSetFontSize(size)}
            >
              <Text
                style={[
                  styles.optionText,
                  {
                    color: (settings.fontSize ?? 14) === size ? '#000' : colors.textPrimary,
                  },
                ]}
              >
                {size}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={[styles.codeText, { color: colors.keyword }]}>
          fontSize: {settings.fontSize ?? 14},
        </Text>
      </View>

      {/* Date Format */}
      <View style={styles.settingContainer}>
        <Text style={[styles.settingLabel, { color: colors.comment }]}>// Date format:</Text>
        <View style={styles.optionsColumn}>
          {[
            { format: 'MM/DD/YYYY' as const, label: 'MM/DD/YYYY', example: '11/13/2025' },
            { format: 'DD/MM/YYYY' as const, label: 'DD/MM/YYYY', example: '13/11/2025' },
            { format: 'YYYY-MM-DD' as const, label: 'YYYY-MM-DD', example: '2025-11-13' },
          ].map((option) => (
            <TouchableOpacity
              key={option.format}
              style={[
                styles.optionButtonWide,
                {
                  backgroundColor:
                    (settings.dateFormat ?? 'MM/DD/YYYY') === option.format
                      ? colors.primary
                      : colors.surface,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => handleSetDateFormat(option.format)}
            >
              <Text
                style={[
                  styles.optionTextWide,
                  {
                    color:
                      (settings.dateFormat ?? 'MM/DD/YYYY') === option.format
                        ? '#000'
                        : colors.textPrimary,
                  },
                ]}
              >
                {option.label}
              </Text>
              <Text
                style={[
                  styles.exampleText,
                  {
                    color:
                      (settings.dateFormat ?? 'MM/DD/YYYY') === option.format
                        ? '#000000AA'
                        : colors.comment,
                  },
                ]}
              >
                {option.example}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={[styles.codeText, { color: colors.keyword }]}>
          dateFormat: "{settings.dateFormat ?? 'MM/DD/YYYY'}",
        </Text>
      </View>

      {/* Week Start Day */}
      <View style={styles.settingContainer}>
        <Text style={[styles.settingLabel, { color: colors.comment }]}>// Week starts on:</Text>
        <View style={styles.optionsRow}>
          {[
            { value: 'monday' as const, label: 'Monday' },
            { value: 'sunday' as const, label: 'Sunday' },
          ].map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionButtonMedium,
                {
                  backgroundColor:
                    (settings.weekStartsOn ?? 'monday') === option.value
                      ? colors.primary
                      : colors.surface,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => handleSetWeekStart(option.value)}
            >
              <Text
                style={[
                  styles.optionText,
                  {
                    color:
                      (settings.weekStartsOn ?? 'monday') === option.value
                        ? '#000'
                        : colors.textPrimary,
                  },
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={[styles.codeText, { color: colors.keyword }]}>
          weekStartsOn: "{settings.weekStartsOn ?? 'monday'}",
        </Text>
      </View>

      {/* 24-Hour Time Toggle */}
      <View
        style={[styles.settingRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
      >
        <View style={styles.settingInfo}>
          <Text style={[styles.settingTitle, { color: colors.keyword }]}>
            use24HourTime: {(settings.use24HourTime ?? false) ? 'true' : 'false'}
          </Text>
          <Text style={[styles.settingDescription, { color: colors.comment }]}>
            // Display time in 24-hour format (15:30 vs 3:30 PM)
          </Text>
        </View>
        <Switch
          value={settings.use24HourTime ?? false}
          onValueChange={handleToggle24Hour}
          trackColor={{ false: colors.border, true: colors.primary + '80' }}
          thumbColor={(settings.use24HourTime ?? false) ? colors.primary : colors.textSecondary}
        />
      </View>

      <Text style={[styles.closingBrace, { color: colors.textPrimary }]}>{'};\n'}</Text>

      {/* Info */}
      <View style={[styles.infoContainer, { backgroundColor: colors.surface }]}>
        <Text style={[styles.infoText, { color: colors.comment }]}>
          // Display preferences saved to AsyncStorage
        </Text>
        <Text style={[styles.infoText, { color: colors.comment }]}>
          // Changes apply immediately across all screens
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
  settingContainer: {
    marginHorizontal: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
  },
  settingLabel: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
    marginBottom: Theme.spacing.sm,
  },
  codeText: {
    fontFamily: Theme.typography.fontFamily.monoSemiBold,
    fontSize: Theme.typography.fontSize.md,
    marginTop: Theme.spacing.sm,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.xs,
  },
  optionsColumn: {
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.xs,
  },
  optionButton: {
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.sm,
    borderWidth: 1,
  },
  optionButtonMedium: {
    flex: 1,
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.sm,
    borderWidth: 1,
    alignItems: 'center',
  },
  optionButtonWide: {
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.sm,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionText: {
    fontFamily: Theme.typography.fontFamily.monoSemiBold,
    fontSize: Theme.typography.fontSize.sm,
  },
  optionTextWide: {
    fontFamily: Theme.typography.fontFamily.monoSemiBold,
    fontSize: Theme.typography.fontSize.md,
  },
  exampleText: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
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
