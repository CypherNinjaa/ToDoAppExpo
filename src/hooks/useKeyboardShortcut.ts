// useKeyboardShortcut Hook - Handle keyboard shortcuts

import { useEffect } from 'react';
import { Platform } from 'react-native';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
}

export const useKeyboardShortcut = (shortcuts: KeyboardShortcut[]) => {
  useEffect(() => {
    // Only works on web for now
    if (Platform.OS !== 'web') {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      shortcuts.forEach((shortcut) => {
        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatches = shortcut.ctrlKey ? event.ctrlKey : true;
        const metaMatches = shortcut.metaKey ? event.metaKey : true;
        const shiftMatches = shortcut.shiftKey ? event.shiftKey : true;
        const altMatches = shortcut.altKey ? event.altKey : true;

        if (keyMatches && ctrlMatches && metaMatches && shiftMatches && altMatches) {
          event.preventDefault();
          shortcut.action();
        }
      });
    };

    // @ts-ignore - Web only
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      // @ts-ignore - Web only
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts]);
};
