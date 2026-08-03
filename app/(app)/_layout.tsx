import { Ionicons } from '@expo/vector-icons';
import { Drawer } from 'expo-router/drawer';
import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AppDrawerContent } from '@/src/components';
import { useAuthStore } from '@/src/store/auth.store';
import {
  colors,
  typography,
} from '@/src/theme';

export default function AppDrawerLayout() {
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
    <Drawer
      drawerContent={(props) => (
        <AppDrawerContent {...props} />
      )}
      screenOptions={{
        drawerType: 'front',
        drawerStyle: {
          width: 310,
          backgroundColor: colors.surface,
        },
        overlayColor: 'rgba(0, 35, 29, 0.55)',
        swipeEdgeWidth: 70,
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerShadowVisible: false,
        headerTintColor: colors.textPrimary,
        headerTitleStyle: {
          fontSize: typography.size.body,
          fontWeight: typography.weight.bold,
        },
        headerLeftContainerStyle: {
          paddingLeft: 6,
        },
        headerRightContainerStyle: {
          paddingRight: 14,
        },
        headerRight: () => (
          <View style={styles.headerStatus}>
            <View style={styles.statusDot} />

            <Ionicons
              color={colors.success}
              name="wifi"
              size={18}
            />
          </View>
        ),
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          drawerLabel: 'Dashboard',
          title: 'Dashboard',
        }}
      />

      <Drawer.Screen
        name="patients"
        options={{
          drawerLabel: 'Patients',
          title: 'Patients',
        }}
      />

      <Drawer.Screen
        name="workflow"
        options={{
          drawerLabel: 'Clinical Workflow',
          title: 'Clinical Workflow',
        }}
      />

      <Drawer.Screen
        name="notifications"
        options={{
          drawerLabel: 'Notifications',
          title: 'Notifications',
        }}
      />

      <Drawer.Screen
        name="reports"
        options={{
          drawerLabel: 'Reports',
          title: 'Reports',
        }}
      />

      <Drawer.Screen
        name="settings"
        options={{
          drawerLabel: 'Settings',
          title: 'Settings',
        }}
      />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },

  headerStatus: {
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 11,
    borderRadius: 99,
    backgroundColor: colors.successSoft,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 99,
    backgroundColor: colors.success,
  },
});