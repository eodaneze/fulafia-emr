import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams, type Href} from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
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
import { usePatientStore } from '@/src/store/patient.store';
import {
  colors,
  radius,
  spacing,
  typography,
} from '@/src/theme';
import type {
  LaboratoryFindingStatus,
  LaboratoryTestResult,
  LaboratoryTestResultForm,
} from '@/src/types/laboratory';
import { getPatientInitials } from '@/src/types/patient';

const findingStatuses: Array<{
  value: LaboratoryFindingStatus;
  label: string;
}> = [
  {
    value: 'normal',
    label: 'Normal',
  },
  {
    value: 'abnormal',
    label: 'Abnormal',
  },
  {
    value: 'critical',
    label: 'Critical',
  },
  {
    value: 'positive',
    label: 'Positive',
  },
  {
    value: 'negative',
    label: 'Negative',
  },
];

export default function LaboratoryResultScreen() {
  const { requestId } = useLocalSearchParams<{
    requestId: string;
  }>();

  const request = useDoctorStore((state) =>
    state.laboratoryRequests.find(
      (item) => item.id === requestId,
    ),
  );

  const patient = usePatientStore((state) =>
    request
      ? state.getPatientById(request.patientId)
      : undefined,
  );

  const existingResult = useLaboratoryStore(
    (state) =>
      state.getResultByRequestId(requestId),
  );

  const collectSpecimen = useLaboratoryStore(
    (state) => state.collectSpecimen,
  );

  const saveDraftResults = useLaboratoryStore(
    (state) => state.saveDraftResults,
  );

  const completeAndValidateResults =
    useLaboratoryStore(
      (state) =>
        state.completeAndValidateResults,
    );

  const isCollectingSpecimen =
    useLaboratoryStore(
      (state) => state.isCollectingSpecimen,
    );

  const isSavingResults = useLaboratoryStore(
    (state) => state.isSavingResults,
  );

  const isValidatingResults =
    useLaboratoryStore(
      (state) => state.isValidatingResults,
    );

  const [resultForms, setResultForms] = useState<
    LaboratoryTestResultForm[]
  >([]);

  useEffect(() => {
    if (!request) {
      return;
    }

    setResultForms(
      request.tests.map((test) => {
        const savedTest =
          existingResult?.results.find(
            (item) =>
              item.testCode === test.code,
          );

        return {
          test,

          finding: savedTest?.finding ?? '',
          result: savedTest?.result ?? '',
          unit: savedTest?.unit ?? '',
          referenceRange:
            savedTest?.referenceRange ?? '',
          comment: savedTest?.comment ?? '',

          findingStatus:
            savedTest?.findingStatus ?? 'normal',
        };
      }),
    );
  }, [existingResult, request]);

  const completionPercentage = useMemo(() => {
    if (!resultForms.length) {
      return 0;
    }

    const completed = resultForms.filter(
      (form) =>
        form.finding.trim() &&
        form.result.trim(),
    ).length;

    return Math.round(
      (completed / resultForms.length) * 100,
    );
  }, [resultForms]);

  if (!request || !patient) {
    return (
      <SafeAreaView style={styles.notFound}>
        <Ionicons
          color={colors.primary}
          name="flask-outline"
          size={52}
        />

        <Text style={styles.notFoundTitle}>
          Request unavailable
        </Text>

        <AppButton
          onPress={() =>
            router.replace('/laboratory' as Href)
          }
          title="Return to laboratory"
        />
      </SafeAreaView>
    );
  }

  const updateResultForm = (
    testCode: string,
    values: Partial<LaboratoryTestResultForm>,
  ) => {
    setResultForms((current) =>
      current.map((form) =>
        form.test.code === testCode
          ? {
              ...form,
              ...values,
            }
          : form,
      ),
    );
  };

  const buildResults = (): LaboratoryTestResult[] => {
    return resultForms.map((form) => ({
      id: `test-result-${request.id}-${form.test.code}`,

      testCode: form.test.code,
      testName: form.test.name,

      finding: form.finding.trim(),
      result: form.result.trim(),

      unit: form.unit.trim() || undefined,

      referenceRange:
        form.referenceRange.trim() || undefined,

      comment: form.comment.trim() || undefined,

      findingStatus: form.findingStatus,
    }));
  };

  const handleCollectSpecimen = async () => {
    const result = await collectSpecimen(
      request.id,
    );

    Alert.alert(
      result.success
        ? 'Specimen collected'
        : 'Unable to collect specimen',
      result.message,
    );
  };

  const handleSaveDraft = async () => {
    const result = await saveDraftResults({
      request,
      results: buildResults(),
    });

    Alert.alert(
      result.success
        ? 'Draft saved'
        : 'Unable to save draft',
      result.message,
    );
  };

  const handleCompleteResults = async () => {
    if (
      existingResult?.specimenCollectionStatus !==
        'collected' &&
      request.status === 'requested'
    ) {
      Alert.alert(
        'Specimen not collected',
        'Record specimen collection before validating the results.',
      );

      return;
    }

    const result =
      await completeAndValidateResults({
        request,
        results: buildResults(),
      });

    if (!result.success) {
      Alert.alert(
        'Results not completed',
        result.message,
      );

      return;
    }

    Alert.alert(
      'Results returned to doctor',
      `${patient.fullName}'s laboratory results have been validated and returned to ${request.requestedBy.fullName}.`,
      [
        {
          text: 'Return to laboratory',
          onPress: () =>
            router.replace('/laboratory' as Href),
        },
        {
          text: 'Remain on result',
        },
      ],
    );
  };

  const specimenCollected =
    existingResult?.specimenCollectionStatus ===
      'collected' ||
    request.status === 'sample_collected' ||
    request.status === 'processing' ||
    request.status === 'completed';

  const isCompleted =
    request.status === 'completed';

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
              Laboratory request
            </Text>

            <Text style={styles.headerSubtitle}>
              {request.id}
            </Text>
          </View>

          <View style={styles.progressBadge}>
            <Text style={styles.progressText}>
              {completionPercentage}%
            </Text>
          </View>
        </View>

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${completionPercentage}%`,
              },
            ]}
          />
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

              <View
                style={[
                  styles.priorityBadge,
                  request.priority === 'urgent' &&
                    styles.urgentPriorityBadge,
                ]}
              >
                <Text
                  style={[
                    styles.priorityText,
                    request.priority === 'urgent' &&
                      styles.urgentPriorityText,
                  ]}
                >
                  {request.priority.toUpperCase()}
                </Text>
              </View>
            </View>

            <View style={styles.requestSummary}>
              <InformationItem
                icon="medical-outline"
                label="Requested by"
                value={request.requestedBy.fullName}
              />

              <InformationItem
                icon="time-outline"
                label="Requested at"
                value={new Date(
                  request.requestedAt,
                ).toLocaleString()}
              />

              <InformationItem
                icon="flask-outline"
                label="Investigations"
                value={`${request.tests.length} requested`}
              />
            </View>

            <View style={styles.accessRestriction}>
              <Ionicons
                color={colors.info}
                name="eye-off-outline"
                size={23}
              />

              <View style={styles.accessRestrictionText}>
                <Text style={styles.accessRestrictionTitle}>
                  Restricted clinical view
                </Text>

                <Text
                  style={
                    styles.accessRestrictionDescription
                  }
                >
                  The doctor’s diagnosis, complete history and
                  vital signs are intentionally unavailable.
                </Text>
              </View>
            </View>

            <View style={styles.specimenCard}>
              <View style={styles.specimenHeading}>
                <View style={styles.specimenIcon}>
                  <Ionicons
                    color={colors.info}
                    name="water-outline"
                    size={22}
                  />
                </View>

                <View style={styles.specimenText}>
                  <Text style={styles.specimenTitle}>
                    Specimen collection
                  </Text>

                  <Text
                    style={styles.specimenDescription}
                  >
                    Required specimens:{' '}
                    {[
                      ...new Set(
                        request.tests.map(
                          (test) => test.specimen,
                        ),
                      ),
                    ].join(', ')}
                  </Text>
                </View>

                <View
                  style={[
                    styles.collectionStatus,
                    specimenCollected &&
                      styles.collectedStatus,
                  ]}
                >
                  <View
                    style={[
                      styles.collectionDot,
                      specimenCollected &&
                        styles.collectedDot,
                    ]}
                  />

                  <Text
                    style={[
                      styles.collectionText,
                      specimenCollected &&
                        styles.collectedText,
                    ]}
                  >
                    {specimenCollected
                      ? 'Collected'
                      : 'Pending'}
                  </Text>
                </View>
              </View>

              {!specimenCollected ? (
                <AppButton
                  loading={isCollectingSpecimen}
                  onPress={handleCollectSpecimen}
                  title="Record specimen collection"
                  variant="outline"
                />
              ) : null}
            </View>

            <View style={styles.sectionHeading}>
              <Text style={styles.sectionEyebrow}>
                RESULT ENTRY
              </Text>

              <Text style={styles.sectionTitle}>
                Requested investigations
              </Text>

              <Text style={styles.sectionDescription}>
                Enter the finding and final result for every
                requested test.
              </Text>
            </View>

            <View style={styles.resultList}>
              {resultForms.map((form, index) => (
                <TestResultForm
                  disabled={isCompleted}
                  form={form}
                  index={index}
                  key={form.test.code}
                  updateForm={(values) =>
                    updateResultForm(
                      form.test.code,
                      values,
                    )
                  }
                />
              ))}
            </View>

            <View style={styles.doctorReturnNotice}>
              <View style={styles.doctorReturnIcon}>
                <Ionicons
                  color={colors.success}
                  name="return-down-back-outline"
                  size={23}
                />
              </View>

              <View style={styles.doctorReturnText}>
                <Text style={styles.doctorReturnTitle}>
                  Automatic doctor notification
                </Text>

                <Text
                  style={
                    styles.doctorReturnDescription
                  }
                >
                  Validation changes the patient status to
                  “Lab Result Ready” and returns the result to
                  the case owner.
                </Text>
              </View>
            </View>

            {!isCompleted ? (
              <View style={styles.actions}>
                <AppButton
                  loading={isValidatingResults}
                  onPress={handleCompleteResults}
                  title="Validate and return results"
                />

                <AppButton
                  loading={isSavingResults}
                  onPress={handleSaveDraft}
                  title="Save result draft"
                  variant="ghost"
                />
              </View>
            ) : (
              <View style={styles.completedCard}>
                <Ionicons
                  color={colors.success}
                  name="checkmark-circle"
                  size={27}
                />

                <View style={styles.completedText}>
                  <Text style={styles.completedTitle}>
                    Laboratory result completed
                  </Text>

                  <Text
                    style={styles.completedDescription}
                  >
                    This result has been validated and returned
                    to the requesting doctor.
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

function TestResultForm({
  form,
  index,
  updateForm,
  disabled,
}: {
  form: LaboratoryTestResultForm;
  index: number;
  updateForm: (
    values: Partial<LaboratoryTestResultForm>,
  ) => void;
  disabled: boolean;
}) {
  return (
    <View style={styles.testCard}>
      <View style={styles.testHeader}>
        <View style={styles.testNumber}>
          <Text style={styles.testNumberText}>
            {String(index + 1).padStart(2, '0')}
          </Text>
        </View>

        <View style={styles.testIdentity}>
          <Text style={styles.testName}>
            {form.test.name}
          </Text>

          <Text style={styles.testMeta}>
            {form.test.code} · {form.test.category} ·{' '}
            {form.test.specimen}
          </Text>
        </View>
      </View>

      <ResultInput
        disabled={disabled}
        label="Finding *"
        onChangeText={(value) =>
          updateForm({
            finding: value,
          })
        }
        placeholder="Enter laboratory finding"
        value={form.finding}
      />

      <ResultInput
        disabled={disabled}
        label="Result *"
        onChangeText={(value) =>
          updateForm({
            result: value,
          })
        }
        placeholder="Enter final test result"
        value={form.result}
      />

      <View style={styles.twoColumnInputs}>
        <View style={styles.columnInput}>
          <ResultInput
            disabled={disabled}
            label="Unit"
            onChangeText={(value) =>
              updateForm({
                unit: value,
              })
            }
            placeholder="g/dL"
            value={form.unit}
          />
        </View>

        <View style={styles.columnInput}>
          <ResultInput
            disabled={disabled}
            label="Reference range"
            onChangeText={(value) =>
              updateForm({
                referenceRange: value,
              })
            }
            placeholder="12–16"
            value={form.referenceRange}
          />
        </View>
      </View>

      <Text style={styles.fieldLabel}>
        Result classification
      </Text>

      <ScrollView
        contentContainerStyle={styles.statusOptions}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {findingStatuses.map((status) => {
          const selected =
            form.findingStatus === status.value;

          return (
            <Pressable
              disabled={disabled}
              key={status.value}
              onPress={() =>
                updateForm({
                  findingStatus: status.value,
                })
              }
              style={[
                styles.statusOption,
                selected &&
                  styles.selectedStatusOption,
              ]}
            >
              <Text
                style={[
                  styles.statusOptionText,
                  selected &&
                    styles.selectedStatusOptionText,
                ]}
              >
                {status.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ResultInput
        disabled={disabled}
        label="Laboratory comment"
        multiline
        onChangeText={(value) =>
          updateForm({
            comment: value,
          })
        }
        placeholder="Add an optional interpretation or comment"
        value={form.comment}
      />
    </View>
  );
}

function ResultInput({
  label,
  value,
  placeholder,
  onChangeText,
  multiline = false,
  disabled = false,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChangeText: (value: string) => void;
  multiline?: boolean;
  disabled?: boolean;
}) {
  return (
    <View style={styles.inputField}>
      <Text style={styles.fieldLabel}>{label}</Text>

      <TextInput
        editable={!disabled}
        multiline={multiline}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        selectionColor={colors.primary}
        style={[
          styles.resultInput,
          multiline && styles.multilineInput,
          disabled && styles.disabledInput,
        ]}
        textAlignVertical={
          multiline ? 'top' : 'center'
        }
        value={value}
      />
    </View>
  );
}

function InformationItem({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.informationItem}>
      <View style={styles.informationIcon}>
        <Ionicons
          color={colors.primary}
          name={icon}
          size={19}
        />
      </View>

      <View style={styles.informationText}>
        <Text style={styles.informationLabel}>
          {label}
        </Text>

        <Text style={styles.informationValue}>
          {value}
        </Text>
      </View>
    </View>
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
    color: colors.primary,
    fontSize: 10,
  },

  progressBadge: {
    minWidth: 48,
    height: 32,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },

  progressText: {
    color: colors.primary,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.bold,
  },

  progressTrack: {
    height: 3,
    backgroundColor: colors.border,
  },

  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
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

  priorityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 7,
    borderRadius: radius.round,
    backgroundColor: colors.primarySoft,
  },

  urgentPriorityBadge: {
    backgroundColor: colors.dangerSoft,
  },

  priorityText: {
    color: colors.primary,
    fontSize: 8,
    fontWeight: typography.weight.extraBold,
  },

  urgentPriorityText: {
    color: colors.danger,
  },

  requestSummary: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },

  informationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },

  informationIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },

  informationText: {
    flex: 1,
    marginLeft: spacing.md,
  },

  informationLabel: {
    color: colors.textMuted,
    fontSize: 10,
  },

  informationValue: {
    marginTop: 2,
    color: colors.textPrimary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.semibold,
  },

  accessRestriction: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.infoSoft,
  },

  accessRestrictionText: {
    flex: 1,
    marginLeft: spacing.md,
  },

  accessRestrictionTitle: {
    color: colors.textPrimary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.bold,
  },

  accessRestrictionDescription: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },

  specimenCard: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },

  specimenHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },

  specimenIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.infoSoft,
  },

  specimenText: {
    flex: 1,
    marginHorizontal: spacing.md,
  },

  specimenTitle: {
    color: colors.textPrimary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.bold,
  },

  specimenDescription: {
    marginTop: 3,
    color: colors.textSecondary,
    fontSize: typography.size.caption,
  },

  collectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },

  collectionDot: {
    width: 7,
    height: 7,
    borderRadius: radius.round,
    backgroundColor: colors.warning,
  },

  collectedDot: {
    backgroundColor: colors.success,
  },

  collectionText: {
    color: colors.warning,
    fontSize: 9,
    fontWeight: typography.weight.bold,
  },

  collectedText: {
    color: colors.success,
  },

  collectedStatus: {},

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

  resultList: {
    gap: spacing.lg,
    marginTop: spacing.lg,
  },

  testCard: {
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
  },

  testHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  testNumber: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },

  testNumberText: {
    color: colors.textOnPrimary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.extraBold,
  },

  testIdentity: {
    flex: 1,
    marginLeft: spacing.md,
  },

  testName: {
    color: colors.textPrimary,
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
  },

  testMeta: {
    marginTop: 3,
    color: colors.textSecondary,
    fontSize: typography.size.caption,
  },

  inputField: {
    marginTop: spacing.lg,
  },

  fieldLabel: {
    marginBottom: spacing.sm,
    color: colors.textPrimary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.semibold,
  },

  resultInput: {
    minHeight: 54,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    color: colors.textPrimary,
    fontSize: typography.size.body,
    backgroundColor: colors.surface,
  },

  multilineInput: {
    minHeight: 100,
    paddingTop: spacing.lg,
  },

  disabledInput: {
    backgroundColor: colors.surfaceMuted,
    color: colors.textSecondary,
  },

  twoColumnInputs: {
    flexDirection: 'row',
    gap: spacing.md,
  },

  columnInput: {
    flex: 1,
  },

  statusOptions: {
    gap: spacing.sm,
    paddingRight: spacing.xl,
  },

  statusOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.round,
    backgroundColor: colors.surface,
  },

  selectedStatusOption: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },

  statusOptionText: {
    color: colors.textSecondary,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.semibold,
  },

  selectedStatusOptionText: {
    color: colors.textOnPrimary,
  },

  doctorReturnNotice: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.successSoft,
  },

  doctorReturnIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },

  doctorReturnText: {
    flex: 1,
    marginLeft: spacing.md,
  },

  doctorReturnTitle: {
    color: colors.textPrimary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.bold,
  },

  doctorReturnDescription: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },

  actions: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },

  completedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#BDE6D2',
    borderRadius: radius.lg,
    backgroundColor: colors.successSoft,
  },

  completedText: {
    flex: 1,
    marginLeft: spacing.md,
  },

  completedTitle: {
    color: colors.textPrimary,
    fontSize: typography.size.label,
    fontWeight: typography.weight.bold,
  },

  completedDescription: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
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