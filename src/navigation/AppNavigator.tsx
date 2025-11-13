import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { DashboardScreen, TasksScreen, CalendarScreen, SettingsScreen } from '../screens';
import { Theme } from '../constants';
import { Platform } from 'react-native';

const Tab = createBottomTabNavigator();

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: Theme.colors.surface,
            borderTopWidth: 1,
            borderTopColor: Theme.colors.border,
            height: Platform.OS === 'ios' ? 88 : 68,
            paddingBottom: Platform.OS === 'ios' ? 24 : 8,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontFamily: Theme.typography.fontFamily.mono,
            fontSize: Theme.typography.fontSize.xs,
            color: Theme.colors.textPrimary,
          },
          tabBarItemStyle: {
            paddingVertical: 4,
          },
        }}
      >
        <Tab.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{
            tabBarLabel: '~/dashboard',
          }}
        />
        <Tab.Screen
          name="Tasks"
          component={TasksScreen}
          options={{
            tabBarLabel: '~/tasks',
          }}
        />
        <Tab.Screen
          name="Calendar"
          component={CalendarScreen}
          options={{
            tabBarLabel: '~/calendar',
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            tabBarLabel: '~/settings',
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};
