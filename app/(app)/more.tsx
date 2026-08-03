import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  Alert,
  Pressable,
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

type MenuRoute =
  | '/(app)/reports'
  | '/(app)/settings';

type MenuItemProps = {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  badge?: string;
  danger?: boolean;
};

export default function MoreScreen() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  if (!user) {
    return null;
  }

  const role = getRoleOption(user.role);

  const initials = user.fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

  const navigateTo = (route: MenuRoute) => {
    router.push(route);
  };

  const showComingSoon = (moduleName: string) => {
    Alert.alert(
      moduleName,
      `${moduleName} will be completed as part of the full hospital implementation.`,
    );
  };

  const confirmLogout = () => {
    Alert.alert(
      'Sign out',
      'Are you sure you want to end your hospital session?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileCard}>
          <View style={styles.profileTop}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {initials}
              </Text>
            </View>

            <View style={styles.profileDetails}>
              <Text
                numberOfLines={1}
                style={styles.userName}
              >
                {user.fullName}
              </Text>

              <Text style={styles.userDesignation}>
                {user.designation}
              </Text>

              <Text style={styles.employeeId}>
                {user.employeeId}
              </Text>
            </View>

            <Pressable
              onPress={() => navigateTo('/(app)/settings')}
              style={({ pressed }) => [
                styles.editProfileButton,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                color={colors.primary}
                name="create-outline"
                size={20}
              />
            </Pressable>
          </View>

          <View style={styles.profileMeta}>
            <View style={styles.profileMetaItem}>
              <View style={styles.profileMetaIcon}>
                <Ionicons
                  color={colors.primary}
                  name={role.icon}
                  size={18}
                />
              </View>

              <View>
                <Text style={styles.profileMetaLabel}>
                  Staff role
                </Text>

                <Text style={styles.profileMetaValue}>
                  {role.label}
                </Text>
              </View>
            </View>

            <View style={styles.profileDivider} />

            <View style={styles.profileMetaItem}>
              <View style={styles.profileMetaIcon}>
                <Ionicons
                  color={colors.primary}
                  name="business-outline"
                  size={18}
                />
              </View>

              <View style={styles.departmentText}>
                <Text style={styles.profileMetaLabel}>
                  Department
                </Text>

                <Text
                  numberOfLines={1}
                  style={styles.profileMetaValue}
                >
                  {user.department}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.serverCard}>
          <View style={styles.serverIcon}>
            <Ionicons
              color={colors.success}
              name="server-outline"
              size={24}
            />
          </View>

          <View style={styles.serverDetails}>
            <View style={styles.serverTitleRow}>
              <Text style={styles.serverTitle}>
                Hospital LAN
              </Text>

              <View style={styles.onlineBadge}>
                <View style={styles.onlineDot} />

                <Text style={styles.onlineText}>
                  CONNECTED
                </Text>
              </View>
            </View>

            <Text style={styles.serverDescription}>
              Local server: 192.168.1.50:2028
            </Text>
          </View>

          <Ionicons
            color={colors.success}
            name="checkmark-circle"
            size={24}
          />
        </View>

        <SectionHeader title="Hospital modules" />

        <View style={styles.menuGroup}>
          <MenuItem
            description="Operational and clinical hospital analytics"
            icon="bar-chart-outline"
            onPress={() => navigateTo('/(app)/reports')}
            title="Reports and analytics"
          />

          <MenuDivider />

          <MenuItem
            description="View hospital employees and duty information"
            icon="people-circle-outline"
            onPress={() => showComingSoon('Staff Management')}
            title="Staff management"
          />

          <MenuDivider />

          <MenuItem
            badge="Full version"
            description="Hospital drugs, supplies and equipment"
            icon="cube-outline"
            onPress={() =>
              showComingSoon('Inventory and Equipment')
            }
            title="Inventory and equipment"
          />

          <MenuDivider />

          <MenuItem
            badge="Full version"
            description="Hospital staff and employment records"
            icon="briefcase-outline"
            onPress={() =>
              showComingSoon('Human Resources')
            }
            title="Human resources"
          />
        </View>

        <SectionHeader title="Account and application" />

        <View style={styles.menuGroup}>
          <MenuItem
            description="Profile, security and display preferences"
            icon="settings-outline"
            onPress={() => navigateTo('/(app)/settings')}
            title="Settings"
          />

          <MenuDivider />

          <MenuItem
            description="Review authorized activity performed in the system"
            icon="shield-checkmark-outline"
            onPress={() => showComingSoon('Audit Trail')}
            title="Audit trail"
          />

          <MenuDivider />

          <MenuItem
            description="Information about this hospital application"
            icon="information-circle-outline"
            onPress={() =>
              Alert.alert(
                'FULafia Cottage Hospital EMR',
                'Electronic Medical Records and integrated hospital workflow management system.\n\nPrototype version 1.0.0',
              )
            }
            title="About the system"
          />

          <MenuDivider />

          <MenuItem
            danger
            description="End your current hospital session"
            icon="log-out-outline"
            onPress={confirmLogout}
            title="Sign out"
          />
        </View>

        <View style={styles.securityNotice}>
          <Ionicons
            color={colors.primary}
            name="shield-checkmark"
            size={21}
          />

          <Text style={styles.securityNoticeText}>
            All activities performed with this account are
            timestamped and recorded in the hospital audit
            trail.
          </Text>
        </View>

        <Text style={styles.version}>
          FULafia Cottage Hospital EMR · Prototype v1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <Text style={styles.sectionHeader}>{title}</Text>
  );
}

function MenuDivider() {
  return <View style={styles.menuDivider} />;
}

function MenuItem({
  title,
  description,
  icon,
  onPress,
  badge,
  danger = false,
}: MenuItemProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuItem,
        pressed && styles.pressed,
      ]}
    >
      <View
        style={[
          styles.menuIcon,
          danger && styles.dangerMenuIcon,
        ]}
      >
        <Ionicons
          color={danger ? colors.danger : colors.primary}
          name={icon}
          size={22}
        />
      </View>

      <View style={styles.menuText}>
        <View style={styles.menuTitleRow}>
          <Text
            style={[
              styles.menuTitle,
              danger && styles.dangerMenuTitle,
            ]}
          >
            {title}
          </Text>

          {badge ? (
            <View style={styles.menuBadge}>
              <Text style={styles.menuBadgeText}>
                {badge}
              </Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.menuDescription}>
          {description}
        </Text>
      </View>

      <Ionicons
        color={danger ? colors.danger : colors.textMuted}
        name="chevron-forward"
        size={19}
      />
    </Pressable>
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

  profileCard: {
    padding: spacing.xl,
    borderRadius: radius.xl,
    backgroundColor: colors.primaryDark,
    ...shadows.medium,
  },

  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 62,
    height: 62,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.16)',
  },

  avatarText: {
    color: colors.textOnPrimary,
    fontSize: 20,
    fontWeight: typography.weight.extraBold,
  },

  profileDetails: {
    flex: 1,
    marginLeft: spacing.md,
  },

  userName: {
    color: colors.textOnPrimary,
    fontSize: typography.size.bodyLarge,
    fontWeight: typography.weight.bold,
  },

  userDesignation: {
    marginTop: 3,
    color: colors.secondary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.semibold,
  },

  employeeId: {
    marginTop: 4,
    color: 'rgba(255,255,255,0.52)',
    fontSize: typography.size.caption,
  },

  editProfileButton: {
    width: 42,
    height: 42,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },

  profileMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.12)',
  },

  profileMetaItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  profileMetaIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },

  profileMetaLabel: {
    marginLeft: spacing.sm,
    color: 'rgba(255,255,255,0.48)',
    fontSize: 9,
    fontWeight: typography.weight.semibold,
    textTransform: 'uppercase',
  },

  profileMetaValue: {
    maxWidth: 125,
    marginTop: 2,
    marginLeft: spacing.sm,
    color: colors.textOnPrimary,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.bold,
  },

  departmentText: {
    flex: 1,
  },

  profileDivider: {
    width: 1,
    height: 39,
    marginHorizontal: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },

  serverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#BDE6D2',
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

  serverDetails: {
    flex: 1,
    marginHorizontal: spacing.md,
  },

  serverTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  serverTitle: {
    color: colors.textPrimary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.bold,
  },

  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: radius.round,
    backgroundColor: colors.surface,
  },

  onlineDot: {
    width: 5,
    height: 5,
    borderRadius: radius.round,
    backgroundColor: colors.success,
  },

  onlineText: {
    color: colors.success,
    fontSize: 8,
    fontWeight: typography.weight.extraBold,
  },

  serverDescription: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    fontSize: typography.size.caption,
  },

  sectionHeader: {
    marginTop: spacing.xxxl,
    marginBottom: spacing.md,
    color: colors.textSecondary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.bold,
  },

  menuGroup: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
  },

  menuItem: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },

  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },

  dangerMenuIcon: {
    backgroundColor: colors.dangerSoft,
  },

  menuText: {
    flex: 1,
    marginHorizontal: spacing.md,
  },

  menuTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  menuTitle: {
    color: colors.textPrimary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.bold,
  },

  dangerMenuTitle: {
    color: colors.danger,
  },

  menuDescription: {
    marginTop: 4,
    color: colors.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },

  menuBadge: {
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: radius.round,
    backgroundColor: colors.warningSoft,
  },

  menuBadgeText: {
    color: colors.warning,
    fontSize: 8,
    fontWeight: typography.weight.extraBold,
  },

  menuDivider: {
    height: 1,
    marginLeft: 76,
    backgroundColor: colors.border,
  },

  securityNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginTop: spacing.xxl,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
  },

  securityNoticeText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },

  version: {
    marginTop: spacing.xxl,
    color: colors.textMuted,
    fontSize: 10,
    textAlign: 'center',
  },

  pressed: {
    opacity: 0.66,
  },
});