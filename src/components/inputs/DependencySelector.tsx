// DependencySelector Component - Select task dependencies

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  FlatList,
} from 'react-native';
import { Theme } from '../../constants';
import { Task } from '../../types';

interface DependencySelectorProps {
  label: string;
  selectedIds: string[];
  currentTaskId?: string;
  availableTasks: Task[];
  onSelectionChange: (ids: string[]) => void;
}

export const DependencySelector: React.FC<DependencySelectorProps> = ({
  label,
  selectedIds,
  currentTaskId,
  availableTasks,
  onSelectionChange,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Filter out current task and completed tasks
  const selectableTasks = availableTasks.filter(
    (task) => task.id !== currentTaskId && task.status !== 'completed'
  );

  const selectedTasks = availableTasks.filter((task) => selectedIds.includes(task.id));

  const toggleDependency = (taskId: string) => {
    if (selectedIds.includes(taskId)) {
      onSelectionChange(selectedIds.filter((id) => id !== taskId));
    } else {
      onSelectionChange([...selectedIds, taskId]);
    }
  };

  const removeDependency = (taskId: string) => {
    onSelectionChange(selectedIds.filter((id) => id !== taskId));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      {/* Selected dependencies */}
      {selectedTasks.length > 0 && (
        <View style={styles.selectedContainer}>
          {selectedTasks.map((task) => (
            <View key={task.id} style={styles.selectedChip}>
              <Text style={styles.selectedChipText} numberOfLines={1}>
                {task.title}
              </Text>
              <TouchableOpacity
                onPress={() => removeDependency(task.id)}
                style={styles.removeButton}
                activeOpacity={0.7}
              >
                <Text style={styles.removeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Add button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setIsModalVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.addButtonText}>
          + Add dependency ({selectableTasks.length} available)
        </Text>
      </TouchableOpacity>

      {/* Selection modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>// Select Dependencies</Text>
              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                style={styles.closeButton}
                activeOpacity={0.7}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={selectableTasks}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const isSelected = selectedIds.includes(item.id);
                return (
                  <TouchableOpacity
                    style={[styles.taskItem, isSelected && styles.taskItemSelected]}
                    onPress={() => toggleDependency(item.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.checkbox}>
                      {isSelected && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <View style={styles.taskInfo}>
                      <Text style={styles.taskTitle} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text style={styles.taskMeta}>
                        {item.priority} • {item.category}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No tasks available</Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Theme.spacing.lg,
  },
  label: {
    fontFamily: Theme.typography.fontFamily.monoSemiBold,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.keyword,
    marginBottom: Theme.spacing.sm,
  },
  selectedContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.sm,
  },
  selectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.warning + '20',
    borderWidth: 1,
    borderColor: Theme.colors.warning,
    borderRadius: Theme.borderRadius.sm,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    maxWidth: '100%',
  },
  selectedChipText: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.warning,
    marginRight: Theme.spacing.xs,
    flex: 1,
  },
  removeButton: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: 16,
    color: Theme.colors.warning,
  },
  addButton: {
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
  },
  addButtonText: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Theme.colors.background,
    borderTopLeftRadius: Theme.borderRadius.lg,
    borderTopRightRadius: Theme.borderRadius.lg,
    maxHeight: '70%',
    borderTopWidth: 2,
    borderColor: Theme.colors.border,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  modalTitle: {
    fontFamily: Theme.typography.fontFamily.monoSemiBold,
    fontSize: Theme.typography.fontSize.lg,
    color: Theme.colors.keyword,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: 24,
    color: Theme.colors.textSecondary,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  taskItemSelected: {
    backgroundColor: Theme.colors.success + '10',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: Theme.borderRadius.sm,
    borderWidth: 2,
    borderColor: Theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Theme.spacing.md,
  },
  checkmark: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: 12,
    color: Theme.colors.success,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.md,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.xs,
  },
  taskMeta: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.comment,
  },
  emptyState: {
    padding: Theme.spacing.xl,
    alignItems: 'center',
  },
  emptyStateText: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.md,
    color: Theme.colors.comment,
  },
});
