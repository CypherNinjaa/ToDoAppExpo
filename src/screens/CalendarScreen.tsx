// CalendarScreen - Calendar views with task visualization

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Modal, TouchableOpacity, Text } from 'react-native';
import { CommonStyles, Theme } from '../constants';
import { CalendarView, Heatmap, DayView, WeekView } from '../components/calendar';
import { TaskFormScreen } from './TaskFormScreen';
import { Task } from '../types';

interface CalendarScreenProps {
  username?: string;
}

type ViewMode = 'calendar' | 'heatmap' | 'day' | 'week';

export const CalendarScreen: React.FC<CalendarScreenProps> = ({ username = 'user' }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [taskFormDate, setTaskFormDate] = useState<Date | undefined>(undefined);

  const handleDayPress = (date: string) => {
    setSelectedDate(date);
    setViewMode('day');
  };

  const handleTaskPress = (task: Task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleAddTaskForDate = (date: string) => {
    setTaskFormDate(new Date(date));
    setEditingTask(undefined);
    setShowTaskForm(true);
  };

  const handleCloseTaskForm = () => {
    setShowTaskForm(false);
    setEditingTask(undefined);
    setTaskFormDate(undefined);
  };

  return (
    <>
      <View style={styles.container}>
        {/* View mode selector */}
        <View style={styles.header}>
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tab, viewMode === 'calendar' && styles.tabActive]}
              onPress={() => setViewMode('calendar')}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, viewMode === 'calendar' && styles.tabTextActive]}>
                Calendar
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, viewMode === 'heatmap' && styles.tabActive]}
              onPress={() => setViewMode('heatmap')}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, viewMode === 'heatmap' && styles.tabTextActive]}>
                Heatmap
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, viewMode === 'week' && styles.tabActive]}
              onPress={() => setViewMode('week')}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, viewMode === 'week' && styles.tabTextActive]}>
                Week
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {viewMode === 'calendar' && <CalendarView onDayPress={handleDayPress} />}
          {viewMode === 'heatmap' && <Heatmap onDayPress={handleDayPress} />}
          {viewMode === 'week' && <WeekView onTaskPress={handleTaskPress} />}
          {viewMode === 'day' && selectedDate && (
            <DayView
              selectedDate={selectedDate}
              onTaskPress={handleTaskPress}
              onAddTask={handleAddTaskForDate}
            />
          )}
        </ScrollView>
      </View>

      {/* Task Form Modal */}
      <Modal
        visible={showTaskForm}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseTaskForm}
      >
        <TaskFormScreen
          taskId={editingTask?.id}
          initialDate={taskFormDate}
          onClose={handleCloseTaskForm}
        />
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    ...CommonStyles.container,
  },
  header: {
    paddingTop: 60,
    paddingBottom: Theme.spacing.sm,
    backgroundColor: Theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: Theme.spacing.lg,
    gap: Theme.spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: Theme.spacing.sm,
    alignItems: 'center',
    borderRadius: Theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  tabActive: {
    backgroundColor: Theme.colors.primary + '20',
    borderColor: Theme.colors.primary,
  },
  tabText: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.textSecondary,
  },
  tabTextActive: {
    color: Theme.colors.primary,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: Theme.spacing.md,
  },
});
