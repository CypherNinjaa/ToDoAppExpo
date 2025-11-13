import { useCallback, useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useAppFonts } from './src/hooks/useAppFonts';
import { AppNavigator } from './src/navigation';
import { WelcomeScreen } from './src/screens';
import { StorageService } from './src/services/storage';
import { Theme } from './src/constants';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const { fontsLoaded, fontError } = useAppFonts();
  const [username, setUsername] = useState<string | null>(null);
  const [isCheckingUser, setIsCheckingUser] = useState(true);
  const [showApp, setShowApp] = useState(false);

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

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded && !isCheckingUser && showApp) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isCheckingUser, showApp]);

  const handleWelcomeComplete = async (newUsername: string) => {
    await StorageService.setUsername(newUsername);
    setUsername(newUsername);
  };

  if (!fontsLoaded || isCheckingUser || !showApp) {
    return null;
  }

  if (fontError) {
    console.error('Error loading fonts:', fontError);
  }

  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      {username ? (
        <AppNavigator username={username} />
      ) : (
        <WelcomeScreen onComplete={handleWelcomeComplete} showSplash={true} />
      )}
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
});
