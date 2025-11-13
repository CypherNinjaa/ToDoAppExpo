// File Management Types

export type FileCategory = 'document' | 'code' | 'design' | 'media' | 'archive' | 'other';

export interface TrackedFile {
  id: string;
  name: string;
  path: string; // Full file path
  uri: string; // File URI for opening
  size: number; // File size in bytes
  mimeType: string;
  category: FileCategory;
  tags: string[];
  description?: string;
  addedAt: Date;
  lastAccessed?: Date;
  accessCount: number;
  isFavorite: boolean;
  relatedTaskId?: string; // Link to a task if applicable
}

export interface FileFilter {
  category?: FileCategory;
  tags?: string[];
  searchQuery?: string;
  isFavorite?: boolean;
  sortBy?: 'name' | 'addedAt' | 'lastAccessed' | 'accessCount' | 'size';
  sortDirection?: 'asc' | 'desc';
}
