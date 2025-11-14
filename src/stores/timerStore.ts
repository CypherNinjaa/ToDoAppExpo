import { create } from 'zustand';
import { StorageService } from '../services/storageService';

export type TimerStatus = 'idle' | 'running' | 'paused';
export type TimerType = 'focus' | 'break';

interface TimerState {
  // Timer configuration
  focusDuration: number; // in seconds (default: 25 * 60)
  breakDuration: number; // in seconds (default: 5 * 60)

  // Current timer state
  type: TimerType;
  status: TimerStatus;
  remainingTime: number; // in seconds
  totalTime: number; // in seconds

  // Statistics
  completedPomodoros: number;
  completedBreaks: number;

  // Task linking
  currentTaskId: string | null;
  sessionStartTime: Date | null;
  startTimestamp: number | null; // Timestamp when timer started (for background support)

  // Actions
  startTimer: () => void;
  pauseTimer: () => void;
  stopTimer: () => void;
  tick: () => void;
  switchToBreak: () => void;
  switchToFocus: () => void;
  setFocusDuration: (duration: number) => void;
  setBreakDuration: (duration: number) => void;
  resetTimer: () => void;
  initializeFromSettings: (focusDuration?: number, breakDuration?: number) => void;
  linkTask: (taskId: string) => void;
  unlinkTask: () => void;
  onTimerComplete?: () => void;
  setOnTimerComplete: (callback?: () => void) => void;
}

const DEFAULT_FOCUS_DURATION = 25 * 60; // 25 minutes
const DEFAULT_BREAK_DURATION = 5 * 60; // 5 minutes

export const useTimerStore = create<TimerState>((set, get) => ({
  // Initial configuration
  focusDuration: DEFAULT_FOCUS_DURATION,
  breakDuration: DEFAULT_BREAK_DURATION,

  // Initial state
  type: 'focus',
  status: 'idle',
  remainingTime: DEFAULT_FOCUS_DURATION,
  totalTime: DEFAULT_FOCUS_DURATION,

  // Statistics
  completedPomodoros: 0,
  completedBreaks: 0,

  // Task linking
  currentTaskId: null,
  sessionStartTime: null,
  startTimestamp: null,
  onTimerComplete: undefined,

  // Actions
  startTimer: () => {
    const state = get();
    set({
      status: 'running',
      sessionStartTime: state.sessionStartTime || new Date(),
      startTimestamp: Date.now(), // Record when timer started
    });
  },

  pauseTimer: () => {
    set({ status: 'paused', startTimestamp: null });
  },

  stopTimer: () => {
    const state = get();
    set({
      status: 'idle',
      remainingTime: state.type === 'focus' ? state.focusDuration : state.breakDuration,
      startTimestamp: null,
    });
  },

  tick: () => {
    const state = get();
    if (state.status !== 'running') return;

    const newRemainingTime = Math.max(0, state.remainingTime - 1);

    if (newRemainingTime === 0) {
      // Timer completed
      if (state.type === 'focus') {
        set({
          completedPomodoros: state.completedPomodoros + 1,
          status: 'idle',
          remainingTime: 0,
          sessionStartTime: null,
          startTimestamp: null,
        });
        // Call completion callback if exists
        if (state.onTimerComplete) {
          state.onTimerComplete();
        }
      } else {
        set({
          completedBreaks: state.completedBreaks + 1,
          status: 'idle',
          remainingTime: 0,
          startTimestamp: null,
        });
      }
    } else {
      set({ remainingTime: newRemainingTime });
    }
  },

  switchToBreak: () => {
    const state = get();
    set({
      type: 'break',
      status: 'idle',
      remainingTime: state.breakDuration,
      totalTime: state.breakDuration,
      startTimestamp: null,
    });
  },

  switchToFocus: () => {
    const state = get();
    set({
      type: 'focus',
      status: 'idle',
      remainingTime: state.focusDuration,
      totalTime: state.focusDuration,
      startTimestamp: null,
    });
  },

  setFocusDuration: (duration: number) => {
    const state = get();
    set({
      focusDuration: duration,
      ...(state.type === 'focus' && state.status === 'idle'
        ? { remainingTime: duration, totalTime: duration }
        : {}),
    });
  },

  setBreakDuration: (duration: number) => {
    const state = get();
    set({
      breakDuration: duration,
      ...(state.type === 'break' && state.status === 'idle'
        ? { remainingTime: duration, totalTime: duration }
        : {}),
    });
  },

  resetTimer: () => {
    const state = get();
    set({
      status: 'idle',
      remainingTime: state.type === 'focus' ? state.focusDuration : state.breakDuration,
      startTimestamp: null,
    });
  },

  initializeFromSettings: (focusDuration, breakDuration) => {
    const state = get();
    const newFocusDuration = focusDuration || DEFAULT_FOCUS_DURATION;
    const newBreakDuration = breakDuration || DEFAULT_BREAK_DURATION;

    set({
      focusDuration: newFocusDuration,
      breakDuration: newBreakDuration,
      ...(state.type === 'focus' && state.status === 'idle'
        ? { remainingTime: newFocusDuration, totalTime: newFocusDuration }
        : {}),
      ...(state.type === 'break' && state.status === 'idle'
        ? { remainingTime: newBreakDuration, totalTime: newBreakDuration }
        : {}),
    });
  },

  linkTask: (taskId: string) => {
    set({ currentTaskId: taskId });
  },

  unlinkTask: () => {
    set({ currentTaskId: null, sessionStartTime: null });
  },

  setOnTimerComplete: (callback?: () => void) => {
    set({ onTimerComplete: callback });
  },
}));

