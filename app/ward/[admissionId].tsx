import { Ionicons } from '@expo/vector-icons';
import {
  router,
  useLocalSearchParams,
  type Href,
} from 'expo-router';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/src/components';
import { usePatientStore } from '@/src/store/patient.store';
import { useWardStore } from '@/src/store/ward.store';
import {
  colors,
  radius,
  spacing,
  typography,
} from '@/src/theme';
import { getPatientInitials } from '@/src/types/patient';

export default function WardAdmissionWorkspaceScreen() {
  const { admissionId } = useLocalSearchParams<{
    admissionId: string;
  }>();

  const admission = useWardStore((state) =>
    state.admissions.find(
      (item) => item.id === admissionId,
    ),
  );

  const patient = usePatientStore((state) =>
    admission
      ? state.patients.find(
          (item) => item.id === admission.patientId,
        )
      : undefined,
  );

  if (!admission || !patient) {
    return (
      <SafeAreaView style={styles.notFound}>
        <View style={styles.notFoundIcon}>
          <Ionicons
            color={colors.primary}
            name="bed-outline"
            size={38}
          />
        </View>

        <Text style={styles.notFoundTitle}>
          Admission unavailable
        </Text>

        <Text style={styles.notFoundDescription}>
          The selected inpatient admission record could not
          be found.
        </Text>

        <AppButton
          onPress={() =>
            router.replace('/ward' as Href)
          }
          title="Return to ward"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Return to ward dashboard"
          accessibilityRole="button"
          hitSlop={10}
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons
            color={colors.textPrimary}
            name="arrow-back"
            size={23}
          />
        </Pressable>

        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>
            Inpatient record
          </Text>

          <Text style={styles.headerSubtitle}>
            {admission.wardName} · Bed{' '}
            {admission.bedNumber}
          </Text>
        </View>

        <View style={styles.headerIcon}>
          <Ionicons
            color={colors.success}
            name="bed"
            size={21}
          />
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.patientCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {getPatientInitials(patient)}
            </Text>
          </View>

          <View style={styles.patientIdentity}>
            <Text style={styles.patientName}>
              {patient.fullName}
            </Text>

            <Text style={styles.hospitalNumber}>
              {patient.hospitalNumber}
            </Text>

            <Text style={styles.patientMeta}>
              {patient.age} years ·{' '}
              {patient.sex === 'male'
                ? 'Male'
                : 'Female'}
            </Text>
          </View>

          <View style={styles.admittedBadge}>
            <View style={styles.admittedDot} />

            <Text style={styles.admittedText}>
              ADMITTED
            </Text>
          </View>
        </View>

        <View style={styles.admissionCard}>
          <View style={styles.admissionIcon}>
            <Ionicons
              color={colors.primary}
              name="medical-outline"
              size={23}
            />
          </View>

          <View style={styles.admissionText}>
            <Text style={styles.admissionLabel}>
              Admission diagnosis
            </Text>

            <Text style={styles.admissionValue}>
              {admission.diagnosis}
            </Text>
          </View>
        </View>

        <View style={styles.placeholderCard}>
          <View style={styles.placeholderIcon}>
            <Ionicons
              color={colors.primary}
              name="construct-outline"
              size={30}
            />
          </View>

          <Text style={styles.placeholderTitle}>
            Inpatient workspace ready
          </Text>

          <Text style={styles.placeholderDescription}>
            Ward observations, nursing notes, fluid balance
            and medication administration will be added on
            this screen next.
          </Text>

          <AppButton
            onPress={() =>
              router.replace('/ward' as Href)
            }
            title="Return to ward dashboard"
            variant="outline"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  header: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screenHorizontal,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },

  headerText: {
    flex: 1,
    marginHorizontal: spacing.md,
  },

  headerTitle: {
    color: colors.textPrimary,
    fontSize: typography.size.bodyLarge,
    fontWeight: typography.weight.bold,
  },

  headerSubtitle: {
    marginTop: 2,
    color: colors.textSecondary,
    fontSize: typography.size.caption,
  },

  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.successSoft,
  },

  content: {
    flex: 1,
    padding: spacing.screenHorizontal,
  },

  patientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryDark,
  },

  avatar: {
    width: 54,
    height: 54,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },

  avatarText: {
    color: colors.textOnPrimary,
    fontSize: typography.size.body,
    fontWeight: typography.weight.extraBold,
  },

  patientIdentity: {
    flex: 1,
    marginHorizontal: spacing.md,
  },

  patientName: {
    color: colors.textOnPrimary,
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
  },

  hospitalNumber: {
    marginTop: 2,
    color: colors.secondary,
    fontSize: typography.size.caption,
  },

  patientMeta: {
    marginTop: 4,
    color: 'rgba(255,255,255,0.55)',
    fontSize: 10,
  },

  admittedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },

  admittedDot: {
    width: 7,
    height: 7,
    borderRadius: radius.round,
    backgroundColor: colors.secondary,
  },

  admittedText: {
    color: colors.secondary,
    fontSize: 8,
    fontWeight: typography.weight.extraBold,
  },

  admissionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
  },

  admissionIcon: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },

  admissionText: {
    flex: 1,
    marginLeft: spacing.md,
  },

  admissionLabel: {
    color: colors.textMuted,
    fontSize: 10,
  },

  admissionValue: {
    marginTop: spacing.xs,
    color: colors.textPrimary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.bold,
  },

  placeholderCard: {
    alignItems: 'center',
    marginTop: spacing.lg,
    padding: spacing.xxl,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
  },

  placeholderIcon: {
    width: 68,
    height: 68,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },

  placeholderTitle: {
    marginTop: spacing.lg,
    color: colors.textPrimary,
    fontSize: typography.size.bodyLarge,
    fontWeight: typography.weight.bold,
    textAlign: 'center',
  },

  placeholderDescription: {
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
    color: colors.textSecondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    textAlign: 'center',
  },

  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    padding: spacing.xxl,
    backgroundColor: colors.background,
  },

  notFoundIcon: {
    width: 76,
    height: 76,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },

  notFoundTitle: {
    color: colors.textPrimary,
    fontSize: typography.size.sectionTitle,
    fontWeight: typography.weight.bold,
  },

  notFoundDescription: {
    color: colors.textSecondary,
    fontSize: typography.size.label,
    textAlign: 'center',
  },
});