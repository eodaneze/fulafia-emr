import { Ionicons } from '@expo/vector-icons';
import { router, type Href} from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PatientStatusBadge } from '@/src/components';
import { useAuthStore } from '@/src/store/auth.store';
import { useDoctorStore } from '@/src/store/doctor.store';
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

export default function DoctorDashboardScreen() {
  const user = useAuthStore((state) => state.user);

  const patients = usePatientStore(
    (state) => state.patients,
  );

  const startConsultation = useDoctorStore(
    (state) => state.startConsultation,
  );

  const laboratoryRequests = useDoctorStore(
    (state) => state.laboratoryRequests,
  );

  const [searchQuery, setSearchQuery] = useState('');

  const doctorQueue = useMemo(() => {
    const normalizedSearch = searchQuery
      .trim()
      .toLowerCase();

    return patients
      .filter((patient) =>
        [
          'waiting_for_doctor',
          'under_consultation',
          'lab_result_ready',
        ].includes(patient.queueStatus),
      )
      .filter((patient) => {
        if (!normalizedSearch) {
          return true;
        }

        return [
          patient.fullName,
          patient.hospitalNumber,
          patient.studentRegistrationNumber,
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

  const resultReadyCount = patients.filter(
    (patient) =>
      patient.queueStatus === 'lab_result_ready',
  ).length;

  const activeCaseCount = patients.filter(
    (patient) =>
      patient.queueStatus === 'under_consultation' ||
      patient.queueStatus === 'waiting_for_lab',
  ).length;

  const openPatient = async (patient: Patient) => {
    if (
      patient.queueStatus === 'waiting_for_doctor'
    ) {
      const result = await startConsultation(
        patient.id,
      );

      if (!result.success) {
        Alert.alert(
          'Unable to open consultation',
          result.message,
        );

        return;
      }
    }

    router.push({
        pathname: '/doctor/[patientId]',
        params: {
            patientId: patient.id,
        },
     } as Href);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Return to home dashboard"
          accessibilityRole="button"
          hitSlop={10}
          onPress={() => router.replace('/(app)')}
          style={({ pressed }) => [
            styles.homeButton,
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
            Doctor Workspace
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

          {resultReadyCount > 0 ? (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>
                {resultReadyCount}
              </Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={styles.heroText}>
              <Text style={styles.heroEyebrow}>
                CLINICAL CASE OWNER
              </Text>

              <Text style={styles.heroTitle}>
                Good morning,{' '}
                {user?.fullName.split(' ')[0] ?? 'Doctor'}
              </Text>

              <Text style={styles.heroDescription}>
                Review patients, manage active cases and
                monitor departmental feedback until discharge.
              </Text>
            </View>

            <View style={styles.heroIcon}>
              <Ionicons
                color={colors.textOnPrimary}
                name="medical"
                size={29}
              />
            </View>
          </View>

          <View style={styles.heroStatistics}>
            <HeroStatistic
              label="Waiting"
              value={String(doctorQueue.length)}
            />

            <View style={styles.heroDivider} />

            <HeroStatistic
              label="Active cases"
              value={String(activeCaseCount)}
            />

            <View style={styles.heroDivider} />

            <HeroStatistic
              label="Results ready"
              value={String(resultReadyCount)}
            />
          </View>
        </View>

        <View style={styles.caseOwnerNotice}>
          <View style={styles.caseOwnerIcon}>
            <Ionicons
              color={colors.primary}
              name="shield-checkmark-outline"
              size={24}
            />
          </View>

          <View style={styles.caseOwnerText}>
            <Text style={styles.caseOwnerTitle}>
              You remain the case owner
            </Text>

            <Text style={styles.caseOwnerDescription}>
              Laboratory, pharmacy and ward activities return
              to your dashboard for review.
            </Text>
          </View>
        </View>

        <View style={styles.summaryGrid}>
          <SummaryCard
            icon="people-outline"
            label="Queue"
            tone="primary"
            value={String(doctorQueue.length)}
          />

          <SummaryCard
            icon="flask-outline"
            label="Lab requests"
            tone="info"
            value={String(laboratoryRequests.length)}
          />

          <SummaryCard
            icon="alert-circle-outline"
            label="Priority"
            tone="warning"
            value="2"
          />

          <SummaryCard
            icon="checkmark-circle-outline"
            label="Completed"
            tone="success"
            value="6"
          />
        </View>

        <View style={styles.queueHeading}>
          <View>
            <Text style={styles.sectionEyebrow}>
              PATIENT QUEUE
            </Text>

            <Text style={styles.sectionTitle}>
              Waiting for consultation
            </Text>
          </View>

          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />

            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </View>

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
            placeholder="Search patient or hospital number"
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

        {doctorQueue.length ? (
          <View style={styles.queueList}>
            {doctorQueue.map((patient, index) => (
              <DoctorPatientCard
                key={patient.id}
                onPress={() => openPatient(patient)}
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
              Doctor queue is clear
            </Text>

            <Text style={styles.emptyDescription}>
              There are currently no patients waiting for
              consultation.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function HeroStatistic({
  value,
  label,
}: {
  value: string;
  label: string;
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

function SummaryCard({
  value,
  label,
  icon,
  tone,
}: {
  value: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone: 'primary' | 'info' | 'warning' | 'success';
}) {
  const tones = {
    primary: {
      background: colors.primarySoft,
      color: colors.primary,
    },
    info: {
      background: colors.infoSoft,
      color: colors.info,
    },
    warning: {
      background: colors.warningSoft,
      color: colors.warning,
    },
    success: {
      background: colors.successSoft,
      color: colors.success,
    },
  };

  const selectedTone = tones[tone];

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
          color={selectedTone.color}
          name={icon}
          size={21}
        />
      </View>

      <Text style={styles.summaryValue}>{value}</Text>

      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function DoctorPatientCard({
  patient,
  queueNumber,
  onPress,
}: {
  patient: Patient;
  queueNumber: number;
  onPress: () => void;
}) {
  const latestVitals =
    useNursingStore((state) =>
      state.getLatestVitalSignsForPatient(patient.id),
    );

  const hasFever =
    latestVitals && latestVitals.temperature >= 38;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.patientCard,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.queueNumber}>
        <Text style={styles.queueLabel}>QUEUE</Text>

        <Text style={styles.queueValue}>
          {String(queueNumber).padStart(2, '0')}
        </Text>
      </View>

      <View style={styles.patientContent}>
        <View style={styles.patientHeader}>
          <View style={styles.patientAvatar}>
            <Text style={styles.patientAvatarText}>
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
            size={20}
          />
        </View>

        <View style={styles.patientMeta}>
          <MetaItem
            icon="person-outline"
            value={`${patient.age} years · ${
              patient.sex === 'male' ? 'Male' : 'Female'
            }`}
          />

          {latestVitals ? (
            <>
              <MetaItem
                icon="thermometer-outline"
                value={`${latestVitals.temperature}°C`}
                warning={Boolean(hasFever)}
              />

              <MetaItem
                icon="heart-outline"
                value={`${latestVitals.pulseRate} bpm`}
              />
            </>
          ) : null}
        </View>

        <View style={styles.patientFooter}>
          <PatientStatusBadge
            status={patient.queueStatus}
          />

          <Text style={styles.openCaseText}>
            Open case
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

function MetaItem({
  icon,
  value,
  warning = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  warning?: boolean;
}) {
  return (
    <View style={styles.metaItem}>
      <Ionicons
        color={
          warning ? colors.danger : colors.textMuted
        }
        name={icon}
        size={14}
      />

      <Text
        style={[
          styles.metaText,
          warning && styles.warningMetaText,
        ]}
      >
        {value}
      </Text>
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

  homeButton: {
    width: 42,
    height: 42,
    borderWidth: 1,
    borderColor: colors.border,
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

  heroTop: {
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

  caseOwnerNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#C8EAE1',
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
  },

  caseOwnerIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },

  caseOwnerText: {
    flex: 1,
  },

  caseOwnerTitle: {
    color: colors.textPrimary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.bold,
  },

  caseOwnerDescription: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },

  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.lg,
  },

  summaryCard: {
    width: '47.8%',
    minHeight: 126,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },

  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },

  summaryValue: {
    marginTop: spacing.md,
    color: colors.textPrimary,
    fontSize: 25,
    fontWeight: typography.weight.extraBold,
  },

  summaryLabel: {
    marginTop: 2,
    color: colors.textSecondary,
    fontSize: typography.size.caption,
  },

  queueHeading: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
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
    fontSize: 8,
    fontWeight: typography.weight.extraBold,
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

  queueList: {
    gap: spacing.md,
    marginTop: spacing.md,
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

  queueLabel: {
    color: colors.primary,
    fontSize: 8,
    fontWeight: typography.weight.extraBold,
  },

  queueValue: {
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

  patientAvatar: {
    width: 46,
    height: 46,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },

  patientAvatarText: {
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

  metaText: {
    color: colors.textSecondary,
    fontSize: 10,
  },

  warningMetaText: {
    color: colors.danger,
    fontWeight: typography.weight.bold,
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

  openCaseText: {
    color: colors.primary,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.bold,
  },

  emptyState: {
    alignItems: 'center',
    marginTop: spacing.md,
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
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontSize: typography.size.label,
    textAlign: 'center',
  },

  pressed: {
    opacity: 0.7,
  },
});