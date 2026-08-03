import { Ionicons } from '@expo/vector-icons';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getRoleOption } from '@/src/constants/roles';
import { useAuthStore } from '@/src/store/auth.store';
import {
  colors,
  radius,
  shadows,
  spacing,
  typography,
} from '@/src/theme';

type SummaryCardProps = {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone: 'primary' | 'warning' | 'success' | 'info';
};

const toneStyles = {
  primary: {
    background: colors.primarySoft,
    icon: colors.primary,
  },
  warning: {
    background: colors.warningSoft,
    icon: colors.warning,
  },
  success: {
    background: colors.successSoft,
    icon: colors.success,
  },
  info: {
    background: colors.infoSoft,
    icon: colors.info,
  },
};

export default function DashboardScreen() {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return null;
  }

  const role = getRoleOption(user.role);
  const firstName =
    user.fullName.split(' ').filter(Boolean)[0] ?? 'Staff';

  return (
    <SafeAreaView edges={['bottom']} style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeTopRow}>
            <View style={styles.welcomeText}>
              <Text style={styles.greeting}>
                Good morning, {firstName}
              </Text>

              <Text style={styles.roleText}>
                {role.label} · {user.department}
              </Text>
            </View>

            <View style={styles.roleIcon}>
              <Ionicons
                color={colors.textOnPrimary}
                name={role.icon}
                size={27}
              />
            </View>
          </View>

          <View style={styles.connectionRow}>
            <View style={styles.connectionBadge}>
              <View style={styles.connectionDot} />

              <Text style={styles.connectionText}>
                Hospital LAN connected
              </Text>
            </View>

            <Text style={styles.dateText}>
              Monday, 3 August 2026
            </Text>
          </View>
        </View>

        <View style={styles.sectionHeading}>
          <View>
            <Text style={styles.sectionEyebrow}>
              TODAY'S OVERVIEW
            </Text>

            <Text style={styles.sectionTitle}>
              Hospital activity
            </Text>
          </View>

          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />

            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </View>

        <View style={styles.summaryGrid}>
          <SummaryCard
            icon="people-outline"
            label="Patients today"
            tone="primary"
            value="48"
          />

          <SummaryCard
            icon="time-outline"
            label="Waiting"
            tone="warning"
            value="7"
          />

          <SummaryCard
            icon="flask-outline"
            label="Results ready"
            tone="info"
            value="3"
          />

          <SummaryCard
            icon="checkmark-circle-outline"
            label="Completed"
            tone="success"
            value="22"
          />
        </View>

        <View style={styles.actionCard}>
          <View style={styles.actionHeading}>
            <View>
              <Text style={styles.actionEyebrow}>
                ACTIVE WORKFLOW
              </Text>

              <Text style={styles.actionTitle}>
                Patient care journey
              </Text>
            </View>

            <View style={styles.caseOwnerBadge}>
              <Ionicons
                color={colors.primary}
                name="medical-outline"
                size={16}
              />

              <Text style={styles.caseOwnerText}>
                Doctor owns case
              </Text>
            </View>
          </View>

          <View style={styles.workflow}>
            <WorkflowItem
              active
              icon="folder-open-outline"
              label="Records"
              subtitle="4 waiting"
            />

            <WorkflowConnector />

            <WorkflowItem
              active
              icon="medkit-outline"
              label="Nursing"
              subtitle="2 in progress"
            />

            <WorkflowConnector />

            <WorkflowItem
              active
              icon="medical-outline"
              label="Doctor"
              subtitle="7 waiting"
            />

            <WorkflowConnector />

            <WorkflowItem
              icon="flask-outline"
              label="Laboratory"
              subtitle="3 results ready"
            />
          </View>
        </View>

        <View style={styles.sectionHeading}>
          <View>
            <Text style={styles.sectionEyebrow}>
              REQUIRES ATTENTION
            </Text>

            <Text style={styles.sectionTitle}>
              Priority updates
            </Text>
          </View>

          <Text style={styles.viewAll}>View all</Text>
        </View>

        <View style={styles.attentionList}>
          <AttentionCard
            icon="thermometer-outline"
            subtitle="Temperature: 39.2°C · Waiting 18 minutes"
            title="Ibrahim Musa requires review"
            tone="danger"
          />

          <AttentionCard
            icon="flask-outline"
            subtitle="Malaria Parasite result completed"
            title="Laboratory result is ready"
            tone="info"
          />

          <AttentionCard
            icon="bed-outline"
            subtitle="Male Medical Ward · Bed 08"
            title="Ward patient update received"
            tone="success"
          />
        </View>

        <View style={styles.serverCard}>
          <View style={styles.serverIcon}>
            <Ionicons
              color={colors.success}
              name="server-outline"
              size={25}
            />
          </View>

          <View style={styles.serverText}>
            <Text style={styles.serverTitle}>
              Local hospital server operational
            </Text>

            <Text style={styles.serverDescription}>
              All departments are connected through the
              hospital LAN.
            </Text>
          </View>

          <Ionicons
            color={colors.success}
            name="checkmark-circle"
            size={25}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryCard({
  label,
  value,
  icon,
  tone,
}: SummaryCardProps) {
  const selectedTone = toneStyles[tone];

  return (
    <View style={styles.summaryCard}>
      <View
        style={[
          styles.summaryIcon,
          {
            backgroundColor: selectedTone.background,
          },
        ]}
      >
        <Ionicons
          color={selectedTone.icon}
          name={icon}
          size={22}
        />
      </View>

      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

type WorkflowItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle: string;
  active?: boolean;
};

function WorkflowItem({
  icon,
  label,
  subtitle,
  active = false,
}: WorkflowItemProps) {
  return (
    <View style={styles.workflowItem}>
      <View
        style={[
          styles.workflowIcon,
          active && styles.activeWorkflowIcon,
        ]}
      >
        <Ionicons
          color={
            active
              ? colors.textOnPrimary
              : colors.textSecondary
          }
          name={icon}
          size={19}
        />
      </View>

      <View style={styles.workflowText}>
        <Text style={styles.workflowLabel}>{label}</Text>
        <Text style={styles.workflowSubtitle}>
          {subtitle}
        </Text>
      </View>
    </View>
  );
}

function WorkflowConnector() {
  return (
    <View style={styles.workflowConnector}>
      <View style={styles.connectorLine} />
    </View>
  );
}

type AttentionCardProps = {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone: 'danger' | 'info' | 'success';
};

function AttentionCard({
  title,
  subtitle,
  icon,
  tone,
}: AttentionCardProps) {
  const tones = {
    danger: {
      background: colors.dangerSoft,
      color: colors.danger,
    },
    info: {
      background: colors.infoSoft,
      color: colors.info,
    },
    success: {
      background: colors.successSoft,
      color: colors.success,
    },
  };

  const selectedTone = tones[tone];

  return (
    <View style={styles.attentionCard}>
      <View
        style={[
          styles.attentionIcon,
          {
            backgroundColor: selectedTone.background,
          },
        ]}
      >
        <Ionicons
          color={selectedTone.color}
          name={icon}
          size={22}
        />
      </View>

      <View style={styles.attentionText}>
        <Text style={styles.attentionTitle}>{title}</Text>

        <Text style={styles.attentionSubtitle}>
          {subtitle}
        </Text>
      </View>

      <Ionicons
        color={colors.textMuted}
        name="chevron-forward"
        size={20}
      />
    </View>
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

  welcomeCard: {
    padding: spacing.xl,
    borderRadius: radius.xl,
    backgroundColor: colors.primaryDark,
    ...shadows.medium,
  },

  welcomeTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  welcomeText: {
    flex: 1,
  },

  greeting: {
    color: colors.textOnPrimary,
    fontSize: typography.size.sectionTitle,
    lineHeight: typography.lineHeight.sectionTitle,
    fontWeight: typography.weight.bold,
  },

  roleText: {
    marginTop: spacing.xs,
    color: 'rgba(255,255,255,0.62)',
    fontSize: typography.size.label,
  },

  roleIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },

  connectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.12)',
  },

  connectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  connectionDot: {
    width: 7,
    height: 7,
    borderRadius: radius.round,
    backgroundColor: colors.secondary,
  },

  connectionText: {
    color: colors.secondary,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.bold,
  },

  dateText: {
    color: 'rgba(255,255,255,0.48)',
    fontSize: typography.size.caption,
  },

  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: spacing.xxxl,
    marginBottom: spacing.lg,
  },

  sectionEyebrow: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: typography.weight.extraBold,
    letterSpacing: 1.3,
  },

  sectionTitle: {
    marginTop: spacing.xs,
    color: colors.textPrimary,
    fontSize: typography.size.cardTitle,
    fontWeight: typography.weight.bold,
  },

  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.round,
    backgroundColor: colors.successSoft,
  },

  liveDot: {
    width: 6,
    height: 6,
    borderRadius: radius.round,
    backgroundColor: colors.success,
  },

  liveText: {
    color: colors.success,
    fontSize: 9,
    fontWeight: typography.weight.extraBold,
    letterSpacing: 0.8,
  },

  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },

  summaryCard: {
    width: '47.9%',
    minHeight: 142,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  summaryIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },

  summaryValue: {
    marginTop: spacing.lg,
    color: colors.textPrimary,
    fontSize: 27,
    fontWeight: typography.weight.extraBold,
  },

  summaryLabel: {
    marginTop: 2,
    color: colors.textSecondary,
    fontSize: typography.size.caption,
  },

  actionCard: {
    marginTop: spacing.xxxl,
    padding: spacing.xl,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  actionHeading: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },

  actionEyebrow: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: typography.weight.extraBold,
    letterSpacing: 1.3,
  },

  actionTitle: {
    marginTop: spacing.xs,
    color: colors.textPrimary,
    fontSize: typography.size.cardTitle,
    fontWeight: typography.weight.bold,
  },

  caseOwnerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 7,
    borderRadius: radius.round,
    backgroundColor: colors.primarySoft,
  },

  caseOwnerText: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: typography.weight.bold,
  },

  workflow: {
    marginTop: spacing.xl,
  },

  workflowItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  workflowIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },

  activeWorkflowIcon: {
    backgroundColor: colors.primary,
  },

  workflowText: {
    marginLeft: spacing.md,
  },

  workflowLabel: {
    color: colors.textPrimary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.bold,
  },

  workflowSubtitle: {
    marginTop: 2,
    color: colors.textSecondary,
    fontSize: typography.size.caption,
  },

  workflowConnector: {
    height: 27,
    paddingLeft: 20,
  },

  connectorLine: {
    width: 2,
    height: '100%',
    backgroundColor: colors.border,
  },

  viewAll: {
    color: colors.primary,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.bold,
  },

  attentionList: {
    gap: spacing.md,
  },

  attentionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  attentionIcon: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },

  attentionText: {
    flex: 1,
    marginHorizontal: spacing.md,
  },

  attentionTitle: {
    color: colors.textPrimary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.bold,
  },

  attentionSubtitle: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },

  serverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xxxl,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#BCE5D1',
    backgroundColor: colors.successSoft,
  },

  serverIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },

  serverText: {
    flex: 1,
    marginHorizontal: spacing.md,
  },

  serverTitle: {
    color: colors.textPrimary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.bold,
  },

  serverDescription: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },
});