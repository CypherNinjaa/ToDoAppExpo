// TaskFormScreen - Complete Task Creation/Edit Form

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Theme } from '../constants';
import { useTaskStore } from '../stores';
import { TaskPriority, TaskCategory } from '../types';
import { CodeInput, PrioritySelector, CategorySelector, DatePicker } from '../components/inputs';

interface TaskFormScreenProps {
  taskId?: string;
  onClose: () => void;
}

export const TaskFormScreen: React.FC<TaskFormScreenProps> = ({ taskId, onClose }) => {
  const addTask = useTaskStore((state) => state.addTask);
  const updateTask = useTaskStore((state) => state.updateTask);
  const getTaskById = useTaskStore((state) => state.getTaskById);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [category, setCategory] = useState<TaskCategory>('coding');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [tags, setTags] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!taskId;

  // Load task data if editing
  useEffect(() => {
    if (taskId) {
      const task = getTaskById(taskId);
      if (task) {
        setTitle(task.title);
        setDescription(task.description || '');
        setPriority(task.priority);
        setCategory(task.category);
        setDueDate(task.dueDate);
        setTags(task.tags.join(', '));
      }
    }
  }, [taskId, getTaskById]);

  // Validation
  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!validate()) {
      Alert.alert('Validation Error', 'Please check the form for errors');
      return;
    }

    setIsSubmitting(true);

    try {
      const taskData = {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        category,
        status: 'pending' as const,
        dueDate,
        tags: tags
          .split(',')
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0),
      };

      if (isEditMode && taskId) {
        await updateTask(taskId, taskData);
        Alert.alert('Success', 'Task updated successfully!');
      } else {
        await addTask(taskData);
        Alert.alert('Success', 'Task created successfully!');
      }

      onClose();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to save task');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (title || description) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to discard them?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: onClose },
        ]
      );
    } else {
      onClose();
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {isEditMode ? '$ vim task.json' : '$ touch new-task.json'}
        </Text>
        <Text style={styles.headerSubtitle}>
          {isEditMode ? '// Edit existing task' : '// Create new task'}
        </Text>
      </View>

      {/* Form */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <CodeInput
          label="// Task title"
          placeholder='console.log("Task title here");'
          value={title}
          onChangeText={setTitle}
          syntaxType="string"
          error={errors.title}
          maxLength={100}
        />

        {/* Description */}
        <CodeInput
          label="// Description (optional)"
          placeholder="/* Add detailed description here */"
          value={description}
          onChangeText={setDescription}
          syntaxType="comment"
          multiline
          showLineNumber={false}
        />

        {/* Priority */}
        <PrioritySelector label="// Set priority level" value={priority} onChange={setPriority} />

        {/* Category */}
        <CategorySelector label="// Choose category" value={category} onChange={setCategory} />

        {/* Due Date */}
        <DatePicker label="// Set deadline (optional)" value={dueDate} onChange={setDueDate} />

        {/* Tags */}
        <CodeInput
          label="// Tags (comma separated)"
          placeholder='const tags = ["react", "typescript"];'
          value={tags}
          onChangeText={setTags}
          syntaxType="variable"
          showLineNumber={false}
        />

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={handleCancel}
            disabled={isSubmitting}
            activeOpacity={0.7}
          >
            <Text style={[styles.buttonText, styles.cancelButtonText]}>$ exit</Text>
            <Text style={styles.buttonSubtext}>// Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.submitButton, isSubmitting && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.7}
          >
            <Text style={[styles.buttonText, styles.submitButtonText]}>
              {isEditMode ? '$ git commit' : '$ git add .'}
            </Text>
            <Text style={styles.buttonSubtext}>
              {isSubmitting ? '// Saving...' : isEditMode ? '// Update task' : '// Create task'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: Theme.layout.screenPadding,
    paddingBottom: Theme.spacing.lg,
    backgroundColor: Theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  headerTitle: {
    fontFamily: Theme.typography.fontFamily.monoSemiBold,
    fontSize: Theme.typography.fontSize.xl,
    color: Theme.colors.keyword,
    marginBottom: Theme.spacing.xs,
  },
  headerSubtitle: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.comment,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Theme.layout.screenPadding,
    paddingBottom: Theme.spacing.xxl,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
    marginTop: Theme.spacing.xl,
  },
  button: {
    flex: 1,
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 2,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  cancelButton: {
    backgroundColor: Theme.colors.surface,
    borderColor: Theme.colors.border,
  },
  submitButton: {
    backgroundColor: Theme.colors.success + '20',
    borderColor: Theme.colors.success,
  },
  buttonText: {
    fontFamily: Theme.typography.fontFamily.monoSemiBold,
    fontSize: Theme.typography.fontSize.md,
    marginBottom: Theme.spacing.xs,
  },
  cancelButtonText: {
    color: Theme.colors.textSecondary,
  },
  submitButtonText: {
    color: Theme.colors.success,
  },
  buttonSubtext: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.comment,
  },
});
