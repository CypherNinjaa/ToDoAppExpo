import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Keyboard,
} from 'react-native';
import { Theme } from '../constants';
import { TypingText } from '../components/common/TypingText';

interface WelcomeScreenProps {
  onComplete: (username: string) => void;
  showSplash?: boolean;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onComplete, showSplash = false }) => {
  const [username, setUsername] = useState('');
  const [showSetup, setShowSetup] = useState(false);
  const [setupStep, setSetupStep] = useState(0);
  const [splashComplete, setSplashComplete] = useState(!showSplash);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const cursorAnim = useRef(new Animated.Value(1)).current;
  const setupAnim = useRef(new Animated.Value(0)).current;
  const splashAnim = useRef(new Animated.Value(1)).current;
  const splashScaleAnim = useRef(new Animated.Value(1)).current;

  const setupSteps = [
    '> Initializing devtodo environment...',
    '> Loading configuration files...',
    '> Setting up task database...',
    '> Configuring terminal interface...',
    '> Installing syntax highlighting...',
    '> Ready to code! 🚀',
  ];

  useEffect(() => {
    if (showSplash) {
      // Show splash animation first
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(splashAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(splashScaleAnim, {
            toValue: 0.8,
            duration: 600,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setSplashComplete(true);
          // Then fade in welcome screen
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }).start();
        });
      }, 2000); // Show splash for 2 seconds
    } else {
      // Fade in animation directly
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }

    // Blinking cursor animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(cursorAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(cursorAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [showSplash]);

  useEffect(() => {
    if (showSetup) {
      const interval = setInterval(() => {
        setSetupStep((prev) => {
          if (prev < setupSteps.length - 1) {
            return prev + 1;
          } else {
            clearInterval(interval);
            setTimeout(() => {
              onComplete(username);
            }, 1000);
            return prev;
          }
        });
      }, 600);

      return () => clearInterval(interval);
    }
  }, [showSetup]);

  const handleSubmit = () => {
    if (username.trim().length >= 2) {
      Keyboard.dismiss();
      setShowSetup(true);
      Animated.timing(setupAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  };

  // Splash Screen
  if (!splashComplete) {
    return (
      <Animated.View
        style={[
          styles.container,
          {
            opacity: splashAnim,
            transform: [{ scale: splashScaleAnim }],
          },
        ]}
      >
        <View style={styles.splashContent}>
          <Text style={styles.splashAsciiArt}>
            {`    ___          ______         __    
   / _ \\___ _  _/_  __/__  ___/ /__ _
  / // / -_) |/ // / / _ \\/ _  / _ \`/
 /____/\\__/|___//_/  \\___/\\_,_/\\_,_/ 
                                      `}
          </Text>
          <Text style={styles.splashTitle}>DevTodo</Text>
          <Text style={styles.splashSubtitle}>// Developer's Task Manager</Text>

          <View style={styles.loadingContainer}>
            <Animated.Text style={[styles.loadingDot, { opacity: cursorAnim }]}>
              {'●'}
            </Animated.Text>
            <Animated.Text
              style={[
                styles.loadingDot,
                {
                  opacity: cursorAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 0],
                  }),
                },
              ]}
            >
              {'●'}
            </Animated.Text>
            <Animated.Text style={[styles.loadingDot, { opacity: cursorAnim }]}>
              {'●'}
            </Animated.Text>
          </View>
        </View>
      </Animated.View>
    );
  }

  if (showSetup) {
    return (
      <View style={styles.container}>
        <Animated.View style={[styles.setupContainer, { opacity: setupAnim }]}>
          <TypingText text="$ ./install.sh" speed={80} style={styles.setupTitle} />
          <View style={styles.setupSteps}>
            {setupSteps.map((step, index) => (
              <Animated.View
                key={index}
                style={{
                  opacity: index <= setupStep ? 1 : 0.3,
                }}
              >
                {index <= setupStep ? (
                  <Text
                    style={[
                      styles.setupStep,
                      {
                        color:
                          index < setupStep
                            ? Theme.colors.success
                            : index === setupStep
                              ? Theme.colors.primary
                              : Theme.colors.textSecondary,
                      },
                    ]}
                  >
                    {index < setupStep ? '✓ ' : '○ '}
                    {step}
                  </Text>
                ) : (
                  <Text style={[styles.setupStep, { color: Theme.colors.textSecondary }]}>
                    ○ {step}
                  </Text>
                )}
              </Animated.View>
            ))}
          </View>
        </Animated.View>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.content}>
        <Text style={styles.asciiArt}>
          {`    ___          ______         __    
   / _ \\___ _  _/_  __/__  ___/ /__ _
  / // / -_) |/ // / / _ \\/ _  / _ \`/
 /____/\\__/|___//_/  \\___/\\_,_/\\_,_/ 
                                      `}
        </Text>

        <Text style={styles.title}>{'> Welcome to DevTodo Terminal'}</Text>
        <Text style={styles.subtitle}>{'// A developer-themed task manager'}</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.prompt}>
            {'$ whoami'}
            <Animated.Text style={[styles.cursor, { opacity: cursorAnim }]}>▊</Animated.Text>
          </Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Enter your username"
            placeholderTextColor={Theme.colors.textDisabled}
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={20}
            onSubmitEditing={handleSubmit}
            returnKeyType="done"
          />
        </View>

        <TouchableOpacity
          style={[styles.button, username.trim().length < 2 && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={username.trim().length < 2}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>{'> Initialize Environment'}</Text>
        </TouchableOpacity>

        <Text style={styles.hint}>{'// Tip: Choose a cool developer alias'}</Text>
      </View>
    </Animated.View>
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
    width: '85%',
    maxWidth: 400,
  },
  asciiArt: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: 10,
    color: Theme.colors.primary,
    marginBottom: Theme.spacing.xl,
    lineHeight: 14,
  },
  title: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.xl,
    color: Theme.colors.keyword,
    marginBottom: Theme.spacing.sm,
  },
  subtitle: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.comment,
    marginBottom: Theme.spacing.xxl,
  },
  inputContainer: {
    marginBottom: Theme.spacing.xl,
  },
  prompt: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.md,
    color: Theme.colors.success,
    marginBottom: Theme.spacing.sm,
  },
  cursor: {
    color: Theme.colors.primary,
  },
  input: {
    backgroundColor: Theme.colors.inputBackground,
    borderWidth: 2,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.md,
    color: Theme.colors.textPrimary,
  },
  button: {
    backgroundColor: Theme.colors.buttonPrimary,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontFamily: Theme.typography.fontFamily.monoSemiBold,
    fontSize: Theme.typography.fontSize.md,
    color: Theme.colors.textPrimary,
  },
  hint: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.comment,
    textAlign: 'center',
  },
  setupContainer: {
    width: '85%',
    maxWidth: 400,
  },
  setupTitle: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.xl,
    color: Theme.colors.keyword,
    marginBottom: Theme.spacing.xl,
  },
  setupSteps: {
    gap: Theme.spacing.md,
  },
  setupStep: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.md,
    lineHeight: Theme.typography.fontSize.md * 1.5,
  },
  splashContent: {
    alignItems: 'center',
  },
  splashAsciiArt: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: 12,
    color: Theme.colors.primary,
    marginBottom: Theme.spacing.xl,
    lineHeight: 16,
  },
  splashTitle: {
    fontFamily: Theme.typography.fontFamily.monoBold,
    fontSize: 32,
    color: Theme.colors.keyword,
    marginBottom: Theme.spacing.sm,
    letterSpacing: 2,
  },
  splashSubtitle: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.md,
    color: Theme.colors.comment,
    marginBottom: Theme.spacing.xxl,
  },
  loadingContainer: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
    marginTop: Theme.spacing.xl,
  },
  loadingDot: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: 20,
    color: Theme.colors.primary,
  },
});
