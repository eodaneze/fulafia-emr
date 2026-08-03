import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PatientStatusBadge } from '@/src/components';
import { usePatientStore } from '@/src/store/patient.store';
import {
  colors,
  radius,
  spacing,
  typography,
} from '@/src/theme';
import { getPatientInitials } from '@/src/types/patient';

export default function PatientDetailsScreen() {
  const { patientId } = useLocalSearchParams<{
    patientId: string;
  }>();

  const patient = usePatientStore((state) =>
    state.getPatientById(patientId),
  );

  if (!patient) {
    return (
      <SafeAreaView style={styles.notFoundScreen}>
        <View style={styles.notFoundIcon}>
          <Ionicons
            color={colors.primary}
            name="person-outline"
            size={34}
          />
        </View>

        <Text style={styles.notFoundTitle}>
          Patient not found
        </Text>

        <Text style={styles.notFoundDescription}>
          The requested patient record is unavailable.
        </Text>

        <Pressable
          onPress={() => router.replace('/(app)/patients')}
          style={styles.returnButton}
        >
          <Text style={styles.returnButtonText}>
            Return to patients
          </Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable
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
            Patient record
          </Text>

          <Text style={styles.headerSubtitle}>
            {patient.hospitalNumber}
          </Text>
        </View>

        <Pressable style={styles.moreButton}>
          <Ionicons
            color={colors.textPrimary}
            name="ellipsis-horizontal"
            size={22}
          />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {getPatientInitials(patient)}
            </Text>
          </View>

          <Text style={styles.patientName}>
            {patient.fullName}
          </Text>

          <Text style={styles.hospitalNumber}>
            {patient.hospitalNumber}
          </Text>

          <PatientStatusBadge
            status={patient.queueStatus}
          />

          <View style={styles.profileDetails}>
            <ProfileDetail
              label="Age"
              value={`${patient.age} years`}
            />

            <View style={styles.profileDivider} />

            <ProfileDetail
              label="Sex"
              value={
                patient.sex === 'male' ? 'Male' : 'Female'
              }
            />

            <View style={styles.profileDivider} />

            <ProfileDetail
              label="Visits"
              value={String(patient.totalVisits)}
            />
          </View>
        </View>

        <View style={styles.actionGrid}>
          <QuickAction
            icon="add-circle-outline"
            label="New visit"
          />

          <QuickAction
            icon="medkit-outline"
            label="Send to nursing"
          />

          <QuickAction
            icon="card-outline"
            label="Patient card"
          />

          <QuickAction
            icon="time-outline"
            label="Visit history"
          />
        </View>

        <InformationSection
          icon="person-outline"
          title="Personal information"
        >
          <InformationRow
            label="Patient category"
            value={formatPatientType(
              patient.patientType,
            )}
          />

          <InformationRow
            label="Date of birth"
            value={patient.dateOfBirth}
          />

          {patient.studentRegistrationNumber ? (
            <InformationRow
              label="Student registration number"
              value={patient.studentRegistrationNumber}
            />
          ) : null}

          {patient.staffNumber ? (
            <InformationRow
              label="Staff number"
              value={patient.staffNumber}
            />
          ) : null}

          <InformationRow
            label="Phone number"
            value={patient.phoneNumber}
          />

          <InformationRow
            label="Email address"
            value={patient.email ?? 'Not provided'}
          />

          <InformationRow
            label="Residential address"
            value={patient.address}
          />
        </InformationSection>

        <InformationSection
          icon="people-outline"
          title="Next of kin"
        >
          <InformationRow
            label="Full name"
            value={patient.nextOfKinName}
          />

          <InformationRow
            label="Relationship"
            value={patient.nextOfKinRelationship}
          />

          <InformationRow
            label="Phone number"
            value={patient.nextOfKinPhoneNumber}
          />
        </InformationSection>

        <InformationSection
          icon="medical-outline"
          title="Medical information"
        >
          <InformationRow
            label="Blood group"
            value={patient.bloodGroup ?? 'Not recorded'}
          />

          <InformationRow
            label="Genotype"
            value={patient.genotype ?? 'Not recorded'}
          />

          <InformationRow
            label="Known allergies"
            value={
              patient.allergies?.length
                ? patient.allergies.join(', ')
                : 'No known allergies'
            }
          />
        </InformationSection>

        <View style={styles.timelineCard}>
          <View style={styles.timelineHeader}>
            <View style={styles.timelineIcon}>
              <Ionicons
                color={colors.primary}
                name="git-network-outline"
                size={22}
              />
            </View>

            <View>
              <Text style={styles.timelineTitle}>
                Current patient journey
              </Text>

              <Text style={styles.timelineSubtitle}>
                Activities within the active visit
              </Text>
            </View>
          </View>

          <TimelineItem
            active
            label="Patient registered"
            time="08:20 AM"
          />

          <TimelineConnector />

          <TimelineItem
            active={
              patient.queueStatus !== 'waiting_for_vitals'
            }
            label="Nursing and vital signs"
            time={
              patient.queueStatus === 'waiting_for_vitals'
                ? 'Waiting'
                : 'Completed'
            }
          />

          <TimelineConnector />

          <TimelineItem
            active={[
              'waiting_for_doctor',
              'under_consultation',
              'waiting_for_lab',
              'lab_result_ready',
              'waiting_for_pharmacy',
              'admitted',
              'discharged',
            ].includes(patient.queueStatus)}
            label="Doctor consultation"
            time="Pending"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function formatPatientType(
  patientType:
    | 'student'
    | 'staff'
    | 'dependent'
    | 'public',
): string {
  const labels = {
    student: 'Student',
    staff: 'Staff',
    dependent: 'Dependant',
    public: 'Public patient',
  };

  return labels[patientType];
}

function ProfileDetail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.profileDetail}>
      <Text style={styles.profileDetailValue}>
        {value}
      </Text>

      <Text style={styles.profileDetailLabel}>
        {label}
      </Text>
    </View>
  );
}