// Subscribe to state changes and persist to storage
useTimerStore.subscribe((state) => {
  // Only save if timer is active or has meaningful state
  if (state.status !== 'idle' || state.remainingTime !== state.totalTime) {
    StorageService.saveTimerState({
      type: state.type,
      status: state.status,
      remainingTime: state.remainingTime,
      totalTime: state.totalTime,
      completedPomodoros: state.completedPomodoros,
      completedBreaks: state.completedBreaks,
      currentTaskId: state.currentTaskId,
      sessionStartTime: state.sessionStartTime?.toISOString(),
      startTimestamp: state.startTimestamp,
      focusDuration: state.focusDuration,
      breakDuration: state.breakDuration,
    });
  } else {
    // Clear storage when timer is reset to idle
    StorageService.clearTimerState();
  }
});

// Initialize timer from storage
export const initializeTimerFromStorage = async () => {
  try {
    const savedState = await StorageService.getTimerState();
    if (!savedState) return;

    const state = useTimerStore.getState();

    // Calculate elapsed time if timer was running
    let adjustedRemainingTime = savedState.remainingTime;
    if (savedState.status === 'running' && savedState.startTimestamp) {
      const elapsed = Math.floor((Date.now() - savedState.startTimestamp) / 1000);
      adjustedRemainingTime = Math.max(0, savedState.remainingTime - elapsed);
    }

    // Check if timer completed while app was closed
    if (adjustedRemainingTime === 0 && savedState.status === 'running') {
      // Timer completed - update counts and mark as idle
      if (savedState.type === 'focus') {
        useTimerStore.setState({
          completedPomodoros: savedState.completedPomodoros + 1,
          status: 'idle',
          type: 'focus',
          remainingTime: savedState.focusDuration,
          totalTime: savedState.focusDuration,
          sessionStartTime: null,
          startTimestamp: null,
          currentTaskId: null,
        });
      } else {
        useTimerStore.setState({
          completedBreaks: savedState.completedBreaks + 1,
          status: 'idle',
          type: 'break',
          remainingTime: savedState.breakDuration,
          totalTime: savedState.breakDuration,
          startTimestamp: null,
        });
      }
      return;
    }

    // Restore timer state
    useTimerStore.setState({
      type: savedState.type,
      status: savedState.status === 'running' ? 'running' : 'paused',
      remainingTime: adjustedRemainingTime,
      totalTime: savedState.totalTime,
      completedPomodoros: savedState.completedPomodoros,
      completedBreaks: savedState.completedBreaks,
      currentTaskId: savedState.currentTaskId,
      sessionStartTime: savedState.sessionStartTime,
      startTimestamp: savedState.status === 'running' ? Date.now() : null, // Reset timestamp
      focusDuration: savedState.focusDuration,
      breakDuration: savedState.breakDuration,
    });
  } catch (error) {
    console.error('Failed to initialize timer from storage:', error);
  }
};
