// Heatmap - GitHub-style contribution heatmap with Snake animation

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Theme } from '../../constants';
import { useTaskStore } from '../../stores';

interface HeatmapProps {
  onDayPress?: (date: string, count: number) => void;
}

interface SnakeSegment {
  weekIndex: number;
  dayIndex: number;
}

interface EatenCell {
  weekIndex: number;
  dayIndex: number;
  timestamp: number;
}

export const Heatmap: React.FC<HeatmapProps> = ({ onDayPress }) => {
  const tasks = useTaskStore((state) => state.tasks);
  const [snakePositions, setSnakePositions] = useState<SnakeSegment[]>([]);
  const [direction, setDirection] = useState<'up' | 'down' | 'left' | 'right'>('right');

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

  // Snake animation logic - random movement
  useEffect(() => {
    // Initialize snake at random position
    if (snakePositions.length === 0) {
      const randomWeek = Math.floor(Math.random() * 12);
      const randomDay = Math.floor(Math.random() * 7);
      setSnakePositions([{ weekIndex: randomWeek, dayIndex: randomDay }]);
      return;
    }

    const interval = setInterval(() => {
      setSnakePositions((prevPositions) => {
        const head = prevPositions[0];

        // Try to move in current direction, or pick random direction
        const possibleMoves: Array<{
          weekIndex: number;
          dayIndex: number;
          dir: 'up' | 'down' | 'left' | 'right';
        }> = [];

        // Check all 4 directions
        if (head.weekIndex > 0)
          possibleMoves.push({
            weekIndex: head.weekIndex - 1,
            dayIndex: head.dayIndex,
            dir: 'left',
          });
        if (head.weekIndex < 11)
          possibleMoves.push({
            weekIndex: head.weekIndex + 1,
            dayIndex: head.dayIndex,
            dir: 'right',
          });
        if (head.dayIndex > 0)
          possibleMoves.push({ weekIndex: head.weekIndex, dayIndex: head.dayIndex - 1, dir: 'up' });
        if (head.dayIndex < 6)
          possibleMoves.push({
            weekIndex: head.weekIndex,
            dayIndex: head.dayIndex + 1,
            dir: 'down',
          });

        // Filter out positions already in snake body
        const validMoves = possibleMoves.filter(
          (move) =>
            !prevPositions.some(
              (pos) => pos.weekIndex === move.weekIndex && pos.dayIndex === move.dayIndex
            )
        );

        // If no valid moves, reset snake
        if (validMoves.length === 0) {
          const randomWeek = Math.floor(Math.random() * 12);
          const randomDay = Math.floor(Math.random() * 7);
          setSnakePositions([{ weekIndex: randomWeek, dayIndex: randomDay }]);
          return [{ weekIndex: randomWeek, dayIndex: randomDay }];
        }

        // Pick random valid move
        const nextMove = validMoves[Math.floor(Math.random() * validMoves.length)];
        setDirection(nextMove.dir);

        const newHead = { weekIndex: nextMove.weekIndex, dayIndex: nextMove.dayIndex };

        // Add new head and keep snake length
        const newSnake = [newHead, ...prevPositions];
        return newSnake.slice(0, 6); // Snake length of 6
      });
    }, 244);

    return () => clearInterval(interval);
  }, [snakePositions]);

  // Get snake segment index for size calculation
  const getSnakeSegmentIndex = (weekIndex: number, dayIndex: number): number => {
    return snakePositions.findIndex(
      (pos) => pos.weekIndex === weekIndex && pos.dayIndex === dayIndex
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>$ git log --oneline --graph</Text>
        <Text style={styles.subtitle}>// Snake eating commits 🐍 (Last 12 Weeks)</Text>
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
                {week.map((day, dayIndex) => {
                  const segmentIndex = getSnakeSegmentIndex(weekIndex, dayIndex);
                  const isSnake = segmentIndex !== -1;

                  let backgroundColor = getHeatColor(day.count);
                  let borderColor = Theme.colors.border;
                  let borderWidth = 1;
                  let size = 18; // default size
                  let borderRadius = 3;

                  if (isSnake) {
                    // Calculate size based on position in snake (head = largest)
                    const sizeRatio = 1 - (segmentIndex / snakePositions.length) * 0.6;
                    size = 18 * sizeRatio; // Head: 18px, gradually smaller to tail: ~7px
                    borderRadius = size / 6;

                    // Color gradient from head to tail
                    if (segmentIndex === 0) {
                      // Head - bright green
                      backgroundColor = '#00FF00';
                      borderColor = '#00DD00';
                      borderWidth = 2;
                    } else {
                      // Body - gradient to darker
                      const alpha = Math.floor(
                        (1 - segmentIndex / snakePositions.length) * 200 + 55
                      );
                      backgroundColor = `rgba(0, 255, 0, ${alpha / 255})`;
                      borderColor = '#00AA00';
                      borderWidth = 1.5;
                    }
                  }

                  return (
                    <View
                      key={dayIndex}
                      style={[
                        styles.cellContainer,
                        {
                          width: 18,
                          height: 18,
                          justifyContent: 'center',
                          alignItems: 'center',
                        },
                      ]}
                    >
                      <TouchableOpacity
                        style={[
                          styles.day,
                          {
                            width: size,
                            height: size,
                            backgroundColor,
                            borderColor,
                            borderWidth,
                            borderRadius,
                          },
                        ]}
                        onPress={() => onDayPress?.(day.dateStr, day.count)}
                        activeOpacity={0.7}
                      />
                    </View>
                  );
                })}
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
    fontSize: 10,
    color: Theme.colors.textSecondary,
    height: 18,
    lineHeight: 18,
  },
  weeksContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  week: {
    gap: 4,
  },
  cellContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  day: {
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Theme.spacing.sm,
    gap: 5,
  },
  legendLabel: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.textSecondary,
  },
  legendBox: {
    width: 18,
    height: 18,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
});
