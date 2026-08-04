import { Ionicons } from '@expo/vector-icons';
import {
  router,
  useLocalSearchParams,
  type Href,
} from 'expo-router';
import { useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/src/components';
import { useEquipmentStore } from '@/src/store/equipment.store';
import {
  colors,
  radius,
  spacing,
  typography,
} from '@/src/theme';
import type {
  EquipmentStatus,
} from '@/src/types/equipment';

export default function EquipmentDetailsScreen() {
  const { equipmentId } =
    useLocalSearchParams<{
      equipmentId: string;
    }>();

  const equipmentList = useEquipmentStore(
    (state) => state.equipment,
  );

  const equipment = useMemo(
    () =>
      equipmentList.find(
        (item) => item.id === equipmentId,
      ),
    [equipmentId, equipmentList],
  );

  if (!equipment) {
    return (
      <SafeAreaView style={styles.notFound}>
        <View style={styles.notFoundIcon}>
          <Ionicons
            color={colors.primary}
            name="construct-outline"
            size={40}
          />
        </View>

        <Text style={styles.notFoundTitle}>
          Equipment unavailable
        </Text>

        <Text
          style={styles.notFoundDescription}
        >
          The selected hospital equipment record
          could not be found.
        </Text>

        <AppButton
          onPress={() =>
            router.replace(
              '/equipment' as Href,
            )
          }
          title="Return to equipment"
        />
      </SafeAreaView>
    );
  }

  const statusTone = getStatusTone(
    equipment.status,
  );

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Return to equipment register"
          accessibilityRole="button"
          hitSlop={10}
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            color={colors.textPrimary}
            name="arrow-back"
            size={23}
          />
        </Pressable>

        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>
            Equipment details
          </Text>

          <Text style={styles.headerSubtitle}>
            Asset condition and maintenance
          </Text>
        </View>

        <View
          style={[
            styles.headerIcon,
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
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <View
            style={[
              styles.heroIcon,
              {
                backgroundColor:
                  statusTone.background,
              },
            ]}
          >
            <Ionicons
              color={statusTone.color}
              name="construct-outline"
              size={32}
            />
          </View>

          <Text style={styles.equipmentName}>
            {equipment.name}
          </Text>

          <Text style={styles.serialNumber}>
            {equipment.serialNumber}
          </Text>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  statusTone.background,
              },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor:
                    statusTone.color,
                },
              ]}
            />

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

        <View style={styles.summaryGrid}>
          <SummaryCard
            icon="business-outline"
            label="Department"
            value={equipment.department}
          />

          <SummaryCard
            icon="location-outline"
            label="Location"
            value={equipment.location}
          />

          <SummaryCard
            icon="person-outline"
            label="Assigned officer"
            value={equipment.assignedOfficer}
          />

          <SummaryCard
            icon="albums-outline"
            label="Category"
            value={equipment.category}
          />
        </View>

        <Section
          icon="information-circle-outline"
          title="Asset information"
        >
          <InfoRow
            label="Equipment name"
            value={equipment.name}
          />

          <InfoRow
            label="Serial number"
            value={equipment.serialNumber}
          />

          <InfoRow
            label="Category"
            value={equipment.category}
          />

          <InfoRow
            label="Department"
            value={equipment.department}
          />

          <InfoRow
            label="Assigned officer"
            value={equipment.assignedOfficer}
          />

          <InfoRow
            label="Current location"
            value={equipment.location}
          />
        </Section>

        <Section
          icon="calendar-outline"
          title="Purchase and warranty"
        >
          <InfoRow
            label="Purchase date"
            value={formatDate(
              equipment.purchaseDate,
            )}
          />

          <InfoRow
            label="Warranty expiry"
            value={
              equipment.warrantyExpiry
                ? formatDate(
                    equipment.warrantyExpiry,
                  )
                : 'Not recorded'
            }
          />
        </Section>

        <Section
          icon="construct-outline"
          title="Maintenance schedule"
        >
          <InfoRow
            label="Last maintenance"
            value={
              equipment.lastMaintenanceDate
                ? formatDate(
                    equipment.lastMaintenanceDate,
                  )
                : 'Not recorded'
            }
          />

          <InfoRow
            label="Next service date"
            value={
              equipment.nextServiceDate
                ? formatDate(
                    equipment.nextServiceDate,
                  )
                : 'Not scheduled'
            }
          />

          <InfoRow
            label="Current condition"
            value={formatLabel(
              equipment.status,
            )}
          />
        </Section>

        {equipment.notes ? (
          <Section
            icon="document-text-outline"
            title="Equipment notes"
          >
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>
                {equipment.notes}
              </Text>
            </View>
          </Section>
        ) : null}

        <View style={styles.auditNotice}>
          <View style={styles.auditIcon}>
            <Ionicons
              color={colors.primary}
              name="shield-checkmark-outline"
              size={22}
            />
          </View>

          <View style={styles.auditText}>
            <Text style={styles.auditTitle}>
              Asset audit information
            </Text>

            <Text
              style={styles.auditDescription}
            >
              Created{' '}
              {formatDateTime(
                equipment.createdAt,
              )}
              {' · '}
              Last updated{' '}
              {formatDateTime(
                equipment.updatedAt,
              )}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <AppButton
            onPress={() =>
              router.replace(
                '/equipment' as Href,
              )
            }
            title="Return to equipment register"
            variant="ghost"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIcon}>
          <Ionicons
            color={colors.primary}
            name={icon}
            size={21}
          />
        </View>

        <Text style={styles.sectionTitle}>
          {title}
        </Text>
      </View>

      <View style={styles.sectionBody}>
        {children}
      </View>
    </View>
  );
}

function SummaryCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={styles.summaryCard}>
      <View style={styles.summaryIcon}>
        <Ionicons
          color={colors.primary}
          name={icon}
          size={21}
        />
      </View>

      <Text style={styles.summaryLabel}>
        {label}
      </Text>

      <Text
        numberOfLines={2}
        style={styles.summaryValue}
      >
        {value}
      </Text>
    </View>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>
        {label}
      </Text>

      <Text style={styles.infoValue}>
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

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString([], {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
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
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal:
      spacing.screenHorizontal,
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
  },

  content: {
    padding: spacing.screenHorizontal,
    paddingBottom: spacing.massive,
  },

  heroCard: {
    alignItems: 'center',
    marginTop: spacing.lg,
    padding: spacing.xxl,
    borderRadius: radius.xl,
    backgroundColor: colors.primaryDark,
  },

  heroIcon: {
    width: 70,
    height: 70,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
  },

  equipmentName: {
    marginTop: spacing.lg,
    color: colors.textOnPrimary,
    fontSize: typography.size.sectionTitle,
    fontWeight: typography.weight.extraBold,
    textAlign: 'center',
  },

  serialNumber: {
    marginTop: spacing.xs,
    color: colors.secondary,
    fontSize: typography.size.caption,
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radius.round,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: radius.round,
  },

  statusText: {
    fontSize: 9,
    fontWeight: typography.weight.extraBold,
  },

  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.lg,
  },

  summaryCard: {
    width: '47.8%',
    minHeight: 122,
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
    backgroundColor: colors.primarySoft,
  },

  summaryLabel: {
    marginTop: spacing.md,
    color: colors.textSecondary,
    fontSize: 10,
  },

  summaryValue: {
    marginTop: spacing.xs,
    color: colors.textPrimary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.bold,
  },

  sectionCard: {
    marginTop: spacing.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.surfaceMuted,
  },

  sectionIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },

  sectionTitle: {
    marginLeft: spacing.md,
    color: colors.textPrimary,
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
  },

  sectionBody: {
    padding: spacing.lg,
  },

  infoRow: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  infoLabel: {
    color: colors.textMuted,
    fontSize: 10,
  },

  infoValue: {
    marginTop: spacing.xs,
    color: colors.textPrimary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },

  notesCard: {
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
  },

  notesText: {
    color: colors.textSecondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },

  auditNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
  },

  auditIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },

  auditText: {
    flex: 1,
    marginLeft: spacing.md,
  },

  auditTitle: {
    color: colors.textPrimary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.bold,
  },

  auditDescription: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },

  actions: {
    marginTop: spacing.lg,
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
    width: 78,
    height: 78,
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

  pressed: {
    opacity: 0.7,
  },
});