function QuickAction({
  icon,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.quickAction,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.quickActionIcon}>
        <Ionicons
          color={colors.primary}
          name={icon}
          size={22}
        />
      </View>

      <Text style={styles.quickActionLabel}>
        {label}
      </Text>
    </Pressable>
  );
}

function InformationSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.informationSection}>
      <View style={styles.informationHeader}>
        <View style={styles.informationIcon}>
          <Ionicons
            color={colors.primary}
            name={icon}
            size={21}
          />
        </View>

        <Text style={styles.informationTitle}>
          {title}
        </Text>
      </View>

      <View style={styles.informationRows}>
        {children}
      </View>
    </View>
  );
}

function InformationRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.informationRow}>
      <Text style={styles.informationLabel}>
        {label}
      </Text>

      <Text style={styles.informationValue}>
        {value}
      </Text>
    </View>
  );
}

function TimelineItem({
  label,
  time,
  active,
}: {
  label: string;
  time: string;
  active: boolean;
}) {
  return (
    <View style={styles.timelineItem}>
      <View
        style={[
          styles.timelineStatus,
          active && styles.activeTimelineStatus,
        ]}
      >
        <Ionicons
          color={
            active
              ? colors.textOnPrimary
              : colors.textMuted
          }
          name={active ? 'checkmark' : 'ellipse-outline'}
          size={14}
        />
      </View>

      <Text style={styles.timelineItemLabel}>
        {label}
      </Text>

      <Text style={styles.timelineItemTime}>
        {time}
      </Text>
    </View>
  );
}

function TimelineConnector() {
  return <View style={styles.timelineConnector} />;
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
    color: colors.primary,
    fontSize: typography.size.caption,
  },

  moreButton: {
    width: 42,
    height: 42,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },

  content: {
    padding: spacing.screenHorizontal,
    paddingBottom: spacing.massive,
  },

  profileCard: {
    alignItems: 'center',
    marginTop: spacing.lg,
    padding: spacing.xl,
    borderRadius: radius.xl,
    backgroundColor: colors.primaryDark,
  },

  avatar: {
    width: 76,
    height: 76,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.16)',
    backgroundColor: colors.primary,
  },

  avatarText: {
    color: colors.textOnPrimary,
    fontSize: 24,
    fontWeight: typography.weight.extraBold,
  },

  patientName: {
    marginTop: spacing.lg,
    color: colors.textOnPrimary,
    fontSize: typography.size.sectionTitle,
    fontWeight: typography.weight.extraBold,
    textAlign: 'center',
  },

  hospitalNumber: {
    marginTop: spacing.xs,
    marginBottom: spacing.md,
    color: colors.secondary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.semibold,
  },

  profileDetails: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.12)',
  },

  profileDetail: {
    flex: 1,
    alignItems: 'center',
  },

  profileDetailValue: {
    color: colors.textOnPrimary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.bold,
  },

  profileDetailLabel: {
    marginTop: 3,
    color: 'rgba(255,255,255,0.48)',
    fontSize: 10,
  },

  profileDivider: {
    width: 1,
    height: 35,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },

  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.lg,
  },

  quickAction: {
    width: '47.9%',
    minHeight: 104,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },

  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },

  quickActionLabel: {
    marginTop: spacing.sm,
    color: colors.textPrimary,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.bold,
    textAlign: 'center',
  },

  informationSection: {
    marginTop: spacing.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
  },

  informationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  informationIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },

  informationTitle: {
    marginLeft: spacing.md,
    color: colors.textPrimary,
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
  },

  informationRows: {
    marginTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  informationRow: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  informationLabel: {
    color: colors.textMuted,
    fontSize: typography.size.caption,
  },

  informationValue: {
    marginTop: spacing.xs,
    color: colors.textPrimary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.semibold,
    lineHeight: typography.lineHeight.label,
  },

  timelineCard: {
    marginTop: spacing.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
  },

  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },

  timelineIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },

  timelineTitle: {
    marginLeft: spacing.md,
    color: colors.textPrimary,
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
  },

  timelineSubtitle: {
    marginTop: 2,
    marginLeft: spacing.md,
    color: colors.textSecondary,
    fontSize: typography.size.caption,
  },

  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  timelineStatus: {
    width: 30,
    height: 30,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },

  activeTimelineStatus: {
    backgroundColor: colors.primary,
  },

  timelineItemLabel: {
    flex: 1,
    marginLeft: spacing.md,
    color: colors.textPrimary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.semibold,
  },

  timelineItemTime: {
    color: colors.textMuted,
    fontSize: typography.size.caption,
  },

  timelineConnector: {
    width: 2,
    height: 24,
    marginLeft: 14,
    backgroundColor: colors.border,
  },

  notFoundScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
    backgroundColor: colors.background,
  },

  notFoundIcon: {
    width: 72,
    height: 72,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },

  notFoundTitle: {
    marginTop: spacing.lg,
    color: colors.textPrimary,
    fontSize: typography.size.sectionTitle,
    fontWeight: typography.weight.bold,
  },

  notFoundDescription: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontSize: typography.size.label,
    textAlign: 'center',
  },

  returnButton: {
    minHeight: 52,
    marginTop: spacing.xl,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },

  returnButtonText: {
    color: colors.textOnPrimary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.bold,
  },

  pressed: {
    opacity: 0.7,
  },
});