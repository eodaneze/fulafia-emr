import { Ionicons } from '@expo/vector-icons';
import {
  router,
  type Href,
} from 'expo-router';
import {
  useEffect,
  useRef,
} from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ModulePreviewScreen } from '@/src/components';
import { useAuthStore } from '@/src/store/auth.store';

import type { UserRole } from '@/src/types/auth';

import {
  colors,
  radius,
  spacing,
  typography,
} from '@/src/theme';

export default function WorkflowScreen() {
  const user = useAuthStore((state) => state.user);

  /*
   * Prevent the Workflow tab from navigating repeatedly.
   *
   * Expo Router tab screens can remain mounted after navigation.
   * Rendering <Redirect /> directly here can therefore create an
   * infinite navigation loop.
   */
  const hasNavigatedRef = useRef(false);

  const getWorkflowRoute = (): Href | null => {
    switch (user?.role) {
      case 'outpatient_nurse':
        return '/nursing' as Href;

      case 'ward_nurse':
        return '/ward' as Href;

      case 'doctor':
        return '/doctor' as Href;

      case 'laboratory_scientist':
        return '/laboratory' as Href;

     case 'pharmacist':
        return '/pharmacy' as Href;

     case 'director':
        return '/director' as Href;

      /*
       * We will connect these roles when their modules
       * have been implemented.
       */
      case 'pharmacist':
      case 'records_officer':
      case 'administrator':
      case 'director':
      case 'accounts_officer':
      case 'human_resources':
      case 'environmental_officer':
      case 'store_officer':
      default:
        return null;
    }
  };

  const workflowRoute = getWorkflowRoute();

  useEffect(() => {
    if (!workflowRoute || hasNavigatedRef.current) {
      return;
    }

    hasNavigatedRef.current = true;

    /*
     * Wait until the Workflow tab has completed mounting
     * before moving into the role workspace.
     */
    const navigationTimer = setTimeout(() => {
      router.push(workflowRoute);
    }, 0);

    return () => {
      clearTimeout(navigationTimer);
    };
  }, [workflowRoute]);

  /*
   * Show a clean transition state while moving the staff
   * member to their role-specific workspace.
   */
  if (workflowRoute) {
    return (
      <View style={styles.redirectScreen}>
        <View style={styles.redirectIcon}>
          <Ionicons
            color={colors.primary}
            name={getRoleWorkflowIcon(user?.role)}
            size={30}
          />
        </View>

        <ActivityIndicator
          color={colors.primary}
          size="small"
          style={styles.loader}
        />

        <Text style={styles.redirectTitle}>
          Opening your workspace
        </Text>

        <Text style={styles.redirectDescription}>
          Loading the clinical workflow assigned to your
          hospital role.
        </Text>

        <View style={styles.connectionBadge}>
          <View style={styles.connectionDot} />

          <Text style={styles.connectionText}>
            HOSPITAL LAN CONNECTED
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ModulePreviewScreen
      description="Follow the patient from registration through nursing, doctor review, laboratory, pharmacy and discharge."
      eyebrow="CONTINUOUS CARE LOOP"
      features={[
        {
          title: 'Records and nursing',
          description:
            'Registration and vital signs automatically move the patient to the doctor queue.',
          icon: 'medkit-outline',
        },
        {
          title: 'Doctor case ownership',
          description:
            'The assigned doctor remains responsible for the clinical case until discharge.',
          icon: 'medical-outline',
        },
        {
          title: 'Laboratory feedback',
          description:
            'Completed results return automatically to the requesting doctor.',
          icon: 'flask-outline',
        },
        {
          title: 'Pharmacy and discharge',
          description:
            'Dispensing status returns to the doctor before the case is completed.',
          icon: 'bandage-outline',
        },
      ]}
      title="Clinical workflow"
    />
  );
}

function getRoleWorkflowIcon(
  role?: UserRole,
): keyof typeof Ionicons.glyphMap {
  switch (role) {
    case 'doctor':
      return 'medical-outline';

    case 'outpatient_nurse':
      return 'medkit-outline';

    case 'ward_nurse':
      return 'bed-outline';

    case 'laboratory_scientist':
      return 'flask-outline';

    case 'pharmacist':
      return 'bandage-outline';

    case 'director':
       return 'analytics-outline';

    default:
      return 'git-network-outline';
  }
}

const styles = StyleSheet.create({
  redirectScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxxl,
    backgroundColor: colors.background,
  },

  redirectIcon: {
    width: 78,
    height: 78,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },

  loader: {
    marginTop: spacing.xl,
  },

  redirectTitle: {
    marginTop: spacing.lg,
    color: colors.textPrimary,
    fontSize: typography.size.sectionTitle,
    fontWeight: typography.weight.bold,
    textAlign: 'center',
  },

  redirectDescription: {
    maxWidth: 310,
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    textAlign: 'center',
  },

  connectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.round,
    backgroundColor: colors.successSoft,
  },

  connectionDot: {
    width: 7,
    height: 7,
    borderRadius: radius.round,
    backgroundColor: colors.success,
  },

  connectionText: {
    color: colors.success,
    fontSize: 9,
    fontWeight: typography.weight.extraBold,
    letterSpacing: 1,
  },
});