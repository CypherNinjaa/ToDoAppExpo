// File Store - Zustand store for file management

import { create } from 'zustand';
import { TrackedFile, FileFilter } from '../types/file.types';
import { StorageService } from '../services/storage';

interface FileState {
  files: TrackedFile[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadFiles: () => Promise<void>;
  addFile: (
    file: Omit<TrackedFile, 'id' | 'addedAt' | 'accessCount' | 'lastAccessed'>
  ) => Promise<void>;
  updateFile: (id: string, updates: Partial<TrackedFile>) => Promise<void>;
  deleteFile: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  incrementAccessCount: (id: string) => Promise<void>;
  getFileById: (id: string) => TrackedFile | undefined;
  getFilteredFiles: (filter: FileFilter) => TrackedFile[];
  clearAllFiles: () => Promise<void>;
}

export const useFileStore = create<FileState>((set, get) => ({
  files: [],
  isLoading: false,
  error: null,

  loadFiles: async () => {
    try {
      set({ isLoading: true, error: null });
      const files = await StorageService.getFiles();
      set({ files, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load files',
        isLoading: false,
      });
    }
  },

  addFile: async (fileData) => {
    try {
      const newFile: TrackedFile = {
        ...fileData,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        addedAt: new Date(),
        accessCount: 0,
      };

      const updatedFiles = [...get().files, newFile];
      await StorageService.saveFiles(updatedFiles);
      set({ files: updatedFiles });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to add file' });
      throw error;
    }
  },

  updateFile: async (id, updates) => {
    try {
      const files = get().files;
      const updatedFiles = files.map((file) => (file.id === id ? { ...file, ...updates } : file));
      await StorageService.saveFiles(updatedFiles);
      set({ files: updatedFiles });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update file' });
      throw error;
    }
  },

  deleteFile: async (id) => {
    try {
      const updatedFiles = get().files.filter((file) => file.id !== id);
      await StorageService.saveFiles(updatedFiles);
      set({ files: updatedFiles });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete file' });
      throw error;
    }
  },

  toggleFavorite: async (id) => {
    try {
      const files = get().files;
      const updatedFiles = files.map((file) =>
        file.id === id ? { ...file, isFavorite: !file.isFavorite } : file
      );
      await StorageService.saveFiles(updatedFiles);
      set({ files: updatedFiles });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to toggle favorite' });
    }
  },

  incrementAccessCount: async (id) => {
    try {
      const files = get().files;
      const updatedFiles = files.map((file) =>
        file.id === id
          ? { ...file, accessCount: file.accessCount + 1, lastAccessed: new Date() }
          : file
      );
      await StorageService.saveFiles(updatedFiles);
      set({ files: updatedFiles });
    } catch (error) {
      console.error('Failed to increment access count:', error);
    }
  },

  getFileById: (id) => {
    return get().files.find((file) => file.id === id);
  },

  getFilteredFiles: (filter) => {
    let filtered = [...get().files];

    // Filter by category
    if (filter.category) {
      filtered = filtered.filter((file) => file.category === filter.category);
    }

    // Filter by tags
    if (filter.tags && filter.tags.length > 0) {
      filtered = filtered.filter((file) => filter.tags!.some((tag) => file.tags.includes(tag)));
    }

    // Filter by favorite
    if (filter.isFavorite !== undefined) {
      filtered = filtered.filter((file) => file.isFavorite === filter.isFavorite);
    }

    // Search query
    if (filter.searchQuery && filter.searchQuery.trim()) {
      const query = filter.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (file) =>
          file.name.toLowerCase().includes(query) ||
          file.description?.toLowerCase().includes(query) ||
          file.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Sort
    const sortBy = filter.sortBy || 'addedAt';
    const direction = filter.sortDirection || 'desc';

    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'addedAt':
          comparison = new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime();
          break;
        case 'lastAccessed':
          const aTime = a.lastAccessed ? new Date(a.lastAccessed).getTime() : 0;
          const bTime = b.lastAccessed ? new Date(b.lastAccessed).getTime() : 0;
          comparison = aTime - bTime;
          break;
        case 'accessCount':
          comparison = a.accessCount - b.accessCount;
          break;
        case 'size':
          comparison = a.size - b.size;
          break;
      }

      return direction === 'asc' ? comparison : -comparison;
    });

    return filtered;
  },

  clearAllFiles: async () => {
    try {
      await StorageService.saveFiles([]);
      set({ files: [] });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to clear files' });
      throw error;
    }
  },
}));
