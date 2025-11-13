import { useFonts } from 'expo-font';

export const useAppFonts = () => {
  const [fontsLoaded, fontError] = useFonts({
    // Fira Code fonts
    'FiraCode-Regular': require('../../assets/fonts/FiraCode-Regular.ttf'),
    'FiraCode-Medium': require('../../assets/fonts/FiraCode-Medium.ttf'),
    'FiraCode-SemiBold': require('../../assets/fonts/FiraCode-SemiBold.ttf'),
    'FiraCode-Bold': require('../../assets/fonts/FiraCode-Bold.ttf'),

    // JetBrains Mono fonts
    'JetBrainsMono-Regular': require('../../assets/fonts/JetBrainsMono-Regular.ttf'),
    'JetBrainsMono-Medium': require('../../assets/fonts/JetBrainsMono-Medium.ttf'),
    'JetBrainsMono-SemiBold': require('../../assets/fonts/JetBrainsMono-SemiBold.ttf'),
    'JetBrainsMono-Bold': require('../../assets/fonts/JetBrainsMono-Bold.ttf'),
  });

  return { fontsLoaded, fontError };
};
