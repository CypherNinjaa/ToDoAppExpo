// DatePicker - Date Constructor Style

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Platform } from 'react-native';
import { Theme } from '../../constants';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

interface DatePickerProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  label?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, label }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [mode, setMode] = useState<'date' | 'relative'>('relative');

  const relativeOptions: { label: string; value: () => Date }[] = [
    {
      label: 'today',
      value: () => {
        const date = new Date();
        date.setHours(23, 59, 59, 999);
        return date;
      },
    },
    {
      label: 'tomorrow',
      value: () => {
        const date = new Date();
        date.setDate(date.getDate() + 1);
        date.setHours(23, 59, 59, 999);
        return date;
      },
    },
    {
      label: 'nextWeek',
      value: () => {
        const date = new Date();
        date.setDate(date.getDate() + 7);
        date.setHours(23, 59, 59, 999);
        return date;
      },
    },
  ];

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }

    if (event.type === 'set' && selectedDate) {
      onChange(selectedDate);
    }
  };

  const handleRelativeDate = (getDate: () => Date) => {
    onChange(getDate());
    setMode('relative');
  };

  const formatDate = (date: Date | undefined): string => {
    if (!date) return 'undefined';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `"${year}-${month}-${day}"`;
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={styles.codeContainer}>
        {/* Date constructor syntax */}
        <View style={styles.syntaxLine}>
          <Text style={styles.keyword}>const</Text>
          <Text style={styles.variable}> deadline </Text>
          <Text style={styles.operator}>=</Text>
          <Text style={styles.keyword}> new </Text>
          <Text style={styles.constructor}>Date</Text>
          <Text style={styles.bracket}>(</Text>
          <Text style={styles.string}>{formatDate(value)}</Text>
          <Text style={styles.bracket}>)</Text>
          <Text style={styles.semicolon}>;</Text>
        </View>

        {/* Quick options */}
        <View style={styles.optionsContainer}>
          <Text style={styles.comment}>// Quick select:</Text>

          <View style={styles.buttonsRow}>
            {relativeOptions.map((option) => (
              <TouchableOpacity
                key={option.label}
                style={styles.quickButton}
                onPress={() => handleRelativeDate(option.value)}
                activeOpacity={0.7}
              >
                <Text style={styles.quickButtonText}>{option.label}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={[styles.quickButton, styles.customButton]}
              onPress={() => setShowPicker(true)}
              activeOpacity={0.7}
            >
              <Text style={[styles.quickButtonText, styles.customButtonText]}>custom</Text>
            </TouchableOpacity>

            {value && (
              <TouchableOpacity
                style={[styles.quickButton, styles.clearButton]}
                onPress={() => onChange(undefined)}
                activeOpacity={0.7}
              >
                <Text style={[styles.quickButtonText, styles.clearButtonText]}>clear</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Date picker modal */}
      {showPicker && (
        <Modal
          transparent
          animationType="fade"
          visible={showPicker}
          onRequestClose={() => setShowPicker(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowPicker(false)}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Date</Text>
              <DateTimePicker
                value={value || new Date()}
                mode="date"
                display="default"
                onChange={handleDateChange}
                minimumDate={new Date()}
                accentColor={Theme.colors.primary}
              />
              <TouchableOpacity style={styles.modalButton} onPress={() => setShowPicker(false)}>
                <Text style={styles.modalButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Theme.spacing.md,
  },
  label: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.comment,
    marginBottom: Theme.spacing.xs,
  },
  codeContainer: {
    backgroundColor: Theme.colors.inputBackground,
    borderWidth: 2,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
  },
  syntaxLine: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  keyword: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.md,
    color: Theme.colors.keyword,
  },
  variable: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.md,
    color: Theme.colors.variable,
  },
  operator: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.md,
    color: Theme.colors.textPrimary,
    marginHorizontal: Theme.spacing.xs,
  },
  constructor: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.md,
    color: Theme.colors.function,
  },
  bracket: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.md,
    color: Theme.colors.function,
  },
  string: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.md,
    color: Theme.colors.string,
  },
  semicolon: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.md,
    color: Theme.colors.textPrimary,
  },
  optionsContainer: {
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    paddingTop: Theme.spacing.sm,
  },
  comment: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.comment,
    marginBottom: Theme.spacing.xs,
  },
  buttonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.xs,
  },
  quickButton: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.sm,
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  quickButtonText: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.textPrimary,
  },
  customButton: {
    backgroundColor: Theme.colors.primary + '20',
    borderColor: Theme.colors.primary,
  },
  customButtonText: {
    color: Theme.colors.primary,
  },
  clearButton: {
    backgroundColor: Theme.colors.error + '20',
    borderColor: Theme.colors.error,
  },
  clearButtonText: {
    color: Theme.colors.error,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.xl,
    width: '80%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalTitle: {
    fontFamily: Theme.typography.fontFamily.monoSemiBold,
    fontSize: Theme.typography.fontSize.lg,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.md,
  },
  modalButton: {
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: Theme.spacing.xl,
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    marginTop: Theme.spacing.md,
  },
  modalButtonText: {
    fontFamily: Theme.typography.fontFamily.monoSemiBold,
    fontSize: Theme.typography.fontSize.md,
    color: Theme.colors.textPrimary,
  },
});
