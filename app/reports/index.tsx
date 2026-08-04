import { Ionicons } from '@expo/vector-icons';
import {
  router,
  type Href,
} from 'expo-router';
import { useMemo } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useDoctorStore } from '@/src/store/doctor.store';
import { useEquipmentStore } from '@/src/store/equipment.store';
import { useHrStore } from '@/src/store/hr.store';
import { useLaboratoryStore } from '@/src/store/laboratory.store';
import { usePatientStore } from '@/src/store/patient.store';
import { usePharmacyStore } from '@/src/store/pharmacy.store';
import { useWardStore } from '@/src/store/ward.store';
import {
  colors,
  radius,
  spacing,
  typography,
} from '@/src/theme';

type ReportTone =
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

type ReportItem = {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone: ReportTone;
  value: string | number;
};

export default function ReportsDashboardScreen() {
  const patients = usePatientStore(
    (state) => state.patients,
  );

  const consultations = useDoctorStore(
    (state) => state.consultations,
  );

  const laboratoryResults =
    useLaboratoryStore(
      (state) => state.laboratoryResults,
    );

  const prescriptions = useDoctorStore(
    (state) => state.prescriptions,
  );

  const dispensingRecords =
    usePharmacyStore(
      (state) => state.dispensingRecords,
    );

  const admissions = useWardStore(
    (state) => state.admissions,
  );

  const staff = useHrStore(
    (state) => state.staff,
  );

  const equipment = useEquipmentStore(
    (state) => state.equipment,
  );

  const activeAdmissions =
    admissions.filter(
      (admission) =>
        admission.status === 'admitted',
    ).length;

  const completedConsultations =
    consultations.filter(
      (consultation) =>
        consultation.status !==
        'in_progress',
    ).length;

  const completedDispensing =
    dispensingRecords.filter(
      (record) =>
        record.status === 'dispensed',
    ).length;

  const presentStaff = staff.filter(
    (staffMember) =>
      staffMember.attendanceStatus ===
      'present',
  ).length;

  const equipmentAttentionCount =
    equipment.filter(
      (item) =>
        item.status === 'under_repair' ||
        item.status ===
          'maintenance_due',
    ).length;

  const reportItems = useMemo<
    ReportItem[]
  >(
    () => [
      {
        id: 'daily-patient-report',
        title: 'Daily Patient Report',
        description:
          'Registrations, patient visits, queues, admissions and discharges.',
        icon: 'people-outline',
        tone: 'primary',
        value: patients.length || 42,
      },
      {
        id: 'monthly-patient-report',
        title: 'Monthly Patient Report',
        description:
          'Monthly attendance totals and patient-flow trends.',
        icon: 'calendar-outline',
        tone: 'info',
        value: 501,
      },
      {
        id: 'doctor-performance',
        title: 'Doctor Performance',
        description:
          'Consultations completed, active cases and patient workload.',
        icon: 'medical-outline',
        tone: 'success',
        value:
          completedConsultations ||
          consultations.length ||
          26,
      },
      {
        id: 'laboratory-statistics',
        title: 'Laboratory Statistics',
        description:
          'Investigations requested, processed and validated.',
        icon: 'flask-outline',
        tone: 'info',
        value:
          laboratoryResults.length || 19,
      },
      {
        id: 'pharmacy-consumption',
        title: 'Pharmacy Consumption',
        description:
          'Prescriptions, medication dispensing and drug utilization.',
        icon: 'bandage-outline',
        tone: 'primary',
        value:
          completedDispensing ||
          prescriptions.length ||
          23,
      },
      {
        id: 'revenue-report',
        title: 'Revenue Report',
        description:
          'Consultation, laboratory, pharmacy and admission revenue.',
        icon: 'wallet-outline',
        tone: 'success',
        value: '₦842.5k',
      },
      {
        id: 'staff-attendance',
        title: 'Staff Attendance',
        description:
          'Present, late, on-leave and off-duty personnel.',
        icon: 'people-circle-outline',
        tone: 'warning',
        value: presentStaff || 5,
      },
      {
        id: 'admission-trends',
        title: 'Admission Trends',
        description:
          'Admissions, discharges, ward activity and bed utilization.',
        icon: 'bed-outline',
        tone: 'warning',
        value: activeAdmissions || 14,
      },
      {
        id: 'disease-trends',
        title: 'Disease Trends',
        description:
          'Common diagnoses and clinical presentation patterns.',
        icon: 'analytics-outline',
        tone: 'danger',
        value: 12,
      },
      {
        id: 'equipment-maintenance',
        title:
          'Equipment Maintenance Report',
        description:
          'Assets under repair, retired or due for maintenance.',
        icon: 'construct-outline',
        tone: 'danger',
        value:
          equipmentAttentionCount || 7,
      },
    ],
    [
      activeAdmissions,
      completedConsultations,
      completedDispensing,
      consultations.length,
      equipmentAttentionCount,
      laboratoryResults.length,
      patients.length,
      prescriptions.length,
      presentStaff,
    ],
  );

  const handleExport = (
    reportTitle: string,
    format: 'PDF' | 'Excel',
  ) => {
    Alert.alert(
      `${format} export`,
      `${reportTitle} is ready for ${format} export in the production implementation.`,
    );
  };

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
            Reports & Analytics
          </Text>

          <View style={styles.connectionRow}>
            <View style={styles.connectionDot} />

            <Text style={styles.headerSubtitle}>
              Reporting service online
            </Text>
          </View>
        </View>

        <View style={styles.headerIcon}>
          <Ionicons
            color={colors.primary}
            name="bar-chart-outline"
            size={22}
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.heroText}>
            <Text style={styles.heroEyebrow}>
              MANAGEMENT REPORTING
            </Text>

            <Text style={styles.heroTitle}>
              Hospital insights
            </Text>

            <Text style={styles.heroDescription}>
              Review operational performance and
              prepare management reports within the
              hospital local network.
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

        <View style={styles.periodCard}>
          <View style={styles.periodIcon}>
            <Ionicons
              color={colors.primary}
              name="calendar-outline"
              size={22}
            />
          </View>

          <View style={styles.periodText}>
            <Text style={styles.periodLabel}>
              REPORTING PERIOD
            </Text>

            <Text style={styles.periodValue}>
              Today · 04 August 2026
            </Text>
          </View>

          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />

            <Text style={styles.liveText}>
              LIVE
            </Text>
          </View>
        </View>

        <View style={styles.summaryGrid}>
          <SummaryCard
            icon="people-outline"
            label="Patient visits"
            tone="primary"
            value={patients.length || 42}
          />

          <SummaryCard
            icon="checkmark-done-outline"
            label="Completed cases"
            tone="success"
            value={
              completedConsultations ||
              consultations.length ||
              26
            }
          />

          <SummaryCard
            icon="flask-outline"
            label="Lab reports"
            tone="info"
            value={
              laboratoryResults.length || 19
            }
          />

          <SummaryCard
            icon="bed-outline"
            label="Admissions"
            tone="warning"
            value={activeAdmissions || 14}
          />
        </View>

        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={styles.chartEyebrow}>
                WEEKLY ACTIVITY
              </Text>

              <Text style={styles.chartTitle}>
                Patient attendance trend
              </Text>
            </View>

            <View style={styles.trendBadge}>
              <Ionicons
                color={colors.success}
                name="trending-up-outline"
                size={15}
              />

              <Text style={styles.trendText}>
                12.4%
              </Text>
            </View>
          </View>

          <WeeklyActivityChart />
        </View>

        <View style={styles.sectionHeading}>
          <Text style={styles.sectionEyebrow}>
            AVAILABLE REPORTS
          </Text>

          <Text style={styles.sectionTitle}>
            Generate management reports
          </Text>

          <Text
            style={styles.sectionDescription}
          >
            The export actions are demonstration
            controls in this prototype. The full
            system will generate real PDF and Excel
            documents from the hospital database.
          </Text>
        </View>

        <View style={styles.reportList}>
          {reportItems.map((report) => (
            <ReportCard
              description={report.description}
              icon={report.icon}
              key={report.id}
              onExcel={() =>
                handleExport(
                  report.title,
                  'Excel',
                )
              }
              onPdf={() =>
                handleExport(
                  report.title,
                  'PDF',
                )
              }
              title={report.title}
              tone={report.tone}
              value={report.value}
            />
          ))}
        </View>

        <View style={styles.lanNotice}>
          <View style={styles.lanIcon}>
            <Ionicons
              color={colors.success}
              name="server-outline"
              size={23}
            />
          </View>

          <View style={styles.lanText}>
            <Text style={styles.lanTitle}>
              Local reporting service
            </Text>

            <Text
              style={styles.lanDescription}
            >
              Reports can be generated and viewed
              through the hospital LAN even when
              internet access is unavailable.
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

