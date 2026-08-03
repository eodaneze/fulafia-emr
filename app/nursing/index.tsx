import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PatientStatusBadge } from '@/src/components';
import { useNursingStore } from '@/src/store/nursing.store';
import { usePatientStore } from '@/src/store/patient.store';
import {
  colors,
  radius,
  shadows,
  spacing,
  typography,
} from '@/src/theme';
import {
  getPatientInitials,
  type Patient,
} from '@/src/types/patient';

export default function NursingQueueScreen() {
  const patients = usePatientStore(
    (state) => state.patients,
  );

  const vitalSigns = useNursingStore(
    (state) => state.vitalSigns,
  );

  const [searchQuery, setSearchQuery] = useState('');

  const waitingPatients = useMemo(() => {
    const normalizedSearch = searchQuery
      .trim()
      .toLowerCase();

    return patients
      .filter(
        (patient) =>
          patient.queueStatus === 'waiting_for_vitals',
      )
      .filter((patient) => {
        if (!normalizedSearch) {
          return true;
        }

        return [
          patient.fullName,
          patient.hospitalNumber,
          patient.studentRegistrationNumber,
          patient.staffNumber,
          patient.phoneNumber,
        ]
          .filter(Boolean)
          .some((value) =>
            value
              ?.toLowerCase()
              .includes(normalizedSearch),
          );
      });
  }, [patients, searchQuery]);

  const completedToday = vitalSigns.filter(
    (item) =>
      new Date(item.recordedAt).toDateString() ===
      new Date().toDateString(),
  ).length;

  const urgentPatients = vitalSigns.filter(
    (item) =>
      item.triageCategory === 'urgent' ||
      item.triageCategory === 'emergency',
  ).length;

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable
            accessibilityLabel="Return to home dashboard"
            accessibilityRole="button"
            hitSlop={10}
            onPress={() => router.replace('/(app)')}
            style={({ pressed }) => [
                styles.backButton,
                pressed && styles.pressed,
            ]}
            >
            <Ionicons
                color={colors.textPrimary}
                name="home-outline"
                size={22}
            />
        </Pressable>

        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>
            Outpatient Nursing
          </Text>

          <View style={styles.connectionRow}>
            <View style={styles.connectionDot} />

            <Text style={styles.headerSubtitle}>
              Hospital LAN connected
            </Text>
          </View>
        </View>

        <Pressable style={styles.notificationButton}>
          <Ionicons
            color={colors.textPrimary}
            name="notifications-outline"
            size={22}
          />

          <View style={styles.notificationBadge}>
            <Text style={styles.notificationBadgeText}>
              {waitingPatients.length}
            </Text>
          </View>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.heroHeading}>
            <View style={styles.heroText}>
              <Text style={styles.heroEyebrow}>
                NURSING UNIT
              </Text>

              <Text style={styles.heroTitle}>
                Patient intake queue
              </Text>

              <Text style={styles.heroDescription}>
                Record vital signs and triage patients before
                sending them to the doctor.
              </Text>
            </View>

            <View style={styles.heroIcon}>
              <Ionicons
                color={colors.textOnPrimary}
                name="medkit"
                size={28}
              />
            </View>
          </View>

          <View style={styles.heroStatistics}>
            <HeroStatistic
              label="Waiting"
              value={String(waitingPatients.length)}
            />

            <View style={styles.heroDivider} />

            <HeroStatistic
              label="Completed"
              value={String(completedToday)}
            />

            <View style={styles.heroDivider} />

            <HeroStatistic
              label="Urgent"
              value={String(urgentPatients)}
            />
          </View>
        </View>

        <View style={styles.quickStatus}>
          <View style={styles.quickStatusIcon}>
            <Ionicons
              color={colors.success}
              name="checkmark-circle-outline"
              size={23}
            />
          </View>

          <View style={styles.quickStatusText}>
            <Text style={styles.quickStatusTitle}>
              Nursing station operational
            </Text>

            <Text style={styles.quickStatusDescription}>
              Completed assessments automatically enter the
              doctor queue.
            </Text>
          </View>

          <View style={styles.onlineIndicator}>
            <View style={styles.onlineDot} />

            <Text style={styles.onlineText}>LIVE</Text>
          </View>
        </View>

        <View style={styles.searchSection}>
          <Text style={styles.sectionEyebrow}>
            PATIENT SEARCH
          </Text>

          <Text style={styles.sectionTitle}>
            Waiting for vital signs
          </Text>

          <View style={styles.searchContainer}>
            <Ionicons
              color={colors.textSecondary}
              name="search-outline"
              size={21}
            />

            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={setSearchQuery}
              placeholder="Search name or hospital number"
              placeholderTextColor={colors.textMuted}
              selectionColor={colors.primary}
              style={styles.searchInput}
              value={searchQuery}
            />

            {searchQuery ? (
              <Pressable
                hitSlop={10}
                onPress={() => setSearchQuery('')}
              >
                <Ionicons
                  color={colors.textMuted}
                  name="close-circle"
                  size={21}
                />
              </Pressable>
            ) : null}
          </View>
        </View>

        <View style={styles.queueHeader}>
          <Text style={styles.queueCount}>
            {waitingPatients.length}{' '}
            {waitingPatients.length === 1
              ? 'patient'
              : 'patients'}{' '}
            waiting
          </Text>

          <View style={styles.queueOrder}>
            <Ionicons
              color={colors.textSecondary}
              name="time-outline"
              size={17}
            />

            <Text style={styles.queueOrderText}>
              Arrival order
            </Text>
          </View>
        </View>

        {waitingPatients.length ? (
          <View style={styles.patientList}>
            {waitingPatients.map((patient, index) => (
              <NursingPatientCard
                key={patient.id}
                patient={patient}
                queueNumber={index + 1}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons
                color={colors.success}
                name="checkmark-done-outline"
                size={32}
              />
            </View>

            <Text style={styles.emptyTitle}>
              Nursing queue is clear
            </Text>

            <Text style={styles.emptyDescription}>
              There are currently no patients waiting for
              vital-sign assessment.
            </Text>
          </View>
        )}

        <View style={styles.workflowInformation}>
          <View style={styles.workflowIcon}>
            <Ionicons
              color={colors.primary}
              name="git-network-outline"
              size={24}
            />
          </View>

          <View style={styles.workflowText}>
            <Text style={styles.workflowTitle}>
              Automatic clinical workflow
            </Text>

            <Text style={styles.workflowDescription}>
              Saving the assessment updates the patient record
              and immediately places the patient in the
              assigned doctor’s queue.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function HeroStatistic({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.heroStatistic}>
      <Text style={styles.heroStatisticValue}>
        {value}
      </Text>

      <Text style={styles.heroStatisticLabel}>
        {label}
      </Text>
    </View>
  );
}

function NursingPatientCard({
  patient,
  queueNumber,
}: {
  patient: Patient;
  queueNumber: number;
}) {
  const patientTypeLabels = {
    student: 'Student',
    staff: 'Staff',
    dependent: 'Dependant',
    public: 'Public',
  };

  return (
    <Pressable
      onPress={() =>
        router.push(`/nursing/${patient.id}`)
      }
      style={({ pressed }) => [
        styles.patientCard,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.queueNumber}>
        <Text style={styles.queueNumberLabel}>
          QUEUE
        </Text>

        <Text style={styles.queueNumberValue}>
          {String(queueNumber).padStart(2, '0')}
        </Text>
      </View>

      <View style={styles.patientContent}>
        <View style={styles.patientHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {getPatientInitials(patient)}
            </Text>
          </View>

          <View style={styles.patientIdentity}>
            <Text
              numberOfLines={1}
              style={styles.patientName}
            >
              {patient.fullName}
            </Text>

            <Text style={styles.hospitalNumber}>
              {patient.hospitalNumber}
            </Text>
          </View>

          <Ionicons
            color={colors.textMuted}
            name="chevron-forward"
            size={21}
          />
        </View>

        <View style={styles.patientMeta}>
          <MetaItem
            icon="person-outline"
            value={`${patient.age} years · ${
              patient.sex === 'male' ? 'Male' : 'Female'
            }`}
          />

          <MetaItem
            icon="id-card-outline"
            value={patientTypeLabels[patient.patientType]}
          />

          <MetaItem
            icon="time-outline"
            value="Waiting 12 min"
          />
        </View>

        <View style={styles.patientFooter}>
          <PatientStatusBadge
            status={patient.queueStatus}
          />

          <View style={styles.assessButton}>
            <Text style={styles.assessButtonText}>
              Record vitals
            </Text>

            <Ionicons
              color={colors.primary}
              name="arrow-forward"
              size={16}
            />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function MetaItem({
  icon,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
}) {
  return (
    <View style={styles.metaItem}>
      <Ionicons
        color={colors.textMuted}
        name={icon}
        size={14}
      />

      <Text style={styles.metaItemText}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  header: {
    minHeight: 70,
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
    borderWidth: 1,
    borderColor: colors.border,
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

  connectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 3,
  },

  connectionDot: {
    width: 6,
    height: 6,
    borderRadius: radius.round,
    backgroundColor: colors.success,
  },

  headerSubtitle: {
    color: colors.success,
    fontSize: typography.size.caption,
  },

  notificationButton: {
    width: 42,
    height: 42,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },

  notificationBadge: {
    position: 'absolute',
    top: -3,
    right: -2,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: radius.round,
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

  content: {
    padding: spacing.screenHorizontal,
    paddingBottom: spacing.massive,
  },

  hero: {
    marginTop: spacing.lg,
    padding: spacing.xl,
    borderRadius: radius.xl,
    backgroundColor: colors.primaryDark,
    ...shadows.medium,
  },

  heroHeading: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  heroText: {
    flex: 1,
  },

  heroEyebrow: {
    color: colors.secondary,
    fontSize: 10,
    fontWeight: typography.weight.extraBold,
    letterSpacing: 1.4,
  },

  heroTitle: {
    marginTop: spacing.sm,
    color: colors.textOnPrimary,
    fontSize: typography.size.sectionTitle,
    fontWeight: typography.weight.extraBold,
  },

  heroDescription: {
    marginTop: spacing.sm,
    color: 'rgba(255,255,255,0.65)',
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },

  heroIcon: {
    width: 54,
    height: 54,
    marginLeft: spacing.lg,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },

  heroStatistics: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.12)',
  },

  heroStatistic: {
    flex: 1,
  },

  heroStatisticValue: {
    color: colors.textOnPrimary,
    fontSize: typography.size.cardTitle,
    fontWeight: typography.weight.extraBold,
  },

  heroStatisticLabel: {
    marginTop: 2,
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
  },

  heroDivider: {
    width: 1,
    height: 34,
    marginHorizontal: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },

  quickStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#BDE6D2',
    borderRadius: radius.lg,
    backgroundColor: colors.successSoft,
  },

  quickStatusIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },

  quickStatusText: {
    flex: 1,
    marginHorizontal: spacing.md,
  },

  quickStatusTitle: {
    color: colors.textPrimary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.bold,
  },

  quickStatusDescription: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },

  onlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: radius.round,
    backgroundColor: colors.success,
  },

  onlineText: {
    color: colors.success,
    fontSize: 8,
    fontWeight: typography.weight.extraBold,
  },

  searchSection: {
    marginTop: spacing.xxxl,
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

  searchContainer: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },

  searchInput: {
    flex: 1,
    minHeight: 52,
    color: colors.textPrimary,
    fontSize: typography.size.label,
  },

  queueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xxl,
    marginBottom: spacing.md,
  },

  queueCount: {
    color: colors.textPrimary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.bold,
  },

  queueOrder: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },

  queueOrderText: {
    color: colors.textSecondary,
    fontSize: typography.size.caption,
  },

  patientList: {
    gap: spacing.md,
  },

  patientCard: {
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },

  queueNumber: {
    width: 62,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },

  queueNumberLabel: {
    color: colors.primary,
    fontSize: 8,
    fontWeight: typography.weight.extraBold,
    letterSpacing: 0.8,
  },

  queueNumberValue: {
    marginTop: spacing.xs,
    color: colors.primaryDark,
    fontSize: typography.size.sectionTitle,
    fontWeight: typography.weight.extraBold,
  },

  patientContent: {
    flex: 1,
    padding: spacing.lg,
  },

  patientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 46,
    height: 46,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },

  avatarText: {
    color: colors.textOnPrimary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.extraBold,
  },

  patientIdentity: {
    flex: 1,
    marginHorizontal: spacing.md,
  },

  patientName: {
    color: colors.textPrimary,
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
  },

  hospitalNumber: {
    marginTop: 3,
    color: colors.primary,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.semibold,
  },

  patientMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.md,
  },

  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },

  metaItemText: {
    color: colors.textSecondary,
    fontSize: 10,
  },

  patientFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  assessButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },

  assessButtonText: {
    color: colors.primary,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.bold,
  },

  emptyState: {
    alignItems: 'center',
    padding: spacing.massive,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
  },

  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.successSoft,
  },

  emptyTitle: {
    marginTop: spacing.lg,
    color: colors.textPrimary,
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
  },

  emptyDescription: {
    maxWidth: 280,
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    textAlign: 'center',
  },

  workflowInformation: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginTop: spacing.xxl,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
  },

  workflowIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },

  workflowText: {
    flex: 1,
  },

  workflowTitle: {
    color: colors.textPrimary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.bold,
  },

  workflowDescription: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },

  pressed: {
    opacity: 0.7,
  },
});