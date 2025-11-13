import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Theme, CommonStyles } from '../constants';

export const DashboardScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>user@devtodo:~$ ./today.sh</Text>
      <Text style={styles.subtitle}>Dashboard Screen</Text>
      <Text style={styles.mono}>// TODO: Implement dashboard features</Text>
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
