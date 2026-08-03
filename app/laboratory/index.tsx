import { Ionicons } from '@expo/vector-icons';
import { router, type Href} from 'expo-router';
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
import { useLaboratoryStore } from '@/src/store/laboratory.store';
import { usePatientStore } from '@/src/store/patient.store';
import {
  colors,
  radius,
  shadows,
  spacing,
  typography,
} from '@/src/theme';
import type {
  LaboratoryRequest,
  LaboratoryRequestStatus,
} from '@/src/types/doctor';
import { getPatientInitials } from '@/src/types/patient';

type RequestFilter =
  | 'all'
  | 'requested'
  | 'sample_collected'
  | 'processing'
  | 'completed';

const filters: Array<{
  label: string;
  value: RequestFilter;
}> = [
  {
    label: 'All',
    value: 'all',
  },
  {
    label: 'New',
    value: 'requested',
  },
  {
    label: 'Collected',
    value: 'sample_collected',
  },
  {
    label: 'Processing',
    value: 'processing',
  },
  {
    label: 'Completed',
    value: 'completed',
  },
];

export default function LaboratoryDashboardScreen() {
  const laboratoryRequests = useDoctorStore(
    (state) => state.laboratoryRequests,
  );

  const laboratoryResults = useLaboratoryStore(
    (state) => state.laboratoryResults,
  );

  const patients = usePatientStore(
    (state) => state.patients,
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] =
    useState<RequestFilter>('all');

  const filteredRequests = useMemo(() => {
    const normalizedSearch = searchQuery
      .trim()
      .toLowerCase();

    return laboratoryRequests
      .filter((request) => {
        return (
          selectedFilter === 'all' ||
          request.status === selectedFilter
        );
      })
      .filter((request) => {
        if (!normalizedSearch) {
          return true;
        }

        const patient = patients.find(
          (item) => item.id === request.patientId,
        );

        return [
          patient?.fullName,
          patient?.hospitalNumber,
          request.id,
          ...request.tests.map((test) => test.name),
        ]
          .filter(Boolean)
          .some((value) =>
            value
              ?.toLowerCase()
              .includes(normalizedSearch),
          );
      })
      .sort((first, second) => {
        if (
          first.priority === 'urgent' &&
          second.priority !== 'urgent'
        ) {
          return -1;
        }

        if (
          first.priority !== 'urgent' &&
          second.priority === 'urgent'
        ) {
          return 1;
        }

        return (
          new Date(second.requestedAt).getTime() -
          new Date(first.requestedAt).getTime()
        );
      });
  }, [
    laboratoryRequests,
    patients,
    searchQuery,
    selectedFilter,
  ]);

  const pendingCount = laboratoryRequests.filter(
    (request) =>
      request.status !== 'completed' &&
      request.status !== 'cancelled',
  ).length;

  const urgentCount = laboratoryRequests.filter(
    (request) =>
      request.priority === 'urgent' &&
      request.status !== 'completed',
  ).length;

  const completedCount = laboratoryRequests.filter(
    (request) => request.status === 'completed',
  ).length;

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Return to home dashboard"
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
            Laboratory
          </Text>

          <View style={styles.connectionRow}>
            <View style={styles.connectionDot} />

            <Text style={styles.headerSubtitle}>
              Local laboratory service online
            </Text>
          </View>
        </View>

        <View style={styles.headerStatus}>
          <Ionicons
            color={colors.success}
            name="flask"
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
                DIAGNOSTIC SERVICES
              </Text>

              <Text style={styles.heroTitle}>
                Laboratory requests
              </Text>

              <Text style={styles.heroDescription}>
                Receive investigations, record specimens and
                return validated results to the requesting
                doctor.
              </Text>
            </View>

            <View style={styles.heroIcon}>
              <Ionicons
                color={colors.textOnPrimary}
                name="flask"
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
              label="Urgent"
              value={String(urgentCount)}
            />

            <View style={styles.heroDivider} />

            <HeroStatistic
              label="Completed"
              value={String(completedCount)}
            />
          </View>
        </View>

        <View style={styles.blindAccessNotice}>
          <View style={styles.blindAccessIcon}>
            <Ionicons
              color={colors.info}
              name="eye-off-outline"
              size={24}
            />
          </View>

          <View style={styles.blindAccessText}>
            <Text style={styles.blindAccessTitle}>
              Blinded laboratory workflow
            </Text>

            <Text style={styles.blindAccessDescription}>
              Clinical diagnoses and complete vital signs are
              hidden to reduce diagnostic bias.
            </Text>
          </View>
        </View>

        <View style={styles.summaryGrid}>
          <SummaryCard
            icon="download-outline"
            label="New requests"
            tone="primary"
            value={String(
              laboratoryRequests.filter(
                (request) =>
                  request.status === 'requested',
              ).length,
            )}
          />

          <SummaryCard
            icon="water-outline"
            label="Collected"
            tone="info"
            value={String(
              laboratoryRequests.filter(
                (request) =>
                  request.status ===
                  'sample_collected',
              ).length,
            )}
          />

          <SummaryCard
            icon="sync-outline"
            label="Processing"
            tone="warning"
            value={String(
              laboratoryRequests.filter(
                (request) =>
                  request.status === 'processing',
              ).length,
            )}
          />

          <SummaryCard
            icon="checkmark-done-outline"
            label="Validated"
            tone="success"
            value={String(laboratoryResults.length)}
          />
        </View>

        <View style={styles.sectionHeading}>
          <View>
            <Text style={styles.sectionEyebrow}>
              REQUEST QUEUE
            </Text>

            <Text style={styles.sectionTitle}>
              Laboratory workload
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
            placeholder="Patient, hospital number or test"
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
                style={[
                  styles.filterButton,
                  isSelected &&
                    styles.selectedFilterButton,
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

        {filteredRequests.length ? (
          <View style={styles.requestList}>
            {filteredRequests.map((request) => (
              <LaboratoryRequestCard
                key={request.id}
                request={request}
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
              No laboratory requests
            </Text>

            <Text style={styles.emptyDescription}>
              Requests submitted by doctors will appear here
              automatically.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function LaboratoryRequestCard({
  request,
}: {
  request: LaboratoryRequest;
}) {
  const patient = usePatientStore((state) =>
    state.getPatientById(request.patientId),
  );

  if (!patient) {
    return null;
  }

  return (
    <Pressable
      onPress={() =>
        router.push({
            pathname: '/laboratory/[requestId]',
            params: {
                requestId: request.id,
            },
        } as Href)
      }
      style={({ pressed }) => [
        styles.requestCard,
        pressed && styles.pressed,
      ]}
    >
      <View
        style={[
          styles.priorityStrip,
          request.priority === 'urgent' &&
            styles.urgentPriorityStrip,
        ]}
      />

      <View style={styles.requestContent}>
        <View style={styles.requestHeader}>
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

          <RequestStatusBadge
            status={request.status}
          />
        </View>

        <View style={styles.requestMeta}>
          <MetaItem
            icon="person-outline"
            value={`${patient.age} years · ${
              patient.sex === 'male'
                ? 'Male'
                : 'Female'
            }`}
          />

          <MetaItem
            icon="medical-outline"
            value={request.requestedBy.fullName}
          />

          <MetaItem
            icon="time-outline"
            value={formatRequestTime(
              request.requestedAt,
            )}
          />
        </View>

        <View style={styles.testSummary}>
          <View style={styles.testSummaryIcon}>
            <Ionicons
              color={colors.primary}
              name="flask-outline"
              size={19}
            />
          </View>

          <View style={styles.testSummaryText}>
            <Text style={styles.testSummaryTitle}>
              {request.tests.length}{' '}
              {request.tests.length === 1
                ? 'investigation'
                : 'investigations'}
            </Text>

            <Text
              numberOfLines={2}
              style={styles.testSummaryDescription}
            >
              {request.tests
                .map((test) => test.name)
                .join(', ')}
            </Text>
          </View>

          <Ionicons
            color={colors.textMuted}
            name="chevron-forward"
            size={20}
          />
        </View>

        {request.priority === 'urgent' ? (
          <View style={styles.urgentNotice}>
            <Ionicons
              color={colors.danger}
              name="alert-circle"
              size={16}
            />

            <Text style={styles.urgentNoticeText}>
              Urgent laboratory request
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

function RequestStatusBadge({
  status,
}: {
  status: LaboratoryRequestStatus;
}) {
  const configuration: Record<
    LaboratoryRequestStatus,
    {
      label: string;
      background: string;
      color: string;
    }
  > = {
    requested: {
      label: 'New',
      background: colors.primarySoft,
      color: colors.primary,
    },
    sample_collected: {
      label: 'Collected',
      background: colors.infoSoft,
      color: colors.info,
    },
    processing: {
      label: 'Processing',
      background: colors.warningSoft,
      color: colors.warning,
    },
    completed: {
      label: 'Completed',
      background: colors.successSoft,
      color: colors.success,
    },
    cancelled: {
      label: 'Cancelled',
      background: colors.dangerSoft,
      color: colors.danger,
    },
  };

  const selected = configuration[status];

  return (
    <View
      style={[
        styles.statusBadge,
        {
          backgroundColor: selected.background,
        },
      ]}
    >
      <View
        style={[
          styles.statusDot,
          {
            backgroundColor: selected.color,
          },
        ]}
      />

      <Text
        style={[
          styles.statusText,
          {
            color: selected.color,
          },
        ]}
      >
        {selected.label}
      </Text>
    </View>
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

function formatRequestTime(value: string): string {
  return new Date(value).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
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

  headerStatus: {
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

  blindAccessNotice: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.infoSoft,
  },

  blindAccessIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },

  blindAccessText: {
    flex: 1,
    marginLeft: spacing.md,
  },

  blindAccessTitle: {
    color: colors.textPrimary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.bold,
  },

  blindAccessDescription: {
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
    justifyContent: 'space-between',
    alignItems: 'flex-end',
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

  requestList: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },

  requestCard: {
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },

  priorityStrip: {
    width: 5,
    backgroundColor: colors.primary,
  },

  urgentPriorityStrip: {
    backgroundColor: colors.danger,
  },

  requestContent: {
    flex: 1,
    padding: spacing.lg,
  },

  requestHeader: {
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

  requestMeta: {
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

  testSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
  },

  testSummaryIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },

  testSummaryText: {
    flex: 1,
    marginHorizontal: spacing.md,
  },

  testSummaryTitle: {
    color: colors.textPrimary,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.bold,
  },

  testSummaryDescription: {
    marginTop: 3,
    color: colors.textSecondary,
    fontSize: 10,
    lineHeight: 15,
  },

  urgentNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },

  urgentNoticeText: {
    color: colors.danger,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.bold,
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