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
import {
  colors,
  radius,
  shadows,
  spacing,
  typography,
} from '@/src/theme';
import type {
  Prescription,
  PrescriptionStatus,
} from '@/src/types/doctor';
import { getPatientInitials } from '@/src/types/patient';

type PharmacyFilter =
  | 'all'
  | 'pending'
  | 'partially_dispensed'
  | 'dispensed'
  | 'out_of_stock';

const filters: Array<{
  label: string;
  value: PharmacyFilter;
}> = [
  {
    label: 'All',
    value: 'all',
  },
  {
    label: 'Pending',
    value: 'pending',
  },
  {
    label: 'Partial',
    value: 'partially_dispensed',
  },
  {
    label: 'Dispensed',
    value: 'dispensed',
  },
  {
    label: 'Out of stock',
    value: 'out_of_stock',
  },
];

export default function PharmacyDashboardScreen() {
  const prescriptions = useDoctorStore(
    (state) => state.prescriptions,
  );

  const patients = usePatientStore(
    (state) => state.patients,
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] =
    useState<PharmacyFilter>('all');

  const filteredPrescriptions = useMemo(() => {
    const normalizedSearch = searchQuery
      .trim()
      .toLowerCase();

    return prescriptions
      .filter((prescription) => {
        return (
          selectedFilter === 'all' ||
          prescription.status === selectedFilter
        );
      })
      .filter((prescription) => {
        if (!normalizedSearch) {
          return true;
        }

        const patient = patients.find(
          (item) =>
            item.id === prescription.patientId,
        );

        return [
          patient?.fullName,
          patient?.hospitalNumber,
          prescription.definitiveDiagnosis,
          prescription.prescribedBy.fullName,
          ...prescription.items.map(
            (item) => item.drugName,
          ),
        ]
          .filter(Boolean)
          .some((value) =>
            value
              ?.toLowerCase()
              .includes(normalizedSearch),
          );
      })
      .sort(
        (first, second) =>
          new Date(second.prescribedAt).getTime() -
          new Date(first.prescribedAt).getTime(),
      );
  }, [
    patients,
    prescriptions,
    searchQuery,
    selectedFilter,
  ]);

  const pendingCount = prescriptions.filter(
    (prescription) =>
      prescription.status === 'pending',
  ).length;

  const partialCount = prescriptions.filter(
    (prescription) =>
      prescription.status ===
      'partially_dispensed',
  ).length;

  const dispensedCount = prescriptions.filter(
    (prescription) =>
      prescription.status === 'dispensed',
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
            Pharmacy
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
            name="bandage"
            size={21}
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
                MEDICATION SERVICES
              </Text>

              <Text style={styles.heroTitle}>
                Prescription queue
              </Text>

              <Text style={styles.heroDescription}>
                Review medication orders, dispense available
                drugs and return the outcome to the doctor.
              </Text>
            </View>

            <View style={styles.heroIcon}>
              <Ionicons
                color={colors.textOnPrimary}
                name="bandage"
                size={29}
              />
            </View>
          </View>

          <View style={styles.heroStatistics}>
            <HeroStatistic
              label="Pending"
              value={String(pendingCount)}
            />

            <View style={styles.heroDivider} />

            <HeroStatistic
              label="Partial"
              value={String(partialCount)}
            />

            <View style={styles.heroDivider} />

            <HeroStatistic
              label="Dispensed"
              value={String(dispensedCount)}
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
              Doctor feedback loop
            </Text>

            <Text style={styles.feedbackDescription}>
              Every dispensing update is returned to the
              doctor who owns the patient’s clinical case.
            </Text>
          </View>
        </View>

        <View style={styles.summaryGrid}>
          <SummaryCard
            icon="time-outline"
            label="Waiting"
            tone="warning"
            value={String(pendingCount)}
          />

          <SummaryCard
            icon="sync-outline"
            label="Partial"
            tone="info"
            value={String(partialCount)}
          />

          <SummaryCard
            icon="checkmark-done-outline"
            label="Completed"
            tone="success"
            value={String(dispensedCount)}
          />

          <SummaryCard
            icon="close-circle-outline"
            label="Out of stock"
            tone="danger"
            value={String(
              prescriptions.filter(
                (prescription) =>
                  prescription.status ===
                  'out_of_stock',
              ).length,
            )}
          />
        </View>

        <View style={styles.sectionHeading}>
          <View>
            <Text style={styles.sectionEyebrow}>
              PRESCRIPTION QUEUE
            </Text>

            <Text style={styles.sectionTitle}>
              Medication orders
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
            placeholder="Patient, hospital number or drug"
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
            const active =
              selectedFilter === filter.value;

            return (
              <Pressable
                key={filter.value}
                onPress={() =>
                  setSelectedFilter(filter.value)
                }
                style={[
                  styles.filterButton,
                  active &&
                    styles.selectedFilterButton,
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    active &&
                      styles.selectedFilterText,
                  ]}
                >
                  {filter.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {filteredPrescriptions.length ? (
          <View style={styles.prescriptionList}>
            {filteredPrescriptions.map(
              (prescription) => (
                <PrescriptionCard
                  key={prescription.id}
                  prescription={prescription}
                />
              ),
            )}
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
              Pharmacy queue is clear
            </Text>

            <Text style={styles.emptyDescription}>
              Prescriptions submitted by doctors will appear
              here automatically.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function PrescriptionCard({
  prescription,
}: {
  prescription: Prescription;
}) {
  const patient = usePatientStore((state) =>
    state.getPatientById(prescription.patientId),
  );

  if (!patient) {
    return null;
  }

  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname:
            '/pharmacy/[prescriptionId]',
          params: {
            prescriptionId: prescription.id,
          },
        } as Href)
      }
      style={({ pressed }) => [
        styles.prescriptionCard,
        pressed && styles.pressed,
      ]}
    >
      <View
        style={[
          styles.statusStrip,
          prescription.status ===
            'partially_dispensed' &&
            styles.partialStatusStrip,

          prescription.status === 'dispensed' &&
            styles.dispensedStatusStrip,

          prescription.status ===
            'out_of_stock' &&
            styles.outOfStockStatusStrip,
        ]}
      />

      <View style={styles.prescriptionContent}>
        <View style={styles.prescriptionHeader}>
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

          <PrescriptionStatusBadge
            status={prescription.status}
          />
        </View>

        <View style={styles.prescriptionMeta}>
          <MetaItem
            icon="medical-outline"
            value={prescription.prescribedBy.fullName}
          />

          <MetaItem
            icon="time-outline"
            value={new Date(
              prescription.prescribedAt,
            ).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          />
        </View>

        <View style={styles.diagnosisCard}>
          <Text style={styles.diagnosisLabel}>
            DEFINITIVE DIAGNOSIS
          </Text>

          <Text style={styles.diagnosisValue}>
            {prescription.definitiveDiagnosis}
          </Text>
        </View>

        <View style={styles.medicationSummary}>
          <View style={styles.medicationIcon}>
            <Ionicons
              color={colors.primary}
              name="bandage-outline"
              size={20}
            />
          </View>

          <View style={styles.medicationText}>
            <Text style={styles.medicationTitle}>
              {prescription.items.length}{' '}
              {prescription.items.length === 1
                ? 'medication'
                : 'medications'}
            </Text>

            <Text
              numberOfLines={2}
              style={styles.medicationDescription}
            >
              {prescription.items
                .map((item) => item.drugName)
                .join(', ')}
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

function PrescriptionStatusBadge({
  status,
}: {
  status: PrescriptionStatus;
}) {
  const configurations: Record<
    PrescriptionStatus,
    {
      label: string;
      background: string;
      color: string;
    }
  > = {
    pending: {
      label: 'Pending',
      background: colors.warningSoft,
      color: colors.warning,
    },

    partially_dispensed: {
      label: 'Partial',
      background: colors.infoSoft,
      color: colors.info,
    },

    dispensed: {
      label: 'Dispensed',
      background: colors.successSoft,
      color: colors.success,
    },

    out_of_stock: {
      label: 'Out of stock',
      background: colors.dangerSoft,
      color: colors.danger,
    },

    cancelled: {
      label: 'Cancelled',
      background: colors.dangerSoft,
      color: colors.danger,
    },
  };

  const configuration = configurations[status];

  return (
    <View
      style={[
        styles.statusBadge,
        {
          backgroundColor:
            configuration.background,
        },
      ]}
    >
      <View
        style={[
          styles.statusDot,
          {
            backgroundColor: configuration.color,
          },
        ]}
      />

      <Text
        style={[
          styles.statusText,
          {
            color: configuration.color,
          },
        ]}
      >
        {configuration.label}
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
    | 'warning'
    | 'info'
    | 'success'
    | 'danger';
}) {
  const tones = {
    warning: {
      background: colors.warningSoft,
      color: colors.warning,
    },

    info: {
      background: colors.infoSoft,
      color: colors.info,
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

      <Text style={styles.metaText}>{value}</Text>
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

  sectionHeading: {
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

  filters: {
    gap: spacing.sm,
    paddingTop: spacing.md,
    paddingRight: spacing.xl,
  },

  filterButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.round,
    backgroundColor: colors.surface,
  },

  selectedFilterButton: {
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
  },

  prescriptionList: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },

  prescriptionCard: {
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },

  statusStrip: {
    width: 5,
    backgroundColor: colors.warning,
  },

  partialStatusStrip: {
    backgroundColor: colors.info,
  },

  dispensedStatusStrip: {
    backgroundColor: colors.success,
  },

  outOfStockStatusStrip: {
    backgroundColor: colors.danger,
  },

  prescriptionContent: {
    flex: 1,
    padding: spacing.lg,
  },

  prescriptionHeader: {
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

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.round,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: radius.round,
  },

  statusText: {
    fontSize: 9,
    fontWeight: typography.weight.bold,
  },

  prescriptionMeta: {
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

  diagnosisCard: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
  },

  diagnosisLabel: {
    color: colors.primary,
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

  medicationSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
  },

  medicationIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },

  medicationText: {
    flex: 1,
    marginHorizontal: spacing.md,
  },

  medicationTitle: {
    color: colors.textPrimary,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.bold,
  },

  medicationDescription: {
    marginTop: 3,
    color: colors.textSecondary,
    fontSize: 10,
    lineHeight: 15,
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
    textAlign: 'center',
  },

  pressed: {
    opacity: 0.7,
  },
});