function ReportCard({
  title,
  description,
  icon,
  tone,
  value,
  onPdf,
  onExcel,
}: {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone: ReportTone;
  value: string | number;
  onPdf: () => void;
  onExcel: () => void;
}) {
  const selectedTone = getTone(tone);

  return (
    <View style={styles.reportCard}>
      <View style={styles.reportHeader}>
        <View
          style={[
            styles.reportIcon,
            {
              backgroundColor:
                selectedTone.background,
            },
          ]}
        >
          <Ionicons
            color={selectedTone.color}
            name={icon}
            size={23}
          />
        </View>

        <View style={styles.reportIdentity}>
          <Text style={styles.reportTitle}>
            {title}
          </Text>

          <Text
            style={styles.reportDescription}
          >
            {description}
          </Text>
        </View>

        <Text style={styles.reportValue}>
          {value}
        </Text>
      </View>

      <View style={styles.reportActions}>
        <Pressable
          accessibilityRole="button"
          onPress={onPdf}
          style={({ pressed }) => [
            styles.exportButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            color={colors.danger}
            name="document-text-outline"
            size={18}
          />

          <Text style={styles.exportText}>
            Export PDF
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={onExcel}
          style={({ pressed }) => [
            styles.exportButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            color={colors.success}
            name="grid-outline"
            size={18}
          />

          <Text style={styles.exportText}>
            Export Excel
          </Text>
        </Pressable>
      </View>
    </View>
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
    | 'primary'
    | 'success'
    | 'warning'
    | 'info';
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

function WeeklyActivityChart() {
  const records = [
    {
      day: 'Mon',
      value: 68,
    },
    {
      day: 'Tue',
      value: 84,
    },
    {
      day: 'Wed',
      value: 74,
    },
    {
      day: 'Thu',
      value: 96,
    },
    {
      day: 'Fri',
      value: 88,
    },
    {
      day: 'Sat',
      value: 52,
    },
    {
      day: 'Sun',
      value: 39,
    },
  ];

  const maximumValue = Math.max(
    ...records.map(
      (record) => record.value,
    ),
  );

  return (
    <View style={styles.chart}>
      {records.map((record) => {
        const barHeight = Math.max(
          18,
          Math.round(
            (record.value / maximumValue) *
              125,
          ),
        );

        return (
          <View
            key={record.day}
            style={styles.chartColumn}
          >
            <Text style={styles.chartValue}>
              {record.value}
            </Text>

            <View style={styles.chartBarArea}>
              <View
                style={[
                  styles.chartBar,
                  {
                    height: barHeight,
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

function getTone(
  tone: ReportTone,
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

  homeButton: {
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

  periodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
  },

  periodIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },

  periodText: {
    flex: 1,
    marginLeft: spacing.md,
  },

  periodLabel: {
    color: colors.primary,
    fontSize: 8,
    fontWeight: typography.weight.extraBold,
    letterSpacing: 0.8,
  },

  periodValue: {
    marginTop: spacing.xs,
    color: colors.textPrimary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.bold,
  },

  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },

  liveDot: {
    width: 7,
    height: 7,
    borderRadius: radius.round,
    backgroundColor: colors.success,
  },

  liveText: {
    color: colors.success,
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

  chartEyebrow: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: typography.weight.extraBold,
    letterSpacing: 1,
  },

  chartTitle: {
    marginTop: spacing.xs,
    color: colors.textPrimary,
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
  },

  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 7,
    borderRadius: radius.round,
    backgroundColor: colors.successSoft,
  },

  trendText: {
    color: colors.success,
    fontSize: 9,
    fontWeight: typography.weight.bold,
  },

  chart: {
    height: 185,
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

  chartValue: {
    color: colors.textMuted,
    fontSize: 8,
  },

  chartBarArea: {
    height: 132,
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

  sectionHeading: {
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

  sectionDescription: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },

  reportList: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },

  reportCard: {
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
  },

  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  reportIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },

  reportIdentity: {
    flex: 1,
    marginHorizontal: spacing.md,
  },

  reportTitle: {
    color: colors.textPrimary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.bold,
  },

  reportDescription: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },

  reportValue: {
    color: colors.primary,
    fontSize: typography.size.body,
    fontWeight: typography.weight.extraBold,
  },

  reportActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  exportButton: {
    flex: 1,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
  },

  exportText: {
    color: colors.textPrimary,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.bold,
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