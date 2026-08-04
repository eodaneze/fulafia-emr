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

import { useEquipmentStore } from '@/src/store/equipment.store';
import {
  colors,
  radius,
  spacing,
  typography,
} from '@/src/theme';
import type {
  EquipmentStatus,
  HospitalEquipment,
} from '@/src/types/equipment';

type EquipmentFilter =
  | 'all'
  | EquipmentStatus;

const filters: Array<{
  label: string;
  value: EquipmentFilter;
}> = [
  {
    label: 'All',
    value: 'all',
  },
  {
    label: 'Working',
    value: 'working',
  },
  {
    label: 'Under repair',
    value: 'under_repair',
  },
  {
    label: 'Maintenance due',
    value: 'maintenance_due',
  },
  {
    label: 'Retired',
    value: 'retired',
  },
];

export default function EquipmentDashboardScreen() {
  const equipment = useEquipmentStore(
    (state) => state.equipment,
  );

  const [searchQuery, setSearchQuery] =
    useState('');

  const [selectedFilter, setSelectedFilter] =
    useState<EquipmentFilter>('all');

  const filteredEquipment = useMemo(() => {
    const normalizedSearch = searchQuery
      .trim()
      .toLowerCase();

    return equipment
      .filter((item) => {
        return (
          selectedFilter === 'all' ||
          item.status === selectedFilter
        );
      })
      .filter((item) => {
        if (!normalizedSearch) {
          return true;
        }

        return [
          item.name,
          item.serialNumber,
          item.category,
          item.department,
          item.assignedOfficer,
          item.location,
        ].some((value) =>
          value
            .toLowerCase()
            .includes(normalizedSearch),
        );
      })
      .sort((first, second) =>
        first.name.localeCompare(second.name),
      );
  }, [
    equipment,
    searchQuery,
    selectedFilter,
  ]);

  const workingCount = equipment.filter(
    (item) => item.status === 'working',
  ).length;

  const repairCount = equipment.filter(
    (item) =>
      item.status === 'under_repair',
  ).length;

  const maintenanceDueCount =
    equipment.filter(
      (item) =>
        item.status === 'maintenance_due',
    ).length;

  const retiredCount = equipment.filter(
    (item) => item.status === 'retired',
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
            styles.headerButton,
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
            Equipment Management
          </Text>

          <View style={styles.connectionRow}>
            <View style={styles.connectionDot} />

            <Text style={styles.headerSubtitle}>
              Asset service online
            </Text>
          </View>
        </View>

        <Pressable
          accessibilityLabel="Add hospital equipment"
          accessibilityRole="button"
          onPress={() =>
            router.push(
              '/equipment/create' as Href,
            )
          }
          style={({ pressed }) => [
            styles.addButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            color={colors.textOnPrimary}
            name="add"
            size={23}
          />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.heroText}>
            <Text style={styles.heroEyebrow}>
              ASSET MONITORING
            </Text>

            <Text style={styles.heroTitle}>
              Hospital equipment
            </Text>

            <Text style={styles.heroDescription}>
              Track equipment assignment,
              maintenance schedules, warranty
              information and operational condition.
            </Text>
          </View>

          <View style={styles.heroIcon}>
            <Ionicons
              color={colors.textOnPrimary}
              name="construct-outline"
              size={29}
            />
          </View>
        </View>

        <View style={styles.summaryGrid}>
          <SummaryCard
            icon="checkmark-circle-outline"
            label="Working"
            tone="success"
            value={workingCount}
          />

          <SummaryCard
            icon="construct-outline"
            label="Under repair"
            tone="danger"
            value={repairCount}
          />

          <SummaryCard
            icon="time-outline"
            label="Maintenance due"
            tone="warning"
            value={maintenanceDueCount}
          />

          <SummaryCard
            icon="archive-outline"
            label="Retired"
            tone="info"
            value={retiredCount}
          />
        </View>

        <View style={styles.notice}>
          <View style={styles.noticeIcon}>
            <Ionicons
              color={colors.warning}
              name="notifications-outline"
              size={23}
            />
          </View>

          <View style={styles.noticeText}>
            <Text style={styles.noticeTitle}>
              Preventive maintenance
            </Text>

            <Text
              style={styles.noticeDescription}
            >
              {maintenanceDueCount} equipment
              record
              {maintenanceDueCount === 1
                ? ''
                : 's'}{' '}
              currently require maintenance
              attention.
            </Text>
          </View>
        </View>

        <View style={styles.sectionHeading}>
          <View>
            <Text style={styles.sectionEyebrow}>
              ASSET REGISTER
            </Text>

            <Text style={styles.sectionTitle}>
              Equipment records
            </Text>
          </View>

          <View style={styles.countBadge}>
            <Text style={styles.countText}>
              {filteredEquipment.length}
            </Text>
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
            placeholder="Equipment, serial number or department"
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
                  setSelectedFilter(
                    filter.value,
                  )
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

        {filteredEquipment.length ? (
          <View style={styles.equipmentList}>
            {filteredEquipment.map((item) => (
              <EquipmentCard
                equipment={item}
                key={item.id}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons
                color={colors.primary}
                name="construct-outline"
                size={34}
              />
            </View>

            <Text style={styles.emptyTitle}>
              No equipment found
            </Text>

            <Text
              style={styles.emptyDescription}
            >
              Change the search text or equipment
              status filter.
            </Text>
          </View>
        )}

        <View style={styles.lanNotice}>
          <View style={styles.lanIcon}>
            <Ionicons
              color={colors.success}
              name="server-outline"
              size={22}
            />
          </View>

          <View style={styles.lanText}>
            <Text style={styles.lanTitle}>
              Local asset register
            </Text>

            <Text style={styles.lanDescription}>
              Equipment information remains
              available to authorized departments
              through the hospital LAN.
            </Text>
          </View>

          <View style={styles.onlineBadge}>
            <View style={styles.onlineDot} />

            <Text style={styles.onlineText}>
              ONLINE
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function EquipmentCard({
  equipment,
}: {
  equipment: HospitalEquipment;
}) {
  const statusTone = getStatusTone(
    equipment.status,
  );

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() =>
        router.push({
          pathname:
            '/equipment/[equipmentId]',
          params: {
            equipmentId: equipment.id,
          },
        } as Href)
      }
      style={({ pressed }) => [
        styles.equipmentCard,
        pressed && styles.pressed,
      ]}
    >
      <View
        style={[
          styles.statusStrip,
          {
            backgroundColor:
              statusTone.color,
          },
        ]}
      />

      <View style={styles.equipmentContent}>
        <View style={styles.equipmentHeader}>
          <View
            style={[
              styles.equipmentIcon,
              {
                backgroundColor:
                  statusTone.background,
              },
            ]}
          >
            <Ionicons
              color={statusTone.color}
              name="construct-outline"
              size={22}
            />
          </View>

          <View style={styles.equipmentIdentity}>
            <Text
              numberOfLines={1}
              style={styles.equipmentName}
            >
              {equipment.name}
            </Text>

            <Text style={styles.serialNumber}>
              {equipment.serialNumber}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  statusTone.background,
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                {
                  color: statusTone.color,
                },
              ]}
            >
              {formatLabel(equipment.status)}
            </Text>
          </View>
        </View>

        <View style={styles.detailCard}>
          <DetailRow
            icon="business-outline"
            value={equipment.department}
          />

          <DetailRow
            icon="location-outline"
            value={equipment.location}
          />

          <DetailRow
            icon="person-outline"
            value={equipment.assignedOfficer}
          />
        </View>

        <View style={styles.equipmentFooter}>
          <View style={styles.serviceDetails}>
            <Text style={styles.serviceLabel}>
              NEXT SERVICE
            </Text>

            <Text style={styles.serviceValue}>
              {equipment.nextServiceDate
                ? formatDate(
                    equipment.nextServiceDate,
                  )
                : 'Not scheduled'}
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

function SummaryCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: number;
  icon: keyof typeof Ionicons.glyphMap;
  tone:
    | 'success'
    | 'danger'
    | 'warning'
    | 'info';
}) {
  const tones = {
    success: {
      background: colors.successSoft,
      color: colors.success,
    },
    danger: {
      background: colors.dangerSoft,
      color: colors.danger,
    },
    warning: {
      background: colors.warningSoft,
      color: colors.warning,
    },
    info: {
      background: colors.infoSoft,
      color: colors.info,
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

function DetailRow({
  icon,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
}) {
  return (
    <View style={styles.detailRow}>
      <Ionicons
        color={colors.textMuted}
        name={icon}
        size={15}
      />

      <Text style={styles.detailText}>
        {value}
      </Text>
    </View>
  );
}

function getStatusTone(
  status: EquipmentStatus,
): {
  background: string;
  color: string;
} {
  const tones = {
    working: {
      background: colors.successSoft,
      color: colors.success,
    },
    under_repair: {
      background: colors.dangerSoft,
      color: colors.danger,
    },
    maintenance_due: {
      background: colors.warningSoft,
      color: colors.warning,
    },
    retired: {
      background: colors.infoSoft,
      color: colors.info,
    },
  };

  return tones[status];
}

function formatLabel(value: string): string {
  return value
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(
    [],
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    },
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
    paddingHorizontal:
      spacing.screenHorizontal,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },

  headerButton: {
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

  addButton: {
    width: 42,
    height: 42,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },

  content: {
    padding: spacing.screenHorizontal,
    paddingBottom: spacing.massive,
  },

  hero: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    padding: spacing.xl,
    borderRadius: radius.xl,
    backgroundColor: colors.primaryDark,
  },

  heroText: {
    flex: 1,
  },

  heroEyebrow: {
    color: colors.secondary,
    fontSize: 10,
    fontWeight: typography.weight.extraBold,
    letterSpacing: 1.3,
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

  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.warningSoft,
  },

  noticeIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },

  noticeText: {
    flex: 1,
    marginLeft: spacing.md,
  },

  noticeTitle: {
    color: colors.textPrimary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.bold,
  },

  noticeDescription: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
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
    letterSpacing: 1.2,
  },

  sectionTitle: {
    marginTop: spacing.xs,
    color: colors.textPrimary,
    fontSize: typography.size.cardTitle,
    fontWeight: typography.weight.bold,
  },

  countBadge: {
    minWidth: 34,
    height: 34,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },

  countText: {
    color: colors.primary,
    fontSize: typography.size.caption,
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

  equipmentList: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },

  equipmentCard: {
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },

  statusStrip: {
    width: 5,
  },

  equipmentContent: {
    flex: 1,
    padding: spacing.lg,
  },

  equipmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  equipmentIcon: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },

  equipmentIdentity: {
    flex: 1,
    marginHorizontal: spacing.md,
  },

  equipmentName: {
    color: colors.textPrimary,
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
  },

  serialNumber: {
    marginTop: 3,
    color: colors.primary,
    fontSize: 10,
  },

  statusBadge: {
    maxWidth: 90,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.round,
  },

  statusText: {
    fontSize: 8,
    fontWeight: typography.weight.extraBold,
    textAlign: 'center',
  },

  detailCard: {
    gap: spacing.sm,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  detailText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: typography.size.caption,
  },

  equipmentFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },

  serviceDetails: {
    flex: 1,
  },

  serviceLabel: {
    color: colors.textMuted,
    fontSize: 8,
    fontWeight: typography.weight.extraBold,
    letterSpacing: 0.5,
  },

  serviceValue: {
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
    backgroundColor: colors.primarySoft,
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

  lanNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xxxl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#BDE6D2',
    borderRadius: radius.xl,
    backgroundColor: colors.successSoft,
  },

  lanIcon: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },

  lanText: {
    flex: 1,
    marginHorizontal: spacing.md,
  },

  lanTitle: {
    color: colors.textPrimary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.bold,
  },

  lanDescription: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },

  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },

  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: radius.round,
    backgroundColor: colors.success,
  },

  onlineText: {
    color: colors.success,
    fontSize: 8,
    fontWeight: typography.weight.extraBold,
  },

  pressed: {
    opacity: 0.7,
  },
});