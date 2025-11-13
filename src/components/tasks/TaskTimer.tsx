// TaskTimer Component - Timer with start/pause/stop controls

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Theme } from '../../constants';

interface TaskTimerProps {
  initialTime?: number; // in minutes
  onTimeUpdate: (minutes: number) => void;
  isRunning?: boolean;
  onStart?: () => void;
  onPause?: () => void;
  onStop?: () => void;
}

export const TaskTimer: React.FC<TaskTimerProps> = ({
  initialTime = 0,
  onTimeUpdate,
  isRunning: externalIsRunning,
  onStart,
  onPause,
  onStop,
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(initialTime * 60);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => {
          const newSeconds = prev + 1;
          onTimeUpdate(Math.floor(newSeconds / 60));
          return newSeconds;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, onTimeUpdate]);

  const handleStart = () => {
    setIsRunning(true);
    onStart?.();
  };

  const handlePause = () => {
    setIsRunning(false);
    onPause?.();
  };

  const handleStop = () => {
    setIsRunning(false);
    setElapsedSeconds(0);
    onTimeUpdate(0);
    onStop?.();
  };

  const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.timerDisplay}>
        <Text style={styles.label}>⏱ Time Spent:</Text>
        <Text style={[styles.time, isRunning && styles.timeRunning]}>
          {formatTime(elapsedSeconds)}
        </Text>
      </View>

      <View style={styles.controls}>
        {!isRunning ? (
          <TouchableOpacity
            style={[styles.button, styles.startButton]}
            onPress={handleStart}
            activeOpacity={0.7}
          >
            <Text style={[styles.buttonText, styles.startButtonText]}>▶ Start</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.pauseButton]}
            onPress={handlePause}
            activeOpacity={0.7}
          >
            <Text style={[styles.buttonText, styles.pauseButtonText]}>⏸ Pause</Text>
          </TouchableOpacity>
        )}

        {elapsedSeconds > 0 && (
          <TouchableOpacity
            style={[styles.button, styles.stopButton]}
            onPress={handleStop}
            activeOpacity={0.7}
          >
            <Text style={[styles.buttonText, styles.stopButtonText]}>⏹ Reset</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
  },
  timerDisplay: {
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  label: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.comment,
    marginBottom: Theme.spacing.xs,
  },
  time: {
    fontFamily: Theme.typography.fontFamily.monoSemiBold,
    fontSize: 32,
    color: Theme.colors.textPrimary,
    letterSpacing: 2,
  },
  timeRunning: {
    color: Theme.colors.success,
  },
  controls: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
  },
  button: {
    flex: 1,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 2,
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: Theme.typography.fontFamily.monoSemiBold,
    fontSize: Theme.typography.fontSize.sm,
  },
  startButton: {
    backgroundColor: Theme.colors.success + '20',
    borderColor: Theme.colors.success,
  },
  startButtonText: {
    color: Theme.colors.success,
  },
  pauseButton: {
    backgroundColor: Theme.colors.warning + '20',
    borderColor: Theme.colors.warning,
  },
  pauseButtonText: {
    color: Theme.colors.warning,
  },
  stopButton: {
    backgroundColor: Theme.colors.error + '20',
    borderColor: Theme.colors.error,
  },
  stopButtonText: {
    color: Theme.colors.error,
  },
});
