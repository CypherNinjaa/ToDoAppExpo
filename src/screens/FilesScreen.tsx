import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  Modal,
  Image,
  TextInput,
  ScrollView,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import * as IntentLauncher from 'expo-intent-launcher';
import * as FileSystem from 'expo-file-system/legacy';
import Pdf from 'react-native-pdf';
import ImageViewing from 'react-native-image-viewing';
import { Theme, CommonStyles } from '../constants';
import { useFileStore } from '../stores';
import { useTaskStore } from '../stores';
import { TrackedFile, FileCategory, FileFilter } from '../types/file.types';
import { SearchBar, FilterPanel } from '../components/inputs';

interface FilesScreenProps {
  username: string;
}

export const FilesScreen: React.FC<FilesScreenProps> = ({ username }) => {
  const [displayedText, setDisplayedText] = useState('');
  const fullText = '~$ ./list-files.sh --track --filter --open';

  const files = useFileStore((state) => state.files);
  const isLoading = useFileStore((state) => state.isLoading);
  const loadFiles = useFileStore((state) => state.loadFiles);
  const addFile = useFileStore((state) => state.addFile);
  const deleteFile = useFileStore((state) => state.deleteFile);
  const toggleFavorite = useFileStore((state) => state.toggleFavorite);
  const incrementAccessCount = useFileStore((state) => state.incrementAccessCount);
  const getFilteredFiles = useFileStore((state) => state.getFilteredFiles);

  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Viewer state
  const [viewingImageUri, setViewingImageUri] = useState<string | null>(null);
  const [viewingPdf, setViewingPdf] = useState<TrackedFile | null>(null);

  // Bulk operations state
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(new Set());

  // Edit modals
  const [editingFile, setEditingFile] = useState<TrackedFile | null>(null);
  const [editDescription, setEditDescription] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>(undefined);

  // Get tasks for linking
  const tasks = useTaskStore((state) => state.tasks);
  const updateFile = useFileStore((state) => state.updateFile);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<FileCategory[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState<
    'name' | 'addedAt' | 'lastAccessed' | 'accessCount' | 'size'
  >('addedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    let index = 0;
    setDisplayedText('');

    const interval = setInterval(() => {
      if (index < fullText.length) {
        setDisplayedText(fullText.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [fullText]);

  useEffect(() => {
    loadFiles();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFiles();
    setRefreshing(false);
  }, [loadFiles]);

  // Get available tags from all files
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    files.forEach((file) => {
      file.tags.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [files]);

  // Filter files based on current filter state
  const filteredFiles = useMemo(() => {
    const filter: FileFilter = {
      searchQuery,
      category: selectedCategories.length > 0 ? selectedCategories[0] : undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      isFavorite: showFavoritesOnly ? true : undefined,
      sortBy,
      sortDirection,
    };

    return getFilteredFiles(filter);
  }, [
    files, // Add files as dependency to track changes
    searchQuery,
    selectedCategories,
    selectedTags,
    showFavoritesOnly,
    sortBy,
    sortDirection,
    getFilteredFiles,
  ]);

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const pickedFile = result.assets[0];

      // Determine category based on MIME type and file extension
      let category: FileCategory = 'other';
      const fileName = pickedFile.name.toLowerCase();
      const mimeType = pickedFile.mimeType?.toLowerCase() || '';

      // Code files
      if (
        fileName.endsWith('.js') ||
        fileName.endsWith('.ts') ||
        fileName.endsWith('.tsx') ||
        fileName.endsWith('.jsx') ||
        fileName.endsWith('.py') ||
        fileName.endsWith('.java') ||
        fileName.endsWith('.cpp') ||
        fileName.endsWith('.c') ||
        fileName.endsWith('.h') ||
        fileName.endsWith('.swift') ||
        fileName.endsWith('.kt') ||
        fileName.endsWith('.go') ||
        fileName.endsWith('.rs') ||
        fileName.endsWith('.php') ||
        fileName.endsWith('.rb') ||
        fileName.endsWith('.html') ||
        fileName.endsWith('.css') ||
        fileName.endsWith('.scss') ||
        fileName.endsWith('.json') ||
        fileName.endsWith('.xml') ||
        fileName.endsWith('.yaml') ||
        fileName.endsWith('.yml')
      ) {
        category = 'code';
      }
      // Documents
      else if (
        mimeType.includes('pdf') ||
        mimeType.includes('document') ||
        mimeType.includes('text') ||
        mimeType.includes('word') ||
        mimeType.includes('sheet') ||
        mimeType.includes('presentation') ||
        fileName.endsWith('.pdf') ||
        fileName.endsWith('.doc') ||
        fileName.endsWith('.docx') ||
        fileName.endsWith('.txt') ||
        fileName.endsWith('.md') ||
        fileName.endsWith('.xls') ||
        fileName.endsWith('.xlsx') ||
        fileName.endsWith('.ppt') ||
        fileName.endsWith('.pptx')
      ) {
        category = 'document';
      }
      // Media
      else if (
        mimeType.startsWith('image/') ||
        mimeType.startsWith('video/') ||
        mimeType.startsWith('audio/') ||
        fileName.endsWith('.jpg') ||
        fileName.endsWith('.jpeg') ||
        fileName.endsWith('.png') ||
        fileName.endsWith('.gif') ||
        fileName.endsWith('.mp4') ||
        fileName.endsWith('.mp3') ||
        fileName.endsWith('.wav')
      ) {
        category = 'media';
      }
      // Archive
      else if (
        mimeType.includes('zip') ||
        mimeType.includes('compressed') ||
        mimeType.includes('archive') ||
        fileName.endsWith('.zip') ||
        fileName.endsWith('.rar') ||
        fileName.endsWith('.7z') ||
        fileName.endsWith('.tar') ||
        fileName.endsWith('.gz')
      ) {
        category = 'archive';
      }
      // Design
      else if (
        mimeType.includes('photoshop') ||
        mimeType.includes('illustrator') ||
        fileName.endsWith('.psd') ||
        fileName.endsWith('.ai') ||
        fileName.endsWith('.sketch') ||
        fileName.endsWith('.fig') ||
        fileName.endsWith('.xd') ||
        fileName.endsWith('.svg')
      ) {
        category = 'design';
      }

      await addFile({
        name: pickedFile.name,
        path: pickedFile.uri,
        uri: pickedFile.uri,
        size: pickedFile.size || 0,
        mimeType: pickedFile.mimeType || 'application/octet-stream',
        category,
        tags: [],
        isFavorite: false,
      });

      Alert.alert(
        'Success',
        `File "${pickedFile.name}" added\nCategory: ${category}\nSize: ${formatFileSize(pickedFile.size || 0)}`
      );
    } catch (error) {
      console.error('Error picking file:', error);
      Alert.alert('Error', 'Failed to add file');
    }
  };

  const handleOpenFile = async (file: TrackedFile) => {
    try {
      // Update access count immediately
      await incrementAccessCount(file.id);
      // Note: We don't re-fetch here to avoid delay in opening the file
      // The access count will update on next refresh or navigation

      // Check if it's an image - open in-app viewer with zoom
      if (file.mimeType?.startsWith('image/')) {
        setViewingImageUri(file.uri);
        return;
      }

      // Check if it's a PDF - open in-app viewer
      if (file.mimeType === 'application/pdf') {
        setViewingPdf(file);
        return;
      }

      // For all other file types, use native opening
      if (Platform.OS === 'android') {
        // --- Android: Use expo-sharing to get a content URI, then IntentLauncher ---
        // expo-sharing handles creating a temporary content:// URI via FileProvider
        // This prevents FileUriExposedException on Android API 24+

        // Check if file exists first
        const fileInfo = await FileSystem.getInfoAsync(file.uri);
        if (!fileInfo.exists) {
          Alert.alert('Error', 'File not found. It may have been moved or deleted.');
          return;
        }

        // Use IntentLauncher with proper content URI handling
        // If the URI is already a content:// URI from DocumentPicker, use it directly
        if (file.uri.startsWith('content://')) {
          await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
            data: file.uri,
            flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
            type: file.mimeType || '*/*',
          });
        } else {
          // For file:// URIs, we need to use Sharing to get a secure content:// URI
          // This will briefly show the share dialog, but it's the proper way to handle file:// URIs
          const sharingAvailable = await Sharing.isAvailableAsync();
          if (sharingAvailable) {
            await Sharing.shareAsync(file.uri, {
              mimeType: file.mimeType || '*/*',
              UTI: file.mimeType,
              dialogTitle: `Open ${file.name}`,
            });
          } else {
            Alert.alert('Error', 'Cannot open this file on this device.');
          }
        }
      } else {
        // --- iOS: Use Sharing API (this is the correct way) ---
        // This shows the standard iOS share sheet with "Open in..."
        const isAvailable = await Sharing.isAvailableAsync();

        if (isAvailable) {
          await Sharing.shareAsync(file.uri, {
            mimeType: file.mimeType || '*/*',
            UTI: file.mimeType,
          });
        } else {
          Alert.alert('Error', 'Cannot open this file type on this device');
        }
      }
    } catch (error) {
      console.error('Error opening file:', error);

      if (error instanceof Error) {
        const errorMessage = error.message;

        // Specific check for the 'No Activity found' error on Android
        if (errorMessage.includes('No Activity found to handle Intent')) {
          Alert.alert('Error', 'No application on your device can open this file type.');
        } else if (errorMessage.includes('FileUriExposedException')) {
          // This specific error should now be resolved by using content:// URIs
          Alert.alert(
            'Security Error',
            'Failed to open file due to Android security restrictions. Please ensure the file exists and try again.'
          );
        } else {
          Alert.alert(
            'Error',
            'Failed to open file. The file may have been moved, deleted, or permissions are insufficient.'
          );
        }
      } else {
        Alert.alert('Error', 'An unknown error occurred while opening the file.');
      }
    }
  };
  const handleShareFile = async (file: TrackedFile) => {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(file.uri, {
          mimeType: file.mimeType,
          dialogTitle: `Share ${file.name}`,
        });
      } else {
        Alert.alert('Error', 'Sharing is not available on this device');
      }
    } catch (error) {
      console.error('Error sharing file:', error);
      Alert.alert('Error', 'Failed to share file');
    }
  };

  const handleDeleteFile = async (fileId: string, fileName: string) => {
    Alert.alert('Delete File', `Remove "${fileName}" from tracking`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteFile(fileId);
            Alert.alert('Success', 'File removed from tracking.');
          } catch (error) {
            console.error('Error deleting file:', error);
            Alert.alert('Error', 'Failed to delete file.');
          }
        },
      },
    ]);
  };

  const handleEditFile = (file: TrackedFile) => {
    setEditingFile(file);
    setEditDescription(file.description || '');
    setEditTags([...file.tags]);
    setSelectedTaskId(file.relatedTaskId);
  };

  const handleSaveEdit = async () => {
    if (!editingFile) return;

    try {
      await updateFile(editingFile.id, {
        description: editDescription,
        tags: editTags,
        relatedTaskId: selectedTaskId,
      });
      setEditingFile(null);
      Alert.alert('Success', 'File updated successfully');
    } catch (error) {
      console.error('Error updating file:', error);
      Alert.alert('Error', 'Failed to update file');
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !editTags.includes(newTag.trim())) {
      setEditTags([...editTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setEditTags(editTags.filter((tag) => tag !== tagToRemove));
  };

  // Bulk operations
  const toggleBulkMode = () => {
    setBulkMode(!bulkMode);
    setSelectedFileIds(new Set());
  };

  const toggleFileSelection = (fileId: string) => {
    const newSelection = new Set(selectedFileIds);
    if (newSelection.has(fileId)) {
      newSelection.delete(fileId);
    } else {
      newSelection.add(fileId);
    }
    setSelectedFileIds(newSelection);
  };

  const selectAllFiles = () => {
    if (selectedFileIds.size === filteredFiles.length) {
      setSelectedFileIds(new Set());
    } else {
      setSelectedFileIds(new Set(filteredFiles.map((f) => f.id)));
    }
  };

  const handleBulkDelete = () => {
    if (selectedFileIds.size === 0) return;

    Alert.alert('Delete Files', `Remove ${selectedFileIds.size} file(s) from tracking?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            for (const id of selectedFileIds) {
              await deleteFile(id);
            }
            setSelectedFileIds(new Set());
            setBulkMode(false);
            Alert.alert('Success', `${selectedFileIds.size} file(s) removed`);
          } catch (error) {
            console.error('Error bulk deleting:', error);
            Alert.alert('Error', 'Failed to delete some files');
          }
        },
      },
    ]);
  };

  const handleBulkFavorite = async () => {
    if (selectedFileIds.size === 0) return;

    try {
      for (const id of selectedFileIds) {
        await toggleFavorite(id);
      }
      setSelectedFileIds(new Set());
      Alert.alert('Success', `Updated ${selectedFileIds.size} file(s)`);
    } catch (error) {
      console.error('Error bulk favoriting:', error);
      Alert.alert('Error', 'Failed to update some files');
    }
  };

  const handleBulkTag = () => {
    if (selectedFileIds.size === 0) return;

    Alert.prompt('Add Tag', 'Enter tag to add to selected files:', async (tag) => {
      if (!tag || !tag.trim()) return;

      try {
        for (const id of selectedFileIds) {
          const file = files.find((f) => f.id === id);
          if (file && !file.tags.includes(tag.trim())) {
            await updateFile(id, {
              tags: [...file.tags, tag.trim()],
            });
          }
        }
        setSelectedFileIds(new Set());
        Alert.alert('Success', `Tagged ${selectedFileIds.size} file(s)`);
      } catch (error) {
        console.error('Error bulk tagging:', error);
        Alert.alert('Error', 'Failed to tag some files');
      }
    });
  };

  const getCategoryIcon = (category: FileCategory): string => {
    const icons: Record<FileCategory, string> = {
      document: '📄',
      code: '💻',
      design: '🎨',
      media: '🖼️',
      archive: '📦',
      other: '📁',
    };
    return icons[category];
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
  };

  const formatDate = (date: Date | undefined): string => {
    if (!date) return 'Never';
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return new Date(date).toLocaleDateString();
  };

  const renderFileCard = ({ item: file }: { item: TrackedFile }) => {
    const isSelected = selectedFileIds.has(file.id);
    const relatedTask = file.relatedTaskId ? tasks.find((t) => t.id === file.relatedTaskId) : null;

    return (
      <TouchableOpacity
        style={[styles.fileCard, isSelected && styles.fileCardSelected]}
        onPress={() => (bulkMode ? toggleFileSelection(file.id) : handleOpenFile(file))}
        onLongPress={() => {
          if (!bulkMode) {
            setBulkMode(true);
            toggleFileSelection(file.id);
          }
        }}
        activeOpacity={0.7}
      >
        {bulkMode && (
          <View style={styles.selectionIndicator}>
            <Text style={styles.selectionIcon}>{isSelected ? '☑️' : '☐'}</Text>
          </View>
        )}

        <View style={styles.fileHeader}>
          <View style={styles.fileIconContainer}>
            <Text style={styles.fileIcon}>{getCategoryIcon(file.category)}</Text>
          </View>
          <View style={styles.fileInfo}>
            <View style={styles.fileNameRow}>
              <Text style={styles.fileName} numberOfLines={1}>
                {file.name}
              </Text>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{file.category}</Text>
              </View>
            </View>
            <Text style={styles.fileMetadata}>
              {formatFileSize(file.size)} • {formatDate(file.lastAccessed)} • {file.accessCount}{' '}
              opens
            </Text>
            {relatedTask && <Text style={styles.linkedTask}>🔗 {relatedTask.title}</Text>}
          </View>
          {!bulkMode && (
            <TouchableOpacity
              onPress={async () => {
                try {
                  await toggleFavorite(file.id);
                } catch (error) {
                  console.error('Error toggling favorite:', error);
                  Alert.alert('Error', 'Failed to update favorite status.');
                }
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.favoriteIcon}>{file.isFavorite ? '⭐' : '☆'}</Text>
            </TouchableOpacity>
          )}
        </View>

        {file.description && (
          <Text style={styles.fileDescription} numberOfLines={2}>
            {file.description}
          </Text>
        )}

        {file.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {file.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {!bulkMode && (
          <View style={styles.fileActions}>
            <TouchableOpacity style={styles.fileActionButton} onPress={() => handleEditFile(file)}>
              <Text style={styles.actionIcon}>✏️</Text>
              <Text style={styles.fileActionButtonTextNormal}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.fileActionButton} onPress={() => handleShareFile(file)}>
              <Text style={styles.actionIcon}>📤</Text>
              <Text style={styles.fileActionButtonTextNormal}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.fileActionButton}
              onPress={() => handleDeleteFile(file.id, file.name)}
            >
              <Text style={styles.deleteIcon}>🗑️</Text>
              <Text style={styles.fileActionButtonText}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (isLoading && files.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Theme.colors.success} />
        <Text style={styles.loadingText}>Loading files...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          {displayedText}
          <Text style={styles.cursor}>▊</Text>
        </Text>

        {/* File count */}
        <Text style={styles.count}>
          $ ls -la /files → {filteredFiles.length}/{files.length} files
        </Text>
      </View>

      {/* Search and Controls */}
      <View style={styles.controlsContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search files, tags, descriptions..."
        />

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionButton, showFilters && styles.actionButtonActive]}
            onPress={() => setShowFilters(!showFilters)}
            activeOpacity={0.7}
          >
            <Text style={[styles.actionButtonText, showFilters && styles.actionButtonTextActive]}>
              🔍 {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, showFavoritesOnly && styles.actionButtonActive]}
            onPress={() => setShowFavoritesOnly(!showFavoritesOnly)}
            activeOpacity={0.7}
          >
            <Text
              style={[styles.actionButtonText, showFavoritesOnly && styles.actionButtonTextActive]}
            >
              ⭐ Favorites
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, bulkMode && styles.actionButtonActive]}
            onPress={toggleBulkMode}
            activeOpacity={0.7}
          >
            <Text style={[styles.actionButtonText, bulkMode && styles.actionButtonTextActive]}>
              ☑️ {bulkMode ? 'Cancel' : 'Select'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bulk Operations Bar */}
        {bulkMode && selectedFileIds.size > 0 && (
          <View style={styles.bulkBar}>
            <Text style={styles.bulkBarText}>{selectedFileIds.size} selected</Text>
            <View style={styles.bulkActions}>
              <TouchableOpacity onPress={selectAllFiles} style={styles.bulkActionButton}>
                <Text style={styles.bulkActionText}>Select All</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleBulkFavorite} style={styles.bulkActionButton}>
                <Text style={styles.bulkActionText}>⭐ Favorite</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleBulkTag} style={styles.bulkActionButton}>
                <Text style={styles.bulkActionText}>🏷️ Tag</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleBulkDelete} style={styles.bulkActionButton}>
                <Text style={[styles.bulkActionText, { color: Theme.colors.error }]}>
                  🗑️ Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Filter Panel */}
        {showFilters && (
          <View style={styles.filterPanel}>
            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>Category:</Text>
              <View style={styles.filterOptions}>
                {(
                  ['document', 'code', 'design', 'media', 'archive', 'other'] as FileCategory[]
                ).map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.filterChip,
                      selectedCategories.includes(cat) && styles.filterChipActive,
                    ]}
                    onPress={() => {
                      setSelectedCategories(
                        selectedCategories.includes(cat)
                          ? selectedCategories.filter((c) => c !== cat)
                          : [cat]
                      );
                    }}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        selectedCategories.includes(cat) && styles.filterChipTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}
      </View>

      {/* File List */}
      <FlatList
        data={filteredFiles}
        renderItem={renderFileCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Theme.colors.success}
            colors={[Theme.colors.success]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📂</Text>
            <Text style={styles.emptyText}>No files tracked yet</Text>
            <Text style={styles.emptySubtext}>
              Tap the + button to add important files to track
            </Text>
          </View>
        }
      />

      {/* Add File Button */}
      <TouchableOpacity style={styles.addButton} onPress={handlePickFile}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      {/* Image Viewer Modal with Zoom */}
      <ImageViewing
        images={viewingImageUri ? [{ uri: viewingImageUri }] : []}
        imageIndex={0}
        visible={viewingImageUri !== null}
        onRequestClose={() => setViewingImageUri(null)}
      />

      {/* PDF Viewer Modal */}
      <Modal
        visible={viewingPdf !== null}
        animationType="slide"
        onRequestClose={() => setViewingPdf(null)}
      >
        <View style={styles.pdfViewerContainer}>
          <TouchableOpacity style={styles.pdfViewerCloseButton} onPress={() => setViewingPdf(null)}>
            <Text style={styles.pdfCloseButtonText}>✕</Text>
          </TouchableOpacity>
          {viewingPdf && (
            <Pdf
              source={{ uri: viewingPdf.uri, cache: true }}
              onLoadComplete={(numberOfPages, filePath) => {
                console.log(`PDF loaded: ${numberOfPages} pages at ${filePath}`);
              }}
              onError={(error) => {
                console.error('PDF error:', error);
                Alert.alert('Error', 'Could not load PDF.');
                setViewingPdf(null);
              }}
              style={styles.pdfViewer}
            />
          )}
        </View>
      </Modal>

      {/* Edit File Modal */}
      <Modal
        visible={editingFile !== null}
        animationType="slide"
        onRequestClose={() => setEditingFile(null)}
      >
        <View style={styles.editModalContainer}>
          <View style={styles.editModalHeader}>
            <Text style={styles.editModalTitle}>Edit File</Text>
            <TouchableOpacity onPress={() => setEditingFile(null)}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.editModalContent}>
            {editingFile && (
              <>
                <Text style={styles.editModalFileName}>{editingFile.name}</Text>

                {/* Description */}
                <Text style={styles.editLabel}>Description:</Text>
                <TextInput
                  style={styles.editInput}
                  value={editDescription}
                  onChangeText={setEditDescription}
                  placeholder="Add a description..."
                  placeholderTextColor={Theme.colors.comment}
                  multiline
                  numberOfLines={3}
                />

                {/* Tags */}
                <Text style={styles.editLabel}>Tags:</Text>
                <View style={styles.tagsContainer}>
                  {editTags.map((tag) => (
                    <TouchableOpacity
                      key={tag}
                      style={styles.tag}
                      onPress={() => handleRemoveTag(tag)}
                    >
                      <Text style={styles.tagText}>#{tag}</Text>
                      <Text style={styles.tagRemove}> ✕</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={styles.tagInputRow}>
                  <TextInput
                    style={[styles.editInput, { flex: 1 }]}
                    value={newTag}
                    onChangeText={setNewTag}
                    placeholder="Add tag..."
                    placeholderTextColor={Theme.colors.comment}
                    onSubmitEditing={handleAddTag}
                  />
                  <TouchableOpacity style={styles.addTagButton} onPress={handleAddTag}>
                    <Text style={styles.addTagButtonText}>Add</Text>
                  </TouchableOpacity>
                </View>

                {/* Link to Task */}
                <Text style={styles.editLabel}>Linked Task:</Text>
                <View style={styles.taskPickerContainer}>
                  <TouchableOpacity
                    style={styles.taskPickerButton}
                    onPress={() => {
                      Alert.alert('Select Task', 'Choose a task to link', [
                        { text: 'None', onPress: () => setSelectedTaskId(undefined) },
                        ...tasks.slice(0, 10).map((task) => ({
                          text: task.title,
                          onPress: () => setSelectedTaskId(task.id),
                        })),
                        { text: 'Cancel', style: 'cancel' },
                      ]);
                    }}
                  >
                    <Text style={styles.taskPickerButtonText}>
                      {selectedTaskId
                        ? tasks.find((t) => t.id === selectedTaskId)?.title || 'Select task...'
                        : 'No task linked'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>

          <View style={styles.editModalFooter}>
            <TouchableOpacity
              style={[styles.editModalButton, styles.editModalButtonCancel]}
              onPress={() => setEditingFile(null)}
            >
              <Text style={styles.editModalButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.editModalButton, styles.editModalButtonSave]}
              onPress={handleSaveEdit}
            >
              <Text style={[styles.editModalButtonText, { color: Theme.colors.background }]}>
                Save
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Theme.colors.textSecondary,
    fontFamily: 'FiraCode-Regular',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: Theme.layout.screenPadding,
    paddingBottom: Theme.spacing.md,
    backgroundColor: Theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  title: {
    fontSize: 18,
    fontFamily: Theme.typography.fontFamily.mono,
    color: Theme.colors.keyword,
    fontWeight: 'bold',
  },
  cursor: {
    color: Theme.colors.primary,
  },
  count: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.comment,
    marginTop: Theme.spacing.xs,
  },
  controlsContainer: {
    paddingHorizontal: Theme.layout.screenPadding,
    paddingVertical: Theme.spacing.md,
    backgroundColor: Theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
    marginTop: Theme.spacing.md,
  },
  actionButton: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.sm,
  },
  actionButtonActive: {
    backgroundColor: Theme.colors.primary + '20',
    borderColor: Theme.colors.primary,
  },
  actionButtonText: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.textSecondary,
  },
  actionButtonTextActive: {
    color: Theme.colors.primary,
  },
  filterPanel: {
    marginTop: Theme.spacing.md,
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    gap: 12,
  },
  filterRow: {
    gap: 8,
  },
  filterLabel: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
    fontFamily: 'FiraCode-Regular',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Theme.colors.background,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  filterChipActive: {
    backgroundColor: Theme.colors.success + '20',
    borderColor: Theme.colors.success,
  },
  filterChipText: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
    fontFamily: 'FiraCode-Regular',
  },
  filterChipTextActive: {
    color: Theme.colors.success,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  fileCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  fileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  fileIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: Theme.colors.success + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileIcon: {
    fontSize: 24,
  },
  favoriteIcon: {
    fontSize: 24,
    color: Theme.colors.warning,
  },
  deleteIcon: {
    fontSize: 16,
  },
  emptyIcon: {
    fontSize: 64,
  },
  addButtonText: {
    fontSize: 32,
    color: Theme.colors.background,
    fontWeight: 'bold',
  },
  closeButtonText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
  },
  pdfCloseButtonText: {
    fontSize: 32,
    color: Theme.colors.textPrimary,
    fontWeight: 'bold',
  },
  fileInfo: {
    flex: 1,
  },
  fileNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  fileName: {
    fontSize: 16,
    color: Theme.colors.textPrimary,
    fontFamily: 'FiraCode-Bold',
    flex: 1,
  },
  categoryBadge: {
    backgroundColor: Theme.colors.success + '20',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: Theme.colors.success,
  },
  categoryBadgeText: {
    fontSize: 10,
    color: Theme.colors.success,
    fontFamily: 'FiraCode-Regular',
    textTransform: 'uppercase',
  },
  fileMetadata: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
    fontFamily: 'FiraCode-Regular',
  },
  fileDescription: {
    fontSize: 14,
    color: Theme.colors.textSecondary,
    fontFamily: 'FiraCode-Regular',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  tag: {
    backgroundColor: Theme.colors.info + '20',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Theme.colors.info,
  },
  tagText: {
    fontSize: 11,
    color: Theme.colors.info,
    fontFamily: 'FiraCode-Regular',
  },
  fileActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
  },
  fileActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  fileActionButtonText: {
    fontSize: 12,
    color: Theme.colors.error,
    fontFamily: 'FiraCode-Regular',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    color: Theme.colors.textSecondary,
    fontFamily: 'FiraCode-Bold',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: Theme.colors.textSecondary,
    fontFamily: 'FiraCode-Regular',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Theme.colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  // Image Viewer styles
  imageViewerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageViewerCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
  },
  imageViewer: {
    width: '100%',
    height: '100%',
  },
  // PDF Viewer styles
  pdfViewerContainer: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  pdfViewerCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
    backgroundColor: Theme.colors.surface,
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  pdfViewer: {
    flex: 1,
    width: '100%',
  },
  // Bulk mode styles
  fileCardSelected: {
    backgroundColor: Theme.colors.primary + '15',
    borderColor: Theme.colors.primary,
    borderWidth: 2,
  },
  selectionIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
  },
  selectionIcon: {
    fontSize: 24,
  },
  linkedTask: {
    fontSize: 12,
    color: Theme.colors.info,
    fontFamily: 'FiraCode-Regular',
    marginTop: 4,
  },
  actionIcon: {
    fontSize: 16,
  },
  fileActionButtonTextNormal: {
    fontSize: 12,
    color: Theme.colors.info,
    fontFamily: 'FiraCode-Regular',
  },
  bulkBar: {
    marginTop: Theme.spacing.md,
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.primary,
  },
  bulkBarText: {
    fontSize: 14,
    color: Theme.colors.primary,
    fontFamily: 'FiraCode-Bold',
    marginBottom: 8,
  },
  bulkActions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  bulkActionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Theme.colors.background,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  bulkActionText: {
    fontSize: 12,
    color: Theme.colors.textPrimary,
    fontFamily: 'FiraCode-Regular',
  },
  // Edit Modal styles
  editModalContainer: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  editModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Theme.spacing.lg,
    paddingTop: 60,
    backgroundColor: Theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  editModalTitle: {
    fontSize: 20,
    fontFamily: 'FiraCode-Bold',
    color: Theme.colors.keyword,
  },
  editModalContent: {
    flex: 1,
    padding: Theme.spacing.lg,
  },
  editModalFileName: {
    fontSize: 16,
    fontFamily: 'FiraCode-Bold',
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.lg,
  },
  editLabel: {
    fontSize: 14,
    fontFamily: 'FiraCode-Bold',
    color: Theme.colors.textSecondary,
    marginBottom: 8,
    marginTop: 16,
  },
  editInput: {
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.sm,
    padding: 12,
    fontSize: 14,
    fontFamily: 'FiraCode-Regular',
    color: Theme.colors.textPrimary,
    minHeight: 44,
  },
  tagInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  addTagButton: {
    backgroundColor: Theme.colors.success,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: Theme.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addTagButtonText: {
    fontSize: 14,
    fontFamily: 'FiraCode-Bold',
    color: Theme.colors.background,
  },
  tagRemove: {
    fontSize: 12,
    color: Theme.colors.error,
  },
  taskPickerContainer: {
    marginTop: 8,
  },
  taskPickerButton: {
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.sm,
    padding: 12,
    minHeight: 44,
    justifyContent: 'center',
  },
  taskPickerButtonText: {
    fontSize: 14,
    fontFamily: 'FiraCode-Regular',
    color: Theme.colors.textPrimary,
  },
  editModalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: Theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface,
  },
  editModalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: Theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editModalButtonCancel: {
    backgroundColor: Theme.colors.background,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  editModalButtonSave: {
    backgroundColor: Theme.colors.success,
  },
  editModalButtonText: {
    fontSize: 16,
    fontFamily: 'FiraCode-Bold',
    color: Theme.colors.textPrimary,
  },
});
