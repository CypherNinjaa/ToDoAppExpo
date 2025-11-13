// Heatmap - GitHub-style contribution heatmap for task completion

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Theme } from '../../constants';
import { useTaskStore } from '../../stores';

interface HeatmapProps {
  onDayPress?: (date: string, count: number) => void;
}

export const Heatmap: React.FC<HeatmapProps> = ({ onDayPress }) => {
  const tasks = useTaskStore((state) => state.tasks);

  // Calculate task completion per day for last 12 weeks
  const generateHeatmapData = () => {
    const weeks = [];
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 11 * 7); // 12 weeks back
    startDate.setHours(0, 0, 0, 0);

    for (let week = 0; week < 12; week++) {
      const days = [];
      for (let day = 0; day < 7; day++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + week * 7 + day);

        // Count completed tasks on this date
        const dateStr = currentDate.toISOString().split('T')[0];
        const completedCount = tasks.filter((task) => {
          if (task.status !== 'completed' || !task.completedAt) return false;
          const completedDate = new Date(task.completedAt).toISOString().split('T')[0];
          return completedDate === dateStr;
        }).length;

        days.push({
          date: currentDate,
          dateStr,
          count: completedCount,
        });
      }
      weeks.push(days);
    }
    return weeks;
  };

  // Get color based on completion count
  const getHeatColor = (count: number) => {
    if (count === 0) return Theme.colors.surface;
    if (count <= 2) return Theme.colors.success + '40';
    if (count <= 4) return Theme.colors.success + '80';
    if (count <= 6) return Theme.colors.primary + '80';
    return Theme.colors.function + '80';
  };

  const heatmapData = generateHeatmapData();
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>$ git log --oneline --graph</Text>
        <Text style={styles.subtitle}>// Contribution Heatmap (Last 12 Weeks)</Text>
      </View>

      {/* Heatmap */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        <View style={styles.heatmapContainer}>
          {/* Day labels */}
          <View style={styles.dayLabels}>
            <Text style={styles.dayLabel}>Mon</Text>
            <Text style={styles.dayLabel}>Wed</Text>
            <Text style={styles.dayLabel}>Fri</Text>
          </View>

          {/* Weeks */}
          <View style={styles.weeksContainer}>
            {heatmapData.map((week, weekIndex) => (
              <View key={weekIndex} style={styles.week}>
                {week.map((day, dayIndex) => (
                  <TouchableOpacity
                    key={dayIndex}
                    style={[styles.day, { backgroundColor: getHeatColor(day.count) }]}
                    onPress={() => onDayPress?.(day.dateStr, day.count)}
                    activeOpacity={0.7}
                  />
                ))}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendLabel}>Less</Text>
        <View style={[styles.legendBox, { backgroundColor: Theme.colors.surface }]} />
        <View style={[styles.legendBox, { backgroundColor: Theme.colors.success + '40' }]} />
        <View style={[styles.legendBox, { backgroundColor: Theme.colors.success + '80' }]} />
        <View style={[styles.legendBox, { backgroundColor: Theme.colors.primary + '80' }]} />
        <View style={[styles.legendBox, { backgroundColor: Theme.colors.function + '80' }]} />
        <Text style={styles.legendLabel}>More</Text>
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
    marginTop: Theme.spacing.md,
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
  scrollView: {
    marginBottom: Theme.spacing.md,
  },
  heatmapContainer: {
    flexDirection: 'row',
  },
  dayLabels: {
    justifyContent: 'space-around',
    marginRight: Theme.spacing.xs,
    paddingTop: 2,
  },
  dayLabel: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: 8,
    color: Theme.colors.textSecondary,
    height: 12,
    lineHeight: 12,
  },
  weeksContainer: {
    flexDirection: 'row',
    gap: 3,
  },
  week: {
    gap: 3,
  },
  day: {
    width: 12,
    height: 12,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Theme.spacing.sm,
    gap: 4,
  },
  legendLabel: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.textSecondary,
  },
  legendBox: {
    width: 12,
    height: 12,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
});
