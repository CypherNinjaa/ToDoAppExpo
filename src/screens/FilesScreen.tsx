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
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import * as IntentLauncher from 'expo-intent-launcher';
import * as FileSystem from 'expo-file-system/legacy';
import Pdf from 'react-native-pdf';
import { Theme, CommonStyles } from '../constants';
import { useFileStore } from '../stores';
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
  }, []);

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

      // No need to call loadFiles - store updates state automatically

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

      // Check if it's an image - open in-app viewer
      if (file.mimeType?.startsWith('image/') || file.category === 'media') {
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
  const handleDeleteFile = async (fileId: string, fileName: string) => {
    Alert.alert('Delete File', `Remove "${fileName}" from tracking`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteFile(fileId);
          // No need to call loadFiles - store updates state automatically
        },
      },
    ]);
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

  const renderFileCard = ({ item: file }: { item: TrackedFile }) => (
    <TouchableOpacity
      style={styles.fileCard}
      onPress={() => handleOpenFile(file)}
      activeOpacity={0.7}
    >
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
            {formatFileSize(file.size)} • {formatDate(file.lastAccessed)} • {file.accessCount} opens
          </Text>
        </View>
        <TouchableOpacity
          onPress={async () => {
            await toggleFavorite(file.id);
            // No need to call loadFiles - store updates state automatically
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.favoriteIcon}>{file.isFavorite ? '⭐' : '☆'}</Text>
        </TouchableOpacity>
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

      <View style={styles.fileActions}>
        <TouchableOpacity
          style={styles.fileActionButton}
          onPress={() => handleDeleteFile(file.id, file.name)}
        >
          <Text style={styles.deleteIcon}>🗑️</Text>
          <Text style={styles.fileActionButtonText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

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
        </View>

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

      {/* Image Viewer Modal */}
      <Modal
        visible={viewingImageUri !== null}
        transparent={true}
        onRequestClose={() => setViewingImageUri(null)}
      >
        <View style={styles.imageViewerBackdrop}>
          <TouchableOpacity
            style={styles.imageViewerCloseButton}
            onPress={() => setViewingImageUri(null)}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Image
            source={{ uri: viewingImageUri || undefined }}
            style={styles.imageViewer}
            resizeMode="contain"
          />
        </View>
      </Modal>

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
});
