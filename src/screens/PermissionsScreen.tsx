import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import LottieView from 'lottie-react-native';
import { Theme } from '../constants';
import { useThemeStore } from '../stores/themeStore';
import { StorageService } from '../services/storage';
import { StorageKeys } from '../services/storageKeys';

interface PermissionsScreenProps {
  onComplete: () => void;
}

export const PermissionsScreen: React.FC<PermissionsScreenProps> = ({ onComplete }) => {
  const { getThemeColors } = useThemeStore();
  const colors = getThemeColors();

  const [notificationGranted, setNotificationGranted] = useState(false);
  const [filesGranted, setFilesGranted] = useState(false);
  const [requesting, setRequesting] = useState(false);

  const requestNotificationPermission = async () => {
    setRequesting(true);
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      const granted = status === 'granted';
      setNotificationGranted(granted);

      if (granted) {
        await StorageService.setItem(StorageKeys.NOTIFICATION_PERMISSION, 'true');
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    } finally {
      setRequesting(false);
    }
  };

  const requestFilesPermission = async () => {
    setRequesting(true);
    try {
      if (Platform.OS === 'android') {
        // On Android 13+, we'll use document picker which handles permissions automatically
        // For now, just mark as granted since expo-document-picker handles this
        setFilesGranted(true);
        await StorageService.setItem(StorageKeys.FILES_PERMISSION, 'true');
      } else {
        // iOS doesn't require explicit file permissions for document picker
        setFilesGranted(true);
        await StorageService.setItem(StorageKeys.FILES_PERMISSION, 'true');
      }
    } catch (error) {
      console.error('Error with files permission:', error);
    } finally {
      setRequesting(false);
    }
  };

  const handleContinue = async () => {
    // Mark permissions as requested (even if denied)
    await StorageService.setItem(StorageKeys.PERMISSIONS_REQUESTED, 'true');
    onComplete();
  };

  const handleSkip = async () => {
    await StorageService.setItem(StorageKeys.PERMISSIONS_REQUESTED, 'true');
    onComplete();
  };

  const allGranted = notificationGranted && filesGranted;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.primary }]}>{'$ sudo grant-permissions'}</Text>
        <Text style={[styles.subtitle, { color: colors.comment }]}>
          {'// Required for full app functionality'}
        </Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Notifications Permission */}
        <View
          style={[
            styles.permissionCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.permissionHeader}>
            <View style={styles.permissionIcon}>
              <LottieView
                source={require('../../assets/icons8-notification-bell (1).json')}
                autoPlay
                loop
                style={styles.lottieIcon}
                colorFilters={[
                  {
                    keypath: '*',
                    color: colors.primary,
                  },
                ]}
              />
            </View>
            <View style={styles.permissionInfo}>
              <Text style={[styles.permissionTitle, { color: colors.textPrimary }]}>
                Notifications
              </Text>
              <Text style={[styles.permissionDesc, { color: colors.textSecondary }]}>
                Get reminders for tasks and timer alerts
              </Text>
            </View>
            {notificationGranted && (
              <Text style={[styles.grantedBadge, { color: colors.success }]}>✓</Text>
            )}
          </View>

          {!notificationGranted && (
            <TouchableOpacity
              style={[
                styles.grantButton,
                { backgroundColor: colors.primary, borderColor: colors.primary },
              ]}
              onPress={requestNotificationPermission}
              disabled={requesting}
            >
              <Text style={[styles.grantButtonText, { color: '#000000' }]}>
                {requesting ? 'Requesting...' : 'Grant Permission'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Files Permission */}
        <View
          style={[
            styles.permissionCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.permissionHeader}>
            <View style={styles.permissionIcon}>
              <LottieView
                source={require('../../assets/icons8-file.json')}
                autoPlay
                loop
                style={styles.lottieIcon}
                colorFilters={[
                  {
                    keypath: '*',
                    color: colors.primary,
                  },
                ]}
              />
            </View>
            <View style={styles.permissionInfo}>
              <Text style={[styles.permissionTitle, { color: colors.textPrimary }]}>
                File Access
              </Text>
              <Text style={[styles.permissionDesc, { color: colors.textSecondary }]}>
                Attach files and documents to your tasks
              </Text>
            </View>
            {filesGranted && (
              <Text style={[styles.grantedBadge, { color: colors.success }]}>✓</Text>
            )}
          </View>

          {!filesGranted && (
            <TouchableOpacity
              style={[
                styles.grantButton,
                { backgroundColor: colors.primary, borderColor: colors.primary },
              ]}
              onPress={requestFilesPermission}
              disabled={requesting}
            >
              <Text style={[styles.grantButtonText, { color: '#000000' }]}>
                {requesting ? 'Granting...' : 'Grant Permission'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Info Box */}
        <View
          style={[
            styles.infoBox,
            { backgroundColor: colors.primary + '15', borderColor: colors.primary + '40' },
          ]}
        >
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            💡 You can change these permissions anytime in your device settings
          </Text>
        </View>
      </View>

      {/* Footer Actions */}
      <View style={styles.footer}>
        {allGranted ? (
          <TouchableOpacity
            style={[styles.continueButton, { backgroundColor: colors.success }]}
            onPress={handleContinue}
          >
            <Text style={[styles.continueButtonText, { color: '#000000' }]}>Continue</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.skipButton, { borderColor: colors.border }]}
              onPress={handleSkip}
            >
              <Text style={[styles.skipButtonText, { color: colors.comment }]}>Skip for now</Text>
            </TouchableOpacity>

            {(notificationGranted || filesGranted) && (
              <TouchableOpacity
                style={[
                  styles.partialContinueButton,
                  { backgroundColor: colors.primary + '40', borderColor: colors.primary },
                ]}
                onPress={handleContinue}
              >
                <Text style={[styles.partialContinueButtonText, { color: colors.textPrimary }]}>
                  Continue with partial access
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 80,
    paddingHorizontal: Theme.layout.screenPadding,
    paddingBottom: Theme.spacing.xl,
  },
  title: {
    fontSize: 28,
    fontFamily: Theme.typography.fontFamily.monoSemiBold,
    marginBottom: Theme.spacing.sm,
  },
  subtitle: {
    fontSize: Theme.typography.fontSize.md,
    fontFamily: Theme.typography.fontFamily.mono,
  },
  content: {
    flex: 1,
    paddingHorizontal: Theme.layout.screenPadding,
  },
  permissionCard: {
    borderWidth: 2,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
  },
  permissionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  permissionIcon: {
    width: 50,
    height: 50,
    marginRight: Theme.spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottieIcon: {
    width: 50,
    height: 50,
  },
  permissionInfo: {
    flex: 1,
  },
  permissionTitle: {
    fontSize: Theme.typography.fontSize.lg,
    fontFamily: Theme.typography.fontFamily.monoSemiBold,
    marginBottom: Theme.spacing.xs,
  },
  permissionDesc: {
    fontSize: Theme.typography.fontSize.sm,
    fontFamily: Theme.typography.fontFamily.mono,
    lineHeight: 20,
  },
  grantedBadge: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  grantButton: {
    borderRadius: Theme.borderRadius.md,
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
  },
  grantButtonText: {
    fontSize: Theme.typography.fontSize.md,
    fontFamily: Theme.typography.fontFamily.monoSemiBold,
  },
  infoBox: {
    borderWidth: 1,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    marginTop: Theme.spacing.lg,
  },
  infoText: {
    fontSize: Theme.typography.fontSize.sm,
    fontFamily: Theme.typography.fontFamily.mono,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: Theme.layout.screenPadding,
    paddingBottom: Theme.spacing.xxl,
    gap: Theme.spacing.md,
  },
  continueButton: {
    borderRadius: Theme.borderRadius.md,
    paddingVertical: Theme.spacing.lg,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: Theme.typography.fontSize.lg,
    fontFamily: Theme.typography.fontFamily.monoSemiBold,
  },
  skipButton: {
    borderWidth: 2,
    borderRadius: Theme.borderRadius.md,
    paddingVertical: Theme.spacing.md,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: Theme.typography.fontSize.md,
    fontFamily: Theme.typography.fontFamily.mono,
  },
  partialContinueButton: {
    borderWidth: 2,
    borderRadius: Theme.borderRadius.md,
    paddingVertical: Theme.spacing.md,
    alignItems: 'center',
  },
  partialContinueButtonText: {
    fontSize: Theme.typography.fontSize.md,
    fontFamily: Theme.typography.fontFamily.monoSemiBold,
  },
});
