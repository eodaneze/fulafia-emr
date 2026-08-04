import { Ionicons } from '@expo/vector-icons';
import {
  router,
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

import {
  departmentActivities,
  equipmentSummary,
  executiveAlerts,
  staffAvailability,
  weeklyPatientVisits,
} from '@/src/constants/director-dashboard';
import { useDoctorStore } from '@/src/store/doctor.store';
import { useLaboratoryStore } from '@/src/store/laboratory.store';
import { usePatientStore } from '@/src/store/patient.store';
import { usePharmacyStore } from '@/src/store/pharmacy.store';
import { useWardStore } from '@/src/store/ward.store';
import {
  colors,
  radius,
  shadows,
  spacing,
  typography,
} from '@/src/theme';
import type {
  ExecutiveAlert,
  ExecutiveMetricTone,
} from '@/src/types/director';

export default function DirectorDashboardScreen() {
  const patients = usePatientStore(
    (state) => state.patients,
  );

  const consultations = useDoctorStore(
    (state) => state.consultations,
  );

  const laboratoryRequests = useDoctorStore(
    (state) => state.laboratoryRequests,
  );

  const prescriptions = useDoctorStore(
    (state) => state.prescriptions,
  );

  const laboratoryResults = useLaboratoryStore(
    (state) => state.laboratoryResults,
  );

  const dispensingRecords = usePharmacyStore(
    (state) => state.dispensingRecords,
  );

  const admissions = useWardStore(
    (state) => state.admissions,
  );

  const beds = useWardStore(
    (state) => state.beds,
  );

  const activeAdmissions = useMemo(() => {
    return admissions.filter(
      (admission) =>
        admission.status === 'admitted',
    );
  }, [admissions]);

  const availableBeds = useMemo(() => {
    return beds.filter(
      (bed) => bed.status === 'available',
    ).length;
  }, [beds]);

  const occupiedBeds = useMemo(() => {
    return beds.filter(
      (bed) => bed.status === 'occupied',
    ).length;
  }, [beds]);

  const bedCapacity = useMemo(() => {
    return beds.filter(
      (bed) =>
        bed.status !== 'maintenance' &&
        bed.status !== 'reserved',
    ).length;
  }, [beds]);

  const occupancyPercentage =
    bedCapacity > 0
      ? Math.round(
          (occupiedBeds / bedCapacity) * 100,
        )
      : 0;

  const doctorQueueCount = patients.filter(
    (patient) =>
      patient.queueStatus === 'waiting_for_doctor',
  ).length;

  const pharmacyQueueCount = prescriptions.filter(
    (prescription) =>
      prescription.status === 'pending' ||
      prescription.status ===
        'partially_dispensed',
  ).length;

  const pendingLaboratoryCount =
    laboratoryRequests.filter(
      (request) =>
        request.status !== 'completed' &&
        request.status !== 'cancelled',
    ).length;

  const completedToday =
    consultations.length +
    laboratoryResults.length +
    dispensingRecords.length;

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
            Executive Dashboard
          </Text>

          <View style={styles.connectionRow}>
            <View style={styles.connectionDot} />

            <Text style={styles.headerSubtitle}>
              Hospital LAN live
            </Text>
          </View>
        </View>

        <Pressable
          accessibilityLabel="Open executive notifications"
          accessibilityRole="button"
          style={styles.notificationButton}
        >
          <Ionicons
            color={colors.textPrimary}
            name="notifications-outline"
            size={22}
          />

          <View style={styles.notificationBadge}>
            <Text style={styles.notificationBadgeText}>
              3
            </Text>
          </View>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={styles.heroText}>
              <Text style={styles.heroEyebrow}>
                HOSPITAL COMMAND CENTRE
              </Text>

              <Text style={styles.heroTitle}>
                Good morning, Director
              </Text>

              <Text style={styles.heroDescription}>
                Monitor clinical operations, patient flow,
                staffing, assets and hospital performance
                from one executive workspace.
              </Text>
            </View>

            <View style={styles.heroIcon}>
              <Ionicons
                color={colors.textOnPrimary}
                name="analytics-outline"
                size={29}
              />
            </View>
          </View>

          <View style={styles.heroFooter}>
            <View style={styles.heroStatus}>
              <View style={styles.heroStatusDot} />

              <Text style={styles.heroStatusText}>
                ALL CORE SERVICES ONLINE
              </Text>
            </View>

            <Text style={styles.heroTime}>
              Updated just now
            </Text>
          </View>
        </View>

        <View style={styles.readOnlyNotice}>
          <View style={styles.readOnlyIcon}>
            <Ionicons
              color={colors.primary}
              name="eye-outline"
              size={23}
            />
          </View>

          <View style={styles.readOnlyText}>
            <Text style={styles.readOnlyTitle}>
              Executive read-only oversight
            </Text>

            <Text style={styles.readOnlyDescription}>
              Clinical records are visible for operational
              monitoring but cannot be altered from this
              dashboard.
            </Text>
          </View>
        </View>

        <View style={styles.metricGrid}>
          <MetricCard
            description="Registered records"
            icon="people-outline"
            label="Total patients"
            tone="primary"
            value={String(patients.length || 2486)}
          />

          <MetricCard
            description="Current doctor queue"
            icon="medical-outline"
            label="Waiting for doctor"
            tone="warning"
            value={String(doctorQueueCount || 8)}
          />

          <MetricCard
            description="Currently admitted"
            icon="bed-outline"
            label="Admissions"
            tone="info"
            value={String(
              activeAdmissions.length || 14,
            )}
          />

          <MetricCard
            description="Completed workflows"
            icon="checkmark-done-outline"
            label="Completed today"
            tone="success"
            value={String(completedToday || 61)}
          />
        </View>

        <SectionHeading
          description="Current operational workload across the hospital."
          eyebrow="LIVE OPERATIONS"
          title="Patient flow"
        />

        <View style={styles.patientFlowCard}>
          <FlowStep
            icon="folder-open-outline"
            label="Records"
            tone="primary"
            value={String(patients.length || 42)}
          />

          <FlowConnector />

          <FlowStep
            icon="medkit-outline"
            label="Nursing"
            tone="success"
            value="6"
          />

          <FlowConnector />

          <FlowStep
            icon="medical-outline"
            label="Doctor"
            tone="warning"
            value={String(doctorQueueCount || 8)}
          />

          <FlowConnector />

          <FlowStep
            icon="flask-outline"
            label="Laboratory"
            tone="info"
            value={String(
              pendingLaboratoryCount || 5,
            )}
          />

          <FlowConnector />

          <FlowStep
            icon="bandage-outline"
            label="Pharmacy"
            tone="primary"
            value={String(pharmacyQueueCount || 7)}
          />
        </View>

        <SectionHeading
          description="Patient attendance during the current week."
          eyebrow="HOSPITAL PERFORMANCE"
          title="Weekly patient visits"
        />

        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={styles.chartValue}>
                501
              </Text>

              <Text style={styles.chartLabel}>
                Total visits this week
              </Text>
            </View>

            <View style={styles.increaseBadge}>
              <Ionicons
                color={colors.success}
                name="trending-up-outline"
                size={15}
              />

              <Text style={styles.increaseText}>
                12.4%
              </Text>
            </View>
          </View>

          <WeeklyVisitsChart />
        </View>

        <View style={styles.splitSection}>
          <View style={styles.splitHeading}>
            <Text style={styles.splitEyebrow}>
              INPATIENT CAPACITY
            </Text>

            <Text style={styles.splitTitle}>
              Bed occupancy
            </Text>
          </View>

          <View style={styles.occupancyCard}>
            <View style={styles.occupancyTop}>
              <View style={styles.occupancyCircle}>
                <Text style={styles.occupancyValue}>
                  {occupancyPercentage || 72}%
                </Text>

                <Text style={styles.occupancyLabel}>
                  OCCUPIED
                </Text>
              </View>

              <View style={styles.occupancyDetails}>
                <OccupancyRow
                  color={colors.success}
                  label="Available beds"
                  value={String(availableBeds || 8)}
                />

                <OccupancyRow
                  color={colors.primary}
                  label="Occupied beds"
                  value={String(occupiedBeds || 21)}
                />

                <OccupancyRow
                  color={colors.warning}
                  label="Maintenance"
                  value={String(
                    beds.filter(
                      (bed) =>
                        bed.status ===
                        'maintenance',
                    ).length || 3,
                  )}
                />
              </View>
            </View>

            <View style={styles.occupancyProgress}>
              <View
                style={[
                  styles.occupancyProgressFill,
                  {
                    width: `${
                      occupancyPercentage || 72
                    }%`,
                  },
                ]}
              />
            </View>
          </View>
        </View>

        <SectionHeading
          description="Queue and completion activity across clinical departments."
          eyebrow="DEPARTMENT PERFORMANCE"
          title="Operational workload"
        />

        <View style={styles.departmentList}>
          {departmentActivities.map(
            (department) => (
              <DepartmentCard
                department={department.department}
                completed={department.completed}
                icon={
                  department.icon as keyof typeof Ionicons.glyphMap
                }
                key={department.id}
                tone={department.tone}
                total={department.total}
                waiting={department.waiting}
              />
            ),
          )}
        </View>

        <SectionHeading
          description="Current duty and availability information."
          eyebrow="WORKFORCE"
          title="Staff availability"
        />

        <ScrollView
          contentContainerStyle={styles.staffList}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {staffAvailability.map((staff) => (
            <StaffCard
              available={staff.available}
              key={staff.role}
              label={staff.label}
              onDuty={staff.onDuty}
              onLeave={staff.onLeave}
              total={staff.total}
            />
          ))}
        </ScrollView>

        <SectionHeading
          description="Financial overview for the current day."
          eyebrow="FINANCIAL SUMMARY"
          title="Revenue performance"
        />

        <View style={styles.revenueCard}>
          <View style={styles.revenueHeader}>
            <View>
              <Text style={styles.revenueLabel}>
                TODAY’S REVENUE
              </Text>

              <Text style={styles.revenueValue}>
                ₦842,500
              </Text>

              <Text style={styles.revenueChange}>
                +8.6% from yesterday
              </Text>
            </View>

            <View style={styles.revenueIcon}>
              <Ionicons
                color={colors.success}
                name="wallet-outline"
                size={27}
              />
            </View>
          </View>

          <View style={styles.revenueBreakdown}>
            <RevenueItem
              label="Consultation"
              value="₦184,000"
            />

            <RevenueItem
              label="Laboratory"
              value="₦276,500"
            />

            <RevenueItem
              label="Pharmacy"
              value="₦312,000"
            />

            <RevenueItem
              label="Admission"
              value="₦70,000"
            />
          </View>
        </View>

        <SectionHeading
          description="Availability and maintenance status of hospital assets."
          eyebrow="EQUIPMENT"
          title="Asset status"
        />

        <View style={styles.equipmentGrid}>
          <EquipmentCard
            icon="checkmark-circle-outline"
            label="Working"
            tone="success"
            value={String(equipmentSummary.working)}
          />

          <EquipmentCard
            icon="construct-outline"
            label="Under repair"
            tone="danger"
            value={String(
              equipmentSummary.underRepair,
            )}
          />

          <EquipmentCard
            icon="time-outline"
            label="Maintenance due"
            tone="warning"
            value={String(
              equipmentSummary.maintenanceDue,
            )}
          />

          <EquipmentCard
            icon="archive-outline"
            label="Retired"
            tone="info"
            value={String(equipmentSummary.retired)}
          />
        </View>

        <SectionHeading
          description="Issues requiring executive awareness or action."
          eyebrow="EXECUTIVE ALERTS"
          title="Attention required"
        />

        <View style={styles.alertList}>
          {executiveAlerts.map((alert) => (
            <ExecutiveAlertCard
              alert={alert}
              key={alert.id}
            />
          ))}
        </View>

        <View style={styles.systemStatusCard}>
          <View style={styles.systemStatusHeader}>
            <View style={styles.systemStatusIcon}>
              <Ionicons
                color={colors.success}
                name="server-outline"
                size={23}
              />
            </View>

            <View style={styles.systemStatusText}>
              <Text style={styles.systemStatusTitle}>
                Local hospital server
              </Text>

              <Text
                style={styles.systemStatusDescription}
              >
                All departments are connected through the
                hospital local area network.
              </Text>
            </View>

            <View style={styles.onlineBadge}>
              <View style={styles.onlineDot} />

              <Text style={styles.onlineText}>
                ONLINE
              </Text>
            </View>
          </View>

          <View style={styles.serverDetails}>
            <ServerDetail
              label="Response time"
              value="18 ms"
            />

            <ServerDetail
              label="Connected units"
              value="12"
            />

            <ServerDetail
              label="Last backup"
              value="06:00 AM"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MetricCard({
  label,
  value,
  description,
  icon,
  tone,
}: {
  label: string;
  value: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone: ExecutiveMetricTone;
}) {
  const selectedTone = getTone(tone);

  return (
    <View style={styles.metricCard}>
      <View
        style={[
          styles.metricIcon,
          {
            backgroundColor:
              selectedTone.background,
          },
        ]}
      >
        <Ionicons
          color={selectedTone.color}
          name={icon}
          size={22}
        />
      </View>

      <Text style={styles.metricValue}>
        {value}
      </Text>

      <Text style={styles.metricLabel}>
        {label}
      </Text>

      <Text style={styles.metricDescription}>
        {description}
      </Text>
    </View>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.sectionHeading}>
      <Text style={styles.sectionEyebrow}>
        {eyebrow}
      </Text>

      <Text style={styles.sectionTitle}>
        {title}
      </Text>

      <Text style={styles.sectionDescription}>
        {description}
      </Text>
    </View>
  );
}

function FlowStep({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone: ExecutiveMetricTone;
}) {
  const selectedTone = getTone(tone);

  return (
    <View style={styles.flowStep}>
      <View
        style={[
          styles.flowIcon,
          {
            backgroundColor:
              selectedTone.background,
          },
        ]}
      >
        <Ionicons
          color={selectedTone.color}
          name={icon}
          size={18}
        />
      </View>

      <Text style={styles.flowValue}>
        {value}
      </Text>

      <Text
        numberOfLines={1}
        style={styles.flowLabel}
      >
        {label}
      </Text>
    </View>
  );
}

function FlowConnector() {
  return (
    <View style={styles.flowConnector}>
      <Ionicons
        color={colors.textMuted}
        name="chevron-forward"
        size={13}
      />
    </View>
  );
}

function WeeklyVisitsChart() {
  const maxVisits = Math.max(
    ...weeklyPatientVisits.map(
      (record) => record.visits,
    ),
  );

  return (
    <View style={styles.chart}>
      {weeklyPatientVisits.map((record) => {
        const height = Math.max(
          18,
          Math.round(
            (record.visits / maxVisits) * 132,
          ),
        );

        return (
          <View
            key={record.day}
            style={styles.chartColumn}
          >
            <Text style={styles.chartColumnValue}>
              {record.visits}
            </Text>

            <View style={styles.chartBarArea}>
              <View
                style={[
                  styles.chartBar,
                  {
                    height,
                  },
                ]}
              />
            </View>

            <Text style={styles.chartDay}>
              {record.day}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function OccupancyRow({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View style={styles.occupancyRow}>
      <View
        style={[
          styles.occupancyRowDot,
          {
            backgroundColor: color,
          },
        ]}
      />

      <Text style={styles.occupancyRowLabel}>
        {label}
      </Text>

      <Text style={styles.occupancyRowValue}>
        {value}
      </Text>
    </View>
  );
}

function DepartmentCard({
  department,
  waiting,
  completed,
  total,
  icon,
  tone,
}: {
  department: string;
  waiting: number;
  completed: number;
  total: number;
  icon: keyof typeof Ionicons.glyphMap;
  tone: ExecutiveMetricTone;
}) {
  const selectedTone = getTone(tone);

  const completion =
    total > 0
      ? Math.round((completed / total) * 100)
      : 0;

  return (
    <View style={styles.departmentCard}>
      <View
        style={[
          styles.departmentIcon,
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

      <View style={styles.departmentContent}>
        <View style={styles.departmentHeader}>
          <View>
            <Text style={styles.departmentName}>
              {department}
            </Text>

            <Text style={styles.departmentMeta}>
              {waiting} waiting · {completed} completed
            </Text>
          </View>

          <Text style={styles.departmentPercent}>
            {completion}%
          </Text>
        </View>

        <View style={styles.departmentProgress}>
          <View
            style={[
              styles.departmentProgressFill,
              {
                width: `${completion}%`,
                backgroundColor:
                  selectedTone.color,
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

function StaffCard({
  label,
  total,
  available,
  onDuty,
  onLeave,
}: {
  label: string;
  total: number;
  available: number;
  onDuty: number;
  onLeave: number;
}) {
  return (
    <View style={styles.staffCard}>
      <View style={styles.staffHeader}>
        <View style={styles.staffIcon}>
          <Ionicons
            color={colors.primary}
            name="people-outline"
            size={21}
          />
        </View>

        <View style={styles.staffTotalBadge}>
          <Text style={styles.staffTotalText}>
            {total}
          </Text>
        </View>
      </View>

      <Text style={styles.staffLabel}>
        {label}
      </Text>

      <View style={styles.staffDetails}>
        <StaffDetail
          label="Available"
          tone="success"
          value={available}
        />

        <StaffDetail
          label="On duty"
          tone="primary"
          value={onDuty}
        />

        <StaffDetail
          label="On leave"
          tone="warning"
          value={onLeave}
        />
      </View>
    </View>
  );
}

function StaffDetail({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: ExecutiveMetricTone;
}) {
  const selectedTone = getTone(tone);

  return (
    <View style={styles.staffDetail}>
      <View
        style={[
          styles.staffDetailDot,
          {
            backgroundColor:
              selectedTone.color,
          },
        ]}
      />

      <Text style={styles.staffDetailLabel}>
        {label}
      </Text>

      <Text style={styles.staffDetailValue}>
        {value}
      </Text>
    </View>
  );
}

function RevenueItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.revenueItem}>
      <Text style={styles.revenueItemLabel}>
        {label}
      </Text>

      <Text style={styles.revenueItemValue}>
        {value}
      </Text>
    </View>
  );
}

function EquipmentCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone: ExecutiveMetricTone;
}) {
  const selectedTone = getTone(tone);

  return (
    <View style={styles.equipmentCard}>
      <View
        style={[
          styles.equipmentIcon,
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

      <Text style={styles.equipmentValue}>
        {value}
      </Text>

      <Text style={styles.equipmentLabel}>
        {label}
      </Text>
    </View>
  );
}

function ExecutiveAlertCard({
  alert,
}: {
  alert: ExecutiveAlert;
}) {
  const tone = getAlertTone(alert.severity);

  return (
    <View style={styles.alertCard}>
      <View
        style={[
          styles.alertIcon,
          {
            backgroundColor: tone.background,
          },
        ]}
      >
        <Ionicons
          color={tone.color}
          name={
            alert.icon as keyof typeof Ionicons.glyphMap
          }
          size={21}
        />
      </View>

      <View style={styles.alertContent}>
        <Text style={styles.alertTitle}>
          {alert.title}
        </Text>

        <Text style={styles.alertDescription}>
          {alert.description}
        </Text>

        <Text style={styles.alertTime}>
          {alert.time}
        </Text>
      </View>

      <Ionicons
        color={colors.textMuted}
        name="chevron-forward"
        size={19}
      />
    </View>
  );
}

function ServerDetail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.serverDetail}>
      <Text style={styles.serverDetailValue}>
        {value}
      </Text>

      <Text style={styles.serverDetailLabel}>
        {label}
      </Text>
    </View>
  );
}

function getTone(
  tone: ExecutiveMetricTone,
): {
  background: string;
  color: string;
} {
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

    info: {
      background: colors.infoSoft,
      color: colors.info,
    },
  };

  return tones[tone];
}

function getAlertTone(
  severity: ExecutiveAlert['severity'],
): {
  background: string;
  color: string;
} {
  switch (severity) {
    case 'critical':
      return {
        background: colors.dangerSoft,
        color: colors.danger,
      };

    case 'warning':
      return {
        background: colors.warningSoft,
        color: colors.warning,
      };

    case 'information':
      return {
        background: colors.infoSoft,
        color: colors.info,
      };
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
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: colors.surface,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.danger,
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

  heroFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.12)',
  },

  heroStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  heroStatusDot: {
    width: 7,
    height: 7,
    borderRadius: radius.round,
    backgroundColor: colors.secondary,
  },

  heroStatusText: {
    color: colors.secondary,
    fontSize: 8,
    fontWeight: typography.weight.extraBold,
    letterSpacing: 0.7,
  },

  heroTime: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 9,
  },

  readOnlyNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
  },

  readOnlyIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },

  readOnlyText: {
    flex: 1,
    marginLeft: spacing.md,
  },

  readOnlyTitle: {
    color: colors.textPrimary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.bold,
  },

  readOnlyDescription: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },

  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.lg,
  },

  metricCard: {
    width: '47.8%',
    minHeight: 154,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },

  metricIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },

  metricValue: {
    marginTop: spacing.md,
    color: colors.textPrimary,
    fontSize: 27,
    fontWeight: typography.weight.extraBold,
  },

  metricLabel: {
    marginTop: 2,
    color: colors.textPrimary,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.bold,
  },

  metricDescription: {
    marginTop: spacing.xs,
    color: colors.textMuted,
    fontSize: 9,
  },

  sectionHeading: {
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

  sectionDescription: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },

  patientFlowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
  },

  flowStep: {
    flex: 1,
    alignItems: 'center',
  },

  flowIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },

  flowValue: {
    marginTop: spacing.sm,
    color: colors.textPrimary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.extraBold,
  },

  flowLabel: {
    marginTop: 2,
    color: colors.textSecondary,
    fontSize: 8,
  },

  flowConnector: {
    width: 14,
    alignItems: 'center',
  },

  chartCard: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
  },

  chartHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  chartValue: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: typography.weight.extraBold,
  },

  chartLabel: {
    marginTop: 2,
    color: colors.textSecondary,
    fontSize: typography.size.caption,
  },

  increaseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 7,
    borderRadius: radius.round,
    backgroundColor: colors.successSoft,
  },

  increaseText: {
    color: colors.success,
    fontSize: 9,
    fontWeight: typography.weight.bold,
  },

  chart: {
    height: 190,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },

  chartColumn: {
    flex: 1,
    alignItems: 'center',
  },

  chartColumnValue: {
    color: colors.textMuted,
    fontSize: 8,
  },

  chartBarArea: {
    height: 140,
    justifyContent: 'flex-end',
    marginTop: spacing.xs,
  },

  chartBar: {
    width: 22,
    borderTopLeftRadius: radius.sm,
    borderTopRightRadius: radius.sm,
    backgroundColor: colors.primary,
  },

  chartDay: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontSize: 9,
  },

  splitSection: {
    marginTop: spacing.xxxl,
  },

  splitHeading: {
    marginBottom: spacing.lg,
  },

  splitEyebrow: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: typography.weight.extraBold,
    letterSpacing: 1.3,
  },

  splitTitle: {
    marginTop: spacing.xs,
    color: colors.textPrimary,
    fontSize: typography.size.cardTitle,
    fontWeight: typography.weight.bold,
  },

  occupancyCard: {
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
  },

  occupancyTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  occupancyCircle: {
    width: 118,
    height: 118,
    borderWidth: 13,
    borderColor: colors.primarySoft,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },

  occupancyValue: {
    color: colors.primary,
    fontSize: 25,
    fontWeight: typography.weight.extraBold,
  },

  occupancyLabel: {
    marginTop: 2,
    color: colors.textMuted,
    fontSize: 8,
    fontWeight: typography.weight.bold,
  },

  occupancyDetails: {
    flex: 1,
    gap: spacing.md,
    marginLeft: spacing.xl,
  },

  occupancyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  occupancyRowDot: {
    width: 8,
    height: 8,
    borderRadius: radius.round,
  },

  occupancyRowLabel: {
    flex: 1,
    marginLeft: spacing.sm,
    color: colors.textSecondary,
    fontSize: typography.size.caption,
  },

  occupancyRowValue: {
    color: colors.textPrimary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.bold,
  },

  occupancyProgress: {
    height: 8,
    overflow: 'hidden',
    marginTop: spacing.xl,
    borderRadius: radius.round,
    backgroundColor: colors.surfaceMuted,
  },

  occupancyProgressFill: {
    height: '100%',
    borderRadius: radius.round,
    backgroundColor: colors.primary,
  },

  departmentList: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },

  departmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },

  departmentIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },

  departmentContent: {
    flex: 1,
    marginLeft: spacing.md,
  },

  departmentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  departmentName: {
    color: colors.textPrimary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.bold,
  },

  departmentMeta: {
    marginTop: 3,
    color: colors.textSecondary,
    fontSize: typography.size.caption,
  },

  departmentPercent: {
    color: colors.primary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.extraBold,
  },

  departmentProgress: {
    height: 7,
    overflow: 'hidden',
    marginTop: spacing.md,
    borderRadius: radius.round,
    backgroundColor: colors.surfaceMuted,
  },

  departmentProgressFill: {
    height: '100%',
    borderRadius: radius.round,
  },

  staffList: {
    gap: spacing.md,
    paddingTop: spacing.lg,
    paddingRight: spacing.xl,
  },

  staffCard: {
    width: 236,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
  },

  staffHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  staffIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },

  staffTotalBadge: {
    minWidth: 40,
    height: 32,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },

  staffTotalText: {
    color: colors.textPrimary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.extraBold,
  },

  staffLabel: {
    marginTop: spacing.md,
    color: colors.textPrimary,
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
  },

  staffDetails: {
    gap: spacing.sm,
    marginTop: spacing.lg,
  },

  staffDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  staffDetailDot: {
    width: 7,
    height: 7,
    borderRadius: radius.round,
  },

  staffDetailLabel: {
    flex: 1,
    marginLeft: spacing.sm,
    color: colors.textSecondary,
    fontSize: typography.size.caption,
  },

  staffDetailValue: {
    color: colors.textPrimary,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.bold,
  },

  revenueCard: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.primaryDark,
  },

  revenueHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  revenueLabel: {
    color: colors.secondary,
    fontSize: 9,
    fontWeight: typography.weight.extraBold,
    letterSpacing: 1,
  },

  revenueValue: {
    marginTop: spacing.sm,
    color: colors.textOnPrimary,
    fontSize: 29,
    fontWeight: typography.weight.extraBold,
  },

  revenueChange: {
    marginTop: spacing.xs,
    color: colors.success,
    fontSize: typography.size.caption,
  },

  revenueIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.09)',
  },

  revenueBreakdown: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.12)',
  },

  revenueItem: {
    width: '47.8%',
  },

  revenueItemLabel: {
    color: 'rgba(255,255,255,0.48)',
    fontSize: 9,
  },

  revenueItemValue: {
    marginTop: spacing.xs,
    color: colors.textOnPrimary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.bold,
  },

  equipmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.lg,
  },

  equipmentCard: {
    width: '47.8%',
    minHeight: 126,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },

  equipmentIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },

  equipmentValue: {
    marginTop: spacing.md,
    color: colors.textPrimary,
    fontSize: 25,
    fontWeight: typography.weight.extraBold,
  },

  equipmentLabel: {
    marginTop: 2,
    color: colors.textSecondary,
    fontSize: typography.size.caption,
  },

  alertList: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },

  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },

  alertIcon: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },

  alertContent: {
    flex: 1,
    marginHorizontal: spacing.md,
  },

  alertTitle: {
    color: colors.textPrimary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.bold,
  },

  alertDescription: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },

  alertTime: {
    marginTop: spacing.sm,
    color: colors.textMuted,
    fontSize: 9,
  },

  systemStatusCard: {
    marginTop: spacing.xxxl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#BDE6D2',
    borderRadius: radius.xl,
    backgroundColor: colors.successSoft,
  },

  systemStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  systemStatusIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },

  systemStatusText: {
    flex: 1,
    marginHorizontal: spacing.md,
  },

  systemStatusTitle: {
    color: colors.textPrimary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.bold,
  },

  systemStatusDescription: {
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

  serverDetails: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#BDE6D2',
  },

  serverDetail: {
    flex: 1,
  },

  serverDetailValue: {
    color: colors.textPrimary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.extraBold,
  },

  serverDetailLabel: {
    marginTop: 3,
    color: colors.textSecondary,
    fontSize: 9,
  },

  pressed: {
    opacity: 0.7,
  },
});