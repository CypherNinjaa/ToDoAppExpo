import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import LottieView from 'lottie-react-native';
import {
  DashboardScreen,
  TasksScreen,
  CalendarScreen,
  SettingsScreen,
  FilesScreen,
} from '../screens';
import { Theme } from '../constants';

type TabName = 'Dashboard' | 'Tasks' | 'Files' | 'Calendar' | 'Settings';

interface Tab {
  name: TabName;
  label: string;
  icon: string;
  color: string;
  lottieSource?: any;
  component: React.ComponentType<{ username: string }>;
}

const tabs: Tab[] = [
  {
    name: 'Dashboard',
    label: '~/dash',
    icon: '▣',
    color: Theme.colors.keyword,
    lottieSource: require('../../assets/icons8-home.json'),
    component: DashboardScreen,
  },
  {
    name: 'Tasks',
    label: '~/tasks',
    icon: '☰',
    color: Theme.colors.string,
    lottieSource: require('../../assets/icons8-tasks.json'),
    component: TasksScreen,
  },
  {
    name: 'Files',
    label: '~/files',
    icon: '📁',
    color: Theme.colors.warning,
    lottieSource: require('../../assets/icons8-open-archive.json'),
    component: FilesScreen,
  },
  {
    name: 'Calendar',
    label: '~/cal',
    icon: '◷',
    color: Theme.colors.function,
    lottieSource: require('../../assets/icons8-calendar.json'),
    component: CalendarScreen,
  },
  {
    name: 'Settings',
    label: '~/set',
    icon: '⚙',
    color: Theme.colors.variable,
    lottieSource: require('../../assets/icons8-laptop-settings.json'),
    component: SettingsScreen,
  },
];

interface AppNavigatorProps {
  username: string;
}

// Tab button with animation
const TabButton: React.FC<{
  tab: Tab;
  isActive: boolean;
  onPress: () => void;
}> = ({ tab, isActive, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const iconScaleAnim = useRef(new Animated.Value(1)).current;
  const glowOpacityAnim = useRef(new Animated.Value(0)).current;
  const lottieRef = useRef<LottieView>(null);

  React.useEffect(() => {
    if (isActive) {
      // Play lottie animation if available
      if (tab.lottieSource && lottieRef.current) {
        lottieRef.current.play();
      }

      // Animate to active state
      Animated.parallel([
        Animated.sequence([
          Animated.spring(iconScaleAnim, {
            toValue: 1.3,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
          }),
          Animated.spring(iconScaleAnim, {
            toValue: 1,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
          }),
        ]),
        // Pulsing glow effect
        // Animated.loop(
        //   Animated.sequence([
        //     Animated.timing(glowOpacityAnim, {
        //       toValue: 0.8,
        //       duration: 1000,
        //       useNativeDriver: true,
        //     }),
        //     Animated.timing(glowOpacityAnim, {
        //       toValue: 0.3,
        //       duration: 1000,
        //       useNativeDriver: true,
        //     }),
        //   ])
        // ),
      ]).start();
    } else {
      // Stop animations
      glowOpacityAnim.stopAnimation();
      glowOpacityAnim.setValue(0);
      iconScaleAnim.setValue(1);
    }
  }, [isActive]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.85,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      style={styles.tabButton}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <Animated.View
        style={[
          styles.tabButtonInner,
          isActive && styles.tabButtonActive,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        {isActive && (
          <>
            <View style={[styles.activeIndicator, { backgroundColor: tab.color }]} />
            <Animated.View
              style={[
                styles.glowCircle,
                {
                  backgroundColor: tab.color,
                  opacity: glowOpacityAnim,
                },
              ]}
            />
          </>
        )}

        {tab.lottieSource ? (
          <Animated.View style={{ transform: [{ scale: iconScaleAnim }] }}>
            <LottieView
              ref={lottieRef}
              source={tab.lottieSource}
              style={styles.lottieIcon}
              loop={false}
              colorFilters={[
                {
                  keypath: '*',
                  color: isActive ? tab.color : Theme.colors.textSecondary,
                },
              ]}
            />
          </Animated.View>
        ) : (
          <Animated.Text
            style={[
              styles.tabIcon,
              {
                color: isActive ? tab.color : Theme.colors.textSecondary,
                transform: [{ scale: iconScaleAnim }],
              },
            ]}
          >
            {tab.icon}
          </Animated.Text>
        )}

        <Text
          style={[
            styles.tabLabel,
            {
              color: isActive ? tab.color : Theme.colors.textSecondary,
              fontFamily: isActive
                ? Theme.typography.fontFamily.monoSemiBold
                : Theme.typography.fontFamily.mono,
            },
          ]}
        >
          {tab.label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

export const AppNavigator: React.FC<AppNavigatorProps> = ({ username }) => {
  const [activeTab, setActiveTab] = useState<TabName>('Dashboard');
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const ActiveScreen = tabs.find((tab) => tab.name === activeTab)?.component || DashboardScreen;

  const handleTabChange = (tabName: TabName) => {
    if (tabName === activeTab) return;

    // Fade out and scale down
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setActiveTab(tabName);
      // Fade in and scale up
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  return (
    <View style={styles.container}>
      {/* Screen Content with Animation */}
      <Animated.View
        style={[
          styles.screenContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <ActiveScreen username={username} />
      </Animated.View>

      {/* Custom Tab Bar */}
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TabButton
            key={tab.name}
            tab={tab}
            isActive={activeTab === tab.name}
            onPress={() => handleTabChange(tab.name)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  screenContainer: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    paddingBottom: 10,
    paddingTop: 8,
    paddingHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 4,
  },
  tabButtonInner: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: Theme.borderRadius.md,
    position: 'relative',
    minHeight: 60,
  },
  tabButtonActive: {
    backgroundColor: Theme.colors.surfaceLight,
  },
  tabIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  lottieIcon: {
    width: 28,
    height: 28,
    marginBottom: 2,
  },
  tabIconActive: {
    color: Theme.colors.primary,
  },
  tabLabel: {
    fontSize: 11,
  },
  tabLabelActive: {
    fontFamily: Theme.typography.fontFamily.monoSemiBold,
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    left: '15%',
    right: '15%',
    height: 3,
    borderRadius: 2,
  },
  glowCircle: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    top: '25%',
  },
});
