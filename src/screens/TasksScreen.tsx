import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Theme, CommonStyles } from '../constants';

export const TasksScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>$ cat tasks.json</Text>
      <Text style={styles.subtitle}>Tasks Screen</Text>
      <Text style={styles.mono}>// TODO: Implement task list</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...CommonStyles.screenContainer,
  },
  title: {
    ...CommonStyles.h2,
    fontFamily: Theme.typography.fontFamily.mono,
    color: Theme.colors.keyword,
    marginBottom: Theme.spacing.md,
  },
  subtitle: {
    ...CommonStyles.textPrimary,
    marginBottom: Theme.spacing.lg,
  },
  mono: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.comment,
  },
});
