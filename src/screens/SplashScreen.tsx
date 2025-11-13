// SplashScreen - Terminal Boot Sequence Animation

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Theme } from '../constants';

interface SplashScreenProps {
  onFinish: () => void;
}

const bootMessages = [
  '[ OK ] Starting TaskShell v1.0.0...',
  '[ OK ] Initializing task manager...',
  '[ OK ] Loading user configuration...',
  '[ OK ] Mounting task filesystem...',
  '[ OK ] Starting notification service...',
  '[ OK ] Checking for pending tasks...',
  '[ OK ] System ready.',
  '',
  'TaskShell initialized successfully.',
  'Welcome back, developer.',
];

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [visibleMessages, setVisibleMessages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const cursorBlink = useState(new Animated.Value(1))[0];

  // Cursor blink animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(cursorBlink, {
          toValue: 0,
          duration: 530,
          easing: Easing.step0,
          useNativeDriver: true,
        }),
        Animated.timing(cursorBlink, {
          toValue: 1,
          duration: 530,
          easing: Easing.step0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Boot sequence animation
  useEffect(() => {
    if (currentIndex < bootMessages.length) {
      const delay = currentIndex === 0 ? 500 : currentIndex < 6 ? 300 : 800;

      const timer = setTimeout(() => {
        setVisibleMessages((prev) => [...prev, bootMessages[currentIndex]]);
        setCurrentIndex((prev) => prev + 1);
      }, delay);

      return () => clearTimeout(timer);
    } else {
      // Fade out and finish
      const finishTimer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }).start(() => {
          setTimeout(onFinish, 200);
        });
      }, 1000);

      return () => clearTimeout(finishTimer);
    }
  }, [currentIndex]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 0],
            }),
          },
        ]}
      >
        {/* Boot logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>
            {'<'}
            <Text style={styles.logoCheck}>✓</Text>
            {'>'}
          </Text>
          <Text style={styles.logoText}>TaskShell</Text>
        </View>

        {/* Boot messages */}
        <View style={styles.messagesContainer}>
          {visibleMessages.map((message, index) => (
            <View key={index} style={styles.messageRow}>
              {message.startsWith('[ OK ]') ? (
                <>
                  <Text style={styles.messageStatus}>[ OK ]</Text>
                  <Text style={styles.messageText}>{message.slice(6)}</Text>
                </>
              ) : message === '' ? (
                <Text style={styles.messageText}> </Text>
              ) : (
                <Text style={styles.messageSuccess}>{message}</Text>
              )}
            </View>
          ))}

          {/* Blinking cursor */}
          {currentIndex < bootMessages.length && (
            <Animated.View style={[styles.cursor, { opacity: cursorBlink }]}>
              <Text style={styles.cursorText}>_</Text>
            </Animated.View>
          )}
        </View>

        {/* System info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>// Loading...</Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    paddingHorizontal: Theme.spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: Theme.spacing.xxl,
  },
  logo: {
    fontFamily: Theme.typography.fontFamily.monoBold,
    fontSize: 72,
    color: Theme.colors.success,
    textShadowColor: Theme.colors.success + '80',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  logoCheck: {
    color: Theme.colors.success,
  },
  logoText: {
    fontFamily: Theme.typography.fontFamily.monoSemiBold,
    fontSize: Theme.typography.fontSize.xl,
    color: Theme.colors.textPrimary,
    marginTop: Theme.spacing.sm,
    letterSpacing: 2,
  },
  messagesContainer: {
    minHeight: 300,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: Theme.spacing.xs,
    alignItems: 'center',
  },
  messageStatus: {
    fontFamily: Theme.typography.fontFamily.monoBold,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.success,
    marginRight: Theme.spacing.sm,
  },
  messageText: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.textSecondary,
    flex: 1,
  },
  messageSuccess: {
    fontFamily: Theme.typography.fontFamily.monoSemiBold,
    fontSize: Theme.typography.fontSize.md,
    color: Theme.colors.primary,
  },
  cursor: {
    marginTop: Theme.spacing.xs,
  },
  cursorText: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.md,
    color: Theme.colors.success,
  },
  footer: {
    marginTop: Theme.spacing.xxl,
    alignItems: 'center',
  },
  footerText: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.comment,
  },
});
