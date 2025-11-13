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
  TextInput,
} from 'react-native';
import { Theme } from '../constants';
import { useTaskStore } from '../stores';
import { TaskPriority, TaskCategory, SubTask, CodeSnippet } from '../types';
import {
  CodeInput,
  PrioritySelector,
  CategorySelector,
  DatePicker,
  TagInput,
  CodeSnippetInput,
  TimeInput,
  DependencySelector,
  ReminderSelector,
} from '../components/inputs';
import { SubtaskItem } from '../components/tasks';

interface TaskFormScreenProps {
  taskId?: string;
  initialDate?: Date;
  onClose: () => void;
}

export const TaskFormScreen: React.FC<TaskFormScreenProps> = ({ taskId, initialDate, onClose }) => {
  const addTask = useTaskStore((state) => state.addTask);
  const updateTask = useTaskStore((state) => state.updateTask);
  const getTaskById = useTaskStore((state) => state.getTaskById);
  const tasks = useTaskStore((state) => state.tasks);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [category, setCategory] = useState<TaskCategory>('coding');
  const [dueDate, setDueDate] = useState<Date | undefined>(initialDate);
  const [reminderDate, setReminderDate] = useState<Date | undefined>();
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [codeSnippet, setCodeSnippet] = useState<CodeSnippet | undefined>();
  const [estimatedTime, setEstimatedTime] = useState<number | undefined>();
  const [dependencies, setDependencies] = useState<string[]>([]);
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
        setReminderDate(task.reminder);
        setReminderEnabled(task.reminderEnabled || false);
        setTags(task.tags || []);
        setSubtasks(task.subtasks || []);
        setCodeSnippet(task.codeSnippet);
        setEstimatedTime(task.estimatedTime);
        setDependencies(task.dependencies || []);
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
        reminder: reminderEnabled ? reminderDate : undefined,
        reminderEnabled,
        tags,
        subtasks,
        codeSnippet,
        estimatedTime,
        dependencies,
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

        {/* Reminder */}
        <ReminderSelector
          dueDate={dueDate}
          reminderDate={reminderDate}
          reminderEnabled={reminderEnabled}
          onReminderChange={(date, enabled) => {
            setReminderDate(date);
            setReminderEnabled(enabled);
          }}
        />

        {/* Tags */}
        <TagInput
          label='// Tags: const tags = ["tag1", "tag2"];'
          tags={tags}
          onTagsChange={setTags}
          placeholder="Type tag and press Enter..."
        />

        {/* Subtasks */}
        <View style={styles.subtasksSection}>
          <Text style={styles.subtasksLabel}>// Subtasks: const subtasks = [];</Text>

          {/* Subtask list */}
          {subtasks.map((subtask) => (
            <SubtaskItem
              key={subtask.id}
              subtask={subtask}
              onToggle={(id) => {
                setSubtasks(
                  subtasks.map((st) => (st.id === id ? { ...st, completed: !st.completed } : st))
                );
              }}
              onRemove={(id) => {
                setSubtasks(subtasks.filter((st) => st.id !== id));
              }}
              isEditing={true}
            />
          ))}

          {/* Add subtask input */}
          <View style={styles.addSubtaskContainer}>
            <TextInput
              style={styles.addSubtaskInput}
              value={newSubtaskTitle}
              onChangeText={setNewSubtaskTitle}
              placeholder="+ Add subtask..."
              placeholderTextColor={Theme.colors.comment}
              onSubmitEditing={() => {
                if (newSubtaskTitle.trim()) {
                  setSubtasks([
                    ...subtasks,
                    {
                      id: Date.now().toString(),
                      title: newSubtaskTitle.trim(),
                      completed: false,
                    },
                  ]);
                  setNewSubtaskTitle('');
                }
              }}
            />
          </View>
        </View>

        {/* Code Snippet */}
        <CodeSnippetInput
          label='// Code Snippet: const snippet = { code: "", language: "" };'
          value={codeSnippet}
          onChange={setCodeSnippet}
          placeholder="// Add code snippet..."
        />

        {/* Estimated Time */}
        <TimeInput
          label="// Estimated Time: const duration = 60; // minutes"
          value={estimatedTime}
          onChange={setEstimatedTime}
          placeholder="0"
        />

        {/* Dependencies */}
        <DependencySelector
          label='// Dependencies: const blockedBy = ["task1", "task2"];'
          selectedIds={dependencies}
          currentTaskId={taskId}
          availableTasks={tasks}
          onSelectionChange={setDependencies}
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
  subtasksSection: {
    marginTop: Theme.spacing.lg,
  },
  subtasksLabel: {
    fontFamily: Theme.typography.fontFamily.monoSemiBold,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.keyword,
    marginBottom: Theme.spacing.md,
  },
  addSubtaskContainer: {
    marginTop: Theme.spacing.sm,
  },
  addSubtaskInput: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.md,
    color: Theme.colors.textPrimary,
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
  },
});
