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
import { useHrStore } from '@/src/store/hr.store';
import {
  colors,
  radius,
  spacing,
  typography,
} from '@/src/theme';
import type { AttendanceStatus } from '@/src/types/hr';

export default function StaffDetailsScreen() {
  const { staffId } = useLocalSearchParams<{
    staffId: string;
  }>();

  const staffList = useHrStore(
    (state) => state.staff,
  );

  const staff = useMemo(
    () =>
      staffList.find(
        (item) => item.id === staffId,
      ),
    [staffId, staffList],
  );

  if (!staff) {
    return (
      <SafeAreaView style={styles.notFound}>
        <Ionicons
          color={colors.primary}
          name="person-outline"
          size={42}
        />

        <Text style={styles.notFoundTitle}>
          Staff record unavailable
        </Text>

        <Text style={styles.notFoundDescription}>
          The selected personnel record could not be
          found.
        </Text>

        <AppButton
          onPress={() =>
            router.replace('/hr' as Href)
          }
          title="Return to Human Resources"
        />
      </SafeAreaView>
    );
  }

  const attendanceTone = getAttendanceTone(
    staff.attendanceStatus,
  );

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Return to Human Resources"
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
            Staff profile
          </Text>

          <Text style={styles.headerSubtitle}>
            Employment and personnel record
          </Text>
        </View>

        <View style={styles.headerIcon}>
          <Ionicons
            color={colors.primary}
            name="id-card-outline"
            size={22}
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {getInitials(staff.fullName)}
            </Text>
          </View>

          <View style={styles.profileIdentity}>
            <Text
              numberOfLines={1}
              style={styles.profileName}
            >
              {staff.fullName}
            </Text>

            <Text style={styles.employeeId}>
              {staff.employeeId}
            </Text>

            <Text style={styles.profileDesignation}>
              {staff.designation}
            </Text>
          </View>

          <View
            style={[
              styles.attendanceBadge,
              {
                backgroundColor:
                  attendanceTone.background,
              },
            ]}
          >
            <View
              style={[
                styles.attendanceDot,
                {
                  backgroundColor:
                    attendanceTone.color,
                },
              ]}
            />

            <Text
              style={[
                styles.attendanceText,
                {
                  color: attendanceTone.color,
                },
              ]}
            >
              {formatLabel(
                staff.attendanceStatus,
              )}
            </Text>
          </View>
        </View>

        <View style={styles.summaryGrid}>
          <SummaryCard
            icon="business-outline"
            label="Department"
            value={staff.department}
          />

          <SummaryCard
            icon="time-outline"
            label="Current shift"
            value={formatLabel(
              staff.currentShift,
            )}
          />

          <SummaryCard
            icon="calendar-outline"
            label="Leave balance"
            value={`${staff.leaveBalance} days`}
          />

          <SummaryCard
            icon="cash-outline"
            label="Salary grade"
            value={staff.salaryGrade}
          />
        </View>

        <Section
          icon="briefcase-outline"
          title="Employment details"
        >
          <InfoRow
            label="Employment date"
            value={formatDate(
              staff.employmentDate,
            )}
          />

          <InfoRow
            label="Employment status"
            value={formatLabel(
              staff.employmentStatus,
            )}
          />

          <InfoRow
            label="Department"
            value={staff.department}
          />

          <InfoRow
            label="Designation"
            value={staff.designation}
          />

          <InfoRow
            label="Specialty"
            value={
              staff.specialty ??
              'Not specified'
            }
          />

          <InfoRow
            label="Leave status"
            value={formatLabel(
              staff.leaveStatus,
            )}
          />

          <InfoRow
            label="Call duty"
            value={
              staff.callDutyDate
                ? formatDate(
                    staff.callDutyDate,
                  )
                : 'Not scheduled'
            }
          />
        </Section>

        <Section
          icon="call-outline"
          title="Contact information"
        >
          <InfoRow
            label="Phone number"
            value={staff.phoneNumber}
          />

          <InfoRow
            label="Email address"
            value={staff.email}
          />

          <InfoRow
            label="Residential address"
            value={staff.address}
          />
        </Section>

        <Section
          icon="people-outline"
          title="Next of kin"
        >
          <InfoRow
            label="Full name"
            value={staff.nextOfKin.fullName}
          />

          <InfoRow
            label="Relationship"
            value={
              staff.nextOfKin.relationship
            }
          />

          <InfoRow
            label="Phone number"
            value={
              staff.nextOfKin.phoneNumber
            }
          />
        </Section>

        <Section
          icon="school-outline"
          title="Qualifications"
        >
          {staff.qualifications.length ? (
            <View style={styles.recordList}>
              {staff.qualifications.map(
                (qualification) => (
                  <View
                    key={qualification.id}
                    style={styles.recordCard}
                  >
                    <View
                      style={styles.recordHeader}
                    >
                      <View
                        style={
                          styles.recordIcon
                        }
                      >
                        <Ionicons
                          color={colors.primary}
                          name="school-outline"
                          size={20}
                        />
                      </View>

                      <View
                        style={
                          styles.recordIdentity
                        }
                      >
                        <Text
                          style={
                            styles.recordTitle
                          }
                        >
                          {
                            qualification.qualification
                          }
                        </Text>

                        <Text
                          style={
                            styles.recordDescription
                          }
                        >
                          {
                            qualification.institution
                          }
                        </Text>
                      </View>
                    </View>

                    <Text
                      style={styles.recordMeta}
                    >
                      Obtained in{' '}
                      {
                        qualification.yearObtained
                      }
                    </Text>
                  </View>
                ),
              )}
            </View>
          ) : (
            <EmptyRecord
              description="No qualification record has been added."
              icon="school-outline"
            />
          )}
        </Section>

        <Section
          icon="trending-up-outline"
          title="Promotion history"
        >
          {staff.promotionHistory.length ? (
            <View style={styles.recordList}>
              {staff.promotionHistory.map(
                (promotion) => (
                  <View
                    key={promotion.id}
                    style={styles.recordCard}
                  >
                    <View
                      style={styles.recordHeader}
                    >
                      <View
                        style={
                          styles.recordIcon
                        }
                      >
                        <Ionicons
                          color={colors.primary}
                          name="trending-up-outline"
                          size={20}
                        />
                      </View>

                      <View
                        style={
                          styles.recordIdentity
                        }
                      >
                        <Text
                          style={
                            styles.recordTitle
                          }
                        >
                          {
                            promotion.newDesignation
                          }
                        </Text>

                        <Text
                          style={
                            styles.recordDescription
                          }
                        >
                          {
                            promotion.previousDesignation
                          }{' '}
                          →{' '}
                          {
                            promotion.newDesignation
                          }
                        </Text>
                      </View>
                    </View>

                    <View
                      style={
                        styles.promotionDetails
                      }
                    >
                      <Text
                        style={styles.recordMeta}
                      >
                        {
                          promotion.previousSalaryGrade
                        }{' '}
                        →{' '}
                        {
                          promotion.newSalaryGrade
                        }
                      </Text>

                      <Text
                        style={styles.recordMeta}
                      >
                        Effective{' '}
                        {formatDate(
                          promotion.effectiveDate,
                        )}
                      </Text>
                    </View>
                  </View>
                ),
              )}
            </View>
          ) : (
            <EmptyRecord
              description="No promotion history is available."
              icon="trending-up-outline"
            />
          )}
        </Section>

        <View style={styles.securityNotice}>
          <View style={styles.securityIcon}>
            <Ionicons
              color={colors.primary}
              name="shield-checkmark-outline"
              size={22}
            />
          </View>

          <Text
            style={styles.securityNoticeText}
          >
            This personnel record is available
            only to authorized Human Resources
            and hospital management users.
          </Text>
        </View>

        <View style={styles.actions}>
          <AppButton
            onPress={() =>
              router.replace('/hr' as Href)
            }
            title="Return to staff directory"
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

function EmptyRecord({
  icon,
  description,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
}) {
  return (
    <View style={styles.emptyRecord}>
      <View style={styles.emptyRecordIcon}>
        <Ionicons
          color={colors.primary}
          name={icon}
          size={24}
        />
      </View>

      <Text style={styles.emptyRecordText}>
        {description}
      </Text>
    </View>
  );
}

function getInitials(fullName: string): string {
  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((name) =>
      name[0]?.toUpperCase(),
    )
    .join('');
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

function getAttendanceTone(
  status: AttendanceStatus,
): {
  background: string;
  color: string;
} {
  const tones = {
    present: {
      background: colors.successSoft,
      color: colors.success,
    },

    absent: {
      background: colors.dangerSoft,
      color: colors.danger,
    },

    late: {
      background: colors.warningSoft,
      color: colors.warning,
    },

    off_duty: {
      background: colors.infoSoft,
      color: colors.info,
    },

    on_leave: {
      background: colors.primarySoft,
      color: colors.primary,
    },
  };

  return tones[status];
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
    backgroundColor: colors.primarySoft,
  },

  content: {
    padding: spacing.screenHorizontal,
    paddingBottom: spacing.massive,
  },

  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.primaryDark,
  },

  avatar: {
    width: 58,
    height: 58,
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

  profileIdentity: {
    flex: 1,
    marginHorizontal: spacing.md,
  },

  profileName: {
    color: colors.textOnPrimary,
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
  },

  employeeId: {
    marginTop: 2,
    color: colors.secondary,
    fontSize: typography.size.caption,
  },

  profileDesignation: {
    marginTop: 4,
    color: 'rgba(255,255,255,0.58)',
    fontSize: 10,
  },

  attendanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 7,
    borderRadius: radius.round,
  },

  attendanceDot: {
    width: 6,
    height: 6,
    borderRadius: radius.round,
  },

  attendanceText: {
    fontSize: 8,
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
    minHeight: 124,
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

  recordList: {
    gap: spacing.md,
  },

  recordCard: {
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
  },

  recordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  recordIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },

  recordIdentity: {
    flex: 1,
    marginLeft: spacing.md,
  },

  recordTitle: {
    color: colors.textPrimary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.bold,
  },

  recordDescription: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    fontSize: typography.size.caption,
  },

  recordMeta: {
    marginTop: spacing.sm,
    color: colors.textMuted,
    fontSize: 9,
  },

  promotionDetails: {
    marginTop: spacing.sm,
  },

  emptyRecord: {
    alignItems: 'center',
    padding: spacing.xl,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
  },

  emptyRecordIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },

  emptyRecordText: {
    marginTop: spacing.md,
    color: colors.textSecondary,
    fontSize: typography.size.caption,
    textAlign: 'center',
  },

  securityNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
  },

  securityIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },

  securityNoticeText: {
    flex: 1,
    marginLeft: spacing.md,
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