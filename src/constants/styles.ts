import { StyleSheet } from 'react-native';
import Theme from './themes';

/**
 * Common reusable styles for the application
 */

export const CommonStyles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  screenContainer: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    padding: Theme.layout.screenPadding,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.background,
  },

  // Card styles
  card: {
    backgroundColor: Theme.colors.cardBackground,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.layout.cardPadding,
    ...Theme.shadows.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },

  // Text styles
  textPrimary: {
    color: Theme.colors.textPrimary,
    fontSize: Theme.typography.fontSize.md,
  },
  textSecondary: {
    color: Theme.colors.textSecondary,
    fontSize: Theme.typography.fontSize.sm,
  },
  textMono: {
    fontFamily: Theme.typography.fontFamily.mono,
  },

  // Heading styles
  h1: {
    color: Theme.colors.textPrimary,
    fontSize: Theme.typography.fontSize.xxxl,
    lineHeight: Theme.typography.fontSize.xxxl * Theme.typography.lineHeight.tight,
  },
  h2: {
    color: Theme.colors.textPrimary,
    fontSize: Theme.typography.fontSize.xxl,
    lineHeight: Theme.typography.fontSize.xxl * Theme.typography.lineHeight.tight,
  },
  h3: {
    color: Theme.colors.textPrimary,
    fontSize: Theme.typography.fontSize.xl,
    lineHeight: Theme.typography.fontSize.xl * Theme.typography.lineHeight.normal,
  },
  h4: {
    color: Theme.colors.textPrimary,
    fontSize: Theme.typography.fontSize.lg,
    lineHeight: Theme.typography.fontSize.lg * Theme.typography.lineHeight.normal,
  },

  // Button styles
  button: {
    backgroundColor: Theme.colors.buttonPrimary,
    borderRadius: Theme.borderRadius.md,
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...Theme.shadows.sm,
  },
  buttonText: {
    color: Theme.colors.textPrimary,
    fontSize: Theme.typography.fontSize.md,
  },
  buttonSecondary: {
    backgroundColor: Theme.colors.buttonSecondary,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },

  // Input styles
  input: {
    backgroundColor: Theme.colors.inputBackground,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.md,
    color: Theme.colors.textPrimary,
    fontSize: Theme.typography.fontSize.md,
  },
  inputFocused: {
    borderColor: Theme.colors.primary,
  },
  inputMono: {
    fontFamily: Theme.typography.fontFamily.mono,
  },

  // Layout utilities
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  column: {
    flexDirection: 'column',
  },

  // Spacing utilities
  mt4: { marginTop: Theme.spacing.xs },
  mt8: { marginTop: Theme.spacing.sm },
  mt16: { marginTop: Theme.spacing.md },
  mt24: { marginTop: Theme.spacing.lg },
  mt32: { marginTop: Theme.spacing.xl },

  mb4: { marginBottom: Theme.spacing.xs },
  mb8: { marginBottom: Theme.spacing.sm },
  mb16: { marginBottom: Theme.spacing.md },
  mb24: { marginBottom: Theme.spacing.lg },
  mb32: { marginBottom: Theme.spacing.xl },

  ml4: { marginLeft: Theme.spacing.xs },
  ml8: { marginLeft: Theme.spacing.sm },
  ml16: { marginLeft: Theme.spacing.md },
  ml24: { marginLeft: Theme.spacing.lg },

  mr4: { marginRight: Theme.spacing.xs },
  mr8: { marginRight: Theme.spacing.sm },
  mr16: { marginRight: Theme.spacing.md },
  mr24: { marginRight: Theme.spacing.lg },

  p4: { padding: Theme.spacing.xs },
  p8: { padding: Theme.spacing.sm },
  p16: { padding: Theme.spacing.md },
  p24: { padding: Theme.spacing.lg },

  // Shadow utilities
  shadowSm: Theme.shadows.sm,
  shadowMd: Theme.shadows.md,
  shadowLg: Theme.shadows.lg,
  shadowXl: Theme.shadows.xl,

  // Border utilities
  borderRadius: { borderRadius: Theme.borderRadius.md },
  borderRadiusSm: { borderRadius: Theme.borderRadius.sm },
  borderRadiusLg: { borderRadius: Theme.borderRadius.lg },

  // Code/Terminal styles
  codeBlock: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.textPrimary,
  },
  terminalLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.xs,
  },
  terminalPrompt: {
    color: Theme.colors.keyword,
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
    marginRight: Theme.spacing.sm,
  },
  terminalText: {
    color: Theme.colors.textPrimary,
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
  },
});

export default CommonStyles;
