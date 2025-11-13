import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Theme, CommonStyles } from '../constants';

interface DashboardScreenProps {
  username: string;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ username }) => {
  const [displayedText, setDisplayedText] = useState('');
  const fullText = `${username}@devtodo:~$ ./today.sh`;

  useEffect(() => {
    let index = 0;
    setDisplayedText('');

    const interval = setInterval(() => {
      if (index < fullText.length) {
        setDisplayedText(fullText.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [fullText]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {displayedText}
          <Text style={styles.cursor}>▊</Text>
        </Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.subtitle}>Dashboard Screen</Text>
        <Text style={styles.mono}>// TODO: Implement dashboard features</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...CommonStyles.container,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: Theme.layout.screenPadding,
    paddingBottom: Theme.spacing.lg,
    backgroundColor: Theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  content: {
    flex: 1,
    padding: Theme.layout.screenPadding,
  },
  title: {
    ...CommonStyles.h2,
    fontFamily: Theme.typography.fontFamily.mono,
    color: Theme.colors.keyword,
  },
  cursor: {
    color: Theme.colors.primary,
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
