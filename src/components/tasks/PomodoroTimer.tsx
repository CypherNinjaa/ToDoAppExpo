import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
  ScrollView,
  Animated,
  FlatList,
  AppState,
  AppStateStatus,
} from 'react-native';
import { useTimerStore } from '../../stores/timerStore';
import { useThemeStore } from '../../stores/themeStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useTaskStore } from '../../stores/taskStore';
import { TimerSettings } from '../inputs/TimerSettings';
import { notificationService } from '../../services/notificationService';

const { width } = Dimensions.get('window');

interface PomodoroTimerProps {
  compact?: boolean;
  initialTaskId?: string;
}

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ compact = false, initialTaskId }) => {
  const currentTheme = useThemeStore((state) => state.currentTheme);
  const getThemeColors = useThemeStore((state) => state.getThemeColors);
  const theme = getThemeColors();

  const settings = useSettingsStore((state) => state.settings);
  const updateSettings = useSettingsStore((state) => state.updateSettings);

  const [showSettings, setShowSettings] = useState(false);
  const [showTaskPicker, setShowTaskPicker] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editMinutes, setEditMinutes] = useState(25);
  const [editSeconds, setEditSeconds] = useState(0);
  const [glitchText, setGlitchText] = useState('');

  const minutesScrollRef = useRef<ScrollView>(null);
  const secondsScrollRef = useRef<ScrollView>(null);
  const glitchOpacity = useRef(new Animated.Value(0)).current;
  const glitchTranslateX = useRef(new Animated.Value(0)).current;

  const tasks = useTaskStore((state) => state.tasks);
  const updateTask = useTaskStore((state) => state.updateTask);

  const {
    type,
    status,
    remainingTime,
    totalTime,
    completedPomodoros,
    currentTaskId,
    startTimer,
    pauseTimer,
    stopTimer,
    tick,
    switchToBreak,
    switchToFocus,
    initializeFromSettings,
    setFocusDuration,
    setBreakDuration,
    linkTask,
    unlinkTask,
    setOnTimerComplete,
  } = useTimerStore();

  const linkedTask = tasks.find((t) => t.id === currentTaskId);

  // Auto-link task on mount if initialTaskId provided
  useEffect(() => {
    if (initialTaskId && !currentTaskId) {
      linkTask(initialTaskId);
    }
  }, [initialTaskId, currentTaskId, linkTask]);

  // Setup timer completion handler
  useEffect(() => {
    setOnTimerComplete(async () => {
      // Dismiss status bar timer notification
      await notificationService.stopTimerNotification();

      // Send notification (safe for Expo Go)
      try {
        const notificationBody = linkedTask
          ? `Great work on "${linkedTask.title}"! Time for a break.`
          : 'Focus session completed! Take a break.';

        await notificationService.sendImmediateNotification(
          '🎯 Pomodoro Complete!',
          notificationBody,
          { type: 'pomodoro-complete', taskId: currentTaskId },
          'task-reminders'
        );
      } catch (error) {
        console.log('Notification not sent (may be running in Expo Go):', error);
      }

      // Update task stats
      if (currentTaskId && linkedTask) {
        const focusDurationMinutes = Math.floor(totalTime / 60);
        await updateTask(currentTaskId, {
          pomodoroCount: (linkedTask.pomodoroCount || 0) + 1,
          totalFocusTime: (linkedTask.totalFocusTime || 0) + focusDurationMinutes,
          actualTime: (linkedTask.actualTime || 0) + focusDurationMinutes,
        });
      }
    });

    return () => setOnTimerComplete(undefined);
  }, [currentTaskId, linkedTask, totalTime, setOnTimerComplete, updateTask]);

  // Initialize timer from settings on mount
  useEffect(() => {
    initializeFromSettings(settings.focusDuration, settings.breakDuration);
  }, [settings.focusDuration, settings.breakDuration, initializeFromSettings]);

  // Countdown interval effect with AppState handling
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    let notificationUpdateInterval: NodeJS.Timeout | null = null;
    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    if (status === 'running') {
      interval = setInterval(() => {
        tick();
      }, 1000);

      // Start status bar timer notification once
      notificationService.startTimerNotification(remainingTime, type, linkedTask?.title);

      // Update notification every 5 seconds (much more efficient)
      notificationUpdateInterval = setInterval(() => {
        const state = useTimerStore.getState();
        notificationService.updateTimerNotification(
          state.remainingTime,
          state.type,
          linkedTask?.title
        );
      }, 5000);
    } else {
      // Stop status bar notification when timer stops
      notificationService.stopTimerNotification();
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
      if (notificationUpdateInterval) {
        clearInterval(notificationUpdateInterval);
      }
      appStateSubscription.remove();
    };
  }, [status, tick, type, linkedTask]);

  // Handle app going to background/foreground
  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active' && status === 'running') {
      // App came back to foreground - calculate elapsed time
      const state = useTimerStore.getState();
      const now = Date.now();
      const startTimestamp = state.startTimestamp;

      if (startTimestamp) {
        const elapsedSeconds = Math.floor((now - startTimestamp) / 1000);
        const expectedRemainingTime = state.totalTime - elapsedSeconds;

        if (expectedRemainingTime <= 0) {
          // Timer completed while in background
          // Set remaining time to 0 and let tick() handle completion
          useTimerStore.setState({ remainingTime: 0, startTimestamp: Date.now() });
          tick();
        } else {
          // Update remaining time based on elapsed time and reset startTimestamp
          useTimerStore.setState({
            remainingTime: expectedRemainingTime,
            startTimestamp: Date.now(), // Reset timestamp for future background calculations
          });
        }
      }
    }
  }; // Glitch effect
  useEffect(() => {
    if (status === 'running') {
      const glitchInterval = setInterval(() => {
        triggerGlitch();
      }, 2000); // Glitch every 2 seconds

      return () => clearInterval(glitchInterval);
    }
  }, [status]);

  const triggerGlitch = () => {
    const glitchChars = '!@#$%^&*(){}[]|\\<>?/~`';
    const timeString = formatTime(remainingTime);
    const glitched = timeString
      .split('')
      .map((char) =>
        Math.random() > 0.6 ? glitchChars[Math.floor(Math.random() * glitchChars.length)] : char
      )
      .join('');

    setGlitchText(glitched);

    // Animate glitch
    Animated.sequence([
      Animated.parallel([
        Animated.timing(glitchOpacity, {
          toValue: 1,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(glitchTranslateX, {
          toValue: Math.random() > 0.5 ? 3 : -3,
          duration: 50,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(glitchOpacity, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(glitchTranslateX, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const progress = totalTime > 0 ? ((totalTime - remainingTime) / totalTime) * 100 : 0;

  const handleStartPause = () => {
    if (status === 'running') {
      pauseTimer();
      notificationService.stopTimerNotification();
    } else {
      startTimer();
    }
  };

  const handleStop = () => {
    stopTimer();
    notificationService.stopTimerNotification();
  };

  const handleSwitchMode = () => {
    if (type === 'focus') {
      switchToBreak();
    } else {
      switchToFocus();
    }
  };

  const handleEditClick = () => {
    if (status === 'running') return; // Don't allow editing while timer is running

    if (isEditing) {
      // Save mode
      handleSaveTime();
    } else {
      // Edit mode - Initialize with current time
      const mins = Math.floor(remainingTime / 60);
      const secs = remainingTime % 60;
      setEditMinutes(mins);
      setEditSeconds(secs);
      setIsEditing(true);

      // Scroll to current values after a short delay
      setTimeout(() => {
        minutesScrollRef.current?.scrollTo({ y: mins * 50, animated: true });
        secondsScrollRef.current?.scrollTo({ y: secs * 50, animated: true });
      }, 100);
    }
  };

  const handleSaveTime = async () => {
    const newDuration = editMinutes * 60 + editSeconds;

    if (type === 'focus') {
      await updateSettings({ focusDuration: newDuration });
      setFocusDuration(newDuration);
    } else {
      await updateSettings({ breakDuration: newDuration });
      setBreakDuration(newDuration);
    }

    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const renderNumberPicker = (
    value: number,
    setValue: (val: number) => void,
    max: number,
    scrollRef: React.RefObject<ScrollView | null>,
    label: string
  ) => {
    const numbers = Array.from({ length: max + 1 }, (_, i) => i);

    return (
      <View style={styles.pickerContainer}>
        <ScrollView
          ref={scrollRef}
          style={styles.numberPicker}
          contentContainerStyle={styles.numberPickerContent}
          showsVerticalScrollIndicator={false}
          snapToInterval={50}
          decelerationRate="fast"
          nestedScrollEnabled={true}
          scrollEventThrottle={16}
          onMomentumScrollEnd={(event) => {
            const yOffset = event.nativeEvent.contentOffset.y;
            const index = Math.round(yOffset / 50);
            setValue(Math.min(Math.max(0, index), max));
          }}
        >
          {numbers.map((num) => (
            <TouchableOpacity
              key={num}
              style={styles.numberItem}
              onPress={() => {
                setValue(num);
                scrollRef.current?.scrollTo({ y: num * 50, animated: true });
              }}
            >
              <Text
                style={[
                  styles.numberText,
                  {
                    color: num === value ? theme.primary : theme.textSecondary,
                    fontSize: num === value ? 48 : 32,
                  },
                ]}
              >
                {num.toString().padStart(2, '0')}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <Text style={[styles.pickerLabel, { color: theme.comment }]}>{label}</Text>
      </View>
    );
  };

  return (
    <>
      <View
        style={[
          compact ? styles.compactContainer : styles.container,
          { backgroundColor: theme.background, borderColor: theme.border },
        ]}
      >
        {/* Debug mode header */}
        {!compact && (
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <Text style={[styles.headerText, { color: theme.textPrimary }]}>
              {`// DEBUG MODE: Pomodoro Timer`}
            </Text>
            <View style={styles.headerRight}>
              <Text style={[styles.sessionInfo, { color: theme.textSecondary }]}>
                {`/* Sessions: ${completedPomodoros} */`}
              </Text>
              <TouchableOpacity
                style={[styles.settingsButton, { borderColor: theme.border }]}
                onPress={() => setShowSettings(true)}
              >
                <Text style={[styles.settingsIcon, { color: theme.textSecondary }]}>⚙</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Timer mode indicator */}
        {!compact && (
          <View style={styles.modeContainer}>
            <Text
              style={[styles.modeText, { color: type === 'focus' ? theme.error : theme.success }]}
            >
              {type === 'focus' ? '>> FOCUS_MODE' : '>> BREAK_MODE'}
            </Text>
          </View>
        )}

        {/* Linked Task Display */}
        {!compact && (
          <TouchableOpacity
            style={[styles.linkedTaskContainer, { borderColor: theme.border }]}
            onPress={() => setShowTaskPicker(true)}
            disabled={status === 'running'}
          >
            {linkedTask ? (
              <View style={styles.linkedTaskContent}>
                <Text style={[styles.linkedTaskLabel, { color: theme.comment }]}>
                  {'// linked task:'}
                </Text>
                <Text style={[styles.linkedTaskTitle, { color: theme.string }]} numberOfLines={1}>
                  {`"${linkedTask.title}"`}
                </Text>
                {linkedTask.pomodoroCount && linkedTask.pomodoroCount > 0 && (
                  <Text style={[styles.pomodoroCount, { color: theme.number }]}>
                    {`🍅 ${linkedTask.pomodoroCount}`}
                  </Text>
                )}
              </View>
            ) : (
              <Text style={[styles.linkedTaskPlaceholder, { color: theme.textSecondary }]}>
                {'$ link-task --select'}
              </Text>
            )}
          </TouchableOpacity>
        )}

        {/* Timer display or Edit mode */}
        {isEditing ? (
          <View style={styles.editContainer}>
            <View style={styles.pickersRow}>
              {renderNumberPicker(editMinutes, setEditMinutes, 99, minutesScrollRef, 'min')}
              <Text style={[styles.colonText, { color: theme.primary }]}>:</Text>
              {renderNumberPicker(editSeconds, setEditSeconds, 59, secondsScrollRef, 'sec')}
            </View>
            <View style={styles.editButtonsRow}>
              <TouchableOpacity
                style={[styles.editActionButton, { borderColor: theme.success }]}
                onPress={handleSaveTime}
              >
                <Text style={[styles.editActionText, { color: theme.success }]}>$ save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.editActionButton, { borderColor: theme.error }]}
                onPress={handleCancelEdit}
              >
                <Text style={[styles.editActionText, { color: theme.error }]}>$ cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.timerDisplay}
            onPress={handleEditClick}
            disabled={status === 'running'}
          >
            <View style={styles.glitchContainer}>
              <Text style={[styles.timeText, { color: theme.primary }]}>
                {formatTime(remainingTime)}
              </Text>
              <Animated.Text
                style={[
                  styles.timeText,
                  styles.glitchText,
                  {
                    color: theme.error,
                    opacity: glitchOpacity,
                    transform: [{ translateX: glitchTranslateX }],
                  },
                ]}
              >
                {glitchText}
              </Animated.Text>
              <Animated.Text
                style={[
                  styles.timeText,
                  styles.glitchText,
                  {
                    color: theme.success,
                    opacity: glitchOpacity,
                    transform: [{ translateX: glitchTranslateX }],
                  },
                ]}
              >
                {glitchText}
              </Animated.Text>
            </View>
            <Text style={[styles.statusText, { color: theme.textSecondary }]}>
              {status === 'running' ? `status: "${status}"` : `tap to edit • status: "${status}"`}
            </Text>
          </TouchableOpacity>
        )}

        {/* Progress bar */}
        {!compact && (
          <>
            <View style={[styles.progressBarContainer, { backgroundColor: theme.border }]}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${progress}%`,
                    backgroundColor: type === 'focus' ? theme.error : theme.success,
                  },
                ]}
              />
            </View>
            <Text style={[styles.progressText, { color: theme.textSecondary }]}>
              {`progress: ${progress.toFixed(1)}%`}
            </Text>
          </>
        )}

        {/* Control buttons */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={[
              styles.controlButton,
              { backgroundColor: theme.background, borderColor: theme.primary },
            ]}
            onPress={handleStartPause}
          >
            <Text style={[styles.controlButtonText, { color: theme.primary }]}>
              {status === 'running' ? '$ pause' : '$ start'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.controlButton,
              { backgroundColor: theme.background, borderColor: theme.error },
            ]}
            onPress={handleStop}
            disabled={status === 'idle'}
          >
            <Text
              style={[
                styles.controlButtonText,
                { color: status === 'idle' ? theme.textSecondary : theme.error },
              ]}
            >
              {'$ stop'}
            </Text>
          </TouchableOpacity>

          {!compact && (
            <TouchableOpacity
              style={[
                styles.controlButton,
                { backgroundColor: theme.background, borderColor: theme.warning },
              ]}
              onPress={handleSwitchMode}
              disabled={status === 'running'}
            >
              <Text
                style={[
                  styles.controlButtonText,
                  { color: status === 'running' ? theme.textSecondary : theme.warning },
                ]}
              >
                {type === 'focus' ? '$ break' : '$ focus'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Debug footer */}
        {!compact && (
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.textSecondary }]}>
              {`// totalTime: ${totalTime}s | remaining: ${remainingTime}s`}
            </Text>
          </View>
        )}
      </View>

      {/* Timer Settings Modal */}
      {!compact && (
        <Modal
          visible={showSettings}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowSettings(false)}
        >
          <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <Text style={[styles.modalTitle, { color: theme.primary }]}>
                {'$ ./timer-config.sh'}
              </Text>
              <TouchableOpacity
                style={[styles.closeButton, { borderColor: theme.border }]}
                onPress={() => setShowSettings(false)}
              >
                <Text style={[styles.closeButtonText, { color: theme.textPrimary }]}>✕</Text>
              </TouchableOpacity>
            </View>
            <TimerSettings />
          </View>
        </Modal>
      )}

      {/* Task Picker Modal */}
      {!compact && (
        <Modal
          visible={showTaskPicker}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowTaskPicker(false)}
        >
          <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <Text style={[styles.modalTitle, { color: theme.primary }]}>
                {'$ select-task --link-to-timer'}
              </Text>
              <TouchableOpacity
                style={[styles.closeButton, { borderColor: theme.border }]}
                onPress={() => setShowTaskPicker(false)}
              >
                <Text style={[styles.closeButtonText, { color: theme.textPrimary }]}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={tasks.filter((t) => t.status !== 'completed' && t.status !== 'archived')}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.taskPickerItem,
                    {
                      backgroundColor: item.id === currentTaskId ? theme.surface : 'transparent',
                      borderColor: theme.border,
                    },
                  ]}
                  onPress={() => {
                    if (item.id === currentTaskId) {
                      unlinkTask();
                    } else {
                      linkTask(item.id);
                    }
                    setShowTaskPicker(false);
                  }}
                >
                  <View style={styles.taskPickerContent}>
                    <Text style={[styles.taskPickerTitle, { color: theme.textPrimary }]}>
                      {item.title}
                    </Text>
                    <View style={styles.taskPickerMeta}>
                      <Text
                        style={[
                          styles.taskPickerCategory,
                          { color: theme[item.category] || theme.primary },
                        ]}
                      >
                        {item.category}
                      </Text>
                      {item.pomodoroCount && item.pomodoroCount > 0 && (
                        <Text style={[styles.taskPickerPomodoro, { color: theme.textSecondary }]}>
                          {`🍅 ${item.pomodoroCount}`}
                        </Text>
                      )}
                    </View>
                  </View>
                  {item.id === currentTaskId && (
                    <Text style={[styles.linkedBadge, { color: theme.success }]}>✓ linked</Text>
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={[styles.emptyText, { color: theme.comment }]}>
                  {'// No active tasks found'}
                </Text>
              }
            />
          </View>
        </Modal>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
  },
  compactContainer: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
    borderStyle: 'dashed',
  },
  header: {
    borderBottomWidth: 1,
    paddingBottom: 8,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    fontFamily: 'FiraCode-Regular',
    fontSize: 14,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sessionInfo: {
    fontFamily: 'FiraCode-Regular',
    fontSize: 12,
  },
  settingsButton: {
    width: 28,
    height: 28,
    borderRadius: 4,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  settingsIcon: {
    fontSize: 16,
  },
  modeContainer: {
    marginBottom: 16,
  },
  modeText: {
    fontFamily: 'FiraCode-Bold',
    fontSize: 16,
    textAlign: 'center',
  },
  timerDisplay: {
    alignItems: 'center',
    marginBottom: 16,
  },
  glitchContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    fontFamily: 'FiraCode-Bold',
    fontSize: 56,
    letterSpacing: 4,
  },
  glitchText: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  statusText: {
    fontFamily: 'FiraCode-Regular',
    fontSize: 14,
    marginTop: 4,
  },
  editContainer: {
    marginBottom: 16,
  },
  pickersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 180,
    marginBottom: 16,
  },
  pickerContainer: {
    alignItems: 'center',
  },
  numberPicker: {
    width: 100,
    height: 180,
  },
  numberPickerContent: {
    alignItems: 'center',
    paddingVertical: 65,
  },
  numberItem: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberText: {
    fontFamily: 'FiraCode-Bold',
    fontWeight: 'bold',
  },
  pickerLabel: {
    fontFamily: 'FiraCode-Regular',
    fontSize: 12,
    marginTop: 4,
  },
  colonText: {
    fontFamily: 'FiraCode-Bold',
    fontSize: 48,
    marginHorizontal: 8,
  },
  editButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  editActionButton: {
    borderWidth: 2,
    borderRadius: 6,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  editActionText: {
    fontFamily: 'FiraCode-Bold',
    fontSize: 14,
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBar: {
    height: '100%',
  },
  progressText: {
    fontFamily: 'FiraCode-Regular',
    fontSize: 12,
    marginBottom: 16,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  controlButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  controlButtonText: {
    fontFamily: 'FiraCode-Bold',
    fontSize: 14,
  },
  footer: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  footerText: {
    fontFamily: 'FiraCode-Regular',
    fontSize: 11,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    paddingTop: 60,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontFamily: 'FiraCode-Bold',
    fontSize: 18,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 4,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  linkedTaskContainer: {
    marginBottom: 16,
    padding: 12,
    borderWidth: 1,
    borderRadius: 6,
    borderStyle: 'dashed',
  },
  linkedTaskContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  linkedTaskLabel: {
    fontFamily: 'FiraCode-Regular',
    fontSize: 11,
    marginBottom: 4,
    opacity: 0.6,
  },
  linkedTaskTitle: {
    fontFamily: 'FiraCode-Regular',
    fontSize: 14,
    flex: 1,
  },
  pomodoroCount: {
    fontFamily: 'FiraCode-Regular',
    fontSize: 12,
    marginLeft: 8,
  },
  linkedTaskPlaceholder: {
    fontFamily: 'FiraCode-Regular',
    fontSize: 13,
    opacity: 0.5,
  },
  taskPickerList: {
    flex: 1,
  },
  taskPickerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 6,
  },
  taskPickerContent: {
    flex: 1,
  },
  taskPickerTitle: {
    fontFamily: 'FiraCode-Regular',
    fontSize: 14,
    marginBottom: 6,
  },
  taskPickerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  taskPickerCategory: {
    fontFamily: 'FiraCode-Regular',
    fontSize: 11,
    textTransform: 'uppercase',
  },
  taskPickerPomodoro: {
    fontFamily: 'FiraCode-Regular',
    fontSize: 11,
  },
  linkedBadge: {
    fontFamily: 'FiraCode-Bold',
    fontSize: 11,
    textTransform: 'uppercase',
  },
  emptyText: {
    fontFamily: 'FiraCode-Regular',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 40,
  },
});
