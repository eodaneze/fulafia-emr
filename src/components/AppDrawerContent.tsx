import { Ionicons } from '@expo/vector-icons';
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
} from '@react-navigation/drawer';
import { router, usePathname } from 'expo-router';
import {
  Alert,
  Pressable,
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
  spacing,
  typography,
} from '@/src/theme';

type MenuItem = {
  label: string;
  route:
    | '/(app)'
    | '/(app)/patients'
    | '/(app)/workflow'
    | '/(app)/notifications'
    | '/(app)/reports'
    | '/(app)/settings';
  icon: keyof typeof Ionicons.glyphMap;
  badge?: number;
};

const menuItems: MenuItem[] = [
  {
    label: 'Dashboard',
    route: '/(app)',
    icon: 'grid-outline',
  },
  {
    label: 'Patients',
    route: '/(app)/patients',
    icon: 'people-outline',
  },
  {
    label: 'Clinical Workflow',
    route: '/(app)/workflow',
    icon: 'git-network-outline',
  },
  {
    label: 'Notifications',
    route: '/(app)/notifications',
    icon: 'notifications-outline',
    badge: 3,
  },
  {
    label: 'Reports',
    route: '/(app)/reports',
    icon: 'bar-chart-outline',
  },
  {
    label: 'Settings',
    route: '/(app)/settings',
    icon: 'settings-outline',
  },
];

