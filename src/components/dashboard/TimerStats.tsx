// TimerStats - Display Pomodoro Timer Statistics

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeStore } from '../../stores/themeStore';
import { Theme } from '../../constants';

interface TimerStatsProps {
  totalFocusTime: number; // in minutes
  totalPomodoros: number;
  dailyFocusTime: number;
  todayPomodoros: number;
  compact?: boolean;
}

export const TimerStats: React.FC<TimerStatsProps> = ({
  totalFocusTime,
  totalPomodoros,
  dailyFocusTime,
  todayPomodoros,
  compact = false,
}) => {
  const getThemeColors = useThemeStore((state) => state.getThemeColors);
  const theme = getThemeColors();

  const formatTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  if (compact) {
    return (
      <View style={[styles.compactContainer, { backgroundColor: theme.surface }]}>
        <Text style={[styles.compactLabel, { color: theme.comment }]}>{'// focus stats'}</Text>
        <View style={styles.compactRow}>
          <View style={styles.compactStat}>
            <Text style={[styles.compactValue, { color: theme.error }]}>{todayPomodoros}</Text>
            <Text style={[styles.compactUnit, { color: theme.textSecondary }]}>🍅</Text>
          </View>
          <View style={styles.compactStat}>
            <Text style={[styles.compactValue, { color: theme.primary }]}>
              {formatTime(dailyFocusTime)}
            </Text>
            <Text style={[styles.compactUnit, { color: theme.textSecondary }]}>today</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Text style={[styles.header, { color: theme.keyword }]}>{'// Pomodoro Statistics'}</Text>

      <View style={styles.grid}>
        {/* Total Pomodoros */}
        <View
          style={[
            styles.statCard,
            { backgroundColor: theme.background, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.statLabel, { color: theme.comment }]}>
            {'const totalPomodoros ='}
          </Text>
          <View style={styles.statValueRow}>
            <Text style={[styles.statValue, { color: theme.number }]}>{totalPomodoros}</Text>
            <Text style={[styles.statEmoji, { color: theme.textSecondary }]}>🍅</Text>
          </View>
          <Text style={[styles.statSubtext, { color: theme.textSecondary }]}>{'// all time'}</Text>
        </View>

        {/* Today's Pomodoros */}
        <View
          style={[
            styles.statCard,
            { backgroundColor: theme.background, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.statLabel, { color: theme.comment }]}>
            {'const todayPomodoros ='}
          </Text>
          <View style={styles.statValueRow}>
            <Text style={[styles.statValue, { color: theme.error }]}>{todayPomodoros}</Text>
            <Text style={[styles.statEmoji, { color: theme.textSecondary }]}>🍅</Text>
          </View>
          <Text style={[styles.statSubtext, { color: theme.textSecondary }]}>{'// today'}</Text>
        </View>

        {/* Total Focus Time */}
        <View
          style={[
            styles.statCard,
            { backgroundColor: theme.background, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.statLabel, { color: theme.comment }]}>
            {'const totalFocusTime ='}
          </Text>
          <Text style={[styles.statValue, { color: theme.string }]}>
            {`"${formatTime(totalFocusTime)}"`}
          </Text>
          <Text style={[styles.statSubtext, { color: theme.textSecondary }]}>{'// all time'}</Text>
        </View>

        {/* Daily Focus Time */}
        <View
          style={[
            styles.statCard,
            { backgroundColor: theme.background, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.statLabel, { color: theme.comment }]}>
            {'const dailyFocusTime ='}
          </Text>
          <Text style={[styles.statValue, { color: theme.primary }]}>
            {`"${formatTime(dailyFocusTime)}"`}
          </Text>
          <Text style={[styles.statSubtext, { color: theme.textSecondary }]}>{'// today'}</Text>
        </View>
      </View>

      {/* Focus Time Breakdown */}
      {totalFocusTime > 0 && (
        <View style={[styles.breakdown, { borderTopColor: theme.border }]}>
          <Text style={[styles.breakdownLabel, { color: theme.comment }]}>
            {'// avg session: '}
            <Text style={{ color: theme.textPrimary }}>
              {totalPomodoros > 0 ? `${Math.round(totalFocusTime / totalPomodoros)} min` : '0 min'}
            </Text>
          </Text>
        </View>
      )}
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
  compactContainer: {
    borderRadius: 6,
    padding: 12,
  },
  header: {
    fontFamily: Theme.typography.fontFamily.monoSemiBold,
    fontSize: Theme.typography.fontSize.md,
    marginBottom: 16,
  },
  compactLabel: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.xs,
    marginBottom: 8,
  },
  compactRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  compactStat: {
    alignItems: 'center',
  },
  compactValue: {
    fontFamily: Theme.typography.fontFamily.monoBold,
    fontSize: 24,
  },
  compactUnit: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.xs,
    marginTop: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
  },
  statLabel: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.xs,
    marginBottom: 8,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontFamily: Theme.typography.fontFamily.monoBold,
    fontSize: 28,
  },
  statEmoji: {
    fontSize: 20,
  },
  statSubtext: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.xs,
    marginTop: 4,
  },
  breakdown: {
    borderTopWidth: 1,
    marginTop: 16,
    paddingTop: 12,
  },
  breakdownLabel: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
  },
});
