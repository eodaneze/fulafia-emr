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

import { useHrStore } from '@/src/store/hr.store';
import {
  colors,
  radius,
  shadows,
  spacing,
  typography,
} from '@/src/theme';
import type {
  AttendanceStatus,
  HospitalStaff,
} from '@/src/types/hr';

type StaffFilter =
  | 'all'
  | 'present'
  | 'on_leave'
  | 'late'
  | 'off_duty';

const filters: Array<{
  label: string;
  value: StaffFilter;
}> = [
  {
    label: 'All',
    value: 'all',
  },
  {
    label: 'Present',
    value: 'present',
  },
  {
    label: 'On leave',
    value: 'on_leave',
  },
  {
    label: 'Late',
    value: 'late',
  },
  {
    label: 'Off duty',
    value: 'off_duty',
  },
];

export default function HumanResourcesDashboardScreen() {
  const staff = useHrStore((state) => state.staff);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] =
    useState<StaffFilter>('all');

  const filteredStaff = useMemo(() => {
    const normalizedSearch = searchQuery
      .trim()
      .toLowerCase();

    return staff
      .filter((staffMember) => {
        return (
          selectedFilter === 'all' ||
          staffMember.attendanceStatus ===
            selectedFilter
        );
      })
      .filter((staffMember) => {
        if (!normalizedSearch) {
          return true;
        }

        return [
          staffMember.fullName,
          staffMember.employeeId,
          staffMember.department,
          staffMember.designation,
          staffMember.specialty,
        ]
          .filter(Boolean)
          .some((value) =>
            value
              ?.toLowerCase()
              .includes(normalizedSearch),
          );
      })
      .sort((first, second) =>
        first.fullName.localeCompare(second.fullName),
      );
  }, [searchQuery, selectedFilter, staff]);

  const activeStaff = staff.filter(
    (staffMember) =>
      staffMember.employmentStatus === 'active',
  ).length;

  const presentStaff = staff.filter(
    (staffMember) =>
      staffMember.attendanceStatus === 'present',
  ).length;

  const staffOnLeave = staff.filter(
    (staffMember) =>
      staffMember.attendanceStatus === 'on_leave',
  ).length;

  const onDutyStaff = staff.filter(
    (staffMember) =>
      staffMember.currentShift !== 'off_duty',
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
            Human Resources
          </Text>

          <View style={styles.connectionRow}>
            <View style={styles.connectionDot} />

            <Text style={styles.headerSubtitle}>
              Workforce service online
            </Text>
          </View>
        </View>

        <Pressable
          accessibilityLabel="Add hospital staff"
          accessibilityRole="button"
          onPress={() =>
            router.push('/hr/create' as Href)
          }
          style={styles.addButton}
        >
          <Ionicons
            color={colors.textOnPrimary}
            name="person-add-outline"
            size={20}
          />
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
                WORKFORCE MANAGEMENT
              </Text>

              <Text style={styles.heroTitle}>
                Hospital staff
              </Text>

              <Text style={styles.heroDescription}>
                Manage employment records, duty schedules,
                attendance, leave and staff qualifications.
              </Text>
            </View>

            <View style={styles.heroIcon}>
              <Ionicons
                color={colors.textOnPrimary}
                name="people"
                size={29}
              />
            </View>
          </View>

          <View style={styles.heroStatistics}>
            <HeroStatistic
              label="Active staff"
              value={String(activeStaff)}
            />

            <View style={styles.heroDivider} />

            <HeroStatistic
              label="On duty"
              value={String(onDutyStaff)}
            />

            <View style={styles.heroDivider} />

            <HeroStatistic
              label="On leave"
              value={String(staffOnLeave)}
            />
          </View>
        </View>

        <View style={styles.notice}>
          <View style={styles.noticeIcon}>
            <Ionicons
              color={colors.primary}
              name="shield-checkmark-outline"
              size={23}
            />
          </View>

          <View style={styles.noticeText}>
            <Text style={styles.noticeTitle}>
              Secure personnel records
            </Text>

            <Text style={styles.noticeDescription}>
              Salary, next-of-kin and employment details are
              visible only to authorized management staff.
            </Text>
          </View>
        </View>

        <View style={styles.summaryGrid}>
          <SummaryCard
            icon="people-outline"
            label="Total staff"
            tone="primary"
            value={String(staff.length)}
          />

          <SummaryCard
            icon="checkmark-circle-outline"
            label="Present today"
            tone="success"
            value={String(presentStaff)}
          />

          <SummaryCard
            icon="calendar-outline"
            label="On leave"
            tone="warning"
            value={String(staffOnLeave)}
          />

          <SummaryCard
            icon="time-outline"
            label="Late today"
            tone="danger"
            value={String(
              staff.filter(
                (staffMember) =>
                  staffMember.attendanceStatus ===
                  'late',
              ).length,
            )}
          />
        </View>

        <View style={styles.departmentCard}>
          <View style={styles.departmentHeader}>
            <View>
              <Text style={styles.sectionEyebrow}>
                DEPARTMENT DISTRIBUTION
              </Text>

              <Text style={styles.sectionTitle}>
                Workforce by department
              </Text>
            </View>

            <Ionicons
              color={colors.primary}
              name="business-outline"
              size={25}
            />
          </View>

          <DepartmentDistribution
            staff={staff}
          />
        </View>

        <View style={styles.sectionHeading}>
          <View>
            <Text style={styles.sectionEyebrow}>
              STAFF DIRECTORY
            </Text>

            <Text style={styles.sectionTitle}>
              Personnel records
            </Text>
          </View>

          <View style={styles.staffCountBadge}>
            <Text style={styles.staffCountText}>
              {filteredStaff.length}
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
            placeholder="Name, employee ID or department"
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

        {filteredStaff.length ? (
          <View style={styles.staffList}>
            {filteredStaff.map((staffMember) => (
              <StaffCard
                key={staffMember.id}
                staff={staffMember}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons
                color={colors.primary}
                name="people-outline"
                size={31}
              />
            </View>

            <Text style={styles.emptyTitle}>
              No staff records found
            </Text>

            <Text style={styles.emptyDescription}>
              Change the search text or attendance filter.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function StaffCard({
  staff,
}: {
  staff: HospitalStaff;
}) {
  const attendanceTone = getAttendanceTone(
    staff.attendanceStatus,
  );

  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: '/hr/[staffId]',
          params: {
            staffId: staff.id,
          },
        } as Href)
      }
      style={({ pressed }) => [
        styles.staffCard,
        pressed && styles.pressed,
      ]}
    >
      <View
        style={[
          styles.staffStatusStrip,
          {
            backgroundColor:
              attendanceTone.color,
          },
        ]}
      />

      <View style={styles.staffContent}>
        <View style={styles.staffHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {getInitials(staff.fullName)}
            </Text>
          </View>

          <View style={styles.staffIdentity}>
            <Text
              numberOfLines={1}
              style={styles.staffName}
            >
              {staff.fullName}
            </Text>

            <Text style={styles.employeeId}>
              {staff.employeeId}
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
                  color:
                    attendanceTone.color,
                },
              ]}
            >
              {formatAttendanceStatus(
                staff.attendanceStatus,
              )}
            </Text>
          </View>
        </View>

        <View style={styles.staffRoleCard}>
          <View style={styles.staffRoleIcon}>
            <Ionicons
              color={colors.primary}
              name={getRoleIcon(staff.role)}
              size={19}
            />
          </View>

          <View style={styles.staffRoleText}>
            <Text style={styles.staffDesignation}>
              {staff.designation}
            </Text>

            <Text style={styles.staffDepartment}>
              {staff.department}
            </Text>
          </View>

          <Ionicons
            color={colors.textMuted}
            name="chevron-forward"
            size={20}
          />
        </View>

        <View style={styles.staffMeta}>
          <MetaItem
            icon="time-outline"
            value={formatShift(
              staff.currentShift,
            )}
          />

          <MetaItem
            icon="calendar-outline"
            value={`${staff.leaveBalance} leave days`}
          />

          <MetaItem
            icon="cash-outline"
            value={staff.salaryGrade}
          />
        </View>
      </View>
    </Pressable>
  );
}

