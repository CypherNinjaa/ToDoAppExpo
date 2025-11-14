import { useCallback, useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAppFonts } from './src/hooks/useAppFonts';
import { useInitializeApp } from './src/hooks/useInitializeApp';
import { AppNavigator } from './src/navigation';
import { WelcomeScreen, SplashScreen as BootSplashScreen } from './src/screens';
import { StorageService } from './src/services/storage';
import { notificationService } from './src/services/notificationService';
import { useThemeStore } from './src/stores/themeStore';
import { Theme } from './src/constants';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const { fontsLoaded, fontError } = useAppFonts();
  const { isInitialized, error: initError } = useInitializeApp();
  const { loadTheme } = useThemeStore();
  const [username, setUsername] = useState<string | null>(null);
  const [isCheckingUser, setIsCheckingUser] = useState(true);
  const [showApp, setShowApp] = useState(false);
  const [showBootSplash, setShowBootSplash] = useState(true);
  const notificationListener = useRef<Notifications.Subscription | undefined>(undefined);
  const responseListener = useRef<Notifications.Subscription | undefined>(undefined);

  useEffect(() => {
    const checkUsername = async () => {
      const savedUsername = await StorageService.getUsername();
      setUsername(savedUsername);
      setIsCheckingUser(false);

      // Show splash for first time users
      if (!savedUsername) {
        setTimeout(() => setShowApp(true), 100);
      } else {
        setShowApp(true);
      }
    };
    checkUsername();
  }, []);

  // Load theme on app start
  useEffect(() => {
    loadTheme();
  }, [loadTheme]);

  // Set up notification listeners
  useEffect(() => {
    // This listener is fired whenever a notification is received while the app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      console.log('📬 Notification received:', notification);
      // You can add custom handling here (e.g., update UI, show in-app notification)
    });

    // This listener is fired whenever a user taps on or interacts with a notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('👆 Notification tapped:', response);
      const data = response.notification.request.content.data;

      // Handle navigation based on notification data
      if (data.taskId) {
        console.log('Navigate to task:', data.taskId);
        // Navigation will be handled by the app's navigation system
        // This can be extended to navigate to specific screens
      }
      if (data.screen) {
        console.log('Navigate to screen:', data.screen);
      }
    });

    // Clean up listeners on unmount
    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded && !isCheckingUser && showApp && isInitialized && !showBootSplash) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isCheckingUser, showApp, isInitialized, showBootSplash]);

  const handleWelcomeComplete = async (newUsername: string) => {
    await StorageService.setUsername(newUsername);
    setUsername(newUsername);
  };

  const handleBootSplashFinish = () => {
    setShowBootSplash(false);
  };

  // Show boot splash on first load
  if (showBootSplash && fontsLoaded && !isCheckingUser && showApp && isInitialized) {
    return (
      <SafeAreaProvider>
        <GestureHandlerRootView style={styles.container}>
          <BootSplashScreen onFinish={handleBootSplashFinish} />
          <StatusBar style="light" />
        </GestureHandlerRootView>
      </SafeAreaProvider>
    );
  }

  // Show loading while initializing
  if (!fontsLoaded || isCheckingUser || !showApp || !isInitialized) {
    return null;
  }

  // Show error if initialization failed
  if (initError) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <Text style={styles.errorText}>Failed to initialize app</Text>
        <Text style={styles.errorSubtext}>{initError}</Text>
      </View>
    );
  }

  if (fontError) {
    console.error('Error loading fonts:', fontError);
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={styles.container}>
        <View style={styles.container} onLayout={onLayoutRootView}>
          {username ? (
            <AppNavigator username={username} />
          ) : (
            <WelcomeScreen onComplete={handleWelcomeComplete} showSplash={true} />
          )}
          <StatusBar style="light" />
        </View>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.xl,
  },
  errorText: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.lg,
    color: Theme.colors.error,
    marginBottom: Theme.spacing.sm,
  },
  errorSubtext: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
  },
});
