// TerminalHeader - Dashboard greeting with terminal aesthetics

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Theme } from '../../constants';
import { useTaskStore } from '../../stores';
import { BlinkingCursor } from '../common/BlinkingCursor';

interface TerminalHeaderProps {
  username?: string;
}

export const TerminalHeader: React.FC<TerminalHeaderProps> = ({ username = 'user' }) => {
  const tasks = useTaskStore((state) => state.tasks);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Memoize task statistics calculations
  const taskStats = useMemo(() => {
    const today = new Date();
    const pendingTasks = tasks.filter((t) => t.status === 'pending').length;
    const inProgressTasks = tasks.filter((t) => t.status === 'in-progress').length;
    const completedToday = tasks.filter((t) => {
      if (t.status !== 'completed' || !t.completedAt) return false;
      const completedDate = new Date(t.completedAt);
      return (
        completedDate.getDate() === today.getDate() &&
        completedDate.getMonth() === today.getMonth() &&
        completedDate.getFullYear() === today.getFullYear()
      );
    }).length;
    return { pendingTasks, inProgressTasks, completedToday };
  }, [tasks]);

  // Format date
  const formatDate = useCallback(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = [
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
    return `${days[currentTime.getDay()]} ${months[currentTime.getMonth()]} ${currentTime.getDate()}, ${currentTime.getFullYear()}`;
  }, [currentTime]);

  // Format time
  const formatTime = useCallback(() => {
    const hours = currentTime.getHours().toString().padStart(2, '0');
    const minutes = currentTime.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }, [currentTime]);

  return (
    <View style={styles.container}>
      {/* Terminal prompt */}
      <View style={styles.promptRow}>
        <Text style={styles.user}>{username}</Text>
        <Text style={styles.at}>@</Text>
        <Text style={styles.host}>devtodo</Text>
        <Text style={styles.separator}>:</Text>
        <Text style={styles.path}>~</Text>
        <Text style={styles.prompt}>$</Text>
        <Text style={styles.command}>./today.sh</Text>
        <BlinkingCursor style={styles.cursor} />
      </View>

      {/* Date and time */}
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>// </Text>
        <Text style={styles.infoText}>{formatDate()}</Text>
        <Text style={styles.separator}> • </Text>
        <Text style={styles.infoText}>{formatTime()}</Text>
      </View>

      {/* Git-style status */}
      <View style={styles.statusRow}>
        <Text style={styles.statusLabel}>git status</Text>
        <Text style={styles.separator}> → </Text>
        <View style={styles.statusItem}>
          <Text style={styles.statusDot}>⚪</Text>
          <Text style={styles.statusText}>{taskStats.pendingTasks} untracked</Text>
        </View>
        <View style={styles.statusItem}>
          <Text style={styles.statusDot}>🔴</Text>
          <Text style={styles.statusText}>{taskStats.inProgressTasks} modified</Text>
        </View>
        <View style={styles.statusItem}>
          <Text style={styles.statusDot}>🟢</Text>
          <Text style={styles.statusText}>{taskStats.completedToday} committed today</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Theme.colors.surface,
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  promptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  user: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.md,
    color: Theme.colors.success,
    fontWeight: '600',
  },
  at: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.md,
    color: Theme.colors.textSecondary,
  },
  host: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.md,
    color: Theme.colors.function,
    fontWeight: '600',
  },
  separator: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.md,
    color: Theme.colors.textSecondary,
  },
  path: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.md,
    color: Theme.colors.keyword,
    fontWeight: '600',
  },
  prompt: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.md,
    color: Theme.colors.primary,
    marginRight: Theme.spacing.xs,
  },
  command: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.md,
    color: Theme.colors.textPrimary,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  infoLabel: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.comment,
  },
  infoText: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.textSecondary,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  statusLabel: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.keyword,
    fontWeight: '600',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Theme.spacing.md,
  },
  statusDot: {
    fontSize: 8,
    marginRight: Theme.spacing.xs,
  },
  statusText: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.textSecondary,
  },
  cursor: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.md,
    color: Theme.colors.primary,
    marginLeft: Theme.spacing.xs,
  },
});