function DepartmentDistribution({
  staff,
}: {
  staff: HospitalStaff[];
}) {
  const departments = useMemo(() => {
    const counts = new Map<string, number>();

    staff.forEach((staffMember) => {
      counts.set(
        staffMember.department,
        (counts.get(staffMember.department) ?? 0) +
          1,
      );
    });

    return Array.from(counts.entries())
      .map(([department, count]) => ({
        department,
        count,
      }))
      .sort(
        (first, second) =>
          second.count - first.count,
      );
  }, [staff]);

  const highestCount = Math.max(
    ...departments.map(
      (department) => department.count,
    ),
    1,
  );

  return (
    <View style={styles.departmentList}>
      {departments.map((department) => {
        const percentage = Math.round(
          (department.count / highestCount) *
            100,
        );

        return (
          <View
            key={department.department}
            style={styles.departmentRow}
          >
            <View style={styles.departmentRowHeader}>
              <Text
                style={styles.departmentName}
              >
                {department.department}
              </Text>

              <Text
                style={styles.departmentCount}
              >
                {department.count}
              </Text>
            </View>

            <View
              style={styles.departmentProgress}
            >
              <View
                style={[
                  styles.departmentProgressFill,
                  {
                    width: `${percentage}%`,
                  },
                ]}
              />
            </View>
          </View>
        );
      })}
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
  tone:
    | 'primary'
    | 'success'
    | 'warning'
    | 'danger';
}) {
  const tones = {
    primary: {
      background: colors.primarySoft,
      color: colors.primary,
    },
    success: {
      background: colors.successSoft,
      color: colors.success,
    },
    warning: {
      background: colors.warningSoft,
      color: colors.warning,
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

      <Text style={styles.metaText}>
        {value}
      </Text>
    </View>
  );
}

function getInitials(fullName: string): string {
  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((name) => name[0]?.toUpperCase())
    .join('');
}

function formatAttendanceStatus(
  status: AttendanceStatus,
): string {
  return status
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

function formatShift(
  shift: HospitalStaff['currentShift'],
): string {
  return shift
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
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

function getRoleIcon(
  role: HospitalStaff['role'],
): keyof typeof Ionicons.glyphMap {
  switch (role) {
    case 'doctor':
      return 'medical-outline';

    case 'outpatient_nurse':
    case 'ward_nurse':
      return 'medkit-outline';

    case 'laboratory_scientist':
      return 'flask-outline';

    case 'pharmacist':
      return 'bandage-outline';

    case 'records_officer':
      return 'folder-open-outline';

    case 'environmental_officer':
      return 'leaf-outline';

    case 'human_resources':
      return 'people-outline';

    default:
      return 'person-outline';
  }
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

  notice: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
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

  departmentCard: {
    marginTop: spacing.xxxl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
  },

  departmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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

  departmentList: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },

  departmentRow: {
    gap: spacing.sm,
  },

  departmentRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  departmentName: {
    color: colors.textSecondary,
    fontSize: typography.size.caption,
  },

  departmentCount: {
    color: colors.textPrimary,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.bold,
  },

  departmentProgress: {
    height: 7,
    overflow: 'hidden',
    borderRadius: radius.round,
    backgroundColor: colors.surfaceMuted,
  },

  departmentProgressFill: {
    height: '100%',
    borderRadius: radius.round,
    backgroundColor: colors.primary,
  },

  staffCountBadge: {
    minWidth: 34,
    height: 34,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },

  staffCountText: {
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

  staffList: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },

  staffCard: {
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },

  staffStatusStrip: {
    width: 5,
  },

  staffContent: {
    flex: 1,
    padding: spacing.lg,
  },

  staffHeader: {
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

  staffIdentity: {
    flex: 1,
    marginHorizontal: spacing.md,
  },

  staffName: {
    color: colors.textPrimary,
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
  },

  employeeId: {
    marginTop: 3,
    color: colors.primary,
    fontSize: typography.size.caption,
  },

  attendanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.round,
  },

  attendanceDot: {
    width: 6,
    height: 6,
    borderRadius: radius.round,
  },

  attendanceText: {
    fontSize: 8,
    fontWeight: typography.weight.bold,
  },

  staffRoleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
  },

  staffRoleIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },

  staffRoleText: {
    flex: 1,
    marginHorizontal: spacing.md,
  },

  staffDesignation: {
    color: colors.textPrimary,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.bold,
  },

  staffDepartment: {
    marginTop: 3,
    color: colors.textSecondary,
    fontSize: 10,
  },

  staffMeta: {
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

  pressed: {
    opacity: 0.7,
  },
});