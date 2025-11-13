import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Modal } from 'react-native';
import { useTimerStore } from '../../stores/timerStore';
import { useThemeStore } from '../../stores/themeStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { TimerSettings } from '../inputs/TimerSettings';

const { width } = Dimensions.get('window');

export const PomodoroTimer: React.FC = () => {
  const currentTheme = useThemeStore((state) => state.currentTheme);
  const getThemeColors = useThemeStore((state) => state.getThemeColors);
  const theme = getThemeColors();

  const settings = useSettingsStore((state) => state.settings);

  const [showSettings, setShowSettings] = useState(false);

  const {
    type,
    status,
    remainingTime,
    totalTime,
    completedPomodoros,
    startTimer,
    pauseTimer,
    stopTimer,
    tick,
    switchToBreak,
    switchToFocus,
    initializeFromSettings,
  } = useTimerStore();

  // Initialize timer from settings on mount
  useEffect(() => {
    initializeFromSettings(settings.focusDuration, settings.breakDuration);
  }, [settings.focusDuration, settings.breakDuration, initializeFromSettings]); // Countdown interval effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (status === 'running') {
      interval = setInterval(() => {
        tick();
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [status, tick]);

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
    } else {
      startTimer();
    }
  };

  const handleStop = () => {
    stopTimer();
  };

  const handleSwitchMode = () => {
    if (type === 'focus') {
      switchToBreak();
    } else {
      switchToFocus();
    }
  };

  return (
    <>
      <View
        style={[styles.container, { backgroundColor: theme.background, borderColor: theme.border }]}
      >
        {/* Debug mode header */}
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

        {/* Timer mode indicator */}
        <View style={styles.modeContainer}>
          <Text
            style={[styles.modeText, { color: type === 'focus' ? theme.error : theme.success }]}
          >
            {type === 'focus' ? '>> FOCUS_MODE' : '>> BREAK_MODE'}
          </Text>
        </View>

        {/* Timer display */}
        <View style={styles.timerDisplay}>
          <Text style={[styles.timeText, { color: theme.primary }]}>
            {formatTime(remainingTime)}
          </Text>
          <Text style={[styles.statusText, { color: theme.textSecondary }]}>
            {`status: "${status}"`}
          </Text>
        </View>

        {/* Progress bar */}
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
        </View>

        {/* Debug footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>
            {`// totalTime: ${totalTime}s | remaining: ${remainingTime}s`}
          </Text>
        </View>
      </View>

      {/* Timer Settings Modal */}
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
  timeText: {
    fontFamily: 'FiraCode-Bold',
    fontSize: 56,
    letterSpacing: 4,
  },
  statusText: {
    fontFamily: 'FiraCode-Regular',
    fontSize: 14,
    marginTop: 4,
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
});
