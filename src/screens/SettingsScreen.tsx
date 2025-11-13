import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Theme, CommonStyles } from '../constants';
import { StorageService } from '../services/storage';

interface SettingsScreenProps {
  username: string;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ username }) => {
  const [displayedText, setDisplayedText] = useState('');
  const fullText = '~$ ./configure.sh';

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

  const handleClearStorage = () => {
    Alert.alert(
      'Clear Storage',
      'This will reset the app and show the welcome screen again. Continue?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await StorageService.clearUsername();
            // Note: User will need to manually reload the app (R, R)
            Alert.alert(
              'Storage Cleared',
              'Please reload the app (press R, R) to see the welcome screen.'
            );
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {displayedText}
          <Text style={styles.cursor}>▊</Text>
        </Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.subtitle}>Settings Screen</Text>
        <Text style={styles.mono}>// TODO: Implement settings features</Text>

        <TouchableOpacity style={styles.dangerButton} onPress={handleClearStorage}>
          <Text style={styles.dangerButtonText}>$ rm -rf ~/.devtodo</Text>
          <Text style={styles.dangerButtonSubtext}>// Clear storage & reset app</Text>
        </TouchableOpacity>
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
  dangerButton: {
    backgroundColor: Theme.colors.error + '20',
    borderWidth: 2,
    borderColor: Theme.colors.error,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    marginTop: Theme.spacing.xxl,
  },
  dangerButtonText: {
    fontFamily: Theme.typography.fontFamily.monoSemiBold,
    fontSize: Theme.typography.fontSize.md,
    color: Theme.colors.error,
    marginBottom: Theme.spacing.xs,
  },
  dangerButtonSubtext: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.comment,
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