export function AppDrawerContent(
  props: DrawerContentComponentProps,
) {
  const pathname = usePathname();
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
    .map((name) => name.charAt(0).toUpperCase())
    .join('');

  const navigateTo = (route: MenuItem['route']) => {
    props.navigation.closeDrawer();
    router.push(route);
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
    <SafeAreaView style={styles.safeArea}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.brand}>
          <View style={styles.brandIcon}>
            <Ionicons
              color={colors.textOnPrimary}
              name="medical"
              size={25}
            />
          </View>

          <View style={styles.brandText}>
            <Text style={styles.brandTitle}>
              FULafia Hospital
            </Text>

            <Text style={styles.brandSubtitle}>
              Electronic Medical Records
            </Text>
          </View>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>

          <View style={styles.profileText}>
            <Text numberOfLines={1} style={styles.userName}>
              {user.fullName}
            </Text>

            <Text numberOfLines={1} style={styles.userRole}>
              {role.label}
            </Text>

            <View style={styles.onlineRow}>
              <View style={styles.onlineDot} />

              <Text style={styles.onlineText}>
                Hospital LAN connected
              </Text>
            </View>
          </View>

          <Pressable style={styles.profileButton}>
            <Ionicons
              color={colors.primary}
              name="chevron-forward"
              size={18}
            />
          </Pressable>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>WORKSPACE</Text>

          <Text style={styles.sectionDepartment}>
            {user.department}
          </Text>
        </View>

        <View style={styles.menuList}>
          {menuItems.map((item) => {
            const isDashboard =
              item.route === '/(app)' &&
              (pathname === '/' || pathname === '/');

            const isActive =
              isDashboard ||
              pathname.includes(
                item.route.replace('/(app)/', ''),
              );

            return (
              <Pressable
                key={item.label}
                onPress={() => navigateTo(item.route)}
                style={({ pressed }) => [
                  styles.menuItem,
                  isActive && styles.activeMenuItem,
                  pressed && styles.pressed,
                ]}
              >
                <View
                  style={[
                    styles.menuIcon,
                    isActive && styles.activeMenuIcon,
                  ]}
                >
                  <Ionicons
                    color={
                      isActive
                        ? colors.textOnPrimary
                        : colors.textSecondary
                    }
                    name={item.icon}
                    size={21}
                  />
                </View>

                <Text
                  style={[
                    styles.menuLabel,
                    isActive && styles.activeMenuLabel,
                  ]}
                >
                  {item.label}
                </Text>

                {item.badge ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {item.badge}
                    </Text>
                  </View>
                ) : (
                  <Ionicons
                    color={
                      isActive
                        ? colors.primary
                        : colors.textMuted
                    }
                    name="chevron-forward"
                    size={17}
                  />
                )}
              </Pressable>
            );
          })}
        </View>

        <View style={styles.systemCard}>
          <View style={styles.systemHeading}>
            <View style={styles.systemIcon}>
              <Ionicons
                color={colors.success}
                name="server-outline"
                size={20}
              />
            </View>

            <View style={styles.systemHeadingText}>
              <Text style={styles.systemTitle}>
                Local server
              </Text>

              <Text style={styles.systemStatus}>
                Operational
              </Text>
            </View>

            <View style={styles.systemOnlineDot} />
          </View>

          <View style={styles.serverAddress}>
            <Ionicons
              color={colors.textSecondary}
              name="link-outline"
              size={15}
            />

            <Text style={styles.serverAddressText}>
              192.168.1.50:2028
            </Text>
          </View>
        </View>
      </DrawerContentScrollView>

      <View style={styles.footer}>
        <Pressable
          onPress={confirmLogout}
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.logoutIcon}>
            <Ionicons
              color={colors.danger}
              name="log-out-outline"
              size={21}
            />
          </View>

          <Text style={styles.logoutText}>Sign out</Text>
        </Pressable>

        <Text style={styles.version}>
          FULafia Cottage Hospital EMR · Demo v1.0
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },

  scrollContent: {
    paddingTop: 0,
  },

  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },

  brandIcon: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryDark,
  },

  brandText: {
    flex: 1,
    marginLeft: spacing.md,
  },

  brandTitle: {
    color: colors.textPrimary,
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
  },

  brandSubtitle: {
    marginTop: 2,
    color: colors.textSecondary,
    fontSize: 10,
  },

  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: '#C8EAE1',
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },

  avatarText: {
    color: colors.textOnPrimary,
    fontSize: typography.size.bodyLarge,
    fontWeight: typography.weight.bold,
  },

  profileText: {
    flex: 1,
    marginLeft: spacing.md,
  },

  userName: {
    color: colors.textPrimary,
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
  },

  userRole: {
    marginTop: 2,
    color: colors.primary,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.semibold,
  },

  onlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },

  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: radius.round,
    backgroundColor: colors.success,
  },

  onlineText: {
    color: colors.success,
    fontSize: 9,
    fontWeight: typography.weight.bold,
  },

  profileButton: {
    width: 32,
    height: 32,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },

  sectionHeader: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.md,
  },

  sectionLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: typography.weight.extraBold,
    letterSpacing: 1.3,
  },

  sectionDepartment: {
    marginTop: 3,
    color: colors.textSecondary,
    fontSize: typography.size.caption,
  },

  menuList: {
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
  },

  menuItem: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },

  activeMenuItem: {
    backgroundColor: colors.primarySoft,
  },

  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },

  activeMenuIcon: {
    backgroundColor: colors.primary,
  },

  menuLabel: {
    flex: 1,
    marginLeft: spacing.md,
    color: colors.textSecondary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.semibold,
  },

  activeMenuLabel: {
    color: colors.primaryDark,
    fontWeight: typography.weight.bold,
  },

  badge: {
    minWidth: 24,
    height: 24,
    paddingHorizontal: 7,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.danger,
  },

  badgeText: {
    color: colors.textOnPrimary,
    fontSize: 10,
    fontWeight: typography.weight.bold,
  },

  systemCard: {
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
  },

  systemHeading: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  systemIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.successSoft,
  },

  systemHeadingText: {
    flex: 1,
    marginLeft: spacing.md,
  },

  systemTitle: {
    color: colors.textPrimary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.bold,
  },

  systemStatus: {
    marginTop: 2,
    color: colors.success,
    fontSize: typography.size.caption,
  },

  systemOnlineDot: {
    width: 9,
    height: 9,
    borderRadius: radius.round,
    backgroundColor: colors.success,
  },

  serverAddress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  serverAddressText: {
    color: colors.textSecondary,
    fontSize: typography.size.caption,
  },

  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },

  logoutButton: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.dangerSoft,
  },

  logoutIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },

  logoutText: {
    marginLeft: spacing.md,
    color: colors.danger,
    fontSize: typography.size.label,
    fontWeight: typography.weight.bold,
  },

  version: {
    marginTop: spacing.md,
    color: colors.textMuted,
    fontSize: 9,
    textAlign: 'center',
  },

  pressed: {
    opacity: 0.7,
  },
});