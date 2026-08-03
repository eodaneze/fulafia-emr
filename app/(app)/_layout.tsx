import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useAuthStore } from '@/src/store/auth.store';
import {
  colors,
  shadows,
  typography,
} from '@/src/theme';

type TabIconProps = {
  focused: boolean;
  color: string;
  size: number;
  activeIcon: keyof typeof Ionicons.glyphMap;
  inactiveIcon: keyof typeof Ionicons.glyphMap;
  badge?: number;
};

function TabIcon({
  focused,
  color,
  size,
  activeIcon,
  inactiveIcon,
  badge,
}: TabIconProps) {
  return (
    <View style={styles.tabIconWrapper}>
      <Ionicons
        color={color}
        name={focused ? activeIcon : inactiveIcon}
        size={size}
      />

      {badge ? (
        <View style={styles.notificationBadge}>
          <Text style={styles.notificationBadgeText}>
            {badge > 9 ? '9+' : badge}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function HeaderConnectionStatus() {
  return (
    <View style={styles.headerConnection}>
      <View style={styles.headerConnectionDot} />

      <Ionicons
        color={colors.success}
        name="wifi"
        size={17}
      />
    </View>
  );
}

export default function AppTabLayout() {
  const user = useAuthStore((state) => state.user);

  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated,
  );

  const isHydrated = useAuthStore(
    (state) => state.isHydrated,
  );

  if (!isHydrated) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator
          color={colors.primary}
          size="large"
        />
      </View>
    );
  }

  if (!isAuthenticated || !user) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        headerShown: true,

        headerStyle: {
          backgroundColor: colors.surface,
        },

        headerShadowVisible: false,

        headerTitleAlign: 'left',

        headerTitleStyle: {
          color: colors.textPrimary,
          fontSize: typography.size.bodyLarge,
          fontWeight: typography.weight.bold,
        },

        headerRight: () => <HeaderConnectionStatus />,

        tabBarHideOnKeyboard: true,

        tabBarActiveTintColor: colors.primary,

        tabBarInactiveTintColor: colors.textSecondary,

        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: typography.weight.semibold,
          marginTop: Platform.OS === 'android' ? 1 : 0,
          marginBottom: Platform.OS === 'android' ? 7 : 0,
        },

        tabBarIconStyle: {
          marginTop: Platform.OS === 'android' ? 7 : 3,
        },

        tabBarItemStyle: {
          paddingVertical: 2,
        },

        tabBarStyle: {
          height: Platform.OS === 'ios' ? 86 : 72,
          paddingTop: 5,
          paddingBottom: Platform.OS === 'ios' ? 20 : 5,
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          ...shadows.medium,
        },

        sceneStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon
              activeIcon="home"
              color={color}
              focused={focused}
              inactiveIcon="home-outline"
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="patients"
        options={{
          title: 'Patients',
          tabBarLabel: 'Patients',
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon
              activeIcon="people"
              color={color}
              focused={focused}
              inactiveIcon="people-outline"
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="workflow"
        options={{
          title: 'Clinical Workflow',
          tabBarLabel: 'Workflow',
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon
              activeIcon="git-network"
              color={color}
              focused={focused}
              inactiveIcon="git-network-outline"
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notifications',
          tabBarLabel: 'Alerts',
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon
              activeIcon="notifications"
              badge={3}
              color={color}
              focused={focused}
              inactiveIcon="notifications-outline"
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarLabel: 'More',
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon
              activeIcon="grid"
              color={color}
              focused={focused}
              inactiveIcon="grid-outline"
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="reports"
        options={{
          href: null,
          title: 'Reports',
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          href: null,
          title: 'Settings',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },

  tabIconWrapper: {
    minWidth: 32,
    height: 29,
    alignItems: 'center',
    justifyContent: 'center',
  },

  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -7,
    minWidth: 17,
    height: 17,
    paddingHorizontal: 4,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.danger,
    borderWidth: 2,
    borderColor: colors.surface,
  },

  notificationBadgeText: {
    color: colors.textOnPrimary,
    fontSize: 8,
    fontWeight: typography.weight.extraBold,
  },

  headerConnection: {
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginRight: 16,
    paddingHorizontal: 11,
    borderRadius: 999,
    backgroundColor: colors.successSoft,
  },

  headerConnectionDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: colors.success,
  },
});