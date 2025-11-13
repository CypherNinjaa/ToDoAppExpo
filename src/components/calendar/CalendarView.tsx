// CalendarView - Custom calendar with task markers

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Theme } from '../../constants';
import { useTaskStore } from '../../stores';

interface CalendarViewProps {
  onDayPress?: (date: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ onDayPress }) => {
  const tasks = useTaskStore((state) => state.tasks);
  const [selectedDate, setSelectedDate] = useState('');

  // Get marked dates with task indicators
  const getMarkedDates = () => {
    const marked: { [key: string]: any } = {};

    // Mark dates with tasks
    tasks.forEach((task) => {
      if (task.dueDate) {
        const dateStr = new Date(task.dueDate).toISOString().split('T')[0];
        if (!marked[dateStr]) {
          marked[dateStr] = { dots: [] };
        }

        // Add dot based on task status
        let dotColor = Theme.colors.textSecondary;
        if (task.status === 'completed') {
          dotColor = Theme.colors.success;
        } else if (task.status === 'in-progress') {
          dotColor = Theme.colors.warning;
        } else if (task.status === 'pending') {
          dotColor = Theme.colors.primary;
        }

        marked[dateStr].dots.push({ color: dotColor });
      }
    });

    // Mark selected date
    if (selectedDate) {
      marked[selectedDate] = {
        ...marked[selectedDate],
        selected: true,
        selectedColor: Theme.colors.primary + '40',
      };
    }

    return marked;
  };

  const handleDayPress = (day: any) => {
    setSelectedDate(day.dateString);
    onDayPress?.(day.dateString);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>$ cal -m</Text>
        <Text style={styles.subtitle}>// Task Calendar</Text>
      </View>

      {/* Calendar */}
      <Calendar
        onDayPress={handleDayPress}
        markingType="multi-dot"
        markedDates={getMarkedDates()}
        theme={{
          calendarBackground: Theme.colors.surface,
          textSectionTitleColor: Theme.colors.keyword,
          selectedDayBackgroundColor: Theme.colors.primary,
          selectedDayTextColor: Theme.colors.background,
          todayTextColor: Theme.colors.function,
          dayTextColor: Theme.colors.textPrimary,
          textDisabledColor: Theme.colors.textDisabled,
          monthTextColor: Theme.colors.keyword,
          textMonthFontFamily: Theme.typography.fontFamily.mono,
          textDayFontFamily: Theme.typography.fontFamily.mono,
          textMonthFontWeight: '600',
          textDayHeaderFontFamily: Theme.typography.fontFamily.mono,
          textDayHeaderFontWeight: '600',
          arrowColor: Theme.colors.primary,
          textMonthFontSize: Theme.typography.fontSize.lg,
          textDayFontSize: Theme.typography.fontSize.sm,
          textDayHeaderFontSize: Theme.typography.fontSize.xs,
        }}
        style={styles.calendar}
      />

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>// Status:</Text>
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: Theme.colors.primary }]} />
            <Text style={styles.legendText}>Pending</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: Theme.colors.warning }]} />
            <Text style={styles.legendText}>In Progress</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: Theme.colors.success }]} />
            <Text style={styles.legendText}>Completed</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    marginHorizontal: Theme.spacing.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  header: {
    marginBottom: Theme.spacing.md,
  },
  title: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.md,
    color: Theme.colors.keyword,
    fontWeight: '600',
  },
  subtitle: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.comment,
    marginTop: Theme.spacing.xs,
  },
  calendar: {
    borderRadius: Theme.borderRadius.md,
  },
  legend: {
    marginTop: Theme.spacing.md,
    paddingTop: Theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
  },
  legendTitle: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.comment,
    marginBottom: Theme.spacing.xs,
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Theme.spacing.xs,
  },
  legendText: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.textSecondary,
  },
});
