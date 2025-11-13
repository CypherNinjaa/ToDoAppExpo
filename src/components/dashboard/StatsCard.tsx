// StatsCard - Statistics display with code theme

import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Theme } from '../../constants';
import { useTaskStore, useStatsStore } from '../../stores';

export const StatsCard: React.FC = () => {
  const tasks = useTaskStore((state) => state.tasks);
  const streak = useStatsStore((state) => state.streak);

  // Memoize statistics calculations
  const stats = useMemo(() => {
    const totalCompleted = tasks.filter((t) => t.status === 'completed').length;
    const totalTasks = tasks.length;

    // Calculate today's progress
    const today = new Date();
    const todayTasks = tasks.filter((t) => {
      if (!t.dueDate) return false;
      const dueDate = new Date(t.dueDate);
      return (
        dueDate.getDate() === today.getDate() &&
        dueDate.getMonth() === today.getMonth() &&
        dueDate.getFullYear() === today.getFullYear()
      );
    });
    const todayCompleted = todayTasks.filter((t) => t.status === 'completed').length;
    const todayTotal = todayTasks.length;
    const todayProgress = todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : 0;

    return { totalCompleted, totalTasks, todayProgress, todayCompleted, todayTotal };
  }, [tasks]);

  // Memoize commit graph generation (expensive date operations)
  const commitGraph = useMemo(() => {
    const graph = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      const dayCompleted = tasks.filter((t) => {
        if (t.status !== 'completed' || !t.completedAt) return false;
        const completedDate = new Date(t.completedAt);
        return (
          completedDate.getDate() === date.getDate() &&
          completedDate.getMonth() === date.getMonth() &&
          completedDate.getFullYear() === date.getFullYear()
        );
      }).length;

      // Determine block intensity
      let block = '⬜';
      if (dayCompleted > 0 && dayCompleted <= 2) block = '🟩';
      else if (dayCompleted > 2 && dayCompleted <= 4) block = '🟦';
      else if (dayCompleted > 4) block = '🟪';

      graph.push(block);
    }
    return graph;
  }, [tasks]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.header}>const stats = {'{'}</Text>

      {/* Total completed */}
      <View style={styles.row}>
        <Text style={styles.key}> totalCompleted</Text>
        <Text style={styles.separator}>: </Text>
        <Text style={styles.numberValue}>{stats.totalCompleted}</Text>
        <Text style={styles.comment}>, // out of {stats.totalTasks}</Text>
      </View>

      {/* Current streak */}
      <View style={styles.row}>
        <Text style={styles.key}> currentStreak</Text>
        <Text style={styles.separator}>: </Text>
        <Text style={styles.numberValue}>{streak}</Text>
        <Text style={styles.comment}>, // days</Text>
      </View>

      {/* Today's progress */}
      <View style={styles.row}>
        <Text style={styles.key}> todayProgress</Text>
        <Text style={styles.separator}>: </Text>
        <Text style={styles.stringValue}>"{stats.todayProgress}%"</Text>
        <Text style={styles.comment}>
          , // {stats.todayCompleted}/{stats.todayTotal} tasks
        </Text>
      </View>

      {/* Commit graph */}
      <View style={styles.row}>
        <Text style={styles.key}> commitGraph</Text>
        <Text style={styles.separator}>: </Text>
        <Text style={styles.arrayBracket}>[</Text>
      </View>
      <View style={styles.graphRow}>
        <Text style={styles.indent}> </Text>
        {commitGraph.map((block, index) => (
          <Text key={index} style={styles.graphBlock}>
            {block}
          </Text>
        ))}
      </View>
      <View style={styles.row}>
        <Text style={styles.arrayBracket}> ]</Text>
        <Text style={styles.comment}> // last 7 days</Text>
      </View>

      {/* Footer */}
      <Text style={styles.footer}>{'}'}</Text>
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
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.md,
    color: Theme.colors.keyword,
    marginBottom: Theme.spacing.xs,
  },
  footer: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.md,
    color: Theme.colors.keyword,
    marginTop: Theme.spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  key: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.variable,
  },
  separator: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.textSecondary,
  },
  numberValue: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.number,
    fontWeight: '600',
  },
  stringValue: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.string,
  },
  arrayBracket: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.textPrimary,
  },
  comment: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.comment,
  },
  indent: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
  },
  graphRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Theme.spacing.xs,
  },
  graphBlock: {
    fontSize: 16,
    marginRight: 2,
  },
});
