import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Theme, CommonStyles } from '../constants';

export const SettingsScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>$ nano config.json</Text>
      <Text style={styles.subtitle}>Settings Screen</Text>
      <Text style={styles.mono}>// TODO: Implement settings</Text>
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
