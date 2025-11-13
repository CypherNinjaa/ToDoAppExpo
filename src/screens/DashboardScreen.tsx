// DashboardScreen - Main dashboard with terminal aesthetics

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Modal } from 'react-native';
import { CommonStyles } from '../constants';
import {
  TerminalHeader,
  StatsCard,
  TodayTasks,
  InProgressTasks,
  QuickActions,
} from '../components/dashboard';
import { PomodoroTimer } from '../components/tasks';
import { TaskFormScreen } from './TaskFormScreen';
import { Task } from '../types';

interface DashboardScreenProps {
  username?: string;
  onNavigateToTasks?: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  username = 'user',
  onNavigateToTasks,
}) => {
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

  const handleTaskPress = (task: Task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleCloseTaskForm = () => {
    setShowTaskForm(false);
    setEditingTask(undefined);
  };

  const handleNewTask = () => {
    setEditingTask(undefined);
    setShowTaskForm(true);
  };

  return (
    <>
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Terminal Header */}
          <TerminalHeader />

          {/* Pomodoro Timer */}
          <PomodoroTimer />

          {/* Statistics Card */}
          <StatsCard />

          {/* Today's Tasks */}
          <TodayTasks onTaskPress={handleTaskPress} onAddTask={handleNewTask} />

          {/* In Progress Tasks */}
          <InProgressTasks onTaskPress={handleTaskPress} />

          {/* Quick Actions */}
          <QuickActions
            onNewTask={handleNewTask}
            onViewAll={onNavigateToTasks}
            onFilter={onNavigateToTasks}
          />
        </ScrollView>
      </View>

      {/* Task Form Modal */}
      <Modal
        visible={showTaskForm}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseTaskForm}
      >
        <TaskFormScreen taskId={editingTask?.id} onClose={handleCloseTaskForm} />
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    ...CommonStyles.container,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingBottom: 20,
  },
});
