import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo } from 'react';
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
  type PatientType,
} from '@/src/types/patient';

type PatientFilter = 'all' | PatientType;

type FilterOption = {
  label: string;
  value: PatientFilter;
};

const filters: FilterOption[] = [
  {
    label: 'All',
    value: 'all',
  },
  {
    label: 'Students',
    value: 'student',
  },
  {
    label: 'Staff',
    value: 'staff',
  },
  {
    label: 'Dependants',
    value: 'dependent',
  },
  {
    label: 'Public',
    value: 'public',
  },
];

export default function PatientsScreen() {
  const patients = usePatientStore(
    (state) => state.patients,
  );

  const searchQuery = usePatientStore(
    (state) => state.searchQuery,
  );

  const selectedFilter = usePatientStore(
    (state) => state.selectedFilter,
  );

  const setSearchQuery = usePatientStore(
    (state) => state.setSearchQuery,
  );

  const setSelectedFilter = usePatientStore(
    (state) => state.setSelectedFilter,
  );

  const filteredPatients = useMemo(() => {
    const normalizedSearch = searchQuery
      .trim()
      .toLowerCase();

    return patients.filter((patient) => {
      const matchesFilter =
        selectedFilter === 'all' ||
        patient.patientType === selectedFilter;

      if (!matchesFilter) {
        return false;
      }

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
          value?.toLowerCase().includes(normalizedSearch),
        );
    });
  }, [patients, searchQuery, selectedFilter]);

  const patientsToday = patients.filter((patient) => {
    if (!patient.lastVisitAt) {
      return false;
    }

    return (
      new Date(patient.lastVisitAt).toDateString() ===
      new Date().toDateString()
    );
  }).length;

  const waitingPatients = patients.filter(
    (patient) =>
      patient.queueStatus !== 'not_in_queue' &&
      patient.queueStatus !== 'discharged',
  ).length;

  return (
    <SafeAreaView
      edges={['bottom']}
      style={styles.screen}
    >
      <View style={styles.page}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <View style={styles.heroTop}>
              <View style={styles.heroText}>
                <Text style={styles.heroEyebrow}>
                  MEDICAL RECORDS
                </Text>

                <Text style={styles.heroTitle}>
                  Patient management
                </Text>

                <Text style={styles.heroDescription}>
                  Register patients, search medical records
                  and manage consultation visits.
                </Text>
              </View>

              <View style={styles.heroIcon}>
                <Ionicons
                  color={colors.textOnPrimary}
                  name="people"
                  size={28}
                />
              </View>
            </View>

            <View style={styles.heroStatistics}>
              <HeroStatistic
                label="All patients"
                value={String(patients.length)}
              />

              <View style={styles.heroDivider} />

              <HeroStatistic
                label="Today"
                value={String(patientsToday)}
              />

              <View style={styles.heroDivider} />

              <HeroStatistic
                label="In queue"
                value={String(waitingPatients)}
              />
            </View>
          </View>

          <Pressable
            onPress={() => router.push('/patient/register')}
            style={({ pressed }) => [
              styles.registerButton,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.registerIcon}>
              <Ionicons
                color={colors.textOnPrimary}
                name="person-add"
                size={22}
              />
            </View>

            <View style={styles.registerText}>
              <Text style={styles.registerTitle}>
                Register a new patient
              </Text>

              <Text style={styles.registerDescription}>
                Create a hospital record and begin a new
                consultation visit.
              </Text>
            </View>

            <Ionicons
              color={colors.primary}
              name="arrow-forward-circle"
              size={28}
            />
          </Pressable>

          <View style={styles.searchSection}>
            <Text style={styles.sectionTitle}>
              Find a patient
            </Text>

            <View style={styles.searchInputContainer}>
              <Ionicons
                color={colors.textSecondary}
                name="search-outline"
                size={21}
              />

              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={setSearchQuery}
                placeholder="Name, hospital number, student ID..."
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

            <ScrollView
              contentContainerStyle={styles.filters}
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              {filters.map((filter) => {
                const isSelected =
                  selectedFilter === filter.value;

                return (
                  <Pressable
                    key={filter.value}
                    onPress={() =>
                      setSelectedFilter(filter.value)
                    }
                    style={({ pressed }) => [
                      styles.filter,
                      isSelected && styles.selectedFilter,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterText,
                        isSelected &&
                          styles.selectedFilterText,
                      ]}
                    >
                      {filter.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.listHeader}>
            <View>
              <Text style={styles.listEyebrow}>
                PATIENT DIRECTORY
              </Text>

              <Text style={styles.listTitle}>
                {filteredPatients.length}{' '}
                {filteredPatients.length === 1
                  ? 'patient'
                  : 'patients'}
              </Text>
            </View>

            <View style={styles.sortButton}>
              <Ionicons
                color={colors.textSecondary}
                name="funnel-outline"
                size={18}
              />

              <Text style={styles.sortText}>Recent</Text>
            </View>
          </View>

          {filteredPatients.length > 0 ? (
            <View style={styles.patientList}>
              {filteredPatients.map((patient) => (
                <PatientCard
                  key={patient.id}
                  patient={patient}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  color={colors.primary}
                  name="search-outline"
                  size={30}
                />
              </View>

              <Text style={styles.emptyTitle}>
                No patients found
              </Text>

              <Text style={styles.emptyDescription}>
                Try another name, hospital number or patient
                category.
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
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
      <Text style={styles.heroStatisticValue}>{value}</Text>

      <Text style={styles.heroStatisticLabel}>{label}</Text>
    </View>
  );
}

function PatientCard({ patient }: { patient: Patient }) {
  const patientTypeLabels: Record<
    PatientType,
    string
  > = {
    student: 'Student',
    staff: 'Staff',
    dependent: 'Dependant',
    public: 'Public',
  };

  return (
    <Pressable
      onPress={() =>
        router.push(`/patient/${patient.id}`)
      }
      style={({ pressed }) => [
        styles.patientCard,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.patientTop}>
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

      <View style={styles.patientDetails}>
        <PatientDetail
          icon="person-outline"
          value={`${patient.age} years · ${
            patient.sex === 'male' ? 'Male' : 'Female'
          }`}
        />

        <PatientDetail
          icon="id-card-outline"
          value={patientTypeLabels[patient.patientType]}
        />

        <PatientDetail
          icon="call-outline"
          value={patient.phoneNumber}
        />
      </View>

      {patient.studentRegistrationNumber ? (
        <View style={styles.registrationNumber}>
          <Ionicons
            color={colors.primary}
            name="school-outline"
            size={15}
          />

          <Text style={styles.registrationNumberText}>
            {patient.studentRegistrationNumber}
          </Text>
        </View>
      ) : null}

      {patient.staffNumber ? (
        <View style={styles.registrationNumber}>
          <Ionicons
            color={colors.primary}
            name="briefcase-outline"
            size={15}
          />

          <Text style={styles.registrationNumberText}>
            {patient.staffNumber}
          </Text>
        </View>
      ) : null}

      <View style={styles.patientFooter}>
        <PatientStatusBadge
          status={patient.queueStatus}
        />

        <Text style={styles.visitCount}>
          {patient.totalVisits}{' '}
          {patient.totalVisits === 1 ? 'visit' : 'visits'}
        </Text>
      </View>
    </Pressable>
  );
}

function PatientDetail({
  icon,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
}) {
  return (
    <View style={styles.patientDetail}>
      <Ionicons
        color={colors.textMuted}
        name={icon}
        size={15}
      />

      <Text
        numberOfLines={1}
        style={styles.patientDetailText}
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

  page: {
    flex: 1,
  },

  content: {
    padding: spacing.screenHorizontal,
    paddingBottom: spacing.massive,
  },

  hero: {
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
    color: 'rgba(255,255,255,0.52)',
    fontSize: 10,
  },

  heroDivider: {
    width: 1,
    height: 34,
    marginHorizontal: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },

  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#BDE6D2',
    backgroundColor: colors.successSoft,
  },

  registerIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },

  registerText: {
    flex: 1,
    marginHorizontal: spacing.md,
  },

  registerTitle: {
    color: colors.textPrimary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.bold,
  },

  registerDescription: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },

  searchSection: {
    marginTop: spacing.xxxl,
  },

  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.size.cardTitle,
    fontWeight: typography.weight.bold,
  },

  searchInputContainer: {
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

  filters: {
    gap: spacing.sm,
    paddingTop: spacing.md,
    paddingRight: spacing.xl,
  },

  filter: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.round,
    backgroundColor: colors.surface,
  },

  selectedFilter: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },

  filterText: {
    color: colors.textSecondary,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.semibold,
  },

  selectedFilterText: {
    color: colors.textOnPrimary,
    fontWeight: typography.weight.bold,
  },

  listHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: spacing.xxxl,
    marginBottom: spacing.md,
  },

  listEyebrow: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: typography.weight.extraBold,
    letterSpacing: 1.3,
  },

  listTitle: {
    marginTop: spacing.xs,
    color: colors.textPrimary,
    fontSize: typography.size.cardTitle,
    fontWeight: typography.weight.bold,
  },

  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
  },

  sortText: {
    color: colors.textSecondary,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.semibold,
  },

  patientList: {
    gap: spacing.md,
  },

  patientCard: {
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },

  patientTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  patientAvatar: {
    width: 48,
    height: 48,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },

  patientAvatarText: {
    color: colors.primaryDark,
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

  patientDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.lg,
  },

  patientDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },

  patientDetailText: {
    color: colors.textSecondary,
    fontSize: typography.size.caption,
  },

  registrationNumber: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 7,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
  },

  registrationNumberText: {
    color: colors.primary,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.semibold,
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

  visitCount: {
    color: colors.textMuted,
    fontSize: typography.size.caption,
  },

  emptyState: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.massive,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
  },

  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },

  emptyTitle: {
    marginTop: spacing.lg,
    color: colors.textPrimary,
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
  },

  emptyDescription: {
    maxWidth: 270,
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