// FocusTimeChart - Visual representation of focus time history

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useThemeStore } from '../../stores/themeStore';
import { Theme } from '../../constants';

interface DailyFocusData {
  date: string; // YYYY-MM-DD
  focusTime: number; // minutes
  pomodoros: number;
}

interface FocusTimeChartProps {
  data: DailyFocusData[];
  days?: number;
}

export const FocusTimeChart: React.FC<FocusTimeChartProps> = ({ data, days = 7 }) => {
  const getThemeColors = useThemeStore((state) => state.getThemeColors);
  const theme = getThemeColors();

  // Get max value for scaling
  const maxFocusTime = Math.max(...data.map((d) => d.focusTime), 1);
  const maxHeight = 120;

  // Format date for display
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
      return weekday;
    }
  };

  // Format time for tooltip
  const formatTime = (minutes: number): string => {
    if (minutes === 0) return '0m';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  // Get bar color based on intensity
  const getBarColor = (focusTime: number): string => {
    if (focusTime === 0) return theme.border;
    const intensity = focusTime / maxFocusTime;
    if (intensity >= 0.8) return theme.success;
    if (intensity >= 0.5) return theme.primary;
    if (intensity >= 0.3) return theme.warning;
    return theme.error + '60';
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.keyword }]}>{'// Focus Time History'}</Text>
        <Text style={[styles.subtitle, { color: theme.comment }]}>{`/* Last ${days} days */`}</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.chartContainer}>
          {/* Y-axis labels */}
          <View style={styles.yAxis}>
            <Text style={[styles.axisLabel, { color: theme.textSecondary }]}>
              {formatTime(maxFocusTime)}
            </Text>
            <View style={{ flex: 1 }} />
            <Text style={[styles.axisLabel, { color: theme.textSecondary }]}>0m</Text>
          </View>

          {/* Bars */}
          <View style={styles.barsContainer}>
            {data.map((day, index) => {
              const barHeight =
                day.focusTime > 0 ? Math.max((day.focusTime / maxFocusTime) * maxHeight, 4) : 4;
              const barColor = getBarColor(day.focusTime);

              return (
                <View key={day.date} style={styles.barWrapper}>
                  <View style={styles.barContainer}>
                    {/* Pomodoro count indicator */}
                    {day.pomodoros > 0 && (
                      <Text style={[styles.pomodoroCount, { color: theme.textSecondary }]}>
                        {day.pomodoros}🍅
                      </Text>
                    )}

                    {/* Bar */}
                    <View
                      style={[
                        styles.bar,
                        {
                          height: barHeight,
                          backgroundColor: barColor,
                          borderColor: barColor === theme.border ? theme.border : barColor,
                        },
                      ]}
                    >
                      {day.focusTime > 0 && (
                        <Text style={[styles.barLabel, { color: theme.background }]}>
                          {formatTime(day.focusTime)}
                        </Text>
                      )}
                    </View>
                  </View>

                  {/* X-axis label */}
                  <Text
                    style={[
                      styles.dateLabel,
                      { color: index === data.length - 1 ? theme.primary : theme.textSecondary },
                    ]}
                  >
                    {formatDate(day.date)}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Legend */}
      <View style={[styles.legend, { borderTopColor: theme.border }]}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.success }]} />
          <Text style={[styles.legendText, { color: theme.textSecondary }]}>High</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.primary }]} />
          <Text style={[styles.legendText, { color: theme.textSecondary }]}>Medium</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.warning }]} />
          <Text style={[styles.legendText, { color: theme.textSecondary }]}>Low</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.border }]} />
          <Text style={[styles.legendText, { color: theme.textSecondary }]}>None</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontFamily: Theme.typography.fontFamily.monoSemiBold,
    fontSize: Theme.typography.fontSize.md,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.xs,
  },
  scrollContent: {
    paddingRight: 16,
  },
  chartContainer: {
    flexDirection: 'row',
    height: 180,
  },
  yAxis: {
    width: 50,
    justifyContent: 'space-between',
    paddingRight: 8,
    paddingVertical: 20,
  },
  axisLabel: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.xs,
    textAlign: 'right',
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    flex: 1,
    gap: 8,
    paddingBottom: 20,
  },
  barWrapper: {
    alignItems: 'center',
    minWidth: 50,
  },
  barContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: 40,
  },
  pomodoroCount: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: 10,
    marginBottom: 4,
  },
  bar: {
    width: 40,
    borderRadius: 4,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  barLabel: {
    fontFamily: Theme.typography.fontFamily.monoBold,
    fontSize: 9,
    textAlign: 'center',
  },
  dateLabel: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.xs,
    marginTop: 8,
    textAlign: 'center',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    marginTop: 16,
    paddingTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  legendText: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.xs,
  },
});
