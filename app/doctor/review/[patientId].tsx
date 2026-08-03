import { Ionicons } from '@expo/vector-icons';
import {
  router,
  useLocalSearchParams,
  type Href,
} from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/src/components';
import { useDoctorStore } from '@/src/store/doctor.store';
import { useLaboratoryStore } from '@/src/store/laboratory.store';
import { useNursingStore } from '@/src/store/nursing.store';
import { usePatientStore } from '@/src/store/patient.store';
import {
  colors,
  radius,
  spacing,
  typography,
} from '@/src/theme';
import type {
  DifferentialDiagnosis,
  PatientDisposition,
} from '@/src/types/doctor';
import { getPatientInitials } from '@/src/types/patient';

export default function DoctorReviewScreen() {
  const { patientId } = useLocalSearchParams<{
    patientId: string;
  }>();

  const patient = usePatientStore((state) =>
    state.getPatientById(patientId),
  );

  const consultation = useDoctorStore((state) =>
    state.getConsultationByPatientId(patientId),
  );

  const completeDoctorReview = useDoctorStore(
    (state) => state.completeDoctorReview,
  );

  const isCompletingReview = useDoctorStore(
    (state) => state.isCompletingReview,
  );

  const allVitalSigns = useNursingStore(
    (state) => state.vitalSigns,
  );

  const latestVitals = useMemo(() => {
    return allVitalSigns
      .filter(
        (item) => item.patientId === patientId,
      )
      .sort(
        (first, second) =>
          new Date(second.recordedAt).getTime() -
          new Date(first.recordedAt).getTime(),
      )[0];
  }, [allVitalSigns, patientId]);

  const allLaboratoryResults =
    useLaboratoryStore(
      (state) => state.laboratoryResults,
    );

  const laboratoryResults = useMemo(() => {
    return allLaboratoryResults
      .filter(
        (result) =>
          result.patientId === patientId,
      )
      .sort(
        (first, second) =>
          new Date(second.updatedAt).getTime() -
          new Date(first.updatedAt).getTime(),
      );
  }, [allLaboratoryResults, patientId]);

  const primaryDifferential =
    consultation?.differentialDiagnoses.find(
      (diagnosis) => diagnosis.isPrimary,
    );

  const [definitiveDiagnosis, setDefinitiveDiagnosis] =
    useState(
      consultation?.definitiveDiagnosis ??
        primaryDifferential?.diagnosis ??
        '',
    );

  const [disposition, setDisposition] =
    useState<PatientDisposition>(
      consultation?.disposition ?? 'outpatient',
    );

  const [reviewNote, setReviewNote] = useState(
    consultation?.reviewNote ?? '',
  );

  if (!patient || !consultation) {
    return (
      <SafeAreaView style={styles.notFound}>
        <Ionicons
          color={colors.primary}
          name="medical-outline"
          size={48}
        />

        <Text style={styles.notFoundTitle}>
          Clinical case unavailable
        </Text>

        <AppButton
          onPress={() =>
            router.replace('/doctor' as Href)
          }
          title="Return to doctor queue"
        />
      </SafeAreaView>
    );
  }

  const submitReview = async () => {
    const result = await completeDoctorReview({
      patientId: patient.id,
      consultationId: consultation.id,

      definitiveDiagnosis,
      disposition,
      reviewNote,
    });

    if (!result.success) {
      Alert.alert(
        'Review not completed',
        result.message,
      );

      return;
    }

    if (disposition === 'admission') {
      Alert.alert(
        'Patient marked for admission',
        'The patient is ready for bed allocation and ward admission.',
        [
          {
            text: 'Return to doctor queue',
            onPress: () =>
              router.replace('/doctor' as Href),
          },
          {
            text: 'Stay on case',
          },
        ],
      );

      return;
    }

    Alert.alert(
      'Doctor review completed',
      'The patient is ready for an outpatient prescription.',
      [
        {
          text: 'Create prescription',
          onPress: () =>
            router.push({
              pathname:
                '/doctor/prescription/[patientId]',
              params: {
                patientId: patient.id,
              },
            } as Href),
        },
        {
          text: 'Stay on review',
        },
      ],
    );
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />

      <SafeAreaView style={styles.safeArea}>
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
              Doctor result review
            </Text>

            <Text style={styles.headerSubtitle}>
              Final diagnosis and disposition
            </Text>
          </View>

          <View style={styles.caseOwnerBadge}>
            <Ionicons
              color={colors.primary}
              name="shield-checkmark"
              size={18}
            />
          </View>
        </View>

        <KeyboardAvoidingView
          behavior={
            Platform.OS === 'ios'
              ? 'padding'
              : undefined
          }
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.patientCard}>
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

                <Text style={styles.patientMeta}>
                  {patient.age} years ·{' '}
                  {patient.sex === 'male'
                    ? 'Male'
                    : 'Female'}
                </Text>
              </View>

              <View style={styles.resultReadyBadge}>
                <View style={styles.resultReadyDot} />

                <Text style={styles.resultReadyText}>
                  RESULT READY
                </Text>
              </View>
            </View>

            <View style={styles.reviewNotice}>
              <Ionicons
                color={colors.primary}
                name="medical-outline"
                size={23}
              />

              <View style={styles.reviewNoticeText}>
                <Text style={styles.reviewNoticeTitle}>
                  Complete clinical review
                </Text>

                <Text
                  style={
                    styles.reviewNoticeDescription
                  }
                >
                  Review the clinical history, nursing
                  assessment and laboratory findings before
                  recording the definitive diagnosis.
                </Text>
              </View>
            </View>

            <ReviewSection
              icon="document-text-outline"
              title="Clinical summary"
            >
              <SummaryRow
                label="Presenting complaint"
                value={
                  consultation.presentingComplaint
                }
              />

              <SummaryRow
                label="History of present illness"
                value={
                  consultation.historyOfPresentIllness
                }
              />

              <SummaryRow
                label="Working diagnoses"
                value={
                  consultation.differentialDiagnoses
                    .map(
                      (diagnosis) =>
                        diagnosis.diagnosis,
                    )
                    .join(', ') || 'Not recorded'
                }
              />
            </ReviewSection>

            <ReviewSection
              icon="pulse-outline"
              title="Latest nursing assessment"
            >
              {latestVitals ? (
                <View style={styles.vitalsGrid}>
                  <VitalCard
                    label="Blood pressure"
                    value={`${latestVitals.systolicBloodPressure}/${latestVitals.diastolicBloodPressure}`}
                    suffix="mmHg"
                  />

                  <VitalCard
                    label="Temperature"
                    value={String(
                      latestVitals.temperature,
                    )}
                    suffix="°C"
                  />

                  <VitalCard
                    label="Pulse"
                    value={String(
                      latestVitals.pulseRate,
                    )}
                    suffix="bpm"
                  />

                  <VitalCard
                    label="Oxygen"
                    value={String(
                      latestVitals.oxygenSaturation,
                    )}
                    suffix="%"
                  />
                </View>
              ) : (
                <Text style={styles.emptyText}>
                  No nursing assessment available.
                </Text>
              )}
            </ReviewSection>

            <ReviewSection
              icon="flask-outline"
              title="Validated laboratory findings"
            >
              {laboratoryResults.length ? (
                <View style={styles.resultsList}>
                  {laboratoryResults.flatMap(
                    (laboratoryResult) =>
                      laboratoryResult.results.map(
                        (result) => (
                          <View
                            key={`${laboratoryResult.id}-${result.id}`}
                            style={styles.resultCard}
                          >
                            <View
                              style={
                                styles.resultHeader
                              }
                            >
                              <Text
                                style={
                                  styles.resultName
                                }
                              >
                                {result.testName}
                              </Text>

                              <Text
                                style={[
                                  styles.resultStatus,
                                  result.findingStatus ===
                                    'critical' &&
                                    styles.criticalStatus,
                                ]}
                              >
                                {result.findingStatus.toUpperCase()}
                              </Text>
                            </View>

                            <Text
                              style={
                                styles.resultValue
                              }
                            >
                              {result.result}
                              {result.unit
                                ? ` ${result.unit}`
                                : ''}
                            </Text>

                            <Text
                              style={
                                styles.resultFinding
                              }
                            >
                              {result.finding}
                            </Text>
                          </View>
                        ),
                      ),
                  )}
                </View>
              ) : (
                <Text style={styles.emptyText}>
                  No validated laboratory results available.
                </Text>
              )}
            </ReviewSection>

            <View style={styles.decisionCard}>
              <View style={styles.decisionHeader}>
                <View style={styles.decisionIcon}>
                  <Ionicons
                    color={colors.primary}
                    name="checkmark-done-outline"
                    size={22}
                  />
                </View>

                <View style={styles.decisionText}>
                  <Text style={styles.decisionTitle}>
                    Clinical decision
                  </Text>

                  <Text
                    style={
                      styles.decisionDescription
                    }
                  >
                    Record the definitive diagnosis and
                    determine the patient’s next step.
                  </Text>
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>
                  Definitive diagnosis *
                </Text>

                <TextInput
                  multiline
                  onChangeText={
                    setDefinitiveDiagnosis
                  }
                  placeholder="Example: Acute uncomplicated malaria"
                  placeholderTextColor={
                    colors.textMuted
                  }
                  selectionColor={colors.primary}
                  style={styles.textArea}
                  textAlignVertical="top"
                  value={definitiveDiagnosis}
                />
              </View>

              <Text style={styles.fieldLabel}>
                Patient disposition *
              </Text>

              <View style={styles.dispositionOptions}>
                <DispositionOption
                  active={
                    disposition === 'outpatient'
                  }
                  description="Treat and dispense medication"
                  icon="walk-outline"
                  label="Outpatient"
                  onPress={() =>
                    setDisposition('outpatient')
                  }
                />

                <DispositionOption
                  active={
                    disposition === 'admission'
                  }
                  description="Send patient to ward admission"
                  icon="bed-outline"
                  label="Admission"
                  onPress={() =>
                    setDisposition('admission')
                  }
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>
                  Doctor review note
                </Text>

                <TextInput
                  multiline
                  onChangeText={setReviewNote}
                  placeholder="Add treatment reasoning, follow-up instruction or relevant review notes..."
                  placeholderTextColor={
                    colors.textMuted
                  }
                  selectionColor={colors.primary}
                  style={styles.textArea}
                  textAlignVertical="top"
                  value={reviewNote}
                />
              </View>
            </View>

            <View style={styles.actions}>
              <AppButton
                loading={isCompletingReview}
                onPress={submitReview}
                title={
                  disposition === 'admission'
                    ? 'Complete review and admit'
                    : 'Complete review and prescribe'
                }
              />

              <AppButton
                onPress={() => router.back()}
                title="Return to clinical case"
                variant="ghost"
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

function ReviewSection({
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

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>
        {label}
      </Text>

      <Text style={styles.summaryValue}>
        {value || 'Not recorded'}
      </Text>
    </View>
  );
}

function VitalCard({
  label,
  value,
  suffix,
}: {
  label: string;
  value: string;
  suffix: string;
}) {
  return (
    <View style={styles.vitalCard}>
      <Text style={styles.vitalLabel}>{label}</Text>

      <Text style={styles.vitalValue}>
        {value}
        <Text style={styles.vitalSuffix}>
          {' '}
          {suffix}
        </Text>
      </Text>
    </View>
  );
}

function DispositionOption({
  label,
  description,
  icon,
  active,
  onPress,
}: {
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.dispositionOption,
        active &&
          styles.selectedDispositionOption,
      ]}
    >
      <View
        style={[
          styles.dispositionIcon,
          active &&
            styles.selectedDispositionIcon,
        ]}
      >
        <Ionicons
          color={
            active
              ? colors.textOnPrimary
              : colors.primary
          }
          name={icon}
          size={23}
        />
      </View>

      <Text style={styles.dispositionTitle}>
        {label}
      </Text>

      <Text
        style={styles.dispositionDescription}
      >
        {description}
      </Text>

      <Ionicons
        color={
          active
            ? colors.primary
            : colors.textMuted
        }
        name={
          active
            ? 'checkmark-circle'
            : 'ellipse-outline'
        }
        size={22}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  safeArea: {
    flex: 1,
  },

  header: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screenHorizontal,
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

  caseOwnerBadge: {
    width: 42,
    height: 42,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },

  keyboardView: {
    flex: 1,
  },

  content: {
    padding: spacing.screenHorizontal,
    paddingBottom: spacing.massive,
  },

  patientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryDark,
  },

  avatar: {
    width: 54,
    height: 54,
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

  patientIdentity: {
    flex: 1,
    marginHorizontal: spacing.md,
  },

  patientName: {
    color: colors.textOnPrimary,
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
  },

  hospitalNumber: {
    marginTop: 2,
    color: colors.secondary,
    fontSize: typography.size.caption,
  },

  patientMeta: {
    marginTop: 4,
    color: 'rgba(255,255,255,0.55)',
    fontSize: 10,
  },

  resultReadyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },

  resultReadyDot: {
    width: 7,
    height: 7,
    borderRadius: radius.round,
    backgroundColor: colors.secondary,
  },

  resultReadyText: {
    color: colors.secondary,
    fontSize: 8,
    fontWeight: typography.weight.extraBold,
  },

  reviewNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
  },

  reviewNoticeText: {
    flex: 1,
  },

  reviewNoticeTitle: {
    color: colors.textPrimary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.bold,
  },

  reviewNoticeDescription: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
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

  summaryRow: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  summaryLabel: {
    color: colors.textMuted,
    fontSize: typography.size.caption,
  },

  summaryValue: {
    marginTop: spacing.xs,
    color: colors.textPrimary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },

  vitalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },

  vitalCard: {
    width: '47.8%',
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
  },

  vitalLabel: {
    color: colors.textSecondary,
    fontSize: 10,
  },

  vitalValue: {
    marginTop: spacing.xs,
    color: colors.textPrimary,
    fontSize: typography.size.body,
    fontWeight: typography.weight.extraBold,
  },

  vitalSuffix: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: typography.weight.regular,
  },

  resultsList: {
    gap: spacing.md,
  },

  resultCard: {
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
  },

  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  resultName: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.bold,
  },

  resultStatus: {
    color: colors.success,
    fontSize: 8,
    fontWeight: typography.weight.extraBold,
  },

  criticalStatus: {
    color: colors.danger,
  },

  resultValue: {
    marginTop: spacing.md,
    color: colors.textPrimary,
    fontSize: typography.size.bodyLarge,
    fontWeight: typography.weight.extraBold,
  },

  resultFinding: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },

  emptyText: {
    padding: spacing.lg,
    color: colors.textSecondary,
    fontSize: typography.size.label,
    textAlign: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
  },

  decisionCard: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
  },

  decisionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  decisionIcon: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },

  decisionText: {
    flex: 1,
    marginLeft: spacing.md,
  },

  decisionTitle: {
    color: colors.textPrimary,
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
  },

  decisionDescription: {
    marginTop: 3,
    color: colors.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },

  field: {
    marginTop: spacing.lg,
  },

  fieldLabel: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    color: colors.textPrimary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.semibold,
  },

  textArea: {
    minHeight: 110,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    color: colors.textPrimary,
    fontSize: typography.size.body,
    backgroundColor: colors.surface,
  },

  dispositionOptions: {
    gap: spacing.md,
  },

  dispositionOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },

  selectedDispositionOption: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },

  dispositionIcon: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },

  selectedDispositionIcon: {
    backgroundColor: colors.primary,
  },

  dispositionTitle: {
    marginLeft: spacing.md,
    color: colors.textPrimary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.bold,
  },

  dispositionDescription: {
    flex: 1,
    marginHorizontal: spacing.md,
    color: colors.textSecondary,
    fontSize: typography.size.caption,
  },

  actions: {
    gap: spacing.md,
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
});