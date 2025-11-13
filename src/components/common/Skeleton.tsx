import React from 'react';
import { View, StyleSheet, DimensionValue } from 'react-native';
import { useThemeStore } from '../../stores/themeStore';

interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  marginBottom?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  marginBottom = 0,
}) => {
  const getThemeColors = useThemeStore((state) => state.getThemeColors);
  const currentTheme = getThemeColors();

  return (
    <View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          marginBottom,
          backgroundColor: currentTheme.border,
          opacity: 0.3,
        },
      ]}
    />
  );
};

export const TaskCardSkeleton: React.FC = () => {
  const getThemeColors = useThemeStore((state) => state.getThemeColors);
  const currentTheme = getThemeColors();

  return (
    <View
      style={[
        styles.taskCardContainer,
        {
          backgroundColor: currentTheme.surface,
          borderColor: currentTheme.border,
        },
      ]}
    >
      <View style={styles.taskCardHeader}>
        <Skeleton width={30} height={16} marginBottom={0} />
        <Skeleton width={120} height={16} marginBottom={0} />
      </View>
      <Skeleton width="80%" height={18} marginBottom={8} />
      <Skeleton width="60%" height={14} marginBottom={0} />
    </View>
  );
};

export const StatsCardSkeleton: React.FC = () => {
  const getThemeColors = useThemeStore((state) => state.getThemeColors);
  const currentTheme = getThemeColors();

  return (
    <View
      style={[
        styles.statsCardContainer,
        {
          backgroundColor: currentTheme.surface,
          borderColor: currentTheme.border,
        },
      ]}
    >
      <Skeleton width={60} height={14} marginBottom={8} />
      <Skeleton width={40} height={24} marginBottom={4} />
      <Skeleton width={80} height={12} marginBottom={0} />
    </View>
  );
};

export const ListSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => {
  return (
    <View style={styles.listContainer}>
      {Array.from({ length: count }).map((_, index) => (
        <TaskCardSkeleton key={index} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    overflow: 'hidden',
  },
  taskCardContainer: {
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderRadius: 4,
  },
  taskCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statsCardContainer: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 4,
    minHeight: 100,
  },
  listContainer: {
    padding: 8,
  },
});
