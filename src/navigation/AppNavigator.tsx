import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { DashboardScreen, TasksScreen, CalendarScreen, SettingsScreen } from '../screens';
import { Theme } from '../constants';

type TabName = 'Dashboard' | 'Tasks' | 'Calendar' | 'Settings';

interface Tab {
  name: TabName;
  label: string;
  component: React.ComponentType;
}

const tabs: Tab[] = [
  { name: 'Dashboard', label: '~/dashboard', component: DashboardScreen },
  { name: 'Tasks', label: '~/tasks', component: TasksScreen },
  { name: 'Calendar', label: '~/calendar', component: CalendarScreen },
  { name: 'Settings', label: '~/settings', component: SettingsScreen },
];

export const AppNavigator = () => {
  const [activeTab, setActiveTab] = useState<TabName>('Dashboard');

  const ActiveScreen = tabs.find((tab) => tab.name === activeTab)?.component || DashboardScreen;

  return (
    <View style={styles.container}>
      {/* Screen Content */}
      <View style={styles.screenContainer}>
        <ActiveScreen />
      </View>

      {/* Custom Tab Bar */}
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.name;
          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.tabButton}
              onPress={() => setActiveTab(tab.name)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
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
    height: 68,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 4,
  },
  tabLabel: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: 10,
    color: Theme.colors.textSecondary,
  },
  tabLabelActive: {
    color: Theme.colors.primary,
  },
});
