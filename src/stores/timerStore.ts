import { create } from 'zustand';

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

  // Actions
  startTimer: () => {
    set({ status: 'running' });
  },

  pauseTimer: () => {
    set({ status: 'paused' });
  },

  stopTimer: () => {
    const state = get();
    set({
      status: 'idle',
      remainingTime: state.type === 'focus' ? state.focusDuration : state.breakDuration,
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
        });
      } else {
        set({
          completedBreaks: state.completedBreaks + 1,
          status: 'idle',
          remainingTime: 0,
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
    });
  },

  switchToFocus: () => {
    const state = get();
    set({
      type: 'focus',
      status: 'idle',
      remainingTime: state.focusDuration,
      totalTime: state.focusDuration,
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
    });
  },
}));
