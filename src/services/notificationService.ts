import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  private permissionGranted: boolean = false;

  /**
   * Request notification permissions from the user
   * @returns Promise<boolean> - true if permission granted, false otherwise
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Only request if not already granted
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      this.permissionGranted = finalStatus === 'granted';

      if (!this.permissionGranted) {
        console.warn('Notification permission not granted');
      }

      return this.permissionGranted;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  /**
   * Check if notification permissions are granted
   * @returns Promise<boolean>
   */
  async hasPermission(): Promise<boolean> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      this.permissionGranted = status === 'granted';
      return this.permissionGranted;
    } catch (error) {
      console.error('Error checking notification permissions:', error);
      return false;
    }
  }

  /**
   * Configure notification channels for Android
   * On Android 8.0+, notification channels are required
   */
  async configureNotificationChannels(): Promise<void> {
    if (Platform.OS === 'android') {
      try {
        // Channel for task reminders
        await Notifications.setNotificationChannelAsync('task-reminders', {
          name: 'Task Reminders',
          description: 'Notifications for task due dates and reminders',
          importance: Notifications.AndroidImportance.HIGH,
          sound: 'default',
          vibrationPattern: [0, 250, 250, 250],
          enableLights: true,
          lightColor: '#007ACC', // VS Code blue
          enableVibrate: true,
        });

        // Channel for daily summaries
        await Notifications.setNotificationChannelAsync('daily-summary', {
          name: 'Daily Summary',
          description: 'Daily task summaries and reviews',
          importance: Notifications.AndroidImportance.DEFAULT,
          sound: 'default',
          vibrationPattern: [0, 250, 250],
          enableLights: true,
          lightColor: '#007ACC',
        });

        // Channel for streak notifications
        await Notifications.setNotificationChannelAsync('streaks', {
          name: 'Streaks & Achievements',
          description: 'Notifications for streaks and milestones',
          importance: Notifications.AndroidImportance.DEFAULT,
          sound: 'default',
          vibrationPattern: [0, 250],
          enableLights: true,
          lightColor: '#4EC9B0', // Success color
        });

        // Channel for overdue tasks
        await Notifications.setNotificationChannelAsync('overdue-tasks', {
          name: 'Overdue Tasks',
          description: 'Alerts for overdue tasks',
          importance: Notifications.AndroidImportance.HIGH,
          sound: 'default',
          vibrationPattern: [0, 500, 250, 500],
          enableLights: true,
          lightColor: '#F48771', // Error/warning color
          enableVibrate: true,
        });

        console.log('✓ Notification channels configured');
      } catch (error) {
        console.error('Error configuring notification channels:', error);
      }
    }
  }

  /**
   * Schedule a local notification
   * @param title - Notification title
   * @param body - Notification body
   * @param trigger - When to trigger the notification
   * @param data - Additional data to include
   * @param channelId - Android notification channel ID
   * @returns Promise<string> - Notification identifier
   */
  async scheduleNotification(
    title: string,
    body: string,
    trigger: Notifications.NotificationTriggerInput,
    data?: Record<string, any>,
    channelId: string = 'task-reminders'
  ): Promise<string | null> {
    try {
      const hasPermission = await this.hasPermission();

      if (!hasPermission) {
        const granted = await this.requestPermissions();
        if (!granted) {
          console.warn('Cannot schedule notification: permission denied');
          return null;
        }
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          ...(Platform.OS === 'android' && { channelId }),
        },
        trigger,
      });

      console.log('✓ Notification scheduled:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }

  /**
   * Cancel a scheduled notification
   * @param notificationId - ID of the notification to cancel
   */
  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log('✓ Notification cancelled:', notificationId);
    } catch (error) {
      console.error('Error cancelling notification:', error);
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('✓ All notifications cancelled');
    } catch (error) {
      console.error('Error cancelling all notifications:', error);
    }
  }

  /**
   * Get all scheduled notifications
   * @returns Promise<Notifications.NotificationRequest[]>
   */
  async getAllScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  /**
   * Send an immediate notification (for testing)
   * @param title - Notification title
   * @param body - Notification body
   * @param data - Additional data
   * @param channelId - Android notification channel ID
   */
  async sendImmediateNotification(
    title: string,
    body: string,
    data?: Record<string, any>,
    channelId: string = 'task-reminders'
  ): Promise<void> {
    try {
      // Use null trigger for immediate delivery
      await this.scheduleNotification(title, body, null as any, data, channelId);
    } catch (error) {
      console.log(
        'Notification scheduling failed:',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Add a notification received listener
   * This fires when a notification is received while the app is foregrounded
   */
  addNotificationReceivedListener(
    listener: (notification: Notifications.Notification) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(listener);
  }

  /**
   * Add a notification response listener
   * This fires when a user taps on a notification
   */
  addNotificationResponseListener(
    listener: (response: Notifications.NotificationResponse) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(listener);
  }

  /**
   * Initialize the notification service
   * Call this on app startup
   */
  async initialize(): Promise<boolean> {
    try {
      console.log('⚙️  Initializing notification service...');

      // Configure notification channels (Android)
      await this.configureNotificationChannels();

      // Check/request permissions
      const hasPermission = await this.hasPermission();

      if (!hasPermission) {
        console.log('📱 Notification permissions not granted yet');
      } else {
        console.log('✓ Notification permissions granted');
      }

      console.log('✓ Notification service initialized');
      return true;
    } catch (error) {
      console.error('Error initializing notification service:', error);
      // Don't fail app initialization if notifications fail
      return true;
    }
  }

  /**
   * Schedule a task reminder notification
   * @param task - The task to schedule reminder for
   * @returns notificationId or null if failed
   */
  async scheduleTaskReminder(task: {
    id: string;
    title: string;
    dueDate?: Date;
    reminder?: Date;
  }): Promise<string | null> {
    if (!task.reminder) {
      console.warn('No reminder date set for task:', task.id);
      return null;
    }

    const now = new Date();
    if (task.reminder <= now) {
      console.warn('Reminder date is in the past:', task.reminder);
      return null;
    }

    const title = '⏰ Task Reminder';
    const body = `"${task.title}" is due ${task.dueDate ? 'on ' + task.dueDate.toLocaleDateString() : 'soon'}`;

    return await this.scheduleNotification(
      title,
      body,
      { date: task.reminder, channelId: 'task-reminders' } as any,
      { taskId: task.id, type: 'reminder' },
      'task-reminders'
    );
  }

  /**
   * Cancel a task reminder notification
   * @param notificationId - ID of the notification to cancel
   */
  async cancelTaskReminder(notificationId: string): Promise<void> {
    await this.cancelNotification(notificationId);
  }

  /**
   * Reschedule a task reminder
   * @param oldNotificationId - Old notification ID to cancel
   * @param task - Task with new reminder date
   * @returns new notificationId or null
   */
  async rescheduleTaskReminder(
    oldNotificationId: string,
    task: { id: string; title: string; dueDate?: Date; reminder?: Date }
  ): Promise<string | null> {
    await this.cancelTaskReminder(oldNotificationId);
    return await this.scheduleTaskReminder(task);
  }

  /**
   * Schedule daily summary notification
   * @param time - Time in "HH:MM" format
   * @param stats - Daily statistics
   */
  async scheduleDailySummary(
    time: string,
    stats: { pending: number; completed: number; inProgress: number }
  ): Promise<string | null> {
    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();
    const scheduledDate = new Date(now);
    scheduledDate.setHours(hours, minutes, 0, 0);

    // If time has passed today, schedule for tomorrow
    if (scheduledDate <= now) {
      scheduledDate.setDate(scheduledDate.getDate() + 1);
    }

    const title = '📊 Daily Summary';
    const body = `${stats.completed} completed, ${stats.pending} pending, ${stats.inProgress} in progress`;

    return await this.scheduleNotification(
      title,
      body,
      { date: scheduledDate, channelId: 'daily-summary' } as any,
      { type: 'daily-summary', stats },
      'daily-summary'
    );
  }

  /**
   * Send streak milestone notification
   * @param streak - Current streak count
   */
  async sendStreakNotification(streak: number): Promise<void> {
    const messages = [
      '🔥 3 days strong! Keep it up!',
      '🔥 One week streak! You are on fire!',
      '🔥 14 days! Two weeks of productivity!',
      '🔥 30 days! A month of consistency!',
      '🔥 50 days! Halfway to 100!',
      '🔥 100 days! Century milestone reached!',
    ];

    let message = '🔥 Keep your streak going!';
    if (streak === 3) message = messages[0];
    else if (streak === 7) message = messages[1];
    else if (streak === 14) message = messages[2];
    else if (streak === 30) message = messages[3];
    else if (streak === 50) message = messages[4];
    else if (streak === 100) message = messages[5];
    else if (streak % 10 === 0 && streak > 0) message = `🔥 ${streak} day streak! Amazing!`;

    await this.sendImmediateNotification(
      `${streak} Day Streak`,
      message,
      { type: 'streak', streak },
      'streaks'
    );
  }

  /**
   * Check and send overdue task alerts
   * @param overdueTasks - Array of overdue tasks
   */
  async sendOverdueAlert(
    overdueTasks: Array<{ id: string; title: string; dueDate: Date }>
  ): Promise<void> {
    if (overdueTasks.length === 0) return;

    const title = '⚠️ Overdue Tasks';
    const body =
      overdueTasks.length === 1
        ? `"${overdueTasks[0].title}" is overdue`
        : `You have ${overdueTasks.length} overdue tasks`;

    await this.sendImmediateNotification(
      title,
      body,
      { type: 'overdue', taskIds: overdueTasks.map((t) => t.id) },
      'overdue-tasks'
    );
  }

  /**
   * Send upcoming deadline warning
   * @param task - Task with upcoming deadline
   * @param hoursUntilDue - Hours until task is due
   */
  async sendDeadlineWarning(
    task: { id: string; title: string; dueDate: Date },
    hoursUntilDue: number
  ): Promise<void> {
    const title = '📅 Upcoming Deadline';
    const timeText =
      hoursUntilDue < 1
        ? 'in less than an hour'
        : hoursUntilDue === 1
          ? 'in 1 hour'
          : `in ${Math.floor(hoursUntilDue)} hours`;

    const body = `"${task.title}" is due ${timeText}`;

    await this.sendImmediateNotification(
      title,
      body,
      { type: 'deadline', taskId: task.id, hoursUntilDue },
      'task-reminders'
    );
  }

  /**
   * Send weekly productivity summary
   * @param stats - Weekly statistics
   */
  async sendWeeklySummary(stats: {
    completed: number;
    created: number;
    topCategory: string;
    totalTime: number;
  }): Promise<void> {
    const title = '📈 Weekly Summary';
    const body = `${stats.completed} tasks completed this week. Top category: ${stats.topCategory}`;

    await this.sendImmediateNotification(
      title,
      body,
      { type: 'weekly-summary', stats },
      'daily-summary'
    );
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
