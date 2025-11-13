import { notificationService } from '../services/notificationService';

/**
 * Test notification delivery
 * Call this function to send a test notification
 */
export async function testNotificationDelivery(): Promise<void> {
  console.log('🧪 Testing notification delivery...');

  // Test 1: Check permissions
  const hasPermission = await notificationService.hasPermission();
  console.log('📱 Has permission:', hasPermission);

  if (!hasPermission) {
    console.log('📱 Requesting permissions...');
    const granted = await notificationService.requestPermissions();
    console.log('📱 Permission granted:', granted);

    if (!granted) {
      console.error('❌ Notification permission denied. Cannot test delivery.');
      return;
    }
  }

  // Test 2: Send immediate test notification
  console.log('📤 Sending test notification...');
  await notificationService.sendImmediateNotification(
    '✓ Test Notification',
    'If you see this, notifications are working! 🎉',
    { test: true, timestamp: Date.now() }
  );

  // Test 3: Schedule a notification for 5 seconds from now
  console.log('⏰ Scheduling test notification for 5 seconds...');
  const notificationId = await notificationService.scheduleNotification(
    '⏰ Scheduled Test',
    'This notification was scheduled 5 seconds ago',
    { date: new Date(Date.now() + 5000), channelId: 'task-reminders' } as any, // 5 seconds from now
    { test: true, scheduled: true }
  );
  console.log('📝 Scheduled notification ID:', notificationId);

  // Test 4: Get all scheduled notifications
  setTimeout(async () => {
    const scheduled = await notificationService.getAllScheduledNotifications();
    console.log('📋 Scheduled notifications:', scheduled.length);
    scheduled.forEach((notif, index) => {
      console.log(`  ${index + 1}. ${notif.content.title}`);
    });
  }, 1000);

  console.log('✓ Notification tests initiated');
  console.log('  - Check your notification tray in 1-2 seconds for the first test');
  console.log('  - A second notification will arrive in ~5 seconds');
}

/**
 * Test all notification channels
 */
export async function testNotificationChannels(): Promise<void> {
  console.log('🧪 Testing all notification channels...');

  const hasPermission = await notificationService.hasPermission();
  if (!hasPermission) {
    const granted = await notificationService.requestPermissions();
    if (!granted) {
      console.error('❌ Permission required to test channels');
      return;
    }
  }

  // Test each channel
  const channels = [
    {
      id: 'task-reminders',
      title: '📌 Task Reminder Test',
      body: 'This is a task reminder notification',
    },
    {
      id: 'daily-summary',
      title: '📊 Daily Summary Test',
      body: 'This is a daily summary notification',
    },
    {
      id: 'streaks',
      title: '🔥 Streak Test',
      body: 'This is a streak notification',
    },
    {
      id: 'overdue-tasks',
      title: '⚠️ Overdue Task Test',
      body: 'This is an overdue task notification',
    },
  ];

  for (let i = 0; i < channels.length; i++) {
    const channel = channels[i];
    setTimeout(async () => {
      console.log(`📤 Testing channel: ${channel.id}`);
      await notificationService.sendImmediateNotification(
        channel.title,
        channel.body,
        { channelTest: true, channelId: channel.id },
        channel.id
      );
    }, i * 2000); // Stagger by 2 seconds
  }

  console.log('✓ Channel tests scheduled');
  console.log('  - You will receive 4 notifications over the next 8 seconds');
}

/**
 * Cancel all test notifications
 */
export async function cancelAllTestNotifications(): Promise<void> {
  console.log('🧹 Cancelling all scheduled notifications...');
  await notificationService.cancelAllNotifications();
  console.log('✓ All notifications cancelled');
}
