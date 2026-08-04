import { Ionicons } from '@expo/vector-icons';
import {
  router,
  type Href,
} from 'expo-router';
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

import { useDoctorStore } from '@/src/store/doctor.store';
import { usePatientStore } from '@/src/store/patient.store';
import { useWardStore } from '@/src/store/ward.store';
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
import type { WardAdmission } from '@/src/types/ward';

type WardTab =
  | 'admission_queue'
  | 'admitted_patients';

export default function WardDashboardScreen() {
  const patients = usePatientStore(
    (state) => state.patients,
  );

  const consultations = useDoctorStore(
    (state) => state.consultations,
  );

  const admissions = useWardStore(
    (state) => state.admissions,
  );

  const beds = useWardStore(
    (state) => state.beds,
  );

  const [activeTab, setActiveTab] =
    useState<WardTab>('admission_queue');

  const [searchQuery, setSearchQuery] = useState('');

  const admissionQueue = useMemo(() => {
    const admittedPatientIds = new Set(
      admissions
        .filter(
          (admission) =>
            admission.status === 'admitted',
        )
        .map((admission) => admission.patientId),
    );

    return patients.filter((patient) => {
      const consultation = consultations.find(
        (item) =>
          item.patientId === patient.id &&
          item.disposition === 'admission',
      );

      return (
        patient.queueStatus === 'admitted' &&
        Boolean(consultation) &&
        !admittedPatientIds.has(patient.id)
      );
    });
  }, [
    admissions,
    consultations,
    patients,
  ]);

  const activeAdmissions = useMemo(() => {
    return admissions.filter(
      (admission) =>
        admission.status === 'admitted',
    );
  }, [admissions]);

  const normalizedSearch = searchQuery
    .trim()
    .toLowerCase();

  const filteredAdmissionQueue =
    admissionQueue.filter((patient) => {
      if (!normalizedSearch) {
        return true;
      }

      return [
        patient.fullName,
        patient.hospitalNumber,
        patient.phoneNumber,
      ].some((value) =>
        value
          .toLowerCase()
          .includes(normalizedSearch),
      );
    });

  const filteredAdmissions =
    activeAdmissions.filter((admission) => {
      if (!normalizedSearch) {
        return true;
      }

      const patient = patients.find(
        (item) =>
          item.id === admission.patientId,
      );

      return [
        patient?.fullName,
        patient?.hospitalNumber,
        admission.wardName,
        admission.bedNumber,
      ]
        .filter(Boolean)
        .some((value) =>
          value
            ?.toLowerCase()
            .includes(normalizedSearch),
        );
    });

  const availableBeds = beds.filter(
    (bed) => bed.status === 'available',
  ).length;

  const occupiedBeds = beds.filter(
    (bed) => bed.status === 'occupied',
  ).length;

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Return to home dashboard"
          accessibilityRole="button"
          hitSlop={10}
          onPress={() =>
            router.replace('/(app)' as Href)
          }
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
            Ward Nursing
          </Text>

          <View style={styles.connectionRow}>
            <View style={styles.connectionDot} />

            <Text style={styles.headerSubtitle}>
              Hospital LAN connected
            </Text>
          </View>
        </View>

        <View style={styles.headerIcon}>
          <Ionicons
            color={colors.success}
            name="bed"
            size={22}
          />
        </View>
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
                INPATIENT SERVICES
              </Text>

              <Text style={styles.heroTitle}>
                Ward management
              </Text>

              <Text style={styles.heroDescription}>
                Admit patients, allocate beds and record
                continuous inpatient nursing care.
              </Text>
            </View>

            <View style={styles.heroIcon}>
              <Ionicons
                color={colors.textOnPrimary}
                name="bed"
                size={29}
              />
            </View>
          </View>

          <View style={styles.heroStatistics}>
            <HeroStatistic
              label="Awaiting bed"
              value={String(admissionQueue.length)}
            />

            <View style={styles.heroDivider} />

            <HeroStatistic
              label="Admitted"
              value={String(activeAdmissions.length)}
            />

            <View style={styles.heroDivider} />

            <HeroStatistic
              label="Available beds"
              value={String(availableBeds)}
            />
          </View>
        </View>

        <View style={styles.feedbackNotice}>
          <View style={styles.feedbackIcon}>
            <Ionicons
              color={colors.primary}
              name="return-down-back-outline"
              size={24}
            />
          </View>

          <View style={styles.feedbackText}>
            <Text style={styles.feedbackTitle}>
              Continuous doctor feedback
            </Text>

            <Text style={styles.feedbackDescription}>
              Ward notes, medication administration and
              observations remain visible to the doctor who
              owns the patient’s case.
            </Text>
          </View>
        </View>

        <View style={styles.summaryGrid}>
          <SummaryCard
            icon="hourglass-outline"
            label="Waiting"
            tone="warning"
            value={String(admissionQueue.length)}
          />

          <SummaryCard
            icon="bed-outline"
            label="Occupied"
            tone="primary"
            value={String(occupiedBeds)}
          />

          <SummaryCard
            icon="checkmark-circle-outline"
            label="Available"
            tone="success"
            value={String(availableBeds)}
          />

          <SummaryCard
            icon="construct-outline"
            label="Unavailable"
            tone="danger"
            value={String(
              beds.filter(
                (bed) =>
                  bed.status === 'maintenance',
              ).length,
            )}
          />
        </View>

        <View style={styles.tabs}>
          <Pressable
            onPress={() =>
              setActiveTab('admission_queue')
            }
            style={[
              styles.tabButton,
              activeTab === 'admission_queue' &&
                styles.activeTabButton,
            ]}
          >
            <Ionicons
              color={
                activeTab === 'admission_queue'
                  ? colors.textOnPrimary
                  : colors.textSecondary
              }
              name="enter-outline"
              size={18}
            />

            <Text
              style={[
                styles.tabText,
                activeTab === 'admission_queue' &&
                  styles.activeTabText,
              ]}
            >
              Admission queue
            </Text>
          </Pressable>

          <Pressable
            onPress={() =>
              setActiveTab('admitted_patients')
            }
            style={[
              styles.tabButton,
              activeTab === 'admitted_patients' &&
                styles.activeTabButton,
            ]}
          >
            <Ionicons
              color={
                activeTab === 'admitted_patients'
                  ? colors.textOnPrimary
                  : colors.textSecondary
              }
              name="people-outline"
              size={18}
            />

            <Text
              style={[
                styles.tabText,
                activeTab ===
                  'admitted_patients' &&
                  styles.activeTabText,
              ]}
            >
              Admitted patients
            </Text>
          </Pressable>
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
            placeholder="Patient, hospital number or ward"
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

        {activeTab === 'admission_queue' ? (
          filteredAdmissionQueue.length ? (
            <View style={styles.list}>
              {filteredAdmissionQueue.map(
                (patient) => (
                  <AdmissionQueueCard
                    key={patient.id}
                    patient={patient}
                  />
                ),
              )}
            </View>
          ) : (
            <EmptyState
              description="Patients marked for admission by doctors will appear here."
              title="Admission queue is clear"
            />
          )
        ) : filteredAdmissions.length ? (
          <View style={styles.list}>
            {filteredAdmissions.map(
              (admission) => (
                <AdmittedPatientCard
                  admission={admission}
                  key={admission.id}
                />
              ),
            )}
          </View>
        ) : (
          <EmptyState
            description="Allocated inpatients will appear here for continuous ward care."
            title="No admitted patients"
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function AdmissionQueueCard({
  patient,
}: {
  patient: Patient;
}) {
  const consultation = useDoctorStore(
    (state) =>
      state.consultations.find(
        (item) =>
          item.patientId === patient.id &&
          item.disposition === 'admission',
      ),
  );

  if (!consultation) {
    return null;
  }

  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: '/ward/admit/[patientId]',
          params: {
            patientId: patient.id,
          },
        } as Href)
      }
      style={({ pressed }) => [
        styles.patientCard,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.priorityStrip} />

      <View style={styles.patientContent}>
        <View style={styles.patientHeader}>
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
          </View>

          <Ionicons
            color={colors.textMuted}
            name="chevron-forward"
            size={20}
          />
        </View>

        <View style={styles.diagnosisBox}>
          <Text style={styles.diagnosisLabel}>
            ADMISSION DIAGNOSIS
          </Text>

          <Text style={styles.diagnosisValue}>
            {consultation.definitiveDiagnosis ??
              'Diagnosis pending'}
          </Text>
        </View>

        <View style={styles.patientFooter}>
          <Text style={styles.caseOwnerText}>
            Case owner: {consultation.caseOwnerName}
          </Text>

          <Text style={styles.allocateText}>
            Allocate bed
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

function AdmittedPatientCard({
  admission,
}: {
  admission: WardAdmission;
}) {
  const patient = usePatientStore((state) =>
    state.getPatientById(admission.patientId),
  );

  if (!patient) {
    return null;
  }

  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: '/ward/[admissionId]',
          params: {
            admissionId: admission.id,
          },
        } as Href)
      }
      style={({ pressed }) => [
        styles.patientCard,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.admittedStrip} />

      <View style={styles.patientContent}>
        <View style={styles.patientHeader}>
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
          </View>

          <View style={styles.admittedBadge}>
            <View style={styles.admittedDot} />

            <Text style={styles.admittedText}>
              ADMITTED
            </Text>
          </View>
        </View>

        <View style={styles.bedInformation}>
          <View style={styles.bedIcon}>
            <Ionicons
              color={colors.primary}
              name="bed-outline"
              size={21}
            />
          </View>

          <View style={styles.bedText}>
            <Text style={styles.wardName}>
              {admission.wardName}
            </Text>

            <Text style={styles.bedNumber}>
              Bed {admission.bedNumber}
            </Text>
          </View>

          <Ionicons
            color={colors.textMuted}
            name="chevron-forward"
            size={20}
          />
        </View>
      </View>
    </Pressable>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Ionicons
          color={colors.success}
          name="checkmark-done-outline"
          size={32}
        />
      </View>

      <Text style={styles.emptyTitle}>
        {title}
      </Text>

      <Text style={styles.emptyDescription}>
        {description}
      </Text>
    </View>
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
  tone:
    | 'primary'
    | 'warning'
    | 'success'
    | 'danger';
}) {
  const tones = {
    primary: {
      background: colors.primarySoft,
      color: colors.primary,
    },
    warning: {
      background: colors.warningSoft,
      color: colors.warning,
    },
    success: {
      background: colors.successSoft,
      color: colors.success,
    },
    danger: {
      background: colors.dangerSoft,
      color: colors.danger,
    },
  };

  const selectedTone = tones[tone];

  return (
    <View style={styles.summaryCard}>
      <View
        style={[
          styles.summaryIcon,
          {
            backgroundColor:
              selectedTone.background,
          },
        ]}
      >
        <Ionicons
          color={selectedTone.color}
          name={icon}
          size={21}
        />
      </View>

      <Text style={styles.summaryValue}>
        {value}
      </Text>

      <Text style={styles.summaryLabel}>
        {label}
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

  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.successSoft,
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

  feedbackNotice: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
  },

  feedbackIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },

  feedbackText: {
    flex: 1,
    marginLeft: spacing.md,
  },

  feedbackTitle: {
    color: colors.textPrimary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.bold,
  },

  feedbackDescription: {
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

  tabs: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xxxl,
    padding: spacing.xs,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceMuted,
  },

  tabButton: {
    flex: 1,
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderRadius: radius.md,
  },

  activeTabButton: {
    backgroundColor: colors.primary,
  },

  tabText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: typography.weight.semibold,
  },

  activeTabText: {
    color: colors.textOnPrimary,
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

  list: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },

  patientCard: {
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },

  priorityStrip: {
    width: 5,
    backgroundColor: colors.warning,
  },

  admittedStrip: {
    width: 5,
    backgroundColor: colors.success,
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
  },

  diagnosisBox: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.warningSoft,
  },

  diagnosisLabel: {
    color: colors.warning,
    fontSize: 8,
    fontWeight: typography.weight.extraBold,
    letterSpacing: 0.7,
  },

  diagnosisValue: {
    marginTop: spacing.xs,
    color: colors.textPrimary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.semibold,
  },

  patientFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },

  caseOwnerText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 10,
  },

  allocateText: {
    color: colors.primary,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.bold,
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
    backgroundColor: colors.success,
  },

  admittedText: {
    color: colors.success,
    fontSize: 8,
    fontWeight: typography.weight.extraBold,
  },

  bedInformation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
  },

  bedIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },

  bedText: {
    flex: 1,
    marginHorizontal: spacing.md,
  },

  wardName: {
    color: colors.textPrimary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.bold,
  },

  bedNumber: {
    marginTop: 3,
    color: colors.textSecondary,
    fontSize: typography.size.caption,
  },

  emptyState: {
    alignItems: 'center',
    marginTop: spacing.lg,
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
    lineHeight: typography.lineHeight.label,
    textAlign: 'center',
  },

  pressed: {
    opacity: 0.7,
  },
});