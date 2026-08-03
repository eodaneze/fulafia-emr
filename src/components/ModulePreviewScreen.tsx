import { Ionicons } from '@expo/vector-icons';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  colors,
  radius,
  spacing,
  typography,
} from '@/src/theme';

type ModuleFeature = {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
};

type ModulePreviewScreenProps = {
  eyebrow: string;
  title: string;
  description: string;
  features: ModuleFeature[];
};

export function ModulePreviewScreen({
  eyebrow,
  title,
  description,
  features,
}: ModulePreviewScreenProps) {
  return (
    <SafeAreaView edges={['bottom']} style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.heroBadge}>
            <View style={styles.heroDot} />

            <Text style={styles.heroBadgeText}>
              {eyebrow}
            </Text>
          </View>

          <Text style={styles.title}>{title}</Text>

          <Text style={styles.description}>
            {description}
          </Text>
        </View>

        <View style={styles.featureList}>
          {features.map((feature) => (
            <View key={feature.title} style={styles.feature}>
              <View style={styles.featureIcon}>
                <Ionicons
                  color={colors.primary}
                  name={feature.icon}
                  size={23}
                />
              </View>

              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>
                  {feature.title}
                </Text>

                <Text style={styles.featureDescription}>
                  {feature.description}
                </Text>
              </View>

              <Ionicons
                color={colors.textMuted}
                name="chevron-forward"
                size={20}
              />
            </View>
          ))}
        </View>

        <View style={styles.previewNotice}>
          <Ionicons
            color={colors.warning}
            name="construct-outline"
            size={23}
          />

          <View style={styles.previewNoticeText}>
            <Text style={styles.previewNoticeTitle}>
              Prototype module
            </Text>

            <Text style={styles.previewNoticeDescription}>
              This area is currently presenting the proposed
              design. Its complete workflow will be implemented
              in the next development stages.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    padding: spacing.screenHorizontal,
    paddingBottom: spacing.massive,
  },

  hero: {
    padding: spacing.xl,
    borderRadius: radius.xl,
    backgroundColor: colors.primaryDark,
  },

  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  heroDot: {
    width: 7,
    height: 7,
    borderRadius: radius.round,
    backgroundColor: colors.secondary,
  },

  heroBadgeText: {
    color: colors.secondary,
    fontSize: 10,
    fontWeight: typography.weight.extraBold,
    letterSpacing: 1.3,
  },

  title: {
    marginTop: spacing.lg,
    color: colors.textOnPrimary,
    fontSize: typography.size.screenTitle,
    lineHeight: typography.lineHeight.screenTitle,
    fontWeight: typography.weight.extraBold,
  },

  description: {
    marginTop: spacing.md,
    color: 'rgba(255,255,255,0.68)',
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
  },

  featureList: {
    gap: spacing.md,
    marginTop: spacing.xxl,
  },

  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },

  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },

  featureText: {
    flex: 1,
    marginHorizontal: spacing.md,
  },

  featureTitle: {
    color: colors.textPrimary,
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
  },

  featureDescription: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },

  previewNotice: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xxl,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.warningSoft,
  },

  previewNoticeText: {
    flex: 1,
  },

  previewNoticeTitle: {
    color: colors.textPrimary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.bold,
  },

  previewNoticeDescription: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },
});