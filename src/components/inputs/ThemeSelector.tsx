import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { ThemeName, ThemeInfoList } from '../../constants/themes';
import { useThemeStore } from '../../stores/themeStore';
import { Theme } from '../../constants';

export const ThemeSelector: React.FC = () => {
  const { currentTheme, setTheme, getThemeColors } = useThemeStore();
  const colors = getThemeColors();

  const handleThemeSelect = async (themeName: ThemeName) => {
    await setTheme(themeName);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.textPrimary }]}>
        {'<Theme theme="'}
        <Text style={{ color: colors.keyword }}>{currentTheme}</Text>
        {'" />'}
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.themesContainer}
      >
        {ThemeInfoList.map((theme) => (
          <TouchableOpacity
            key={theme.name}
            style={[
              styles.themeCard,
              {
                backgroundColor: colors.cardBackground,
                borderColor: currentTheme === theme.name ? colors.primary : colors.border,
                borderWidth: currentTheme === theme.name ? 2 : 1,
              },
            ]}
            onPress={() => handleThemeSelect(theme.name)}
            activeOpacity={0.7}
          >
            {/* Theme Name */}
            <Text style={[styles.themeName, { color: colors.textPrimary }]}>
              {theme.displayName}
            </Text>

            {/* Theme Description */}
            <Text style={[styles.themeDescription, { color: colors.textSecondary }]}>
              {theme.description}
            </Text>

            {/* Color Preview */}
            <View style={styles.colorPreview}>
              {theme.previewColors.map((color, index) => (
                <View key={index} style={[styles.colorBlock, { backgroundColor: color }]} />
              ))}
            </View>

            {/* Selected Indicator */}
            {currentTheme === theme.name && (
              <View style={[styles.selectedBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.selectedText}>✓ Active</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Theme Info */}
      <View style={[styles.infoContainer, { backgroundColor: colors.surface }]}>
        <Text style={[styles.infoText, { color: colors.comment }]}>
          // Theme persisted to AsyncStorage
        </Text>
        <Text style={[styles.infoText, { color: colors.comment }]}>
          // Applies immediately across all screens
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Theme.spacing.md,
  },
  label: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.md,
    marginBottom: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.md,
  },
  themesContainer: {
    paddingHorizontal: Theme.spacing.md,
    gap: Theme.spacing.md,
  },
  themeCard: {
    width: 200,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    marginRight: Theme.spacing.sm,
  },
  themeName: {
    fontFamily: Theme.typography.fontFamily.monoSemiBold,
    fontSize: Theme.typography.fontSize.md,
    marginBottom: Theme.spacing.xs,
  },
  themeDescription: {
    fontFamily: Theme.typography.fontFamily.regular,
    fontSize: Theme.typography.fontSize.sm,
    marginBottom: Theme.spacing.md,
    lineHeight: 18,
  },
  colorPreview: {
    flexDirection: 'row',
    gap: Theme.spacing.xs,
    marginBottom: Theme.spacing.sm,
  },
  colorBlock: {
    width: 40,
    height: 24,
    borderRadius: Theme.borderRadius.sm,
  },
  selectedBadge: {
    position: 'absolute',
    top: Theme.spacing.sm,
    right: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.sm,
  },
  selectedText: {
    fontFamily: Theme.typography.fontFamily.monoMedium,
    fontSize: Theme.typography.fontSize.xs,
    color: '#000',
  },
  infoContainer: {
    marginTop: Theme.spacing.md,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    marginHorizontal: Theme.spacing.md,
  },
  infoText: {
    fontFamily: Theme.typography.fontFamily.mono,
    fontSize: Theme.typography.fontSize.sm,
    lineHeight: 20,
  },
});
